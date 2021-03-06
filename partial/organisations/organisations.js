angular.module('appCg').controller('OrganisationsCtrl', function(organisations, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Organisations';

    var unfilteredRows = angular.extend(organisations);
    vm.organisations = vm.rows = angular.extend(organisations);

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
            { name: 'code', width: '100' },
            { name: 'name' },
            { name: 'organisation_type' },
            { name: 'web_site', visible: false },            
            { name: 'npo_no',displayName: 'NPO', width: '120' },
            { name: 'email_address' },
            { name: 'province',width: '150' },
            { name: 'place', width: '150' },
            { name: 'suburb', width: '150' },
            { name: 'contact_name', width: '150' },
            { name: 'contact_email', width: '150' },            
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
                    return gprRestApi.getRow('organisations',id);
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
/*
                suburbs: function res(gprRestApi) {
                    return gprRestApi.getRows('suburbs',false);
                },
                places: function res() {
                    return gprRestApi.getRows('places',false);
                },
*/
                main_contact_person: function res(gprRestApi) {
                    return gprRestApi.getRow('lookup_organisation_contact_person',id);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
           gprRestApi.getRows('grid_organisations',false).then(function success(res){
                vm.options.data = vm.organisations = res;
            });
        });
    };
});
