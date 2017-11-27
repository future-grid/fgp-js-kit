/**
 * Created by ericwang on 15/06/2016.
 */
'use strict';

class fgpWidgetContainer {

    constructor() {
        this.restrict = 'E';
        this.scope = {
            interactions: "="
        };
    }

    template(element, attrs) {
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

    }


    static buildFactory() {
        fgpWidgetContainer.instance = new fgpWidgetContainer();
        return fgpWidgetContainer.instance;
    }

}

fgpWidgetContainer.$inject = [];

export {fgpWidgetContainer as default}