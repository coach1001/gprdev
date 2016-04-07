Date.prototype.toSA = function () {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString();
  var dd = this.getDate().toString();

  return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};
angular.module('appCg', [
  'ui.bootstrap',
  'ui.router',
  'ngAnimate',
  'formly',
  'formlyBootstrap',
  'ngToast',
  'angular-confirm',
  'ui.grid', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.edit',
  'ui.select', 'ngLoadingSpinner'
]);
angular.module('appCg').config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider.state('home', {
    url: '/home',
    views: {
      'topNav@': {
        templateUrl: 'partial/top-nav/top-nav.html',
        controller: 'TopNavCtrl as vm'
      },
      'mainContent@': {
        templateUrl: 'partial/home/home.html',
        controller: 'HomeCtrl as vm'
      }
    },
    data: {
      requireLogin: false
    }
  }).state('home.programmes', {
    url: '/programmes',
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
    },
    data: {
      requireLogin: true
    }
  });
  $stateProvider.state('home.kras', {
    url: '/kras',
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
    },
    data: {
    requireLogin: true
  }
  });
  $stateProvider.state('home.kpis', {
    url: '/kpis',
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
    },
    data: {
      requireLogin: true
    }

  });
  $stateProvider.state('home.cfps', {
    url: '/cfps',
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
    },
    data: {
      requireLogin: true
    }

  });
  $stateProvider.state('home.organisations', {
    url: '/organisations',
    views: {
      'mainContent@': {
        templateUrl: 'partial/organisations/organisations.html',
        controller: 'OrganisationsCtrl as vm',
        resolve: {
          organisations: function res(gprRestApi) {
            return gprRestApi.getRows('grid_organisations', false);
          }
        }
      }
    },
    data: {
      requireLogin: true
    }
  });
  $stateProvider.state('home.applications', {
    url: '/applications',
    views: {
      'mainContent@': {
        templateUrl: 'partial/applications/applications.html',
        controller: 'ApplicationsCtrl as vm',
        resolve: {}
      }
    },
    data: {
      requireLogin: true
    }
  });
  $stateProvider.state('home.lookups', {
    url: '/lookups',
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
    },
    data: {
      requireLogin: true
    }
  });
  $stateProvider.state('home.user-validation', {
    url: '/validate?:validation_token&:user_email',
    views: {
      'mainContent@': {
        templateUrl: 'partial/user-validation/user-validation.html',
        controller: 'UserValidationCtrl as vm',
        resolve: {
          validation_success: function res(authenticationService, $stateParams) {
            return authenticationService.validate($stateParams.user_email, $stateParams.validation_token).then(function success(response) {
              return 'Validation Successful';
            }, function error(response) {
              return 'Validation Failed';
            });
          }
        }
      }
    },
    data: {
      requireLogin: false
    }

  });
  $urlRouterProvider.otherwise('/home');
  $locationProvider.html5Mode(false);
});
angular.module('appCg').run(function ($rootScope, $state, loginModalService, authenticationService) {
  $rootScope.authorizationError = false;

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;
    $rootScope.authorizationError = false;

    if (requireLogin && !authenticationService.isAuthenticated) {
      event.preventDefault();
      loginModalService().then(function () {
        return $state.go(toState.name, toParams);
      }).catch(function () {
        return $state.go('home');
      });
    }
  });

});
angular.module('appCg').config(function ($httpProvider) {

  $httpProvider.interceptors.push(function ($timeout, $q, $injector, $rootScope) {
    var loginModalService, $http, $state, authenticationService, $uibModal;
    $timeout(function () {
      loginModalService = $injector.get('loginModalService');
      $http = $injector.get('$http');
      $state = $injector.get('$state');
      authenticationService = $injector.get('authenticationService');
      $uibModal = $injector.get('$uibModal');
    });

    return {
      responseError: function (rejection) {

        if (rejection.status === 404 && authenticationService.isAuthenticated) {
          if (!$rootScope.authorizationError) {
            $rootScope.authorizationError = true;
            $uibModal.open({
              animation: true,
              templateUrl: 'partial/pop-up/pop-up.html',
              controller: 'PopUpCtrl as vm',
              size: 'md',
              resolve: {
                items: function () {
                  return {
                    popupHeader: 'Not Authorized',
                    popupMessage: 'You are not Authorized to View this Page',
                    affirmative: 'Goto Login',
                    negative: '',
                    hideAffirmative: true,
                    hideNegative: true
                  };
                }
              }
            });
            $state.go('home');
            return rejection;
          }
        }else if(rejection.status === 400 && authenticationService.isAuthenticated){
          if (!$rootScope.authorizationError){
            $rootScope.authorizationError = true;

            $uibModal.open({
              animation: true,
              templateUrl: 'partial/pop-up/pop-up.html',
              controller: 'PopUpCtrl as vm',
              size: 'md',
              resolve: {
                items: function () {
                  return {
                    popupHeader: 'Not Authorized',
                    popupMessage: 'Your Session has Expired Please Login Again.',
                    affirmative: 'Goto Login',
                    negative: '',
                    hideAffirmative: true,
                    hideNegative: true
                  };
                }
              }
            });
            authenticationService.logout();
            $state.go('home');
            return rejection;
          }
        }
        return rejection;
      }

    };

  });
});

