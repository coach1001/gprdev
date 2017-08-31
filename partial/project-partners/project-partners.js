angular.module('appCg').controller('ProjectPartnersCtrl', function(projects, gprRestApi, $uibModal, option, uiGridConstants) {
    var vm = this;
    vm.title = 'Project Partners';
    var unfilteredRows = angular.extend(projects);

    vm.projects = vm.rows = angular.extend(projects);
    vm.option = angular.extend(option);
    if (vm.option === 2) {
        vm.option_header = 'Contracts';
    } else if (vm.option === 3) {
        vm.option_header = 'Budget Plans';
    } else if (vm.option === 4) {
        vm.option_header = 'Implementation Plans';
    } else if (vm.option === 5) {
        vm.option_header = 'Reporting Schedules';
    } else if (vm.option === 6) {
        vm.option_header = 'Expenses';
    }


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
                    vm.projectPartners = angular.extend(res);
                    vm.optionsPartners.data = vm.projectPartners;
                    vm.selectedProject = row.entity.id;
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
            { name: 'project',width: '10%' },
            { name: 'partner_seq' , width: '3%', displayName: ''},
            { name: 'partner_name' },
            { name: 'partner_type' },
            { name: 'partner_email' }
        ],
        onRegisterApi: function(gridApi) {
            vm.gridApi_0 = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

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
        } else if (option === 6) {
            $uibModal.open({
                templateUrl: 'partial/project-partners/modal/project-partner-expenses-modal.html',
                controller: 'ProjectPartnerExpensesModalCtrl as vm',
                windowClass: 'large-width',
                resolve: {
                    project_partner: function res(gprRestApi) {
                        return gprRestApi.getRow('grid_project_partners', id);
                    },
                    partner_expenses: function res(gprRestApi) {
                        return gprRestApi.getRowsFilterColumn('grid_project_expenses', 'partner_id', id);
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
    };
});
