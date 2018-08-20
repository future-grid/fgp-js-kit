/**
 * fgp-kit
 * @version 1.0 - Homepage <http://www.future-grid.com.au>
 * @copyright (c) 2013-2016 Eric.Wang <flexdeviser@gmail.com>
 * @license Apache2. 
 * @overview fgp.kit.js is a useful toolkit for future-grid's clients.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('angular'), require('jquery'), require('dygraphs'), require('ngmap'), require('chart.js')) :
    typeof define === 'function' && define.amd ? define(['angular', 'jquery', 'dygraphs', 'ngmap', 'chart.js'], factory) :
    (global.fgp_kit = factory(global.angular,global.$,global.Dygraph,global.ngmap,global.chartJS));
}(this, (function (angular$1,jquery,Dygraph,ngmap,chart_js) {

angular$1 = 'default' in angular$1 ? angular$1['default'] : angular$1;
Dygraph = 'default' in Dygraph ? Dygraph['default'] : Dygraph;

/**
 * Created by ericwang on 10/06/2016.
 */
var fgpStage = function fgpStage() {
    this.scope = {
        applicationName: "=",
        deviceName: "=",
        server: "=",
        configuration: '=',
        scatterColors: "=",
        standalone: "=",
        interactions: "=",
        drill: "=",
        highlights: "=",
        eventsHandler: "="
    };
    this.replace = true;
    this.restrict = 'A';
};

fgpStage.prototype.template = function template () {
    return '<div id="pageStage" class="wrapper col-md-12 col-xl-12" style="background-color: #fff;height:100%;padding: 0px;">' +
        '</div>';
};

fgpStage.prototype.controller = function controller ($scope, $element, $timeout, $rootScope, $compile, dataService, $interval) {
    $scope.showdata = {};

    if ($scope.scatterColors && $scope.scatterColors.length > 0) {
        dataService.setColors($scope.scatterColors);
    }


    $rootScope['applicationName'] = $scope.applicationName;
    $rootScope['host'] = $scope.server;
    $rootScope['device'] = $scope.deviceName;
    $rootScope['standalone'] = $scope.standalone;


    var graphBindingArray = [];


    function findChild4Repeat(parentId, parentHtmlObj, arrayItems, newId, newScope) {

        for (var i = 0; i < arrayItems.length; i++) {
            if ('edit' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;

                newScope.showdata[id] = arrayItems[i];
                if (parentHtmlObj.attr("repeat-id")) {
                    newScope.repeat = parentHtmlObj.attr("repeat-id");
                }
                if (parentHtmlObj.find('#edit' + parentId).find("#" + id).length == 0) {
                    parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)(newScope));
                }
                findChild4Repeat(arrayItems[i].id, currentItem, arrayItems, newScope);
            } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)(newScope));
                findChild4Repeat(arrayItems[i].id, currentItem, arrayItems, newScope);
            }
        }
    }

    function findChild(parentId, parentHtmlObj, arrayItems, newScope) {

        for (var i = 0; i < arrayItems.length; i++) {
            if ('edit' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)(newScope));
                findChild(arrayItems[i].id, currentItem, arrayItems, newScope);
            } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)(newScope));
                findChild(arrayItems[i].id, currentItem, arrayItems, newScope);
            }
        }
    }

    var newScope = null;
    $scope.$watch('deviceName', function(newVal, oldVal) {
        if (newVal) {
            $element.empty();
            if (newScope) {
                newScope.$destroy();
            }
            newScope = $rootScope.$new(true);
            newScope["showdata"] = {};

            newScope.$on('bindChildChartEvent', function(evt, msg) {
                graphBindingArray.push(msg);
            });

            newScope["interactions"] = $scope.interactions;
            newScope["drill"] = $scope.drill;
            newScope["highlights"] = $scope.highlights;
            newScope["eventsHandler"] = $scope.eventsHandler;

            newScope.$on('bindChildRepeatEvent', function(evt, msg) {
                angular$1.forEach($scope.configuration, function(item) {
                    if (item.id == msg.id) {
                        var items = angular$1.element("body").find("#" + item.id).children();
                        angular$1.forEach(items, function(item_new) {
                            newScope.showdata[item_new.id] = item;
                            var currentElement = angular$1.element(item_new);
                            if (currentElement.attr("dulp")) {
                                var groupItems = angular$1.element("body").find("div[dulp='" + item.id + "']");
                                angular$1.forEach(groupItems, function(dulpItem) {
                                    findChild4Repeat(item.id, angular$1.element(dulpItem), $scope.configuration, item_new.id, newScope);
                                });
                            } else {
                                findChild4Repeat(item.id, currentElement, $scope.configuration, item_new.id, newScope);
                            }
                        });
                    }
                });
            });

            newScope.$on('listStyleEvent', function(evt, param) {
                var config = newScope.showdata[param.id.replace("edit", "")];
                param.callback(config.metadata.data.datasource.style);
            });


            newScope.$on('fetchWidgetMetadataEvent', function(evt, msg) {
                angular$1.forEach(newScope.showdata, function(metadata, key) {
                    if (key == msg.id) {
                        msg.callback({
                            data: metadata,
                            from: 'show'
                        });
                        return;
                    }
                });
            });

            // refersh
            angular$1.forEach($scope.configuration, function(item) {
                if ('workingArea' === item.parent) {
                    var currentItem = angular$1.element(item.html_render);
                    newScope.showdata[item.id] = item;
                    $element.append($compile(currentItem)(newScope));
                    findChild(item.id, currentItem, $scope.configuration, newScope);
                }
            });
            /**
             * get device information
             */
            if ($scope.deviceName && $scope.deviceName != "" && "undefined" != $scope.deviceName) {
                // first time
                sendDeviceData(newScope);
            }
            // all item created;
            $timeout(function() {
                angular$1.forEach(graphBindingArray, function(graph) {
                    newScope.$broadcast('bindFatherGraphEvent', {
                        parent: graph.graphs,
                        children: graph.children
                    });
                });
            });
        }
    });


    var sendDeviceData = function(newScope) {
        dataService.deviceInfo($scope.server, $scope.deviceName, null, $scope.applicationName).then(function(data) {
            // send device info to all widget
            $timeout(function() {
                newScope.$broadcast('deviceInfoEvent', {
                    device: data,
                    from: 'application'
                });
            });
        });
    };
};
fgpStage.buildFactory = function buildFactory () {
    fgpStage.instance = new fgpStage();
    return fgpStage.instance;
};

/**
 * Created by ericwang on 15/06/2016.
 */
var dataAccessApi = function dataAccessApi($http, $q, $cacheFactory, $interval, graphDataService, $location) {
    this._$http = $http;
    this._$q = $q;
    this._$location = $location;
    // get cache
    this.indexCache = $cacheFactory('indexCache');
    this.deviceStores = $cacheFactory('deviceStores');
    this._$interval = $interval;
    this._$graphDataService = graphDataService;
};


/**
 * sync using JQuery
 * @param deviceName
 * @param deviceKey
 * @param applicationName
 * @returns {*}
 */
