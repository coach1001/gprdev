angular.module('appCg').controller('LookupsCtrl', function(
    provinces,
    suburbs,
    places,
    orgTypes,
    orgStatuses, gprRestApi,
    ngToast,
    $confirm,
    $filter, uiGridConstants, $uibModal, $state) {

    var vm = this;
    vm.provE = false;
    vm.title = "Lookups";

    vm.provinces = angular.extend(provinces.rows);
    vm.suburbs = angular.extend(suburbs.rows);
    vm.places = angular.extend(places.rows);
    vm.orgTypes = angular.extend(orgTypes.rows);
    vm.orgStatuses = angular.extend(orgStatuses.rows);
    console.log(vm.orgStatuses);
    vm.provincesOpt = {
        data: vm.provinces,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        enableColumnResizing: true,
        columnDefs: [
            { name: 'code'},
            { name: 'name' }
        ],
        onRegisterApi: function(gridApi) {
            vm.grid1Api = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModalProvince(row.entity.id, 'Update');
            });
        }
    };
    vm.suburbsOpt = {
        data: vm.suburbs,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'name', displayName: 'Suburb Name' },
            { name: 'provinces.name', displayName: 'Province'},
            { name: 'po_box_code' },
            { name: 'street_code'}
        ],
        onRegisterApi: function(gridApi) {
            vm.grid2Api = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModalSuburb(row.entity.id, 'Update');
            });
        }
    };
    vm.placesOpt = {
        data: vm.places,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'name' },
            { name: 'provinces.name', displayName: 'Province' }
        ],
        onRegisterApi: function(gridApi) {
            vm.grid3Api = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModalPlace(row.entity.id, 'Update');
            });
        }
    };
    vm.orgTypesOpt = {
        data: vm.orgTypes,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'type'},
            { name: 'description'}
        ],
        onRegisterApi: function(gridApi) {
            vm.grid4Api = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModalOrgType(row.entity.id, 'Update');
            });
        }
    };
    vm.orgStatusesOpt = {
        data: vm.orgStatuses,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'status'},
            { name: 'description'},

        ],
        onRegisterApi: function(gridApi) {
            vm.grid5Api = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModalOrgStatus(row.entity.id, 'Update');
            });
        }
    };

    vm.openModalProvince = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/lookups/modal/province-modal.html',
            controller: 'ProvinceModalCtrl as vm',
            resolve: {
                province: function res(gprRestApi) {
                    return gprRestApi.getRow('provinces', id, true);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('provinces',true).then(function success(res){
                vm.provincesOpt.data = vm.provinces = res.rows;
            });
        });
    };
    vm.openModalSuburb = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/lookups/modal/suburb-modal.html',
            controller: 'SuburbModalCtrl as vm',
            resolve: {
                suburb: function res(gprRestApi) {
                    return gprRestApi.getRow('suburbs', id, true);
                },
                provinces: function res(gprRestApi) {
                    return gprRestApi.getRows('provinces', false);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
           gprRestApi.getRows('suburbs',true).then(function success(res){
                vm.suburbsOpt.data = vm.suburbs = res.rows;
            });
        });
    };
    vm.openModalPlace = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/lookups/modal/place-modal.html',
            controller: 'PlaceModalCtrl as vm',
            resolve: {
                place: function res(gprRestApi) {
                    return gprRestApi.getRow('places', id, true);
                },
                provinces: function res(gprRestApi) {
                    return gprRestApi.getRows('provinces', false);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('places',true).then(function success(res){
                vm.placesOpt.data = vm.places = res.rows;
            });
        });
    };
    vm.openModalOrgType = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/lookups/modal/org-type-modal.html',
            controller: 'OrgTypeModalCtrl as vm',
            resolve: {
                orgType: function res(gprRestApi) {
                    return gprRestApi.getRow('organisation_types', id, true);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('organisation_types',true).then(function success(res){
                vm.orgTypesOpt.data = vm.orgTypes = res.rows;
            });
        });
    };
    vm.openModalOrgStatus = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/lookups/modal/org-status-modal.html',
            controller: 'OrgStatusModalCtrl as vm',
            resolve: {
                orgStatus: function res(gprRestApi) {
                    return gprRestApi.getRow('organisation_statuses', id, true);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('organisation_statuses',true).then(function success(res){
                vm.orgStatusesOpt.data = vm.orgStatuses = res.rows;
            });
        });
    };
});
