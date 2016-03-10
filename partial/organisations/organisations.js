angular.module('appCg').controller('OrganisationsCtrl', function(grid_organisations, gprRestApi, $uibModal, $filter, $state, uiGridConstants) {
    var vm = this;
    vm.title = 'Organisations';

    var unfilteredRows = angular.extend(grid_organisations.rows);
    vm.rows = angular.extend(grid_organisations.rows);
    vm.count = unfilteredRows.length;

    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [{
                name: 'code',
                sort: {
                    direction: uiGridConstants.ASC,
                    priority: 0,
                }
            },
            { name: 'name' },
            { name: 'web_site' },
            { name: 'email_address' },
            { name: 'referee' },
            { name: 'auditor' },
            { name: 'province' },
            { name: 'organisation_type' }
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
            templateUrl: 'partial/organisations/modal/organisation-modal.html',
            controller: 'OrganisationModalCtrl as vm',
            size : 'lg',
            resolve: {
                organisation: function res(gprRestApi) {
                    return gprRestApi.getRow('organisations', id);
                },
                referees: function res(gprRestApi) {
                    return gprRestApi.getRows('organisations',false);
                },
                auditors: function res(gprRestApi) {
                    return gprRestApi.getRows('organisations',false);
                },
                provinces: function res(gprRestApi) {
                    return gprRestApi.getRows('provinces',false);
                },
                orgTypes: function res(gprRestApi) {
                    return gprRestApi.getRows('organisation_types',false);
                },
                orgStatuses: function res(gprRestApi) {
                    return gprRestApi.getRows('organisation_statuses',false);
                },
                suburbs: function res(gprRestApi) {
                    return gprRestApi.getRows('suburbs',false);
                },
                places: function res() {
                    return gprRestApi.getRows('places',false);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            $state.reload();
        });
    };
});