dataAccessApi.prototype.deviceInfo = function deviceInfo (host, deviceName, deviceKey, applicationName) {
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
        url += '/devices/' + deviceName;
    } else if (deviceKey) {
        url += 'devices?key=' + deviceKey;
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
                angular$1.forEach(types, function(type) {
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
};

/**
 *
 * @param application
 * @param deviceKey
 * @param storeSchema
 * @returns {Promise}
 */
dataAccessApi.prototype.deviceInitInfo = function deviceInitInfo (host, application, deviceKey, storeSchema, rangeLevel, otherLevels, fields) {
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
};


/**
 *
 * @param application
 * @param deviceKey
 * @param storeSchema
 * @returns {Promise}
 */
dataAccessApi.prototype.childrenDeviceInitInfo = function childrenDeviceInitInfo (host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels, fields) {
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
};


/**
 *
 * @param application
 * @param deviceKey
 * @param storeSchema
 * @returns {Promise}
 */
dataAccessApi.prototype.childrenExtensionInitInfo = function childrenExtensionInitInfo (host, application, deviceKey, storeSchema, relationType, relationDeviceType, extensionType, rangeLevel, otherLevels, fields) {
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
};

/**
 *
 * @param application
 * @param deviceKey
 * @param storeSchema
 * @returns {Promise}
 */
dataAccessApi.prototype.devicesExtensionInitInfo = function devicesExtensionInitInfo (host, application, devicesKey, storeSchema, extensionType, rangeLevel, otherLevels, fields) {
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
    angular$1.forEach(devicesKey, function(deviceKey) {
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
};



dataAccessApi.prototype.fillChildrenTree = function fillChildrenTree (buckets, tree, showData) {

    if (tree.children[0] != null) {
        fillChildrenTree(buckets, tree.children[0], showData);
    }

    if (tree.children[1] != null) {
        fillChildrenTree(buckets, tree.children[1], showData);
    }

    if (tree.children[0] == null && tree.children[1] == null) {

        angular$1.forEach(buckets, function(value, key) {
            if (key == tree.id && value != null) {
                tree.data = value;
                tree['size'] = value.length;

                var flag = false;
                angular$1.forEach(showData, function(data) {
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
};


dataAccessApi.prototype.fillTree = function fillTree (buckets, tree, showData) {
    if (tree.children[0] != null) {
        fillTree(buckets, tree.children[0], showData);
    }

    if (tree.children[1] != null) {
        fillTree(buckets, tree.children[1], showData);
    }

    if (tree.children[0] == null && tree.children[1] == null) {
        angular$1.forEach(buckets, function(value, key) {
            if (key == tree.id) {
                tree.data = value;
                tree['size'] = value.size;
                var flag = false;
                angular$1.forEach(showData, function(data) {
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

};

dataAccessApi.prototype.calTree = function calTree (buckets, tree, start, end) {
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
};


/**
 *
 * @param application
 * @param deviceInfo deviceKey and tree
 * @param storeSchema
 * @param store
 * @param start
 * @param end
 */
dataAccessApi.prototype.devicesStoreData = function devicesStoreData (id, host, application, deviceInfo, storeSchema, store, start, end, fields, interval) {
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
};


dataAccessApi.prototype.deviceStoreData = function deviceStoreData (id, host, application, deviceKey, storeSchema, store, tree, start, end, fields, interval) {

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
};

dataAccessApi.prototype.defaultColors = function defaultColors () {
    if (!this.colors) {
        // dark blue, green, orange,pink,red
        var defaultColors = [ "#1B2631","#C0392B","#884EA0","#2471A3","#138D75","#229954","#F39C12","#34495E","#154360", "#641E16", "#4A235A", "#0B5345", "#7D6608", "#6E2C00"];
        this['colors'] = defaultColors;
    }
    return this.colors;
};

dataAccessApi.prototype.setColors = function setColors (colors) {
    this.colors = colors;
};


/**
 * device id
 * @param id
 */
dataAccessApi.prototype.healthcheck = function healthcheck (application, id) {

    if (id = null || id == "") {
        return;
    }
    this._$http.get('/rest/api/app/' + application + '/docker/healthcheck/reports?id=' + id)
        .success(function(response) {
            console.info(response);
            return response;
        });


};


dataAccessApi.prototype.autoUpdateGraph = function autoUpdateGraph (application, device, schema, store, fields, count, callback) {
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

};


dataAccessApi.buildFactory = function buildFactory ($http, $q, $cacheFactory, $interval, graphDataService, $location) {
    dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory, $interval, graphDataService, $location);
    return dataAccessApi.instance;
};

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory', '$interval', 'graphDataService', '$location'];

/**
 * Created by ericwang on 15/06/2016.
 */
var fgpWidgetContainer = function fgpWidgetContainer() {
    this.restrict = 'E';
    this.scope = {
        interactions: "=",
        drill: "=",
        highlights: "=",
        eventsHandler:"="
    };
};

fgpWidgetContainer.prototype.template = function template (element, attrs) {
    var flag = attrs.hasOwnProperty("shown");
    var showTitle = attrs.hasOwnProperty("showtitle");
    var element_id = attrs.id;
    var dom_show = '<div class="" id="' + element_id + '" style="margin-top:10px;margin-bottom:10px;">' +
        '<div class="{{css.width}}" style="padding: 0px;">' +
        '<div class="panel" style="border-color:{{css.border.color || \'#fff\'}};">' +
        '<div class="panel-heading" style="background-color: {{css.title.color || \'#fff\'}}">{{css.title.text}}</div>' +
        '<div class="panel-body" id="edit' + element_id + '" style="padding:0px;min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"></div>' +
        '</div>' +
        '</div></div>';
    var dom_show_notitle = '<div class="" id="' + element_id + '" style="margin-top:2px;margin-bottom:2px;">' +
        '<div class="{{css.width}}" style="margin-top:10px;margin-bottom:10px;">' +
        '<div style="border-color:{{css.border.color || \'#fff\'}};">' +
        '<div id="edit' + element_id + '" style="min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"></div>' +
        '</div>' +
        '</div></div>';

    // show or design
    if (flag) {
        if (showTitle) {
            return dom_show;
        } else {
            // without title
            return dom_show_notitle;
        }
    }

};

fgpWidgetContainer.prototype.controller = function controller ($scope, $element, dataService, $rootScope, $timeout) {
    // only show
    var element_id = $element.attr("id");


    var widgetData = null;

    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });


    var metadata = widgetData.data.metadata;
    $scope.css = {};
    $scope.css["color"] = metadata.css.color;
    $scope.css["width"] = metadata.css.width;
    $scope.css["border"] = {};
    $scope.css["border"]["color"] = metadata.css.border.color;
    $scope.css["background"] = {};
    $scope.css["background"]["color"] = metadata.css.background.color;
    $scope.css["title"] = metadata.css.title;
    $scope.css["title"]["color"] = metadata.css.title.color;
    $scope.css["title"]["show"] = metadata.css.title.show;

    $scope.data = {};
    if (metadata.data) {
        $scope.data["source"] = metadata.data.source;
        if ($scope.data && $scope.data.source.device && $scope.data.source.device != -1) {

            if ($scope.data.source.device) {
                /**
                 * get device information
                 */
                dataService.deviceInfo($rootScope.host, JSON.parse($scope.data.source.device).name, null, $rootScope.applicationName).then(function (data) {
                    // send device info to all widget
                    $timeout(function () {
                        $rootScope.$broadcast('deviceInfoEvent', {device: data, from: element_id});
                    });
                });
            }

        }
    }

};


fgpWidgetContainer.buildFactory = function buildFactory () {
    fgpWidgetContainer.instance = new fgpWidgetContainer();
    return fgpWidgetContainer.instance;
};

fgpWidgetContainer.$inject = [];

/**
 * Created by ericwang on 15/06/2016.
 */
var fgpWidgetGraph = function fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile, $q) {
    this.restrict = 'E';
    this.scope = {
        interactions: "=",
        drill: "=",
        highlights: "=",
        eventsHandler: "="
    };
    this.$timeout = $timeout;
    this._dataService = dataService;
    this._$interval = $interval;
    this._$q = $q;
};

fgpWidgetGraph.prototype.template = function template (element, attrs) {
    var flag = attrs.hasOwnProperty("shown");
    if (flag) {
        var dom_loading = '<div ng-show="loadingShow" id="loading_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner">' +
            '<div class="rect1"></div>' +
            '<div class="rect2"></div>' +
            '<div class="rect3"></div>' +
            '<div class="rect4"></div>' +
            '<div class="rect5"></div>' +
            '</div></div>';


        var dom_legend = '<li>{{legendText_device_name}}</li><li>{{legendText_datetime}}</li><li><label style="color: {{legendColor}}">{{legendText_column}}</label>:{{legendText_value}}</li>';

        var dom_empty_data = '<div ng-show="emptyDataShow" id="emptydata_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner" style="width: 100%;">' +
            '<h1>Empty Data!</h1>' +
            '</div></div>';

        var dom_alert_info = '<span class="label label-warning" ng-show="alertMessage" style="color: #000;">{{alertMessage}}</span>';

        var dom_datetime_interval = '<div ng-show="rangeSelectorBar" class="dropdown"> <button class="btn btn-info dropdown-toggle badge" type="button" data-toggle="dropdown">{{currentIntervalChoosed.name}}<span class="caret"></span></button> <ul class="dropdown-menu" style="font-size:12px;"><li ng-repeat="interval in dateTimeIntervals"><a href="javascript:;" ng-click="changeInterval(interval)">{{interval.name}}</a></li></ul> </div>';

        //selectControl
        var dom_rect = '<div>' +

            '</div>';


        var dom_series_list = '<div ng-show="currentView === 1" class="dropdown"> <button class="btn btn-warning dropdown-toggle badge" type="button" data-toggle="dropdown">Devices<span class="caret"></span></button> <ul class="dropdown-menu" style="font-size:12px;height:auto;max-height:300px;overflow-x:hidden;"><li ng-repeat="device in childrenDevices"><input type="checkbox" ng-click="showOrHideDevice(device)" ng-checked="device.show"/>{{device[childrenDeviceNameColumn]}}</li></ul> </div>';


        var dom_real_time_grap = '<div class="modal fade " id="real_time_graph_' + attrs.id + '" role="dialog">' +
            '<div class="modal-dialog modal-lg">' +
            '<div class="modal-content">' +
            '<div class="col-md-12"  style="padding-top:3px;height: 1px;background-color: #0e90d2;" ng-style="{ \'width\': completionPercent + \'%\' }"></div>' +
            '<div class="modal-body" style="width: 100%;height: 300px;">' +
            '<div class="real-time-graph" style="width: 100%;height: 100%"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        var html = '<div id="legendbox' + attrs.id + '" ng-show="legendText" ng-style="{top:legendTop,left:legendLeft}" style="border-radius:10px;background-color:#ffffff;position: absolute;border: 1px solid {{legendColor}};-moz-box-shadow: 5px 5px 5px #888888;box-shadow: 5px 5px 5px #888888;z-index: 99999999;margin-right: 5px;"><ul style="list-style: none;list-style-position: inside;text-align: right;">' + dom_legend + '</ul></div><div class="{{css.width}}"><div class="col-md-12" style="padding:0px;height:{{css.height}}px;-webkit-user-select: none; /* Chrome all / Safari all */  -moz-user-select: none; /* Firefox all */  -ms-user-select: none; /* IE 10+ */  user-select: none;"><div class="row"><div class="col-md-12"><a class="tooltips btn btn-xs btn-info badge" href="javascript:;" ng-hide="interactions.graphs.btns.scatter == \'hide\'" style="float: right;margin-right: 10px;" ng-click="currentView = -currentView"><i class="glyphicon glyphicon-transfer"></i><span>Scatter View</span></a><div id="buttons_area" style=""></div><a ng-show="false" class="tooltips btn btn-xs btn-info badge" style="float: right;margin-right: 10px;" ng-click="showRealTimeGraph()" data-toggle="modal"><span>Auto Update</span><i class="glyphicon glyphicon-random"></i></a><a ng-show="selectControl" class="tooltips btn btn-xs btn-info badge" style="float: right;margin-right: 10px;" ng-click="switchSelectFeature()"><span>Select On Graph</span><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a><div style="float: right; margin-right: 10px;">' + dom_series_list + '</div><div style="float: right; margin-right: 10px;">' + dom_datetime_interval + '</div><div ng-hide="true" class="checkbox" style="float: right;margin-right: 10px; margin-bottom: 5px; margin-top: 0;" ng-model="fixInterval" ng-click="fixInterval=!fixInterval"><label><input type="checkbox" ng-model="fixInterval" ng-clicked="fixInterval" ng-change="fixGraphWithGap_click()"/>fixed interval</label></div><div style="float: right; margin-right: 10px;"><label class="label-inline" ng-repeat="item in intevals.device"><span class="badge" style="background-color: {{ item.name == currentIntervalName ? (locked_interval.name == item.name ? \'#e57432;\':\'#009900;\') : (locked_interval.name == item.name ? \'#e57432;\':\'\') }}" ng-click="lock(item)">{{item.name}}</span></label></div><div style="float: right; margin-right: 10px;">' + dom_alert_info + '</div></div></div><div style="position: relative;width: 100%;height:100%;"><div style="position: absolute;left:25px;z-index: 999;" ng-show="basicInfo.zoom" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVULeft()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDLeft()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVLeft()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVLeft()"><i class="fa fa-minus" aria-hidden="true"></i></button></div><div class="line-chart-graph" style="width: 100%;height:100%;" ng-dblclick="drillDown()" ng-click="singleClickEventHandler()"></div><div style="position: absolute;right:-15px;top:0px;z-index: 999;" ng-show="checkY2Btns()" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVURight()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDRight()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVRight()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVRight()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div>' + dom_loading + dom_empty_data + '<div class="row"><div class="col-md-12" style="min-height: 30px;"></div><div class="col-md-6" style="text-align: left;" ng-show="rangeSelectorBar">{{rangeSelectorBar.xAxisRange()[0] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-6" style="text-align: right;" ng-show="rangeSelectorBar">{{rangeSelectorBar.xAxisRange()[1] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-12" style="min-height: 40px;position: relative"><div class="btn-group btn-group-xs" role="group" style="position: absolute;left: 20px;" ng-show="basicInfo.range_show"><button type="button" class="btn btn-default" ng-click="btnpanleft()"><i class="fa fa-arrow-left" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnpanright()"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div><div class="range-selector-bar" style="height: 0px;margin-top: 30px;width: 100%;position: absolute;"></div><div class="btn-group btn-group-xs" role="group" style="position: absolute;right: -5px;" ng-show="basicInfo.range_show"><button type="button" class="btn btn-default" ng-click="btnzoomin()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnzoomout()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div></div></div>' + dom_real_time_grap;

        return html;
    }
};

fgpWidgetGraph.prototype.link = function link (scope, element, attrs) {
    scope['defaultColors'] = this._dataService.defaultColors();
    var dataService = this._dataService;
    var _$interval = this._$interval;
    scope.status = true;
    var timeOut = this.$timeout;
    scope.completionPercent = 0;
    scope.graphId = attrs.id;
    this.$timeout(function() {
        var getData = function(numSeries, numRows, name) {
            var result = {
                labels: null,
                data: null
            };
            var data = [];
            var labels = [];
            //init date
            var initDate = new Date("2014/01/01 00:00:00");
            for (var j = 0; j < numRows; ++j) {
                data[j] = [new Date(initDate.getTime() + 900000)];
            }
            for (var i = 0; i < numSeries; ++i) {
                labels.push(name + i);
                var val = 0;
                for (var j = 0; j < numRows; ++j) {
                    val += Math.random() - 0.5;
                    data[j][i + 1] = val;
                }
            }
            result.labels = labels;
            result.data = data;
            return result;
        };


        var sampleData = getData(1, 10, 'Device');

        function movePan(event, g, context, side) {
            context.dragEndX = Dygraph.dragGetX_(event, context);
            context.dragEndY = Dygraph.dragGetY_(event, context);
            // y-axis scaling is automatic unless this is a full 2D pan.
            if (context.is2DPan) {
                var pixelsDragged = context.dragEndY - context.dragStartY;
                // Adjust each axis appropriately.
                if (side == "l") {
                    var axis = g.axes_[0];
                    var axis_data = context.axes[0];
                    var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;
                    var boundedValue = context.boundedValues ? context.boundedValues[0] : null;
                    // In log scale, maxValue and minValue are the logs of those values.
                    var maxValue = axis_data.initialTopValue + unitsDragged;
                    if (boundedValue) {
                        maxValue = Math.min(maxValue, boundedValue[1]);
                    }
                    var minValue = maxValue - axis_data.dragValueRange;
                    if (boundedValue) {
                        if (minValue < boundedValue[0]) {
                            // Adjust maxValue, and recompute minValue.
                            maxValue = maxValue - (minValue - boundedValue[0]);
                            minValue = maxValue - axis_data.dragValueRange;
                        }
                    }
                    if (g.attributes_.getForAxis("logscale", 0)) {
                        axis.valueWindow = [Math.pow(Dygraph.LOG_SCALE, minValue),
                            Math.pow(Dygraph.LOG_SCALE, maxValue)
                        ];
                        axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                            Math.pow(Dygraph.LOG_SCALE, maxValue)
                        ];
                    } else {
                        axis.valueWindow = [minValue, maxValue];
                        axis.valueRange = [minValue, maxValue];
                    }
                } else if (side == 'r') {
                    var axis = g.axes_[1];
                    var axis_data = context.axes[1];
                    var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;

                    var boundedValue = context.boundedValues ? context.boundedValues[1] : null;

                    // In log scale, maxValue and minValue are the logs of those values.
                    var maxValue = axis_data.initialTopValue + unitsDragged;
                    if (boundedValue) {
                        maxValue = Math.min(maxValue, boundedValue[1]);
                    }
                    var minValue = maxValue - axis_data.dragValueRange;
                    if (boundedValue) {
                        if (minValue < boundedValue[0]) {
                            // Adjust maxValue, and recompute minValue.
                            maxValue = maxValue - (minValue - boundedValue[0]);
                            minValue = maxValue - axis_data.dragValueRange;
                        }
                    }
                    if (g.attributes_.getForAxis("logscale", 1)) {
                        axis.valueWindow = [Math.pow(Dygraph.LOG_SCALE, minValue),
                            Math.pow(Dygraph.LOG_SCALE, maxValue)
                        ];
                        axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                            Math.pow(Dygraph.LOG_SCALE, maxValue)
                        ];
                    } else {
                        axis.valueWindow = [minValue, maxValue];
                        axis.valueRange = [minValue, maxValue];
                    }
                } else {
                    var minDate = context.initialLeftmostDate -
                        (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
                    if (context.boundedDates) {
                        minDate = Math.max(minDate, context.boundedDates[0]);
                    }
                    var maxDate = minDate + context.dateRange;
                    if (context.boundedDates) {
                        if (maxDate > context.boundedDates[1]) {
                            // Adjust minDate, and recompute maxDate.
                            minDate = minDate - (maxDate - context.boundedDates[1]);
                            maxDate = minDate + context.dateRange;
                        }
                    }
                    var zoomRange = g.xAxisZoomRange;

                    if (!zoomRange) {
                        return false;
                    }

                    if (g.xAxisZoomRange[0] instanceof Date) {
                        zoomRange[0] = g.xAxisZoomRange[0].getTime();
                    }
                    if (g.xAxisZoomRange[1] instanceof Date) {
                        zoomRange[1] = g.xAxisZoomRange[1].getTime();
                    }

                    if (minDate < zoomRange[0] || maxDate > zoomRange[1]) {
                        return;
                    }

                    if (g.getOptionForAxis("logscale", "x")) {
                        g.dateWindow_ = [Math.pow(Dygraph.LOG_SCALE, minDate),
                            Math.pow(Dygraph.LOG_SCALE, maxDate)
                        ];
                    } else {
                        g.dateWindow_ = [minDate, maxDate];
                    }
                }
            }
            g.drawGraph_(true);
        }


        function offsetToPercentage(g, offsetX, offsetY) {
            // This is calculating the pixel offset of the leftmost date.
            var xOffset = g.toDomCoords(g.xAxisRange()[0], null)[0];
            var yar0 = g.yAxisRange(0);

            // This is calculating the pixel of the higest value. (Top pixel)
            var yOffset = g.toDomCoords(null, yar0[1])[1];

            // x y w and h are relative to the corner of the drawing area,
            // so that the upper corner of the drawing area is (0, 0).
            var x = offsetX - xOffset;
            var y = offsetY - yOffset;

            // This is computing the rightmost pixel, effectively defining the
            // width.
            var w = g.toDomCoords(g.xAxisRange()[1], null)[0] - xOffset;

            // This is computing the lowest pixel, effectively defining the height.
            var h = g.toDomCoords(null, yar0[0])[1] - yOffset;

            // Percentage from the left.
            var xPct = w == 0 ? 0 : (x / w);
            // Percentage from the top.
            var yPct = h == 0 ? 0 : (y / h);

            // The (1-) part below changes it from "% distance down from the top"
            // to "% distance up from the bottom".
            return [xPct, (1 - yPct)];
        }


        function zoom(g, zoomInPercentage, xBias, yBias, direction, side) {

            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }

            function adjustAxis(axis, zoomInPercentage, bias) {
                var delta = axis[1] - axis[0];
                var increment = delta * zoomInPercentage;
                var foo = [increment * bias, increment * (1 - bias)];
                return [axis[0] + foo[0], axis[1] - foo[1]];
            }

            xBias = xBias || 0.5;
            yBias = yBias || 0.5;
            var yAxes = g.axes_;
            var newYAxes = [];
            for (var i = 0; i < g.numAxes(); i++) {
                if (yAxes[i].valueWindow) {
                    newYAxes[i] = adjustAxis(yAxes[i].valueWindow, zoomInPercentage, yBias);
                } else {
                    newYAxes[i] = adjustAxis(yAxes[i].valueRange, zoomInPercentage, yBias);
                }
            }
            if ('v' == direction) {
                if ('l' == side) {
                    yAxes[0]['valueRange'] = newYAxes[0];
                    yAxes[0]['valueWindow'] = newYAxes[0];
                    if (scope.currentInitScaleLevelLeftConf) {
                        scope.currentInitScaleLevelLeftConf.range = newYAxes[0];
                    }
                } else if ('r' == side && g.numAxes() == 2) {
                    yAxes[1]['valueRange'] = newYAxes[1];
                    yAxes[1]['valueWindow'] = newYAxes[1];
                    if (scope.currentInitScaleLevelRightConf) {
                        scope.currentInitScaleLevelRightConf.range = newYAxes[1];
                    }
                }
                g.drawGraph_(true);
            } else {
                var ranges = [];
                angular$1.forEach(g.xAxisRange(), function(range) {
                    if (range instanceof Date) {
                        ranges.push(range.getTime());
                    } else {
                        ranges.push(range);
                    }
                });

                var newZoomRange = adjustAxis(ranges, zoomInPercentage, xBias);
                // do not bigger than range data
                var zoomRange = [];
                if (g.hasOwnProperty("xAxisZoomRange") && g.xAxisZoomRange) {
                    zoomRange[0] = g.xAxisZoomRange[0];
                    zoomRange[1] = g.xAxisZoomRange[1];
                } else {
                    zoomRange[0] = g.xAxisExtremes()[0];
                    zoomRange[1] = g.xAxisExtremes()[1];
                }
                if (newZoomRange[0] < zoomRange[0] && newZoomRange[1] > zoomRange[1]) {
                    return;
                } else if (newZoomRange[0] >= newZoomRange[1]) {
                    return;
                } else if (newZoomRange[0] <= zoomRange[0] && newZoomRange[1] < zoomRange[1]) {
                    if(scope.memoryVisibility && scope.memoryVisibility.length == 0 && scope.hp && scope.hp == true){
                        scope.memoryVisibility = g.getOption("visibility");
                        var vis = g.getOption("visibility");
                        var _tempVi = [];
                        vis.forEach(function(v,_index){
                            _tempVi[_index] = false;
                        });
                        g.updateOptions({
                            dateWindow: newZoomRange,
                            visibility:_tempVi
                        },false);
                    }else{
                        g.updateOptions({
                            dateWindow: newZoomRange
                        },false);
                    }

                } else if (newZoomRange[0] > zoomRange[0] && newZoomRange[1] >= zoomRange[1]) {
                    if(scope.memoryVisibility && scope.memoryVisibility.length == 0 && scope.hp && scope.hp == true){
                        scope.memoryVisibility = g.getOption("visibility");
                        var vis = g.getOption("visibility");
                        var _tempVi = [];
                        vis.forEach(function(v,_index){
                            _tempVi[_index] = false;
                        });
                        g.updateOptions({
                            dateWindow: newZoomRange,
                            visibility:_tempVi
                        },false);
                    }else{
                        g.updateOptions({
                            dateWindow: newZoomRange
                        },false);
                    }
                } else {
                    if(scope.memoryVisibility && scope.memoryVisibility.length == 0 && scope.hp && scope.hp == true){
                        scope.memoryVisibility = g.getOption("visibility");
                        var vis = g.getOption("visibility");
                        var _tempVi = [];
                        vis.forEach(function(v,_index){
                            _tempVi[_index] = false;
                        });
                        g.updateOptions({
                            dateWindow: newZoomRange,
                            visibility:_tempVi
                        },false);
                    }else{
                        g.updateOptions({
                            dateWindow: newZoomRange
                        },false);
                    }
                }
            }
        }


        var canScroll = false;

        var timer = null;
        var mouseOverHandler = function(e, g, context) {
            //
            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }
            //
            if (timer != null) {
                timeOut.cancel(timer);
            }
            timer = timeOut(function() {
                timer=null;
                canScroll = true;
            }, 1000);
        };


        var mouseEnterHandler = function(e, g, context) {
            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }
            //
            if (timer != null) {
                timeOut.cancel(timer);
            }
            timer = timeOut(function() {
                timer=null;
                canScroll = true;
            }, 1000);
        };

        var mouseOutHandler = function(e, g, context) {
            // set flag to false
            if (timer != null) {
                timeOut.cancel(timer);
            }
            canScroll = false;
        };

        var scroll = function(e, g, context) {

            if ((scope.basicInfo && !scope.basicInfo.zoom) || !canScroll) {
                return;
            }

            var normal;

            if (e instanceof WheelEvent) {
                normal = e.detail ? e.detail * -1 : e.deltaY / 40;
            } else {
                normal = e.detail ? e.detail * -1 : e.wheelDelta / 40;
            }

            // For me the normalized value shows 0.075 for one click. If I took
            // that verbatim, it would be a 7.5%.
            var percentage = normal / 50;

            if (!(e.offsetX && e.offsetY)) {
                e.offsetX = e.layerX - e.target.offsetLeft;
                e.offsetY = e.layerY - e.target.offsetTop;
            }
            var percentages = offsetToPercentage(g, e.offsetX, e.offsetY);
            var xPct = percentages[0];
            var yPct = percentages[1];
            //
            if (e.offsetX <= (g.plotter_.area.x)) {
                // console.info("v", "l")
                // left zoom
                zoom(g, percentage, xPct, yPct, 'v', 'l');
            } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                // right zoom
                // console.info("v", "r")
                zoom(g, percentage, xPct, yPct, 'v', 'r');
            } else {
                // middle zoom
                if (scope.basicInfo && scope.basicInfo.range_show) {
                    //
                    zoom(g, percentage, xPct, yPct, 'h', null);
                }
            }
            Dygraph.cancelEvent(e);
            timeOut(function() {
                scope.chartDateWindow = g.xAxisRange();
            });
        };

        var firstPoint = null;
        var mousedownHandler = function(e, g, context) {
            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }
            context.initializeMouseDown(e, g, context);
            firstPoint = e.clientX;
            Dygraph.startPan(e, g, context);
        };
        var mousemoveHandler = function(e, g, context) {
            if (context.isPanning) {
                if (e.offsetX <= (g.plotter_.area.x)) {
                    movePan(e, g, context, 'l');
                } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                    movePan(e, g, context, 'r');
                } else {
                    if(scope.memoryVisibility && scope.memoryVisibility.length == 0 && scope.hp && scope.hp == true){
                        scope.memoryVisibility = g.getOption("visibility");
                        var _tempVi = [];
                        g.getOption("visibility").forEach(function(_v, _index){
                            _tempVi[_index] = false;
                        });
                        g.updateOptions({"visibility":_tempVi});
                    }
                    movePan(e, g, context, 'h');
                }
                timeOut(function() {
                    scope.chartDateWindow = scope.currentChart.xAxisRange();
                });
            }
        };

        var mouseupHandler = function(e, g, context) {
            if (context.isPanning) {
                Dygraph.endPan(e, g, context);
            }

            canScroll = true;
        };

        var interactionModel = {
            'mousewheel': scroll,
            'DOMMouseScroll': scroll,
            'wheel': scroll,
            'mousedown': mousedownHandler,
            'mousemove': mousemoveHandler,
            'mouseenter': mouseEnterHandler,
            'mouseup': mouseupHandler,
            // 'mouseover': mouseOverHandler,
            'mouseout': mouseOutHandler
        };


        //init configuration
        var configuration = {
            drawGapEdgePoints: true,
            'pointSize': 2,
            legend: 'follow',
            labelsKMB: true,
            labelsSeparateLines: true,
            // data formate
            labels: ['x'].concat(sampleData.labels),
            highlightSeriesOpts: {
                strokeWidth: 1.5,
                strokeBorderWidth: 1,
                highlightCircleSize: 2
            },
            drawPoints: false,
            drawAxesAtZero: false,
            labelsDivStyles: {
                'text-align': 'right',
                'position': 'relative',
                'display': 'inline-block'
            },
            yRangePad: 10,
            // x label y label
            ylabel: 'Value',
            xlabel: 'Date',
            colors: scope.defaultColors,
            // multiple Y axis
            series: {
                'Device0': {
                    axis: 'y2'
                },
                'Device4': {
                    axis: 'y2'
                }
            },
            // showRangeSelector: true,
            axes: {
                y: {
                    valueRange: [0, 1],
                    axisLabelWidth: 80
                },
                y2: {
                    // set axis-related properties here
                    'labelsKMB': true,
                    valueRange: [0, 1],
                    axisLabelWidth: 80
                },
                x: {
                    // datetime format
                    valueFormatter: function(y) {
                        return moment(y).format('DD/MM/YYYY HH:mm:ss'); //Hide legend label
                    }
                }
            },
            pointClickCallback: function(e, p) {
                // if (scope.currentView != -1) {
                // scope.showOne(p.name);
                // }
            },
            drawCallback: function(g, isInit) {
                if (scope.refersh) { // make sure "scope.refersh" doesn't call when the graph create first time.
                    scope.refersh(g, isInit);
                }
            },
            'interactionModel': interactionModel
        };
        configuration["plugins"] = [];
        if (Dygraph.Plugins.RectSelection) {
            scope.selectControl = new Dygraph.Plugins.RectSelection({
                highlight: function(series) {
                    console.info("highlight:" + series); // would be children devices in scatter view
                    var tempArray = [];
                    if (scope.highlights && scope.highlights.onExternal && scope.currentView == 1) {
                        series.forEach(function(_item) {
                            tempArray.push({
                                'name': _item.substring(0, 16),
                                'id': _item.substring(0, 16)
                            });
                        });
                        scope.highlights.onExternal = [];
                        scope.highlights.onExternal = tempArray;
                    }
                }
            });
            configuration["plugins"].push(scope.selectControl);
            scope.selectControlStatus = false;
            scope.switchSelectFeature = function() {
                if (scope.selectControlStatus) {
                    scope.selectControl.disable();
                    scope.selectControlStatus = false;
                } else {
                    scope.selectControl.enable();
                    scope.selectControlStatus = true;
                }
            };
        }


        // if (Dygraph.Plugins.HideLines) {
        // configuration["plugins"].push(new Dygraph.Plugins.HideLines());
        // }

        scope.currentChart = new Dygraph(element.find("div[class='line-chart-graph']")[0], sampleData.data, configuration);

        element.find("canvas").css("zIndex", 99);
        var timer_auto = null;
        var process_bar_timer = null;
        element.find("#real_time_graph_" + attrs.id).on("hidden.bs.modal", function() {
            // put your default event here
            _$interval.cancel(timer_auto);
            _$interval.cancel(process_bar_timer);
        });


        //real-time-graph
        element.find("#real_time_graph_" + attrs.id).on('shown.bs.modal', function() {

            var tempConifg = {
                drawGapEdgePoints: true,
                'pointSize': 3,
                labelsKMB: true,
                labelsSeparateLines: false,
                drawPoints: false,
                drawAxesAtZero: false,
                labelsDivStyles: {
                    'text-align': 'right',
                    'position': 'relative',
                    'display': 'inline-block'
                },
                // x label y label
                ylabel: 'Value',
                xlabel: 'Date',
                colors: scope.defaultColors,
                // multiple Y axis
                series: {
                    'Device0': {
                        axis: 'y2'
                    },
                    'Device4': {
                        axis: 'y2'
                    }
                },
                // showRangeSelector: true,
                axes: {
                    y: {
                        valueRange: [0, 1],
                        axisLabelWidth: 80
                    },
                    y2: {
                        // set axis-related properties here
                        'labelsKMB': true,
                        valueRange: [0, 1],
                        axisLabelWidth: 80
                    },
                    x: {
                        // datetime format
                        valueFormatter: function(y) {
                            return moment(y).format('DD/MM/YYYY HH:mm:ss'); //Hide legend label
                        }
                    }
                },
                interactionModel: {}
            };

            scope.realTimeGraph = new Dygraph(element.find("div[class='real-time-graph']")[0], sampleData.data, tempConifg);
            scope.realTimeGraph.updateOptions(scope.currentChartOptions);
            scope.realTimeGraph.updateOptions({
                "file": [],
                highlightSeriesOpts: {
                    strokeWidth: 1.5,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 2
                }
            });

            timer_auto = dataService.autoUpdateGraph(scope.applicationName, scope.auto_device_name, scope.auto_schema, scope.auto_store, scope.auto_fields, element.find("div[class='real-time-graph']").width() / 4, function(graph_data, worker, interval) {
                // update graph
                var deviceConfig = scope.auto_metadata.data.groups[1];
                var collections = deviceConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var allLines = [];
                //0 for y  1 for y2
                var yRanges = [{
                    min: null,
                    max: null
                }, {
                    min: null,
                    max: null
                }];
                angular$1.forEach(collections, function(collection) {
                    if (collection.name == scope.auto_store) {
                        angular$1.forEach(graph_data.data, function(line) {
                            allLines.push([new Date(line.timestamp)]);
                        });

                        var showY2axis = false;
                        angular$1.forEach(collection.rows, function(row) {
                            labels.push(row.label);
                            colors.push(row.color);


                            if (row.yaxis == 0) {
                                series[row.label] = {
                                    'axis': 'y1'
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y2'
                                };
                                showY2axis = true;
                            }
                            var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                            var filterF = null; // this is a function
                            if (row.filter) {
                                filterF = row.filter;
                            }
                            // add value
                            var counter = 0;
                            angular$1.forEach(allLines, function(realLine) {
                                try {
                                    var value = f(graph_data.data[counter]);
                                    if ((filterF && filterF(falue)) || !filterF) {
                                        realLine.push(value);
                                        if (row.yaxis == 0) {
                                            if (yRanges[0].min == null) {
                                                yRanges[0].min = value;
                                            }
                                            if (yRanges[0].max == null) {
                                                yRanges[0].max = value;
                                            }
                                            if (yRanges[0].min > value) {
                                                yRanges[0].min = value;
                                            }
                                            if (yRanges[0].max < value) {
                                                yRanges[0].max = value;
                                            }
                                        } else {
                                            if (yRanges[1].min == null) {
                                                yRanges[1].min = value;
                                            }
                                            if (yRanges[1].max == null) {
                                                yRanges[1].max = value;
                                            }
                                            if (yRanges[1].min > value) {
                                                yRanges[1].min = value;
                                            }
                                            if (yRanges[1].max < value) {
                                                yRanges[1].max = value;
                                            }
                                        }
                                    } else {
                                        realLine.push(null);
                                    }


                                } catch (ex) {
                                    realLine.push(null);
                                }
                                counter++;
                            });
                        });

                        angular$1.forEach(yRanges, function(yrange) {
                            if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                yrange.min = yrange.min - (yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.min) * 0.10;
                            } else {
                                yrange.min = yrange.min - (yrange.max - yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.max - yrange.min) * 0.10;
                            }
                        });

                        var newLines = [];
                        if (!showY2axis) {
                            angular$1.copy(allLines, newLines);
                            angular$1.forEach(newLines, function(line) {
                                line.push(null);
                            });
                            // update graph
                            scope.realTimeGraph.updateOptions({
                                file: newLines,
                                axes: {
                                    y: {
                                        valueRange: [yRanges[0].min, yRanges[0].max]
                                    },
                                    y2: {
                                        valueRange: [yRanges[1].min, yRanges[1].max]
                                    }
                                }
                            });
                        } else {
                            // update graph
                            scope.realTimeGraph.updateOptions({
                                file: allLines,
                                axes: {
                                    y: {
                                        valueRange: [yRanges[0].min, yRanges[0].max]
                                    },
                                    y2: {
                                        valueRange: [yRanges[1].min, yRanges[1].max]
                                    }
                                }
                            });
                        }
                    }
                });
                if (worker) {
                    timer_auto = worker;
                }
                //
                var perInterval = interval / 100;
                var counter = 0;

                if (process_bar_timer) {
                    _$interval.cancel(process_bar_timer);
                    counter = 0;
                }
                process_bar_timer = _$interval(function() {
                    scope.completionPercent = counter;
                    counter++;
                }, perInterval, 100);
            });
        });
        scope.currentChartOptions = {};
        scope.showRealTimeGraph = function() {
            element.find("#real_time_graph_" + attrs.id).modal();
        };
        if (attrs.hasOwnProperty("shown")) {
            var basicInfo = scope.basicInfo;
            if (basicInfo && basicInfo.range_show) {
                scope.rangeSelectorBar = new Dygraph(element.find("div[class='range-selector-bar']")[0], sampleData.data, {
                    xAxisHeight: 0,
                    axes: {
                        x: {
                            drawAxis: false
                        }
                    },
                    showRangeSelector: true,
                    rangeSelectorHeight: 30
                });
                scope.chartDateWindow = scope.rangeSelectorBar.xAxisRange();
            }
            var status = false;
            // add mouse up event to range select
            element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mouseup', function(event) {
                status = false;
                timeOut(function() {
                    var finalDateRagne = scope.currentChart.xAxisRange();
                    scope.chartDateTime = {
                        begin: finalDateRagne[0],
                        end: finalDateRagne[1]
                    };
                });
            });
            scope.$on('mouseUpMessage', function($scope, e) {
                if ("mouseup" === e.type && status) {
                    status = false;
                    timeOut(function() {
                        var finalDateRange = scope.currentChart.xAxisRange();
                        scope.chartDateTime = {
                            begin: finalDateRange[0],
                            end: finalDateRange[1]
                        };
                    });
                }
            });
            scope.$on('parentScatterViewChangedEvent', function(event, params) {
                angular$1.forEach(params.children, function(item) {
                    if (item == attrs.id) {
                        scope.currentView = params.view;
                    }
                });
            });
            scope.$on('bindFatherGraphEvent', function(event, data) {
                angular$1.forEach(data.children, function(child) {
                    if (child == attrs.id) {
                        scope.currentChart["id"] = attrs.id;
                        Dygraph.synchronize([scope.currentChart].concat(data.parent), {
                            zoom: true,
                            selection: false,
                            range: false
                        });
                        scope.currentChart.updateOptions({
                            drawCallback: function(g, isInit) {
                                // console.info("refersh running!" + " is  Init?"+ isInit);
                                scope.refersh(g, isInit, true);
                            }
                        });
                    }
                });
            });
            element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousemove', function(event) {
                if (status) {
                    if(scope.memoryVisibility && scope.memoryVisibility.length == 0 && scope.hp && scope.hp == true){
                        scope.memoryVisibility = scope.currentChart.getOption("visibility");
                        var _tempVi = [];
                        scope.currentChart.getOption("visibility").forEach(function(_v, _index){
                            _tempVi[_index] = false;
                        });
                        scope.currentChart.updateOptions({"visibility":_tempVi});
                    }
                    timeOut(function() {
                        scope.chartDateWindow = scope.currentChart.xAxisRange();
                    });
                }
            });
            element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousedown', function(event) {
                status = true;
            });
            //bind chart
            if (basicInfo && basicInfo.childrenChart.length > 0) {
                var param = {
                    'graphs': [scope.currentChart],
                    children: basicInfo.childrenChart
                };
                if (scope.rangeSelectorBar) {
                    param.graphs.push(scope.rangeSelectorBar);
                }
                scope.$emit('bindChildChartEvent', param);
            }
        }
    }, 0);
};

