angular.module('appCg').controller('PmuAdvisoryNoteModalCtrl',function(application,
                                                                   operation,
                                                                   gprRestApi,
                                                                   ngToast,
                                                                   $confirm,
                                                                   $uibModalInstance,$state,authenticationService) {

  var vm = this;
  //console.log('here');

  if (operation === 'Create') {
    vm.application = {};
  } else if (operation === 'Update') {
    vm.application = angular.extend(application);
  }
 // console.log(vm.application);
//  vm.application.dates = {};
  vm.operation = operation;

/*
  if (vm.operation === 'Update' && vm.application.start_date && vm.application.end_date) {
    vm.application.dates.start_date_ = new Date(vm.application.start_date);
    vm.application.dates.end_date_ = new Date(vm.application.end_date);
  }
*/
  console.log(vm.application.application_status);

  if(vm.application.application_status === 5){
    vm.disabled = false;
  }else{
    vm.disabled = true;
  }

console.log(vm.disabled);

  vm.applicationFields = [{
    key: 'pm_advisory',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'PM Advisory Note',
      placeholder: 'Note',
      rows: 7,
      required: false
    }
  },{
    key: 'pmu_advisory',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'PMU Advisory Note',
      placeholder: 'Note',
      rows: 7,
      required: false
    }
  },{
    key: 'dd_outcomes',
    type: 'textarea',
    className: 'nopadding',
    templateOptions: {
      label: 'Due Diligence Outcomes',
      placeholder: 'Outcomes',
      rows: 7,
      required: false
    }
  }];

  vm.updateCreateRow = function () {
    var body = angular.copy(vm.application);  
    console.log(body);  
    gprRestApi.updateCreateRow('call_applications', body, vm.operation).then(function success(response) {
      ngToast.create({content: vm.operation + ' Record Successfull', timeout: 4000});
      if (vm.operation === 'Create') {
        vm.application.id = response.data.id;
      }      
      vm.operation = 'Update';
    }, function error(response) {
      ngToast.warning({content: vm.operation + ' Record Failed', timeout: 4000});
    });
  };

  vm.deleteRow = function () {
    gprRestApi.deleteRow('call_applications', vm.application.id).then(function success(response) {
      ngToast.warning({content: 'Record Deleted Successfully', timeout: 4000});
      $uibModalInstance.dismiss('Record Deleted');
    }, function error(response) {
      ngToast.warning({content: 'Record Delete Failed', timeout: 4000});
    });
  };

  vm.promote = function(){    
    vm.updateCreateRow();
    $confirm(
      {
        title : 'Promote Application?',
        text : 'Warning : You will only be able to view data from this section after promotion',
        ok : 'Yes',
        cancel : 'No'
      }).then(function(res){        
        gprRestApi.runRPC('promote_application',
          {application : vm.application.id , current_section : vm.application.application_status}).then(
          function success(res){
            $uibModalInstance.dismiss('');
            $state.go('home.pmu-advisory-notes');  
          },function error(res){          
          
          });
    });
  };

  vm.fail =function(){
    vm.saveAnswers();
    $confirm(
      {
        title : 'Fail Application',
        text : 'Are you sure ?',
        ok : 'Yes',
        cancel : 'No'
      }).then(function(res){        
        gprRestApi.runRPC('fail_application',
          {application : vm.application.id , current_section : vm.application.application_status }).then(function success(res){            
            $uibModalInstance.dismiss('');
            $state.go('home.pmu-advisory-notes');  
        },function error(res){          
        });
    });

  };

  vm.demote = function(){
    $confirm(
      {
        title : 'Delete Section Data?',
        text : 'Warning : All Section Data will be Deleted for this Application',
        ok : 'Yes',
        cancel : 'No'
      }).then(function(res){        
        gprRestApi.runRPC('demote_application',
          {application : vm.application.id , current_section : vm.application.application_status }).then(function success(res){            
            $uibModalInstance.dismiss('');
            $state.go('home.pmu-advisory-notes');  
        },function error(res){          
        });
    });
  };

});
