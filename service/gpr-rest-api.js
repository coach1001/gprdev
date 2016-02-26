angular.module('appCg').factory('gprRestApi', function($http) {

    var gprRestApi = {};
    gprRestApi.baseUrl = 'http://localhost:3000';
    gprRestApi.tables = [];

    gprRestApi.getTableIndex = function(table) {
        var tableIndex;
        gprRestApi.tables.map(function(value, key) {
            if (value.name === table) { tableIndex = key; }
        });
        return tableIndex;
    };

    gprRestApi.init = function(tableConfig) {
        gprRestApi.tables = tableConfig;
    };

    gprRestApi.getRows = function(table) {
        var tableIndex = gprRestApi.getTableIndex(table);

        return $http.get(gprRestApi.baseUrl + '/' + table).then(function success(response) {
            gprRestApi.tables[tableIndex].rows = response.data;
            return gprRestApi.tables[tableIndex];
        }, function error() {
            console.log('Error! Getting Rows from ' + table);
        });
    };

    gprRestApi.getRow = function(table, id) {
        var tableIndex = gprRestApi.getTableIndex(table);
        return $http.get(gprRestApi.baseUrl + '/' + table + '?id=eq.' + id).then(function success(response) {
            gprRestApi.tables[tableIndex].selectedRow = response.data[0];
            return gprRestApi.tables[tableIndex];
        }, function error(response) {
            console.log('Error! Getting Row from ' + table);
        });
    };

    return gprRestApi;
});