//controller: ['$scope', '$element', '$window', '$interval', '$timeout', '$filter', '$location', function ($scope, $element, $window, $interval, $timeout, $filter, $location) {
fgpWidgetGraph.prototype.controller = function controller ($scope, $element, $window, $interval, $timeout, $filter, $location, dataService, $rootScope, $stateParams, graphDataService, $compile, $q) {
    var element_id = $element.attr("id");
    $scope.elementId = element_id;

    $scope['defaultColors'] = dataService.defaultColors();
    var metadata = null;
    var widgetData = null;
    $scope.emptyDataShow = false;
    // attributes----------------------
    $scope.applicationName = $rootScope.applicationName;
    $scope.alertMessage;
    $scope.showY2Btns = false;
    $scope.legendText = null;
    $scope.legendText_device = null;
    $scope.legendText_datetime = null;
    $scope.legendText_column = null;
    $scope.legendText_value = null;
    $scope.legendColor = null;
    $scope.autoupdate = false;
    $scope.auto_device_name = "";
    $scope.auto_schema = "";
    $scope.auto_store = "";
    $scope.auto_fields = [];
    $scope.hp = false;

    $scope.memoryVisibility = [];

    // default data-time intervals
    $scope.defaultTimeIntervals = [{
            name: "10 seconds",
            interval: 10000
        },
        {
            name: "30 seconds",
            interval: 30000,
            scales: [10000]
        },
        {
            name: "1 minutes",
            interval: 60000,
            scales: [10000, 30000]
        },
        {
            name: "5 minutes",
            interval: 300000,
            scales: [30000, 60000]
        },
        {
            name: "30 minutes",
            interval: 1800000,
            scales: [60000, 300000]
        }, {
            name: "1 hour",
            interval: 3600000,
            scales: [60000, 300000, 1800000]
        }, {
            name: "1 day",
            interval: 86400000,
            scales: [300000, 1800000, 3600000]
        }, {
            name: "1 week",
            interval: 604800017,
            scales: [3600000, 86400000]
        }, {
            name: "1 month",
            interval: 2629800000,
            scales: [86400000, 604800017]
        }, {
            name: "1 year",
            interval: 31557600000,
            scales: [2629800000]
        }
    ];
    $scope.dateTimeIntervals = [].concat($scope.defaultTimeIntervals);
    $scope.locked_interval = null;

    $scope.chartDateWindow = [];
    // lock interval
    $scope.lock = function(interval) {
        if ($scope.locked_interval) {
            if ($scope.locked_interval == interval) {
                $scope.locked_interval = null; // unlocked
                if (!$scope.dateTimeIntervals) {
                    $scope.dateTimeIntervals = [].concat($scope.defaultTimeIntervals);
                }
                // change default choosed interval
                $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
                $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
            } else {
                $scope.locked_interval = interval; // locked
                // change color
                // change dropdown list
                $scope.defaultTimeIntervals.forEach(function(item) {
                    //
                    if (item["scales"] && item["scales"].length > 0) {
                        item["scales"].forEach(function(_item) {
                            if (_item == interval.interval) {
                                //
                                $scope.dateTimeIntervals.push(item);
                            }
                        });
                    }
                });
                $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
                $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
            }
        } else {
            $scope.locked_interval = interval;
            // change color

            // change dropdown list
            // check the user default config first
            if ($scope.dateTimeIntervals) {

            } else {
                $scope.defaultTimeIntervals.forEach(function(item) {
                    //
                    if (item["scales"] && item["scales"].length > 0) {
                        item["scales"].forEach(function(_item) {
                            if (_item == interval.interval) {
                                //
                                $scope.dateTimeIntervals.push(item);
                            }
                        });
                    }
                });
            }
            $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
            $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
        }
        // change
        $scope.changeInterval($scope.currentIntervalChoosed);
    };
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id,
        callback: function(data) {
            if (data) {
                widgetData = data;
                if (widgetData.data.metadata.data.basic.ranges) {
                    if (widgetData.data.metadata.data.basic.hasOwnProperty("ranges")) {
                        $scope.dateTimeIntervals = widgetData.data.metadata.data.basic.ranges;
                        angular$1.forEach($scope.dateTimeIntervals, function(range) {
                            range["interval"] = range.value;
                            if (range.checked == true) {
                                $scope.currentIntervalChoosed = range;
                            }
                        });
                    }
                } else {
                    $scope.currentIntervalChoosed = $scope.dateTimeIntervals[1];
                }
            }
        }
    });
    $scope.changeInterval = function(interval) {
        var range = $scope.currentChart["xAxisZoomRange"];
        if (range[0] instanceof Date) {
            range[0] = range[0].getTime();
        }
        if (range[1] instanceof Date) {
            range[1] = range[1].getTime();
        }
        if (interval && ((range[1] - interval.interval) >= range[0])) {
            $scope.rangeConfig.dateWindow = [new Date(range[1] - interval.interval), range[1]];
            $scope.currentChart.updateOptions($scope.rangeConfig);
            $scope.currentIntervalChoosed = interval;
        }
    };
    if (widgetData.data && widgetData.from == "show") {
        $scope.loadingShow = false;
        $scope.intevals = {
            device: []
        };
        // update chart
        $scope.css = {
            width: "col-md-12",
            height: "400"
        };
        if (widgetData.data.metadata.css) {
            $scope.css = widgetData.data.metadata.css;
        }
        // get start and end from url
        var begin_path = $stateParams.begin;
        var end_path = $stateParams.end;
        var init_flag = false;
        //fix interval
        $scope.fixInterval = false;
        var noneFixed = [];
        $scope.fixGraphWithGap = function() {
            if ($scope.currentChart && $scope.fixInterval) {
                var currentInterval = -1;
                angular$1.forEach($scope.intevals.device, function(item) {
                    if (item.name === $scope.currentIntervalName) {
                        currentInterval = item.interval;
                    }
                });
                if (noneFixed && noneFixed.length > 0) {
                    //fix
                    //get first one
                    var fixed = [noneFixed[0]];
                    var tempDate = fixed[0][0].getTime() + currentInterval;
                    while (tempDate <= noneFixed[noneFixed.length - 1][0].getTime()) {
                        var flag = false;
                        // add new
                        for (var i = 0; i < noneFixed.length; i++) {
                            if (noneFixed[i][0].getTime() == tempDate) {
                                flag = true;
                                fixed.push(noneFixed[i]);
                                break;
                            }
                        }
                        if (!flag) {
                            var obj = [new Date(tempDate)];
                            // add NaN
                            for (var j = 0; j < $scope.currentChart.attributes_.labels_.length; j++) {
                                obj.push(null);
                            }
                            fixed.push(obj);
                        }
                        tempDate += currentInterval;
                    }
                    $scope.currentChart.updateOptions({
                        file: fixed
                    });
                }
            } else if ($scope.currentChart && !$scope.fixInterval) {
                noneFixed = [];
                angular$1.copy($scope.currentChart.file_, noneFixed);
                $scope.currentChart.updateOptions({
                    file: noneFixed
                });
            }
        };
        $scope.showOrHideDevice = function(device) {
            angular$1.forEach($scope.childrenDevices, function(item, index) {
                if (item.name === device.name) {
                    var graph = $scope.currentChart;
                    if (device.show == true) {
                        graph.setVisibility(index, false);
                        device.show = false;
                    } else {
                        graph.setVisibility(index, true);
                        device.show = true;
                    }

                }
            });
        };
        $scope.fixGraphWithGap_click = function() {
            if ($scope.currentChart && !$scope.fixInterval) {
                noneFixed = [];
                angular$1.copy($scope.currentChart.file_, noneFixed);
                var currentInterval = -1;
                angular$1.forEach($scope.intevals.device, function(item) {
                    if (item.name === $scope.currentIntervalName) {
                        currentInterval = item.interval;
                    }
                });
                if (noneFixed && noneFixed.length > 0) {
                    //fix
                    //get first one
                    var fixed = [noneFixed[0]];
                    var tempDate = fixed[0][0].getTime() + currentInterval;
                    while (tempDate <= noneFixed[noneFixed.length - 1][0].getTime()) {
                        var flag = false;
                        // add new
                        for (var i = 0; i < noneFixed.length; i++) {
                            if (noneFixed[i][0].getTime() == tempDate) {
                                flag = true;
                                fixed.push(noneFixed[i]);
                                break;
                            }
                        }
                        if (!flag) {
                            var obj = [new Date(tempDate)];
                            // add NaN
                            for (var j = 0; j < $scope.currentChart.attributes_.labels_.length; j++) {
                                obj.push(null);
                            }
                            fixed.push(obj);
                        }
                        tempDate += currentInterval;
                    }
                    $scope.currentChart.updateOptions({
                        file: fixed
                    });
                }
            } else if ($scope.currentChart && $scope.fixInterval) {
                $scope.currentChart.updateOptions({
                    file: noneFixed
                });
            }
        };
        metadata = widgetData.data.metadata;
        $scope.basicInfo = metadata.data.basic;
        $scope.currentView = -1; // -1 is device view and 1 is scatter view
        $scope.parent_container = widgetData.data.parent;
        $scope.data_from = "application";
        $scope.checkY2Btns = function() {
            return $scope.basicInfo.zoom === true && $scope.showY2Btns === true;
        };

        $scope.selectedDevices = [];
        $scope.singleClickEventHandler = function() {
            if (!$scope.selectControlStatus) {
                if ($scope.highlights && $scope.highlights.onExternal) {
                    $scope.highlights.onExternal = [];
                    // add only one point
                    $scope.highlights.onExternal.push({
                        name: $scope.currentHighLightChildDevice.substring(0, 16),
                        id: $scope.currentHighLightChildDevice.substring(0, 16)
                    });
                }
            }
        };
        //
        if ($scope.highlights && $scope.highlights.onGraph) {
            var highlight_timer_ = null;
            $scope.$watchCollection("highlights.onGraph", function(newValue, oldValue) {
                if (newValue) {
                    if (highlight_timer_) {
                        $timeout.cancel(highlight_timer_);
                    }
                    highlight_timer_ = $timeout(function() {
                        if ($scope.currentView == 1 && newValue && newValue.length > 0) {
                            var highlightDeviceIndex = [];
                            // uncheck
                            $scope.childrenDevices.forEach(function (_child, _index) {
                                _child.show = false;
                            });
                            angular$1.forEach(newValue, function(deviceName) {
                                $scope.childrenDevices.forEach(function (_child, _index) {
                                    if (_child.name == deviceName) {
                                        highlightDeviceIndex.push(_index);
                                        _child.show = true;
                                    }
                                });
                            });
                            // update graph
                            var oldVisibility = $scope.currentChart.getOption('visibility');
                            // reset by new Visibility
                            oldVisibility.forEach(function(item, _index) {
                                if (highlightDeviceIndex.indexOf(_index) != -1) {
                                    oldVisibility[_index] = true;
                                } else {
                                    oldVisibility[_index] = false;
                                }
                            });
                            $scope.currentChart.updateOptions({
                                'visibility': oldVisibility
                            });
                        } else if ($scope.currentView == 1 && newValue && newValue.length == 0) {
                            if ($scope.childrenDevices) {
                                $scope.childrenDevices.forEach(function (_child, _index) {
                                    _child.show = true;
                                });
                                //show all
                                var oldVisibility = $scope.currentChart.getOption('visibility');
                                // reset by new Visibility
                                oldVisibility.forEach(function(item, _index) {
                                    oldVisibility[_index] = true;
                                });
                                $scope.currentChart.updateOptions({
                                    'visibility': oldVisibility
                                });
                            }
                        }
                    }, 1000);
                }
            });
        }

        $scope.$on('deviceInfoEvent', function(event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            $scope.auto_schema = metadata.data.source.store;
            $scope.auto_metadata = metadata;
            $scope.auto_device_name = deviceData.device.name;
            $scope.$watch('currentView', function(nObj, oObj) {
                // change
                if (nObj != oObj) {
                    if ($scope.eventsHandler && $scope.eventsHandler.viewChangeListener) {
                        $scope.eventsHandler.viewChangeListener(nObj);
                    }
                    $scope.$emit('graphScatterViewChangeEvent', {
                        children: $scope.basicInfo.childrenChart,
                        view: nObj
                    });
                    $scope.button_handlers = {}; // clean handlers
                    $element.find("#buttons_area").empty();
                    if (nObj == -1) {
                        $scope.autoupdate = true;
                        $scope.hp = false;
                        var rangeLevel = null;
                        var otherLevels = [];
                        angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                            if (level.rows.length > 0) {
                                if (rangeLevel != null) {
                                    otherLevels.push(rangeLevel);
                                }
                                rangeLevel = level.name;
                            }
                        });
                        if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {
                            // show device view
                            var fields = [];
                            var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                            angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                                if (level.rows.length > 0 && level.name === rangeLevel) {
                                    var lines = level.rows;
                                    if (lines) {
                                        angular$1.forEach(lines, function(line) {
                                            if (line.value) {
                                                var columns = (line.value).match(patt);
                                                angular$1.forEach(columns, function(column) {
                                                    if (column.startsWith('data.')) {
                                                        fields.push(column.replace('data.', ''));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                            $scope.auto_fields = fields;
                            dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                                initChart(data, deviceData.device.name);
                            }, function(error) {
                                console.error(error);
                            });
                        }
                    } else {
                        $scope.autoupdate = false;
                        // check interactions configuration $scope.hp
                        if($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.performance == true){
                            $scope.hp = true;
                        }
                        //get relation config
                        if (!metadata.data.source.relation || "none" === metadata.data.source.relation) {
                            return;
                        } else {
                            var rangeLevel = null;
                            var otherLevels = [];
                            var relationConfig = metadata.data.groups[2];
                            if (relationConfig.nameColumn) {
                                $scope.childrenDeviceNameColumn = relationConfig.nameColumn;
                            } else {
                                $scope.childrenDeviceNameColumn = "name";
                            }
                            angular$1.forEach(metadata.data.groups[2].collections, function(level) {
                                if (level.rows.length > 0) {
                                    if (rangeLevel != null) {
                                        otherLevels.push(rangeLevel);
                                    }
                                    rangeLevel = level.name;
                                }
                            });
                            if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {
                                var fields = [];
                                var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                                angular$1.forEach(metadata.data.groups[2].collections, function(level) {
                                    if (level.rows.length > 0 && level.name === rangeLevel) {
                                        var lines = level.rows;
                                        if (lines) {
                                            angular$1.forEach(lines, function(line) {
                                                if (line.value) {
                                                    var columns = (line.value).match(patt);
                                                    angular$1.forEach(columns, function(column) {
                                                        if (column.startsWith('data.')) {
                                                            fields.push(column.replace('data.', ''));
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                                $scope.auto_fields = fields;
                                // show children view
                                dataService.childrenExtensionInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, metadata.data.source.relation, metadata.data.source.relation_group, metadata.data.source.relation_group, rangeLevel, otherLevels, fields).then(function(data) {
                                    if (data != null && data.length > 0) {
                                        initChildrenChart(data);
                                        interactionHandler();
                                    } else if ($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.device && $scope.interactions.graphs.device.children) {
                                        // no relationship in fgp platform just take it from interactions Configuration  extension_type
                                        if ($scope.interactions.graphs.device.children.data) {
                                            var devices_key = $scope.interactions.graphs.device.children.data().then(
                                                function(data) {
                                                    $q.all(dataService.devicesExtensionInitInfo($rootScope.host, $rootScope.applicationName, data, metadata.data.source.store, $scope.interactions.graphs.device.children.extension_type, rangeLevel, otherLevels, fields)).then(
                                                        function(data) {
                                                            initChildrenChart(data);
                                                            interactionHandler();
                                                        },
                                                        function(error) {
                                                            console.error(error);
                                                        }
                                                    );
                                                },
                                                function(error) {
                                                    return;
                                                }
                                            );
                                        } else {
                                            return;
                                        }
                                    } else {
                                        return;
                                    }
                                }, function(error) {
                                    console.error(error);
                                });

                            }
                        }
                    }
                }
                $scope.fixInterval = false;
            });
            var interactionHandler = function() {
                // interactions for scatter view
                if ($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.buttons && $scope.interactions.graphs.buttons.scatter) {
                    // 1. color
                    if ($scope.interactions.graphs.buttons.scatter.color) {
                        // change color by "field"
                        var buttons = $scope.interactions.graphs.buttons.scatter.color;
                        angular$1.forEach(buttons, function(button) {
                            var buttons_html = '';
                            // create an event handler
                            var _func = '_' + (Math.random().toString(36).slice(2, 13));
                            $scope.button_handlers[_func] = function() {
                                var colors = [];
                                // set button status
                                if (button["active"]) {
                                    // make them oragin colors
                                    angular$1.forEach($scope.childrenDevices, function(device, $index) {
                                        if ($scope.childrenColors) {
                                            $scope.childrenColors.forEach(function(_item) {
                                                if (_item.name == device.name) {
                                                    colors.push(_item.color);
                                                }
                                            });
                                        } else {
                                            // need to change
                                            if ($scope.defaultColors[$index]) {
                                                colors.push($scope.defaultColors[$index]);
                                            } else {
                                                colors.push($scope.defaultColors[Math.floor(Math.random()*(10))]);
                                            }
                                        }
                                    });
                                    button["active"] = false;
                                } else {
                                    // the custom func returns color.
                                    var field = button.field;
                                    var _func = button._func;
                                    // devices
                                    angular$1.forEach($scope.childrenDevices, function(device, $index) {
                                        colors.push(_func(device[field]));
                                    });
                                    button["active"] = true;
                                }
                                // update graph colors
                                $scope.currentChart.updateOptions({
                                    "colors": colors
                                });
                            };
                            // create click event handler for this button and put it into $scope
                            buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                            // compile the html and add it into toolbar
                            $element.find("#buttons_area").append($compile(buttons_html)($scope));
                        });
                    }
                    // 2. data filter
                    if ($scope.interactions.graphs.buttons.scatter.dataFilter) {
                        var buttons = $scope.interactions.graphs.buttons.scatter.dataFilter;

                        angular$1.forEach(buttons, function(button) {
                            var buttons_html = '';
                            // create an event handler
                            var _func = '_' + (Math.random().toString(36).slice(2, 13));
                            $scope.button_handlers[_func] = function() {
                                // set button status
                                // the custom func returns color.
                                var field = button.field;
                                var _func = button._func;
                                var v = [];
                                // devices
                                angular$1.forEach($scope.childrenDevices, function(device, $index) {
                                    if (_func(device[field])) {
                                        device.show = true;
                                        // $scope.currentChart.setVisibility($index, true);
                                        v[$index] = true;
                                    } else {
                                        device.show = false;
                                        // $scope.currentChart.setVisibility($index, false);
                                        v[$index] = false;
                                    }
                                });
                                // update visibility once
                                $timeout(function() {
                                    var oldVisibility = $scope.currentChart.getOption('visibility');
                                    // reset by new Visibility
                                    v.forEach(function(item, _index) {
                                        oldVisibility[_index] = item;
                                    });
                                    $scope.currentChart.updateOptions({
                                        'visibility': oldVisibility
                                    });
                                });

                            };
                            // create click event handler for this button and put it into $scope
                            buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                            // compile the html and add it into toolbar
                            $element.find("#buttons_area").append($compile(buttons_html)($scope));
                        });
                    }
                    // highlight   $scope.currentChart.setSelection(false, line);
                    if ($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.buttons && $scope.interactions.graphs.buttons.scatter && $scope.interactions.graphs.buttons.scatter.highlighting) {
                        var buttons = $scope.interactions.graphs.buttons.scatter.highlighting;
                        angular$1.forEach(buttons, function(button) {
                            var buttons_html = '';
                            // create an event handler
                            var _func = '_' + (Math.random().toString(36).slice(2, 13));
                            $scope.button_handlers[_func] = function() {
                                // set button status
                                // the custom func returns color.
                                var field = button.field;
                                var _func = button._func;
                                var hideAllOthers = button.hideOther;
                                // devices
                                var timerInterval = 0;
                                var v = [];
                                angular$1.forEach($scope.childrenDevices, function(device, $index) {
                                    if (_func(device[field])) {
                                        $timeout(function() {
                                            $scope.currentChart.setSelection(false, device[field]);
                                        }, timerInterval);
                                        timerInterval += 1000;
                                        v[$index] = true;
                                    } else {
                                        if (hideAllOthers && hideAllOthers == true) {
                                            device.show = false;
                                            // $scope.currentChart.setVisibility($index, false);
                                            v[$index] = false;
                                        }
                                    }
                                });
                                //
                                // update visibility once
                                $timeout(function() {
                                    var oldVisibility = $scope.currentChart.getOption('visibility');
                                    // reset by new Visibility
                                    v.forEach(function(item, _index) {
                                        oldVisibility[_index] = item;
                                    });
                                    $scope.currentChart.updateOptions({
                                        'visibility': oldVisibility
                                    });
                                });
                            };
                            // create click event handler for this button and put it into $scope
                            buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                            // compile the html and add it into toolbar
                            $element.find("#buttons_area").append($compile(buttons_html)($scope));
                        });
                    }

                }
                // n. other.....
            };
            // first time of showing chart
            $scope.$watch('currentChart', function(newValue) {
                if (newValue) {
                    //device first level
                    var rangeLevel = null;
                    var otherLevels = [];
                    angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                        if (level.rows.length > 0) {
                            if (rangeLevel != null) {
                                otherLevels.push(rangeLevel);
                            }
                            rangeLevel = level.name;
                        }
                    });
                    // fields of range level
                    var fields = [];
                    var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                    angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                        if (level.rows.length > 0 && level.name === rangeLevel) {
                            var lines = level.rows;
                            if (lines) {
                                angular$1.forEach(lines, function(line) {
                                    //
                                    if (line.value) {
                                        var columns = (line.value).match(patt);
                                        angular$1.forEach(columns, function(column) {
                                            if ((column).startsWith('data.')) {
                                                fields.push(column.replace('data.', ''));
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                    $scope.auto_fields = fields;
                    //send a rest request
                    dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                        if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {
                            //call scatter view init.
                            $scope.currentView = 1;
                        } else {
                            $scope.currentView = -1;
                            initChart(data, deviceData.device.name);
                        }
                    }, function(error) {
                        console.error(error);
                    });
                }
            });

            $scope.$watch("chartDateTime", function(newValue, oldValue) {
                if (newValue.begin != null && newValue.end != null) {
                    var expect_points = Math.floor($element.parent().width());
                    if(expect_points == 0){
                        expect_points = 1000;
                    }
                    // find a interval
                    var expectedInterval = (newValue.end - newValue.begin) / expect_points;
                    if ($scope.locked_interval) {
                        expectedInterval = $scope.locked_interval.interval;
                    }
                    var conf = $scope.intevals.device;
                    if (conf == null || conf.length == 0) {
                        return false;
                    }
                    // device detail view
                    var preOne = conf[0].interval;
                    var lastOne = conf[conf.length - 1].interval;
                    var cin = "";
                    if (expectedInterval >= preOne) {
                        expectedInterval = preOne;
                        $scope.autoupdate = false;
                    } else if (expectedInterval <= lastOne) {
                        expectedInterval = lastOne;
                        if ($scope.currentView == -1) {
                            $scope.autoupdate = true;
                            $scope.auto_store = conf[conf.length - 1].name;
                        }
                    } else {
                        for (var i = 1; i < conf.length; i++) {
                            if (expectedInterval <= preOne && expectedInterval > conf[i].interval) {
                                expectedInterval = preOne;
                            } else {
                                preOne = conf[i].interval;
                                cin = conf[i].name;
                            }
                        }
                        $scope.autoupdate = false;
                    }
                    $scope.currentIntervalName = "";
                    angular$1.forEach(conf, function(config) {
                        if (config.interval == expectedInterval) {
                            $scope.currentIntervalName = config.name;
                        }
                    });
                    // check the interval(data) no more than the number of expected points
                    if (expectedInterval == lastOne) {
                        // check
                        if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.limits) {
                            expect_points = $scope['interactions'].graphs.limits;
                        }
                        //
                        if (((newValue.end - newValue.begin) / expectedInterval) > expect_points) {
                            // reset range bar
                            $scope.rangeConfig.dateWindow = [new Date(newValue.end - (expect_points - 1) * expectedInterval), new Date(newValue.end)];
                            $scope.currentChart.updateOptions($scope.rangeConfig);
                            $scope.currentChartOptions = $scope.rangeConfig;
                            $scope.alertMessage = "Limit the number of \"Zoom-Out\" points to " + expect_points + ".";
                            $timeout(function() {
                                $scope.alertMessage = null;
                            }, 5000);
                            return;
                        }
                    }
                    // update range-bar
                    if ($scope.rangeSelectorBar) {
                        angular$1.forEach($scope.trees, function(tree) {
                            if (tree.range == true) {
                                // send request
                                var fields = [];
                                var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                                angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                                    if (level.rows.length > 0 && level.name === tree.store) {
                                        var lines = level.rows;
                                        if (lines) {
                                            angular$1.forEach(lines, function(line) {
                                                //
                                                if (line.value) {
                                                    var columns = (line.value).match(patt);
                                                    angular$1.forEach(columns, function(column) {
                                                        if ((column).startsWith('data.')) {
                                                            fields.push(column.replace('data.', ''));
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                                $scope.auto_fields = fields;
                                dataService.deviceStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, new Date(newValue.begin).getTime(), new Date(newValue.end).getTime(), fields, expectedInterval).then(function(data) {
                                        // udpate chart
                                        var showData = data;
                                        showData = showData.filter(function(obj) {
                                            return obj != null;
                                        });
                                        // update range bar
                                        var basicInfo = $scope.basicInfo;
                                        var allLines = [];
                                        angular$1.forEach(showData, function(line) {
                                            allLines.push([new Date(line.timestamp)]);
                                        });
                                        var series_range = {
                                            'l0': {
                                                axis: 'y1'
                                            }
                                        };
                                        var rangeBarLabels = [];
                                        for (var i = 0; i < fields.length; i++) {
                                            rangeBarLabels.push(fields[i]);
                                            var f = new Function("data", "with(data) { if(data." + fields[i] + "!=null)return data." + fields[i] + ";return null;}");
                                            // add value
                                            var counter = 0;
                                            angular$1.forEach(allLines, function(realLine) {
                                                try {
                                                    var value = f(showData[counter]);
                                                    realLine.push(value);
                                                } catch (ex) {
                                                    realLine.push(null);
                                                }
                                                counter++;
                                            });
                                        }
                                        //
                                        if ($scope.rangeConfig && $scope.rangeConfig.file && $scope.rangeConfig.file != null) {
                                            var objNeed2Add = [];
                                            angular$1.forEach($scope.rangeConfig.file, function(item) {
                                                var flag = false;
                                                var dataLength = -1;
                                                angular$1.forEach(allLines, function(line) {
                                                    dataLength = line.length;
                                                    if (line.length > 0 && line[0].getTime() === item[0].getTime()) {
                                                        flag = true;
                                                    } else if (line.length === 0) {
                                                        flag = true;
                                                    } else {
                                                        dataLength = line.length;
                                                    }

                                                });
                                                if (!flag) {
                                                    var tempObj = [];
                                                    for (var i = 0; i < dataLength; i++) {
                                                        tempObj[i] = item[i];
                                                    }
                                                    objNeed2Add.push(tempObj);
                                                }
                                            });
                                        }
                                        allLines = allLines.concat(objNeed2Add);
                                        allLines.sort(function(a, b) {
                                            return a[0] > b[0] ? 1 : -1;
                                        });
                                        if ($scope.showY2Btns) {
                                            //noinspection JSDuplicatedDeclaration
                                            if (!$scope.rangeConfig.axes.hasOwnProperty("y2")) {
                                                series_range = {
                                                    'l0': {
                                                        axis: 'y1'
                                                    },
                                                    'l0': {
                                                        axis: 'y2'
                                                    }
                                                };
                                                $scope.rangeSeries = series_range;
                                                $scope.rangeConfig = {
                                                    'file': allLines,
                                                    'labels': ['x'].concat(rangeBarLabels),
                                                    'series': series_range,
                                                    highlightSeriesOpts: {
                                                        strokeWidth: 1.5,
                                                        strokeBorderWidth: 1,
                                                        highlightCircleSize: 2
                                                    }
                                                };
                                                if (basicInfo && basicInfo.range_show) {
                                                    $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                                }
                                            } else {
                                                $scope.rangeSelectorBar.updateOptions({
                                                    'file': allLines,
                                                    highlightSeriesOpts: {
                                                        strokeWidth: 1.5,
                                                        strokeBorderWidth: 1,
                                                        highlightCircleSize: 2
                                                    }
                                                });
                                            }

                                        } else {
                                            series_range["span_y2"] = {
                                                axis: 'y2'
                                            };
                                            $scope.rangeSeries = series_range;
                                            var newLines = [];
                                            angular$1.copy(allLines, newLines);
                                            angular$1.forEach(newLines, function(line) {
                                                line.push(null);
                                            });
                                            $scope.rangeConfig = {
                                                'file': newLines,
                                                'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                                'series': series_range,
                                                highlightSeriesOpts: {
                                                    strokeWidth: 1.5,
                                                    strokeBorderWidth: 1,
                                                    highlightCircleSize: 2
                                                }
                                            };
                                            if (basicInfo && basicInfo.range_show) {
                                                $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                            }
                                        }
                                    },
                                    function(data) {
                                        console.info(data);
                                    }
                                );
                            }
                        });
                    }


                    $scope.loadingShow = true;
                    // check separated points config
                    if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                        $scope.currentChart.updateOptions({
                            connectSeparatedPoints: true
                        });
                    } else {
                        $scope.currentChart.updateOptions({
                            connectSeparatedPoints: false
                        });
                    }

                    if ($scope.currentView == 1) {
                        // scatter detail view
                        $scope.legendText = null;
                        var deviceInfo = [];
                        var currentStore = "";
                        $scope.childrenDevices = [];
                        angular$1.forEach($scope.childTrees, function(device) {
                            angular$1.forEach(device.trees, function(tree, index) {
                                if (expectedInterval == tree.frequency) {
                                    currentStore = tree.store;
                                    deviceInfo.push({
                                        name: device.name,
                                        tree: tree.tree
                                    });
                                    device["show"] = true;
                                    $scope.childrenDevices.push(device);
                                }
                            });
                        });


                        var fields = [];
                        var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                        angular$1.forEach(metadata.data.groups[2].collections, function(level) {
                            if (level.rows.length > 0 && level.name === $scope.currentIntervalName) {
                                var lines = level.rows;
                                if (lines) {
                                    angular$1.forEach(lines, function(line) {
                                        if (line.value) {
                                            var columns = (line.value).match(patt);
                                            angular$1.forEach(columns, function(column) {
                                                if (column && (column).startsWith('data.')) {
                                                    fields.push(column.replace('data.', ''));
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        var _init = function(deviceInfo, currentStore, begin, end, fields, expectedInterval) {
                            $scope.auto_fields = fields;
                            dataService.devicesStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceInfo, metadata.data.source.store, currentStore, new Date(begin).getTime(), new Date(end).getTime(), fields, expectedInterval).then(function(data) {
                                var showData = [];
                                angular$1.forEach(data, function(arr, key) {
                                    var deviceData = [].concat(arr);
                                    showData.push({
                                        device: key,
                                        data: deviceData
                                    });
                                });
                                // order childrenDevices by showData
                                var devicesMatchData = [];
                                angular$1.forEach(showData, function(item, _index) {
                                    angular$1.forEach($scope.childrenDevices, function(device) {
                                        // just show devices with data
                                        if (item.device == device.name && item.data.length > 0) {
                                            devicesMatchData.splice(_index, 0, device);
                                        }
                                    });
                                });
                                showData.sort(function(a, b){
                                    return a.device > b.device ? 1 : -1;
                                });
                                //reset childrenDevies
                                $scope.childrenDevices = devicesMatchData;
                                $scope.childrenDevices.sort(function(a, b) {
                                    return a.name > b.name ? 1 : -1;
                                });
                                //get configuration
                                updateChildrenDetailChart(metadata, currentStore, $scope.rangeChildrenData, showData);
                            }, function(data) {
                                console.info(data);
                            });
                        };
                        if (deviceInfo.length == 0) {
                            var rangeLevel = null;
                            var otherLevels = [];
                            var relationConfig = metadata.data.groups[2];
                            if (relationConfig.nameColumn) {
                                $scope.childrenDeviceNameColumn = relationConfig.nameColumn;
                            } else {
                                $scope.childrenDeviceNameColumn = "name";
                            }
                            angular$1.forEach(metadata.data.groups[2].collections, function(level) {
                                if (level.rows.length > 0) {
                                    if (rangeLevel != null) {
                                        otherLevels.push(rangeLevel);
                                    }
                                    rangeLevel = level.name;
                                }
                            });

                            // try to find
                            if ($scope.interactions.graphs.device.children.data) {
                                var devices_key = $scope.interactions.graphs.device.children.data().then(
                                    function(data) {
                                        $q.all(dataService.devicesExtensionInitInfo($rootScope.host, $rootScope.applicationName, data, metadata.data.source.store, $scope.interactions.graphs.device.children.extension_type, rangeLevel, otherLevels, fields)).then(
                                            function(data) {
                                                if (data) {
                                                    data.forEach(function (_device) {
                                                        deviceInfo.push(_device.device);
                                                    });
                                                }
                                                _init(deviceInfo, currentStore, newValue.begin, newValue.end, fields, expectedInterval);
                                            },
                                            function(error) {
                                                console.error(error);
                                            }
                                        );
                                    },
                                    function(error) {
                                        return;
                                    }
                                );
                            } else {
                                return;
                            }
                        } else {
                            _init(deviceInfo, currentStore, newValue.begin, newValue.end, fields, expectedInterval);
                        }


                        $scope.fixGraphWithGap();
                    } else {
                        // cal tree
                        angular$1.forEach($scope.trees, function(tree, index) {
                            if (expectedInterval == tree.frequency) {
                                // send request
                                var fields = [];
                                var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                                angular$1.forEach(metadata.data.groups[1].collections, function(level) {
                                    if (level.rows.length > 0 && level.name === $scope.currentIntervalName) {
                                        var lines = level.rows;
                                        if (lines) {
                                            angular$1.forEach(lines, function(line) {
                                                //
                                                if (line.value) {
                                                    var columns = (line.value).match(patt);
                                                    angular$1.forEach(columns, function(column) {
                                                        if ((column).startsWith('data.')) {
                                                            fields.push(column.replace('data.', ''));
                                                        }
                                                    });

                                                }

                                            });
                                        }
                                    }
                                });

                                $scope.auto_fields = fields;
                                dataService.deviceStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, new Date(newValue.begin).getTime(), new Date(newValue.end).getTime(), fields, tree.frequency).then(function(data) {
                                    // udpate chart
                                    var showData = data;
                                    showData = showData.filter(function(obj) {
                                        return obj != null;
                                    });
                                    showData.sort(function(a, b) {
                                        return a.timestamp > b.timestamp ? 1 : -1;
                                    });
                                    // get configuration
                                    updateDetailChart(metadata, tree.store, $scope.rangeData, showData);
                                    // rest visibility
                                    angular$1.forEach(showData, function(item) {
                                        item["show"] = true;
                                    });

                                    // tell some other widgets, the graph is changed.
                                    $timeout(function() {
                                        $rootScope.$broadcast('chartDataChangeEvent', {
                                            'id': element_id,
                                            'group': 'device',
                                            'data': {
                                                'collection': tree.store,
                                                'group': 'device',
                                                'data': showData
                                            }
                                        });
                                    });

                                }, function(data) {
                                    console.info(data);
                                });
                            }
                        });

                        $scope.fixGraphWithGap();
                    }
                    // 2. series highlighting

                    $scope.status = false;
                }
            });

        });


        var fetchData = function(values, node) {
            if (node.children[0] != null) {
                fetchData(values, node.children[0]);
            }

            if (node.children[1] != null) {
                fetchData(values, node.children[1]);
            }

            if (node.children[0] == null && node.children[1] == null) {
                if (node.data != null && node.data.array) {
                    Array.prototype.push.apply(values, node.data.array.slice(0, node.data.size));
                } else if (node.data != null) {
                    Array.prototype.push.apply(values, node.data.slice(0, node.data.length));
                }

            }

        };


        $scope.trees = [];
        $scope.rangeData = [];

        $scope.ordinalRangeData = [];

        var initChart = function(data, deviceName) {
            $scope.intevalforshow = [];
            //
            $scope.intevals.device = [];
            var trees = data.trees;
            $scope.trees = trees;
            var rangeTree = null;
            angular$1.forEach(trees, function(tree) {
                if (tree.range) {
                    rangeTree = tree;
                }
                $scope.intevals.device.push({
                    name: tree.store,
                    interval: tree.frequency
                });
            });


            // init chart with range data
            var store = rangeTree.store;

            // get all data
            var allData = [];
            // fetchData(allData, rangeTree.tree);only get first and last
            // fix the problem of never seen the current data.
            rangeTree.last.timestamp = rangeTree.last.timestamp + (rangeTree.frequency - 1);
            allData = allData.concat([rangeTree.first, rangeTree.last]);

            allData = allData.filter(function(obj) {
                return obj != null;
            });

            allData.sort(function(a, b) {
                return a.timestamp > b.timestamp ? 1 : -1;
            });


            if ($scope.trees.length == 0 || allData.length == 0) {
                $scope.emptyDataShow = true;
                return;
            }

            // if the data only has one point. change the data range to bigger
            if (allData.length == 1) { //  means only one point.
                var newData = [];
                // add 1 points into both side
                var thePoint = allData[0];
                var timestamp = thePoint.timestamp;
                var currentInterval = $scope.intevals.device[0].interval;
                newData.push({
                    timestamp: timestamp - currentInterval
                });
                Array.prototype.push.apply(newData, allData);
                newData.push({
                    timestamp: timestamp + currentInterval
                });
                allData = newData;
            }
            $scope.ordinalRangeData = allData;
            // put the data into range tree cache
            if (rangeTree) {
                //
                graphDataService.put(deviceName + "/" + rangeTree.store + "/" + $scope.graphId, [rangeTree.first, {
                    timestamp: moment().endOf('day').toDate().getTime()
                }]);
            }
            // get configuration and make real data
            updateChart(metadata, store, allData, rangeTree);
        };

        $scope.childrenColors = [];

        var initChildrenChart = function(deviceDatas) {
            var devicesInfo = {};
            $scope.intevals.device = [];
            //range data with all device
            $scope.childTrees = [];
            $scope.childrenDevices = [];

            deviceDatas.sort(function(a,b){
                return a.device.name > b.device.name ? 1 : -1;
            });

            // we should give colors to all devices (no matter has data or not)
            deviceDatas.forEach(function(_device, _index) {
                if ($scope.defaultColors[_index]) {
                    $scope.childrenColors.push({
                        name: _device.device.name,
                        color: $scope.defaultColors[_index]
                    });
                } else {
                    $scope.childrenColors.push({
                        name: _device.device.name,
                        color: $scope.defaultColors[Math.floor(Math.random()*(10))]
                    });
                }
            });
            angular$1.forEach(deviceDatas, function(deviceData, _index) {
                var device = {};
                device["show"] = true;
                angular$1.merge(device, deviceData.device, deviceData.extension);
                // $scope.childrenDevices.push(device);
                var trees = deviceData.trees;
                device["trees"] = trees;
                $scope.childTrees.push(device);
                var rangeTree = null;
                angular$1.forEach(trees, function(tree) {
                    if (tree.range) {
                        rangeTree = tree;
                    }

                    var flag = false;
                    angular$1.forEach($scope.intevals.device, function(interval) {
                        if (interval.name == tree.store && interval.interval == tree.frequency) {
                            // has same one
                            flag = true;
                        }
                    });
                    if (!flag) {
                        $scope.intevals.device.push({
                            name: tree.store,
                            interval: tree.frequency
                        });
                    }

                });

                if (rangeTree != null) {
                    var deviceObj = devicesInfo[device.name] = {};
                    // get all data
                    var allData = [rangeTree.first, {
                        timestamp: moment().endOf('day').toDate().getTime()
                    }];
                    allData = allData.filter(function(obj) {
                        return obj != null;
                    });
                    allData.sort(function(a, b) {
                        return a.timestamp > b.timestamp ? 1 : -1;
                    });
                    //
                    deviceObj["range"] = rangeTree;
                    deviceObj["data"] = allData;
                } else {
                    console.info(device.name + " has none data.");
                }
            });
            updateChildrenChart(metadata, devicesInfo);
        };

        var updateChildrenChart = function(metadata, devicesInfo) {
            //relation
            var relationConfig = metadata.data.groups[2];
            // scatter view shows only one collection
            var collections = relationConfig.collections;
            var labels = [];
            var series = {};
            var colors = [];
            var leftAndRight = {
                left: relationConfig.leftYAxis,
                right: relationConfig.rightYAxis
            };
            var allLines = [];
            var allXLabels = [];
            angular$1.forEach(devicesInfo, function(device, key, _index) {
                angular$1.forEach(device.data, function(item) {
                    var flag = false;
                    angular$1.forEach(allXLabels, function(label) {
                        if (label.getTime() == item.timestamp) {
                            flag = true;
                        }
                    });
                    if (!flag) {
                        allXLabels.push(new Date(item.timestamp));
                    }
                });
            });
            // order
            allXLabels.sort(function(a, b) {
                return a > b ? 1 : -1;
            });

            // make all line
            angular$1.forEach(allXLabels, function(label) {
                allLines.push([label]);
            });


            var yRange = {
                min: null,
                max: null
            };
            var showY2axis = false;
            var counter = 0;
            angular$1.forEach(devicesInfo, function(device, key) {
                counter++;
                angular$1.forEach(collections, function(collection) {
                    if (collection.name == device.range.store) {
                        $scope.currentIntervalName = device.range.store;
                        var originalData = device.data;
                        // always same for each device
                        if (collection.rows[0].yaxis == 0) {
                            series[collection.rows[0].label] = {
                                'axis': 'y1'
                            };
                        } else {
                            series[collection.rows[0].label] = {
                                'axis': 'y2'
                            };
                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }
                        labels.push(key); // put the name here and
                        var filterF = null;
                        if (collection.rows[0].filter) {
                            filterF = collection.rows[0].filter;
                        }

                        // make a line
                        var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                        // add value
                        angular$1.forEach(allLines, function(realLine, index) {

                            var flag = false;
                            angular$1.forEach(originalData, function(odata) {
                                if (realLine[0].getTime() == odata.timestamp) {
                                    try {
                                        var value = f(odata);
                                        if ((filterF && filterF(value)) || !filterF) {
                                            realLine.push(value);
                                            if (yRange.min == null) {
                                                yRange.min = value;
                                            }

                                            if (yRange.max == null) {
                                                yRange.max = value;
                                            }

                                            if (yRange.min > value) {
                                                yRange.min = value;
                                            }

                                            if (yRange.max < value) {
                                                yRange.max = value;
                                            }
                                        } else {
                                            realLine.push(null);
                                        }
                                    } catch (ex) {
                                        realLine.push(null);
                                    }
                                    flag = true;
                                }
                            });

                            if (!flag) {
                                realLine.push(null);
                            }
                        });


                    }
                });
            });

            if (yRange.min == yRange.max && yRange.min != null && yRange.max != null) {
                yRange.min = yRange.min - (yRange.min) * 0.10;
                yRange.max = yRange.max + (yRange.max) * 0.10;
            }
            var connectSeparatedPoints = false;
            if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
            }

            //update chart
            if ($scope.currentChart) {
                $scope.rangeChildrenData = allLines;
                // reset colors by labels
                colors = [];
                labels.forEach(function(key) {
                    $scope.childrenColors.forEach(function(_item) {
                        if (_item.name == key) {
                            colors.push(_item.color);
                        }
                    });
                });
                if (showY2axis) {
                    $scope.childrenRangeConfig = {
                        'connectSeparatedPoints': connectSeparatedPoints,
                        'labelsKMB': true,
                        'file': allLines,
                        legend: 'never',
                        labelsKMB: true,
                        labelsSeparateLines: false,
                        highlightCircleSize: 2,

                        strokeBorderWidth: 0,
                        highlightSeriesOpts: {
                            strokeWidth: 1.5,
                            strokeBorderWidth: 1,
                            highlightCircleSize: 2
                        },
                        'labels': ['x'].concat(labels),
                        'ylabel': leftAndRight.left,
                        'y2label': leftAndRight.right,
                        'series': series,
                        'colors': colors,
                        'axes': {
                            'y': {
                                valueRange: [yRange.min, yRange.max],
                                axisLabelWidth: 80
                            },
                            'y2': {}
                        }
                        // showRangeSelector: true
                    };
                } else {
                    $scope.showY2Btns = false;
                    var newLines = [];
                    angular$1.copy(allLines, newLines);
                    angular$1.forEach(newLines, function(line) {
                        line.push(null);
                    });
                    series["span_y2"] = {
                        'axis': 'y2'
                    };
                    $scope.childrenRangeConfig = {
                        'connectSeparatedPoints': connectSeparatedPoints,
                        'drawGapEdgePoints': true,
                        'pointSize': 2,
                        'legend': 'never',
                        'labelsKMB': true,
                        'file': newLines,
                        'labelsSeparateLines': false,
                        highlightCircleSize: 2,
                        strokeBorderWidth: 0,
                        highlightSeriesOpts: {
                            strokeWidth: 1.5,
                            strokeBorderWidth: 1,
                            highlightCircleSize: 2
                        },
                        'labels': ['x'].concat(labels).concat(['span_y2']),
                        'ylabel': leftAndRight.left,
                        'y2label': "",
                        'series': series,
                        'colors': colors,
                        'axes': {
                            'y': {
                                valueRange: [yRange.min, yRange.max]
                            },
                            'y2': {
                                axisLabelFormatter: function(d) {
                                    return '';
                                }
                            }
                        }
                        // showRangeSelector: true
                    };
                }
                //
                $scope.currentChart.updateOptions($scope.childrenRangeConfig);

                // set the first one to range bar
                // update range bar with the first channel data
                if ($scope.basicInfo && $scope.basicInfo.range_show && $scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {

                    Dygraph.synchronize([$scope.rangeSelectorBar, $scope.currentChart], {
                        zoom: true,
                        selection: false,
                        range: false
                    });
                    if (showY2axis) {
                        $scope.rangeConfig = {
                            'file': newLines,
                            'series': series,
                            'labels': ['x'].concat(labels),
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            }
                        };
                    } else {
                        $scope.rangeConfig = {
                            'file': newLines,
                            'series': series,
                            'labels': ['x'].concat(labels).concat(['span_y2']),
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            }
                        };
                    }
                    $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                    // reset the datetime for current chart

                    if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= newLines[0][0] && $scope.chartDateWindow[1] <= newLines[newLines.length - 1][0])) {
                        // keep the current range bar refresh once.
                        $scope.chartDateTime = {
                            begin: $scope.chartDateTime.begin,
                            end: $scope.chartDateTime.end
                        };
                        $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                    } else {
                        $scope.currentChart["xAxisZoomRange"] = [newLines[0][0], newLines[newLines.length - 1][0]];
                        if (begin_path && end_path && !init_flag) {
                            // $scope.chartDateTime = {
                            // "begin": new Date(new Number(begin_path)),
                            // "end": new Date(new Number(end_path))
                            // };
                            $scope.chartDateWindow = [new Date(new Number(begin_path)).getTime(), new Date(new Number(end_path)).getTime()];
                            $scope.rangeConfig.dateWindow = [new Date(new Number(begin_path)).getTime(), new Date(new Number(end_path)).getTime()];
                            init_flag = true;
                        } else {
                            if ($scope.currentIntervalChoosed && ((newLines[newLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= newLines[0][0].getTime())) {
                                $scope.rangeConfig.dateWindow = [newLines[newLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval, newLines[newLines.length - 1][0].getTime()];
                            } else {
                                $scope.chartDateWindow = [newLines[0][0].getTime(), newLines[newLines.length - 1][0].getTime()];
                                $scope.rangeConfig.dateWindow = [newLines[0][0].getTime(), newLines[newLines.length - 1][0].getTime()];
                            }
                        }
                        $scope.currentChart.updateOptions($scope.rangeConfig);
                        $scope.currentChartOptions = $scope.rangeConfig;
                    }
                } else {
                    //  keep the same time window and refersh
                    $scope.chartDateTime = {
                        begin: $scope.chartDateTime.begin,
                        end: $scope.chartDateTime.end
                    };
                    $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                    $scope.loadingShow = false;
                }

            }


        };


        var updateChildrenDetailChart = function(metadata, store, rangeData, allData) {
            //relation
            var relationConfig = metadata.data.groups[2];
            // scatter view shows only one collection
            var collections = relationConfig.collections;
            var newLines = [];
            var newTime = [];
            var series = {};
            var labels = [];
            var colors = [];
            var leftAndRight = {
                left: relationConfig.leftYAxis,
                right: relationConfig.rightYAxis
            };
            var yRange = {
                min: null,
                max: null
            };


            var initScale = null;
            if (relationConfig.initScale) {
                initScale = relationConfig.initScale; // {left:{level:"",range:[num1,num2]},right:{}}
            }

            var counter = 0;
            var showY2axis = null;
            angular$1.forEach(allData, function(device) {
                counter++;
                if (device.data.length > 0) {
                    labels.push(device.device);
                    angular$1.forEach(collections, function(collection) {
                        if (collection.name == store) {
                            $scope.currentIntervalName = store;
                            if (collection.rows[0].yaxis == 0) {
                                series[collection.rows[0].label] = {
                                    'axis': 'y1',
                                };
                            } else {
                                series[collection.rows[0].label] = {
                                    'axis': 'y2'
                                };
                                showY2axis = true;
                                $scope.showY2Btns = true;
                            }
                            var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                            var filterF = null;
                            if (collection.rows[0].filter) {
                                filterF = collection.rows[0].filter;
                            }
                            var tempData = [];
                            var tempTime = [];
                            // make data
                            angular$1.forEach(device.data, function(data) {
                                var dateTime = new Date(data.timestamp);
                                try {
                                    var value = f(data);
                                    if ((filterF && filterF(value)) || !filterF) {
                                        tempData.push({
                                            timestamp: dateTime,
                                            value: value
                                        });

                                        if (yRange.min == null) {
                                            yRange.min = value;
                                        }

                                        if (yRange.max == null) {
                                            yRange.max = value;
                                        }

                                        if (yRange.min > value) {
                                            yRange.min = value;
                                        }

                                        if (yRange.max < value) {
                                            yRange.max = value;
                                        }
                                    } else {
                                        tempData.push({
                                            timestamp: dateTime,
                                            value: null
                                        });
                                    }
                                } catch (e) {
                                    tempData.push({
                                        timestamp: dateTime,
                                        value: null
                                    });
                                }
                                tempTime.push(dateTime.getTime());
                            });
                            newTime = newTime.concat(tempTime.filter(function(item) {
                                return newTime.indexOf(item) < 0;
                            }));
                            newLines.push({
                                device: device.device,
                                data: tempData
                            });
                        }
                    });
                }
            });

            var chartData = [];
            // time needs sort!!!
            newTime = newTime.sort();
            angular$1.forEach(newTime, function(nt) {
                chartData.push([new Date(nt)]);
            });


            angular$1.forEach(newLines, function(line) {
                angular$1.forEach(chartData, function(timeTicket) {
                    // line data
                    var flag = false;
                    var lineData = line.data;
                    for (var i = 0; i < lineData.length; i++) {
                        if (lineData[i].timestamp.getTime() == timeTicket[0].getTime()) {
                            timeTicket.push(lineData[i].value);
                            flag = true;
                            break;
                        }
                    }
                    if (flag != true) {
                        // we should use "NaN"
                        timeTicket.push(null);
                    }
                });
            });


            if (yRange.min == yRange.max && yRange.min != null && yRange.max != null) {
                yRange.min = yRange.min - (yRange.min) * 0.10;
                yRange.max = yRange.max + (yRange.max) * 0.10;
            }


            if (chartData.length == 0) {
                $scope.currentChart.updateOptions({
                    'file': []
                });
                $scope.loadingShow = false;
            } else {
                if ($scope.currentChart) {
                    var connectSeparatedPoints = false;
                    if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                        connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                    }

                    //rest colors by labels
                    colors = [];
                    labels.forEach(function(key) {
                        $scope.childrenColors.forEach(function(_item) {
                            if (_item.name == key) {
                                colors.push(_item.color);
                            }
                        });
                    });

                    if (showY2axis) {
                        $scope.currentChartOptions = {
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'pointSize': 2,
                            'legend': 'never',
                            'labelsKMB': true,
                            highlightCircleSize: 2,
                            strokeBorderWidth: 0,
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            labelsSeparateLines: false,
                            'file': chartData,
                            'labels': ['x'].concat(labels),
                            'ylabel': leftAndRight.left,
                            'y2label': leftAndRight.right,
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max],
                                    axisLabelWidth: 80
                                }
                            }
                        };
                        var _tempVisibility = [];
                        $scope.currentChart.getOption('visibility').forEach(function(v,_index){
                            if($scope.currentVisibility_[_index]){
                                _tempVisibility[_index] = $scope.currentVisibility_[_index];
                            }else{
                                if($scope.memoryVisibility[_index]){
                                    _tempVisibility[_index] = $scope.memoryVisibility[_index];
                                }else{
                                    _tempVisibility[_index] = v;
                                }
                            }
                            if($scope.childrenDevices && $scope.childrenDevices[_index] && $scope.childrenDevices[_index].hasOwnProperty("show")){
                                $scope.childrenDevices[_index]["show"] = _tempVisibility[_index];
                            }
                        });
                        $scope.currentVisibility_ = [];
                        $scope.memoryVisibility = [];
                        $scope.currentChart.updateOptions({
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'pointSize': 2,
                            'legend': 'never',
                            'labelsKMB': true,
                            'visibility':_tempVisibility,
                            highlightCircleSize: 2,
                            strokeBorderWidth: 0,
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            labelsSeparateLines: false,
                            'file': chartData,
                            'labels': ['x'].concat(labels),
                            'ylabel': leftAndRight.left,
                            'y2label': leftAndRight.right,
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max],
                                    axisLabelWidth: 80
                                }
                            }
                            // showRangeSelector: true
                        });
                    } else {
                        var newLines = [];
                        $scope.showY2Btns = false;
                        angular$1.copy(chartData, newLines);
                        angular$1.forEach(newLines, function(line) {
                            line.push(null);
                        });
                        series["span_y2"] = {
                            axis: 'y2'
                        };
                        $scope.currentChartOptions = {
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'pointSize': 2,
                            'legend': 'never',
                            'labelsKMB': true,
                            'file': newLines,
                            labelsSeparateLines: false,
                            'labels': ['x'].concat(labels).concat(["span_y2"]),
                            'ylabel': leftAndRight.left,
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            'y2label': "",
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max],
                                    axisLabelWidth: 80
                                },
                                "y2": {
                                    axisLabelFormatter: function(d) {
                                        return '';
                                    },
                                    axisLabelWidth: 80
                                }
                            }
                            // showRangeSelector: true
                        };


                        var _tempVisibility = [];
                        $scope.currentChart.getOption('visibility').forEach(function(v,_index){
                            if($scope.currentVisibility_[_index]){
                                _tempVisibility[_index] = $scope.currentVisibility_[_index];
                            }else{
                                if($scope.memoryVisibility[_index]){
                                    _tempVisibility[_index] = $scope.memoryVisibility[_index];
                                }else{
                                    _tempVisibility[_index] = v;
                                }
                            }
                            if($scope.childrenDevices && $scope.childrenDevices[_index] && $scope.childrenDevices[_index].hasOwnProperty("show")){
                                $scope.childrenDevices[_index]["show"] = _tempVisibility[_index];
                            }
                        });
                        $scope.currentVisibility_ = [];
                        $scope.memoryVisibility = [];
                        $scope.currentChart.updateOptions({
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'pointSize': 2,
                            'legend': 'never',
                            'labelsKMB': true,
                            'file': newLines,
                            'visibility':_tempVisibility,
                            labelsSeparateLines: false,
                            'labels': ['x'].concat(labels).concat(["span_y2"]),
                            'ylabel': leftAndRight.left,
                            highlightCircleSize: 2,
                            strokeBorderWidth: 0,
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            highlightCallback: function(e, x, pts, row, seriesName) {
                                if ($scope.currentView == -1) {
                                    // device view is using default legend
                                    return false;
                                }
                                // set current child device and will do show one
                                $scope.currentHighLightChildDevice = seriesName;
                                var maxWidth = e.target.offsetWidth;
                                var sn = "";
                                angular$1.forEach(series, function(value, name, item) {
                                    if (value.axis === "y1") {
                                        sn = name;
                                    }
                                });
                                var point_show = {
                                    x: 0,
                                    y: 0
                                };
                                // get device name columns
                                var relationConfig = metadata.data.groups[2];
                                angular$1.forEach(pts, function(item, index) {
                                    if (item.name === seriesName) {
                                        $scope.legendText = seriesName;
                                        var colorIndex = -1;
                                        //get index from childrenDevices
                                        angular$1.forEach($scope.childrenDevices, function(device, _index) {
                                            if (device.name == seriesName) {
                                                colorIndex = _index;
                                            }
                                        });

                                        $scope.childrenColors.forEach(function(_item) {
                                            if (_item.name == seriesName) {
                                                $scope.legendColor = _item.color;
                                            }
                                        });
                                        // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                        $scope.legendText_device = seriesName;
                                        $scope.legendText_device_name = "";
                                        // if the nameSd exist
                                        if ($scope.childTrees && $scope.childTrees.length > 0) {
                                            angular$1.forEach($scope.childTrees, function(item) {
                                                //
                                                if (item.name == seriesName) {
                                                    if (item[relationConfig.nameColumn]) {
                                                        $scope.legendText_device_name = item[relationConfig.nameColumn];
                                                    }
                                                }
                                            });
                                        }
                                        if ($scope.legendText_device_name == "") {
                                            //
                                            $scope.legendText_device_name = seriesName;
                                        }

                                        if (moment.tz.guess()) {
                                            $scope.legendText_datetime = moment(item.xval).tz(moment.tz.guess()).format('DD/MM/YYYY HH:mm:ss');
                                        } else {
                                            $scope.legendText_datetime = moment(item.xval).format('DD/MM/YYYY HH:mm:ss');
                                        }
                                        $scope.legendText_column = sn;
                                        $scope.legendText_value = item.yval;
                                        angular$1.forEach(pts, function(point) {
                                            if (point.name === seriesName) {
                                                point_show.y = point.canvasy + 30;
                                                point_show.x = point.canvasx + 30;
                                            }
                                        });
                                    }
                                });
                                var legendbox = angular$1.element("#legendbox" + element_id);

                                $scope.$apply(function() {
                                    $scope.legendTop = point_show.y;
                                    if (maxWidth < (point_show.x + 200)) {
                                        $scope.legendLeft = point_show.x - 200;
                                    } else {
                                        $scope.legendLeft = point_show.x;
                                    }
                                });

                            },

                            unhighlightCallback: function(e) {
                                $scope.$apply(function() {
                                    $scope.legendText = null;
                                    $scope.legendText_device = null;
                                    $scope.legendText_datetime = null;
                                    $scope.legendText_column = null;
                                    $scope.legendText_value = null;
                                });
                            },
                            'y2label': "",
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max],
                                    axisLabelWidth: 80
                                },
                                "y2": {
                                    axisLabelFormatter: function(d) {
                                        return '';
                                    },
                                    axisLabelWidth: 80
                                }
                            }
                            // showRangeSelector: true
                        });
                    }
                    // reset l & r axes window
                    var axesRight = $scope.currentChart.axes_[1];
                    var axesLeft = $scope.currentChart.axes_[0];
                    if (initScale && initScale.left && initScale.left.length > 0) {
                        //init scale found
                        initScale.left.forEach(function(_levelConfig) {
                            // find current
                            if (store == _levelConfig.level && !$scope.currentInitScaleLevelLeftConf) {
                                // found it
                                // set
                                axesLeft.valueWindow = _levelConfig.range;
                                $scope.currentInitScaleLevelLeftConf = _levelConfig;
                                $scope.currentChart.drawGraph_(false);
                            }
                        });
                    }

                    if (initScale && initScale.right && initScale.right.length > 0) {
                        //init scale found
                        initScale.right.forEach(function(_levelConfig) {
                            // find current
                            if (store == _levelConfig.level) {
                                // found it
                                // set
                                axesRight.valueWindow = _levelConfig.range;
                                $scope.currentInitScaleLevelRightConf = _levelConfig;
                                $scope.currentChart.drawGraph_(false);
                            }
                        });
                    }

                    $scope.loadingShow = false;
                }
            }
        };


        /**
         * update detail chart
         * @param metadata
         * @param store
         * @param rangeData
         * @param allData
         */
        var updateDetailChart = function(metadata, store, rangeData, allData) {

            var deviceConfig = metadata.data.groups[1];
            var collections = deviceConfig.collections;
            var labels = [];
            var series = {};
            var colors = [];
            var leftAndRight = {
                left: deviceConfig.leftYAxis,
                right: deviceConfig.rightYAxis
            };

            var initScale = null;
            if (deviceConfig.initScale) {
                initScale = deviceConfig.initScale; // {left:{level:"",range:[num1,num2]},right:{}}
            }

            var allLines = [];
            //0 for y  1 for y2
            var yRanges = [{
                min: null,
                max: null
            }, {
                min: null,
                max: null
            }];
            angular$1.forEach(collections, function(collection) {
                if (collection.name == store) {
                    angular$1.forEach(allData, function(line) {
                        allLines.push([new Date(line.timestamp)]);
                    });

                    // var yRange = {'min': null, 'max': null};
                    var showY2axis = false;
                    angular$1.forEach(collection.rows, function(row) {
                        labels.push(row.label);
                        colors.push(row.color);

                        if (row.yaxis == 0) {
                            series[row.label] = {
                                'axis': 'y1'
                            };
                        } else {
                            series[row.label] = {
                                'axis': 'y2'
                            };
                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }
                        var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");

                        var filterF = null;
                        if (row.filter) {
                            filterF = row.filter;
                        }

                        // add value
                        var counter = 0;
                        angular$1.forEach(allLines, function(realLine) {
                            try {
                                var value = f(allData[counter]);
                                if ((filterF && filterF(value)) || !filterF) {
                                    realLine.push(value);
                                    if (row.yaxis == 0) {
                                        if (yRanges[0].min == null) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max == null) {
                                            yRanges[0].max = value;
                                        }

                                        if (yRanges[0].min > value) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max < value) {
                                            yRanges[0].max = value;
                                        }
                                    } else {
                                        if (yRanges[1].min == null) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max == null) {
                                            yRanges[1].max = value;
                                        }

                                        if (yRanges[1].min > value) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max < value) {
                                            yRanges[1].max = value;
                                        }
                                    }
                                } else {
                                    realLine.push(value);
                                }
                            } catch (ex) {
                                realLine.push(null);
                            }
                            counter++;
                        });

                    });

                    angular$1.forEach(yRanges, function(yrange) {
                        if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                            yrange.min = yrange.min - (yrange.min) * 0.10;
                            yrange.max = yrange.max + (yrange.max) * 0.10;
                        }
                    });

                    if (allLines.length == 0) {
                        $scope.currentChart.updateOptions({
                            'file': [],
                            highlightSeriesOpts: {
                                strokeWidth: 1.5,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            }
                        });
                        if ($scope.rangeSelectorBar) {
                            $scope.currentChart["xAxisZoomRange"] = $scope.rangeSelectorBar.xAxisExtremes();
                        }
                        $scope.loadingShow = false;
                    } else {
                        if ($scope.currentChart) {
                            var connectSeparatedPoints = false;
                            if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                                connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                            }
                            if (showY2axis) {
                                $scope.currentChartOptions = {
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 2,
                                    'legend': 'follow',
                                    labelsSeparateLines: true,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    },
                                    'labelsKMB': true,
                                    'file': allLines,
                                    'labels': ['x'].concat(labels),
                                    'ylabel': leftAndRight.left,
                                    'y2label': leftAndRight.right,
                                    'series': series,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
                                        'y2': {
                                            'labelsKMB': true,
                                            valueRange: [yRanges[1].min, yRanges[1].max],
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'colors': colors
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                };

                                var _tempVisibility = [];
                                $scope.currentChart.getOption('visibility').forEach(function(v,_index){
                                    if($scope.currentVisibility_[_index]){
                                        _tempVisibility[_index] = $scope.currentVisibility_[_index];
                                    }else{
                                        if($scope.memoryVisibility[_index]){
                                            _tempVisibility[_index] = $scope.memoryVisibility[_index];
                                        }else{
                                            _tempVisibility[_index] = v;
                                        }
                                    }
                                    if($scope.childrenDevices && $scope.childrenDevices[_index] && $scope.childrenDevices[_index].hasOwnProperty("show")){
                                        $scope.childrenDevices[_index]["show"] = _tempVisibility[_index];
                                    }
                                });
                                $scope.currentVisibility_ = [];
                                $scope.memoryVisibility = [];
                                $scope.currentChart.updateOptions({
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 2,
                                    'legend': 'follow',
                                    'visibility': _tempVisibility,
                                    labelsSeparateLines: true,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    },
                                    'labelsKMB': true,
                                    'file': allLines,
                                    'labels': ['x'].concat(labels),
                                    'ylabel': leftAndRight.left,
                                    'y2label': leftAndRight.right,
                                    'series': series,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
                                        'y2': {
                                            'labelsKMB': true,
                                            valueRange: [yRanges[1].min, yRanges[1].max],
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'colors': colors
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                });
                            } else {
                                var newLines = [];
                                $scope.showY2Btns = false;
                                angular$1.copy(allLines, newLines);
                                angular$1.forEach(newLines, function(line) {
                                    line.push(null);
                                });

                                series["span-Y2"] = {
                                    axis: 'y2'
                                };

                                $scope.currentChartOptions = {
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 2,
                                    'legend': 'follow',
                                    labelsSeparateLines: true,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    },
                                    'labelsKMB': true,
                                    'file': newLines,
                                    'labels': ['x'].concat(labels).concat(['span_y2']),
                                    'ylabel': leftAndRight.left,
                                    'y2label': "",
                                    'series': series,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
                                        'y2': {
                                            axisLabelFormatter: function(d) {
                                                return '';
                                            },
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'colors': colors
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                };



                                var _tempVisibility = [];
                                $scope.currentChart.getOption('visibility').forEach(function(v,_index){
                                    if($scope.currentVisibility_[_index]){
                                        _tempVisibility[_index] = $scope.currentVisibility_[_index];
                                    }else{
                                        if($scope.memoryVisibility[_index]){
                                            _tempVisibility[_index] = $scope.memoryVisibility[_index];
                                        }else{
                                            _tempVisibility[_index] = v;
                                        }
                                    }
                                    if($scope.childrenDevices && $scope.childrenDevices[_index] && $scope.childrenDevices[_index].hasOwnProperty("show")){
                                        $scope.childrenDevices[_index]["show"] = _tempVisibility[_index];
                                    }
                                });
                                $scope.currentVisibility_ = [];
                                $scope.memoryVisibility = [];
                                $scope.currentChart.updateOptions({
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 2,
                                    'legend': 'follow',
                                    labelsSeparateLines: true,
                                    'visibility': _tempVisibility,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    },
                                    'labelsKMB': true,
                                    'file': newLines,
                                    'labels': ['x'].concat(labels).concat(['span_y2']),
                                    'ylabel': leftAndRight.left,
                                    'y2label': "",
                                    'series': series,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
                                        'y2': {
                                            axisLabelFormatter: function(d) {
                                                return '';
                                            },
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'colors': colors
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                });
                            }

                            // reset l & r axes window
                            var axesRight = $scope.currentChart.axes_[0];
                            var axesLeft = $scope.currentChart.axes_[1];
                            if (initScale && initScale.left && initScale.left.length > 0) {
                                //init scale found
                                initScale.left.forEach(function(_levelConfig) {
                                    // find current
                                    if (store == _levelConfig.level && !$scope.currentInitScaleLevelLeftConf) {
                                        // found it
                                        // set
                                        axesLeft.valueWindow = _levelConfig.range;
                                        $scope.currentInitScaleLevelLeftConf = _levelConfig;
                                        $scope.currentChart.drawGraph_(false);
                                    }
                                });
                            }

                            if (initScale && initScale.right && initScale.right.length > 0) {
                                //init scale found
                                initScale.right.forEach(function(_levelConfig) {
                                    // find current
                                    if (store == _levelConfig.level) {
                                        // found it
                                        // set
                                        axesRight.valueWindow = _levelConfig.range;
                                        $scope.currentInitScaleLevelRightConf = _levelConfig;
                                        $scope.currentChart.drawGraph_(false);
                                    }
                                });
                            }

                            $scope.loadingShow = false;
                        }
                    }


                }
            });


        };

        $scope.autoUpdateChart = updateDetailChart;

        /**
         * update range chart
         * @param metadata
         * @param store
         * @param allData
         */
        var updateChart = function(metadata, store, allData, rangeTree) {
            var deviceConfig = metadata.data.groups[1];
            var collections = deviceConfig.collections;
            var labels = [];
            var series = {};
            var colors = [];
            var leftAndRight = {
                left: deviceConfig.leftYAxis,
                right: deviceConfig.rightYAxis
            };
            var initScale = null;
            if (deviceConfig.initScale) {
                initScale = deviceConfig.initScale; // {left:{level:"",range:[num1,num2]},right:{}}
            }
            var allLines = [];
            //0 for y  1 for y2
            var yRanges = [{
                min: null,
                max: null
            }, {
                min: null,
                max: null
            }];
            angular$1.forEach(collections, function(collection) {
                if (collection.name == store) {
                    $scope.currentIntervalName = store;
                    angular$1.forEach(allData, function(line) {
                        allLines.push([new Date(line.timestamp)]);
                    });

                    $scope.rangeSeriesNumber = collection.rows.length;
                    var showY2axis = false;
                    angular$1.forEach(collection.rows, function(row) {
                        labels.push(row.label);
                        colors.push(row.color);

                        if (row.yaxis == 0) {
                            series[row.label] = {
                                'axis': 'y1'
                            };
                        } else {
                            series[row.label] = {
                                'axis': 'y2'
                            };
                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }

                        var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                        var filterF = null;
                        if (row.filter) {
                            filterF = row.filter;
                        }
                        // add value
                        var counter = 0;
                        angular$1.forEach(allLines, function(realLine) {
                            try {
                                var value = f(allData[counter]);
                                if ((filterF && filterF(value)) || !filterF) {
                                    realLine.push(value);
                                    if (row.yaxis == 0) {
                                        if (yRanges[0].min == null) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max == null) {
                                            yRanges[0].max = value;
                                        }

                                        if (yRanges[0].min > value) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max < value) {
                                            yRanges[0].max = value;
                                        }
                                    } else {
                                        if (yRanges[1].min == null) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max == null) {
                                            yRanges[1].max = value;
                                        }

                                        if (yRanges[1].min > value) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max < value) {
                                            yRanges[1].max = value;
                                        }
                                    }
                                } else {
                                    realLine.push(null);
                                }
                            } catch (ex) {
                                realLine.push(null);
                            }
                            counter++;
                        });

                    });

                    if ($scope.currentChart) {
                        $scope.rangeData = allLines;
                        var basicInfo = $scope.basicInfo;
                        if (basicInfo && basicInfo.range_show) {
                            var rangeBarLabels = [];
                            for (var i = 0; i < labels.length; i++) {
                                rangeBarLabels.push("l" + i);
                            }
                            var series_range = {
                                'l0': {
                                    axis: 'y1'
                                }
                            };
                            if (showY2axis) {
                                //noinspection JSDuplicatedDeclaration
                                series_range = {
                                    'l0': {
                                        axis: 'y1'
                                    },
                                    'l0': {
                                        axis: 'y2'
                                    }
                                };
                                $scope.rangeSeries = series_range;

                                $scope.rangeSelectorBar.updateOptions({
                                    'file': allLines,
                                    'labels': ['x'].concat(rangeBarLabels),
                                    'series': series_range,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    }
                                });
                            } else {
                                series_range["span_y2"] = {
                                    axis: 'y2'
                                };
                                $scope.showY2Btns = false;
                                $scope.rangeSeries = series_range;
                                var newLines = [];
                                angular$1.copy(allLines, newLines);
                                angular$1.forEach(newLines, function(line) {
                                    line.push(null);
                                });
                                $scope.rangeSelectorBar.updateOptions({
                                    'file': newLines,
                                    'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                    'series': series_range,
                                    highlightSeriesOpts: {
                                        strokeWidth: 1.5,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 2
                                    }
                                });
                                // save
                            }


                        }

                        angular$1.forEach(yRanges, function(yrange) {
                            if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                yrange.min = yrange.min - (yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.max) * 0.10;
                            }
                        });


                        // if graph has 2 yAxis or a yAxis
                        var connectSeparatedPoints = false;
                        if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                            connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                        }

                        if (showY2axis) {
                            $scope.rangeConfig = {
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'drawGapEdgePoints': true,
                                'pointSize': 2,
                                'legend': 'follow',
                                labelsSeparateLines: true,
                                highlightSeriesOpts: {
                                    strokeWidth: 1.5,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 2
                                },
                                'labelsKMB': true,
                                'file': allLines,
                                'labels': ['x'].concat(labels),
                                'ylabel': leftAndRight.left,
                                'y2label': leftAndRight.right,

                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRanges[0].min, yRanges[0].max],
                                        axisLabelWidth: 80
                                    },
                                    'y2': {
                                        'labelsKMB': true,
                                        valueRange: [yRanges[1].min, yRanges[1].max],
                                        axisLabelWidth: 80
                                    }
                                },
                                'dateWindow': [allLines[0][0], allLines[allLines.length - 1][0]],
                                // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                // showRangeSelector: true
                            };
                        } else {
                            series['span_y2'] = {
                                axis: 'y2'
                            };
                            $scope.showY2Btns = false;
                            var newLines = [];
                            angular$1.copy(allLines, newLines);
                            angular$1.forEach(newLines, function(line) {
                                line.push(null);
                            });
                            $scope.rangeConfig = {
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'drawGapEdgePoints': true,
                                'pointSize': 2,
                                'legend': 'follow',
                                labelsSeparateLines: true,
                                highlightSeriesOpts: {
                                    strokeWidth: 1.5,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 2
                                },
                                'labelsKMB': true,
                                'file': newLines,
                                'labels': ['x'].concat(labels).concat(['span_y2']),
                                'ylabel': leftAndRight.left,
                                'y2label': "",
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRanges[0].min, yRanges[0].max],
                                        axisLabelWidth: 80
                                    },
                                    'y2': {
                                        axisLabelFormatter: function(d) {
                                            return '';
                                        },
                                        axisLabelWidth: 80
                                    }
                                },
                                'dateWindow': [allLines[0][0], allLines[allLines.length - 1][0]],
                                // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                // showRangeSelector: true
                            };
                        }


                        if (basicInfo && basicInfo.range_show) {
                            $scope.rangeSelectorBar["_name_fgp"] = "rangebar";
                            $scope.currentChart["_name_fgp"] = deviceConfig;
                            Dygraph.synchronize([$scope.rangeSelectorBar, $scope.currentChart], {
                                zoom: true,
                                selection: false,
                                range: false
                            });
                        }


                        if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                            // keep the current range bar refresh once.
                            $scope.chartDateTime = {
                                begin: $scope.chartDateTime.begin,
                                end: $scope.chartDateTime.end
                            };
                            $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                        } else {

                            $scope.currentChart["xAxisZoomRange"] = [allLines[0][0], allLines[allLines.length - 1][0]];
                            if (begin_path && end_path && !init_flag) {
                                // $scope.chartDateTime = {
                                // "begin": new Date(new Number(begin_path)),
                                // "end": new Date(new Number(end_path))
                                // };
                                $scope.chartDateWindow = [new Date(new Number(begin_path)).getTime(), new Date(new Number(end_path)).getTime()];
                                $scope.rangeConfig.dateWindow = [new Date(new Number(begin_path)).getTime(), new Date(new Number(end_path)).getTime()];
                                init_flag = true;
                            } else {
                                if ($scope.currentIntervalChoosed && ((allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= allLines[0][0].getTime())) {
                                    $scope.rangeConfig.dateWindow = [allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval, allLines[allLines.length - 1][0].getTime()];
                                } else {
                                    $scope.chartDateWindow = [allLines[0][0].getTime(), allLines[allLines.length - 1][0].getTime()];
                                    $scope.rangeConfig.dateWindow = [allLines[0][0].getTime(), allLines[allLines.length - 1][0].getTime()];
                                }
                            }
                            $scope.currentChart.updateOptions($scope.rangeConfig);
                            // reset l & r axes window
                            var axesRight = $scope.currentChart.axes_[1];
                            var axesLeft = $scope.currentChart.axes_[0];
                            if (initScale && initScale.left && initScale.left.length > 0) {
                                //init scale found
                                initScale.left.forEach(function(_levelConfig) {
                                    // find current
                                    if (store == _levelConfig.level && !$scope.currentInitScaleLevelLeftConf) {
                                        // found it
                                        // set
                                        axesLeft.valueWindow = _levelConfig.range;
                                        $scope.currentInitScaleLevelLeftConf = _levelConfig;
                                        $scope.currentChart.drawGraph_(false);
                                    }
                                });
                            }

                            if (initScale && initScale.right && initScale.right.length > 0) {
                                //init scale found
                                initScale.right.forEach(function(_levelConfig) {
                                    // find current
                                    if (store == _levelConfig.level) {
                                        // found it
                                        // set
                                        axesRight.valueWindow = _levelConfig.range;
                                        $scope.currentInitScaleLevelRightConf = _levelConfig;
                                        $scope.currentChart.drawGraph_(false);
                                    }
                                });
                            }


                            $scope.currentChartOptions = $scope.rangeConfig;
                        }
                        //bind
                        $scope.loadingShow = false;
                    }

                }
            });
        };

        $scope.chartDateTime = {
            begin: null,
            end: null
        };


        $scope.drillDown = function() {
            //get redirect configuration from interactions
            if ($scope.currentView == 1 && $scope.currentHighLightChildDevice && $scope.drill && $scope.drill.graphs && $scope.drill.graphs.drillDown && $scope.drill.graphs.drillDown.url) {
                //
                var url = $scope.drill.graphs.drillDown.url;
                url = url.replace("{0}", $scope.currentHighLightChildDevice);
                $window.open(url);
            }
        };
        // function for show one
        $scope.showOne = function(deviceName) {

            if ($rootScope['standalone'] && $rootScope['standalone'] == true) {
                return false;
            }

            // device type is
            if ($location.url().indexOf('/app/page/param/') != -1) {
                //open window
                $window.open("/admin/#/app/page/param/" + $rootScope.applicationName + "/" + metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1]));
            } else {
                //open window
                $window.open("/admin/#" + $location.url().replace("show", "param").replace($location.url().substr($location.url().lastIndexOf('/', $location.url().lastIndexOf('/') - 1) + 1), metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1])));
            }

        };


        var btntimer = null;

        $scope.btnZoomInVLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        $scope.btnZoomOutVLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        $scope.btnZoomInVRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        $scope.btnZoomOutVRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        $scope.btnPanVULeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = [];
            if (yAxes[0].valueWindow) {
                range = yAxes[0].valueWindow;
            } else {
                range = yAxes[0].valueRange;
            }
            yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };


        $scope.btnPanVDLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = [];
            if (yAxes[0].valueWindow) {
                range = yAxes[0].valueWindow;
            } else {
                range = yAxes[0].valueRange;
            }
            yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };


        $scope.btnPanVURight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = [];
            if (yAxes[1].valueWindow) {
                range = yAxes[1].valueWindow;
            } else {
                range = yAxes[1].valueRange;
            }
            yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        $scope.btnPanVDRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = [];
            if (yAxes[1].valueWindow) {
                range = yAxes[1].valueWindow;
            } else {
                range = yAxes[1].valueRange;
            }
            yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(true);
        };

        // functions for buttons
        $scope.btnpanleft = function() {
            // get current datetime window
            var g = $scope.currentChart;
            if($scope.memoryVisibility && $scope.memoryVisibility.length == 0 && $scope.hp && $scope.hp == true){
                $scope.memoryVisibility = g.getOption("visibility");
                var _tempVi = [];
                $scope.currentChart.getOption("visibility").forEach(function(_v, _index){
                    _tempVi[_index] = false;
                });
                $scope.currentChart.updateOptions({"visibility":_tempVi});
            }
            var panRange = g.xAxisZoomRange;
            if (g.xAxisZoomRange[0] instanceof Date) {
                panRange[0] = g.xAxisZoomRange[0].getTime();
            }
            if (g.xAxisZoomRange[1] instanceof Date) {
                panRange[1] = g.xAxisZoomRange[1].getTime();
            }

            //split range to 20 pieces
            var pan_delta = (panRange[1] - panRange[0]) / 20;
            var startDate;
            var endDate;
            if ($scope.chartDateWindow[0] instanceof Date) {
                if (($scope.chartDateWindow[0].getTime() - pan_delta) < panRange[0]) {
                    // go to the left
                    startDate = panRange[0];
                } else {
                    startDate = $scope.chartDateWindow[0].getTime() - pan_delta;
                }
            } else {
                if (($scope.chartDateWindow[0] - pan_delta) < panRange[0]) {
                    // go to the left
                    startDate = panRange[0];
                } else {
                    startDate = $scope.chartDateWindow[0] - pan_delta;
                }
            }

            if ($scope.chartDateWindow[1] instanceof Date) {
                if (($scope.chartDateWindow[1].getTime() - pan_delta) < (panRange[0] + pan_delta)) {
                    // go to the left
                    endDate = panRange[0] + pan_delta;
                } else {
                    endDate = $scope.chartDateWindow[1].getTime() - pan_delta;
                }
            } else {
                if (($scope.chartDateWindow[1] - pan_delta) < (panRange[0] + pan_delta)) {
                    // go to the left
                    endDate = panRange[0] + pan_delta;
                } else {
                    endDate = $scope.chartDateWindow[1] - pan_delta;
                }
            }

            //update graph
            $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
            g.updateOptions({
                dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
            });

            if (btntimer) {
                $timeout.cancel(btntimer);
            }

            btntimer = $timeout(function() {
                btntimer = null;
                $scope.chartDateTime = {
                    begin: new Date(new Number(startDate)),
                    end: new Date(new Number(endDate))
                };
            }, 600);
        };

        $scope.btnpanright = function() {
            // get current datetime window
            var g = $scope.currentChart;
            if($scope.memoryVisibility && $scope.memoryVisibility.length == 0 && $scope.hp && $scope.hp == true){
                $scope.memoryVisibility = g.getOption("visibility");
                var _tempVi = [];
                $scope.currentChart.getOption("visibility").forEach(function(_v, _index){
                    _tempVi[_index] = false;
                });
                $scope.currentChart.updateOptions({"visibility":_tempVi});
            }
            var panRange = g.xAxisZoomRange;
            if (g.xAxisZoomRange[0] instanceof Date) {
                panRange[0] = g.xAxisZoomRange[0].getTime();
            }
            if (g.xAxisZoomRange[1] instanceof Date) {
                panRange[1] = g.xAxisZoomRange[1].getTime();
            }

            //split range to 20 pieces
            var pan_delta = (panRange[1] - panRange[0]) / 20;
            var startDate;
            var endDate;
            if ($scope.chartDateWindow[0] instanceof Date) {
                if (($scope.chartDateWindow[0].getTime() + pan_delta) < (panRange[1] - pan_delta)) {
                    // go to the left
                    startDate = $scope.chartDateWindow[0].getTime() + pan_delta;
                } else {
                    startDate = (panRange[1] - pan_delta);
                }
            } else {
                if (($scope.chartDateWindow[0] + pan_delta) < (panRange[1] - pan_delta)) {
                    // go to the left
                    startDate = ($scope.chartDateWindow[0] + pan_delta);
                } else {
                    startDate = (panRange[1] - pan_delta);
                }
            }

            if ($scope.chartDateWindow[1] instanceof Date) {
                if (($scope.chartDateWindow[1].getTime() + pan_delta) < panRange[1]) {
                    // go to the left
                    endDate = ($scope.chartDateWindow[1].getTime() + pan_delta);
                } else {
                    endDate = panRange[1];
                }
            } else {
                if (($scope.chartDateWindow[1] + pan_delta) < panRange[1]) {
                    // go to the left
                    endDate = ($scope.chartDateWindow[1] + pan_delta);
                } else {
                    endDate = panRange[1];
                }
            }

            //update graph
            if (btntimer) {
                $timeout.cancel(btntimer);
            }

            $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
            g.updateOptions({
                dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
            });

            btntimer = $timeout(function() {
                btntimer = null;
                $scope.chartDateTime = {
                    begin: new Date(new Number(startDate)),
                    end: new Date(new Number(endDate))
                };
            }, 600);
        };


        $scope.btnzoomin = function() {
            // get current datetime window
            var g = $scope.currentChart;
            if($scope.memoryVisibility && $scope.memoryVisibility.length == 0 && $scope.hp && $scope.hp == true){
                $scope.memoryVisibility = g.getOption("visibility");
                var _tempVi = [];
                $scope.currentChart.getOption("visibility").forEach(function(_v, _index){
                    _tempVi[_index] = false;
                });
                $scope.currentChart.updateOptions({"visibility":_tempVi});
            }
            //split range to 20 pieces
            var startDate;
            var endDate;

            var rangeStart = $scope.chartDateWindow[0];
            if ($scope.chartDateWindow[0] instanceof Date) {
                rangeStart = $scope.chartDateWindow[0].getTime();
            }
            var rangeEnd = $scope.chartDateWindow[1];
            if ($scope.chartDateWindow[1] instanceof Date) {
                rangeEnd = $scope.chartDateWindow[1].getTime();
            }

            var delta = (rangeEnd - rangeStart) / 20;

            startDate = rangeStart + (delta * 2);
            endDate = rangeEnd - (delta * 2);
            //update graph
            $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
            //
            g.updateOptions({
                dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
            });

            if (btntimer) {
                $timeout.cancel(btntimer);
            }

            btntimer = $timeout(function() {
                $scope.chartDateTime = {
                    begin: new Date(new Number(startDate)),
                    end: new Date(new Number(endDate))
                };
            }, 600);
        };

        $scope.btnzoomout = function() {
            // get current datetime window
            var g = $scope.currentChart;
            if($scope.memoryVisibility && $scope.memoryVisibility.length == 0 && $scope.hp && $scope.hp == true){
                $scope.memoryVisibility = g.getOption("visibility");
                var _tempVi = [];
                $scope.currentChart.getOption("visibility").forEach(function(_v, _index){
                    _tempVi[_index] = false;
                });
                $scope.currentChart.updateOptions({"visibility":_tempVi});
            }
            var panRange = g.xAxisZoomRange;
            if (g.xAxisZoomRange[0] instanceof Date) {
                panRange[0] = g.xAxisZoomRange[0].getTime();
            }
            if (g.xAxisZoomRange[1] instanceof Date) {
                panRange[1] = g.xAxisZoomRange[1].getTime();
            }
            //split range to 20 pieces
            var startDate;
            var endDate;

            var rangeStart = $scope.chartDateWindow[0];
            if ($scope.chartDateWindow[0] instanceof Date) {
                rangeStart = $scope.chartDateWindow[0].getTime();
            }
            var rangeEnd = $scope.chartDateWindow[1];
            if ($scope.chartDateWindow[1] instanceof Date) {
                rangeEnd = $scope.chartDateWindow[1].getTime();
            }

            var delta = (rangeEnd - rangeStart) / 20;

            if ((rangeStart - (delta * 2)) > panRange[0]) {
                startDate = rangeStart - (delta * 2);
            } else {
                startDate = panRange[0];
            }

            if ((rangeEnd + (delta * 2)) < panRange[1]) {
                endDate = rangeEnd + (delta * 2);
            } else {
                endDate = panRange[1];
            }

            //update graph
            $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
            g.updateOptions({
                dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
            });

            if (btntimer) {
                $timeout.cancel(btntimer);
            }

            btntimer = $timeout(function() {
                $scope.chartDateTime = {
                    begin: new Date(new Number(startDate)),
                    end: new Date(new Number(endDate))
                };
            }, 600);
        };

        $scope.currentGxAxisRange = [];

        $scope.currentVisibility_ = [];

        $scope.refershTimer;
        $scope.refersh = function(g, init, childGraph) {
            if (init || (g.xAxisRange()[0] != $scope.chartDateTime.begin || g.xAxisRange()[1] != $scope.chartDateTime.end)) {
                if ($scope.refershTimer) {
                    g["hideLines"] = true;
                    if($scope.currentVisibility_.length == 0){
                        $scope.currentVisibility_ = [].concat($scope.currentChart.getOption("visibility"));
                    }
                    $timeout.cancel($scope.refershTimer);
                }
                $scope.refershTimer = $timeout(function() {
                    $scope.refershTimer = null;
                    g["hideLines"] = false;
                    $scope.chartDateTime = {
                        begin: g.xAxisRange()[0],
                        end: g.xAxisRange()[1]
                    };
                }, 300);
            }
        };

    }

};


