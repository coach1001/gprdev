angular.module('appCg').factory('alfresco', function(config,$http) {

	var alfresco = {};
	alfresco.baseUrl = config.alfresco_endpoints_base_url;

	alfresco.createCall = function(programme, call) {
		var req = {};		
		req.url = req.url = alfresco.baseUrl;
		req.method = 'POST';
		req.data = {
			method : 'createGrantsAndPMUCallFolder',
			programmeCode : programme,
			callCode : call
		};
		return $http(req);
	};

	alfresco.createApplication = function(programme,call,application) {
		var req = {};
		req.url = req.url = alfresco.baseUrl;
		req.method = 'POST';
		req.data = {
			method : 'createGrantsAndPMUApplicationFolder',
			programmeCode : programme,
			callCode : call,
			projectCode : application,
			isProject : false
		};
		return $http(req);
	};

	return alfresco;
});
