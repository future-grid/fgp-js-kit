/**
 * Created by ericwang on 20/06/2016.
 */
import angular from 'angular';
import chartjs from  'chart.js';
class fgpWidgetPie {

    constructor($timeout) {
        this.restrict = 'E';
        this.scope = {};
        this.$timeout = $timeout;
    }


    template(element, attrs) {
        return '<div class = "{{css.width}}" ><div style="height: {{css.height}}px;">' +
            '<canvas class="fgpPieChart"></canvas>' +
            '</div>' +
            '</div>';
    }

    link(scope, element) {

        this.$timeout(function () {
            var ctx = element.find("canvas")[0];
            scope.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['1'],
                    datasets: [
                        {
                            data: [1],
                            backgroundColor: []
                        }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    legend: {display: true}
                }
            });
        });
    }


    controller($scope, $element, $timeout) {

        var id = $element.attr("id");
        var metadata = null;
        var widgetData = null;

        $scope.$emit('fetchWidgetMetadataEvent', {
            id: id, callback: function (data) {
                if (data) {
                    widgetData = data;
                }
            }
        });

        if (widgetData.from == "show" && widgetData.data) {
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
                var colors = [];
                //get all columns
                var f = null;
                angular.forEach($scope.showdata.metadata.data, function (item) {
                    try {
                        f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                        item.value = f(deviceData.device);
                        $scope.data.push(item);
                    } catch (error) {
                        item.value = item.value;
                        $scope.data.push(item);
                    }
                    if (item.color) {
                        colors.push(item.color);
                    } else {
                        colors.push('#' + (function co(lor) {
                                return (lor +=
                                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)])
                                && (lor.length == 6) ? lor : co(lor);
                            })(''));
                    }
                });
                // timeout
                $scope.pieData = {labels: [], value: []};
                $timeout(function () {
                    // create data
                    angular.forEach($scope.data, function (item) {
                        $scope.pieData.labels.push(item.label);
                        $scope.pieData.value.push(item.value);
                    });

                    $scope.chart.data.labels = $scope.pieData.labels;
                    $scope.chart.data.datasets[0].data = $scope.pieData.value;
                    $scope.chart.data.datasets[0].backgroundColor = colors;
                    // update chart
                    $scope.chart.update();
                });

            });


        }


    }

    static buildFactory($timeout) {
        fgpWidgetPie.instance = new fgpWidgetPie($timeout);
        return fgpWidgetPie.instance;
    }

}
fgpWidgetPie.$inject = ['$timeout'];

export {fgpWidgetPie as default}