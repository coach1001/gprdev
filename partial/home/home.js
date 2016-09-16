angular.module('appCg').controller('HomeCtrl', function($uibModal) {
	var vm = this;
	vm.title = "DashBoard";

	vm.openModal = function() {
		$uibModal.open({
			templateUrl: 'partial/many-to-many-modal/many-to-many-modal.html',
			controller: 'ManyToManyModalCtrl',
			resolve: {
				configManyToMany : function(){
					return {						
						modalTitle : 'Organisation Types',

						optionSearchPlaceholder : 'Search Types',
						selectedSearchPlaceholder : 'Search Selected Types',
						
						hybridTable : 'organisation_has_types',
						lookupHybridColumn : 'type',

						singularColumn : 'organisation',
						singularValue : 4,

						lookupTable : 'organisation_types',
						lookupValueProp : 'id',
						lookupLabelProp : 'type'
					};
				}
			}
		}).result.then(function(result) {
			//do something with the result
		});

	};
});
