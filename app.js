angular.module('appCg', ['ui.bootstrap', 'ui.router', 'ngAnimate']);

function fetchData() {
    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');

    $http.get('http://localhost:3000').then(function success(response) {

        var tables = response.data;
        tables.forEach(function(table, tablekey) {
            tables[tablekey].fields = [];
            tables[tablekey].rows = [];
            tables[tablekey].selectRow = {};

            $http({ url: 'http://localhost:3000' + '/' + table.name, method: 'OPTIONS' }).then(function success(response) {
                var pk_column = response.data.pkey[0];
                response.data.columns.forEach(function(tableField, tableFieldkey) {
                    if (tableField.name === pk_column) { tableField.pk = true; } else { tableField.pk = false; }
                    if (tableField.references) { tableField.type = 'reference'; }
                    tables[tablekey].fields.push(tableField);
                });
            }, function error(response) {

            });
        });
        angular.module('appCg').constant('configData', tables);
        console.log('Bootstrap Complete...');
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['appCg']);
        });
    });
}
fetchData();

angular.module('appCg').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('home', {
        url: '/',
        views: {
            'topNav': {
                templateUrl: 'partial/top-nav/top-nav.html',
                controller: 'TopNavCtrl as vm'
            },
            'mainContent@': {
                templateUrl: 'partial/home/home.html',
                controller: 'HomeCtrl as vm',
                resolve: {
                    provinces: function res(gprRestApi) {
                        return gprRestApi.getRows('provinces');
                    }
                }
            }
        }
    });
    $stateProvider.state('home.programmes', {
        url : '/programmes',
        views: {
            'mainContent@': {
                templateUrl: 'partial/programmes/programmes.html',
                controller: 'ProgrammesCtrl as vm',
                resolve: {
                    programmes: function res(gprRestApi) {
                        return gprRestApi.getRows('programmes');
                    }
                }
            }
        }
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/');
});

angular.module('appCg').run(function($rootScope, gprRestApi, configData) {
    console.log('Running Application...');
    gprRestApi.init(configData);

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
