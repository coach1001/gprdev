angular.module('appCg').constant('appCgFormlyApiCheck');
angular.module('appCg').config(function config(formlyConfigProvider, appCgFormlyApiCheck) {
  // set templates here
  function find(array, prop, value) {
    var foundItem;
    array.some(function(item) {
      if (item[prop] === value) {
        foundItem = item;
      }
      return !!foundItem;
    });
    return foundItem;
  }

  formlyConfigProvider.setType({
    name: 'matchField',
    apiCheck: function() {
      return {
        data: {
          fieldToMatch: appCgFormlyApiCheck.string
        }
      };
    },
    apiCheckOptions: {
      prefix: 'matchField type'
    },
    defaultOptions: function matchFieldDefaultOptions(options) {
      return {
        extras: {
          validateOnModelChange: true
        },
        expressionProperties: {
          'templateOptions.disabled': function(viewValue, modelValue, scope) {
            var matchField = find(scope.fields, 'key', options.data.fieldToMatch);
            if (!matchField) {
              throw new Error('Could not find a field for the key ' + options.data.fieldToMatch);
            }
            var model = options.data.modelToMatch || scope.model;
            var originalValue = model[options.data.fieldToMatch];
            var invalidOriginal = matchField.formControl && matchField.formControl.$invalid;
            return !originalValue || invalidOriginal;
          }
        },
        validators: {
          fieldMatch: {
            expression: function(viewValue, modelValue, fieldScope) {
              var value = modelValue || viewValue;
              var model = options.data.modelToMatch || fieldScope.model;
              return value === model[options.data.fieldToMatch];
            },
            message: options.data.matchFieldMessage || '"Must match"'
          }
        }
      };


    }
  });
});
angular.module('appCg').run(function(formlyConfig) {
    var attributes = [
        'date-disabled',
        'custom-class',
        'show-weeks',
        'starting-day',
        'init-date',
        'min-mode',
        'max-mode',
        'format-day',
        'format-month',
        'format-year',
        'format-day-header',
        'format-day-title',
        'format-month-title',
        'year-range',
        'shortcut-propagation',
        'datepicker-popup',
        'show-button-bar',
        'current-text',
        'clear-text',
        'close-text',
        'close-on-date-selection',
        'datepicker-append-to-body'
    ];

    formlyConfig.extras.removeChromeAutoComplete = true;

    var bindings = [
        'datepicker-mode',
        'min-date',
        'max-date'
    ];

    var ngModelAttrs = {};

    function camelize(string) {
      string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
          return chr ? chr.toUpperCase() : '';
      });
      // Ensure 1st char is always lowercase
      return string.replace(/^([A-Z])/, function(match, chr) {
          return chr ? chr.toLowerCase() : '';
      });
    }

    angular.forEach(attributes, function(attr) {
        ngModelAttrs[camelize(attr)] = { attribute: attr };
    });

    angular.forEach(bindings, function(binding) {
        ngModelAttrs[camelize(binding)] = { bound: binding };
    });

    formlyConfig.setType({
      name: 'ui-select-single',
      extends: 'select',
      templateUrl: 'formly_templates/ui-select-single.html'
    });

    formlyConfig.setType({
        name: 'datepicker',
        templateUrl: 'formly_templates/formly-date-picker.html',
        wrapper: ['bootstrapLabel', 'bootstrapHasError'],
        defaultOptions: {
            ngModelAttrs: ngModelAttrs,
            templateOptions: {
                datepickerOptions: {
                    format: 'yyyy-MM-dd',
                    initDate: new Date()
                }
            }
        },
        controller: ['$scope', function($scope) {
            $scope.datepicker = {};

            $scope.datepicker.opened = false;

            $scope.datepicker.open = function($event) {
                $scope.datepicker.opened = !$scope.datepicker.opened;
            };
        }]
    });

    formlyConfig.setType({
      name: 'button',
      template: '<div><button type="{{::to.type}}" class="btn btn-{{::to.btnType}}" ng-click="onClick($event)">{{to.text}}</button></div>',
      wrapper: ['bootstrapLabel'],
      defaultOptions: {
        templateOptions: {
          btnType: 'default',
          type: 'button'
        },
        extras: {
          skipNgModelAttrsManipulator: true // <-- perf optimazation because this type has no ng-model
        }
      },
      controller: function($scope) {

        function onClick($event) {
          if (angular.isString($scope.to.onClick)) {
            return $scope.$eval($scope.to.onClick, {$event: $event});
          } else {
            return $scope.to.onClick($event);
          }
        }

        $scope.onClick = onClick;
      }
    });
})
.run(function(formlyConfig) {

  /*
  ngModelAttrs stuff
  */

  var ngModelAttrs = {};

  function camelize(string) {
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.replace(/^([A-Z])/, function(match, chr) {
      return chr ? chr.toLowerCase() : '';
    });
  }

  /*
  timepicker
  */

  ngModelAttrs = {};

  // attributes
  angular.forEach([
    'meridians',
    'readonly-input',
    'mousewheel',
    'arrowkeys'
  ], function(attr) {
    ngModelAttrs[camelize(attr)] = {attribute: attr};
  });

  // bindings
  angular.forEach([
    'hour-step',
    'minute-step','show-meridian'
  ], function(binding) {
    ngModelAttrs[camelize(binding)] = {bound: binding};
  });

  formlyConfig.setType({
    name: 'timepicker',
    template: '<div uib-timepicker show-meridian="false" ng-model="model[options.key]"></div>',
    wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    defaultOptions: {
      ngModelAttrs: ngModelAttrs,
      templateOptions: {
        datepickerOptions: {}
      }
    }
  });


  formlyConfig.setType({
    name: 'checkbox2',
    template: '<checkbox ng-model="model[options.key]"></checkbox>',
    wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    defaultOptions :{
      templateOptions : {}
    }
  });

  formlyConfig.setType({
    name: 'select-list',
    extends : 'select',
    template:'<select class="form-control" ng-model="model[options.key]" size="7"></select>',
    wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    defaultOptions :{
      templateOptions : {}
    }
  });

});

