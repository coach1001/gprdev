import smtplib
import psycopg2
import psycopg2.extras
import json
import time
import urllib2
from validate_email import validate_email

try :
	with open('server_config.json') as data_file:
		data = json.load(data_file)
		print "Servers Configuration Loaded..."
except :
	print "Server Config File Missing or Corrupted (email_config.json)"

try:
	server = smtplib.SMTP(data["app_mail_host"],data["app_mail_port"])
	server.starttls()
	server.login(data["app_mail_user"],data["app_mail_password"])		
	print "SMTP Connected..."
	server.close()
except Exception,e:
	print str(e)
	print "Unable to connect to the SMTP Server"

try:
    conn = psycopg2.connect(database=data["app_db_name"],user=data["app_db_user"],password=data["app_db_password"],host=data["app_db_host"],port=data["app_db_port"])    
    curS = conn.cursor()
    curU = conn.cursor()
    print "Postgres Connected..."
except Exception,f:
    print str(f)
    print "Unable to connect to the PostgreSQL Server"

while 1:	
	curS.execute('SELECT * FROM email_notifications_to_json')
	rs = curS.fetchall()
	
	if not rs:		
		#print "No Email Notifications!..."
		pass
	else:				
		
		server = smtplib.SMTP(data["app_mail_host"],data["app_mail_port"])
		server.starttls()
		server.login(data["app_mail_user"],data["app_mail_password"])	
	
		for r in rs:				
			email_notification = json.loads(json.dumps(r[0]))			
			
			is_valid = validate_email(email_notification["email_to"])
			
			if is_valid:					
				sender = data["app_sender_email"]			
				receiver = email_notification["email_to"]			
				body = email_notification["body"]			
			

				if email_notification["token_email"]:				
					
					if email_notification["token_type"] == "validation":					
						header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["app_email_subject_prefix"]+email_notification["subject"]+'\n'+'\n'				
						body = email_notification["body"]+'\n'
						body += data["app_base_url"]+data["app_validation_url"]+email_notification["token"]+"&user_email="+email_notification["email_to"] 
				
					elif email_notification["token_type"] == "reset":
						header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["app_email_subject_prefix"]+email_notification["subject"]+'\n'+'\n'				
						body = email_notification["body"]+data["app_reset_password_url"]+email_notification["token"]+"&user_email="+email_notification["email_to"]  
			
				else:
					header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+"Subject:"+data["app_email_subject_prefix"]+email_notification["subject"]+'\n'+'\n'								
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



