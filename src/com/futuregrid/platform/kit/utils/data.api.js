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
    constructor($http, $q, $cacheFactory) {
        this._$http = $http;
        this._$q = $q;
        // get cache
        this.indexCache = $cacheFactory('indexCache');
        this.deviceStores = $cacheFactory('deviceStores');
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
            success: function (data) {
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
                    success: function (types) {
                        angular.forEach(types, function (type) {
                            Object.defineProperty(data, type.name, {
                                get: function () {
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
                                        success: function (field) {
                                            result = field;
                                        },
                                        error: function (e) {
                                            deferred.reject(e);
                                        }
                                    });
                                    return result;
                                }
                            });
                        });
                    },
                    error: function (e) {
                        console.log(e.message);
                    }
                });

                deferred.resolve(data);
            },
            error: function (e) {
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
            params: {'otherLevels': otherLevels, 'fields': [].concat(fields)}, cache: this.deviceStores
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
    childrenDeviceInitInfo(host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels, fields) {
        var deferred = this._$q.defer();
        this._$http.get(host + '/rest/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                relationType: relationType,
                relationDeviceType: relationDeviceType,
                otherLevels: otherLevels,
                fields:[].concat(fields)
            },
            cache: this.deviceStores
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


    fillChildrenTree(buckets, tree, showData) {

        if (tree.children[0] != null) {
            fillChildrenTree(buckets, tree.children[0], showData);
        }

        if (tree.children[1] != null) {
            fillChildrenTree(buckets, tree.children[1], showData);
        }

        if (tree.children[0] == null && tree.children[1] == null) {

            angular.forEach(buckets, function (value, key) {
                if (key == tree.id && value != null) {
                    tree.data = value;
                    tree['size'] = value.length;

                    var flag = false;
                    angular.forEach(showData, function (data) {
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
            angular.forEach(buckets, function (value, key) {
                if (key == tree.id) {
                    tree.data = value;
                    tree['size'] = value.size;
                    var flag = false;
                    angular.forEach(showData, function (data) {
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
            if (((start >= tree.start) && start < tree.end)
                ||
                ((start > tree.start) && start <= tree.end)
                ||
                ((tree.start >= start) && tree.start < end)
                ||
                ((tree.start > start) && tree.start <= end)) {
                if (buckets.filter(function (elem) {
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
    devicesStoreData(host, application, deviceInfo, storeSchema, store, start, end, fields) {

        var bucketsData = [];
        var devicesNullBucket = [];
        var calTree = this.calTree;
        var fillChildrenTree = this.fillChildrenTree;
        angular.forEach(deviceInfo, function (device, index) {
            var bucketKeys = [];
            calTree(bucketKeys, device.tree, start, end);
            var nullBucket = [];
            // get null buckets
            angular.forEach(bucketKeys, function (bucket) {
                if (bucket.data == null) {
                    nullBucket.push(bucket.id);
                }
            });
            if (nullBucket.length != 0) {
                devicesNullBucket.push({device: device.name, nullBucket: nullBucket});
            }
            bucketsData.push({device: device.name, data: bucketKeys});
        });

        if (devicesNullBucket.length == 0) {
            // get data from rest service
            var deferred = this._$q.defer();
            deferred.resolve(bucketsData);
            return deferred.promise;
        } else {
            // get data from rest service
            var deferred = this._$q.defer();
            this._$http.post(host + '/rest/api/app/' + application + '/store/index/devices/store/data/' + storeSchema + '/' + store,
                {'bucketKeys':JSON.stringify(devicesNullBucket),'fields': JSON.stringify(fields)}
            ).then(
                function (response) {
                    // response.data
                    angular.forEach(response.data, function (deviceData) {

                        var currentBucketShowData = null;
                        angular.forEach(bucketsData, function (showData) {
                            if (showData.device == deviceData.device) {
                                currentBucketShowData = showData.data; //  bucketKeys
                                angular.forEach(deviceInfo, function (device, index) {
                                    if (deviceData.device == device.name) {
                                        fillChildrenTree(deviceData.data, device.tree, currentBucketShowData);
                                    }
                                });
                            }
                        });

                    });
                    // fill bucketKeys
                    deferred.resolve(bucketsData);
                },
                function (response) {
                    deferred.reject(response.data);
                }
            );
            return deferred.promise;
        }


    }


    deviceStoreData(host, application, deviceKey, storeSchema, store, tree, start, end, fields) {
        var fillTree = this.fillTree;
        var calTree = this.calTree;
        var bucketKeys = [];
        calTree(bucketKeys, tree, start, end);
        var nullBucket = [];
        // get null buckets
        angular.forEach(bucketKeys, function (bucket) {
            if (bucket.data == null) {
                nullBucket.push(bucket.id);
            }
        });

        if (nullBucket.length == 0) {
            // send rest request
            var deferred = this._$q.defer();
            deferred.resolve(bucketKeys);
            return deferred.promise;
        } else {
            // send rest request
            var deferred = this._$q.defer();
            this._$http.get(host + '/rest/api/app/' + application + '/store/index/store/data/' + deviceKey + '/' + storeSchema + '/' + store, {
                params: {
                    bucketKeys: nullBucket,
                    fields:[].concat(fields)
                }
            }).then(
                function (response) {
                    fillTree(response.data, tree, bucketKeys);
                    // fill bucketKeys
                    deferred.resolve(bucketKeys);
                },
                function (response) {
                    deferred.reject(response.data);
                }
            );
            return deferred.promise;
        }


    }

    defaultColors() {
        if (!this.colors) {
            this['colors'] = [];
            for (var i = 0; i < 300; i++) {
                this.colors.push('#' + (function co(lor) {
                        return (lor +=
                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)])
                        && (lor.length == 6) ? lor : co(lor);
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
            .success(function (response) {
                console.info(response);
                return response;
            });


    }


    static buildFactory($http, $q, $cacheFactory) {
        dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory);
        return dataAccessApi.instance;
    }

}

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory'];

export {dataAccessApi as default}