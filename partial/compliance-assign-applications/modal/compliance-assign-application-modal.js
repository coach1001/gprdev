angular.module('appCg').controller('AssignAssessorModalCtrl',function(
    applicationComplianceRecord,
    applicationList,
    officerList,
    complianceSection,
    operation,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance){

    var vm = this;

    if (operation === 'Create') { vm.applicationComplianceRecord = {};}
    else if (operation === 'Update') { vm.applicationComplianceRecord = angular.extend(applicationComplianceRecord); }

    vm.operation = angular.extend(operation);
    
    vm.applicationList = angular.extend(applicationList);
    vm.officerList = angular.extend(officerList);

    vm.applicationComplianceRecordFields = [
    {
        key: 'application',
        type: 'ui-select-single',
        /*type : 'select',*/
        templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Application',
            valueProp: 'application',
            labelProp: 'application',       
            
            /*valueProp: 'application',
            labelProp: 'application',       
*/
            required : true,
            showDetails : true,     
            options: vm.applicationList

        }
    },{
        key: 'compliance_officer',
        type: 'ui-select-single',
        templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Compliance Officer',
            valueProp: 'id',
            labelProp: 'full_name',       
            required : true,            
            options: vm.officerList

        }
    },{
        key: 'lead',
        type: 'checkbox2',
        templateOptions: {
            label: 'Lead Assessor ?',
        },
        hideExpression : function(){
        	if(complianceSection !== 4){
        		return true;
        	}else {
        		return false;
        	}
        }
    }
    ];

    vm.updateCreateRow = function() {
        var body = angular.copy(vm.applicationComplianceRecord);        
        body.compliance_section = complianceSection;

        gprRestApi.updateCreateRow('application_compliance_officers', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') { vm.application_compliance_officers.id = response.data.id; }
            vm.operation = 'Update';
        }, function error(response) {
            //console.log(response);
            ngToast.warning({ content: vm.operation + ' Record Failed, '+response.data.message , timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('application_compliance_officers', vm.applicationComplianceRecord.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });

    };
});
