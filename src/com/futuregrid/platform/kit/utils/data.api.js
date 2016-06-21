import $ from 'jquery';
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
        this.indexCache = $cacheFactory.get('indexCache');
        this.deviceStores = $cacheFactory.get('deviceStores');
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
        var url = host + "/api/";

        if (applicationName) {
            url += "app/" + applicationName;
        }

        if (deviceName) {
            url += '/devices/parameter/jsonp?name=' + deviceName
        } else if (deviceKey) {
            url += 'devices/parameter/jsonp?key=' + deviceKey
        }

        $.ajaxSettings.async = false;
        $.ajax({
            type: 'GET',
            url: url,
            jsonpCallback: 'jsonCallback',
            async: true,
            contentType: "application/json",
            dataType: 'jsonp',
            success: function (data) {
                var url = host + "/api/";
                if (applicationName) {
                    url += "app/" + applicationName + "/devices/extension-types/jsonp?device_type=";
                } else {
                    url += "devices/extension-types/jsonp?device_type=";
                }
                $.ajaxSettings.async = false;
                $.ajax({
                    type: 'GET',
                    url: url + data.type,
                    async: true,
                    jsonpCallback: 'jsonCallback',
                    contentType: "application/json",
                    dataType: 'jsonp',
                    success: function (types) {
                        angular.forEach(types, function (type) {
                            Object.defineProperty(data, type.name, {
                                get: function () {
                                    var result = null;
                                    var url = host + "/api/";
                                    if (applicationName) {
                                        url += "app/" + applicationName + "/devices/extensions/jsonp?device_name=";
                                    } else {
                                        url += "devices/extensions/jsonp?device_name=";
                                    }
                                    $.ajaxSettings.async = false;
                                    $.ajax({
                                        type: 'GET',
                                        url: url + this.name + '&extension_type=' + type.name,
                                        jsonpCallback: 'jsonCallback',
                                        async: true,
                                        contentType: "application/json",
                                        dataType: 'jsonp',
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
    deviceInitInfo(host, application, deviceKey, storeSchema, rangeLevel, otherLevels) {
        var deferred = this._$q.defer();
        this._$http.jsonp(host + '/api/app/' + application + '/store/index/jsonp/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {'otherLevels': otherLevels, 'callback': 'JSON_CALLBACK'}, cache: this.deviceStores
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
    childrenDeviceInitInfo(host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels) {
        var deferred = this._$q.defer();
        this._$http.jsonp(host + '/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
            params: {
                relationType: relationType,
                relationDeviceType: relationDeviceType,
                otherLevels: otherLevels,
                'callback': 'JSON_CALLBACK'
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
                    tree.data = value.array;
                    tree['size'] = value.size;

                    var flag = false;
                    angular.forEach(showData, function (data) {
                        if (data.id == tree.id) {
                            data.data = tree.data;
                            tree['size'] = value.size;
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
                    tree.data = value.array;
                    tree['size'] = value.size;

                    var flag = false;
                    angular.forEach(showData, function (data) {
                        if (data.id == tree.id) {
                            data.data = tree.data;
                            tree['size'] = value.size;
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
            if (tree.start >= start && tree.end <= end) {
                if (buckets.filter(function (elem) {
                        return elem.id == tree.id
                    }).length == 0) {
                    buckets.push(tree);
                }
            }

            // start inclued in a bucket
            if (start > tree.start && start < tree.end) {
                if (buckets.filter(function (elem) {
                        return elem.id == tree.id
                    }).length == 0) {
                    buckets.push(tree);
                }
            }

            // end inclued in a bucket
            if (end > tree.start && end < tree.end) {
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
    devicesStoreData(host, application, deviceInfo, storeSchema, store, start, end) {

        var bucketsData = [];
        var devicesNullBucket = [];

        angular.forEach(deviceInfo, function (device, index) {
            var bucketKeys = [];
            this.calTree(bucketKeys, device.tree, start, end);
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
            this._$http.jsonp(host + '/api/app/' + application + '/store/index/devices/store/data/jsonp/' + storeSchema + '/' + store, {
                params: {
                    bucketKeys: devicesNullBucket,
                    callback: 'JSON_CALLBACK'
                }
            }).then(
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


    deviceStoreData(host, application, deviceKey, storeSchema, store, tree, start, end) {
        var fillTree = this.fillTree;
        var bucketKeys = [];
        this.calTree(bucketKeys, tree, start, end);
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
            this._$http.jsonp(host + '/api/app/' + application + '/store/index/store/data/jsonp/' + deviceKey + '/' + storeSchema + '/' + store, {
                params: {
                    bucketKeys: nullBucket,
                    callback: 'JSON_CALLBACK'
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


    static buildFactory($http, $q, $cacheFactory) {
        dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory);
        return dataAccessApi.instance;
    }

}

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory'];

export {dataAccessApi as default}