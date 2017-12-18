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
}(this, (function (angular$1,$,Dygraph,ngmap,chart_js) {

angular$1 = 'default' in angular$1 ? angular$1['default'] : angular$1;
$ = 'default' in $ ? $['default'] : $;
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
        interactions: "="
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


    function findChild4Repeat(parentId, parentHtmlObj, arrayItems, newId,newScope) {

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
                findChild4Repeat(arrayItems[i].id, currentItem, arrayItems,newScope);
            }
            else if ('detail_status_' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)(newScope));
                findChild4Repeat(arrayItems[i].id, currentItem, arrayItems,newScope);
            }
        }
    }

    function findChild(parentId, parentHtmlObj, arrayItems,newScope) {

        for (var i = 0; i < arrayItems.length; i++) {
            if ('edit' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)(newScope));
                findChild(arrayItems[i].id, currentItem, arrayItems,newScope);
            } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                var currentItem = angular$1.element(arrayItems[i].html_render);
                var id = arrayItems[i].id;
                newScope.showdata[id] = arrayItems[i];
                parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)(newScope));
                findChild(arrayItems[i].id, currentItem, arrayItems,newScope);
            }
        }
    }

    var newScope = null;
    $scope.$watch('deviceName', function (newVal, oldVal) {
        if(newVal){
            $element.empty();
            if(newScope){
                newScope.$destroy();
            }
            newScope = $rootScope.$new(true);
            newScope["showdata"] = {};

            newScope.$on('bindChildChartEvent', function (evt, msg) {
                graphBindingArray.push(msg);
            });

            newScope["interactions"] = $scope.interactions;

            newScope.$on('bindChildRepeatEvent', function (evt, msg) {
                angular$1.forEach($scope.configuration, function (item) {
                    if (item.id == msg.id) {
                        var items = angular$1.element("body").find("#" + item.id).children();
                        angular$1.forEach(items, function (item_new) {
                            newScope.showdata[item_new.id] = item;
                            var currentElement = angular$1.element(item_new);
                            if (currentElement.attr("dulp")) {
                                var groupItems = angular$1.element("body").find("div[dulp='" + item.id + "']");
                                angular$1.forEach(groupItems, function (dulpItem) {
                                    findChild4Repeat(item.id, angular$1.element(dulpItem), $scope.configuration, item_new.id,newScope);
                                });
                            }else{
                                findChild4Repeat(item.id, currentElement, $scope.configuration, item_new.id,newScope);
                            }
                        });
                    }
                });
            });

            newScope.$on('listStyleEvent', function (evt, param) {
                var config = newScope.showdata[param.id.replace("edit", "")];
                param.callback(config.metadata.data.datasource.style);
            });


            newScope.$on('fetchWidgetMetadataEvent', function (evt, msg) {
                angular$1.forEach(newScope.showdata, function (metadata, key) {
                    if (key == msg.id) {
                        msg.callback({data: metadata, from: 'show'});
                        return;
                    }
                });
            });

            // refersh
            angular$1.forEach($scope.configuration, function (item) {
                if ('workingArea' === item.parent) {
                    var currentItem = angular$1.element(item.html_render);
                    newScope.showdata[item.id] = item;
                    $element.append($compile(currentItem)(newScope));
                    findChild(item.id, currentItem, $scope.configuration,newScope);
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
            $timeout(function () {
                angular$1.forEach(graphBindingArray, function (graph) {
                    newScope.$broadcast('bindFatherGraphEvent', {parent: graph.graphs, children: graph.children});
                });
            });
        }
    });


    var sendDeviceData = function (newScope) {
            dataService.deviceInfo($scope.server, $scope.deviceName, null, $scope.applicationName).then(function (data) {
                // send device info to all widget
                $timeout(function () {
                    newScope.$broadcast('deviceInfoEvent', {device: data, from: 'application'});
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
var dataAccessApi = function dataAccessApi($http, $q, $cacheFactory, $interval) {
    this._$http = $http;
    this._$q = $q;
    // get cache
    this.indexCache = $cacheFactory('indexCache');
    this.deviceStores = $cacheFactory('deviceStores');
    this._$interval = $interval;
};


/**
 * sync using JQuery
 * @param deviceName
 * @param deviceKey
 * @param applicationName
 * @returns {*}
 */
dataAccessApi.prototype.deviceInfo = function deviceInfo (host, deviceName, deviceKey, applicationName) {
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
                    angular$1.forEach(types, function(type) {
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
};

/**
 *
 * @param application
 * @param deviceKey
 * @param storeSchema
 * @returns {Promise}
 */
dataAccessApi.prototype.deviceInitInfo = function deviceInitInfo (host, application, deviceKey, storeSchema, rangeLevel, otherLevels, fields) {
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
};

dataAccessApi.prototype.deviceStoreSchemaInfo = function deviceStoreSchemaInfo (host, application, device, storeSchema, stores, fields) {
        var this$1 = this;

    var deferred = this._$q.defer();
    var results = [];
    var promises = [];
    for (var i = 0; i < stores.length; i++) {
        var key = stores[i];
        promises.push(this$1._$http.get(host + '/rest/api/app/' + application + '/store/devices/store_schema_info/' + storeSchema + '/' + key + '?device=' + device).then(function(response) {
            return {
                data: response.data
            };
        }));
    }
    this._$q.all(promises).then(function(result) {
        for (var j = 0; j < result.length; j++) {
            results.push(result[j]);
        }
        deferred.resolve(results);
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
dataAccessApi.prototype.childrenDeviceInitInfo = function childrenDeviceInitInfo (host, application, deviceKey, storeSchema, relationType, relationDeviceType, rangeLevel, otherLevels, fields) {
    var deferred = this._$q.defer();
    this._$http.get(host + '/rest/api/app/' + application + '/store/index/children/' + deviceKey + '/' + storeSchema + '/' + rangeLevel, {
        params: {
            relationType: relationType,
            relationDeviceType: relationDeviceType,
            otherLevels: otherLevels,
            fields: [].concat(fields)
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
dataAccessApi.prototype.devicesStoreData = function devicesStoreData (host, application, deviceInfo, storeSchema, store, start, end, fields) {

    var bucketsData = [];
    var devicesNullBucket = [];
    var calTree = this.calTree;
    var fillChildrenTree = this.fillChildrenTree;
    angular$1.forEach(deviceInfo, function(device, index) {
        var bucketKeys = [];
        calTree(bucketKeys, device.tree, start, end);
        var nullBucket = [];
        // get null buckets
        angular$1.forEach(bucketKeys, function(bucket) {
            if (bucket.data == null) {
                nullBucket.push(bucket.id);
            }
        });
        if (nullBucket.length != 0) {
            devicesNullBucket.push({
                device: device.name,
                nullBucket: nullBucket
            });
        }
        bucketsData.push({
            device: device.name,
            data: bucketKeys
        });
    });

    if (devicesNullBucket.length == 0) {
        // get data from rest service
        var deferred = this._$q.defer();
        deferred.resolve(bucketsData);
        return deferred.promise;
    } else {
        // get data from rest service
        var deferred = this._$q.defer();
        this._$http.post(host + '/rest/api/app/' + application + '/store/index/devices/store/data/' + storeSchema + '/' + store, {
            'bucketKeys': JSON.stringify(devicesNullBucket),
            'fields': JSON.stringify(fields)
        }).then(
            function(response) {
                // response.data
                angular$1.forEach(response.data, function(deviceData) {

                    var currentBucketShowData = null;
                    angular$1.forEach(bucketsData, function(showData) {
                        if (showData.device == deviceData.device) {
                            currentBucketShowData = showData.data; //  bucketKeys
                            angular$1.forEach(deviceInfo, function(device, index) {
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
            function(response) {
                deferred.reject(response.data);
            }
        );
        return deferred.promise;
    }


};


dataAccessApi.prototype.deviceStoreData = function deviceStoreData (host, application, deviceKey, storeSchema, store, tree, start, end, fields) {
    var fillTree = this.fillTree;
    var calTree = this.calTree;
    var bucketKeys = [];
    calTree(bucketKeys, tree, start, end);
    var nullBucket = [];
    // get null buckets
    angular$1.forEach(bucketKeys, function(bucket) {
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
                fields: [].concat(fields)
            }
        }).then(
            function(response) {
                fillTree(response.data, tree, bucketKeys);
                // fill bucketKeys
                deferred.resolve(bucketKeys);
            },
            function(response) {
                deferred.reject(response.data);
            }
        );
        return deferred.promise;
    }


};

dataAccessApi.prototype.defaultColors = function defaultColors () {
        var this$1 = this;

    if (!this.colors) {
        this['colors'] = [];
        for (var i = 0; i < 300; i++) {
            this$1.colors.push('#' + (function co(lor) {
                return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) &&
                    (lor.length == 6) ? lor : co(lor);
            })(''));
        }
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


dataAccessApi.buildFactory = function buildFactory ($http, $q, $cacheFactory, $interval) {
    dataAccessApi.instance = new dataAccessApi($http, $q, $cacheFactory, $interval);
    return dataAccessApi.instance;
};

dataAccessApi.$inject = ['$http', '$q', '$cacheFactory', '$interval'];

/**
 * Created by ericwang on 15/06/2016.
 */
var fgpWidgetContainer = function fgpWidgetContainer() {
    this.restrict = 'E';
    this.scope = {
        interactions: "="
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
    var dom_show_notitle = '<div class="" id="' + element_id + '" style="height: 100%;">' +
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
var fgpWidgetGraph = function fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams) {
    this.restrict = 'E';
    this.scope = {
        interactions: "="
    };
    this.$timeout = $timeout;
    this._dataService = dataService;
    this._$interval = $interval;


    /*jslint vars: true, nomen: true, plusplus: true, maxerr: 500, indent: 4 */

    /**
     * @license
     * Copyright 2011 Juan Manuel Caicedo Carvajal (juan@cavorite.com)
     * MIT-licensed (http://opensource.org/licenses/MIT)
     */

    /**
     * @fileoverview This file contains additional features for dygraphs, which
     * are not required but can be useful for certain use cases. Examples include
     * exporting a dygraph as a PNG image.
     */

    /**
     * Demo code for exporting a Dygraph object as an image.
     *
     * See: http://cavorite.com/labs/js/dygraphs-export/
     */

    Dygraph.Export = {};

    Dygraph.Export.DEFAULT_ATTRS = {

        backgroundColor: "transparent",

        //Texts displayed below the chart's x-axis and to the left of the y-axis
        titleFont: "bold 18px serif",
        titleFontColor: "black",

        //Texts displayed below the chart's x-axis and to the left of the y-axis
        axisLabelFont: "bold 14px serif",
        axisLabelFontColor: "black",

        // Texts for the axis ticks
        labelFont: "normal 12px serif",
        labelFontColor: "black",

        // Text for the chart legend
        legendFont: "bold 12px serif",
        legendFontColor: "black",

        // Default position for vertical labels
        vLabelLeft: 20,

        legendHeight: 20, // Height of the legend area
        legendMargin: 20,
        lineHeight: 30,
        maxlabelsWidth: 0,
        labelTopMargin: 35,
        magicNumbertop: 8

    };

    /**
     * Tests whether the browser supports the canvas API and its methods for
     * drawing text and exporting it as a data URL.
     */
    Dygraph.Export.isSupported = function() {
        "use strict";
        try {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            return (!!canvas.toDataURL && !!context.fillText);
        } catch (e) {
            // Silent exception.
        }
        return false;
    };

    /**
     * Exports a dygraph object as a PNG image.
     *
     *  dygraph: A Dygraph object
     *  img: An IMG DOM node
     *  userOptions: An object with the user specified options.
     *
     */
    Dygraph.Export.asPNG = function(dygraph, img, userOptions) {
        "use strict";
        var canvas = Dygraph.Export.asCanvas(dygraph, userOptions);
        img.src = canvas.toDataURL();
    };

    /**
     * Exports a dygraph into a single canvas object.
     *
     * Returns a canvas object that can be exported as a PNG.
     *
     *  dygraph: A Dygraph object
     *  userOptions: An object with the user specified options.
     *
     */
    Dygraph.Export.asCanvas = function(dygraph, userOptions) {
        "use strict";
        var options = {},
            canvas = Dygraph.createCanvas();

        Dygraph.update(options, Dygraph.Export.DEFAULT_ATTRS);
        Dygraph.update(options, userOptions);

        canvas.width = dygraph.width_;
        canvas.height = dygraph.height_ + options.legendHeight;

        Dygraph.Export.drawPlot(canvas, dygraph, options);
        Dygraph.Export.drawLegend(canvas, dygraph, options);
        return canvas;
    };

    /**
     * Adds the plot and the axes to a canvas context.
     */
    Dygraph.Export.drawPlot = function(canvas, dygraph, options) {
        "use strict";
        var ctx = canvas.getContext("2d");

        // Add user defined background
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Copy the plot canvas into the context of the new image.
        var plotCanvas = dygraph.hidden_;

        var i = 0;

        ctx.drawImage(plotCanvas, 0, 0);


        // Add the x and y axes
        var axesPluginDict = Dygraph.Export.getPlugin(dygraph, 'Axes Plugin');
        if (axesPluginDict) {
            var axesPlugin = axesPluginDict.plugin;

            for (i = 0; i < axesPlugin.ylabels_.length; i++) {
                Dygraph.Export.putLabel(ctx, axesPlugin.ylabels_[i], options,
                    options.labelFont, options.labelFontColor);
            }

            for (i = 0; i < axesPlugin.xlabels_.length; i++) {
                Dygraph.Export.putLabel(ctx, axesPlugin.xlabels_[i], options,
                    options.labelFont, options.labelFontColor);
            }
        }

        // Title and axis labels

        var labelsPluginDict = Dygraph.Export.getPlugin(dygraph, 'ChartLabels Plugin');
        if (labelsPluginDict) {
            var labelsPlugin = labelsPluginDict.plugin;

            Dygraph.Export.putLabel(ctx, labelsPlugin.title_div_, options,
                options.titleFont, options.titleFontColor);

            Dygraph.Export.putLabel(ctx, labelsPlugin.xlabel_div_, options,
                options.axisLabelFont, options.axisLabelFontColor);

            Dygraph.Export.putVerticalLabelY1(ctx, labelsPlugin.ylabel_div_, options,
                options.axisLabelFont, options.axisLabelFontColor, "center");

            Dygraph.Export.putVerticalLabelY2(ctx, labelsPlugin.y2label_div_, options,
                options.axisLabelFont, options.axisLabelFontColor, "center");
        }


        for (i = 0; i < dygraph.layout_.annotations.length; i++) {
            Dygraph.Export.putLabelAnn(ctx, dygraph.layout_.annotations[i], options,
                options.labelFont, options.labelColor);
        }

    };

    /**
     * Draws a label (axis label or graph title) at the same position
     * where the div containing the text is located.
     */
    Dygraph.Export.putLabel = function(ctx, divLabel, options, font, color) {
        "use strict";

        if (!divLabel || !divLabel.style) {
            return;
        }

        var top = parseInt(divLabel.style.top, 10);
        var left = parseInt(divLabel.style.left, 10);

        if (!divLabel.style.top.length) {
            var bottom = parseInt(divLabel.style.bottom, 10);
            var height = parseInt(divLabel.style.height, 10);

            top = ctx.canvas.height - options.legendHeight - bottom - height;
        }

        // FIXME: Remove this 'magic' number needed to get the line-height.
        top = top + options.magicNumbertop;

        var width = parseInt(divLabel.style.width, 10);

        switch (divLabel.style.textAlign) {
            case "center":
                left = left + Math.ceil(width / 2);
                break;
            case "right":
                left = left + width;
                break;
        }

        Dygraph.Export.putText(ctx, left, top, divLabel, font, color);
    };

    /**
     * Draws a label Y1 rotated 90 degrees counterclockwise.
     */
    Dygraph.Export.putVerticalLabelY1 = function(ctx, divLabel, options, font, color, textAlign) {
        "use strict";
        if (!divLabel) {
            return;
        }

        var top = parseInt(divLabel.style.top, 10);
        var left = parseInt(divLabel.style.left, 10) + parseInt(divLabel.style.width, 10) / 2;
        var text = divLabel.innerText || divLabel.textContent;


        // FIXME: The value of the 'left' property is frequently 0, used the option.
        if (!left)
            left = options.vLabelLeft;

        if (textAlign == "center") {
            var textDim = ctx.measureText(text);
            top = Math.ceil((ctx.canvas.height - textDim.width) / 2 + textDim.width);
        }

        ctx.save();
        ctx.translate(0, ctx.canvas.height);
        ctx.rotate(-Math.PI / 2);

        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.fillText(text, top, left);

        ctx.restore();
    };

    /**
     * Draws a label Y2 rotated 90 degrees clockwise.
     */
    Dygraph.Export.putVerticalLabelY2 = function(ctx, divLabel, options, font, color, textAlign) {
        "use strict";
        if (!divLabel) {
            return;
        }

        var top = parseInt(divLabel.style.top, 10);

        if (divLabel.style.right == "") {
            divLabel.style.right = "10px";
        }

        var right = parseInt(divLabel.style.right, 10) + parseInt(divLabel.style.width, 10) * 2;
        var text = divLabel.innerText || divLabel.textContent;

        if (textAlign == "center") {
            var textDim = ctx.measureText(text);
            top = Math.ceil((ctx.canvas.height + textDim.width) / 2 - textDim.width);
        }

        ctx.save();
        ctx.translate(parseInt(divLabel.style.width, 10), 0);
        ctx.rotate(Math.PI / 2);

        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.fillText(text, top, right - ctx.canvas.width);

        ctx.restore();
    };

    /**
     * Draws the text contained in 'divLabel' at the specified position.
     */
    Dygraph.Export.putText = function(ctx, left, top, divLabel, font, color) {
        "use strict";
        var textAlign = divLabel.style.textAlign || "left";
        var text = divLabel.innerText || divLabel.textContent;

        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = textAlign;
        ctx.textBaseline = "middle";
        ctx.fillText(text, left, top);
    };

    /**
     * Draws the legend of a dygraph
     *
     */
    Dygraph.Export.drawLegend = function(canvas, dygraph, options) {
        "use strict";
        var ctx = canvas.getContext("2d");

        // Margin from the plot
        var labelTopMargin = 10;

        // Margin between labels
        var labelMargin = 5;

        var colors = dygraph.getColors();
        // Drop the first element, which is the label for the time dimension
        var labels = dygraph.attr_("labels").slice(1);

        // 1. Compute the width of the labels:
        var labelsWidth = 0;

        var i;
        for (i = 0; i < labels.length; i++) {
            if (labels[i] != "span_y1" && labels[i] != "span_y2") {
                labelsWidth = labelsWidth + ctx.measureText("- " + labels[i]).width + labelMargin;
            }
        }

        var labelsX = Math.floor((canvas.width - labelsWidth) / 2);
        var labelsY = canvas.height - options.legendHeight + labelTopMargin;


        var labelVisibility = dygraph.attr_("visibility");

        ctx.font = options.legendFont;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        var usedColorCount = 0;
        for (i = 0; i < labels.length; i++) {
            if (labelVisibility[i]) {
                if (labels[i] != "span_y1" && labels[i] != "span_y2") {
                    var txt = "- " + labels[i];
                    ctx.fillStyle = colors[usedColorCount];
                    usedColorCount++;
                    ctx.fillText(txt, labelsX, labelsY);
                    labelsX = labelsX + ctx.measureText(txt).width + labelMargin;
                }
            }
        }
    };

    /**
     * Finds a plugin by the value returned by its toString method..
     *
     * Returns the the dictionary corresponding to the plugin for the argument.
     * If the plugin is not found, it returns null.
     */
    Dygraph.Export.getPlugin = function(dygraph, name) {
        for (i = 0; i < dygraph.plugins_.length; i++) {
            if (dygraph.plugins_[i].plugin.toString() == name) {
                return dygraph.plugins_[i];
            }
        }
        return null;
    };


};


fgpWidgetGraph.prototype.template = function template (element, attrs) {
    var flag = attrs.hasOwnProperty("shown");
    if (flag) {
        var dom_loading = '<div ng-show="loadingShow" id="loading_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner">' +
            '<div class="rect1" style="background-color: darkgreen"></div>' +
            '<div class="rect2" style="background-color: #3cb0fd"></div>' +
            '<div class="rect3" style="background-color: #777777"></div>' +
            '<div class="rect4" style="background-color: coral"></div>' +
            '<div class="rect5" style="background-color: deeppink"></div>' +
            '</div></div>';


        var dom_legend = '<li>{{legendText_device}}</li><li>{{legendText_datetime}}</li><li><label style="color: {{legendColor}}">{{legendText_column}}</label>:{{legendText_value}}</li>';

        var dom_empty_data = '<div ng-show="emptyDataShow" id="emptydata_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner" style="width: 100%;">' +
            '<h1>Empty Data!</h1>' +
            '</div></div>';

        var dom_alert_info = '<span class="label label-warning" ng-show="alertMessage" style="color: #000;">{{alertMessage}}</span>';

        var dom_datetime_interval = '<div ng-show="rangeSelectorBar" class="dropdown"> <button class="btn btn-info dropdown-toggle badge" type="button" data-toggle="dropdown">{{currentIntervalChoosed.name}}<span class="caret"></span></button> <ul class="dropdown-menu dropdown-menu-right" style="font-size:12px;"><li ng-repeat="interval in dateTimeIntervals"><a href="javascript:;" ng-click="changeInterval(interval)">{{interval.name}}</a></li></ul> </div>';


        var dom_series_list = '<div ng-show="currentView === 1" class="dropdown"> <button class="btn btn-warning dropdown-toggle badge" type="button" data-toggle="dropdown">Devices<span class="caret"></span></button> <ul class="dropdown-menu dropdown-menu-right" style="font-size:12px;"><li ng-repeat="device in childrenDevices"><input type="checkbox" ng-click="showOrHideDevice(device)" ng-checked="device.show"/>{{device.name}}</li></ul> </div>';


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

        var dom_buttons = '<div style="float: right;"  class="dropdown">' +
            '<button class="btn btn-info badge dropdown-toggle" data-toggle="dropdown">' +
            '<i class="fa fa-download" aria-hidden="true"></i>' +
            '</button>' +
            '<ul class="dropdown-menu dropdown-menu-right" style="font-size:12px;">' +
            '<li style="text-align: center;"><div class="col-md-6 col-xs-6"><span><a href="javascript:;" ng-click="export_img();"><span class="fa fa-camera" aria-hidden="true"></span></a></span></div><div class="col-md-6 col-xs-6"><span><a href="javascript:;" ng-click="export_data();"><span class="fa fa-table" aria-hidden="true"></span></a></span></div></li>' +
            '</ul>' +
            '</div>';

        var html = '<div id="legendbox' + attrs.id + '" ng-show="legendText" ng-style="{top:legendTop,left:legendLeft}" style="border-radius:10px;background-color:#ffffff;position: absolute;border: 1px solid {{legendColor}};-moz-box-shadow: 5px 5px 5px #888888;box-shadow: 5px 5px 5px #888888;z-index: 99999999;margin-right: 5px;"><ul style="list-style: none;list-style-position: inside;text-align: right;">' + dom_legend + '</ul></div><div class="{{css.width}}"><div class="col-md-12" style="padding:0px;-webkit-user-select: none; /* Chrome all / Safari all */  -moz-user-select: none; /* Firefox all */  -ms-user-select: none; /* IE 10+ */  user-select: none;"><div class="row" ng-show="buttonsShow"><div class="col-md-12">' + dom_buttons + '<a class="tooltips btn btn-xs btn-info badge" href="javascript:;"  style="float: right;margin-right: 10px;" ng-click="currentView = -currentView"><i class="glyphicon glyphicon-transfer"></i><span>Scatter View</span></a><a ng-show="autoupdate" class="tooltips btn btn-xs btn-info badge" style="float: right;margin-right: 10px;" ng-click="showRealTimeGraph()" data-toggle="modal"><span>Auto Update</span><i class="glyphicon glyphicon-random"></i></a><div style="float: right; margin-right: 10px;">' + dom_series_list + '</div><div style="float: right; margin-right: 10px;">' + dom_datetime_interval + '</div><div ng-hide="true" class="checkbox" style="float: right;margin-right: 10px; margin-bottom: 5px; margin-top: 0;" ng-model="fixInterval" ng-click="fixInterval=!fixInterval"><label><input type="checkbox" ng-model="fixInterval" ng-clicked="fixInterval" ng-change="fixGraphWithGap_click()"/>fixed interval</label></div><div style="float: right; margin-right: 10px;"><label class="label-inline" ng-repeat="item in intevals.device"><span class="badge" style="background-color: {{ item.name == currentIntervalName ? \'#009900;\' : \'\'}}">{{item.name}}</span></label></div><div style="float: right; margin-right: 10px;">' + dom_alert_info + '</div></div></div><div style="position: relative;width: 100%;height:100%;"><div style="position: absolute;left:25px;z-index: 999;" ng-show="basicInfo.zoom" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVULeft()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDLeft()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVLeft()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVLeft()"><i class="fa fa-minus" aria-hidden="true"></i></button></div><div class="line-chart-graph" style="width: 100%;height:{{css.height}}px;"></div><div style="position: absolute;right:-15px;top:0px;z-index: 999;" ng-show="checkY2Btns()" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVURight()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDRight()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVRight()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVRight()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div>' + dom_loading + dom_empty_data + '<div class="row" ng-show="basicInfo.range_show"><div class="col-md-12" style="min-height: 30px;"></div><div class="col-md-6" ng-show="rangeSelectorBar">{{chartDateWindow[0] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-6" style="text-align: right;" ng-show="rangeSelectorBar">{{chartDateWindow[1] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-12" style="min-height: 40px;position: relative"><div class="btn-group btn-group-xs" role="group" style="position: absolute;left: 20px;"><button type="button" class="btn btn-default" ng-click="btnpanleft()"><i class="fa fa-arrow-left" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnpanright()"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div><div class="range-selector-bar" style="height: 0px;margin-top: 30px;width: 100%;position: absolute;"></div><div class="btn-group btn-group-xs" role="group" style="position: absolute;right: 1px;" ng-show="basicInfo.range_show"><button type="button" class="btn btn-default" ng-click="btnzoomin()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnzoomout()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div></div></div>' + dom_real_time_grap;

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


    this.$timeout(function() {
        var getData = function(numSeries, numRows, name) {
            var result = {
                labels: null,
                data: null
            };
            var data = [];
            var labels = [];
            //init date
            var initDate = new Date();
            for (var j = 0; j < numRows; ++j) {
                data[j] = [new Date(initDate.getTime() + 900000)];
                initDate = new Date(initDate.getTime() + 900000);
            }
            for (var i = 0; i < numSeries; ++i) {
                labels.push(name + i);
                var val = 0;
                for (var j = 0; j < numRows; ++j) {
                    // val += Math.random() - 0.5;
                    data[j][i + 1] = NaN;
                }
            }
            result.labels = labels;
            result.data = data;
            return result;
        };


        var sampleData = getData(1, 1, 'Device');

        function movePan(event, g, context, side) {
            event.preventDefault();
            event.stopPropagation();
            context.dragEndX = Dygraph.dragGetX_(event, context);
            context.dragEndY = Dygraph.dragGetY_(event, context);


            // y-axis scaling is automatic unless this is a full 2D pan.
            if (context.is2DPan) {

                var pixelsDragged = context.dragEndY - context.dragStartY;
                // Adjust each axis appropriately.
                if (side == "r") {
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
                } else if (side == 'l') {
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
            g.drawGraph_(false);

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
                newYAxes[i] = adjustAxis(yAxes[i].valueRange, zoomInPercentage, yBias);
            }
            if ('v' == direction) {
                if ('l' == side) {
                    yAxes[0]['valueRange'] = newYAxes[0];
                    yAxes[0]['valueWindow'] = newYAxes[0];
                } else if ('r' == side && g.numAxes() == 2) {
                    yAxes[1]['valueRange'] = newYAxes[1];
                    yAxes[1]['valueWindow'] = newYAxes[1];
                }
                g.drawGraph_(false);
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
                    g.updateOptions({
                        dateWindow: [zoomRange[0], newZoomRange[1]]
                    });
                } else if (newZoomRange[0] > zoomRange[0] && newZoomRange[1] >= zoomRange[1]) {
                    g.updateOptions({
                        dateWindow: [newZoomRange[0], zoomRange[1]]
                    });
                } else {
                    g.updateOptions({
                        dateWindow: newZoomRange
                    });
                }
            }

        }


        var canScroll = false;

        var timer = null;
        var mouseOverHandler = function(e, g, context) {
            //
            e.preventDefault();
            e.stopPropagation();
            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }
            //
            if (timer != null) {
                timeOut.cancel(timer);
            }
            timer = timeOut(function() {
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
                // console.info("h")
                zoom(g, percentage, xPct, yPct, 'h', null);
            }
            Dygraph.cancelEvent(e);
            timeOut(function() {
                scope.chartDateWindow = g.xAxisRange();
            });
        };

        var firstPoint = null;
        var timer_mousedown = null;
        var mousedownHandler = function(e, g, context) {
            if (scope.basicInfo && !scope.basicInfo.zoom) {
                return;
            }

            if (timer_mousedown != null) {
                timeOut.cancel(timer_mousedown);
            }
            timer_mousedown = timeOut(function() {
                context.initializeMouseDown(e, g, context);
                firstPoint = e.clientX;
                Dygraph.startPan(e, g, context);

            }, 300);

        };
        var mousemoveHandler = function(e, g, context) {
            e.preventDefault();
            e.stopPropagation();
            if (context.isPanning) {
                if (e.offsetX <= (g.plotter_.area.x)) {
                    movePan(e, g, context, 'r');
                } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                    movePan(e, g, context, 'l');
                } else {
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
            } else {
                if (scope.currentView != -1 && scope.currentHighlight != "") {
                    scope.showOne(scope.currentHighlight);
                }
            }
            if (timer_mousedown) {
                timeOut.cancel(timer_mousedown);
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
            'pointSize': 3,
            legend: 'follow',
            labelsKMB: true,
            labelsSeparateLines: true,
            // data formate
            labels: ['x'].concat(sampleData.labels),
            // highlightSeriesOpts: {
            // strokeWidth: 2,
            // strokeBorderWidth: 1,
            // highlightCircleSize: 2
            // },
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
            xLabelHeight: 0,
            colors: scope.defaultColors,
            fillGraph: true,
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
            // pointClickCallback: function (e, p) {
            // if (scope.currentView != -1) {
            //     scope.showOne(p.name);
            // }
            // },
            drawCallback: function(g, isInit) {
                if (scope.refersh) { // make sure "scope.refersh" doesn't call when the graph create first time.
                    scope.refersh(g, isInit);
                }
            },
            'interactionModel': interactionModel,
            'plugins': [
                new Dygraph.Plugins.Crosshair({
                    direction: "vertical"
                })
            ]
        };

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
                xLabelHeight: 0,
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
                "file": []
            });


            var darkenColor = function(colorStr) {
                // Defined in dygraph-utils.js
                var color = Dygraph.toRGB_(colorStr);
                color.r = Math.floor((255 + color.r) / 2);
                color.g = Math.floor((255 + color.g) / 2);
                color.b = Math.floor((255 + color.b) / 2);
                return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
            };

            var barChartPlotter = function(e) {
                var ctx = e.drawingContext;
                var points = e.points;
                var y_bottom = e.dygraph.toDomYCoord(0);

                ctx.fillStyle = darkenColor(e.color);

                // Find the minimum separation between x-values.
                // This determines the bar width.
                var min_sep = Infinity;
                for (var i = 1; i < points.length; i++) {
                    var sep = points[i].canvasx - points[i - 1].canvasx;
                    if (sep < min_sep) min_sep = sep;
                }
                var bar_width = Math.floor(2.0 / 3 * min_sep);

                // Do the actual plotting.
                for (var i = 0; i < points.length; i++) {
                    var p = points[i];
                    var center_x = p.canvasx;

                    ctx.fillRect(center_x - bar_width / 2, p.canvasy,
                        bar_width, y_bottom - p.canvasy);

                    ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
                        bar_width, y_bottom - p.canvasy);
                }
            };

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
                                if (row.type == 'line') {
                                    series[row.label] = {
                                        'axis': 'y1',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                } else if (row.type == 'bar') {
                                    series[row.label] = {
                                        'axis': 'y1',
                                        'plotter': barChartMultiColumnBarPlotter
                                    };
                                } else {
                                    series[row.label] = {
                                        'axis': 'y1',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                }
                            } else {
                                series[row.label] = {
                                    'axis': 'y2'
                                };
                                if (row.type == 'line') {
                                    series[row.label] = {
                                        'axis': 'y2',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                } else if (row.type == 'bar') {
                                    series[row.label] = {
                                        'axis': 'y2',
                                        'plotter': barChartMultiColumnBarPlotter
                                    };
                                } else {
                                    series[row.label] = {
                                        'axis': 'y2',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                }
                                showY2axis = true;
                            }
                            var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                            // add value
                            var counter = 0;
                            angular$1.forEach(allLines, function(realLine) {
                                try {
                                    var value = f(graph_data.data[counter]);
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
                                line.push(NaN);
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


            if (basicInfo && basicInfo.buttons_show == false) {
                scope.buttonsShow = false;
            }


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

            scope.$on('bindFatherGraphEvent', function(event, data) {
                angular$1.forEach(data.children, function(child) {
                    if (child == attrs.id) {
                        Dygraph.synchronize([scope.currentChart].concat(data.parent), {
                            zoom: true,
                            selection: false,
                            range: false
                        });
                        scope.currentChart.updateOptions({
                            drawCallback: function(g, isInit) {
                                // console.info("refersh running!" + " is  Init?"+ isInit);
                                scope.refersh(g, isInit);
                            }
                        });

                    }
                });


            });


            element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousemove', function(event) {
                if (status) {
                    scope.chartDateWindow = scope.currentChart.xAxisRange();
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

            scope.$on('changeSize', function(event) {
                scope.currentChart.resize();
                if (scope.rangeSelectorBar) {
                    scope.rangeSelectorBar.resize();
                }
            });


        }
    }, 0);
};

//controller: ['$scope', '$element', '$window', '$interval', '$timeout', '$filter', '$location', function ($scope, $element, $window, $interval, $timeout, $filter, $location) {
fgpWidgetGraph.prototype.controller = function controller ($scope, $element, $window, $interval, $timeout, $filter, $location, dataService, $rootScope, $stateParams) {
    var element_id = $element.attr("id");
    $scope.elementId = element_id;

    $scope.currentHighlight = "";

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

    $scope.legendShow = true;

    $scope.buttonsShow = true;


    // default data-time intervals
    $scope.dateTimeIntervals = [{
        name: "5 minutes",
        interval: 300000
    }, {
        name: "1 hour",
        interval: 3600000
    }, {
        name: "1 day",
        interval: 86400000
    }, {
        name: "1 week",
        interval: 604800017
    }, {
        name: "1 month",
        interval: 2629800000
    }, {
        name: "1 year",
        interval: 31557600000
    }];


    var download_image = function(dataurl, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = dataurl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    $scope.export_img = function() {
        // export canvas
        var canvas = Dygraph.Export.asCanvas($scope.currentChart, {
            "series": $scope.currentChart.attributes_.series_
        });
        download_image(canvas.toDataURL(), $scope.currentIntervalName + ".png");
    };


    var download_data = function(content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    };


    $scope.export_data = function() {

        // columns
        var labels = $scope.currentChart.getLabels();

        var columns = [$scope.currentIntervalName];

        var csvContent = $scope.currentIntervalName;
        angular$1.forEach(labels, function(label, index) {
            if (label !== "x" && label != "span_y1" && label != "span_y2") {
                columns.push(index);
                csvContent += "," + label;
            }
        });

        csvContent += "\n";

        var result = [];

        var datewindow = $scope.currentChart.dateWindow_;

        if ($scope.currentChart.dateWindow_[0] instanceof Date && $scope.currentChart.dateWindow_[1] instanceof Date) {
            datewindow[0] = $scope.currentChart.dateWindow_[0].getTime();
            datewindow[1] = $scope.currentChart.dateWindow_[1].getTime();
        }

        // add title
        angular$1.forEach($scope.currentChart.rawData_, function(data) {

            if (data[0] >= datewindow[0] && data[0] <= datewindow[1]) {
                result.push(data);
            }
        });

        result.forEach(function(infoArray, index) {
            var tempArray = [].concat(infoArray[0]);
            angular$1.forEach(infoArray, function(data, index) {
                if (columns.includes(index)) {
                    tempArray.push(data);
                }
            });
            var dataString = tempArray.join(',');
            csvContent += index < result.length ? dataString + '\n' : dataString;
        });
        download_data(csvContent, $scope.auto_device_name + '_' + new Date() + '.csv', 'text/csv;encoding:utf-8');
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


    var darkenColor = function(colorStr) {
        // Defined in dygraph-utils.js
        var color = Dygraph.toRGB_(colorStr);
        color.r = Math.floor((255 + color.r) / 2);
        color.g = Math.floor((255 + color.g) / 2);
        color.b = Math.floor((255 + color.b) / 2);
        return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
    };


    var barChartMultiColumnBarPlotter = function(e) {
        // We need to handle all the series simultaneously.
        if (e.seriesIndex !== 0) return;
        var g = e.dygraph;
        var ctx = e.drawingContext;
        var sets = e.allSeriesPoints;
        var y_bottom = e.dygraph.toDomYCoord(0);
        var series = e.dygraph.attributes_.series_;
        // Find the minimum separation between x-values.
        // This determines the bar width.
        var newSets = [];
        var min_sep = Infinity;
        for (var j = 0; j < sets.length; j++) {
            if (sets[j] && sets[j].length > 0 && series[sets[j][0].name].options.plotter && "barChartMultiColumnBarPlotter" == series[sets[j][0].name].options.plotter.name) {
                var points = sets[j];
                for (var i = 1; i < points.length; i++) {
                    var sep = points[i].canvasx - points[i - 1].canvasx;
                    if (sep < min_sep) min_sep = sep;
                }
                newSets.push(sets[j]);
            }
        }
        var bar_width = Math.floor(2.0 / 3 * min_sep);
        var fillColors = [];
        var strokeColors = g.getColors();
        for (var i = 0; i < strokeColors.length; i++) {
            fillColors.push(darkenColor(strokeColors[i]));
        }
        for (var j = 0; j < newSets.length; j++) {
            ctx.fillStyle = fillColors[j];
            ctx.strokeStyle = strokeColors[j];
            for (var i = 0; i < newSets[j].length; i++) {
                var p = newSets[j][i];
                var center_x = p.canvasx;
                // var x_left = center_x - (bar_width / 2) * (1 - j / (newSets.length - 1));
                var x_left = center_x - (bar_width / 2) + (bar_width / newSets.length) * j;
                ctx.fillRect(x_left, p.canvasy,
                    bar_width / newSets.length - 1, y_bottom - p.canvasy);
                ctx.strokeRect(x_left, p.canvasy,
                    bar_width / newSets.length - 1, y_bottom - p.canvasy);
            }
        }
    };

    var stackedBarPlotter = function(e) {
        var ctx = e.drawingContext;
        var points = e.points;
        var y_bottom = e.dygraph.toDomYCoord(0);
        ctx.fillStyle = darkenColor(e.color);
        // Find the minimum separation between x-values.
        // This determines the bar width.
        var min_sep = Infinity;
        for (var i = 1; i < points.length; i++) {
            var sep = points[i].canvasx - points[i - 1].canvasx;
            if (sep < min_sep) min_sep = sep;
        }
        var bar_width = Math.floor(2.0 / 3 * min_sep);
        // Do the actual plotting.
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var center_x = p.canvasx;
            ctx.fillRect(center_x - bar_width / 2, p.canvasy,
                bar_width, y_bottom - p.canvasy);
            ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
                bar_width, y_bottom - p.canvasy);
        }
    };

    var barChartPlotter = function(e) {
        var ctx = e.drawingContext;
        var points = e.points;
        var y_bottom = e.dygraph.toDomYCoord(0);
        ctx.fillStyle = darkenColor(e.color);
        // Find the minimum separation between x-values.
        // This determines the bar width.
        var min_sep = Infinity;
        for (var i = 1; i < points.length; i++) {
            var sep = points[i].canvasx - points[i - 1].canvasx;
            if (sep < min_sep) min_sep = sep;
        }
        var bar_width = Math.floor(2.0 / 3 * min_sep);
        // Do the actual plotting.
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var center_x = p.canvasx;
            ctx.fillRect(center_x - bar_width / 2, p.canvasy,
                bar_width, y_bottom - p.canvasy);
            ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
                bar_width, y_bottom - p.canvasy);
        }
    };


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
                                obj.push(NaN);
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
                                obj.push(NaN);
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
        $scope.currentView = 0; // -1 is device view and 1 is scatter view
        if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {
            $scope.currentView = 1;
        } else {
            $scope.currentView = -1;
        }
        if ($scope['interactions'] && $scope['interactions'].graphs) {
            $scope.$watch('interactions.graphs.dateWindow', function(newValue, oldValue) {
                //
                if (newValue && newValue.start && !newValue.end) {
                    $timeout(function() {
                        var currentInterval = {
                            name: "",
                            interval: newValue.start
                        };
                        if ($scope.currentChart["xAxisZoomRange"]) {
                            var range = $scope.currentChart["xAxisZoomRange"];
                            if (range[0] instanceof Date) {
                                range[0] = range[0].getTime();
                            }
                            if (range[1] instanceof Date) {
                                range[1] = range[1].getTime();
                            }
                            if (currentInterval && ((range[1] - currentInterval.interval) >= range[0])) {
                                if ($scope.rangeConfig) {
                                    $scope.rangeConfig.dateWindow = [new Date(range[1] - currentInterval.interval), range[1]];
                                }
                                $scope.currentChart.updateOptions({
                                    dateWindow: [new Date(range[1] - currentInterval.interval), range[1]]
                                });
                                $scope.currentIntervalChoosed = currentInterval;
                            }
                        } else {
                            $scope.currentIntervalChoosed = currentInterval;
                        }
                    });
                } else if (newValue && newValue.start && newValue.end) {
                    // need to change start and end
                    $timeout(function() {
                        var currentInterval = {
                            name: "",
                            interval: newValue.end - newValue.start
                        };
                        if ($scope.currentChart["xAxisZoomRange"]) {
                            var range = $scope.currentChart["xAxisZoomRange"];
                            if (range[0] instanceof Date) {
                                range[0] = range[0].getTime();
                            }
                            if (range[1] instanceof Date) {
                                range[1] = range[1].getTime();
                            }
                            // if (currentInterval && range[0] <= newValue.start && range[1] >= newValue.end) {
                            if ($scope.rangeConfig) {
                                $scope.rangeConfig.dateWindow = [new Date(newValue.start), new Date(newValue.end)];
                            }
                            $scope.currentChart.updateOptions({
                                dateWindow: [new Date(newValue.start), new Date(newValue.end)]
                            });
                            $scope.currentIntervalChoosed = currentInterval;
                            // }
                        } else {
                            $scope.currentIntervalChoosed = currentInterval;
                        }
                    });
                }
            });
        }

        $scope.device_name = "";
        $scope.parent_container = widgetData.data.parent;
        $scope.data_from = "application";
        $scope.checkY2Btns = function() {
            return $scope.basicInfo.zoom === true && $scope.showY2Btns === true;
        };
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
            $scope.currentIntervalsInfo = [];
            if ($scope['interactions'] && $scope['interactions'].graphs) {
                var collection_conf = null;
                if ($scope['interactions'].graphs.scatter) {
                    collection_conf = metadata.data.groups[2].collections;
                } else {
                    collection_conf = metadata.data.groups[1].collections;
                }
                var intervals = [];
                //reset
                $scope.currentIntervalsInfo = [];
                angular$1.forEach(collection_conf, function(item) {
                    intervals.push(item.name);
                });
                //get first and last for all levels
                dataService.deviceStoreSchemaInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, intervals).then(function(data) {
                    angular$1.forEach(data, function(_interval) {
                        angular$1.forEach(_interval.data[0], function(value, key) {
                            $scope.currentIntervalsInfo.push({
                                interval: key,
                                info: value
                            });
                        });
                    });
                });
                // -------------------  ---------------------
            }
            // add a timer just make sure the user is not playing with the button.
            var viewTimer = null;
            $scope.$watch('currentView', function(nObj, oObj) {
                // change
                if (viewTimer != null) {
                    $timeout.cancel(viewTimer);
                    // create new one
                    viewTimer = $timeout(function() {
                        changeViewFunc(nObj, oObj);
                    }, 500);
                } else {
                    viewTimer = $timeout(function() {
                        changeViewFunc(nObj, oObj);
                    }, 500);
                }
                $scope.fixInterval = false;
            });

            var changeViewFunc = function(nObj, oObj) {
                if (nObj == -1) {
                    $scope.autoupdate = true;
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
                        $scope.loadingShow = true;
                        dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                            initChart(data);
                        }, function(error) {
                            console.error(error);
                            // if errors happing in the server side, the graph should show someting like "lost connection" or "...."
                            $scope.emptyDataShow = true;
                            $scope.loadingShow = false;
                        });
                    }
                } else {
                    $scope.autoupdate = false;
                    //get relation config
                    if (!metadata.data.source.relation || "none" === metadata.data.source.relation) {
                        return;
                    } else {
                        var rangeLevel = null;
                        var otherLevels = [];
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
                            $scope.loadingShow = true;
                            dataService.childrenDeviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, metadata.data.source.relation, metadata.data.source.relation_group, rangeLevel, otherLevels, fields).then(function(data) {
                                // get all device trees
                                if (data != null && data.length > 0) {
                                    initChildrenChart(data);
                                } else {
                                    return;
                                }
                            }, function(error) {
                                console.error(error);
                                $scope.emptyDataShow = true;
                                $scope.loadingShow = false;
                            });
                        }
                    }
                }
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
                    $scope.loadingShow = true;
                    dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                        initChart(data);
                    }, function(error) {
                        console.error(error);
                        $scope.emptyDataShow = true;
                        $scope.loadingShow = false;
                    });
                }
            });

            $scope.$watch("chartDateTime", function(newValue, oldValue) {
                if (newValue.begin != null && newValue.end != null) {
                    var expect_points = Math.floor($element.parent().width());
                    // find a interval
                    var expectedInterval = (newValue.end - newValue.begin) / expect_points;
                    var conf = $scope.intevals.device;
                    // device detail view
                    if (!conf || conf.length == 0) {
                        return;
                    }
                    var preOne = conf[0].interval;
                    var lastOne = conf[conf.length - 1].interval;
                    // get the max
                    var expects = {
                        interval: null,
                        points: 0,
                        name: ""
                    };
                    angular$1.forEach(conf, function(config) {
                        if (((newValue.end - newValue.begin) / config.interval) <= expect_points) {
                            if (expects.points < ((newValue.end - newValue.begin) / config.interval)) {
                                expects.interval = config.interval;
                                expects.points = ((newValue.end - newValue.begin) / config.interval);
                                expects.name = config.name;
                            }
                        }
                    });
                    var cin = "";
                    // only have one interval
                    if (conf && conf.length == 1) {
                        expects.interval = conf[0].interval;
                        expectedInterval = conf[0].interval;
                        if ($scope.currentView == -1) {
                            $scope.autoupdate = true;
                            $scope.auto_store = conf[conf.length - 1].name;
                        }
                    } else {
                        if (expects.interval == preOne) {
                            expectedInterval = preOne;
                            $scope.autoupdate = false;
                        } else if (expects.interval == lastOne) {
                            expectedInterval = lastOne;
                            if ($scope.currentView == -1) {
                                $scope.autoupdate = true;
                                $scope.auto_store = conf[conf.length - 1].name;
                            }
                        } else {
                            $scope.autoupdate = false;
                            cin = expects.name;
                            expectedInterval = expects.interval;
                        }
                    }
                    $scope.currentIntervalName = "";
                    angular$1.forEach(conf, function(config) {
                        if (config.interval == expectedInterval) {
                            $scope.currentIntervalName = config.name;
                        }
                    });
                    // check the interval(raw data) no more than 1000 points
                    if (expectedInterval == lastOne) {
                        //
                        if (((newValue.end - newValue.begin) / expectedInterval) > expect_points) {
                            // reset range bar
                            $scope.rangeConfig.dateWindow = [new Date(newValue.end - (expect_points - 1) * expectedInterval), new Date(newValue.end)];
                            $scope.currentChart.updateOptions($scope.rangeConfig);
                            $scope.currentChartOptions = $scope.rangeConfig;
                            $scope.alertMessage = "Limit the number of \"Zoom-Out\" points to " + expect_points * 2 + ".";
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
                                $scope.loadingShow = true;
                                dataService.deviceStoreData($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, newValue.begin, newValue.end, fields).then(function(data) {
                                        // udpate chart
                                        var showData = [];
                                        angular$1.forEach(data, function(arr) {
                                            Array.prototype.push.apply(showData, arr.data.slice(0, arr.size));
                                        });
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
                                            if ($scope.rangeConfig.axes && !$scope.rangeConfig.axes.hasOwnProperty("y2")) {
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
                                                    'series': series_range
                                                };
                                                if (basicInfo && basicInfo.range_show) {
                                                    $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                                }
                                            }

                                        } else {
                                            series_range["span_y2"] = {
                                                axis: 'y2'
                                            };
                                            $scope.rangeSeries = series_range;
                                            var newLines = [];
                                            angular$1.copy(allLines, newLines);
                                            angular$1.forEach(newLines, function(line) {
                                                line.push(NaN);
                                            });
                                            $scope.rangeConfig = {
                                                'file': newLines,
                                                'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                                'series': series_range
                                            };
                                            if (basicInfo && basicInfo.range_show) {
                                                $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                            }
                                        }
                                    },
                                    function(data) {
                                        console.info(data);
                                        $scope.emptyDataShow = true;
                                        $scope.loadingShow = false;
                                    }
                                );
                            }
                        });
                    }


                    $scope.loadingShow = true;
                    if ($scope.currentView == 1) {
                        // scatter detail view

                        $scope.legendText = null;
                        var deviceInfo = [];
                        var currentStore = "";

                        $scope.childrenDevices = [];

                        // has problem....
                        angular$1.forEach($scope.childTrees, function(device) {
                            angular$1.forEach(device.trees, function(tree, index) {
                                if (expectedInterval == tree.frequency) {
                                    currentStore = tree.store;
                                    deviceInfo.push({
                                        name: device.name,
                                        device: device,
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

                        $scope.auto_fields = fields;
                        $scope.loadingShow = true;
                        dataService.devicesStoreData($rootScope.host, $rootScope.applicationName, deviceInfo, metadata.data.source.store, currentStore, newValue.begin, newValue.end, fields).then(function(data) {
                            var showData = [];
                            angular$1.forEach(data, function(arr) {
                                var deviceData = [];
                                angular$1.forEach(arr.data, function(bucket) {
                                    if (bucket.data != null) {
                                        Array.prototype.push.apply(deviceData, bucket.data.slice(0, bucket.size));
                                    }
                                });

                                var currentDeviceInfo = {};
                                angular$1.forEach(deviceInfo, function(device) {
                                    if (device.name == arr.device) {
                                        currentDeviceInfo = device;
                                    }

                                });
                                showData.push({
                                    device: arr.device,
                                    extension: currentDeviceInfo,
                                    data: deviceData
                                });
                            });
                            //get configuration
                            updateChildrenDetailChart(metadata, currentStore, $scope.rangeChildrenData, showData);

                            $timeout(function() {
                                // call interactions back
                                if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.fetchData) {
                                    $scope['interactions'].graphs.fetchData(showData);
                                    // check if the last guy is older than the end of the range bar, update graph again
                                    if ($scope['interactions'].graphs.dateWindow && !$scope['interactions'].graphs.dateWindow.end) {
                                        var end = null;
                                        if ($scope.chartDateWindow[1] instanceof Date) {
                                            end = $scope.chartDateWindow[1].getTime();
                                        } else {
                                            end = $scope.chartDateWindow[1];
                                        }
                                        if (end > showData[showData.length - 1].timestamp) {
                                            // need to move rang bar
                                            $scope.chartDateWindow = [showData[showData.length - 1].timestamp - $scope['interactions'].graphs.dateWindow.start, showData[showData.length - 1].timestamp];
                                            $scope.currentChart.updateOptions({
                                                dateWindow: $scope.chartDateWindow
                                            });
                                            // $scope.chartDateTime = {begin:showData[showData.length - 1].timestamp - $scope['interactions'].graphs.dateWindow.start, end:showData[showData.length - 1].timestamp};
                                        }
                                    }
                                }
                            });
                        }, function(data) {
                            console.info(data);
                            $scope.emptyDataShow = true;
                            $scope.loadingShow = false;
                        });

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
                                $scope.loadingShow = true;

                                if ($scope['interactions'] && $scope['interactions'].graphs) {
                                    //$scope.currentIntervalsInfo
                                    var end = null;
                                    var begin = null;
                                    if (newValue.begin instanceof Date) {
                                        begin = newValue.begin.getTime();
                                    } else {
                                        begin = newValue.begin;
                                    }
                                    if (newValue.end instanceof Date) {
                                        end = newValue.end.getTime();
                                    } else {
                                        end = newValue.end;
                                    }
                                    // don't change it to angular.forEach()
                                    for (var i = 0; i < $scope.currentIntervalsInfo.length; i++) {
                                        var item = $scope.currentIntervalsInfo[i];
                                        if (item.interval == tree.store) {
                                            if (item.info.last.timestamp < end) {
                                                // reset chartDateTime
                                                $scope.chartDateTime = {
                                                    begin: begin - (end - item.info.last.timestamp),
                                                    end: item.info.last.timestamp
                                                };
                                                return false;
                                            }
                                        }
                                    }
                                }
                                dataService.deviceStoreData($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, newValue.begin, newValue.end, fields).then(function(data) {
                                    // udpate chart
                                    var showData = [];
                                    angular$1.forEach(data, function(arr) {
                                        Array.prototype.push.apply(showData, arr.data.slice(0, arr.size));
                                    });
                                    showData = showData.filter(function(obj) {
                                        return obj != null;
                                    });
                                    showData.sort(function(a, b) {
                                        return a.timestamp > b.timestamp ? 1 : -1;
                                    });
                                    //get configuration
                                    updateDetailChart(metadata, tree.store, $scope.rangeData, showData);

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


                                        // call interactions back
                                        if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.fetchData) {
                                            $scope['interactions'].graphs.fetchData(showData);
                                            // check if the last guy is older than the end of the range bar, update graph again
                                            if ($scope['interactions'].graphs.dateWindow && !$scope['interactions'].graphs.dateWindow.end) {
                                                var end = null;
                                                if ($scope.chartDateWindow[1] instanceof Date) {
                                                    end = $scope.chartDateWindow[1].getTime();
                                                } else {
                                                    end = $scope.chartDateWindow[1];
                                                }
                                                if (end > showData[showData.length - 1].timestamp) {
                                                    // need to move rang bar
                                                    $scope.chartDateWindow = [showData[showData.length - 1].timestamp - $scope['interactions'].graphs.dateWindow.start, showData[showData.length - 1].timestamp];
                                                    $scope.currentChart.updateOptions({
                                                        dateWindow: $scope.chartDateWindow
                                                    });
                                                    // $scope.chartDateTime = {begin:showData[showData.length - 1].timestamp - $scope['interactions'].graphs.dateWindow.start, end:showData[showData.length - 1].timestamp};
                                                }

                                            }

                                        }


                                    });

                                }, function(data) {
                                    console.info(data);
                                });
                            }
                        });

                        $scope.fixGraphWithGap();
                    }
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

        var initChart = function(data) {
            $scope.intevalforshow = [];
            //
            $scope.intevals.device = [];
            var trees = data.trees;

            if (trees.length == 0) {
                return false;
            }

            $scope.trees = trees;
            var rangeTree = null;
            angular$1.forEach(trees, function(tree) {
                if (tree.range) {
                    if (tree.first != null && tree.last != null) {
                        rangeTree = tree;
                    }
                } else {
                    // the next on after range tree
                    if (tree.first != null && tree.last != null) {
                        rangeTree = tree;
                    }
                }
                $scope.intevals.device.push({
                    name: tree.store,
                    interval: tree.frequency
                });
            });

            // init chart with range data

            if (!rangeTree) {
                // data is empty
                $scope.emptyDataShow = true;
                $scope.loadingShow = false;
                return false;
            }
            var store = rangeTree.store;
            // get all data
            var allData = [];
            if (!rangeTree.first || !rangeTree.last) {
                $scope.emptyDataShow = true;
                $scope.loadingShow = false;
                return;
            }
            // fetchData(allData, rangeTree.tree);only get first and last
            if (rangeTree.first.timestamp == rangeTree.last.timestamp) {
                allData = allData.concat([rangeTree.first]);
            } else {
                allData = allData.concat([rangeTree.first, rangeTree.last]);
            }

            allData = allData.filter(function(obj) {
                return obj != null;
            });

            allData.sort(function(a, b) {
                return a.timestamp > b.timestamp ? 1 : -1;
            });


            if ($scope.trees.length == 0 || allData.length == 0) {
                $scope.emptyDataShow = true;
                $scope.loadingShow = false;
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
            // get configuration and make real data
            updateChart(metadata, store, allData, true);
        };

        var initChildrenChart = function(deviceDatas) {
            var devicesInfo = {};
            $scope.intevals.device = [];
            //range data with all device
            $scope.childTrees = [];
            $scope.childrenDevices = [];

            angular$1.forEach(deviceDatas, function(deviceData) {
                var device = deviceData.device;
                device["show"] = true;
                $scope.childrenDevices.push(device);
                var trees = deviceData.trees;
                $scope.childTrees.push({
                    name: device.name,
                    device: device,
                    trees: trees
                });
                var rangeTree = null;
                angular$1.forEach(trees, function(tree) {
                    if (tree.range && tree.first && tree.last) {
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
                    var allData = [];
                    // fetchData(allData, rangeTree.tree);
                    if (rangeTree.first.timestamp == rangeTree.last.timestamp) {
                        allData = allData.concat([rangeTree.first]);
                    } else {
                        allData = allData.concat([rangeTree.first, rangeTree.last]);
                    }

                    allData = allData.filter(function(obj) {
                        return obj != null;
                    });
                    allData.sort(function(a, b) {
                        return a.timestamp > b.timestamp ? 1 : -1;
                    });
                    //
                    deviceObj["range"] = rangeTree;
                    deviceObj["data"] = allData;
                    deviceObj["device"] = device;
                } else {
                    console.info(device.name + " has none data.");
                }

            });

            updateChildrenChart(metadata, devicesInfo, true);
        };


        var updateChildrenChart = function(metadata, devicesInfo, init) {
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
            angular$1.forEach(devicesInfo, function(device, key) {
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
                if ($scope.defaultColors[counter]) {
                    colors.push($scope.defaultColors[counter]);
                } else {
                    colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                }
                counter++;

                angular$1.forEach(collections, function(collection) {
                    if (collection.name == device.range.store) {
                        $scope.currentIntervalName = device.range.store;
                        var originalData = device.data;

                        // always same for each device
                        if (collection.rows[0].yaxis == 0) {
                            if (collection.rows[0].type == 'line') {
                                series[collection.rows[0].label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (collection.rows[0].type == 'bar') {
                                series[collection.rows[0].label] = {
                                    'axis': 'y1',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[collection.rows[0].label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }

                        } else {
                            series[collection.rows[0].label] = {
                                'axis': 'y2'
                            };

                            if (collection.rows[0].type == 'line') {
                                series[collection.rows[0].label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (collection.rows[0].type == 'bar') {
                                series[collection.rows[0].label] = {
                                    'axis': 'y2',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[collection.rows[0].label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }

                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }

                        if (collection.rows[0].legend_label) {
                            labels.push(device.device[collection.rows[0].legend_label]);
                        } else {
                            labels.push(key);
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
            //update chart
            if ($scope.currentChart) {

                $scope.rangeChildrenData = allLines;

                if (showY2axis) {
                    $scope.childrenRangeConfig = {
                        'labelsKMB': true,
                        'file': init ? [] : allLines,
                        legend: 'never',
                        labelsKMB: true,
                        labelsSeparateLines: false,
                        // data formate
                        labels: ['x'].concat(sampleData.labels),
                        highlightSeriesOpts: {
                            strokeWidth: 2,
                            strokeBorderWidth: 1,
                            highlightCircleSize: 2
                        },
                        'labels': ['x'].concat(labels),
                        'ylabel': leftAndRight.left,
                        'y2label': leftAndRight.right,
                        'series': series,
                        'colors': colors,
                        highlightCallback: function(e, x, pts, row, seriesName) {
                            var sn = "";
                            $scope.currentHighlight = seriesName;
                            angular$1.forEach(series, function(value, name, item) {
                                if (value.axis === "y1") {
                                    sn = name;
                                }
                            });
                            var point_show = {
                                x: 0,
                                y: 0
                            };
                            angular$1.forEach(pts, function(item, index) {
                                if (item.name === seriesName) {
                                    $scope.legendText = seriesName;
                                    $scope.legendColor = colors[index];
                                    // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                    $scope.legendText_device = seriesName;
                                    $scope.legendText_datetime = moment(item.xval).format('l HH:mm:ss');
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

                            $scope.$apply(function() {
                                $scope.legendTop = point_show.y;
                                $scope.legendLeft = point_show.x;
                            });
                        },
                        unhighlightCallback: function(e) {
                            $scope.currentHighlight = "";
                            $scope.$apply(function() {
                                $scope.legendText = null;
                                $scope.legendText_device = null;
                                $scope.legendText_datetime = null;
                                $scope.legendText_column = null;
                                $scope.legendText_value = null;
                            });
                        },
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
                        line.push(NaN);
                    });
                    series["span_y2"] = {
                        'axis': 'y2'
                    };
                    $scope.childrenRangeConfig = {
                        'drawGapEdgePoints': true,
                        'pointSize': 3,
                        'legend': 'never',
                        'labelsKMB': true,
                        'file': init ? [] : newLines,
                        'labelsSeparateLines': false,
                        'highlightSeriesOpts': {
                            strokeWidth: 2,
                            strokeBorderWidth: 1,
                            highlightCircleSize: 2
                        },
                        highlightCallback: function(e, x, pts, row, seriesName) {
                            var sn = "";
                            $scope.currentHighlight = seriesName;
                            angular$1.forEach(series, function(value, name, item) {
                                if (value.axis === "y1") {
                                    sn = name;
                                }
                            });
                            var point_show = {
                                x: 0,
                                y: 0
                            };
                            angular$1.forEach(pts, function(item, index) {
                                if (item.name === seriesName) {
                                    $scope.legendText = seriesName;
                                    $scope.legendColor = colors[index];
                                    // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                    $scope.legendText_device = seriesName;
                                    $scope.legendText_datetime = moment(item.xval).format('l HH:mm:ss');
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
                            $scope.$apply(function() {
                                $scope.legendTop = point_show.y;
                                $scope.legendLeft = point_show.x;
                            });
                        },

                        unhighlightCallback: function(e) {
                            $scope.currentHighlight = "";
                            $scope.$apply(function() {
                                $scope.legendText = null;
                                $scope.legendText_device = null;
                                $scope.legendText_datetime = null;
                                $scope.legendText_column = null;
                                $scope.legendText_value = null;
                            });
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


                if ($scope.chartDateWindow && $scope.rangeSelectorBar && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                    // keep the current range bar refresh once.
                    // make sure the begin != end
                    $scope.chartDateTime = {
                        begin: $scope.chartDateTime.begin,
                        end: $scope.chartDateTime.end
                    };
                    $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                } else if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != $scope.chartDateWindow[1]) && !$scope.rangeSelectorBar && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                    $scope.chartDateTime = {
                        begin: $scope.chartDateTime.begin,
                        end: $scope.chartDateTime.end
                    };
                    $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                    $scope.currentChart.updateOptions({
                        dateWindow: $scope.chartDateWindow
                    });
                } else {
                    $scope.currentChart["xAxisZoomRange"] = [allLines[0][0], allLines[allLines.length - 1][0]];
                    if (begin_path && end_path && !init_flag) {
                        // $scope.chartDateTime = {
                        // "begin": new Date(new Number(begin_path)),
                        // "end": new Date(new Number(end_path))
                        // };
                        $scope.chartDateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                        $scope.childrenRangeConfig.dateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                        init_flag = true;
                    } else {
                        if ($scope.currentIntervalChoosed && ((allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= allLines[0][0].getTime())) {
                            if ($scope.childrenRangeConfig) {
                                $scope.childrenRangeConfig.dateWindow = [new Date(allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval), allLines[allLines.length - 1][0]];
                            }
                            $scope.chartDateWindow = [new Date(allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval), allLines[allLines.length - 1][0]];
                        } else {
                            $scope.chartDateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                            if ($scope.childrenRangeConfig) {
                                $scope.childrenRangeConfig.dateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                            }

                        }
                    }

                    $scope.currentChart.updateOptions($scope.childrenRangeConfig);
                    $scope.currentChartOptions = $scope.childrenRangeConfig;
                }

                //
                // $scope.currentChart.updateOptions($scope.childrenRangeConfig);
                // keep the same time window and refersh
                // $scope.chartDateTime = {begin: $scope.chartDateTime.begin, end: $scope.chartDateTime.end};
                // $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                $scope.loadingShow = false;
            }
        };


        var updateChildrenDetailChart = function(metadata, store, rangeData, allData, init) {
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
            var counter = 0;
            var showY2axis = null;
            angular$1.forEach(allData, function(device) {
                if ($scope.defaultColors[counter]) {
                    colors.push($scope.defaultColors[counter]);
                } else {
                    colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                }
                counter++;

                if (device.data.length > 0) {

                    angular$1.forEach(collections, function(collection) {
                        if (collection.name == store) {
                            if (collection.rows[0].legend_label) {
                                labels.push(device.extension.device.device[collection.rows[0].legend_label]);
                            } else {
                                labels.push(device.device);
                            }

                            $scope.currentIntervalName = store;
                            if (collection.rows[0].yaxis == 0) {
                                if (collection.rows[0].type == 'line') {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y1',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                } else if (collection.rows[0].type == 'bar') {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y1',
                                        'plotter': barChartMultiColumnBarPlotter
                                    };
                                } else {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y1',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                }
                            } else {
                                if (collection.rows[0].type == 'line') {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y2',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                } else if (collection.rows[0].type == 'bar') {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y2',
                                        'plotter': barChartMultiColumnBarPlotter
                                    };
                                } else {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y2',
                                        'plotter': DygraphCanvasRenderer._linePlotter
                                    };
                                }
                                showY2axis = true;
                                $scope.showY2Btns = true;
                            }
                            var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                            var tempData = [];
                            var tempTime = [];
                            // make data
                            angular$1.forEach(device.data, function(data) {
                                var dateTime = new Date(data.timestamp);
                                try {
                                    var value = f(data);
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
                        timeTicket.push(NaN);
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
                    if (showY2axis) {
                        $scope.currentChartOptions = {
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'legend': 'never',
                            'labelsKMB': true,
                            'highlightSeriesOpts': {
                                strokeWidth: 2,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            labelsSeparateLines: false,
                            'file': init ? [] : chartData,
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
                        $scope.currentChart.updateOptions({
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'legend': 'never',
                            'labelsKMB': true,
                            'highlightSeriesOpts': {
                                strokeWidth: 2,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            highlightCallback: function(e, x, pts, row, seriesName) {
                                var sn = "";
                                $scope.currentHighlight = seriesName;
                                angular$1.forEach(series, function(value, name, item) {
                                    if (value.axis === "y1") {
                                        sn = name;
                                    }
                                });
                                var point_show = {
                                    x: 0,
                                    y: 0
                                };
                                angular$1.forEach(pts, function(item, index) {
                                    if (item.name === seriesName) {
                                        $scope.legendText = seriesName;
                                        $scope.legendColor = colors[index];
                                        // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                        $scope.legendText_device = seriesName;
                                        $scope.legendText_datetime = moment(item.xval).format('l HH:mm:ss');
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
                                $scope.$apply(function() {
                                    $scope.legendTop = point_show.y;
                                    $scope.legendLeft = point_show.x;
                                });
                            },
                            unhighlightCallback: function(e) {
                                $scope.currentHighlight = "";
                                $scope.$apply(function() {
                                    $scope.legendText = null;
                                    $scope.legendText_device = null;
                                    $scope.legendText_datetime = null;
                                    $scope.legendText_column = null;
                                    $scope.legendText_value = null;
                                });
                            },
                            labelsSeparateLines: false,
                            'file': init ? [] : chartData,
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
                            line.push(NaN);
                        });
                        series["span_y2"] = {
                            axis: 'y2'
                        };
                        $scope.currentChartOptions = {
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'legend': 'never',
                            'labelsKMB': true,
                            'file': init ? [] : newLines,
                            labelsSeparateLines: false,
                            'labels': ['x'].concat(labels).concat(["span_y2"]),
                            'ylabel': leftAndRight.left,
                            'highlightSeriesOpts': {
                                strokeWidth: 2,
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
                        $scope.currentChart.updateOptions({
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'legend': 'never',
                            'labelsKMB': true,
                            'file': init ? [] : newLines,
                            labelsSeparateLines: false,
                            'labels': ['x'].concat(labels).concat(["span_y2"]),
                            'ylabel': leftAndRight.left,
                            'highlightSeriesOpts': {
                                strokeWidth: 2,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 2
                            },
                            highlightCallback: function(e, x, pts, row, seriesName) {

                                var sn = "";
                                $scope.currentHighlight = seriesName;
                                angular$1.forEach(series, function(value, name, item) {
                                    if (value.axis === "y1") {
                                        sn = name;
                                    }
                                });
                                var point_show = {
                                    x: 0,
                                    y: 0
                                };
                                angular$1.forEach(pts, function(item, index) {
                                    if (item.name === seriesName) {
                                        $scope.legendText = seriesName;
                                        $scope.legendColor = colors[index];
                                        // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                        $scope.legendText_device = seriesName;
                                        $scope.legendText_datetime = moment(item.xval).format('l HH:mm:ss');
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

                                $scope.$apply(function() {
                                    $scope.legendTop = point_show.y;
                                    $scope.legendLeft = point_show.x;
                                });

                            },

                            unhighlightCallback: function(e) {
                                $scope.currentHighlight = "";
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
                    $scope.loadingShow = false;
                }
            }
            if (init) {
                // send the date window back to outside.
                if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.errorHandler) {
                    $scope['interactions'].graphs.errorHandler("G_OUT_RANG", $scope.currentChart["xAxisZoomRange"]);
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
                            if (row.type == 'line') {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (row.type == 'bar') {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }
                        } else {
                            series[row.label] = {
                                'axis': 'y2'
                            };
                            if (row.type == 'line') {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (row.type == 'bar') {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }
                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }
                        var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                        // add value
                        var counter = 0;
                        angular$1.forEach(allLines, function(realLine) {
                            try {
                                var value = f(allData[counter]);
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
                            'file': []
                        });
                        if ($scope.rangeSelectorBar) {
                            $scope.currentChart["xAxisZoomRange"] = $scope.rangeSelectorBar.xAxisExtremes();
                        }
                        $scope.loadingShow = false;
                    } else {
                        if ($scope.currentChart) {
                            if (showY2axis) {
                                $scope.currentChartOptions = {
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    'labelsSeparateLines': true,
                                    'highlightSeriesOpts': null,
                                    'labelsKMB': true,
                                    'fillGraph': true,
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
                                $scope.currentChart.updateOptions({
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    'fillGraph': true,
                                    'labelsSeparateLines': true,
                                    'highlightSeriesOpts': null,
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
                                    line.push(NaN);
                                });
                                series["span-Y2"] = {
                                    axis: 'y2'
                                };
                                $scope.currentChartOptions = {
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    'fillGraph': true,
                                    'labelsSeparateLines': true,
                                    'highlightSeriesOpts': null,
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
                                $scope.currentChart.updateOptions({
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    'fillGraph': true,
                                    'labelsSeparateLines': true,
                                    'highlightSeriesOpts': null,
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
        var updateChart = function(metadata, store, allData, init) {
            var deviceConfig = metadata.data.groups[1];
            var collections = deviceConfig.collections;
            var labels = [];
            var series = {};
            var colors = [];
            var leftAndRight = {
                left: deviceConfig.leftYAxis,
                right: deviceConfig.rightYAxis
            };
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
                            if (row.type == 'line') {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (row.type == 'bar') {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y1',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }
                        } else {
                            series[row.label] = {
                                'axis': 'y2'
                            };
                            if (row.type == 'line') {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            } else if (row.type == 'bar') {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': barChartMultiColumnBarPlotter
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y2',
                                    'plotter': DygraphCanvasRenderer._linePlotter
                                };
                            }
                            showY2axis = true;
                            $scope.showY2Btns = true;
                        }

                        var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                        // add value
                        var counter = 0;
                        angular$1.forEach(allLines, function(realLine) {
                            try {
                                var value = f(allData[counter]);
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
                                    'series': series_range
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
                                    line.push(NaN);
                                });
                                $scope.rangeSelectorBar.updateOptions({
                                    'file': newLines,
                                    'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                    'series': series_range
                                });
                            }
                        }

                        angular$1.forEach(yRanges, function(yrange) {
                            if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                yrange.min = yrange.min - (yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.max) * 0.10;
                            }
                        });

                        // if graph has 2 yAxis or a yAxis
                        if (showY2axis) {
                            $scope.rangeConfig = {
                                'drawGapEdgePoints': true,
                                'pointSize': 3,
                                'legend': 'follow',
                                'fillGraph': true,
                                'labelsSeparateLines': true,
                                'highlightSeriesOpts': null,
                                'labelsKMB': true,
                                'file': init ? [] : allLines,
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
                                line.push(NaN);
                            });
                            $scope.rangeConfig = {
                                'drawGapEdgePoints': true,
                                'pointSize': 3,
                                'legend': 'follow',
                                'fillGraph': true,
                                'labelsSeparateLines': true,
                                'highlightSeriesOpts': null,
                                'labelsKMB': true,
                                'file': init ? [] : newLines,
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
                            Dygraph.synchronize([$scope.rangeSelectorBar, $scope.currentChart], {
                                zoom: true,
                                selection: false,
                                range: false
                            });
                        }


                        if ($scope.chartDateWindow && $scope.rangeSelectorBar && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                            // keep the current range bar refresh once.
                            // make sure the begin != end
                            $scope.chartDateTime = {
                                begin: $scope.chartDateTime.begin,
                                end: $scope.chartDateTime.end
                            };
                            $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                        } else if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != $scope.chartDateWindow[1]) && !$scope.rangeSelectorBar && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                            $scope.chartDateTime = {
                                begin: $scope.chartDateTime.begin,
                                end: $scope.chartDateTime.end
                            };
                            $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                            $scope.currentChart.updateOptions({
                                dateWindow: $scope.chartDateWindow
                            });
                        } else {
                            $scope.currentChart["xAxisZoomRange"] = [allLines[0][0], allLines[allLines.length - 1][0]];
                            if (begin_path && end_path && !init_flag) {
                                // $scope.chartDateTime = {
                                // "begin": new Date(new Number(begin_path)),
                                // "end": new Date(new Number(end_path))
                                // };
                                $scope.chartDateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                $scope.rangeConfig.dateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                init_flag = true;
                            } else {
                                if ($scope.currentIntervalChoosed && ((allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= allLines[0][0].getTime())) {
                                    $scope.rangeConfig.dateWindow = [new Date(allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval), allLines[allLines.length - 1][0]];
                                } else {
                                    $scope.chartDateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                    $scope.rangeConfig.dateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                }
                            }
                            $scope.currentChart.updateOptions($scope.rangeConfig);
                            $scope.currentChartOptions = $scope.rangeConfig;
                        }


                        if (init) {
                            // send the date window back to outside.
                            if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.errorHandler) {
                                $scope['interactions'].graphs.errorHandler("G_OUT_RANG", $scope.currentChart["xAxisZoomRange"]);
                            }
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

        // function for show one
        $scope.showOne = function(deviceName) {

            if ($rootScope['standalone'] && $rootScope['standalone'] == true) {
                return false;
            }

            if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {
                return false;
            }


            // device type is
            if ($location.url().indexOf('/app/page/param/') != -1) {
                //open window
                $window.open("/#/app/page/param/" + $rootScope.applicationName + "/" + metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1]));
            } else {
                //open window
                $window.open("/#" + $location.url().replace("show", "param").replace($location.url().substr($location.url().lastIndexOf('/', $location.url().lastIndexOf('/') - 1) + 1), metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1])));
            }

        };


        var btntimer = null;


        $scope.btnZoomInVLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        $scope.btnZoomOutVLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        $scope.btnZoomInVRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        $scope.btnZoomOutVRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        $scope.btnPanVULeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };


        $scope.btnPanVDLeft = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[0].valueRange;
            yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };


        $scope.btnPanVURight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        $scope.btnPanVDRight = function() {
            var g = $scope.currentChart;
            var yAxes = g.axes_;
            var range = yAxes[1].valueRange;
            yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
            g.drawGraph_(false);
        };

        // functions for buttons
        $scope.btnpanleft = function() {
            // get current datetime window
            var g = $scope.currentChart;
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
                $scope.chartDateTime = {
                    begin: new Date(new Number(startDate)),
                    end: new Date(new Number(endDate))
                };
            }, 600);
        };

        $scope.btnpanright = function() {
            // get current datetime window
            var g = $scope.currentChart;
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


        $scope.btnzoomin = function() {
            // get current datetime window
            var g = $scope.currentChart;
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


        var timer = null;
        $scope.refersh = function(g, init) {
            if (timer) {
                $timeout.cancel(timer);
            }
            timer = $timeout(function() {
                if (init || g.xAxisRange()[0] != $scope.chartDateTime.begin || g.xAxisRange()[1] != $scope.chartDateTime.end) {
                    $scope.chartDateTime = {
                        begin: g.xAxisRange()[0],
                        end: g.xAxisRange()[1]
                    };
                    $scope.chartDateWindow = g.xAxisRange();
                }
            }, 600);
        };
    }
};

fgpWidgetGraph.buildFactory = function buildFactory ($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams) {
    fgpWidgetGraph.instance = new fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams);
    return fgpWidgetGraph.instance;
};

fgpWidgetGraph.$inject = ['$timeout', 'dataService', '$rootScope', '$interval', '$filter', '$location', '$stateParams'];

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
angular$1.module('fgp-kit', ['ngMap','ui.router']).service('dataService', dataAccessApi.buildFactory)
    .filter('removeSlash', function () {
        return function (input) {
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
        addTree: function (key,value) {
            if($window.localStorage[key]){
                var trees = JSON.parse($window.localStorage[key]);
                trees.push(value);
                this.setTree(key,trees);
            }else{
                this.setTree(key, [value]);
            }
        },
        clear: function(){
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
    .directive('emitLastRepeaterElement', [function () {
        return function (scope) {
            if (scope.$last) {
                scope.$emit('LastRepeaterElement');
            }
        };
    }]).filter('tableformatter', ['$filter', function ($filter) {
    return function (input, obj, field, formatter) {
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
