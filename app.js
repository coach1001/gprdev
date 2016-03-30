angular.module('appCg', [
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'formly',
    'formlyBootstrap',
    'ngToast',
    'angular-confirm',
    'ui.grid', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.edit',
    'ui.select','ngLoadingSpinner'
]);
Date.prototype.toSA = function() {

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();

    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

angular.module('appCg').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('home', {
        url: '/',
        views: {
            'topNav@': {
                templateUrl: 'partial/top-nav/top-nav.html',
                controller: 'TopNavCtrl as vm'
            },
            'mainContent@': {
                templateUrl: 'partial/home/home.html',
                controller: 'HomeCtrl as vm'
            }
        }
    }).state('home.programmes', {
        url: 'programmes',
        views: {
            'mainContent@': {
                templateUrl: 'partial/programmes/programmes.html',
                controller: 'ProgrammesCtrl as vm',
                resolve: {
                    programmes: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_programmes', false);
                    }
                }
            }
        }
    });
    $stateProvider.state('home.kras', {
        url: 'kras',
        views: {
            'mainContent@': {
                templateUrl: 'partial/kras/kras.html',
                controller: 'KrasCtrl as vm',
                resolve: {
                    kras: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_kras', false);
                    }
                }
            }
        }
    });
    $stateProvider.state('home.kpis', {
        url: 'kpis',
        views: {
            'mainContent@': {
                templateUrl: 'partial/kpis/kpis.html',
                controller: 'KpisCtrl as vm',
                resolve: {
                    kpis: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_kpis', false);
                    }
                }
            }
        }
    });
    $stateProvider.state('home.cfps', {
        url: 'cfps',
        views: {
            'mainContent@': {
                templateUrl: 'partial/cfps/cfps.html',
                controller: 'CfpsCtrl as vm',
                resolve: {
                    cfps: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_calls', false);
                    }
                }
            }
        }
    });
    $stateProvider.state('home.organisations', {
        url: 'organisations',
        views: {
            'mainContent@': {
                templateUrl: 'partial/organisations/organisations.html',
                controller: 'OrganisationsCtrl as vm',
                resolve: {
                    organisations: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_organisations',false);
                    }
                }
            }
        }
    });
    $stateProvider.state('home.applications', {
        url: 'applications',
        views: {
            'mainContent@': {
                templateUrl: 'partial/applications/applications.html',
                controller: 'ApplicationsCtrl as vm',
                resolve: {

                }
            }
        }
    });
    $stateProvider.state('home.lookups', {
        url: 'lookups',
        views: {
            'mainContent@': {
                templateUrl: 'partial/lookups/lookups.html',
                controller: 'LookupsCtrl as vm',
                resolve: {
                    provinces: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_provinces', false);
                    },
                    suburbs: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_suburbs', false);
                    },
                    places: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_places', false);
                    },
                    orgTypes: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_org_types', false);
                    },
                    orgStatuses: function res(gprRestApi) {
                        return gprRestApi.getRows('grid_org_statuses', false);
                    }
                }
            }
        }
    });
    $urlRouterProvider.otherwise('/');
});

angular.module('appCg').run(function($rootScope) {
    console.log('Running Application...');
    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
});

