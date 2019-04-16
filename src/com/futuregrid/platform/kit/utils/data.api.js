import $ from "jquery";
import angular from "angular";
import validator from "./validator"
/**
 * Created by ericwang on 15/06/2016.
 */
class dataAccessApi {

    /**
     * init dataApi
     * @param $http
     * @param $q
     */
    constructor($http, $q, $cacheFactory, $interval, graphDataService, $location) {
        this._$http = $http;
        this._$q = $q;
        this._$location = $location;
        // get cache
        this.indexCache = $cacheFactory('indexCache');
        this.deviceStores = $cacheFactory('deviceStores');
        this._$interval = $interval;
        this._$graphDataService = graphDataService;
        this._validator = validator.buildFactory();
    }

    mergeArraySimple(array1, array2) {
        var result_array = [];
        var arr = array1.concat(array2);
        var len = arr.length;
        var assoc = {};

        while (len--) {
            var item = arr[len];

            if (!assoc[item]) {
                result_array.unshift(item);
                assoc[item] = true;
            }
        }
        return result_array;
    }

    /**
     * reference table jdbc query api
     * @param {*} host restapi url
     * @param {*} application application name
     * @param {*} reference reference name
     * @param {*} page start page number
     * @param {*} size page size
     */
    referenceTableRSQL(host, application, reference, rsql, page, size, isHazelcast, pkColumn, timeout) {

        var deferred = this._$q.defer();
        var promise = deferred.promise;
        var url = "";
        if (isHazelcast) {
            // data stored in cassandra and loaded into hazelcast on startup
            url = host + '/' + application + '/' + reference + '/data/hz/' + size + '/' + page + '/' + pkColumn + ' desc';
        } else {
            // data stored in other relation type database (mysql, postgresql, etc)
            url = host + '/' + application + '/' + reference + '/data/' + size + '/' + page + '/' + pkColumn + ' desc';
        }

        // check rsql, should be a string like name==why;age=gt=30
        if (rsql && rsql != '') {
            url = url + '?' + rsql;
        }

        this._$http({
            method: 'GET',
            url: url,
            timeout: timeout ? timeout : 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            deferred.resolve(response);
        }, function (error) {
            deferred.reject(error);
        });
        return promise;
    };

    getDeviceWithExtensions(host, application, id, type, extensionTypes){
        var deferred = this._$q.defer();
        var deviceObj = {};
        var _this = this;
        _this.getDevice(host, application, id, type).then(function success(resp){
            deviceObj = resp.device;
            _this.getDeviceExtensions(host, application, id, type, extensionTypes).then(function success(resp){
                angular.forEach(resp, (_ext,key) => {
                    deviceObj[key] = _ext;
                });
                deferred.resolve(deviceObj);
            }, function error(error){
                deferred.reject(error);
            });
        }, function error(error){
            deferred.reject(error);
        });

        return deferred.promise;
    }

