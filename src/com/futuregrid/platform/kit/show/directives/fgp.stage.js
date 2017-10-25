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
            scatterColors: "=",
            standalone: "=",
            interactions: "="
        };
        this.replace = true;
        this.restrict = 'A';
    }

    template() {
        return '<div id="pageStage" class="wrapper col-md-12 col-xl-12" style="background-color: #fff;height:100%;padding: 0px;">' +
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
        $rootScope['standalone'] = $scope.standalone;


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
                        var currentElement = angular.element(item_new);
                        if (currentElement.attr("dulp")) {
                            var groupItems = angular.element("body").find("div[dulp='" + item.id + "']");
                            angular.forEach(groupItems, function (dulpItem) {
                                findChild4Repeat(item.id, angular.element(dulpItem), $scope.configuration, item_new.id);
                            });
                        }else{
                            findChild4Repeat(item.id, currentElement, $scope.configuration, item_new.id);
                        }
                    });
                }
            });
        });

        $scope.$on('listStyleEvent', function (evt, param) {
            var config = $scope.showdata[param.id.replace("edit", "")];
            param.callback(config.metadata.data.datasource.style);
        });


        $scope.$on('fetchWidgetMetadataEvent', function (evt, msg) {
            angular.forEach($scope.showdata, function (metadata, key) {
                if (key == msg.id) {
                    msg.callback({data: metadata, from: 'show'});
                    return;
                }
            });
        });


        function findChild4Repeat(parentId, parentHtmlObj, arrayItems, newId) {

            for (var i = 0; i < arrayItems.length; i++) {
                if ('edit' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;

                    $scope.showdata[id] = arrayItems[i];
                    if (parentHtmlObj.attr("repeat-id")) {
                        $scope.repeat = parentHtmlObj.attr("repeat-id");
                    }
                    if (parentHtmlObj.find('#edit' + parentId).find("#" + id).length == 0) {
                        parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)($scope));
                    }
                    findChild4Repeat(arrayItems[i].id, currentItem, arrayItems);
                }
                else if ('detail_status_' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    $scope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#detail_status_' + parentId).append($compile(currentItem)($scope));
                    findChild4Repeat(arrayItems[i].id, currentItem, arrayItems);
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



        $scope.$watch('deviceName', function (newVal, oldVal) {
            if(newVal){
                $element.empty();
                // refersh
                angular.forEach($scope.configuration, function (item) {
                    if ('workingArea' === item.parent) {
                        var currentItem = angular.element(item.html_render);
                        $scope.showdata[item.id] = item;
                        $element.append($compile(currentItem)($scope));
                        findChild(item.id, currentItem, $scope.configuration);
                    }
                });
                /**
                 * get device information
                 */
                if ($scope.deviceName && $scope.deviceName != "" && "undefined" != $scope.deviceName) {
                    // first time
                    sendDeviceData();
                }
                // all item created;
                $timeout(function () {
                    angular.forEach(graphBindingArray, function (graph) {
                        $scope.$broadcast('bindFatherGraphEvent', {parent: graph.graphs, children: graph.children});
                    });
                });
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






    }


    static
    buildFactory() {
        fgpStage.instance = new fgpStage();
        return fgpStage.instance;
    }
}

export {fgpStage as default}
