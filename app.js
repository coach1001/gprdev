(function() {
    
    angular.module( 'appCg', [
                    'ui.bootstrap',
                    'ui.router',
                    'ngAnimate',
                    'formly',
                    'formlyBootstrap',
                    'ngToast',
                    'angular-confirm',
                    'ui.grid', 'ui.grid.selection', 'ui.grid.exporter','ui.grid.edit',
                    'ui.select', 'ngLoadingSpinner','ui.checkbox'
                  ]);

    fetchData().then(bootstrapApplication);

    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");

        return $http.get("config.json").then(function(response) {
            angular.module('appCg').constant("config", response.data);
        }, function(errorResponse) {
            // Handle error case
        });
    }
    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["appCg"]);
        });
    }
}());
Array.prototype.getIndex = function (prop, value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][prop] === value) {
      return i;
    }
  }
  return -1;
};
var regexIso8601forDate = /^\d{4}-\d{2}-\d{2}$/;
var regexIso8601forDateTime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
function convertDateStringsToDates(input) {
  // Ignore things that aren't objects.
  if (typeof input !== "object") {
    return input;
  }

  for (var key in input) {
    if (!input.hasOwnProperty(key)) {
      continue;
    }

    var value = input[key];
    var match;
    // Check for string properties which look like dates.
    // TODO: Improve this regex to better match ISO 8601 date strings.
    if (typeof value === "string" && (match = value.match(regexIso8601forDate))) {
      // Assume that Date.parse can parse ISO 8601 strings, or has been shimmed in older browsers to do so.
      var milliseconds = Date.parse(match[0]);
      if (!isNaN(milliseconds)) {
        input[key] = new Date(milliseconds);
      }
    } else if (typeof value === "string" && (match = value.match(regexIso8601forDateTime))) {
      var milliseconds_ = Date.parse(match[0]);
      if (!isNaN(milliseconds_)) {
        input[key] = new Date(milliseconds_);
      }
    } else if (typeof value === "object") {
      // Recurse into object
      convertDateStringsToDates(value);
    }
  }
}
/*angular.module('appCg', [
  'ui.bootstrap',
  'ui.router',
  'ngAnimate',
  'formly',
  'formlyBootstrap',
  'ngToast',
  'angular-confirm',
  'ui.grid', 'ui.grid.selection', 'ui.grid.exporter','ui.grid.edit',
  'ui.select', 'ngLoadingSpinner','ui.checkbox'
]);*/
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
  });
  $stateProvider.state('home.programmes', {
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
        resolve: {
          applications: function res(gprRestApi) {
            return gprRestApi.getRows('grid_applications', false);
          }
        }
      }
    },
    data: {
      requireLogin: false
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

  $stateProvider.state('home.admin-compliance-select', {
    url: '/admin-compliance-select',
    views: {
      'mainContent@': {
        templateUrl: 'partial/compliance-select/compliance-select.html',
        controller: 'ComplianceSelectCtrl as vm',
        resolve: {
          compliances: function (gprRestApi, authenticationService) {
            return gprRestApi.getRowsWithFEs('grid_compliance_applications','&compliance_section=eq.0&email_address=eq.'+authenticationService.username);      
          },
          complianceSection : function (){return 0;}
        }
      }
    }
  });
  $stateProvider.state('home.relevance-check-select', {
    url: '/relevance-check-select',
    views: {
      'mainContent@': {
        templateUrl: 'partial/compliance-select/compliance-select.html',
        controller: 'ComplianceSelectCtrl as vm',
        resolve: {
          compliances: function (gprRestApi, authenticationService) {
            return gprRestApi.getRowsWithFEs('grid_compliance_applications','&compliance_section=eq.1&email_address=eq.'+authenticationService.username);      
          },
          complianceSection : function (){return 1;}
        }
      }
    }
  });
  $stateProvider.state('home.assessment-select', {
    url: '/assessment-select',
    views: {
      'mainContent@': {
        templateUrl: 'partial/compliance-select/compliance-select.html',
        controller: 'ComplianceSelectCtrl as vm',
        resolve: {
          compliances: function (gprRestApi, authenticationService) {
            return gprRestApi.getRowsWithFEs('grid_compliance_applications','&compliance_section=eq.2&email_address=eq.'+authenticationService.username);      
          },
          complianceSection : function (){return 2;}
        }
      }
    }
  });
  $stateProvider.state('home.due-diligence-select', {
    url: '/due-diligence-select',
    views: {
      'mainContent@': {
        templateUrl: 'partial/compliance-select/compliance-select.html',
        controller: 'ComplianceSelectCtrl as vm',
        resolve: {
          compliances: function (gprRestApi, authenticationService) {
            return gprRestApi.getRowsWithFEs('grid_compliance_applications','&compliance_section=eq.3&email_address=eq.'+authenticationService.username);      
          },
          complianceSection : function (){return 3;}
        }
      }
    }
  });
  

  $stateProvider.state('home.compliance', {
    url: '/compliance?:templateId&:appId',
    views: {
      'mainContent@': {
        templateUrl: 'partial/compliance/compliance.html',
        controller: 'ComplianceCtrl as vm',
        resolve: {
          template: function res(gprRestApi, $stateParams) {
            return gprRestApi.getRowsWithFEs('compliance_templates', ',categories{*,questions{*,question_types{*},question_options{*},compliance_answers{*}}}', '&id=eq.' + $stateParams.templateId +'&categories.questions.compliance_answers.application_compliance_officer=eq.'+$stateParams.appId);
          },
          complianceInfo: function res(gprRestApi, $stateParams) {
            return gprRestApi.getRowsWithFEs('grid_compliance_applications','&id=eq.'+$stateParams.appId);
          }          
        }
      }
    }
  });

  $stateProvider.state('home.persons', {
    url: '/persons',
    views: {
      'mainContent@': {
        templateUrl: 'partial/persons/persons.html',
        controller: 'PersonsCtrl as vm',
        resolve: {
          persons: function res(gprRestApi) {
            return gprRestApi.getRows('grid_persons',false);
          }
        }
      }
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
            return $q.reject(rejection);
          }
        } else if (rejection.status === 400 && authenticationService.isAuthenticated) {
          if (!$rootScope.authorizationError) {
            $rootScope.authorizationError = true;
            authenticationService.logout();
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
            return $q.reject(rejection);
          }
        }
        return $q.reject(rejection);
      }

    };

  });
});
angular.module('appCg').config(function ($httpProvider) {
  $httpProvider.defaults.transformResponse.push(function (responseData) {
    convertDateStringsToDates(responseData);
    return responseData;
  });
});
angular.module('appCg').directive('input', [function() {
  return {
    restrict: 'E',
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if (
        'undefined' !== typeof attrs.type && 'number' === attrs.type && ngModel
      ) {
        ngModel.$formatters.push(function(modelValue) {
          return Number(modelValue);
        });
        ngModel.$parsers.push(function(viewValue) {
          return Number(viewValue);
        });
      }
    }
  };
}]);