    /**
     * get device extensions
     * @param {*} host 
     * @param {*} application 
     * @param {*} id 
     * @param {*} type 
     * @param {*} extensionTypes 
     */
    getDeviceExtensions(host, application, id, type, extensionTypes){
        var deferred = this._$q.defer();
        var url = host + "/" + application + "/" + type;

        if (!host || "" === host || !application || "" === application || !type || "" === type) {
            console.error("host url/applicaiton is empty or device type not found~");
            return false;
        }
        // check id (UUID key,  string name)
        if (this._validator.isDeviceKey(id)) {
            // device key
            url += '/key/' + id + '?hasExtensions=true';
        } else {
            // device name
            url += '/name/' + id + '?hasExtensions=true'
        }

        this._$http({
            method: 'POST',
            url: url,
            data: {
                'extensions': [].concat(extensionTypes)
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }


    /**
     * 
     * @param {string} host 
     * @param {string} applicatoin 
     * @param {string} id 
     * @param {string} type 
     */
    getDevice(host, application, id, type) {
        if (!host || "" === host || !application || "" === application || !type || "" === type) {
            console.error("host url/applicaiton is empty or device type not found~");
            return false;
        }

        var deferred = this._$q.defer();
        var url = host + "/" + application + "/" + type;
        // check id (UUID key,  string name)
        if (this._validator.isDeviceKey(id)) {
            // device key
            url += '/key/' + id + '?hasExtensions=true';
        } else {
            // device name
            url += '/name/' + id + '?hasExtensions=true'
        }
        // send request to rest-api
        this._$http({
            method: 'GET',
            url: url
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;



    };

    /**
     * sync using JQuery
     * @param deviceName
     * @param deviceKey
     * @param applicationName
     * @returns {*}
     */
    deviceInfo(host, deviceName, deviceKey, deviceType, application) {

        if (!host || "" === host || !application || "" === application || !deviceType || "" === deviceType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }

        var deferred = this._$q.defer();
        var url = host + "/" + application + "/" + deviceType;

        if (deviceName) {
            url += '/name/' + deviceName + '?hasExtensions=true'
        } else if (deviceKey) {
            url += '/key/' + deviceKey + '?hasExtensions=true';
        }

        var httpServices = this._$http;
        httpServices({
            method: 'GET',
            url: url
        }).success(function (data) {
            if (deviceName) {
                url = host + "/" + application + "/" + deviceType + "/name/" + deviceName;
            } else if (deviceKey) {
                url = host + "/" + application + "/" + deviceType + "/key/" + deviceKey;
            }
            if (data.extensions) {
                var _extensions = [];
                data.extensions.forEach((_extension) => {
                    _extensions.push(_extension.name);
                });
                // call extension service
                //get all extension types
                httpServices({
                    method: 'POST',
                    url: url,
                    data: {
                        'extensions': [].concat(_extensions)
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (extensions) {
                    if (!extensions) {
                        deferred.resolve(data);
                    } else {
                        // all extensions
                        Object.keys(extensions).forEach((key, _index) => {
                            data.extensions.forEach((_ex) => {
                                if (_ex.name == key) {
                                    angular.extend(_ex, extensions[key]);
                                }
                            });
                        });
                        deferred.resolve(data);
                    }
                }).error(function (error) {
                    deferred.reject(error);
                });
            } else {
                // return device info and stop here.
                deferred.resolve(data);
            }
        }).error(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    /**
     *
     * @param application
     * @param deviceKey
     * @param storeSchema
     * @returns {Promise}
     */
    deviceInitInfo(host, application, deviceName, deviceType, rangeLevel) {
        if (!host || "" === host || !application || "" === application || !deviceType || "" === deviceType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }

        var deferred = this._$q.defer();
        this._$http.get(host + '/' + application + '/' + deviceType + '/' + rangeLevel + '/' + deviceName + '/start-last', {
            // cache: this.deviceStores
        }).then(
            function (response) {
                deferred.resolve(response.data);
            },
            function (response) {
                deferred.reject(response.data);
            }
        );
        return deferred.promise;
    }



    /**
     *
     * @param application
     * @param deviceKey
     * @param storeSchema
     * @returns {Promise}
     */
    childrenExtensionInitInfo(host, application, deviceName, deviceType, relationType, relationDeviceType, extensionType) {

        if (!host || "" === host || !application || "" === application || !relationDeviceType || "" === relationDeviceType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }
        var deferred = this._$q.defer();

        var __q = this._$q;
        var __http = this._$http;

        // first get children devices
        this._$http.get(host + '/' + application + '/' + deviceType + '/' + deviceName + '/relation/' + relationType).then(function successCallback(resp) {
            if (!extensionType || "" === extensionType) {
                var result = [];
                angular.forEach(resp.data, function (_device) {
                    result.push({
                        "name": _device.name,
                        "device": _device
                    });
                });
                deferred.resolve(result);
            } else {
                var promises = [];

                var deviceNames = [];
                angular.forEach(resp.data, function (_device) {
                    if (_device && _device.name) {
                        deviceNames.push(_device.name);
                    }
                });

                // send request to get extension for all devices
                __http({
                    method: 'POST',
                    url: host + '/' + application + '/' + relationDeviceType + '/' + extensionType,
                    data: {"timestamp":(new Date()).getTime(),"devices": deviceNames ,"lookupKey":""},
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (extensions) {
                    var _result = [];
                    // compare key
                    angular.forEach(resp.data, function (_device, _index) {
                        var extension = null;
                        extensions.forEach(_ext => {
                            Object.keys(_ext).forEach(function(key,index) {
                                if(_ext[key] instanceof Object && _ext[key].hasOwnProperty('id')){
                                    // found key
                                    if(_device.deviceKey.id === _ext[key].id){
                                        extension = _ext;
                                    }
                                }
                            });
                        });
                        _result.push({
                            "name": _device.name,
                            "extension": extension,
                            "device": _device
                        });
                    });

                    deferred.resolve(_result);
                }).error(function (error) {
                    deferred.reject(error);
                });
            }
        }, function errorCallback(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    /**
     *
     * @param application
     * @param deviceKey
     * @param storeSchema
     * @returns {Promise}
     */
    devicesExtensionInitInfo(host, application, devices, storeSchema, extensionType) {
        if (!host || "" === host || !application || "" === application || !extensionType || "" === extensionType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }

        var result = {};
        var promises = [];
        var __http = this._$http;
        var __q = this._$q;


        angular.forEach(devices, function (_name) {
            if (_name && "" != _name) {
                var deferred = __q.defer();
                __http({
                    method: 'POST',
                    url: host + '/' + application + '/' + deviceType + '/name/' + _name,
                    data: {
                        'extensions': [].concat([extensionType])
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function (extension) {
                    deferred.resolve({
                        "name": _device.name,
                        "extension": extension[extensionType],
                        "device": _device
                    });
                }).error(function (error) {
                    deferred.reject(error);
                });
                promises.push(deferred.promise);
            }
        });
        // call $q.all on the other side
        return promises;
    }


    



    devicesStoreData(id, host, application, devices, deviceType, store, start, end, fields, interval) {

        if (!host || "" === host || !application || "" === application || !deviceType || "" === deviceType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }

        var $graphDataService = this._$graphDataService;
        // new way to get the data without tree index.
        var deferred = this._$q.defer();
        if (start instanceof Date) {
            start = start.getTime();
        }
        if (end instanceof Date) {
            end = end.getTime();
        }
        // send request to back-end    http://localhost:8082/smud/meter/meter_hour
        this._$http({
            method: 'POST',
            url: host + "/" + application + "/" + deviceType + "/" + store,
            data: {
                "start": start,
                "end": end,
                "fields": fields,
                "devices": [].concat(devices),
                "frequency": interval
            },
            header: {
                "content-type": "application/json"
            }
        }).then(
            function (response) {
                // only return 1 device data
                var devicesGraphData = [].concat(response.data);
                deferred.resolve(devicesGraphData);
            },
            function (error) {
                deferred.reject(error);
            }
        );


        return deferred.promise;
    }

    getRelatedDevices(host, application, device, deviceType, relationType, isParent) {
        var deferred = this._$q.defer();
        this._$http({
            url: host + '/' + application + '/' + deviceType + '/' + device + '/relation/' + relationType + '?isParent='+(isParent ? true : false),
            method: 'GET'
        }).then(function successCallback(resp) {
            deferred.resolve(resp);
        }, function errorCallback(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    getStoreData(host, application, devices, deviceType, store, start, end, fields){
        return this.devicesStoreData("_id", host, application, devices, deviceType, store, start, end, fields, 0);
    }


    deviceStoreData(id, host, application, deviceName, deviceType, store, start, end, fields, interval) {

        if (!host || "" === host || !application || "" === application || !deviceType || "" === deviceType) {
            console.error("host url/applicaiton is empty~");
            return false;
        }

        var $graphDataService = this._$graphDataService;
        // new way to get the data without tree index.
        var deferred = this._$q.defer();
        if (start instanceof Date) {
            start = start.getTime();
        }
        if (end instanceof Date) {
            end = end.getTime();
        }
        // send request to back-end    http://localhost:8082/smud/meter/meter_hour
        this._$http({
            method: 'POST',
            url: host + "/" + application + "/" + deviceType + "/" + store,
            data: {
                "start": start,
                "end": end,
                "fields": fields,
                "devices": [deviceName],
                "frequency": interval
            },
            header: {
                "content-type": "application/json"
            }
        }).then(
            function (response) {
                // only return 1 device data
                var deviceGraphData = [];
                var newComeResult = response.data[deviceName].data;
                newComeResult.forEach(function (item) {
                    deviceGraphData.push(item);
                });
                // order by timestamp
                deviceGraphData.sort(function (a, b) {
                    if (a.timestamp > b.timestamp) {
                        return 1;
                    } else if (a.timestamp < b.timestamp) {
                        return -1;
                    }
                    return 0;
                });
                deferred.resolve(deviceGraphData);
            },
            function (error) {
                deferred.reject(error);
            }
        );


        return deferred.promise;
    }

    defaultColors() {
        if (!this.colors) {
            // dark blue, green, orange,pink,red
            var defaultColors = ["#1B2631", "#C0392B", "#884EA0", "#2471A3", "#138D75", "#229954", "#F39C12", "#34495E", "#154360", "#641E16", "#4A235A", "#0B5345", "#7D6608", "#6E2C00"];

            var _tempColors = [];
            // generate 500 colors
            for (var i = 0; i < 500; i++) {
                _tempColors.push(defaultColors[Math.floor(Math.random() * (10))]);
            }
            this['colors'] = defaultColors.concat(_tempColors);
        }
        return this.colors;
    }

    setColors(colors) {
        this.colors = colors;
    }


    /**
     * device id
     * @param id
     */
    healthcheck(application, id) {

        if (id = null || id == "") {
            return;
        }
        this._$http.get('/rest/api/app/' + application + '/docker/healthcheck/reports?id=' + id)
            .success(function (response) {
                console.info(response);
                return response;
            });


    }


    autoUpdateGraph(application, device, schema, store, fields, count, callback) {
        var _$interval = this._$interval;
        var _$http = this._$http;
        var fetcher = null;
        this._$http.get('/rest/api/app/' + application + '/store/index/' + device + '/' + schema + '/' + store)
            .success(function (response) {
                var last = -1;
                var interval = -1;
                if (response.trees && response.trees.length === 1) {
                    interval = response.trees[0].frequency;
                    last = response.trees[0].last.timeKey;
                }
                if (interval != -1) {
                    var start = last - (count * interval);
                    var end = last;
                    // first time
                    _$http.get('/rest/api/app/' + application + '/store/devices/store/data/' + schema + '/' + store, {
                        params: {
                            "devices": JSON.stringify([device]),
                            "fields": JSON.stringify(fields),
                            "start": start,
                            "end": end
                        }
                    }).success(function (graphData) {

                        // start task
                        fetcher = _$interval(function () {
                            _$http.get('/rest/api/app/' + application + '/store/index/' + device + '/' + schema + '/' + store)
                                .success(function (response) {
                                    if (response.trees && response.trees.length === 1) {
                                        last = response.trees[0].last.timeKey;
                                        start = last - (count * interval);
                                        end = last;
                                        _$http.get('/rest/api/app/' + application + '/store/devices/store/data/' + schema + '/' + store, {
                                            params: {
                                                "devices": JSON.stringify([device]),
                                                "fields": JSON.stringify(fields),
                                                "start": start,
                                                "end": end
                                            }
                                        }).success(function (graphData) {
                                            // put the data back
                                            callback(graphData[device], null, interval);
                                        });
                                    }
                                });
                        }, interval);

                        // put the data back
                        callback(graphData[device], fetcher, interval);
                    });
                }
            });

    }


    static buildFactory($http, $q, $cacheFactory, $interval, graphDataService, $location) {
        dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory, $interval, graphDataService, $location);
        return dataAccessApi.instance;
    }

}

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory', '$interval', 'graphDataService', '$location'];

export {
    dataAccessApi as
    default
}