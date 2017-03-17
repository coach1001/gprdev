angular.module('appCg').controller('ProjectPartnerReportScheduleModalCtrl',function(
    project_partner,
    partner_report_schedule,    
    $uibModal,
    gprRestApi,
    ngToast,
    $confirm,
    $uibModalInstance) {

    var vm = this;

    vm.project_partner = angular.extend(project_partner);
    vm.rows = vm.partner_report_schedule = angular.extend(partner_report_schedule);
    
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
            { name: 'report_no'},            
            { name: 'due_date', type: 'date', cellFilter: 'date:\'dd MMMM yyyy\'' },
            { name: 'expiry_date', type: 'date', cellFilter: 'date:\'dd MMMM yyyy\'' }

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
            templateUrl: 'partial/project-partners/modal/sub/sub-partner-report-schedule.html',
            controller: 'SubPartnerReportScheduleCtrl as vm',
            resolve: {
                reporting_schedule: function res(gprRestApi) {
                    return gprRestApi.getRow('reporting_schedule', id);
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
            gprRestApi.getRowsFilterColumn('reporting_schedule', 'project_partner', project_partner.id).then(function success(res) {
            vm.options.data = vm.rows = vm.partner_report_schedule = angular.extend(res);            
            }, function error(res) {

            });
        });
    };    

});