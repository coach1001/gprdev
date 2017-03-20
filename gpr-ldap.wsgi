import sys, os, bottle

sys.path = ['/var/www/html/gpr-ldap-dev01/'] + sys.path
os.chdir(os.path.dirname(__file__))

import gpr_ldap # This loads your application

application = bottle.default_app()
