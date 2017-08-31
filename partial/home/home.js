angular.module('appCg').controller('HomeCtrl', function($uibModal, $scope, projects, uiGridGroupingConstants, uiGridConstants, map) {

    $scope.title = "DashBoard";
    $scope.projects = angular.extend(projects);
    $scope.mapData = angular.extend(map);
    var prov = {};
    var provMax = 0;
    var scaleValues = [];
    var initialized = false;
    $scope.scaleValues = {};
    $scope.projMax = 0;

    var temp0;
    var temp1;

    angular.forEach($scope.mapData, function(value_, key) {
        prov[value_.province] = {};
        prov[value_.province].value = value_.value;
        if (value_.value > provMax) {
            provMax = value_.value;
        }
    });

    temp0 = Math.floor(provMax / 9);
    temp1 = temp0;

    scaleValues.push(0);
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1);
    temp1 += temp0;
    scaleValues.push(temp1 + 10);
    temp1 += temp0;

    $scope.dummyData = angular.copy(prov);
    $scope.scaleValues = angular.copy(scaleValues);
    $scope.projMax = angular.copy(provMax);

    $scope.gridOptions = {
        data: $scope.projects,
        enableFiltering: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        enableGridMenu: true,
        treeRowHeaderAlwaysVisible: false,
        showColumnFooter: true,
        exporterPdfDefaultStyle: {
            fontSize: 8
        },
        exporterPdfTableHeaderStyle: {
            fontSize: 8, 
        },
        exporterPdfFooter: function ( currentPage, pageCount ) {
          return { 
            text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' 
          };
        },
        columnDefs: [
            { name: 'is_cfp', width: '100' },
            { name: 'call_code', width: '100'},
            { name: 'implementing_partners', width: '400'},
            { name: 'code', grouping: { groupPriority: 0 }, width: '100', displayName: 'Province' },
            { name: 'project_type_code', grouping: { groupPriority: 1 }, width: '70', displayName: 'Type' }, {
                field: 'p_id',
                treeAggregationHideLabel: true,
                treeAggregationType: uiGridGroupingConstants.aggregation.COUNT,
                displayName: 'Projects',
                width: '8%',
                cellFilter: 'nToS',
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'project_name', width: '20%' },
            { name: 'key_performance_indicator', width: '7%', displayName: 'KPI' }, {
                name: 'contract_budget',
                width: '15%',
                treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                cellFilter: 'currency:"R ":0',
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                },
                footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue()|currency:"R ":0}}</div>'
            }, {
                name: 'expenses',
                width: '13%',
                treeAggregationType: uiGridGroupingConstants.aggregation.SUM,
                cellFilter: 'currency:"R ":0',
                customTreeAggregationFinalizerFn: function(aggregation) {
                    aggregation.rendered = aggregation.value;
                },
                footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue()|currency:"R ":0}}</div>'
            },


            { name: 'full_name', width: '17%', displayName: 'Project Officer' },
            { name: 'first_tranche_date', width: '17%', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'signed_by_partner_on', width: '17%', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' },
            { name: 'signed_by_grantor_on', width: '17%', type: 'date', cellFilter: 'date:\'yyyy-MM-dd\'' }

        ],
        onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.changeHoverRegion = function(region) { //                                    
        $scope.hoverRegion = region; // <-- Add this
    };
    $scope.printDiv = function(divName) {
        var printContents = document.getElementById(divName).innerHTML;
        var popupWin = window.open('', '_blank', 'width=800,height=600');
        console.log(printContents);
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="../style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();
    };

    $scope.openUpload = function() {
        $uibModal.open({
            templateUrl: 'partial/upload-file/upload-file.html',
            controller: 'UploadFileCtrl'
        }).result.then(function(result) {
            //do something with the result
        });

    };
});

angular.module('appCg').filter('nToS', function() {
    return function(val) {
        var output = val.toString();
        return output;
    };
});
