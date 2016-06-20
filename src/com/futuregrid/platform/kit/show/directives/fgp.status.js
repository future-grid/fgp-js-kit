/**
 * Created by ericwang on 20/06/2016.
 */
import angular from 'angular';
export default class fgpWidgetStatus {


    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        return '<div class = "{{css.width}}"><div class="row" style="height: {{css.height}}px;">' +
            '<div ng-switch="data[0].value">' +
            '<div ng-switch-when="true" style="font-size: 48px;"><i class="fa fa-circle" style="color:green; -webkit-animation-name: online; -webkit-animation-duration: 4s;animation-name: online;animation-duration: 4s;"></i> online</div>' +
            '<div ng-switch-default style="font-size: 48px;"><i class="fa fa-circle" style="color:red; -webkit-animation-name: offline; -webkit-animation-duration: 4s;animation-name: offline;animation-duration: 4s;"></i> offline</div>' +
            '</div>' +
            '</div>' +
            '</div>';
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

        $scope.showdata = widgetData.data;
        $scope.css = {
            width: "col-md-12",
            height: "400"
        };
        if ($scope.showdata.metadata.css) {
            $scope.css = $scope.showdata.metadata.css;
        }
        /**
         * get device information
         */
        if (widgetData.data && widgetData.from == "show") {
            $scope.$on('deviceInfoEvent', function (event, data) {
                metadata = widgetData.data.metadata;
                $scope.data = [];
                //get all columns
                var f = null;
                angular.forEach($scope.showdata.metadata.data, function (item) {
                    try {
                        f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                        item.value = f(device);
                        $scope.data.push(item);
                    } catch (error) {
                        item.value = "";
                        $scope.data.push(item);
                    }
                });

            });
        }

    }

    static buildFactory() {
        fgpWidgetStatus.instance = new fgpWidgetStatus();
        return fgpWidgetStatus.instance;
    }


}