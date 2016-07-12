/**
 * Created by ericwang on 20/06/2016.
 */
'use strict';
export default class fgpWidgetPageTitle {
    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
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
    }


    controller($scope, $element) {
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




    }

    static buildFactory() {
        fgpWidgetPageTitle.instance = new fgpWidgetPageTitle();
        return fgpWidgetPageTitle.instance;
    }
}