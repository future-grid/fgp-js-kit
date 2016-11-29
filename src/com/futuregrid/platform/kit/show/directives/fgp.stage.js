/**
 * Created by ericwang on 10/06/2016.
 */
import angular from "angular";
'use strict';
class fgpStage {

    constructor() {
        this.scope = {
            applicationName: "=",
            deviceName: "=",
            server: "=",
            configuration: '=',
            scatterColors: "="
        };
        this.replace = true;
        this.restrict = 'A';
    }

    template() {
        return '<div id="pageStage" class="wrapper col-md-12 col-xl-12" style="background-color: #fff;height:100%;">' +
            '</div>';
    }

    controller($scope, $element, $timeout, $rootScope, $compile, dataService, $interval) {
        $scope.showdata = {};

        if ($scope.scatterColors && $scope.scatterColors.length > 0) {
            dataService.setColors($scope.scatterColors);
        }


        $rootScope['applicationName'] = $scope.applicationName;
        $rootScope['host'] = $scope.server;
        $rootScope['device'] = $scope.deviceName;


        var graphBindingArray = [];

        $scope.$on('bindChildChartEvent', function (evt, msg) {
            graphBindingArray.push(msg);
        });

        $scope.$on('bindChildRepeatEvent', function (evt, msg) {
            angular.forEach($scope.configuration, function (item) {
                if (item.id == msg.id) {
                    var items = angular.element("body").find("#" + item.id).children();
                    angular.forEach(items, function (item_new) {
                        $scope.showdata[item_new.id] = item;
                        findChild4Repeat(item.id, angular.element(item_new), $scope.configuration);
                    });
                }
            });
        });


        $scope.$on('fetchWidgetMetadataEvent', function (evt, msg) {
            angular.forEach($scope.showdata, function (metadata, key) {
                if (key == msg.id) {
                    msg.callback({data: metadata, from: 'show'});
                    return;
                }
            });
        });


        function findChild4Repeat(parentId, parentHtmlObj, arrayItems) {

            for (var i = 0; i < arrayItems.length; i++) {
                if ('edit' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    $scope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)($scope));
                    findChild(arrayItems[i].id, currentItem, arrayItems);
                } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    $scope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)($scope));
                    findChild(arrayItems[i].id, currentItem, arrayItems);
                }
            }
        }

        function findChild(parentId, parentHtmlObj, arrayItems) {

            for (var i = 0; i < arrayItems.length; i++) {
                if ('edit' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    $scope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)($scope));
                    findChild(arrayItems[i].id, currentItem, arrayItems);
                } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    $scope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)($scope));
                    findChild(arrayItems[i].id, currentItem, arrayItems);
                }
            }
        }

        angular.forEach($scope.configuration, function (item) {
            if ('workingArea' === item.parent) {
                var currentItem = angular.element(item.html_render);
                $scope.showdata[item.id] = item;
                $element.append($compile(currentItem)($scope));
                findChild(item.id, currentItem, $scope.configuration);
            }
        });

        var sendDeviceData = function () {
            dataService.deviceInfo($scope.server, $scope.deviceName, null, $scope.applicationName).then(function (data) {
                // send device info to all widget
                $timeout(function () {
                    $scope.$broadcast('deviceInfoEvent', {device: data, from: 'application'});
                });
            });
        };

        /**
         * get device information
         */
        if ($scope.deviceName && $scope.deviceName != "" && "undefined" != $scope.deviceName) {
            // first time
            sendDeviceData();
            // every 30 seconds
            $interval(function () {
                sendDeviceData();
            }, 30000);
        }


        // all item created;
        $timeout(function () {
            angular.forEach(graphBindingArray, function (graph) {
                $scope.$broadcast('bindFatherGraphEvent', {parent: graph.graphs, children: graph.children});
            });
        });
    }


    static buildFactory() {
        fgpStage.instance = new fgpStage();
        return fgpStage.instance;
    }
}

export {fgpStage as default}
