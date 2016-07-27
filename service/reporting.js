angular.module('appCg').factory('reporting', function(config, $window) {

	var reporting = {};

	reporting.base_url = config.app_report_base_url;
	reporting.pdf_url = config.app_report_url_add;

	reporting.reports = [{
		reportName: 'QR Code for Application',
		unitName: 'RPT_QR_CODE_APPLICATION',
		paramList: [
			{ name: 'application_id_list' }
		]
	}];

	reporting.generateReport = function(report, params) {
		var paramString= '';
		var url = '';		
		angular.forEach(reporting.reports[report].paramList, function(value, key) {
			for (var i = 0; i <= params.length - 1; i++) {				
				if(params[i].name === value.name){
					paramString += '&'+ value.name + '=' + params[i].value;
				}
			}
		});

		url = reporting.base_url + reporting.reports[report].unitName + paramString + reporting.pdf_url;
		$window.open(url);
	};

	return reporting;
});
