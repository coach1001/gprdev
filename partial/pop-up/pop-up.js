angular.module('appCg').controller('PopUpCtrl', function ($uibModalInstance,items) {
  var vm = this;
  vm.items = {};
  vm.items = items;
  vm.affirmative = function affirmative() {
    $uibModalInstance.close('Affirmative');
  };
  vm.negative = function negative() {
    $uibModalInstance.dismiss('Negative');
  };
});
