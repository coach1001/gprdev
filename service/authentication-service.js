angular.module('appCg').factory('authenticationService',function($http,$rootScope,config) {

  var authenticationService = {};  
  
  authenticationService.LOCAL_TOKEN_KEY = 'local_token';
  authenticationService.LOCAL_TOKEN_USERNAME = 'local_username';

  authenticationService.username = '';
  authenticationService.isAuthenticated = false;
  authenticationService.role = '';

  authenticationService.baseUrl = config.rest_baseURL + config.authentication_baseURL;

  authenticationService.register = function (email_, password_){
    var req={};
    req.method='POST';
    req.headers = {'Content-Type': 'application/json'};
    req.url =  authenticationService.baseUrl+'/signup';
    req.data = {"email" : email_, "pass" : password_};
    return $http(req);
  };

  authenticationService.login = function (email_, password_){
    var req={};
    req.method='POST';
    req.headers = {'Content-Type': 'application/json'};
    req.url =  authenticationService.baseUrl+'/login';
    req.data = {"email" : email_, "pass" : password_};
    return $http(req);
  };

  authenticationService.validate = function(email_,token_){
    var req={};
    req.method='POST';
    req.headers = {'Content-Type': 'application/json'};
    req.url =  authenticationService.baseUrl+'/validate_user';
    req.data = {"email" : email_, "token" : token_};
    return $http(req);
  };

  authenticationService.useCredentials = function (token_,username_) {
    authenticationService.isAuthenticated = true;
    authenticationService.username = username_;

    $rootScope.isAuthenticated = false;
    $rootScope.currentUser = username_;

    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token_;
  };

  authenticationService.storeCredentials = function(token_,username_){
    window.localStorage.setItem(authenticationService.LOCAL_TOKEN_KEY, token_);
    window.localStorage.setItem(authenticationService.LOCAL_TOKEN_USERNAME, username_);
  };

  authenticationService.destroyUserCredentials = function () {
    authenticationService.token = undefined;
    authenticationService.username = '';
    authenticationService.isAuthenticated = false;
    $http.defaults.headers.common['Authorization'] = undefined;
    $http.defaults.headers.common['Prefer'] = undefined;
    window.localStorage.removeItem(authenticationService.LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(authenticationService.LOCAL_TOKEN_USERNAME);

    $rootScope.isAuthenticated = false;
    $rootScope.currentUser = undefined;

  };

  authenticationService.logout = function(){
    authenticationService.destroyUserCredentials();
  };

  authenticationService.loadUserCredentials = function(){
    var _token = window.localStorage.getItem(authenticationService.LOCAL_TOKEN_KEY);
    var _username = window.localStorage.getItem(authenticationService.LOCAL_TOKEN_USERNAME);
    if (_token) {
      authenticationService.useCredentials(_token,_username);
      $rootScope.currentUser = _username;
      $rootScope.isAuthenticated = true;
    }
  };

  authenticationService.loadUserCredentials();

  return authenticationService;
});
