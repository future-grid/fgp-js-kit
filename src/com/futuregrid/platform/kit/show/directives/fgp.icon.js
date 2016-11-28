/**
 * Created by eric on 28/11/16.
 */
export default class fgpIcon {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        var show_dom = '<div class="{{css.width}}" style="margin:10px;background-color: {{css.background.color}};border-color:{{css.border.color || \'#fff\'}};">' +
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
    }

    controller($scope, $element) {
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

    }


    static buildFactory() {
        fgpIcon.instance = new fgpIcon();
        return fgpIcon.instance;
    }

}