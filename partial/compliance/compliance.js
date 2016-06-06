angular.module('appCg').controller('ComplianceCtrl',function(template,gprRestApi,$stateParams,complianceInfo){
  var vm=this;
  vm.template = angular.copy(template[0]);
  vm.complianceInfo = angular.extend(complianceInfo[0]);

  vm.scoring_max = 0;
  vm.current_score = 0;
  //console.log(complianceInfo);

  angular.forEach(vm.template.categories, function(cat, catkey) {
    vm.template.categories[catkey].questions = cat.questions.sort(function (a,b){
      return a.id- b.id;
    });
  });

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
