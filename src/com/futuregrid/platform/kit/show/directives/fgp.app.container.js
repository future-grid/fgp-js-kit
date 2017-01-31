/**
 * Created by eric on 29/11/16.
 */
'use strict';
class fgpWidgetAppContainer {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        var element_id = attrs.id;
        //<div class="alert alert-info" role="alert">...</div>
        return '' +
            '<div ng-show="showstyle == \'list\'" style="padding:0;margin-bottom: 5px;background-color: {{css.background.color}}; border: 1px solid; border-color: {{css.border.color}};border-radius: 5px;"  class="col-md-12 col-xs-12  alert alert-info" id="' + element_id + '_{{$index}}" repeat-id="{{container.id}},{{host}},{{container.application}}" ng-repeat="container in containers | orderBy: \'Name\' as filtered_result track by $index" emit-last-repeater-element>' +
            '<div class="col-md-8 col-xs-8" role="alert" style="min-height: 24px; text-align: left;margin-bottom: 0px;padding: 3px;">' +
            '<i class="fa fa-hdd-o" aria-hidden="true" style="padding-right: 5px;"></i>{{container.label | removeSlash}}' +
            '</div>' +
            '<div class="col-md-4 col-xs-4" id="edit' + element_id + '" style="min-height: 24px; padding: 0;">' +
            '</div>' +
            '</div>' +

            '<div ng-show="showstyle == \'grid\'" style="padding:0;margin-bottom: 5px;background-color: {{css.background.color}}; border: 1px solid; border-color: {{css.border.color}};border-radius: 5px;"  class="col-md-6 col-xs-6 alert alert-info" id="' + element_id + '_{{$index}}" repeat-id="{{container.id}},{{host}},{{container.application}}" ng-repeat="container in containers | orderBy: \'Name\' as filtered_result track by $index" emit-last-repeater-element>' +
            '<div class="col-md-8 col-xs-8" role="alert" style="min-height: 24px;text-align: left;margin-bottom: 0px;padding: 3px;">' +
            '<i class="fa fa-hdd-o" aria-hidden="true" style="padding-right: 5px;"></i>{{container.label | removeSlash}}' +
            '</div>' +
            '<div class="col-md-4 col-xs-4" id="edit' + element_id + '" style="min-height: 24px; padding: 0;">' +
            '</div>' +
            '</div>' +
            '';
    }

    controller($scope, $element, dataService, $rootScope, $timeout) {
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
                id:widgetData.data.parent,
                callback: function (style) {
                    $scope.showstyle = style;
                }
            });

        });



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
                    application: data.application
                };
                var flag = false;
                angular.forEach($scope.containers, function (container) {
                    if (container.id == app.id) {
                        container = app;
                        // update timer
                        var timer = $scope.containerswithTimeout.filter(function (item) {
                            return item.app.id == app.id;
                        });
                        $timeout.cancel(timer[0].t);
                        if(data.stats != "removed"){
                            var newTimer = $timeout(function () {
                                var index = $scope.containers.indexOf(app);
                                $scope.containers.splice(index, 1);
                            }, 30000);

                            timer[0].t = newTimer;
                            flag = true;
                        }else{
                            var index = -1;
                            angular.forEach($scope.containers, function (item, itemIndex) {
                                if(item.id === app.id){
                                    index = itemIndex;
                                }
                            });
                            $scope.containers.splice(index, 1);
                            flag = true;
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

    }

    static buildFactory() {
        fgpWidgetAppContainer.instance = new fgpWidgetAppContainer();
        return fgpWidgetAppContainer.instance;
    }

}

fgpWidgetAppContainer.$inject = [];

export {fgpWidgetAppContainer as default}