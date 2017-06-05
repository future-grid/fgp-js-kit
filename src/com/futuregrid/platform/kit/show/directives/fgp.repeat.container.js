/**
 * Created by ericwang on 15/06/2016.
 */
'use strict';
class fgpWidgetRepeatContainer {

    constructor($http) {
        this.restrict = 'E';
        this.scope = {};
        this._$http = $http;
    }

    template(element, attrs) {
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
    }

    controller($scope, $element, dataService, $rootScope, $timeout, $http, $location, $stateParams, $websocket) {
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
        }


    }


    static buildFactory($http) {
        fgpWidgetRepeatContainer.instance = new fgpWidgetRepeatContainer($http);
        return fgpWidgetRepeatContainer.instance;
    }

}

fgpWidgetRepeatContainer.$inject = ['$http'];

export {fgpWidgetRepeatContainer as default}