angular.module('appCg').controller('ProjectPartnersCtrl',function(projects, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Project Partners';
    var unfilteredRows = angular.extend(projects);
    
    vm.projects = vm.rows = angular.extend(projects);
   
    vm.projectPartners = [];

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
            { name: 'project_code' },
            { name: 'name' },
            { name: 'description' },
            { name: 'call_reference'},
            { name: 'start_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'end_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {                            
                gprRestApi.getRowsWithFEs('grid_project_partners','&project=eq.' + row.entity.id).then(function success(res){                    
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;                    
                    vm.selectedProject = row.entity.id; 
                },function error(res){

                });            
            });
        }
    };

    vm.optionsPartners = {
        data: vm.projectPartners,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'project' },
            { name: 'partner_name' },
            { name: 'partner_type' },            
            { name: 'partner_email'}
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi_0 = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {                
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/project-partners/modal/project-partner-modal.html',
            controller: 'ProjectPartnerModalCtrl as vm',
            resolve: {
                project_partner: function res(gprRestApi) {
                    return gprRestApi.getRow('project_partners', id);
                },
                project_id : function(){
                    return vm.selectedProject;
                },
                operation: function res() {
                    return operation;
                }

            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_projects', false).then(function success(res) {
                vm.options.data = vm.projects = res;
            });
        });
    };
});
