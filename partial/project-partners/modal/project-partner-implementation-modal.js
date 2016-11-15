angular.module('appCg').controller('ProjectPartnerImplementationModalCtrl',function(
    project_partner,
    partner_implementation_schedule,    
    $uibModal,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance, uiGridConstants) {

    var vm = this;

    vm.project_partner = angular.extend(project_partner);
    vm.rows = vm.partner_implementation_schedule = angular.extend(partner_implementation_schedule);
    
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
            { name: 'item', sort: { direction: uiGridConstants.ASC}},
            { name: 'description'},            
            { name: 'delivery_date', type: 'date', cellFilter: 'date:\'dd MMMM yyyy\'' }
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
            templateUrl: 'partial/project-partners/modal/sub/sub-partner-implementation-schedule.html',
            controller: 'SubPartnerImplementationScheduleCtrl as vm',
            resolve: {
                implementation_schedule: function res(gprRestApi) {
                    return gprRestApi.getRow('project_implementation_plans', id);
                },
                partner_id: function res(){
                    return project_partner.id;
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {                     
            gprRestApi.getRowsFilterColumn('project_implementation_plans', 'project_partner', project_partner.id).then(function success(res) {
            vm.options.data = vm.rows = vm.partner_implementation_schedule = angular.extend(res);            
            }, function error(res) {

            });
        });
    };    

});