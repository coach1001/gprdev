angular.module('appCg').controller('EvcMeetingsCtrl', function(evcMeetings, gprRestApi, $uibModal) {
    var vm = this;
    vm.title = 'Approval Meetings';

    var unfilteredRows = angular.copy(evcMeetings);
    vm.evcMeetings = vm.rows = angular.copy(evcMeetings);


    vm.options = {
        data: vm.rows,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        columnDefs: [
            { name: 'meeting_date', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'name' },
            { name: 'type_of_meeting' }
        ],

        onRegisterApi: function(gridApi) {
            vm.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                var msg = 'row selected ' + row.isSelected;
                vm.openModal(row.entity.id, 'Update');
            });
        }
    };

    vm.openModal = function(id, operation) {
        $uibModal.open({
            templateUrl: 'partial/evc-meetings/modal/evc-meeting-modal.html',
            controller: 'EvcMeetingModalCtrl as vm',
            size: 'lg',
            windowClass : 'big-modal',
            resolve: {
                evcMeeting: function res(gprRestApi) {
                    return gprRestApi.getRow('approval_meetings', id);
                },
                evcApplications: function res(gprRestApi) {
                    return gprRestApi.getRowsFilterColumn('grid_evc_applications', 'evc', id);
                },
                evcAttendees: function res(gprRestApi) {
                    return gprRestApi.getRowsFilterColumn('grid_evc_attendees', 'evc', id);
                },
                meetingTypes: function res(gprRestApi) {
                    return gprRestApi.getRows('approval_meeting_types', false);
                },
                operation: function res() {
                    return operation;
                }
            }
        }).result.then(function(result) {
            console.log('modal closed');
        }, function(result) {
            gprRestApi.getRows('grid_approval_meetings', false).then(function success(res) {
                vm.options.data = vm.evcMeetings = res;
            });
        });
    };
});
