angular.module('appCg').factory('authenticationService',function($http) {

  var authenticationService = {};
  authenticationService.baseUrl = 'http://localhost:3000/rpc';

  authenticationService.register = function (email_, password_){
    var req={};
    req.method='POST';
    req.headers = {'Content-Type': 'application/json'};
    req.url =  this.baseUrl+'/signup';
    req.data = {"email" : email_, "pass" : password_};
    return $http(req);
  };

  authenticationService.validate = function(email_,token_){
    var req={};
    req.method='POST';
    req.headers = {'Content-Type': 'application/json'};
    req.url =  this.baseUrl+'/validate_user';
    req.data = {"email" : email_, "token" : token_};
    return $http(req);
  };

  return authenticationService;
});
