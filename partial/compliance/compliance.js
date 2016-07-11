angular.module('appCg').controller('ComplianceCtrl',function(template,gprRestApi,$stateParams,complianceInfo,ngToast,$confirm,authenticationService,$state){
  var vm=this;
  vm.template = angular.copy(template[0]);
  vm.complianceInfo = angular.extend(complianceInfo[0]);
  console.log(vm.complianceInfo);
  vm.scoring_max = 0;
  vm.current_score = 0;
  
  if(vm.complianceInfo.compliance_section === vm.complianceInfo.application_status){
    vm.disabled = false;
  }else{
    vm.disabled = true;
  }

  angular.forEach(vm.template.categories, function(cat, catkey) {
    angular.forEach(cat.questions,function(q,qkey){
      if(q.question_types.code === 'number' && q.is_scoring){
        vm.scoring_max =  vm.scoring_max + q.max_scoring;
        if(q.compliance_answers.length)
        {vm.current_score = vm.current_score + parseFloat(q.compliance_answers[0].answer);}
      }
    });
  });

  vm.updateModelAnswer = function(catIndex,qIndex,data){
    vm.template.categories[catIndex].questions[qIndex].compliance_answers[0].answer = data;
  };

  vm.updateModelMotivation = function(catIndex,qIndex,data){
    vm.template.categories[catIndex].questions[qIndex].compliance_answers[0].motivation = data;
  };

  vm.saveAnswers = function(){
    gprRestApi.updateCreateRow('application_compliance_officers',{ id : vm.complianceInfo.id , complete : vm.complianceInfo.complete},'Update');
    angular.forEach(vm.template.categories, function(cat, catkey) {
      angular.forEach(cat.questions,function(q,qkey){
        if(q.compliance_answers.length){
          if(q.compliance_answers[0].id){
            gprRestApi.updateCreateRow('compliance_answers', q.compliance_answers[0],'Update');
          }else{
            q.compliance_answers[0].question = q.id;
            q.compliance_answers[0].application_compliance_officer = $stateParams.appId;
            gprRestApi.updateCreateRow('compliance_answers', q.compliance_answers[0],'Create').then(function success(response){
              vm.template.categories[catkey].questions[qkey].compliance_answers[0].id = response.data.id;
            },function error(response){});
          }
        }
      });      
    });
    ngToast.create({ content: 'Compliance Saved Successfully', timeout: 4000 });
  };

  vm.promote = function(){
    vm.saveAnswers();
  };

  vm.fail =function(){
    vm.saveAnswers();
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
          {application : vm.complianceInfo.application , current_section : vm.complianceInfo.compliance_section }).then(function success(res){
            console.log('Success');
            $state.go('home.compliance-select',{compliance_section : vm.complianceInfo.compliance_section,email_address : authenticationService.username});  
        },function error(res){
          console.log('Error');
        });
    });
  };

  vm.updateCurrScore = function(){
    vm.current_score=0.0;
    angular.forEach(vm.template.categories, function(cat, catkey) {
      angular.forEach(cat.questions,function(q,qkey){
        if(q.question_types.code === 'number' && q.is_scoring){
          if(q.compliance_answers.length)
          {vm.current_score = vm.current_score + parseFloat(q.compliance_answers[0].answer);}
        }
      });
    });
  };

});
