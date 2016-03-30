import smtplib
import pgpubsub
import json

sender = 'gpr@fhr.org.za'
receiver = 'fweber@fhr.org.za'
header = 'To:'+receiver+ '\n'+'From:'+sender+'\n'+'Subject: Test'+'\n'+'\n'

try :
	with open('server_config.json') as data_file:
		data = json.load(data_file)
		print "Servers Configuration Loaded..."
except:
	print "Server Config File Missing or Corrupted (server_config.json)"

try:
	server = smtplib.SMTP(data["mail_host"],data["mail_port"])
	print "SMTP Connected..."
except:
	print "I am unable to connect to the SMTP Server"

try:
    pubsub = pgpubsub.connect(database=data["postgres_dbname"],user=data["postgres_user"],password=data["postgres_password"],host=data["postgres_host"],port=data["postgres_port"])
    print "Postgres Connected..."
except:   
    print "I am unable to connect to the PostgreSQL Server"

try:
	for channel in data["pg_listen_channels"]:
		print "Listening To: "+channel["channel_name"]
		pubsub.listen(channel["channel_name"])
	print "Listening..."
except:
	print "Invalid Listening Channel"

while 1:
	for e in pubsub.events():
		print e.payload
		server.sendmail(sender,receiver, header + e.payload)

