import $ from "jquery";
import angular from "angular";
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
    }


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
        var qServices = this._$q;

        httpServices({
            method: 'GET',
            url: url
        }).success(function(data) {
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
                }).success(function(extensions) {
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
                }).error(function(error) {
                    deferred.reject(error);
                });
            } else {
                // return device info and stop here.
                deferred.resolve(data);
            }
        }).error(function(error) {
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
        this._$http.get(host + '/' + application + '/' + deviceType + '/' + rangeLevel + '/' + deviceName + '/all', {
            // cache: this.deviceStores
        }).then(
            function(response) {
                deferred.resolve(response.data);
            },
            function(response) {
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
            if(!extensionType || "" === extensionType){
                var result = [];
                angular.forEach(resp.data, function(_device) {
                    result.push({
                        "name": _device.name,
                        "device": _device
                    });
                });
                deferred.resolve(result);
            }else{
                var promises = [];
                angular.forEach(resp.data, function(_device) {
                    if (_device && _device.name) {

                        var deferred = __q.defer();
                        __http({
                            method: 'POST',
                            url: host + '/' + application + '/' + _device.type + '/name/' + _device.name,
                            data: {
                                'extensions': [].concat([extensionType])
                            },
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(extension) {
                            deferred.resolve({
                                "name": _device.name,
                                "extension": extension[extensionType],
                                "device": _device
                            });
                        }).error(function(error) {
                            deferred.reject(error);
                        });
                        promises.push(deferred.promise);
                    }
                });

                // waiting for all request come back
                __q.all(promises).then(function successCallback(_result) {
                    deferred.resolve(_result);
                }, function errorCallback(_data) {
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


        angular.forEach(devices, function(_name) {
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
                }).success(function(extension) {
                    deferred.resolve({
                        "name": _device.name,
                        "extension": extension[extensionType],
                        "device": _device
                    });
                }).error(function(error) {
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
            function(response) {
                // only return 1 device data
                var devicesGraphData = [].concat(response.data);
                deferred.resolve(devicesGraphData);
            },
            function(error) {
                deferred.reject(error);
            }
        );


        return deferred.promise;
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
            function(response) {
                // only return 1 device data
                var deviceGraphData = [];
                var newComeResult = response.data[deviceName].data;
                newComeResult.forEach(function(item) {
                    deviceGraphData.push(item);
                });
                // order by timestamp
                deviceGraphData.sort(function(a, b) {
                    if (a.timestamp > b.timestamp) {
                        return 1;
                    } else if (a.timestamp < b.timestamp) {
                        return -1;
                    }
                    return 0;
                });
                deferred.resolve(deviceGraphData);
            },
            function(error) {
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
            .success(function(response) {
                console.info(response);
                return response;
            });


    }


    autoUpdateGraph(application, device, schema, store, fields, count, callback) {
        var _$interval = this._$interval;
        var _$http = this._$http;
        var fetcher = null;
        this._$http.get('/rest/api/app/' + application + '/store/index/' + device + '/' + schema + '/' + store)
            .success(function(response) {
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
                    }).success(function(graphData) {

                        // start task
                        fetcher = _$interval(function() {
                            _$http.get('/rest/api/app/' + application + '/store/index/' + device + '/' + schema + '/' + store)
                                .success(function(response) {
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
                                        }).success(function(graphData) {
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
