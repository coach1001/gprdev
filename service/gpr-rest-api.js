angular.module('appCg').factory('gprRestApi', function ($http, $q,config) {
  var gprRestApi = {};   
  
  gprRestApi.baseUrl = config.app_db_base_url; 
  gprRestApi.tables = [];
  gprRestApi.FEUString = '';
  gprRestApi.FEULevel = 1;
  gprRestApi.FEULevelTrack = 0;

  gprRestApi.setFEUString = function (table) {
    var tableIndex = gprRestApi.getTableIndex(table);
    angular.forEach(gprRestApi.tables[tableIndex].fields, function (value, key) {
      if (value.type === 'reference') {
        gprRestApi.FEUString += ',' + value.references.table + '{*';

        if (gprRestApi.FEULevel > gprRestApi.FEULevelTrack) {
          gprRestApi.setFEUString(value.references.table);
          gprRestApi.FEULevelTrack += 1;
        }
        gprRestApi.FEUString += '}';
      } else {
      }
    });
    return gprRestApi.FEUString;
  };
  gprRestApi.getFEUString = function (table) {
    gprRestApi.FEUString = '';
    gprRestApi.FEULevelTrack = 0;
    gprRestApi.setFEUString(table);
    return gprRestApi.FEUString;
  };
  gprRestApi.getTableIndex = function (table) {
    var tableIndex = 0;
    gprRestApi.tables.map(function (value, key) {
      if (value.name === table) {
        tableIndex = key;
      }
    });
    return tableIndex;
  };
  gprRestApi.init = function (tableConfig) {
    gprRestApi.tables = tableConfig;
  };
  gprRestApi.getRows = function (table, efi) {
    var urlString = gprRestApi.baseUrl + '/' + table; //+ '?select=*';
    if (efi) {
      urlString += gprRestApi.getFEUString(table);
    }
    return $http.get(urlString).then(function success(response) {
      return response.data;
    }, function error() {
      console.log('Error! Getting Rows from ' + table);
    });
  };
  gprRestApi.getRowsWithFEs = function(table,efiString,filter){
    var urlString = gprRestApi.baseUrl + '/' + table + '?select=*';
    if (efiString) {
      urlString += efiString;
    }
    if(filter) {
      urlString += filter;
    }
    return $http.get(urlString).then(function success(response) {
      return response.data;
    }, function error() {
      console.log('Error! Getting Rows from ' + table);
    });
  };
  gprRestApi.getRowsFilterColumn = function (table, column, value, efi) {
    var urlString = gprRestApi.baseUrl + '/' + table + '?' + column + '=eq.' + value + '&select=*';
    if (efi) {
      urlString += gprRestApi.getFEUString(table);
    }
    return $http.get(urlString).then(function success(response) {
      return response.data;
    }, function error() {
      console.log('Error! Getting Rows from ' + table);
    });
  };
  gprRestApi.getRow = function (table, id, efi) {
    var tableIndex = gprRestApi.getTableIndex(table);
    var urlString = gprRestApi.baseUrl + '/' + table + '?id=eq.' + id + '&select=*';
    if (efi) {
      urlString += gprRestApi.getFEUString(table);
    }
    return $http.get(urlString).then(function success(response) {
      return response.data[0];
    }, function error(response) {
      console.log('Error! Getting Row from ' + table);
    });
  };

  
  gprRestApi.getRowWithFEs = function (table, id, efiString) {
    var urlString = gprRestApi.baseUrl + '/' + table + '?id=eq.' + id + '&select=*';
    urlString = urlString + ',' + efiString;
    return $http.get(urlString).then(function success(response) {
      return response.data[0];
    }, function error(response) {
      console.log('Error! Getting Row from ' + table);
    });
  };
  
  gprRestApi.getRowWithFE_2 = function(table,efiString,filter){
    var urlString = gprRestApi.baseUrl + '/' + table + '?select=*';
    if (efiString) {
      urlString += efiString;
    }
    if(filter) {
      urlString += filter;
    }
    return $http.get(urlString).then(function success(response) {
      return response.data[0];
    }, function error() {
      console.log('Error! Getting Rows from ' + table);
    });
  };

  gprRestApi.updateCreateRow = function (table, data, operation) {
        
    for (var ob in data){
      var attrib = data[ob];
      if(data[ob] === undefined){
        data[ob] = null;
      }
    }

    var req = {};    
    if (operation === 'Update') {
      req.url = gprRestApi.baseUrl + '/' + table + '?id=eq.' + data.id;
    } else if (operation === 'Create') {
      req.url = gprRestApi.baseUrl + '/' + table;
    }
    req.headers = {'Content-Type': 'application/json', 'Prefer': 'return=representation'};
    if (operation === 'Update') {
      req.method = 'PATCH';
    } else if (operation === 'Create') {
      req.method = 'POST';
    }
    req.data = data;
    return $http(req);
  };
  gprRestApi.deleteRow = function (table, id) {
    var req = {};
    req.url = gprRestApi.baseUrl + '/' + table + '?id=eq.' + id;
    req.headers = {};
    req.method = 'DELETE';
    return $http(req);
  };

  gprRestApi.deleteRows = function (table,params){
    var req = {};
    req.url = gprRestApi.baseUrl + '/' + table + params;
    req.headers = {};
    req.method = 'DELETE';
    return $http(req);    
  };
  
  gprRestApi.runRPC = function(procedure,data){
    var req = {};    
    req.url = req.url = gprRestApi.baseUrl + '/rpc/' + procedure;
    req.method = 'POST';
    req.data = data;    
    return $http(req);
  };

  gprRestApi.getRowsAlternate = function (table) {
    var tableIndex = gprRestApi.getTableIndex(table);
    var foreignEntities = [];
    var defer = $q.defer();
    var promises = [];

    angular.forEach(gprRestApi.tables[tableIndex].fields, function (value, key0) {
      if (value.type === 'reference') {
        foreignEntities.push({column: value.name, table: value.references.table});
      } else {
      }
    });

    angular.forEach(gprRestApi.tables[tableIndex].rows, function (row, key1) {
      angular.forEach(foreignEntities, function (field, key2) {
        if (!row[field.column]) {

        } else {
          promises.push(gprRestApi.getRow(field.table, row[field.column], false).then(function success(response) {
            //gprRestApi.tables[tableIndex].rows[key1][field.column + '_'] = response.selectedRow;
          }));
        }
      });
    });

    $q.all(promises).then(function () {

    });
    return defer.promise;
  };

  return gprRestApi;

});
