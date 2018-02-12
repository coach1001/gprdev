
String.prototype.toCamelCase = function(str) {
    if( typeof str === 'undefined'){
    	return '';
    } else {
	    return str
        .replace(/\s(.)/g, function($1) { return $1.toUpperCase(); })
        .replace(/\s/g, '')
        .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
    }
};

String.prototype.capitalizeFirstLetter = function (str) {
  if( typeof str === 'undefined'){
  	return '';
  } else {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
};

angular.module('appCg').factory('geocode', function(config, $http) {

	var geocode = {};
	geocode.baseUrl = config.geocode_api_url;
	geocode.apiKey = config.geocode_api_key;


	geocode.getCood = function (url) {
		url = geocode.baseUrl+url;
		url = url + '&key=' + geocode.apiKey;
		//delete $http.defaults.headers.common['access-control-request-headers'];
		//delete $http.defaults.headers.common['Authorization'];
		//console.log($http.defaults);

		return $http({
			method: 'GET',
			url: url,
			headers: {
				'Authorization': undefined
			}
		});
	};

	// alfresco.baseUrl = config.alfresco_endpoints_base_url;

	// alfresco.createCall = function(programme, call) {
	// 	var req = {};
	// 	req.parameters = {};
	// 	req.url = req.url = alfresco.baseUrl;
	// 	req.method = 'POST';
	// 	req.data = {
	// 		method: 'createGrantsAndPMUCallFolder',
	// 		parameters: {
	// 			programmeCode: programme,
	// 			callCode: call
	// 		}
	// 	};
	// 	console.log(req);
	// 	return $http(req);
	// };

	// alfresco.createApplication = function(programme, call, application) {
	// 	var req = {};
	// 	req.url = req.url = alfresco.baseUrl;
	// 	req.method = 'POST';
	// 	req.parameters = {};

	// 	req.data = {
	// 		method: 'createGrantsAndPMUApplicationFolder',
	// 		parameters: {
	// 			programmeCode: programme,
	// 			callCode: call,
	// 			projectCode: application,
	// 			isProject: false
	// 		}
	// 	};
	// 	return $http(req);
	// };

	return geocode;
});