fgpWidgetGraph.buildFactory = function buildFactory ($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile, $q) {
    fgpWidgetGraph.instance = new fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile, $q);
    return fgpWidgetGraph.instance;
};

fgpWidgetGraph
    .$inject = ['$timeout', 'dataService', '$rootScope', '$interval', '$filter', '$location', '$stateParams', '$compile', '$q'];

/**
 * Created by ericwang on 20/06/2016.
 */
var fgpWidgetPageTitle = function fgpWidgetPageTitle() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetPageTitle.prototype.template = function template (element, attrs) {
    var element_id = attrs.id;
    //drag-channel  item means this widget accepts items
    var dom_show = '<div class="" id="' + element_id + '">' +
        '<div class="{{css.width}}" style="-webkit-user-select: none; /* Chrome all / Safari all */  -moz-user-select: none; /* Firefox all */  -ms-user-select: none; /* IE 10+ */  user-select: none;">' +
        '<div style="border-color:{{css.border.color || \'#fff\'}};">' +
        '<div id="edit' + element_id + '" style="min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"">' +
        '<h1>{{css.title.text}}</h1>' +
        '<h3>{{css.subtitle.text}}</h3>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    return dom_show;
};


fgpWidgetPageTitle.prototype.controller = function controller ($scope, $element) {
    var metadata = null;
    var element_id = $element.attr("id");
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    if (widgetData.data && widgetData.from == "show") {
        metadata = widgetData.data.metadata;
        $scope.css = {};
        $scope.css["color"] = metadata.css.color;
        $scope.css["width"] = metadata.css.width;
        $scope.css["minHeight"] = metadata.css.minHeight;
        $scope.css["border"] = {};
        $scope.css["border"]["color"] = metadata.css.border.color;
        $scope.css["background"] = {};
        $scope.css["background"]["color"] = metadata.css.background.color;
        $scope.css["title"] = metadata.css.title;
        $scope.css["title"]["color"] = metadata.css.title.color;
        $scope.css["title"]["show"] = metadata.css.title.show;
        $scope.css["subtitle"] = metadata.css.subtitle;
        $scope.css["subtitle"]["color"] = metadata.css.subtitle.color;
        $scope.css["subtitle"]["show"] = metadata.css.subtitle.show;

        $scope.data_from = "application";
        $scope.parent_container = widgetData.data.parent;

        $scope.$on('deviceInfoEvent', function (event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            var f = new Function("device", "with(device) { return " + $scope.css["title"].text + "}");
            $scope.css["title"].text = f(deviceData.device);
            f = new Function("device", "with(device) { return " + $scope.css["subtitle"].text + "}");
            $scope.css["subtitle"].text = f(deviceData.device);
        });
    }




};

