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
            interactions: "=",
            drill: "=",
            childrenDrill:"=",
            highlights: "=",
            eventsHandler: "="
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


        function findChild4Repeat(parentId, parentHtmlObj, arrayItems, newId, newScope) {

            for (var i = 0; i < arrayItems.length; i++) {
                if ('edit' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
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
                    var currentItem = angular.element(arrayItems[i].html_render);
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
                    var currentItem = angular.element(arrayItems[i].html_render);
                    var id = arrayItems[i].id;
                    newScope.showdata[id] = arrayItems[i];
                    parentHtmlObj.find('#edit' + parentId).append($compile(currentItem)(newScope));
                    findChild(arrayItems[i].id, currentItem, arrayItems, newScope);
                } else if ('detail_status_' + parentId === arrayItems[i].parent) {
                    var currentItem = angular.element(arrayItems[i].html_render);
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
                newScope["childrenDrill"] = $scope.childrenDrill;
                newScope["highlights"] = $scope.highlights;
                newScope["eventsHandler"] = $scope.eventsHandler;



                newScope.$on('bindChildRepeatEvent', function(evt, msg) {
                    angular.forEach($scope.configuration, function(item) {
                        if (item.id == msg.id) {
                            var items = angular.element("body").find("#" + item.id).children();
                            angular.forEach(items, function(item_new) {
                                newScope.showdata[item_new.id] = item;
                                var currentElement = angular.element(item_new);
                                if (currentElement.attr("dulp")) {
                                    var groupItems = angular.element("body").find("div[dulp='" + item.id + "']");
                                    angular.forEach(groupItems, function(dulpItem) {
                                        findChild4Repeat(item.id, angular.element(dulpItem), $scope.configuration, item_new.id, newScope);
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
                    angular.forEach(newScope.showdata, function(metadata, key) {
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
                angular.forEach($scope.configuration, function(item) {
                    if ('workingArea' === item.parent) {
                        var currentItem = angular.element(item.html_render);
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
                    angular.forEach(graphBindingArray, function(graph) {
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
    }
    static buildFactory() {
        fgpStage.instance = new fgpStage();
        return fgpStage.instance;
    }
}

export {
    fgpStage as
    default
}
