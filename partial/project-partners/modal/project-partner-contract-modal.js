angular.module('appCg').controller('ProjectPartnerContractModalCtrl', function(
    project_partner,
    project_partner_contract,
    contract_types,
    $uibModal,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance, uiGridConstants) {

    var vm = this;
    var operation = '';

    vm.options = {};
    
    if (project_partner_contract) {
        operation = 'Update';
        vm.operation = angular.extend(operation);
        vm.project_partner_contract = angular.extend(project_partner_contract);
         
        gprRestApi.getRowsFilterColumn('payment_schedule', 'contract', project_partner_contract.id).then(function success(res) {            
            vm.schedule = angular.extend(res);                        
            vm.options.data = vm.rows = angular.extend(res);
        }, function error(res) {

        });
    } else {
        operation = 'Create';
        vm.operation = angular.extend(operation);
        vm.project_partner_contract = {};
        vm.options.data = vm.rows = vm.schedule = [];
    }

    vm.project_partner = angular.extend(project_partner);
    vm.contract_types = angular.extend(contract_types);

    vm.tabs = [{
        title: 'Contract Details',
        index: 0,
        active: true,
        form: {
            options: {},
            model: vm.project_partner_contract,
            fields: [{
                key: 'contract_type',
                type: 'ui-select-single',
                templateOptions: {
                    optionsAttr: 'bs-options',
                    ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                    label: 'Contract Type',
                    valueProp: 'id',
                    labelProp: 'type',
                    required: true,
                    options: vm.contract_types
                }
            }, {
                key: 'signed',
                type: 'checkbox2',
                templateOptions: {
                    label: 'Contract Signed',
                    default: false,
                    required: false
                }
            }, {
                key: 'signed_by_partner_on',
                type: 'datepicker',
                templateOptions: {
                    label: 'Partner Signed On',
                    type: 'text',
                    datepickerPopup: 'yyyy-MM-dd'
                }
            }]
        }
    }];


    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'tranche_no', width: 80, sort: { direction: uiGridConstants.ASC} },
            { name: 'amount', displayName: 'Contract Amount' },
            { name: 'payment_date', type: 'date', cellFilter: 'date:\'dd MMMM yyyy\'' },
            { name: 'ammended', width: 120, type: 'boolean', cellTemplate: '<checkbox disabled="true" ng-model="row.entity.ammended"></checkbox>' },
            { name: 'ammended_amount', displayName: 'Ammend Amount' },
            { name: 'ammended_date', displayName: 'Ammend Date' }

        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };


    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/project-partners/modal/sub/sub-partner-contract-schedule.html',
            controller: 'SubPartnerContractScheduleCtrl as vm',
            resolve: {
                payment_schedule: function res(gprRestApi) {
                    return gprRestApi.getRow('payment_schedule', id);
                },
                contract_id : function res(){
                    return vm.project_partner_contract.id;
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {                     
            gprRestApi.getRowsFilterColumn('payment_schedule', 'contract', project_partner_contract.id).then(function success(res) {
            vm.options.data = vm.rows = vm.schedule = angular.extend(res);            
            }, function error(res) {

            });
        });
    };    


    vm.updateCreateRow = function() {
        var body = angular.copy(vm.project_partner_contract);
        body.project_partner = project_partner.id;

        gprRestApi.updateCreateRow('project_contracts', body, vm.operation).then(function success(response) {
            ngToast.create({ content: vm.operation + ' Record Successfull', timeout: 4000 });
            if (vm.operation === 'Create') {
                vm.project_partner_contract.id = response.data.id;                
            } else if (vm.operation === 'Update') {

            }
            vm.operation = 'Update';
        }, function error(response) {
            ngToast.warning({ content: vm.operation + ' Record Failed', timeout: 4000 });
        });
    };

    vm.deleteRow = function() {
        gprRestApi.deleteRow('project_contracts', vm.project_partner_contract.id).then(function success(response) {
            ngToast.warning({ content: 'Record Deleted Successfully', timeout: 4000 });
            $uibModalInstance.dismiss('Record Deleted');
        }, function error(response) {
            ngToast.warning({ content: 'Record Delete Failed', timeout: 4000 });
        });
    };

});
