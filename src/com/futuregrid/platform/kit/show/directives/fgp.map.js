/**
 * Created by ericwang on 20/06/2016.
 */
import angular from 'angular';
import ngMap from 'ngmap';
export default class fgpWidgetMap {


    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        var dom_show = '<div class = "{{css.width}}" style="padding:0px;height:{{css.height}}px;" map-lazy-load="https://maps.google.com/maps/api/js">' +
            '<ng-map style="height: 100%;width: 100%;" center="{{center}}" zoom="15">' +
            '<marker on-click="map.showInfoWindow(\'info_' + attrs.id + '\')" id="marker_' + attrs.id + '" ng-repeat="item in markers" icon="{{item.image}}" position="{{item.latitude}},{{item.longitude}}" title="{{item.name}}" animation="Animation.DROP" ></marker>' +
            '</ng-map>' +
            '</div>' +
            '';
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

        /**
         * get device information
         */
        if (widgetData.data && widgetData.from == "show") {
            $scope.$on('deviceInfoEvent', function (event, data) {
                metadata = widgetData.data.metadata;

                $scope.showdata = widgetData.data;

                $scope.css = {
                    width: "col-md-12",
                    height: "400"
                };
                if ($scope.showdata.metadata.css) {
                    $scope.css = $scope.showdata.metadata.css;
                }

                var location = {};
                $scope.markers = [];
                $scope.details = $scope.$parent.device;


                // show one point.
                var f = null;
                angular.forEach($scope.showdata.metadata.data, function (item) {
                    try {
                        f = new Function("device", "with(device) { return " + item.value + ";}");
                        var result = f(device);
                        if (result) {
                            location[item.label] = result;
                        } else {
                            location[item.label] = "";
                        }
                    } catch (error) {
                        // show image
                        if ("image" == item.label) {
                            location[item.label] = item.value;
                        } else {
                            location[item.label] = "";
                        }

                    }
                });


                //do not show
                if (location.latitude == "" || location.longitude == "") {
                    //hard code. the location is Melbourne
                    location.latitude = "-37.810000";
                    location.longitude = "144.950000";
                    $scope.center = [location.latitude, location.longitude];
                    // $scope.markers.push(location);
                } else {
                    $scope.center = [location.latitude, location.longitude];
                    $scope.markers.push(location);
                }

            });
        }

    }

    static buildFactory() {
        fgpWidgetMap.instance = new fgpWidgetMap();
        return fgpWidgetMap.instance;
    }


}