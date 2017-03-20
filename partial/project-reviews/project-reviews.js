angular.module('appCg').controller('ProjectReviewsCtrl', function(projects, gprRestApi, $uibModal, uiGridConstants) {
    var vm = this;

    var unfilteredRows = angular.extend(projects);

    vm.projects = vm.rows = angular.extend(projects);
    vm.projectPartners = [];
    vm.projectPartnerReviews = [];
    vm.addReview = true;    

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
            { name: 'project_code', sort: { direction: uiGridConstants.ASC } },
            { name: 'name' },
            { name: 'description' },
            { name: 'call_reference' },
            { name: 'start_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'end_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + row.entity.id).then(function success(res) {
                    vm.optionsPartnerReviews.data = vm.projectPartnerReviews = [];
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                    vm.selectedProject = row.entity.id;
                    vm.addReview = true;
                }, function error(res) {

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
            { name: 'partner_email' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi_0 = gridApi;

            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                gprRestApi.getRowsWithFEs('grid_project_reports', '&project_partner=eq.' + row.entity.id).then(function success(res) {
                    vm.projectPartnerReviews = angular.extend(res);
                    vm.optionsPartnerReviews.data = vm.projectPartnerReviews;
                    vm.selectedProjectPartner = row.entity.id;
                    vm.addReview = false;
                }, function error(res) {

                });
            });
        }
    };

    vm.optionsPartnerReviews = {
        data: vm.projectPartnerReviews,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'report_no' },
            { name: 'due_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'expiry_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'review_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'satisfactory', type: 'boolean', cellTemplate: '<checkbox disabled="true" ng-model="row.entity.satisfactory"></checkbox>' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi_1 = gridApi;

            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                vm.report_schedule = row.entity.reporting_schedule_id;
                //console.log(vm.report_schedule);

                if(row.entity.id){
                	vm.openModal(row.entity.id, 'Update',row);	
                }else{
                	vm.openModal(row.entity.id, 'Create',row);
                }
                
            });
        }
    };

    vm.openModal = function(id, operation,row) {
        //console.log(row.entity);

        $uibModal.open({
            templateUrl: 'partial/project-reviews/modal/project-review-modal.html',
            controller: 'ProjectReviewModalCtrl as vm',
            size: 'lg',
            resolve: {
                project_report: function res(gprRestApi) {
                    return gprRestApi.getRow('project_reports', id);
                },
                report_schedule: function res(gprRestApi){
                		return vm.report_schedule;                		
                },
                operation: function res() {
                    return operation;
                },
                project_partner: function res(){
                    return row.entity.project_partner;
                }
            }
        }).result.then(function(result) {

        }, function(result) {
            gprRestApi.getRowsWithFEs('grid_project_reports', '&project_partner=eq.' + vm.selectedProjectPartner).then(function success(res) {
                vm.projectPartnerReviews = angular.extend(res);
                vm.optionsPartnerReviews.data = vm.projectPartnerReviews;                
                vm.addReview = false;
            }, function error(res) {

            });
        });
    };
    /*
    vm.openModal = function(id, operation) {
        if (vm.option === 1) {
            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-modal.html',
                controller: 'ProjectPartnerModalCtrl as vm',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('project_partners', id);
                    },
                    project_id: function() {
                        return vm.selectedProject;
                    },
                    persons: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_persons', false);
                    },
                    organisations: function res(gprRestApi) {
                        return gprRestApi.getRows('lookup_organisations', false);
                    },
                    operation: function res() {
                        return operation;
                    }

                }
            }).result.then(function(result) {
                console.log('modal closed');
            }, function(result) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + vm.selectedProject).then(function success(res) {
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                }, function error(res) {});
            });
        } else if (option === 2) {
            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-contract-modal.html',
                controller: 'ProjectPartnerContractModalCtrl as vm',
                size: 'lg',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('grid_project_partners', id);
                    },
                    project_partner_contract: function res(gprRestApi) {
                        return gprRestApi.getRowWithFE_2('project_contracts', '&project_partner=eq.' + id);
                    },
                    contract_types: function res(gprRestApi) {
                        return gprRestApi.getRows('contract_types', false);
                    }
                }
            }).result.then(function(result) {
                console.log('modal closed');
            }, function(result) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + vm.selectedProject).then(function success(res) {
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                }, function error(res) {});
            });
        } else if (option === 3) {

            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-budget-modal.html',
                controller: 'ProjectPartnerBudgetModalCtrl as vm',
                size: 'lg',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('grid_project_partners', id);
                    },
                    partner_budget_schedule: function res(gprRestApi) {
                        return gprRestApi.getRowsFilterColumn('project_budgets', 'project_partner', id);
                    }
                }
            }).result.then(function(result) {
                console.log('modal closed');
            }, function(result) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + vm.selectedProject).then(function success(res) {
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                }, function error(res) {});
            });
        } else if (option === 4) {
            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-implementation-modal.html',
                controller: 'ProjectPartnerImplementationModalCtrl as vm',
                size: 'lg',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('grid_project_partners', id);
                    },
                    partner_implementation_schedule: function res(gprRestApi) {
                        return gprRestApi.getRowsFilterColumn('project_implementation_plans', 'project_partner', id);
                    }
                }
            }).result.then(function(result) {
                console.log('modal closed');
            }, function(result) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + vm.selectedProject).then(function success(res) {
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                }, function error(res) {});
            });
        } else if (option === 5) {
            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-report-schedule-modal.html',
                controller: 'ProjectPartnerReportScheduleModalCtrl as vm',
                size: 'lg',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('grid_project_partners', id);
                    },
                    partner_report_schedule: function res(gprRestApi) {
                        return gprRestApi.getRowsFilterColumn('reporting_schedule', 'project_partner', id);
                    }
                }
            }).result.then(function(result) {
                console.log('modal closed');
            }, function(result) {
                gprRestApi.getRowsWithFEs('grid_project_partners', '&project=eq.' + vm.selectedProject).then(function success(res) {
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                }, function error(res) {});
            });
        }
    };*/
});
