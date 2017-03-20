angular.module('appCg').controller('ManyToManyModalCtrl', function($scope, configManyToMany, gprRestApi, ngToast) {
    $scope.configManyToMany = angular.copy(configManyToMany);

    if(configManyToMany.lookupParam){
        configManyToMany.lookupTable+=configManyToMany.lookupParam;
    }

    /*
    $scope.configManyToMany = angular.copy(configManyToMany);

    $scope.originalSelectedOptions = [];
    $scope.originalAvailableOptions = [];

    $scope.editSelectedOptions = [];
    $scope.editAvailableOptions = [];

    $scope.allOptions = [];

    $scope.indicator= false;

    if(configManyToMany.lookupParam){
        configManyToMany.lookupTable+=configManyToMany.lookupParam;
    }*/

    $scope.initialize = function() {
        
        $scope.originalSelectedOptions = [];
        $scope.originalAvailableOptions = [];

        $scope.editSelectedOptions = [];
        $scope.editAvailableOptions = [];

        $scope.allOptions = [];

        $scope.indicator= false;
        

        gprRestApi.getRowsFilterColumn(
            configManyToMany.hybridTable,
            configManyToMany.singularColumn,
                        configManyToMany.singularValue).then(function success(response) {

            if (response) {
                $scope.originalSelectedOptions = angular.copy(response);                
            }

            gprRestApi.getRows(configManyToMany.lookupTable).then(function success(response) {

                if (response) {
                    $scope.allOptions = angular.copy(response);
                }

                for (var i = 0; i < $scope.allOptions.length; i++) {
                    $scope.allOptions[i].id = response[i][configManyToMany.lookupValueProp];
                    $scope.allOptions[i].label = response[i][configManyToMany.lookupLabelProp];
                }

                $scope.originalAvailableOptions = angular.copy($scope.allOptions);
                

                for (var k = 0; k < $scope.originalSelectedOptions.length; k++) {
                    for (var j = 0; j < $scope.allOptions.length; j++) {
                        if ($scope.originalSelectedOptions[k][configManyToMany.lookupHybridColumn] === $scope.allOptions[j][configManyToMany.lookupValueProp]) {
                            
                            var index = $scope.originalAvailableOptions.getIndex('id',$scope.allOptions[j].id);                                                        
                            
                            $scope.originalSelectedOptions[k].id = $scope.allOptions[j][configManyToMany.lookupValueProp];
                            $scope.originalSelectedOptions[k].label = $scope.allOptions[j][configManyToMany.lookupLabelProp];                                                        
                            $scope.originalAvailableOptions.splice(index, 1);
                            
                        }
                    }
                }

                $scope.editSelectedOptions = angular.copy($scope.originalSelectedOptions);
                $scope.editAvailableOptions = angular.copy($scope.originalAvailableOptions);

                configManyToMany.extraFields.map(function(field){
                    $scope.editAvailableOptions.map(function(opt){
                        if(opt[field.fieldName]){

                        }else{
                            opt[field.fieldName] = field.default;    
                        }
                    });
                });

            }, function error(response) {


            });

        }, function error(response) {


        });
    };

    $scope.formData = function() {
        var body = {};
        var body_array = [];
        
        for (var l = 0; l < $scope.editSelectedOptions.length; l++) {

            body = {};
            body[configManyToMany.singularColumn] = configManyToMany.singularValue;
            body[configManyToMany.lookupHybridColumn] = $scope.editSelectedOptions[l].id;
            
            for(var k=0;k<configManyToMany.extraFields.length;k++){                
                body[configManyToMany.extraFields[k].fieldName] = $scope.editSelectedOptions[l][configManyToMany.extraFields[k].fieldName];
            }
            body_array.push(body);
        }
        
        return body_array;
    };

    $scope.Update = function() {
        
        var body_array = [];        

        if ($scope.originalSelectedOptions.length > 0) {
            gprRestApi.deleteRows(configManyToMany.hybridTable, '?' + configManyToMany.singularColumn + '=eq.' + configManyToMany.singularValue).then(function success(response) {
                body_array = $scope.formData();
                
                if(body_array.length > 0){
                    gprRestApi.updateCreateRow(configManyToMany.hybridTable, body_array, 'Create').then(function success(response) {
                        ngToast.create({ content: 'Create Records Successfull', timeout: 4000 });
                        $scope.initialize();
                    }, function error(response) {

                    });
                }    
            }, function error(response) {
            
                
            });

        } else {
            body_array = $scope.formData();
                
                if(body_array.length > 0){
                    gprRestApi.updateCreateRow(configManyToMany.hybridTable, body_array, 'Create').then(function success(response) {
                        ngToast.create({ content: 'Create Records Successfull', timeout: 4000 });
                        $scope.initialize();
                    }, function error(response) {

                    });
                }   
        }        

    };

    $scope.initialize();
});
