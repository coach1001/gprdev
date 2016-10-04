angular.module('appCg').factory('reporting', function(config, $window,gprRestApi,$timeout) {

	var reporting = {};

	reporting.base_url = config.app_report_base_url;
	reporting.pdf_url = config.app_report_url_add;

	reporting.reports = [		
	{
		reportName: 'QR Code for Application',
		unitName: 'RPT_QR_CODE_APPLICATION',		
		paramList: [{ name: 'application_id_list' }]
	},
	{
		reportName: 'Acknowledgement Letter',
		unitName: 'RPT_ACK_LETTERS',		
		paramList: [{ name: 'application_id' }]
	},
	{
		reportName: 'Test Report',
		unitName: 'RPT_TEST',		
		//paramList: [{ name: 'application_id' }]
	}
	];

	reporting.validateEmail = function(email) {
    	
    	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;    	
    	return re.test(email);
	};

	reporting.generateReport = function(report, params,open_report) {		
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
		if(open_report){
		 $window.open(url);
		}else{

		}		
		return url;
	};

	reporting.queueEmail = function(to,subject,body,hasAttachment,attachmentFileName,attachmentFileType,attachmentURL){
		var data = {};		
		var email_id = 0;
		data.email_to = to;		
		data.subject = subject;
		data.body = body;
		data.has_attachment = hasAttachment;
		data.attachment_filename = attachmentFileName;
		data.attachment_filetype = attachmentFileType;
		data.attachment_url = attachmentURL;			
		return gprRestApi.updateCreateRow('email_notifications',data,'Create');		
	};
	
	return reporting;
});