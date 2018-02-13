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
    constructor($http, $q, $cacheFactory, $interval, graphDataService) {
        this._$http = $http;
        this._$q = $q;
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
    deviceInfo(host, deviceName, deviceKey, applicationName) {
        var deferred = this._$q.defer();
        var url = host + "/rest/api/";

        if (applicationName) {
            url += "app/" + applicationName;
        }

        if (deviceName) {
            url += '/devices/' + deviceName
        } else if (deviceKey) {
            url += 'devices?key=' + deviceKey
        }

        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: url,
            contentType: "application/json",
            success: function(data) {
                var url = host + "/rest/api/";
                if (applicationName) {
                    url += "app/" + applicationName + "/devices/extension-types?device_type=";
                } else {
                    url += "devices/extension-types?device_type=";
                }
                $.ajaxSettings.async = false;
                $.ajax({
                    type: 'GET',
                    url: url + data.type,
                    contentType: "application/json",
                    success: function(types) {
                        angular.forEach(types, function(type) {
                            Object.defineProperty(data, type.name, {
                                get: function() {
                                    var result = null;
                                    var url = host + "/rest/api/";
                                    if (applicationName) {
                                        url += "app/" + applicationName + "/devices/extensions?device_name=";
                                    } else {
                                        url += "devices/extensions?device_name=";
                                    }
                                    $.ajaxSettings.async = false;
                                    $.ajax({
                                        type: 'GET',
                                        url: url + this.name + '&extension_type=' + type.name,
                                        contentType: "application/json",
                                        success: function(field) {
                                            result = field;
                                        },
                                        error: function(e) {
                                            deferred.reject(e);
                                        }
                                    });
                                    return result;
                                }
                            });
                        });
                    },
                    error: function(e) {
                        console.log(e.message);
                    }
                });

                deferred.resolve(data);
            },
            error: function(e) {
                deferred.reject(e);
            }
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
    deviceInitInfo(host, application, deviceKey, storeSchema, rangeLevel, otherLevels, fields) {
        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                'otherLevels': otherLevels,
                'fields': [].concat(fields)
            },
            cache: this.deviceStores
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
    childrenDeviceInitInfo(host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels, fields) {
        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                relationType: relationType,
                relationDeviceType: relationDeviceType,
                otherLevels: otherLevels,
                fields: [].concat(fields),
                isSame: true
            },
            cache: this.deviceStores
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


    fillChildrenTree(buckets, tree, showData) {

        if (tree.children[0] != null) {
            fillChildrenTree(buckets, tree.children[0], showData);
        }

        if (tree.children[1] != null) {
            fillChildrenTree(buckets, tree.children[1], showData);
        }

        if (tree.children[0] == null && tree.children[1] == null) {

            angular.forEach(buckets, function(value, key) {
                if (key == tree.id && value != null) {
                    tree.data = value;
                    tree['size'] = value.length;

                    var flag = false;
                    angular.forEach(showData, function(data) {
                        if (data.id == tree.id) {
                            data.data = tree.data;
                            tree['size'] = value.length;
                            flag = true;
                        }
                    });

                    if (!flag) {
                        console.info("error:" + key);
                    }
                }
            });
        }
    }


    fillTree(buckets, tree, showData) {
        if (tree.children[0] != null) {
            fillTree(buckets, tree.children[0], showData);
        }

        if (tree.children[1] != null) {
            fillTree(buckets, tree.children[1], showData);
        }

        if (tree.children[0] == null && tree.children[1] == null) {
            angular.forEach(buckets, function(value, key) {
                if (key == tree.id) {
                    tree.data = value;
                    tree['size'] = value.size;
                    var flag = false;
                    angular.forEach(showData, function(data) {
                        if (data.id == tree.id) {
                            data.data = tree.data;
                            data['size'] = tree.size;
                            flag = true;
                        }
                    });
                    if (!flag) {
                        console.info("error:" + key);
                    }
                }
            });
        }

    }

    calTree(buckets, tree, start, end) {
        if (tree.children[0] != null) {
            calTree(buckets, tree.children[0], start, end);
        }

        if (tree.children[1] != null) {
            calTree(buckets, tree.children[1], start, end);
        }

        if (tree.children[0] == null && tree.children[1] == null) {
            // is overlap?
            if (((start >= tree.start) && start < tree.end) ||
                ((start > tree.start) && start <= tree.end) ||
                ((tree.start >= start) && tree.start < end) ||
                ((tree.start > start) && tree.start <= end)) {
                if (buckets.filter(function(elem) {
                        return elem.id == tree.id
                    }).length == 0) {
                    buckets.push(tree);
                }
            }
        }
    }


    /**
     *
     * @param application
     * @param deviceInfo deviceKey and tree
     * @param storeSchema
     * @param store
     * @param start
     * @param end
     */
    devicesStoreData(id, host, application, deviceInfo, storeSchema, store, start, end, fields) {
        var start_point = new Date().getTime();
        if(!deviceInfo || deviceInfo.length == 0){
            return false;
        }

        var devices = "[";

        deviceInfo.forEach(function(device, index) {
            if (index < deviceInfo.length - 1) {
                devices += "\""+device.name +"\",";
            } else {
                devices += "\""+device.name +"\"]";
            }
        });
        //
        var $graphDataService = this._$graphDataService;
        // new way to get the data without tree index.
        var deferred = this._$q.defer();
        if (start instanceof Date) {
            start = start.getTime();
        }
        if (end instanceof Date) {
            end = end.getTime();
        }
        // send request to back-end // TODO: change it to post
        this._$http({
            method: 'POST',
            url: host + '/rest/api/app/' + application + '/store/devices/store/data/' + storeSchema + '/' + store,
            data:{
                "devices" : devices,
                "fields": JSON.stringify(fields),
                "start": start,
                "end": end
            }
        }).then(
            function(response) {
                var result = {};
                var data = response.data;
                for(key in data){
                    var deviceGraphData = $graphDataService.get(key + "/" + store + "/" + id) ? $graphDataService.get(key + "/" + store+ "/" + id) :[];
                    var newComeResult = data[key].data;
                    newComeResult.forEach(function(item) {
                        var flag = false;
                        for(var i=0;i<deviceGraphData.length;i++){
                            if(deviceGraphData[i].timestamp == item.timestamp){
                                deviceGraphData[i] = item;
                                flag = true;
                            }
                        }
                        if(!flag){
                            // add
                            deviceGraphData.push(item);
                        }
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
                    $graphDataService.put(key + "/" + store + "/" + id, deviceGraphData);
                    result[key] = deviceGraphData;
                }
                var end_point = new Date().getTime();
                console.info((end_point - start_point)/ 1000 + "s");
                deferred.resolve(result);
            },
            function(response) {
                deferred.reject(response.data);
            }
        );
        return deferred.promise;
    }


    deviceStoreData(id, host, application, deviceKey, storeSchema, store, tree, start, end, fields) {
        //
        var $graphDataService = this._$graphDataService;
        // new way to get the data without tree index.
        var deferred = this._$q.defer();
        if (start instanceof Date) {
            start = start.getTime();
        }
        if (end instanceof Date) {
            end = end.getTime();
        }
        // send request to back-end
        this._$http({
            method: 'GET',
            url: host + '/rest/api/app/' + application + '/store/devices/store/data/' + storeSchema + '/' + store + '?devices=["' + deviceKey + '"]&fields='+JSON.stringify(fields)+'&start=' + start + '&end=' + end
        }).then(
            function(response) {
                // only return 1 device data
                var deviceGraphData = $graphDataService.get(deviceKey + "/" + store+ "/" + id) ? $graphDataService.get(deviceKey + "/" + store+ "/" + id) : [];
                var newComeResult = response.data[deviceKey].data;
                newComeResult.forEach(function(item) {
                    var flag = false;
                    for(var i=0;i<deviceGraphData.length;i++){
                        if(deviceGraphData[i].timestamp == item.timestamp){
                            deviceGraphData[i] = item;
                            flag = true;
                        }
                    }
                    if(!flag){
                        // add
                        deviceGraphData.push(item);
                    }
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
                $graphDataService.put(deviceKey + "/" + store+ "/" + id, deviceGraphData);
                deferred.resolve(deviceGraphData);
            },
            function(response) {
                deferred.reject(response.data);
            }
        );

        return deferred.promise;
    }

    defaultColors() {
        if (!this.colors) {
            this['colors'] = [];
            for (var i = 0; i < 300; i++) {
                this.colors.push('#' + (function co(lor) {
                    return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) &&
                        (lor.length == 6) ? lor : co(lor);
                })(''));
            }
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


    static buildFactory($http, $q, $cacheFactory, $interval, graphDataService) {
        dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory, $interval, graphDataService);
        return dataAccessApi.instance;
    }

}

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory', '$interval', 'graphDataService'];

export {
    dataAccessApi as
    default
}
