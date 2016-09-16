import smtplib
import json
import time
import requests
from validate_email import validate_email
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart

def download_file(download_url,fname,fext):	
	filename = '%s.%s' % (fname,fext)
	response = requests.get(download_url)
	file = open(filename,'wb')
	file.write(response.content)
	file.close()
	return filename

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

while 1:		
	

	get_url = '%s%s' % (data["app_rest_base_url"],data["app_email_notifaction_table"])	
	get_params = {'sent' : 'eq.false', 'failed' : 'eq.false'}	
	get_response = requests.get(get_url,params=get_params)	
	
	rs = get_response.json()
		
	if not rs:			
		pass
	else:						
		
		server = smtplib.SMTP(data["app_mail_host"],data["app_mail_port"])
		server.starttls()
		server.login(data["app_mail_user"],data["app_mail_password"])	
	
		for r in rs:				
			
			email_notification = r				
			is_valid = validate_email(email_notification["email_to"])			
			
			if is_valid:					
				msg = MIMEMultipart()	
				msg["Subject"] = email_notification["subject"]
				msg["From"] = data["app_sender_email"]
				msg["Reply-to"] = data["app_sender_email"]
				msg["To"] = email_notification["email_to"]

				#sender = data["app_sender_email"]			
				#receiver = email_notification["email_to"]			
				#body = email_notification["body"]			
			

				if email_notification["token_email"]:				
					
					if email_notification["token_type"] == "validation":											
						body = email_notification["body"]+'\n'
						body += data["app_base_url"]+data["app_validation_url"]+email_notification["token"]+"&user_email="+email_notification["email_to"] 
						part = MIMEText(body)
						msg.attach(part)
				

					elif email_notification["token_type"] == "reset":						
						body = email_notification["body"]+data["app_reset_password_url"]+email_notification["token"]+"&user_email="+email_notification["email_to"]  
						part = MIMEText(body)
						msg.attach(part)
				
				else:					
					body = email_notification["body"]			
					part = MIMEText(body)
					msg.attach(part)
					

					if email_notification["has_attachment"]:
						file = download_file(email_notification["attachment_url"],email_notification["attachment_filename"],email_notification["attachment_filetype"])
						part = MIMEApplication(open(file,"rb").read(),"pdf",name=file)
						part.add_header('Content-Disposition', 'attachment', filename=file)
						msg.attach(part)
					else:
						pass

				try:					
					#server.sendmail(sender,receiver, header + body)
					server.sendmail(msg['From'], msg['To'], msg.as_string())
					
					print 'Email Notification Sent...'

 					patch_url     = '%s%s' % (data["app_rest_base_url"],data["app_email_notifaction_table"]) 					
 					id_string     = 'eq.%s' % (email_notification["id"])
 					patch_params  = {'id' : id_string}
 					patch_headers = {'Content-Type': 'application/json'}
 					patch_data 	  = {'sent' : True, 'status_message' : 'Email Sent Successfully!'} 					
 					response_patch= requests.patch(patch_url,params=patch_params,headers=patch_headers,data=json.dumps(patch_data))
 					
 					print 'Email Notification Processed...' 			
 				except Exception, exc: 					
 					print exc
 					retries = email_notification["retries"]+1 					
 					
 					if retries > data["app_mail_retries_before_fail"]:

 						patch_url     = '%s%s' % (data["app_rest_base_url"],data["app_email_notifaction_table"]) 					
 						id_string     = 'eq.%s' % (email_notification["id"])
 						patch_params  = {'id' : id_string}
 						patch_headers = {'Content-Type': 'application/json'}
 						patch_data 	  = {'failed' : True, 'status_message' : 'Exceed Retry Limit!'} 					
 						response_patch= requests.patch(patch_url,params=patch_params,headers=patch_headers,data=json.dumps(patch_data))
 					
 					else:

 						patch_url     = '%s%s' % (data["app_rest_base_url"],data["app_email_notifaction_table"]) 					
 						id_string     = 'eq.%s' % (email_notification["id"])
 						patch_params  = {'id' : id_string}
 						patch_headers = {'Content-Type': 'application/json'}
 						patch_data 	  = {'retries' : retries} 					
 						response_patch= requests.patch(patch_url,params=patch_params,headers=patch_headers,data=json.dumps(patch_data)) 					

			else:

				patch_url     = '%s%s' % (data["app_rest_base_url"],data["app_email_notifaction_table"]) 					
				id_string     = 'eq.%s' % (email_notification["id"])
				patch_params  = {'id' : id_string}
				patch_headers = {'Content-Type': 'application/json'}
				patch_data 	  = {'failed' : True, 'status_message' : 'Invalid Email Address!'} 					
				response_patch= requests.patch(patch_url,params=patch_params,headers=patch_headers,data=json.dumps(patch_data))

				print "Invalid Email Address!"

	server.close()		
	time.sleep(2)

def download_file(download_url,fname,fext):	
	filename = '%s.%s' % (fname,fext)
	response = requests.get(download_url)
	file = open(filename,'wb')
	file.write(response.content)
	file.close()
	return filename


