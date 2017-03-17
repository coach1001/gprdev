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
				
				$scope.selectedItem = {};
				$scope.itemSelected = false;

				$scope.addToSelected = function(item){
					for(var i = 0; i < $scope.edita.length;i++){
						if($scope.edita[i].id === item.id){
							$scope.edita.splice(i,1);
							item.selected=false;
							$scope.edits.push(item);
						}
					}
				};
				
				$scope.removeFromSelected = function(item){
					for(var i = 0; i < $scope.edits.length;i++){
						if($scope.edits[i].id === item.id){
							$scope.edits.splice(i,1);
							$scope.edita.push(item);
							$scope.selectedItem={};
							$scope.itemSelected = false;
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

				$scope.logSelectedItem = function(){
					console.log($scope.selectedItem);
				};

				$scope.selectItem = function(item){
					var i=0;
					

					for(i = 0; i < $scope.edits.length;i++){
						if($scope.edits[i].id === item.id){
						}else{
							$scope.edits[i].selected=false;					
						}
					}
					
					for(i = 0; i < $scope.edits.length;i++){
						if($scope.edits[i].id === item.id){
							$scope.edits[i].selected=!$scope.edits[i].selected;							
							if($scope.edits[i].selected === false){
								$scope.selectedItem={};
								$scope.itemSelected = false;
							}else{
								$scope.selectedItem=$scope.edits[i];	
								$scope.itemSelected = true;
							}
						}
					}
				};
		}],

		link: function(scope, element, attrs, fn) {


		}
	};
});