fgpWidgetPageTitle.buildFactory = function buildFactory () {
    fgpWidgetPageTitle.instance = new fgpWidgetPageTitle();
    return fgpWidgetPageTitle.instance;
};

/**
 * Created by ericwang on 20/06/2016.
 */
var fgpWidgetMap = function fgpWidgetMap() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetMap.prototype.template = function template (element, attrs) {
    var dom_show = '<div class = "{{css.width}}" style="padding:0px;height:{{css.height}}px;" map-lazy-load="https://maps.google.com/maps/api/js">' +
        '<ng-map style="height: 100%;width: 100%;" center="{{center}}" zoom="15">' +
        '<marker on-click="map.showInfoWindow(\'info_' + attrs.id + '\')" id="marker_' + attrs.id + '" ng-repeat="item in markers" icon="{{item.image}}" position="{{item.latitude}},{{item.longitude}}" title="{{item.name}}" animation="Animation.DROP" ></marker>' +
        '</ng-map>' +
        '</div>' +
        '';
    return dom_show;
};


fgpWidgetMap.prototype.controller = function controller ($scope, $element) {
    var metadata = null;
    var element_id = $element.attr("id");
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    /**
     * get device information
     */
    if (widgetData.data && widgetData.from == "show") {
        $scope.data_from = "application";
        $scope.parent_container = widgetData.data.parent;

        $scope.$on('deviceInfoEvent', function (event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            metadata = widgetData.data.metadata;

            $scope.showdata = widgetData.data;

            $scope.css = {
                width: "col-md-12",
                height: "400"
            };
            if ($scope.showdata.metadata.css) {
                $scope.css = $scope.showdata.metadata.css;
            }

            var location = {};
            $scope.markers = [];
            $scope.details = $scope.$parent.device;


            // show one point.
            var f = null;
            angular$1.forEach($scope.showdata.metadata.data, function (item) {
                try {
                    f = new Function("device", "with(device) { return " + item.value + ";}");
                    var result = f(deviceData.device);
                    if (result) {
                        location[item.label] = result;
                    } else {
                        location[item.label] = "";
                    }
                } catch (error) {
                    // show image
                    if ("image" == item.label) {
                        location[item.label] = item.value;
                    } else {
                        location[item.label] = "";
                    }

                }
            });


            //do not show
            if (location.latitude == "" || location.longitude == "") {
                //hard code. the location is Melbourne
                location.latitude = "-37.810000";
                location.longitude = "144.950000";
                $scope.center = [location.latitude, location.longitude];
                // $scope.markers.push(location);
            } else {
                $scope.center = [location.latitude, location.longitude];
                $scope.markers.push(location);
            }

        });
    }

};

