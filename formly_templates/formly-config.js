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

    function camelize(string) {
        string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
        // Ensure 1st char is always lowercase
        return string.replace(/^([A-Z])/, function(match, chr) {
            return chr ? chr.toLowerCase() : '';
        });
    }
});
