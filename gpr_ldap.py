import ldap,sys,jwt,urllib2,json
from bottle import Bottle, run, route, get, post, request, response, hook, default_app

app = Bottle()

auth_token = None
server_config = None

def create_dbldap_user(username):
  global auth_token
  global server_config

  url = '%s%s' % (server_config['app_rest_base_url'],server_config['app_rest_create_ldap_user'])
  values = {'email' : '%s' % username}
  req = urllib2.Request(url, json.dumps(values), headers={'Content-type': 'application/json', 'Accept': 'application/json'})
  urllib2.urlopen(req)
  print 'created LDAP User in DB'

def get_login_role(username):

  global auth_token
  global server_config

  try:
    url = '%s%s?email=eq.%s' % (server_config['app_rest_base_url'],server_config['app_ldap_db_user_table_url'],username)
    req = urllib2.Request(url=url)
    req.add_header('Authorization','Bearer ' + auth_token)
    response = urllib2.urlopen(req)
    user_data_ = response.read()
    json_data = json.loads(user_data_)
    return json_data[0]

  except urllib2.HTTPError, e:
    print 'HTTPError = ' + str(e.code)
  except urllib2.URLError, e:
    print 'URLError = ' + str(e.reason)
  except Exception:
    import traceback
    print 'generic exception: ' + traceback.format_exc()

def get_application_jwt(username,password):
  try:
    url = '%s%s' % (server_config["app_rest_base_url"], server_config["app_login_url"])
    values = {'email' : username,'pass' : password}
    req = urllib2.Request(url, json.dumps(values), headers={'Content-type': 'application/json', 'Accept': 'application/json'})
    response = urllib2.urlopen(req)
    token = response.read()
    json_data = json.loads(token)

    return json_data["token"]
  except urllib2.URLError:
    print 'URL Invalid Cant Connect to Backend...'
    sys.exit()


def init_server():
  global server_config
  try:
    with open('server_config.json') as data_file:
      server_config = json.load(data_file)

      print "Servers Configuration Loaded..."
  except:
    print "Server Config File Missing or Corrupted (server_config.json)"
    sys.exit()

def check_credentials(username, password):
  """Verifies credentials for username and password.
  returns None on success or a string describing the error on failure
  # Adapt to your needs
  """
  global server_config
  global auth_token

  LDAP_SERVER = server_config["app_ldap_host"]
  # fully qualified AD user name
  #LDAP_USERNAME = '%s%s' % (username, server_config["app_ldap_domain_suffix"])
  LDAP_USERNAME = '%s' % username
  # your password
  LDAP_PASSWORD = password
  base_dn = server_config["app_ldap_base_dn"]
  #ldap_filter = 'userPrincipalName=%s%s' % (username, server_config["app_ldap_domain_suffix"])
  ldap_filter = 'userPrincipalName=%s' % username
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
  user_data = get_login_role(LDAP_USERNAME)
  if user_data:
    role = user_data['role']
    person_id = user_data['person_id']
  else:
    create_dbldap_user(LDAP_USERNAME)
    role = 'anon'
    person_id = 0
  
  encoded = jwt.encode({'role': role,'email':LDAP_USERNAME,'person_id':person_id}, 'foundationforhumanrights1994_fhrprxy1', algorithm='HS256')
  ldap_client.unbind()
  return { 'status' :  1,'description' : 'Authentication Succeeded', 'reason' : 'Success', 'token' : encoded, 'username' : LDAP_USERNAME, 'role': role, 'email' : LDAP_USERNAME}

@hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@route('/')
def index():
        return '<h1>LDAP Service</h1>'

@route('/login',method=['OPTIONS','POST'])
def login():
  if request.method == 'OPTIONS':
        return {}
  else:
        result = check_credentials(request.json.get('email'),request.json.get('pass'))
        return result

@route('/test',method=['GET'])
def test():
        return '<h1>TEST</h1>'

if __name__ == '__main__': 
  init_server()
  auth_token = get_application_jwt('ldap@fhr.org.za','Justice##@!1996')
  print auth_token
  run(app,reloader=True, debug=True, port='3003')