fgpWidgetMap.buildFactory = function buildFactory () {
    fgpWidgetMap.instance = new fgpWidgetMap();
    return fgpWidgetMap.instance;
};

/**
 * Created by ericwang on 20/06/2016.
 */
var fgpWidgetDeviceDetail = function fgpWidgetDeviceDetail() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetDeviceDetail.prototype.template = function template (element, attrs) {
    return '<div class = "{{css.width}}" style="padding:0px;"><div class="row" style="height: {{css.height}}px;">' +
        '<div class="row" ng-repeat="item in data">' +
        '<div class="col-xs-4 col-md-4" style="text-align: right; font-weight: bold;line-height: 30px;">{{item.label}}</div><div class="col-xs-8 col-md-8" style="text-align: left;line-height: 30px;">{{item.value}}</div>' +
        '</div>' +
        '</div>' +
        '<div id="detail_status_' + attrs.id + '" class="row" style="min-height: 50px;">' +
        '</div>' +
        '</div>';
};


fgpWidgetDeviceDetail.prototype.controller = function controller ($scope, $element) {
    var metadata = null;
    var element_id = $element.attr("id");
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });


    /**
     * get device information
     */
    if (widgetData.data && widgetData.from == "show") {

        $scope.data_from = "application";
        $scope.parent_container = widgetData.data.parent;

        $scope.$on('deviceInfoEvent', function (event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            metadata = widgetData.data.metadata;

            $scope.showdata = widgetData.data;

            $scope.css = {
                width: "col-md-12",
                height: "400"
            };
            if ($scope.showdata.metadata.css) {
                $scope.css = $scope.showdata.metadata.css;
            }


            $scope.data = [];
            //get all columns
            var f = null;
            angular$1.forEach($scope.showdata.metadata.data, function (item) {
                try {
                    f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                    item.value = f(deviceData.device);
                    $scope.data.push(item);
                } catch (error) {
                    item.value = "";
                    $scope.data.push(item);
                }
            });


        });

    }

};


