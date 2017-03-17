angular.module('appCg').directive('svgMap', ['$compile', function($compile) {
    return {
        restrict: 'A',
        templateUrl: 'za.svg',
        link: function(scope, element, attrs) {
            var regions = element[0].querySelectorAll('.province');
            angular.forEach(regions, function(path, key) {
                var regionElement = angular.element(path);
                regionElement.attr("region", "");
                regionElement.attr("dummy-data", "dummyData");
                regionElement.attr("hover-region", "hoverRegion");
                regionElement.attr("proj-max", "projMax");
                regionElement.attr("grid-api","gridApi");
                $compile(regionElement)(scope);
            });
        }
    };
}]);

angular.module('appCg').directive('region', ['$compile', function($compile) {
    return {
        restrict: 'A',
        scope: {
            dummyData: "=",
            hoverRegion: "=",
            projMax: "=",
            gridApi: "="
        },
        link: function(scope, element, attrs) {
            scope.elementId = element.attr("id");           	
            scope.regionClick = function() {            		
    						var entity = {};
    						angular.forEach(scope.gridApi.grid.treeBase.tree,function(value,key){
    							if(scope.elementId === value.aggregations[0].groupVal){
    								entity = value.row;
    							}
    						});    						    						
    						if(entity){    					    						
    							scope.gridApi.treeBase.collapseAllRows();
    							scope.gridApi.treeBase.expandRow(entity);	
    						}    						    						    						    				
            };
            scope.regionMouseOver = function() {
                scope.hoverRegion = scope.elementId;
                element[0].parentNode.appendChild(element[0]);
            };
            element.attr("ng-click", "regionClick()");
            element.attr("ng-attr-fill", "{{dummyData[elementId].value | map_colour:projMax }}");
            element.attr("ng-mouseover", "regionMouseOver()");
            element.attr("ng-class", "{active:hoverRegion==elementId}");
            element.removeAttr("region");
            $compile(element)(scope);
        }
    };
}]);

angular.module('appCg').filter('map_colour', [function() {
    return function(input,max) {        
        input = input/max;
        //console.log(input);
        //var b = 255 - Math.floor(input * 255);
        var value = 255- Math.floor(255*input);

        return "rgba("+Math.floor(value*0.9/2)+","+Math.floor(value*0.9/1.2)+","+Math.floor(value*0.95)+",1)";
        

        //var b = 255 - Math.floor(input * 255);
        //var g = Math.floor(input * 255);
        //return "rgba(255," + g + "," + b + ",1)";
    };
}]);
//appCg
