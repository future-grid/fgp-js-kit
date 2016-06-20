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
            $scope['defaultColors'] = [];
            for (var i = 0; i < 300; i++) {
                $scope.defaultColors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
            }
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
                $scope.data = [];
                //get all columns
                var f = null;
                angular.forEach($scope.showdata.metadata.data, function (item) {
                    try {
                        f = new Function("device", "with(device) { if(" + item.value + ") return " + item.value + ";}");
                        item.value = f(device);
                        $scope.data.push(item);
                    } catch (error) {
                        item.value = item.value;
                        $scope.data.push(item);
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
                    $scope.chart.data.datasets[0].backgroundColor = $scope.defaultColors.filter(function (item, index) {
                        if (index < $scope.pieData.value.length - 1) {
                            return item;
                        }
                    });
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