angular.module('appCg').directive('manyToMany', function() {
return {
		restrict: 'E',
		replace: true,
		scope: {
			edita : '=',
			edits : '=',

			originala : '=',
			originals : '=',

			fulla : '=',
			
			config : '='
		},
		
		templateUrl: 'directive/many-to-many/many-to-many.html',
		
		controller : ['$scope',function($scope){

				$scope.addToSelected = function(item){
					for(var i = 0; i < $scope.edita.length;i++){
						if($scope.edita[i].id === item.id){
							$scope.edita.splice(i,1);
							$scope.edits.push(item);
						}
					}
				};
				
				$scope.removeFromSelected = function(item){
					for(var i = 0; i < $scope.edits.length;i++){
						if($scope.edits[i].id === item.id){
							$scope.edits.splice(i,1);
							$scope.edita.push(item);
						}
					}
				};

				$scope.resetSelectedList = function(item){
					$scope.edits = angular.copy($scope.originals);
					$scope.edita = angular.copy($scope.originala);
				};

				$scope.selectAll = function(){
					$scope.edits = angular.copy($scope.fulla);
					$scope.edita = [];										
				};

				$scope.deselectAll = function(){
					$scope.edita = angular.copy($scope.fulla);
					$scope.edits = [];                			
				};


		}],

		link: function(scope, element, attrs, fn) {


		}
	};
});
