angular.module('appCg').controller('ProjectsCtrl', function(projects, gprRestApi, $uibModal,uiGridConstants) {
    var vm = this;
    vm.title = 'Projects';
    var unfilteredRows = angular.extend(projects);
    vm.projects = vm.rows = angular.extend(projects);

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
            { name: 'project_code', sort: { direction: uiGridConstants.ASC} },
            { name: 'name' },
            { name: 'description' },
            { name: 'call_reference'},
            { name: 'start_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'end_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/projects/modal/project-modal.html',
            controller: 'ProjectModalCtrl as vm',
            resolve: {
                project: function res(gprRestApi) {
                    return gprRestApi.getRow('projects', id);
                },
                kpis: function res(gprRestApi) {
                    return gprRestApi.getRows('lookup_kpis', false);
                },
                applications :function res(gprRestApi){
                    return gprRestApi.getRows('lookup_call_applications_for_projects',false);
                },
                persons: function res(gprRestApi) {
                    return gprRestApi.getRows('grid_persons', false);
                },
                project_statuses: function res(gprRestApi) {
                    return gprRestApi.getRows('project_statuses', false);
                },
                project_types: function res(gprRestApi) {
                    return gprRestApi.getRows('project_types', false);
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
