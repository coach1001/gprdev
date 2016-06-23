import ldap,sys,jwt,urllib2,json
from bottle import run, get, post, request

auth_token = ''
server_config = ''

def check_credentials(username, password):
  """Verifies credentials for username and password.
  returns None on success or a string describing the error on failure
  # Adapt to your needs
  """
  LDAP_SERVER = server_config["app_ldap_host"]
  # fully qualified AD user name
  LDAP_USERNAME = '%s%s' % username % server_config["app_ldap_domain_suffix"]
  # your password
  LDAP_PASSWORD = password
  base_dn = server_config["app_ldap_base_dn"]
  ldap_filter = 'userPrincipalName=%s%s' % username % server_config["app_ldap_domain_suffix"]
  attrs = ['memberOf']
  try:
   # build a client       
   ldap_client = ldap.initialize(LDAP_SERVER)
   # perform a synchronous bind              
   ldap_client.set_option(ldap.OPT_REFERRALS,0)
   ldap_client.simple_bind_s(LDAP_USERNAME, LDAP_PASSWORD)
  except ldap.INVALID_CREDENTIALS:
   ldap_client.unbind()
   return { 'status' : -1, 'description' : 'Authentication Failed', 'reason' : 'Username or Password Invalid'}
  except ldap.SERVER_DOWN:
   return { 'status' : -2, 'description' : 'Authentication Failed', 'reason' : 'LDAP Server not Available'}
  # all is well

  encoded = jwt.encode({'role': 'super_user','email':LDAP_USERNAME}, 'foundationforhumanrights1994_fhrprxy1', algorithm='HS256')
  ldap_client.unbind()   
  return { 'status' :  1, 'description' : 'Authentication Succeeded', 'reason' : 'Success', 'jwt_token' : encoded}

def get_application_jwt(username,password):
  try:
    url = "http://10.0.0.111:3002/rpc/login"
    values = {'email' : username,'pass' : password}
    req = urllib2.Request(url, json.dumps(values), headers={'Content-type': 'application/json', 'Accept': 'application/json'})
    response = urllib2.urlopen(req)
    token = response.read()
  except urllib2.URLError:
    print 'URL Invalid Cant Connect to Backend'
    sys.exit()

  try:
    with open('server_config.json') as data_file:
      server_config = json.load(data_file)
      print "Servers Configuration Loaded..."
      return token      
  except:
      print "Server Config File Missing or Corrupted (server_config.json)"
      sys.exit()

@get('/')
def index():
	return '<h1>LDAP Service</h1>'

@post('/login')
def login():
	result = check_credentials(request.json.get('name'),request.json.get('password'))
	return result

if __name__ == '__main__':
	auth_token = get_application_jwt('ldap@fhr.org.za','Justice##@!1996')
	run(reloader=True, debug=True, port='3003')		



