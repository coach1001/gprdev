import smtplib
import psycopg2
import psycopg2.extras
import json
import time
from validate_email import validate_email

try :
	with open('email_config.json') as data_file:
		data = json.load(data_file)
		print "Servers Configuration Loaded..."
except :
	print "Server Config File Missing or Corrupted (email_config.json)"

try:
	server = smtplib.SMTP(data["mail_host"],data["mail_port"])
	server.starttls()
	server.login(data["mail_user"],data["mail_password"])		
	print "SMTP Connected..."
	server.close()
except:
	print "Unable to connect to the SMTP Server"

try:
    conn = psycopg2.connect(database=data["postgres_dbname"],user=data["postgres_user"],password=data["postgres_password"],host=data["postgres_host"],port=data["postgres_port"])    
    curS = conn.cursor()
    curU = conn.cursor()
    print "Postgres Connected..."
except:
    print "Unable to connect to the PostgreSQL Server"

while 1:	
	curS.execute('SELECT * FROM email_notifications_to_json')
	rs = curS.fetchall()
	
	if not rs:
		print "No Email Notifications!..."
	else:				
		
		server = smtplib.SMTP(data["mail_host"],data["mail_port"])
		server.starttls()
		server.login(data["mail_user"],data["mail_password"])	
	
		for r in rs:				
			email_notification = json.loads(json.dumps(r[0]))			
			
			is_valid = validate_email(email_notification["email_to"])
			
			if is_valid:
					
	
				sender = data["sender_email"]			
				receiver = email_notification["email_to"]			
				body = email_notification["body"]			
			
				if email_notification["token_email"]:				
					
					if email_notification["token_type"] == "validation":					
						header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["email_subject_prefix"]+email_notification["subject"]+'\n'+'\n'				
						body = email_notification["body"]+'\n'
						body += data["app_baseURL"]+data["app_validationURL"]+email_notification["token"]+"&user_email="+email_notification["email_to"] 
				
					elif email_notification["token_type"] == "reset":
						header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["email_subject_prefix"]+email_notification["subject"]+'\n'+'\n'				
						body = email_notification["body"]+data["app_reset_passwordURL"]+email_notification["token"]+"&user_email="+email_notification["email_to"]  
			
				else:
					header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["email_subject_prefix"]++email_notification["subject"]+'\n'+'\n'								
					body = email_notification["body"]			
								
				try:
					server.sendmail(sender,receiver, header + body)
 					
 					print 'Email Notification Sent...' 			
 					curU.execute("UPDATE email_notifications SET sent=(%s),status_message=(%s) WHERE id = (%s)", (True,"Email Sent Successfully!",email_notification["id"])) 			 			
 					conn.commit() 			
 					print 'Email Notification Processed...' 			
 				except Exception, exc: 					
 					retries = email_notification["retries"]+1 					
 					
 					if retries > data[mail_retries_before_fail]:
						curU.execute("UPDATE email_notifications SET failed=(%s),status_message=(%s) WHERE id = (%s)", (True,"Exceed Retry Limit!",email_notification["id"])) 			 			
 						conn.commit() 			
 					
 					else:
 						curU.execute("UPDATE email_notifications SET retries=(%s) WHERE id = (%s)", (retries,email_notification["id"])) 			 			
 						conn.commit() 			 					
 					
 					print exc
			else:
				curU.execute("UPDATE email_notifications SET failed=(%s),status_message=(%s) WHERE id = (%s)", (True,"Invalid Email Address!",email_notification["id"])) 			 			
 				conn.commit() 			 				
				print "Invalid Email Address!"
	
	server.close()		
	time.sleep(5)

	# for e in pubsub.events():
	# 	if e.channel == 'validate' or e.channel == 'reset':			
			
	# 		try:
	# 			payLoadJson = json.loads(e.payload)											
	# 			sender = data["sender_email"]
	# 			print payLoadJson["email"]
	# 			receiver = payLoadJson["email"]			
	# 			token = payLoadJson["token"]
	# 			token_type = payLoadJson["token_type"]
	# 			base_url = data["gpr_baseURL"]								
	# 			body = 'Please follow the Link'+'\n\n'+base_url+'/home/validate?validation_token='+token+'&user_email='+receiver
	# 			header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+'Subject: GPR '+token_type+'\n'+'\n'				
	# 		except Exception,ex:
	# 			print ex
							
	# 		try:
	# 			server = smtplib.SMTP(data["mail_host"],data["mail_port"])
	# 			server.starttls()
	# 			server.login(data["mail_user"],data["mail_password"])	
	# 			server.sendmail(sender,receiver, header + body)
	# 			print 'Email Notification Sent...'								
	# 			server.close()
	# 		except Exception, exc:
	# 			print exc
			
	# 	elif e.channel == 'test':
	# 		print e