fgpWidgetDeviceDetail.buildFactory = function buildFactory () {
    fgpWidgetDeviceDetail.instance = new fgpWidgetDeviceDetail();
    return fgpWidgetDeviceDetail.instance;
};

/**
 * Created by ericwang on 20/06/2016.
 */
var fgpWidgetSpan = function fgpWidgetSpan() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetSpan.prototype.template = function template (scope, element) {
    return '<div class = "{{css.width}}" style="padding:0px;"><div class="row" style="height: {{css.height}}px;">' +
        '</div>';
};

fgpWidgetSpan.prototype.controller = function controller ($scope, $element) {

    var element_id = $element.attr("id");
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    $scope.showdata = widgetData.data;
    $scope.css = {
        width: "col-md-12",
        height: "400"
    };
    if ($scope.showdata.metadata.css) {
        $scope.css = $scope.showdata.metadata.css;
    }
};

fgpWidgetSpan.buildFactory = function buildFactory () {
    fgpWidgetSpan.instance = new fgpWidgetSpan();
    return fgpWidgetSpan.instance;
};

/**
 * Created by ericwang on 20/06/2016.
 */
var fgpWidgetPie = function fgpWidgetPie($timeout) {
    this.restrict = 'E';
    this.scope = {};
    this.$timeout = $timeout;
};


fgpWidgetPie.prototype.template = function template (element, attrs) {
    return '<div class = "{{css.width}}" ><div style="height: {{css.height}}px;">' +
        '<canvas class="fgpPieChart"></canvas>' +
        '</div>' +
        '</div>';
};

fgpWidgetPie.prototype.link = function link (scope, element) {

    this.$timeout(function () {
        var ctx = element.find("canvas")[0];
        scope.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['1'],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: []
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                legend: {display: true}
            }
        });
    });
};


fgpWidgetPie.prototype.controller = function controller ($scope, $element, $timeout) {

    var id = $element.attr("id");
    var metadata = null;
    var widgetData = null;

    $scope.$emit('fetchWidgetMetadataEvent', {
        id: id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    if (widgetData.from == "show" && widgetData.data) {
        $scope.data_from = "application";
        $scope.parent_container = widgetData.data.parent;

        $scope.$on('deviceInfoEvent', function (event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            metadata = widgetData.data.metadata;
            $scope.showdata = widgetData.data;
            $scope.css = {
                width: "col-md-12",
                height: "400"
            };
            if ($scope.showdata.metadata.css) {
                $scope.css = $scope.showdata.metadata.css;
            }
            $scope.data = [];
            var colors = [];
            //get all columns
            var f = null;
            angular$1.forEach($scope.showdata.metadata.data, function (item) {
                try {
                    f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                    item.value = f(deviceData.device);
                    $scope.data.push(item);
                } catch (error) {
                    item.value = item.value;
                    $scope.data.push(item);
                }
                if (item.color) {
                    colors.push(item.color);
                } else {
                    colors.push('#' + (function co(lor) {
                            return (lor +=
                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)])
                            && (lor.length == 6) ? lor : co(lor);
                        })(''));
                }
            });
            // timeout
            $scope.pieData = {labels: [], value: []};
            $timeout(function () {
                // create data
                angular$1.forEach($scope.data, function (item) {
                    $scope.pieData.labels.push(item.label);
                    $scope.pieData.value.push(item.value);
                });

                $scope.chart.data.labels = $scope.pieData.labels;
                $scope.chart.data.datasets[0].data = $scope.pieData.value;
                $scope.chart.data.datasets[0].backgroundColor = colors;
                // update chart
                $scope.chart.update();
            });

        });


    }


};

fgpWidgetPie.buildFactory = function buildFactory ($timeout) {
    fgpWidgetPie.instance = new fgpWidgetPie($timeout);
    return fgpWidgetPie.instance;
};
fgpWidgetPie.$inject = ['$timeout'];

/**
 * Created by eric on 22/11/16.
 */

var fgpDockerButton = function fgpDockerButton() {
    this.restrict = 'E';
    this.scope = {};
};


fgpDockerButton.prototype.template = function template (element, attrs) {
    var show_dom = '<div class="col-xs-12 btn-group" role="group" style="padding: 2px;" aria-label="...">' +
        '<div style="float: right;">' +
        '<button type="button" class="btn btn-{{button.color}} btn-xs" ' +
        ' ng-click="action(button)" ng-repeat="button in buttons" ng-show="checkShow(button)"><i class="fa {{button.icon}}"' +
        ' aria-hidden="true"></i>' +
        '</button>' +
        '</div>' +
        '</div>';
    return show_dom;
};


