import smtplib
import pgpubsub
import json

try :
	with open('server_config.json') as data_file:
		data = json.load(data_file)
		print "Servers Configuration Loaded..."
except :
	print "Server Config File Missing or Corrupted (server_config.json)"

try:
	server = smtplib.SMTP(data["mail_host"],data["mail_port"])
	server.starttls()
	server.login(data["mail_user"],data["mail_password"])		
	print "SMTP Connected..."
except:
	print "Unable to connect to the SMTP Server"

try:
    pubsub = pgpubsub.connect(database=data["postgres_dbname"],user=data["postgres_user"],password=data["postgres_password"],host=data["postgres_host"],port=data["postgres_port"])
    print "Postgres Connected..."
except:
    print "Unable to connect to the PostgreSQL Server"

try:
	for channel in data["pg_listen_channels"]:
		print "Listening To: "+channel["channel_name"]
		pubsub.listen(channel["channel_name"])
	print "Listening..."
except:
	print "Invalid Listening Channel"

while 1:
	for e in pubsub.events():
		if e.channel == 'validate' or e.channel == 'reset':			
			
			try:
				payLoadJson = json.loads(e.payload)											
				sender = data["sender_email"]
				print payLoadJson["email"]
				receiver = payLoadJson["email"]			
				token = payLoadJson["token"]
				token_type = payLoadJson["token_type"]
				base_url = data["gpr_baseURL"]
								
				body = 'Please follow the Link'+'\n\n'+base_url+'/home/validate?validation_token='+token+'&user_email='+receiver
				header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+'Subject: GPR '+token_type+'\n'+'\n'				
			except Exception,ex:
				print ex
							
			try:
				server = smtplib.SMTP(data["mail_host"],data["mail_port"])
				server.starttls()
				server.login(data["mail_user"],data["mail_password"])	
				server.sendmail(sender,receiver, header + body)
				print 'Email Notification Sent...'								
				server.close()
			except Exception, exc:
				print exc
			
		elif e.channel == 'test':
			print e



