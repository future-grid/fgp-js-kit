/**
 * Created by ericwang on 20/06/2016.
 */
import angular from 'angular';
export default class fgpWidgetDeviceDetail {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        return '<div class = "{{css.width}}" style="padding:0px;"><div class="row" style="height: {{css.height}}px;">' +
            '<div class="row" ng-repeat="item in data">' +
            '<div class="col-xs-4 col-md-4" style="text-align: right; font-weight: bold;line-height: 30px;">{{item.label}}</div><div class="col-xs-8 col-md-8" style="text-align: left;line-height: 30px;">{{item.value}}</div>' +
            '</div>' +
            '</div>' +
            '<div id="detail_status_' + attrs.id + '" class="row" style="min-height: 50px;">' +
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


        /**
         * get device information
         */
        if (widgetData.data && widgetData.from == "show") {

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
                metadata = widgetData.data.metadata;

                $scope.showdata = widgetData.data;

                $scope.css = {
                    width: "col-md-12",
                    height: "400"
                };
                if ($scope.showdata.metadata.css) {
                    $scope.css = $scope.showdata.metadata.css;
                }


                $scope.data = [];
                //get all columns
                var f = null;
                angular.forEach($scope.showdata.metadata.data, function (item) {
                    try {
                        f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                        item.value = f(deviceData.device);
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
        fgpWidgetDeviceDetail.instance = new fgpWidgetDeviceDetail();
        return fgpWidgetDeviceDetail.instance;
    }
}