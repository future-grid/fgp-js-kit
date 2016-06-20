/**
 * Created by ericwang on 10/06/2016.
 */
'use strict';
class fgpStage {

    constructor() {
        this.scope = {
            applicationName: "=",
            deviceName: "=",
            server: "=",
            configuration: '='
        };
        this.replace = true;
        this.restrict = 'A';
    }

    template() {
        return '<div id="pageStage" class="wrapper col-md-12 col-xl-12" style="background-color: #fff;height:100%;">' +
            '</div>';
    }

    controller($scope, $element, $timeout, $rootScope, $compile, dataService) {
        $scope.showdata = {};

        $rootScope['applicationName'] = $scope.applicationName;
        $rootScope['host'] = $scope.server;
        $rootScope['device'] = $scope.deviceName;


        var graphBindingArray = [];

        $scope.$on('bindChildChartEvent', function (evt, msg) {
            graphBindingArray.push(msg);
        });


        $scope.$on('fetchWidgetMetadataEvent', function (evt, msg) {
            angular.forEach($scope.showdata, function (metadata, key) {
                if (key == msg.id) {
                    msg.callback({data: metadata, from: 'show'});
                    return;
                }
            });
        });

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

        /**
         * get device information
         */
        dataService.deviceInfo($scope.server, $scope.deviceName, null, $scope.applicationName).then(function (data) {
            // send device info to all widget
            $timeout(function () {
                $scope.$broadcast('deviceInfoEvent', {device: data});
            });
        });


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
