angular.module('appCg').controller('ComplianceCtrl', function($scope, template, gprRestApi, $stateParams, complianceInfo, ngToast, $confirm, authenticationService, $state, score_for_template, gu, la, view_all) {
    var vm = this;

    vm.template = angular.copy(template[0]);
    vm.complianceInfo = angular.copy(complianceInfo[0]);
    vm.score_for_template = angular.copy(score_for_template[0]);
    vm.scoring_max = 0;
    vm.current_score = 0;
    vm.question_counter = 0;

    if (vm.complianceInfo.compliance_section === vm.complianceInfo.application_status) {
        vm.disabled = false;
    } else {
        vm.disabled = true;
    }

    if (gu) {
        vm.gu = angular.copy(gu);
    } else {
        vm.gu = false;
    }

    if (la) {
        vm.la = angular.copy(la);
    } else {
        vm.la = false;
    }

    if (view_all) {
        vm.view_all = angular.copy(view_all);
    } else {
        vm.view_all = false;
    }

    console.log(view_all);
    
    if (vm.complianceInfo.application_status === 2) {
        vm.current_status = 'Admin & Tech';
    } else if (vm.complianceInfo.application_status === 3) {
        vm.current_status = 'Relevance';
    } else if (vm.complianceInfo.application_status === 4) {
        vm.current_status = 'Assessment';
    } else if (vm.complianceInfo.application_status === 5) {
        vm.current_status = 'PMU Advisory';
    } else if (vm.complianceInfo.application_status === 6) {
        vm.current_status = 'Due Diligence';
    } else if (vm.complianceInfo.application_status === 7) {
        vm.current_status = 'Approval Meeting';
    } else if (vm.complianceInfo.application_status === 8) {
        vm.current_status = 'Contract';
    } else if (vm.complianceInfo.application_status === 9) {
        vm.current_status = 'Project';
    } else if (vm.complianceInfo.application_status === 10) {
        vm.current_status = 'Project Closure';
    } else if (vm.complianceInfo.application_status === 11) {
        vm.current_status = 'Closure';
    } else if (vm.complianceInfo.application_status === 12) {
        vm.current_status = 'Audited';
    } else {
        vm.current_status = 'Failed';
    }

    vm.complete = true;

    angular.forEach(vm.template.categories, function(cat, catkey) {
        angular.forEach(cat.questions, function(q, qkey) {
            if (q.question_types.code === 'number' && q.is_scoring) {
                vm.scoring_max = vm.scoring_max + q.max_scoring;
                if (q.compliance_answers.length) { vm.current_score = vm.current_score + parseFloat(q.compliance_answers[0].answer); }
            }
        });
    });

    vm.updateModelAnswer = function(catIndex, qIndex, data) {
        vm.template.categories[catIndex].questions[qIndex].compliance_answers[0].answer = data;

        vm.complete = true;

        for (var i = 0, len = vm.template.categories.length; i < len; i++) {
          
          for (var k = 0, len_ = vm.template.categories[i].questions.length; k < len_; k++) {
                   
          }  
        
        }
    
    };

    vm.updateModelMotivation = function(catIndex, qIndex, data) {
        vm.template.categories[catIndex].questions[qIndex].compliance_answers[0].motivation = data;
    };

    vm.saveAnswers = function() {
        gprRestApi.updateCreateRow('application_compliance_officers', { id: vm.complianceInfo.id, complete: vm.complianceInfo.complete }, 'Update');
        angular.forEach(vm.template.categories, function(cat, catkey) {
            angular.forEach(cat.questions, function(q, qkey) {
                if (q.compliance_answers.length) {
                    if (q.compliance_answers[0].id) {
                        gprRestApi.updateCreateRow('compliance_answers', q.compliance_answers[0], 'Update');
                    } else {
                        q.compliance_answers[0].question = q.id;
                        q.compliance_answers[0].application_compliance_officer = $stateParams.appId;
                        gprRestApi.updateCreateRow('compliance_answers', q.compliance_answers[0], 'Create').then(function success(response) {
                            vm.template.categories[catkey].questions[qkey].compliance_answers[0].id = response.data.id;
                        }, function error(response) {});
                    }
                }
            });
        });
        ngToast.create({ content: 'Compliance Saved Successfully', timeout: 4000 });
    };

    vm.promote = function() {
        vm.saveAnswers();
        $confirm({
            title: 'Promote Application?',
            text: 'Warning : You will only be able to view data from this section after promotion',
            ok: 'Yes',
            cancel: 'No'
        }).then(function(res) {
            gprRestApi.runRPC('promote_application', { application: vm.complianceInfo.application, current_section: vm.complianceInfo.compliance_section }).then(function success(res) {

                if (vm.gu === 'false') {
                    $state.go('home.compliance-select', { compliance_section: vm.complianceInfo.compliance_section, email_address: authenticationService.username });
                } else {
                    $state.go('home.compliance-select-pmu', { compliance_section: vm.complianceInfo.compliance_section });
                }

            }, function error(res) {});
        });
    };

    vm.fail = function() {
        vm.saveAnswers();
        $confirm({
            title: 'Fail Application',
            text: 'Are you sure ?',
            ok: 'Yes',
            cancel: 'No'
        }).then(function(res) {
            gprRestApi.runRPC('fail_application', { application: vm.complianceInfo.application, current_section: vm.complianceInfo.compliance_section }).then(function success(res) {

                if (vm.gu === 'false') {
                    $state.go('home.compliance-select', { compliance_section: vm.complianceInfo.compliance_section, email_address: authenticationService.username });
                } else {
                    $state.go('home.compliance-select-pmu', { compliance_section: vm.complianceInfo.compliance_section });
                }

            }, function error(res) {

            });
        });

    };

    vm.demote = function() {
        $confirm({
            title: 'Delete Section Data?',
            text: 'Warning : All Section Data will be Deleted for this Application',
            ok: 'Yes',
            cancel: 'No'
        }).then(function(res) {
            gprRestApi.runRPC('demote_application', { application: vm.complianceInfo.application, current_section: vm.complianceInfo.compliance_section }).then(function success(res) {

                if (vm.gu === 'false') {
                    $state.go('home.compliance-select', { compliance_section: vm.complianceInfo.compliance_section, email_address: authenticationService.username });
                } else {
                    $state.go('home.compliance-select-pmu', { compliance_section: vm.complianceInfo.compliance_section });
                }

            }, function error(res) {});
        });
    };

    vm.updateCurrScore = function() {
        vm.current_score = 0.0;
        angular.forEach(vm.template.categories, function(cat, catkey) {
            angular.forEach(cat.questions, function(q, qkey) {
                if (q.question_types.code === 'number' && q.is_scoring) {
                    if (q.compliance_answers.length) { vm.current_score = vm.current_score + parseFloat(q.compliance_answers[0].answer); }
                }
            });
        });
    };

    vm.returnToSelect = function() {
        //$state.go('home.compliance',{templateId : compliance_packet.compliance_template, appId : compliance_packet.appId,application : compliance_packet.application, grants_unit : vm.gu.state, la : vm.la});                 
    };

});