fgpDockerButton.prototype.controller = function controller ($scope, $element, $http, $timeout) {

    $scope.stats = "";

    // get configuration
    var id = $element.attr("id");
    var configuration = null;
    var confData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: id, callback: function (data) {
            if (data) {
                configuration = data.data.metadata.data;
                confData = data.data;
            }
        }
    });

    var repeateId = [];

    var pageDevice = null;
    $scope.$on('deviceInfoEvent', function (event, data) {
        pageDevice = data.device;
    });

    $scope.$on('containerStatusEvent', function (event, data) {
        if (data.application === repeateId[2] && data.container === repeateId[0] && data.host === repeateId[1]) {
            $scope.stats = data.stats;
        }
    });

    $scope.checkShow = function (button) {


        if (button.hasOwnProperty("shown") && button.shown) {
            return true;
        }


        if (button.type === "stop") {
            if ($scope.stats === "running") {
                return true;
            } else {
                return false;
            }
        } else if (button.type === "start") {
            if ($scope.stats === "exited" || $scope.stats === "created") {
                return true;
            } else {
                return false;
            }
        } else if (button.type === "delete") {
            if ($scope.stats === "exited" || $scope.stats === "created") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    // how many buttons?
    $scope.buttons = [];

    if ($scope.$parent.repeat) {
        repeateId = $scope.$parent.repeat.split(",");
    }

    angular.forEach(configuration, function (item) {
        if (item.label == "buttons") {
            $scope.buttons = item.value;
        }
    });

    $scope.healthinfo = "";


    // submit "action" to rest api
    $scope.action = function (button) {
        if (button.hasOwnProperty("shown") && button.shown) {
            // send request through $http
            $http({
                method: 'POST',
                url: '/api/docker/exec',
                data: {
                    func: button.func,
                    script: button.script,
                    deviceName: pageDevice.name,
                    deviceKey: pageDevice.key.id,
                    relationship: 'node_application'
                }
            }).then(function successCallback(response) {
                console.info(response.data);
            }, function errorCallback(response) {
                console.error(response.data);
            });
        } else {
            // send request through $http
            $http({
                method: 'POST',
                url: '/api/docker/hosts/action',
                data: {
                    func: button.func,
                    script: button.script,
                    container: repeateId[0],
                    host: repeateId[1],
                    application: repeateId[2]
                }
            }).then(function successCallback(response) {
                console.info(response.data);
            }, function errorCallback(response) {
                console.error(response.data);
            });
        }

    };
};


fgpDockerButton.buildFactory = function buildFactory () {
    fgpDockerButton.instance = new fgpDockerButton();
    return fgpDockerButton.instance;
};

/**
 * Created by ericwang on 15/06/2016.
 */
var fgpWidgetRepeatContainer = function fgpWidgetRepeatContainer($http) {
    this.restrict = 'E';
    this.scope = {};
    this._$http = $http;
};

fgpWidgetRepeatContainer.prototype.template = function template (element, attrs) {
    var flag = attrs.hasOwnProperty("shown");
    var showTitle = attrs.hasOwnProperty("showtitle");
    var element_id = attrs.id;
    var dom_show = '<div class="" id="' + element_id + '_{{$index}}" repeat-id="{{item.device.key.id}}" ng-repeat="item in items" emit-last-repeater-element style="padding-left: 2px; padding-right: 2px;">' +
        '<div class="{{css.width}}" style="padding-left: 1px; padding-right: 1px;">' +
        '<div class="panel" style="border-color:{{css.border.color || \'#fff\'}};">' +
        '<div class="panel-heading" style="background-color: {{css.title.color || \'#fff\'}};"><i class="fa fa-desktop" aria-hidden="true" style="margin-right: 5px;"></i>{{item.device.name}}</div>' +
        '<div class="panel-body"  style="padding:0px;min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\'}};">' +
        '<div style="float:left;padding-top: 5px;padding-left:5px;padding-right:5px;">' +
        '<span style="float:left;margin-right: 5px;" class="label label-{{labelstyle[$index]}}" ng-repeat="label in labels">{{label}}:{{item.labels[label]}}</span>' +
        '<span style="float:left;margin-right: 5px;" class="label label-success" ng-click="healthcheck(item)">{{item.health}}</span>' +
        '</div>' +
        '<div class="col-md-12 col-xs-12" style="padding-top: 5px;padding-left:5px;padding-right:5px;float:left;max-height: 200px; overflow-y: auto;" id="edit' + element_id + '" list-type="{{listStyle}}">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div></div>';
    var dom_show_notitle = '<div class="" id="' + element_id + '_{{$index}}" ng-repeat="item in items" repeat-id="{{item.device.key.id}}">' +
        '<div class="{{css.width}}" style="margin-bottom:15px;padding-left: 2px; padding-right: 2px;">' +
        '<div style="border-color:{{css.border.color || \'#fff\'}};">' +
        '<div style="min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"></div>' +
        '<div style="float:left;padding-top: 5px;padding-left:5px;padding-right:5px;">' +
        '<span style="float:left;margin-right: 5px;" class="label label-{{labelstyle[$index]}}" ng-repeat="label in labels">{{label}}:{{item.labels[label]}}</span>' +
        '<span style="float:left;margin-right: 5px;" class="label label-success" ng-click="healthcheck(item)">{{item.health}}</span>' +
        '</div>' +
        '<div class="col-md-12 col-xs-12" style="padding-top: 5px;padding-left:5px;padding-right:5px;float:left;max-height: 200px; overflow-y: auto;" id="edit' + element_id + '" list-type="{{listStyle}}">' +
        '</div>' +
        '</div>' +
        '</div></div>';

    // show or design
    if (flag) {
        if (showTitle) {
            return dom_show;
        } else {
            // without title
            return dom_show_notitle;
        }
    }
};

fgpWidgetRepeatContainer.prototype.controller = function controller ($scope, $element, dataService, $rootScope, $timeout, $http, $location, $stateParams, $websocket) {
    // only show
    var element_id = $element.attr("id");

    var widgetData = null;

    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });
    // all items
    $scope.items = [];

    $scope.labelstyle = ["default", "primary", "success", "info", "warning", "danger"];


    var metadata = widgetData.data.metadata;
    $scope.css = {};
    $scope.css["color"] = metadata.css.color;
    $scope.css["width"] = metadata.css.width;
    $scope.css["border"] = {};
    $scope.css["border"]["color"] = metadata.css.border.color;
    $scope.css["background"] = {};
    $scope.css["background"]["color"] = metadata.css.background.color;
    $scope.css["title"] = metadata.css.title;
    $scope.css["title"]["color"] = metadata.css.title.color;
    $scope.css["title"]["show"] = metadata.css.title.show;

    $scope.data = {};

    $scope.listStyle = "list";

    $scope.labels = [];

    var deviceType = $stateParams.type;
    var deviceName = $stateParams.device;

    if (metadata.data) {


        $scope.labels = [];


        if (metadata.data.datasource.labels) {
            $scope.labels = metadata.data.datasource.labels.split(" ");
        }

        if (metadata.data.datasource.style) {
            $scope.listStyle = metadata.data.datasource.style;
        }

        // show different type
        var relation = metadata.data.datasource.type;
        $scope.items = [];
        $http({
            method: 'GET',
            url: 'api/docker/repeat/' + deviceType + '/' + deviceName + '/' + relation
        }).then(function (data) {
            $scope.items = data.data;
        }, function (error) {
            console.error(error);
        });

        // I'm ready. please give all my children to me~
        // call stage
        $scope.$on('LastRepeaterElement', function () {
            $timeout(function () {
                $scope.$emit('bindChildRepeatEvent', {
                    id: element_id
                });
            });
        });


    }
    //establish a connection with websocket
    var dataStream = $websocket('ws://' + $location.host() + ":" + $location.port() + '/ws/hosts');
    dataStream.onMessage(function (message) {
        try {
            var backData = JSON.parse(message.data);
            if (backData.hasOwnProperty("container")) {
                // tell children
                $scope.$parent.$broadcast('containerStatusEvent', backData);
                // update health-check status
                angular.forEach($scope.items, function (item) {
                    if (backData.application == item.device.key.id) {
                        if (backData.config.State.Health) {
                            item["health"] = backData.config.State.Health.Status;
                        } else {
                            item["health"] = null;
                        }

                        if (backData.stats == "exited") {
                            item["health"] = null;
                        }
                    }
                });
            }
        } catch (e) {
        }
    });

    $scope.healthcheck = function (item) {
        // call server and get the exception.
        dataService.healthcheck(item.name, item.device.key.id);
    };


};


fgpWidgetRepeatContainer.buildFactory = function buildFactory ($http) {
    fgpWidgetRepeatContainer.instance = new fgpWidgetRepeatContainer($http);
    return fgpWidgetRepeatContainer.instance;
};

fgpWidgetRepeatContainer.$inject = ['$http'];

/**
 * Created by eric on 25/11/16.
 */
var fgpImage = function fgpImage() {
    this.restrict = 'E';
    this.scope = {};
};

fgpImage.prototype.template = function template (scope, element) {
    return '' +
        '<img src="{{url}}" style="width:{{css.width}}px;height:{{css.height}}px;">' +
        '';
};

fgpImage.prototype.controller = function controller ($scope, $element) {

    var element_id = $element.attr("id");
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    $scope.showdata = widgetData.data;
    $scope.css = {
        width: "0",
        height: "0"
    };

    $scope.url = "";
    if ($scope.showdata.metadata.css) {
        $scope.css = $scope.showdata.metadata.css;
    }
    if($scope.showdata.metadata.data){
        $scope.url = $scope.showdata.metadata.data.url;
    }
};

fgpImage.buildFactory = function buildFactory () {
    fgpImage.instance = new fgpImage();
    return fgpImage.instance;
};

/**
 * Created by eric on 28/11/16.
 */
var fgpIcon = function fgpIcon() {
    this.restrict = 'E';
    this.scope = {};
};

fgpIcon.prototype.template = function template (element, attrs) {
    var show_dom = '<div class="{{css.width}}" style="margin-top: 10px;background-color: {{css.background.color}};border-color:{{css.border.color || \'#fff\'}};">' +
        '<div class="col-xs-4 col-md-4" style="padding: 5px;">' +
        '<i class="fa fa-{{icon}}" style="font-size: 60px;"></i>' +
        '</div>' +
        '<div class="col-xs-8 col-md-8">' +
        '<div style="text-align: right;font-size: large;"><label>{{title}}</label></div>' +
        '<div style="text-align: right;font-size: small;"><label>{{desc}}</label></div>' +
        '</div>' +
        '</div>' +
        '';
    return show_dom;
};

fgpIcon.prototype.controller = function controller ($scope, $element) {
    // get configuration
    var id = $element.attr("id");
    var configuration = null;
    var widgetData = null;
    $scope.$emit('fetchWidgetMetadataEvent', {
        id: id, callback: function (data) {
            if (data) {
                configuration = data.data.metadata.data;
                widgetData = data;
            }
        }
    });


    var metadata = widgetData.data.metadata;
    $scope.css = {};
    $scope.css["color"] = metadata.css.color;
    $scope.css["width"] = metadata.css.width;
    $scope.css["border"] = {};
    $scope.css["border"]["color"] = metadata.css.border.color;
    $scope.css["background"] = {};
    $scope.css["background"]["color"] = metadata.css.background.color;

    $scope.icon = configuration.content.icon;

    $scope.desc = configuration.content.desc;

    $scope.title = "";

    if (widgetData.from == "show" && widgetData.data) {
        $scope.data_from = "application";
        $scope.parent_container = widgetData.data.parent;
        $scope.$on('deviceInfoEvent', function (event, deviceData) {
            // if the parent container sends a device to here, ignore global device.
            if ($scope.data_from != "application" && deviceData.from == "application") {
                return;
            } else if (deviceData.from != "application") {
                if ($scope.parent_container != "edit" + deviceData.from) {
                    return;
                } else {
                    $scope.data_from = deviceData.from;
                }
            }
            var f = new Function("device", "with(device) { return " + configuration.content.f + "}");
            $scope.title = f(deviceData.device);
        });

    }

};


fgpIcon.buildFactory = function buildFactory () {
    fgpIcon.instance = new fgpIcon();
    return fgpIcon.instance;
};

/**
 * Created by eric on 29/11/16.
 */
var fgpWidgetAppContainer = function fgpWidgetAppContainer() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetAppContainer.prototype.template = function template (element, attrs) {
    var element_id = attrs.id;
    //<div class="alert alert-info" role="alert">...</div>
    return '' +
        '<div ng-show="showstyle == \'list\'" style="padding:0;margin-bottom: 5px;background-color: {{css.background.color}}; border: 1px solid; border-color: {{css.border.color}};border-radius: 5px;"  class="col-md-12 col-xs-12  alert alert-info" dulp="'+element_id+'" id="' + element_id + '_{{$index}}" repeat-id="{{container.id}},{{host}},{{container.application}}" ng-repeat="container in containers | orderBy: \'Name\' as filtered_result track by $index" emit-last-repeater-element>' +
        '<div class="col-md-8 col-xs-8" role="alert" style="min-height: 24px; text-align: left;margin-bottom: 0px;padding: 3px;">' +
        '<i class="fa fa-hdd-o" aria-hidden="true" style="padding-right: 5px;"></i><a href="javascript:;" ng-click="gotoContainer(container);">{{container.name | removeSlash}}</a>' +
        '</div>' +
        '<div class="col-md-4 col-xs-4" id="edit' + element_id + '" style="min-height: 24px; padding: 0;">' +
        '</div>' +
        '</div>' +

        '<div ng-show="showstyle == \'grid\'" style="padding:0;margin-bottom: 5px;background-color: {{css.background.color}}; border: 1px solid; border-color: {{css.border.color}};border-radius: 5px;"  class="col-md-6 col-xs-6 alert alert-info" dulp="'+element_id+'" id="' + element_id + '_{{$index}}" repeat-id="{{container.id}},{{host}},{{container.application}}" ng-repeat="container in containers | orderBy: \'Name\' as filtered_result track by $index" emit-last-repeater-element>' +
        '<div class="col-md-8 col-xs-8" role="alert" style="min-height: 24px;text-align: left;margin-bottom: 0px;padding: 3px;">' +
        '<i class="fa fa-hdd-o" aria-hidden="true" style="padding-right: 5px;"></i><a href="javascript:;" ng-click="gotoContainer(container);">{{container.name | removeSlash}}</a>' +
        '</div>' +
        '<div class="col-md-4 col-xs-4" id="edit' + element_id + '" style="min-height: 24px; padding: 0;">' +
        '</div>' +
        '</div>' +
        '';
};

fgpWidgetAppContainer.prototype.controller = function controller ($scope, $element, dataService, $rootScope, $timeout) {
    // only show
    var element_id = $element.attr("id");

    var widgetData = null;

    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });
    var metadata = widgetData.data.metadata;
    $scope.css = {};
    $scope.css["color"] = metadata.css.color;
    $scope.css["width"] = metadata.css.width;
    $scope.css["border"] = {};
    $scope.css["border"]["color"] = metadata.css.border.color;
    $scope.css["background"] = {};
    $scope.css["background"]["color"] = metadata.css.background.color;

    $scope.containers = [];
    $scope.containerswithTimeout = [];
    var metadata = widgetData.data.metadata;
    // should be a host id
    var repeat = $scope.$parent.repeat;

    $scope.showstyle = "list";

    $scope.host = repeat;


    // I'm ready. please give all my children to me~
    // call stage
    $scope.$on('LastRepeaterElement', function () {
        $timeout(function () {
            $scope.$emit('bindChildRepeatEvent', {
                id: element_id
            });
        });
    });

    $timeout(function () {
        var pp = $scope.$emit('listStyleEvent', {
            id: widgetData.data.parent,
            callback: function (style) {
                $scope.showstyle = style;
            }
        });

    });

    $scope.gotoContainer = function (container) {
        // "device type and device name" display by a dynamic page!
        console.info(container);
        return false;
    };


    $scope.$on('containerStatusEvent', function (event, data) {

        if (data.host == repeat) {
            //f
            var labels = [];

            if (metadata.data.datasource.labels) {
                labels = metadata.data.datasource.labels.split(" ");
            }
            var showLabel = "";
            angular.forEach(labels, function (label) {
                showLabel += data.config[label] + " ";
            });

            var app = {
                id: data.container,
                label: showLabel,
                application: data.application,
                name: data.deviceName,
                type: data.deviceType
            };
            var flag = false;
            angular.forEach($scope.containers, function (container) {
                if (container.id == app.id) {
                    // update timer
                    var timer_index = -1;
                    var timer = $scope.containerswithTimeout.filter(function (item, index) {
                        if(item.app.id == app.id){
                            timer_index = index;
                            return true;
                        }else{
                            false;
                        }
                    });
                    $timeout.cancel(timer[0].t);
                    if (data.stats != "removed") {
                        var newTimer = $timeout(function () {
                            var index = $scope.containers.indexOf(app);
                            $scope.containers.splice(index, 1);
                            $scope.containerswithTimeout.splice(timer_index, 1);
                            $timeout(function () {
                                $scope.$emit('bindChildRepeatEvent', {
                                    id: element_id
                                });
                            });
                        }, 30000);
                        timer[0].t = newTimer;
                        flag = true;
                    } else {
                        var index = -1;
                        angular.forEach($scope.containers, function (item, itemIndex) {
                            if (item.id === app.id) {
                                index = itemIndex;
                            }
                        });
                        if (index != -1 && timer_index != -1) {
                            $scope.containers.splice(index, 1);
                            $scope.containerswithTimeout.splice(timer_index, 1);
                            flag = true;
                            $timeout(function () {
                                $scope.$emit('bindChildRepeatEvent', {
                                    id: element_id
                                });
                            });
                        }
                    }
                }
            });

            if (!flag) {
                // add to
                $scope.containers.push(app);
                // delete it after 30 seconds!
                var t = $timeout(function () {
                    var index = $scope.containers.indexOf(app);
                    $scope.containers.splice(index, 1);
                }, 30000);
                $scope.containerswithTimeout.push({t: t, app: app});
            }
        }

    });

};

fgpWidgetAppContainer.buildFactory = function buildFactory () {
    fgpWidgetAppContainer.instance = new fgpWidgetAppContainer();
    return fgpWidgetAppContainer.instance;
};

fgpWidgetAppContainer.$inject = [];

/**
 * Created by ericwang on 21/06/2016.
 */
var fgpWidgetChartTable = function fgpWidgetChartTable() {
    this.restrict = 'E';
    this.scope = {};
};

fgpWidgetChartTable.prototype.template = function template (element, attrs) {
    return '<div style="padding:0px;height: {{css.height}}px;position: relative; overflow-y : auto;">' +
        '<table st-table="rowCollection" class="col-md-12 table table-striped">' +
        '<thead>' +
        '<tr>' +
        '<th ng-repeat="column in sampledata.columns">{{column.label}}</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr ng-repeat="value in sampledata.values">' +
        '<td ng-repeat="col in sampledata.columns">{{value[col.label] | tableformatter: value : col.label : col.formatter}}</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</div>';
};

fgpWidgetChartTable.prototype.controller = function controller ($scope, $element) {

    var element_id = $element.attr("id");
    var widgetData = null;

    $scope.$emit('fetchWidgetMetadataEvent', {
        id: element_id, callback: function (data) {
            if (data) {
                widgetData = data;
            }
        }
    });

    //show
    $scope.showdata = widgetData.data;

    $scope.css = {
        width: "col-md-12",
        height: "400"
    };
    if ($scope.showdata.metadata.css) {
        $scope.css = $scope.showdata.metadata.css;
    }


    $scope.$on('chartDataChangeEvent', function (event, chartData) {
        var chartId = chartData.id;
        if ($scope.showdata.metadata.data.chartId === chartId && chartData.group == "device") {
            $scope.sampledata = {};
            // make data
            var collectionName = chartData.data.collection;
            var groupName = chartData.group;
            var columns = [];
            //get group and collection configuration
            angular$1.forEach($scope.showdata.metadata.data.groups, function (group) {
                if (group.name == groupName) {
                    angular$1.forEach(group.collections, function (collection) {
                        if (collection.name === collectionName) {
                            columns = collection.rows;
                        }
                    });
                }
            });


            $scope.sampledata.columns = [];

            angular$1.forEach(columns, function (column) {
                $scope.sampledata.columns.push({label: column.label, formatter: column.formatter});
            });
            $scope.sampledata.values = [];
            angular$1.forEach(columns, function (column) {
                var f = new Function("data", "with(data) { if(" + column.value + ") return " + column.value + ";return '';}");
                angular$1.forEach(chartData.data.data, function (record, index) {
                    if ($scope.sampledata.values.length < chartData.data.data.length) {
                        //add new one
                        var item = {};
                        item[column.label] = f(record);
                        $scope.sampledata.values.push(item);
                    } else {
                        $scope.sampledata.values[index][column.label] = f(record);
                    }
                });
            });

            var cleanData = [];
            angular$1.forEach($scope.sampledata.values, function (value, index) {
                var flag = false;
                angular$1.forEach(columns, function (column) {
                    if (value[column.label] && value[column.label] != "") {
                        flag = true;
                    }
                });

                if (flag) {
                    cleanData.push(value);
                }
            });
            $scope.sampledata.values = cleanData;

        } else if ($scope.showdata.metadata.data.chartId === chartId && chartData.group == "relation") {
            //


        }

    });


};

fgpWidgetChartTable.buildFactory = function buildFactory () {
    fgpWidgetChartTable.instance = new fgpWidgetChartTable();
    return fgpWidgetChartTable.instance;
};

/**
 * Created by ericwang on 10/06/2016.
 */
// angular module
angular$1.module('fgp-kit', ['ngMap', 'ui.router', 'angular-cache']).service('dataService', dataAccessApi.buildFactory)
    .filter('removeSlash', function() {
        return function(input) {
            if (input.startsWith("/")) {
                return input.substring(1, input.length);
            }
            return input;
        }
    })
    .factory('$graphstorage', ['$window', function($window) {
        return {
            setTree: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getTree: function(key) {
                return JSON.parse($window.localStorage[key]) || false;
            },
            addTree: function(key, value) {
                if ($window.localStorage[key]) {
                    var trees = JSON.parse($window.localStorage[key]);
                    trees.push(value);
                    this.setTree(key, trees);
                } else {
                    this.setTree(key, [value]);
                }
            },
            clear: function() {
                $window.localStorage.clear();
            }
        }
    }])
    .directive('fgpContainer', fgpStage.buildFactory)
    .directive('widgetContainer', fgpWidgetContainer.buildFactory)
    .directive('widgetGraph', fgpWidgetGraph.buildFactory)
    .directive('widgetPageTitle', fgpWidgetPageTitle.buildFactory)
    .directive('widgetMap', fgpWidgetMap.buildFactory)
    .directive('widgetStatus', fgpStage.buildFactory)
    .directive('widgetDeviceDetail', fgpWidgetDeviceDetail.buildFactory)
    .directive('widgetDeviceSpan', fgpWidgetSpan.buildFactory)
    .directive('widgetPie', fgpWidgetPie.buildFactory)
    .directive('widgetDockerButton', fgpDockerButton.buildFactory)
    .directive('widgetRepeatContainer', fgpWidgetRepeatContainer.buildFactory)
    .directive('widgetImage', fgpImage.buildFactory)
    .directive('widgetIcon', fgpIcon.buildFactory)
    .directive('widgetAppContainer', fgpWidgetAppContainer.buildFactory)
    .directive('widgetChartTable', fgpWidgetChartTable.buildFactory)
    .directive('emitLastRepeaterElement', [function() {
        return function(scope) {
            if (scope.$last) {
                scope.$emit('LastRepeaterElement');
            }
        };
    }]).config(function(CacheFactoryProvider) {
        angular$1.extend(CacheFactoryProvider.defaults, {
            maxAge: 30 * 60 * 1000, // half an hour
            deleteOnExpire: 'aggressive',
        });
    }).service('graphDataService', function(CacheFactory) {
        var graphCache = null;
        if (!CacheFactory.get('graphCache')) {
            graphCache = CacheFactory('graphCache',{
                maxAge: 30 * 60 * 1000, // half an hour
                deleteOnExpire: 'aggressive'
            });
        }
        return {
            get: function(name) {
                return graphCache.get('/graph/'+name);
            },
            put: function(name, data) {
                return graphCache.put('/graph/'+name, data);
            }
        };
    })
    .filter('tableformatter', ['$filter', function($filter) {
        return function(input, obj, field, formatter) {
            if (formatter) {
                if (obj[field]) {
                    if ("date" == formatter) {
                        return $filter('date')(new Date(obj[field]), 'd/M/yy h:mm a');
                    } else {
                        return input;
                    }
                }
            } else {
                return input;
            }
        };
    }]);
var index = 'fgp-kit';

return index;

})));

//# sourceMappingURL=fgp.kit.bundle.js.map
