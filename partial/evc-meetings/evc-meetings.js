angular.module('appCg').controller('EvcMeetingsCtrl', function(evcMeetings, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'EVC Meetings';
    var unfilteredRows = angular.extend(evcMeetings);
    vm.evcMeetings = vm.rows = angular.extend(evcMeetings);

    vm.options = {
        data : vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [            
            { name: 'meeting_date',type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'name' },
        ],
        
        onRegisterApi : function(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(null, function(row) {
            var msg = 'row selected ' + row.isSelected;
            vm.openModal(row.entity.id, 'Update');
        });}
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/evc-meetings/modal/evc-meeting-modal.html',
            controller: 'EvcMeetingModalCtrl as vm',
            size : 'lg',
            resolve: {
                evcMeeting: function res(gprRestApi) {
                    return gprRestApi.getRow('evaluation_committee_meeting', id);
                },
                evcApplications: function res(gprRestApi) {
                    return gprRestApi.getRowsFilterColumn('grid_evc_applications','evc',id);
                },
                evcAttendees: function res(gprRestApi) {
                    return gprRestApi.getRowsFilterColumn('grid_evc_attendees','evc', id);
                },                
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('evaluation_committee_meeting',false).then(function success(res){
                vm.options.data = vm.evcMeetings = res;
            });
        });
    };
});
