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
    deviceInfo(host, deviceName, deviceKey, applicationName) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }

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

        var httpServices = this._$http;
        var qServices = this._$q;

        httpServices({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(data) {
            var url = host + "/rest/api/";
            if (applicationName) {
                url += "app/" + applicationName + "/devices/extension-types";
            } else {
                url += "devices/extension-types";
            }
            //get all extension types
            httpServices({
                method: 'GET',
                url: url,
                params: {
                    'device_type': data.type
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(types) {
                if (!types || types.length == 0) {
                    deferred.resolve(data);
                } else {
                    var extensionRequests = [];
                    var url = host + "/rest/api/";
                    if (applicationName) {
                        url += "app/" + applicationName + "/devices/extensions";
                    } else {
                        url += "devices/extensions";
                    }
                    angular.forEach(types, function(type) {
                        // extension types
                        extensionRequests.push(
                            httpServices({
                                method: 'GET',
                                params: {
                                    'device_name': deviceName,
                                    'extension_type': type.name
                                },
                                url: url,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).catch(function(info) {
                                console.warn(info);
                            })
                        );
                    });

                    qServices.all(extensionRequests).then(function(result) {
                        result.forEach(function(extensionItem) {
                            if (extensionItem && extensionItem.data) {
                                data[extensionItem.data.type.name] = extensionItem.data;
                            }
                        });
                        deferred.resolve(data);
                    }, function(errors) {
                        deferred.reject(error);
                    });
                }
            }).error(function(error) {
                deferred.reject(error);
            });

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
    deviceInitInfo(host, application, deviceKey, storeSchema, rangeLevel, otherLevels, fields) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }

        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                'otherLevels': otherLevels,
                'fields': [].concat(fields)
            },
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
    childrenDeviceInitInfo(host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels, fields) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }
        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                relationType: relationType,
                relationDeviceType: relationDeviceType,
                otherLevels: otherLevels,
                fields: [].concat(fields),
                isSame: true
            },
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
    childrenExtensionInitInfo(host, application, deviceKey, storeSchema, relationType, relationDeviceType, extensionType, rangeLevel, otherLevels, fields) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }
        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel + '/' + extensionType, {
            params: {
                relationType: relationType,
                relationDeviceType: relationDeviceType,
                otherLevels: otherLevels,
                fields: [].concat(fields),
                isSame: true
            },
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
    devicesExtensionInitInfo(host, application, devicesKey, storeSchema, extensionType, rangeLevel, otherLevels, fields) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }
        var result = {};
        var promises = [];
        var __http = this._$http;
        angular.forEach(devicesKey, function(deviceKey) {
            if (deviceKey != null) {
                var promise = __http.get(host + '/rest/api/app/' + application + '/store/index/' + deviceKey + '/' + storeSchema + '/' + rangeLevel + '/' + extensionType, {
                    params: {
                        otherLevels: otherLevels,
                        fields: [].concat(fields),
                        isSame: true
                    },
                    // cache: this.deviceStores
                }).then(
                    function(response) {
                        return response.data;
                    },
                    function(response) {
                        console.error(response.data);
                    }
                );
                promises.push(promise);
            }
        });
        // call $q.all on the other side
        return promises;
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
    devicesStoreData(id, host, application, deviceInfo, storeSchema, store, start, end, fields, interval) {
        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
        }

        var start_point = new Date().getTime();
        if (!deviceInfo || deviceInfo.length == 0) {
            return false;
        }

        var devices = "[";

        deviceInfo.forEach(function(device, index) {
            if (index < deviceInfo.length - 1) {
                devices += "\"" + device.name + "\",";
            } else {
                devices += "\"" + device.name + "\"]";
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
            data: {
                "devices": devices,
                "fields": JSON.stringify(fields),
                "start": start,
                "end": end
            }
        }).then(
            function(response) {
                var result = {};
                var data = response.data;
                for (key in data) {
                    var deviceGraphData = $graphDataService.get(key + "/" + store + "/" + id) ? $graphDataService.get(key + "/" + store + "/" + id) : [];
                    var newComeResult = data[key].data;
                    // TODO: make all the lines in same x-axis timeseries
                    result[key] = newComeResult;
                }
                var end_point = new Date().getTime();
                console.info((end_point - start_point) / 1000 + "s");
                deferred.resolve(result);
            },
            function(response) {
                deferred.reject(response.data);
            }
        );
        return deferred.promise;
    }


    deviceStoreData(id, host, application, deviceKey, storeSchema, store, tree, start, end, fields, interval) {

        var ip = this._$location.host();
        var port = this._$location.port();
        var protocol = this._$location.protocol();
        if (!host || host.indexOf("http://localhost:8081") != -1 || host == "") {
            // change it to real sever host + port
            host = protocol + "://" + ip + ":" + port;
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
        var needLoad = true;
        if (!needLoad) {
            // return data
            deferred.resolve($graphDataService.get(deviceKey + "/" + store + "/" + id));
        } else {
            // send request to back-end
            this._$http({
                method: 'GET',
                url: host + '/rest/api/app/' + application + '/store/devices/store/data/' + storeSchema + '/' + store + '?devices=["' + deviceKey + '"]&fields=' + JSON.stringify(fields) + '&start=' + start + '&end=' + end
            }).then(
                function(response) {
                    // only return 1 device data
                    var deviceGraphData = $graphDataService.get(deviceKey + "/" + store + "/" + id) ? $graphDataService.get(deviceKey + "/" + store + "/" + id) : [];
                    var newComeResult = response.data[deviceKey].data;
                    newComeResult.forEach(function(item) {
                        var flag = false;
                        for (var i = 0; i < deviceGraphData.length; i++) {
                            if (deviceGraphData[i].timestamp == item.timestamp) {
                                deviceGraphData[i] = item;
                                flag = true;
                            }
                        }
                        if (!flag) {
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
                    $graphDataService.put(deviceKey + "/" + store + "/" + id, deviceGraphData);
                    deferred.resolve(deviceGraphData);
                },
                function(response) {
                    deferred.reject(response.data);
                }
            );
        }

        return deferred.promise;
    }

    defaultColors() {
        if (!this.colors) {
            this['colors'] =
            ["#FF0000","#ffa700","#022cc3","#1abc9c", "#e8f8f5", "#d1f2eb", "#a3e4d7", "#76d7c4", "#48c9b0", "#1abc9c", "#17a589", "#148f77", "#117864", "#0e6251", "#16a085", "#e8f6f3", "#d0ece7", "#a2d9ce", "#73c6b6", "#45b39d", "#16a085", "#138d75", "#117a65", "#0e6655", "#0b5345", "#2ecc71", "#eafaf1", "#d5f5e3", "#abebc6", "#82e0aa", "#58d68d", "#2ecc71", "#28b463", "#239b56", "#1d8348", "#186a3b", "#27ae60", "#e9f7ef", "#d4efdf", "#a9dfbf", "#7dcea0", "#52be80", "#27ae60", "#229954", "#1e8449", "#196f3d", "#145a32", "#3498db", "#ebf5fb", "#d6eaf8", "#aed6f1", "#85c1e9", "#5dade2", "#3498db", "#2e86c1", "#2874a6", "#21618c", "#1b4f72", "#2980b9", "#eaf2f8", "#d4e6f1", "#a9cce3", "#7fb3d5", "#5499c7", "#2980b9", "#2471a3", "#1f618d", "#1a5276", "#154360", "#9b59b6", "#f5eef8", "#ebdef0", "#d7bde2", "#c39bd3", "#af7ac5", "#9b59b6", "#884ea0", "#76448a", "#633974", "#512e5f", "#8e44ad", "#f4ecf7", "#e8daef", "#d2b4de", "#bb8fce", "#a569bd", "#8e44ad", "#7d3c98", "#6c3483", "#5b2c6f", "#4a235a", "#34495e", "#ebedef", "#d6dbdf", "#aeb6bf", "#85929e", "#5d6d7e", "#34495e", "#2e4053", "#283747", "#212f3c", "#1b2631", "#2c3e50", "#eaecee", "#d5d8dc", "#abb2b9", "#808b96", "#566573", "#2c3e50", "#273746", "#212f3d", "#1c2833", "#17202a", "#f1c40f", "#fef9e7", "#fcf3cf", "#f9e79f", "#f7dc6f", "#f4d03f", "#f1c40f", "#d4ac0d", "#b7950b", "#9a7d0a", "#7d6608", "#f39c12", "#fef5e7", "#fdebd0", "#fad7a0", "#f8c471", "#f5b041", "#f39c12", "#d68910", "#b9770e", "#9c640c", "#7e5109", "#e67e22", "#fdf2e9", "#fae5d3", "#f5cba7", "#f0b27a", "#eb984e", "#e67e22", "#ca6f1e", "#af601a", "#935116", "#784212", "#d35400", "#fbeee6", "#f6ddcc", "#edbb99", "#e59866", "#dc7633", "#d35400", "#ba4a00", "#a04000", "#873600", "#6e2c00", "#e74c3c", "#fdedec", "#fadbd8", "#f5b7b1", "#f1948a", "#ec7063", "#e74c3c", "#cb4335", "#b03a2e", "#943126", "#78281f", "#c0392b", "#f9ebea", "#f2d7d5", "#e6b0aa", "#d98880", "#cd6155", "#c0392b", "#a93226", "#922b21", "#7b241c", "#641e16", "#ecf0f1", "#fdfefe", "#fbfcfc", "#f7f9f9", "#f4f6f7", "#f0f3f4", "#ecf0f1", "#d0d3d4", "#b3b6b7", "#979a9a", "#7b7d7d", "#bdc3c7", "#f8f9f9", "#f2f3f4", "#e5e7e9", "#d7dbdd", "#cacfd2", "#bdc3c7", "#a6acaf", "#909497", "#797d7f", "#626567", "#95a5a6", "#f4f6f6", "#eaeded", "#d5dbdb", "#bfc9ca", "#aab7b8", "#95a5a6", "#839192", "#717d7e", "#5f6a6a", "#4d5656", "#7f8c8d", "#f2f4f4", "#e5e8e8", "#ccd1d1", "#b2babb", "#99a3a4", "#7f8c8d", "#707b7c", "#616a6b", "#515a5a", "#424949"];
            // for (var i = 0; i < 300; i++) {
            //     this.colors.push('#' + (function co(lor) {
            //         return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) &&
            //             (lor.length == 6) ? lor : co(lor);
            //     })(''));
            // }
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
