/**
 * Created by ericwang on 21/06/2016.
 */
import angular from 'angular';

class fgpWidgetChartTable {


    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        return '<div style="padding:0px;height: {{css.height}}px;position: relative; overflow-y : auto;">' +
            '<table st-table="rowCollection" class="col-md-12 table table-striped">' +
            '<thead>' +
            '<tr>' +
            '<th ng-repeat="column in sampledata.columns">{{column.label}}</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            '<tr ng-repeat="value in sampledata.values">' +
            '<td ng-repeat="col in sampledata.columns">{{value[col.label] | tableformatter: value : col.label : col.formatter}}</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</div>';
    }

    controller($scope, $element) {

        var element_id = $element.attr("id");
        var widgetData = null;

        $scope.$emit('fetchWidgetMetadataEvent', {
            id: element_id, callback: function (data) {
                if (data) {
                    widgetData = data;
                }
            }
        });

        //show
        $scope.showdata = widgetData.data;

        $scope.css = {
            width: "col-md-12",
            height: "400"
        };
        if ($scope.showdata.metadata.css) {
            $scope.css = $scope.showdata.metadata.css;
        }


        $scope.$on('chartDataChangeEvent', function (event, chartData) {
            var chartId = chartData.id;
            if ($scope.showdata.metadata.data.chartId === chartId && chartData.group == "device") {
                $scope.sampledata = {};
                // make data
                var collectionName = chartData.data.collection;
                var groupName = chartData.group;
                var columns = [];
                //get group and collection configuration
                angular.forEach($scope.showdata.metadata.data.groups, function (group) {
                    if (group.name == groupName) {
                        angular.forEach(group.collections, function (collection) {
                            if (collection.name === collectionName) {
                                columns = collection.rows;
                            }
                        });
                    }
                });


                $scope.sampledata.columns = [];

                angular.forEach(columns, function (column) {
                    $scope.sampledata.columns.push({label: column.label, formatter: column.formatter});
                });
                $scope.sampledata.values = [];
                angular.forEach(columns, function (column) {
                    var f = new Function("data", "with(data) { if(" + column.value + ") return " + column.value + ";return '';}");
                    angular.forEach(chartData.data.data, function (record, index) {
                        if ($scope.sampledata.values.length < chartData.data.data.length) {
                            //add new one
                            var item = {};
                            item[column.label] = f(record);
                            $scope.sampledata.values.push(item);
                        } else {
                            $scope.sampledata.values[index][column.label] = f(record);
                        }
                    });
                });

                var cleanData = [];
                angular.forEach($scope.sampledata.values, function (value, index) {
                    var flag = false;
                    angular.forEach(columns, function (column) {
                        if (value[column.label] && value[column.label] != "") {
                            flag = true;
                        }
                    });

                    if (flag) {
                        cleanData.push(value);
                    }
                });
                $scope.sampledata.values = cleanData;

            } else if ($scope.showdata.metadata.data.chartId === chartId && chartData.group == "relation") {
                //


            }

        });


    }

    static buildFactory() {
        fgpWidgetChartTable.instance = new fgpWidgetChartTable();
        return fgpWidgetChartTable.instance;
    }


}

export {fgpWidgetChartTable as default}