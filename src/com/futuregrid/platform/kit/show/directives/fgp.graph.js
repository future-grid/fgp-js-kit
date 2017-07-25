/**
 * Created by ericwang on 15/06/2016.
 */
import angular from "angular";
import Dygraph from "dygraphs";
class fgpWidgetGraph {

    constructor($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams) {
        this.restrict = 'E';
        this.scope = {};
        this.$timeout = $timeout;
        this._dataService = dataService;
    }

    template(element, attrs) {
        var flag = attrs.hasOwnProperty("shown");
        if (flag) {
            var dom_loading = '<div ng-show="loadingShow" id="loading_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner">' +
                '<div class="rect1"></div>' +
                '<div class="rect2"></div>' +
                '<div class="rect3"></div>' +
                '<div class="rect4"></div>' +
                '<div class="rect5"></div>' +
                '</div></div>';


            var dom_empty_data = '<div ng-show="emptyDataShow" id="emptydata_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner" style="width: 100%;">' +
                '<h1>Empty Data!</h1>' +
                '</div></div>';

            return '<div class="{{css.width}}"><div class="col-md-12" style="padding:0px;height:{{css.height}}px;-webkit-user-select: none; /* Chrome all / Safari all */  -moz-user-select: none; /* Firefox all */  -ms-user-select: none; /* IE 10+ */  user-select: none;"><div class="row"><div class="col-md-12"><a class="tooltips" href="javascript:;" style="float: right;margin-right: 10px;" ng-click="currentView = -currentView"><div class="relationBtn">R</div><span>Scatter View</span></a><div ng-hide="true" class="checkbox" style="float: right;margin-right: 10px; margin-bottom: 5px; margin-top: 0;" ng-model="fixInterval" ng-click="fixInterval=!fixInterval"><label><input type="checkbox" ng-model="fixInterval" ng-clicked="fixInterval" ng-change="fixGraphWithGap_click()">fixed interval</label></div><div style="float: right; margin-right: 10px;"><label class="label-inline" ng-repeat="item in intevals.device"><span class="badge" style="background-color: {{ item.name == currentIntervalName ? \'#009900;\' : \'\'}}">{{item.name}}</span></label></div></div></div><div class="line-chart-graph" style="width: 100%;height: 100%;"></div></div>' + dom_loading + dom_empty_data + '<div class="row"><div class="col-md-12" style="min-height: 30px;"></div><div class="col-md-6" ng-show="rangeSelectorBar">{{chartDateWindow[0] | date : \'h:mm a MMMM d, y\'}}</div><div class="col-md-6" style="text-align: right;" ng-show="rangeSelectorBar">{{chartDateWindow[1] | date : \'h:mm a MMMM d, y\'}}</div><div class="col-md-12" style="min-height: 40px;"><div class="range-selector-bar" style="height: 0px;margin-top: 30px;"></div></div></div></div></div>';
        }
    }

    link(scope, element, attrs) {
        scope['defaultColors'] = this._dataService.defaultColors();
        scope.status = true;
        var timeOut = this.$timeout;
        this.$timeout(function () {
            var getData = function (numSeries, numRows, name) {
                var result = {labels: null, data: null};
                var data = [];
                var labels = [];
                //init date
                var initDate = new Date("2014/01/01 00:00:00");
                for (var j = 0; j < numRows; ++j) {
                    data[j] = [new Date(initDate.getTime() + 900000)];
                    initDate = new Date(initDate.getTime() + 900000);
                }
                for (var i = 0; i < numSeries; ++i) {
                    labels.push(name + i);
                    var val = 0;
                    for (var j = 0; j < numRows; ++j) {
                        val += Math.random() - 0.5;
                        data[j][i + 1] = val;
                    }
                }
                result.labels = labels;
                result.data = data;
                return result;
            };


            var sampleData = getData(1, 10, 'Device');

            function movePan(event, g, context, side) {

                context.dragEndX = Dygraph.dragGetX_(event, context);
                context.dragEndY = Dygraph.dragGetY_(event, context);


                // y-axis scaling is automatic unless this is a full 2D pan.
                if (context.is2DPan) {

                    var pixelsDragged = context.dragEndY - context.dragStartY;
                    // Adjust each axis appropriately.
                    if (side == "r") {
                        var axis = g.axes_[0];
                        var axis_data = context.axes[0];
                        var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;

                        var boundedValue = context.boundedValues ? context.boundedValues[0] : null;

                        // In log scale, maxValue and minValue are the logs of those values.
                        var maxValue = axis_data.initialTopValue + unitsDragged;
                        if (boundedValue) {
                            maxValue = Math.min(maxValue, boundedValue[1]);
                        }
                        var minValue = maxValue - axis_data.dragValueRange;
                        if (boundedValue) {
                            if (minValue < boundedValue[0]) {
                                // Adjust maxValue, and recompute minValue.
                                maxValue = maxValue - (minValue - boundedValue[0]);
                                minValue = maxValue - axis_data.dragValueRange;
                            }
                        }
                        if (g.attributes_.getForAxis("logscale", 0)) {
                            axis.valueWindow = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)];
                            axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)];
                        } else {
                            axis.valueWindow = [minValue, maxValue];
                            axis.valueRange = [minValue, maxValue];
                        }
                    } else if (side == 'l') {
                        var axis = g.axes_[1];
                        var axis_data = context.axes[1];
                        var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;

                        var boundedValue = context.boundedValues ? context.boundedValues[1] : null;

                        // In log scale, maxValue and minValue are the logs of those values.
                        var maxValue = axis_data.initialTopValue + unitsDragged;
                        if (boundedValue) {
                            maxValue = Math.min(maxValue, boundedValue[1]);
                        }
                        var minValue = maxValue - axis_data.dragValueRange;
                        if (boundedValue) {
                            if (minValue < boundedValue[0]) {
                                // Adjust maxValue, and recompute minValue.
                                maxValue = maxValue - (minValue - boundedValue[0]);
                                minValue = maxValue - axis_data.dragValueRange;
                            }
                        }
                        if (g.attributes_.getForAxis("logscale", 1)) {
                            axis.valueWindow = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)];
                            axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)];
                        } else {
                            axis.valueWindow = [minValue, maxValue];
                            axis.valueRange = [minValue, maxValue];
                        }
                    } else {
                        var minDate = context.initialLeftmostDate -
                            (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
                        if (context.boundedDates) {
                            minDate = Math.max(minDate, context.boundedDates[0]);
                        }
                        var maxDate = minDate + context.dateRange;
                        if (context.boundedDates) {
                            if (maxDate > context.boundedDates[1]) {
                                // Adjust minDate, and recompute maxDate.
                                minDate = minDate - (maxDate - context.boundedDates[1]);
                                maxDate = minDate + context.dateRange;
                            }
                        }
                        var zoomRange = g.xAxisZoomRange;
                        if (g.xAxisZoomRange[0] instanceof Date) {
                            zoomRange[0] = g.xAxisZoomRange[0].getTime();
                        }
                        if (g.xAxisZoomRange[1] instanceof Date) {
                            zoomRange[1] = g.xAxisZoomRange[1].getTime();
                        }

                        if (minDate < zoomRange[0] || maxDate > zoomRange[1]) {
                            return;
                        }

                        if (g.getOptionForAxis("logscale", "x")) {
                            g.dateWindow_ = [Math.pow(Dygraph.LOG_SCALE, minDate),
                                Math.pow(Dygraph.LOG_SCALE, maxDate)];
                        } else {
                            g.dateWindow_ = [minDate, maxDate];
                        }
                    }
                }
                g.drawGraph_(false);
            }


            function offsetToPercentage(g, offsetX, offsetY) {
                // This is calculating the pixel offset of the leftmost date.
                var xOffset = g.toDomCoords(g.xAxisRange()[0], null)[0];
                var yar0 = g.yAxisRange(0);

                // This is calculating the pixel of the higest value. (Top pixel)
                var yOffset = g.toDomCoords(null, yar0[1])[1];

                // x y w and h are relative to the corner of the drawing area,
                // so that the upper corner of the drawing area is (0, 0).
                var x = offsetX - xOffset;
                var y = offsetY - yOffset;

                // This is computing the rightmost pixel, effectively defining the
                // width.
                var w = g.toDomCoords(g.xAxisRange()[1], null)[0] - xOffset;

                // This is computing the lowest pixel, effectively defining the height.
                var h = g.toDomCoords(null, yar0[0])[1] - yOffset;

                // Percentage from the left.
                var xPct = w == 0 ? 0 : (x / w);
                // Percentage from the top.
                var yPct = h == 0 ? 0 : (y / h);

                // The (1-) part below changes it from "% distance down from the top"
                // to "% distance up from the bottom".
                return [xPct, (1 - yPct)];
            }


            function zoom(g, zoomInPercentage, xBias, yBias, direction, side) {
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }

                function adjustAxis(axis, zoomInPercentage, bias) {
                    var delta = axis[1] - axis[0];
                    var increment = delta * zoomInPercentage;
                    var foo = [increment * bias, increment * (1 - bias)];
                    return [axis[0] + foo[0], axis[1] - foo[1]];
                }

                xBias = xBias || 0.5;
                yBias = yBias || 0.5;
                var yAxes = g.axes_;
                var newYAxes = [];
                for (var i = 0; i < g.numAxes(); i++) {
                    newYAxes[i] = adjustAxis(yAxes[i].valueRange, zoomInPercentage, yBias);
                }
                if ('v' == direction) {
                    if ('l' == side) {
                        yAxes[0]['valueRange'] = newYAxes[0];
                        yAxes[0]['valueWindow'] = newYAxes[0];
                    } else if ('r' == side && g.numAxes() == 2) {
                        yAxes[1]['valueRange'] = newYAxes[1];
                        yAxes[1]['valueWindow'] = newYAxes[1];
                    }
                    g.drawGraph_(false);
                } else {

                    var ranges = [];
                    angular.forEach(g.xAxisRange(), function (range) {
                        if (range instanceof Date) {
                            ranges.push(range.getTime());
                        } else {
                            ranges.push(range);
                        }
                    });

                    var newZoomRange = adjustAxis(ranges, zoomInPercentage, xBias);
                    // do not bigger than range data
                    var zoomRange = [];
                    if (g.hasOwnProperty("xAxisZoomRange") && g.xAxisZoomRange) {
                        zoomRange[0] = g.xAxisZoomRange[0];
                        zoomRange[1] = g.xAxisZoomRange[1];
                    } else {
                        zoomRange[0] = g.xAxisExtremes()[0];
                        zoomRange[1] = g.xAxisExtremes()[1];
                    }
                    if (newZoomRange[0] < zoomRange[0] && newZoomRange[1] > zoomRange[1]) {
                        return;
                    } else if (newZoomRange[0] >= newZoomRange[1]) {
                        return;
                    } else if (newZoomRange[0] <= zoomRange[0] && newZoomRange[1] < zoomRange[1]) {
                        g.updateOptions({
                            dateWindow: [zoomRange[0], newZoomRange[1]]
                        });
                    } else if (newZoomRange[0] > zoomRange[0] && newZoomRange[1] >= zoomRange[1]) {
                        g.updateOptions({
                            dateWindow: [newZoomRange[0], zoomRange[1]]
                        });
                    } else {
                        g.updateOptions({
                            dateWindow: newZoomRange
                        });
                    }
                }
            }


            var canScroll = false;

            var timer = null;
            var mouseOverHandler = function (e, g, context) {
                //
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }
                //
                if(timer!=null){
                    timeOut.cancel(timer);
                }
                timer = timeOut(function () {
                    canScroll = true;
                }, 3000);
            };

            var mouseOutHandler = function (e, g, context) {
                // set flag to false
                if(timer!=null){
                    timeOut.cancel(timer);
                }
                canScroll = false;
            };

            var scroll = function (e, g, context) {

                if ((scope.basicInfo && !scope.basicInfo.zoom) || !canScroll) {
                    return;
                }

                var normal;

                if (e instanceof WheelEvent) {
                    normal = e.detail ? e.detail * -1 : e.deltaY / 40;
                } else {
                    normal = e.detail ? e.detail * -1 : e.wheelDelta / 40;
                }

                // For me the normalized value shows 0.075 for one click. If I took
                // that verbatim, it would be a 7.5%.
                var percentage = normal / 50;

                if (!(e.offsetX && e.offsetY)) {
                    e.offsetX = e.layerX - e.target.offsetLeft;
                    e.offsetY = e.layerY - e.target.offsetTop;
                }
                var percentages = offsetToPercentage(g, e.offsetX, e.offsetY);
                var xPct = percentages[0];
                var yPct = percentages[1];
                //
                if (e.offsetX <= (g.plotter_.area.x)) {
                    // console.info("v", "l")
                    // left zoom
                    zoom(g, percentage, xPct, yPct, 'v', 'l');
                } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                    // right zoom
                    // console.info("v", "r")
                    zoom(g, percentage, xPct, yPct, 'v', 'r');
                } else {
                    // middle zoom
                    // console.info("h")
                    zoom(g, percentage, xPct, yPct, 'h', null);
                }
                Dygraph.cancelEvent(e);
                timeOut(function () {
                    scope.chartDateWindow = g.xAxisRange();
                });
            };

            var firstPoint = null;
            var mousedownHandler = function (e, g, context) {
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }
                context.initializeMouseDown(e, g, context);
                firstPoint = e.clientX;
                Dygraph.startPan(e, g, context);
            };
            var mousemoveHandler = function (e, g, context) {
                if (context.isPanning) {
                    if (e.offsetX <= (g.plotter_.area.x)) {
                        movePan(e, g, context, 'r');
                    } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                        movePan(e, g, context, 'l');
                    } else {
                        movePan(e, g, context, 'h');
                    }
                    timeOut(function () {
                        scope.chartDateWindow = scope.currentChart.xAxisRange();
                    });
                }
            };


            var mouseupHandler = function (e, g, context) {
                if (context.isPanning) {
                    Dygraph.endPan(e, g, context);
                }
            };

            var interactionModel = {
                'mousewheel': scroll,
                'DOMMouseScroll': scroll,
                'wheel': scroll,
                'mousedown': mousedownHandler,
                'mousemove': mousemoveHandler,
                'mouseup': mouseupHandler,
                'mouseover': mouseOverHandler,
                'mouseout': mouseOutHandler
            };


            //init configuration
            var configuration = {
                drawGapEdgePoints: true,
                'pointSize': 3,
                labelsKMB: true,
                // data formate
                labels: ['x'].concat(sampleData.labels),
                highlightCircleSize: 2,
                strokeWidth: 1,
                highlightSeriesOpts: {
                    strokeWidth: 2,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 2
                },
                drawPoints: false,
                drawAxesAtZero: false,
                labelsDivStyles: {
                    'text-align': 'right',
                    'position': 'relative',
                    'display': 'inline-block'
                },
                yRangePad: 10,
                // x label y label
                ylabel: 'Value',
                xlabel: 'Date',
                colors: scope.defaultColors,
                // multiple Y axis
                series: {
                    'Device0': {
                        axis: 'y2'
                    },
                    'Device4': {
                        axis: 'y2'
                    }
                },
                // showRangeSelector: true,
                axes: {
                    y: {
                        valueRange: [0, 1],
                        axisLabelWidth: 80
                    },
                    y2: {
                        // set axis-related properties here
                        'labelsKMB': true,
                        valueRange: [0, 1],
                        axisLabelWidth: 80
                    },
                    x: {
                        // datetime format
                        valueFormatter: function (y) {
                            return moment(y).format('LLLL'); //Hide legend label
                        }
                    }
                },
                pointClickCallback: function (e, p) {
                    if (scope.currentView != -1) {
                        scope.showOne(p.name);
                    }
                },
                drawCallback: function (g, isInit) {
                    if (scope.refersh) { // make sure "scope.refersh" doesn't call when the graph create first time.
                        scope.refersh(g, isInit);
                    }
                },
                'interactionModel': interactionModel
            };

            scope.currentChart = new Dygraph(element.find("div[class='line-chart-graph']")[0], sampleData.data, configuration);
            element.find("canvas").css("zIndex", 99);


            if (attrs.hasOwnProperty("shown")) {


                var basicInfo = scope.basicInfo;
                if (basicInfo && basicInfo.range_show) {
                    scope.rangeSelectorBar = new Dygraph(element.find("div[class='range-selector-bar']")[0], sampleData.data, {
                            xAxisHeight: 0,
                            axes: {
                                x: {
                                    drawAxis: false
                                }
                            },
                            showRangeSelector: true,
                            rangeSelectorHeight: 30
                        }
                    );
                    scope.chartDateWindow = scope.rangeSelectorBar.xAxisRange();
                }


                var status = false;
                // add mouse up event to range select
                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mouseup', function (event) {
                    status = false;
                    timeOut(function () {
                        var finalDateRagne = scope.currentChart.xAxisRange();
                        scope.chartDateTime = {begin: finalDateRagne[0], end: finalDateRagne[1]};
                    });
                });

                scope.$on('mouseUpMessage', function ($scope, e) {
                    if ("mouseup" === e.type && status) {
                        status = false;
                        timeOut(function () {
                            var finalDateRange = scope.currentChart.xAxisRange();
                            scope.chartDateTime = {begin: finalDateRange[0], end: finalDateRange[1]};
                        });
                    }
                });

                scope.$on('bindFatherGraphEvent', function (event, data) {
                    angular.forEach(data.children, function (child) {
                        if (child == attrs.id) {
                            Dygraph.synchronize([scope.currentChart].concat(data.parent), {
                                zoom: true,
                                selection: false,
                                range: false
                            });
                            scope.currentChart.updateOptions({
                                drawCallback: function (g, isInit) {
                                    // console.info("refersh running!" + " is  Init?"+ isInit);
                                    scope.refersh(g, isInit);
                                }
                            });

                        }
                    });


                });


                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousemove', function (event) {
                    if (status) {
                        timeOut(function () {
                            scope.chartDateWindow = scope.currentChart.xAxisRange();
                        });
                    }
                });

                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousedown', function (event) {
                    status = true;
                });

                //bind chart
                if (basicInfo && basicInfo.childrenChart.length > 0) {
                    var param = {'graphs': [scope.currentChart], children: basicInfo.childrenChart};
                    if (scope.rangeSelectorBar) {
                        param.graphs.push(scope.rangeSelectorBar);
                    }
                    scope.$emit('bindChildChartEvent', param);
                }
            }
        }, 0);
    }

    //controller: ['$scope', '$element', '$window', '$interval', '$timeout', '$filter', '$location', function ($scope, $element, $window, $interval, $timeout, $filter, $location) {
    controller($scope, $element, $window, $interval, $timeout, $filter, $location, dataService, $rootScope, $stateParams) {
        var element_id = $element.attr("id");
        $scope.elementId = element_id;

        $scope['defaultColors'] = dataService.defaultColors();
        var metadata = null;
        var widgetData = null;
        $scope.emptyDataShow = false;
        // attributes----------------------

        $scope.$emit('fetchWidgetMetadataEvent', {
            id: element_id, callback: function (data) {
                if (data) {
                    widgetData = data;
                }
            }
        });

        if (widgetData.data && widgetData.from == "show") {
            $scope.loadingShow = false;

            $scope.intevals = {device: []};


            // update chart
            $scope.css = {
                width: "col-md-12",
                height: "400"
            };
            if (widgetData.data.metadata.css) {
                $scope.css = widgetData.data.metadata.css;
            }

            // get start and end from url
            var begin_path = $stateParams.begin;
            var end_path = $stateParams.end;
            var init_flag = false;


            //fix interval
            $scope.fixInterval = false;
            var noneFixed = [];
            $scope.fixGraphWithGap = function () {
                if ($scope.currentChart && $scope.fixInterval) {
                    var currentInterval = -1;
                    angular.forEach($scope.intevals.device, function (item) {
                        if (item.name === $scope.currentIntervalName) {
                            currentInterval = item.interval;
                        }
                    });
                    if (noneFixed && noneFixed.length > 0) {
                        //fix
                        //get first one
                        var fixed = [noneFixed[0]];
                        var tempDate = fixed[0][0].getTime() + currentInterval;
                        while (tempDate <= noneFixed[noneFixed.length - 1][0].getTime()) {
                            var flag = false;
                            // add new
                            for (var i = 0; i < noneFixed.length; i++) {
                                if (noneFixed[i][0].getTime() == tempDate) {
                                    flag = true;
                                    fixed.push(noneFixed[i]);
                                    break;
                                }
                            }

                            if (!flag) {
                                var obj = [new Date(tempDate)];
                                // add NaN
                                for (var j = 0; j < $scope.currentChart.attributes_.labels_.length; j++) {
                                    obj.push(NaN);
                                }
                                fixed.push(obj);
                            }
                            tempDate += currentInterval;
                        }
                        $scope.currentChart.updateOptions({file: fixed});
                    }
                } else if ($scope.currentChart && !$scope.fixInterval) {
                    noneFixed = [];
                    angular.copy($scope.currentChart.file_, noneFixed);
                    $scope.currentChart.updateOptions({file: noneFixed});
                }

            };
            $scope.fixGraphWithGap_click = function () {
                if ($scope.currentChart && !$scope.fixInterval) {
                    noneFixed = [];
                    angular.copy($scope.currentChart.file_, noneFixed);
                    var currentInterval = -1;
                    angular.forEach($scope.intevals.device, function (item) {
                        if (item.name === $scope.currentIntervalName) {
                            currentInterval = item.interval;
                        }
                    });
                    if (noneFixed && noneFixed.length > 0) {
                        //fix
                        //get first one
                        var fixed = [noneFixed[0]];
                        var tempDate = fixed[0][0].getTime() + currentInterval;
                        while (tempDate <= noneFixed[noneFixed.length - 1][0].getTime()) {
                            var flag = false;
                            // add new
                            for (var i = 0; i < noneFixed.length; i++) {
                                if (noneFixed[i][0].getTime() == tempDate) {
                                    flag = true;
                                    fixed.push(noneFixed[i]);
                                    break;
                                }
                            }

                            if (!flag) {
                                var obj = [new Date(tempDate)];
                                // add NaN
                                for (var j = 0; j < $scope.currentChart.attributes_.labels_.length; j++) {
                                    obj.push(NaN);
                                }
                                fixed.push(obj);
                            }
                            tempDate += currentInterval;
                        }
                        $scope.currentChart.updateOptions({file: fixed});
                    }
                } else if ($scope.currentChart && $scope.fixInterval) {
                    $scope.currentChart.updateOptions({file: noneFixed});
                }

            };


            metadata = widgetData.data.metadata;
            $scope.basicInfo = metadata.data.basic;
            $scope.currentView = -1; // -1 is device view and 1 is scatter view

            $scope.parent_container = widgetData.data.parent;

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
                $scope.$watch('currentView', function (nObj, oObj) {
                    // change
                    if (nObj != oObj) {
                        if (nObj == -1) {
                            var rangeLevel = null;
                            var otherLevels = [];
                            angular.forEach(metadata.data.groups[1].collections, function (level) {
                                if (level.rows.length > 0) {
                                    if (rangeLevel != null) {
                                        otherLevels.push(rangeLevel);
                                    }
                                    rangeLevel = level.name;
                                }
                            });
                            if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {
                                // show device view
                                dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels).then(function (data) {
                                    initChart(data);
                                }, function (error) {
                                    console.error(error)
                                });
                            }

                        } else {
                            //get relation config
                            if (!metadata.data.source.relation || "none" === metadata.data.source.relation) {
                                return;
                            } else {
                                var rangeLevel = null;
                                var otherLevels = [];
                                angular.forEach(metadata.data.groups[2].collections, function (level) {
                                    if (level.rows.length > 0) {
                                        if (rangeLevel != null) {
                                            otherLevels.push(rangeLevel);
                                        }
                                        rangeLevel = level.name;
                                    }
                                });
                                if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {
                                    // show children view
                                    dataService.childrenDeviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, metadata.data.source.relation, metadata.data.source.relation_group, rangeLevel, otherLevels).then(function (data) {
                                        // get all device trees
                                        if (data != null && data.length > 0) {
                                            initChildrenChart(data);
                                        } else {
                                            return;
                                        }

                                    }, function (error) {
                                        console.error(error)
                                    });

                                }
                            }
                        }
                    }
                    $scope.fixInterval = false;

                });
                // first time of showing chart
                $scope.$watch('currentChart', function (newValue) {
                    if (newValue) {
                        //device first level
                        var rangeLevel = null;
                        var otherLevels = [];
                        angular.forEach(metadata.data.groups[1].collections, function (level) {
                            if (level.rows.length > 0) {
                                if (rangeLevel != null) {
                                    otherLevels.push(rangeLevel);
                                }
                                rangeLevel = level.name;
                            }
                        });
                        //send a rest request
                        dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels).then(function (data) {
                            initChart(data);
                        }, function (error) {
                            console.error(error)
                        });
                    }
                });
                $scope.$watch("chartDateTime", function (newValue, oldValue) {
                    if (newValue.begin != null && newValue.end != null) {
                        var expect_points = Math.floor($element.parent().width() / 2);
                        // find a interval
                        var expectedInterval = (newValue.end - newValue.begin) / expect_points;
                        var conf = $scope.intevals.device;
                        // device detail view
                        var preOne = conf[0].interval;
                        var lastOne = conf[conf.length - 1].interval;
                        var cin = "";
                        if (expectedInterval >= preOne) {
                            expectedInterval = preOne;
                        } else if (expectedInterval <= lastOne) {
                            expectedInterval = lastOne;
                        } else {
                            for (var i = 1; i < conf.length; i++) {
                                if (expectedInterval <= preOne && expectedInterval > conf[i].interval) {
                                    expectedInterval = preOne;
                                } else {
                                    preOne = conf[i].interval;
                                    cin = conf[i].name;
                                }
                            }
                        }
                        $scope.currentIntervalName = "";

                        angular.forEach(conf, function (config) {
                            if (config.interval == expectedInterval) {
                                $scope.currentIntervalName = config.name;
                            }
                        });
                        $scope.loadingShow = true;
                        if ($scope.currentView == 1) {
                            // scatter detail view
                            if (expectedInterval == conf[0].interval) {
                                // set valueRange;
                                // re cal max and min
                                // $scope.childrenRangeConfig["dateWindow"] = $scope.chartDateWindow;
                                $scope.currentChart.updateOptions({dateWindow: $scope.chartDateWindow});
                                // if ($scope.rangeSelectorBar) {
                                //     $scope.rangeSelectorBar.updateOptions({series: $scope.childRangeSeries});
                                // }
                                $scope.loadingShow = false;
                            } else {
                                var deviceInfo = [];
                                var currentStore = "";
                                // has problem....
                                angular.forEach($scope.childTrees, function (device) {
                                    angular.forEach(device.trees, function (tree, index) {
                                        if (expectedInterval == tree.frequency && index != 0) {
                                            currentStore = tree.store;
                                            deviceInfo.push({name: device.name, tree: tree.tree});
                                        }
                                    });
                                });

                                dataService.devicesStoreData($rootScope.host, $rootScope.applicationName, deviceInfo, metadata.data.source.store, currentStore, newValue.begin, newValue.end).then(function (data) {
                                    var showData = [];
                                    angular.forEach(data, function (arr) {
                                        var deviceData = [];
                                        angular.forEach(arr.data, function (bucket) {
                                            if (bucket.data != null) {
                                                Array.prototype.push.apply(deviceData, bucket.data.slice(0, bucket.size));
                                            }
                                        });
                                        showData.push({device: arr.device, data: deviceData});
                                    });
                                    //get configuration
                                    updateChildrenDetailChart(metadata, currentStore, $scope.rangeChildrenData, showData);

                                }, function (data) {
                                    console.info(data);
                                });
                            }
                            $scope.fixGraphWithGap();
                        } else {
                            // if expected interval is the biggest, show range data
                            if (expectedInterval == conf[0].interval) {
                                if (!($scope.chartDateWindow[0] instanceof Date)) {
                                    $scope.chartDateWindow[0] = new Date($scope.chartDateWindow[0]);
                                }

                                if (!($scope.chartDateWindow[1] instanceof Date)) {
                                    $scope.chartDateWindow[1] = new Date($scope.chartDateWindow[1]);
                                }
                                $scope.rangeConfig["dateWindow"] = $scope.chartDateWindow;
                                // set valueRange
                                $scope.currentChart.updateOptions($scope.rangeConfig);
                                if ($scope.rangeSelectorBar && $scope.rangeSeries) {
                                    $scope.rangeSelectorBar.updateOptions({series: $scope.rangeSeries});
                                }
                                // tell some other widgets, the graph is changed.
                                $timeout(function () {
                                    $rootScope.$broadcast('chartDataChangeEvent', {
                                        'id': element_id,
                                        'group': 'device',
                                        'data': {
                                            'collection': conf[0].name,
                                            'group': 'device',
                                            'data': $scope.ordinalRangeData.filter(function (obj) {
                                                return obj.timestamp >= $scope.rangeConfig["dateWindow"][0].getTime() && obj.timestamp <= $scope.rangeConfig["dateWindow"][1].getTime();
                                            })
                                        }
                                    });
                                });

                                $scope.loadingShow = false;
                            } else {
                                // cal tree
                                angular.forEach($scope.trees, function (tree, index) {
                                    if (expectedInterval == tree.frequency && index != 0) {
                                        // send request
                                        dataService.deviceStoreData($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, newValue.begin, newValue.end).then(function (data) {
                                            // udpate chart
                                            var showData = [];
                                            angular.forEach(data, function (arr) {
                                                Array.prototype.push.apply(showData, arr.data.slice(0, arr.size));
                                            });
                                            showData = showData.filter(function (obj) {
                                                return obj != null;
                                            });
                                            showData.sort(function (a, b) {
                                                return a.timestamp > b.timestamp ? 1 : -1;
                                            });
                                            //get configuration
                                            updateDetailChart(metadata, tree.store, $scope.rangeData, showData);

                                            // tell some other widgets, the graph is changed.
                                            $timeout(function () {
                                                $rootScope.$broadcast('chartDataChangeEvent', {
                                                    'id': element_id,
                                                    'group': 'device',
                                                    'data': {
                                                        'collection': tree.store,
                                                        'group': 'device',
                                                        'data': showData
                                                    }
                                                });
                                            });

                                        }, function (data) {
                                            console.info(data);
                                        });
                                    }
                                });
                            }
                            $scope.fixGraphWithGap();
                        }
                        $scope.status = false;
                    }
                });// not working.....

            });


            var fetchData = function (values, node) {
                if (node.children[0] != null) {
                    fetchData(values, node.children[0]);
                }

                if (node.children[1] != null) {
                    fetchData(values, node.children[1]);
                }

                if (node.children[0] == null && node.children[1] == null) {
                    Array.prototype.push.apply(values, node.data.array.slice(0, node.data.size));
                }

            };


            $scope.trees = [];

            $scope.rangeData = [];

            $scope.ordinalRangeData = [];

            var initChart = function (data) {
                $scope.intevalforshow = [];
                //
                $scope.intevals.device = [];
                var trees = data.trees;
                $scope.trees = trees;
                var rangeTree = null;
                angular.forEach(trees, function (tree) {
                    if (tree.range) {
                        rangeTree = tree;
                    }
                    $scope.intevals.device.push({name: tree.store, interval: tree.frequency});
                });


                // init chart with range data
                var store = rangeTree.store;

                // get all data
                var allData = [];
                fetchData(allData, rangeTree.tree);
                allData = allData.filter(function (obj) {
                    return obj != null;
                });
                allData.sort(function (a, b) {
                    return a.timestamp > b.timestamp ? 1 : -1;
                });


                if ($scope.trees.length == 0 || allData.length == 0) {
                    $scope.emptyDataShow = true;
                    return;
                }

                // if the data only has one point. change the data range to bigger
                if (allData.length == 1) { //  means only one point.
                    var newData = [];
                    // add 1 points into both side
                    var thePoint = allData[0];
                    var timestamp = thePoint.timestamp;
                    var currentInterval = $scope.intevals.device[0].interval;
                    newData.push({timestamp: timestamp - currentInterval});
                    Array.prototype.push.apply(newData, allData);
                    newData.push({timestamp: timestamp + currentInterval});
                    allData = newData;
                }
                $scope.ordinalRangeData = allData;
                // get configuration and make real data
                updateChart(metadata, store, allData);
            };

            var initChildrenChart = function (deviceDatas) {
                var devicesInfo = {};
                $scope.intevals.device = [];
                //range data with all device
                $scope.childTrees = [];
                angular.forEach(deviceDatas, function (deviceData) {
                    var device = deviceData.device;
                    var trees = deviceData.trees;
                    $scope.childTrees.push({name: device.name, trees: trees});
                    var rangeTree = null;
                    angular.forEach(trees, function (tree) {
                        if (tree.range) {
                            rangeTree = tree;
                        }

                        var flag = false;
                        angular.forEach($scope.intevals.device, function (interval) {
                            if (interval.name == tree.store && interval.interval == tree.frequency) {
                                // has same one
                                flag = true;
                            }
                        });
                        if (!flag) {
                            $scope.intevals.device.push({name: tree.store, interval: tree.frequency});
                        }

                    });

                    if (rangeTree != null) {
                        var deviceObj = devicesInfo[device.name] = {};
                        // get all data
                        var allData = [];
                        fetchData(allData, rangeTree.tree);
                        allData = allData.filter(function (obj) {
                            return obj != null;
                        });
                        allData.sort(function (a, b) {
                            return a.timestamp > b.timestamp ? 1 : -1;
                        });
                        //
                        deviceObj["range"] = rangeTree;
                        deviceObj["data"] = allData;
                    } else {
                        console.info(device.name + " has none data.");
                    }

                });

                updateChildrenChart(metadata, devicesInfo);
            };


            var updateChildrenChart = function (metadata, devicesInfo) {
                //relation
                var relationConfig = metadata.data.groups[2];
                // scatter view shows only one collection
                var collections = relationConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {left: relationConfig.leftYAxis, right: relationConfig.rightYAxis};
                var allLines = [];
                var allXLabels = [];
                angular.forEach(devicesInfo, function (device, key) {
                    angular.forEach(device.data, function (item) {
                        var flag = false;
                        angular.forEach(allXLabels, function (label) {
                            if (label.getTime() == item.timestamp) {
                                flag = true;
                            }
                        });
                        if (!flag) {
                            allXLabels.push(new Date(item.timestamp));
                        }


                    });
                });
                // order
                allXLabels.sort(function (a, b) {
                    return a > b ? 1 : -1;
                });

                // make all line
                angular.forEach(allXLabels, function (label) {
                    allLines.push([label]);
                });


                var yRange = {min: null, max: null};
                var showY2axis = false;
                var counter = 0;
                angular.forEach(devicesInfo, function (device, key) {
                    if ($scope.defaultColors[counter]) {
                        colors.push($scope.defaultColors[counter]);
                    } else {
                        colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                    }
                    counter++;

                    angular.forEach(collections, function (collection) {
                        if (collection.name == device.range.store) {
                            $scope.currentIntervalName = device.range.store;
                            var originalData = device.data;

                            // always same for each device
                            if (collection.rows[0].yaxis == 0) {
                                series[collection.rows[0].label] = {'axis': 'y1'};
                            } else {
                                series[collection.rows[0].label] = {'axis': 'y2'};
                                showY2axis = true;
                            }
                            labels.push(key);
                            // make a line
                            var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                            // add value
                            angular.forEach(allLines, function (realLine, index) {

                                var flag = false;
                                angular.forEach(originalData, function (odata) {
                                    if (realLine[0].getTime() == odata.timestamp) {
                                        try {
                                            var value = f(odata);
                                            realLine.push(value);
                                            if (yRange.min == null) {
                                                yRange.min = value;
                                            }

                                            if (yRange.max == null) {
                                                yRange.max = value;
                                            }

                                            if (yRange.min > value) {
                                                yRange.min = value;
                                            }

                                            if (yRange.max < value) {
                                                yRange.max = value;
                                            }
                                        } catch (ex) {
                                            realLine.push(null);
                                        }
                                        flag = true;
                                    }
                                });

                                if (!flag) {
                                    realLine.push(null);
                                }
                            });


                        }
                    });
                });

                if (yRange.min == yRange.max && yRange.min != null && yRange.max != null) {
                    yRange.min = yRange.min - (yRange.min) * 0.10;
                    yRange.max = yRange.max + (yRange.max) * 0.10;
                }
                //update chart

                if ($scope.currentChart) {
                    $scope.rangeChildrenData = allLines;

                    if (showY2axis) {
                        $scope.childrenRangeConfig = {
                            'labelsKMB': true,
                            'file': allLines,
                            'labels': ['x'].concat(labels),
                            'ylabel': leftAndRight.left,
                            'y2label': leftAndRight.right,
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {valueRange: [yRange.min, yRange.max], axisLabelWidth: 80},
                                'y2': {}
                            }
                            // showRangeSelector: true
                        };
                    } else {
                        var newLines = [];
                        angular.copy(allLines, newLines);
                        angular.forEach(newLines, function (line) {
                            line.push(NaN);
                        });
                        series["span_y2"] = {'axis': 'y2'};
                        $scope.childrenRangeConfig = {
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'labelsKMB': true,
                            'file': newLines,
                            'labels': ['x'].concat(labels).concat(['span_y2']),
                            'ylabel': leftAndRight.left,
                            'y2label': "",
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {valueRange: [yRange.min, yRange.max]},
                                'y2': {
                                    axisLabelFormatter: function (d) {
                                        return '';
                                    }
                                }
                            }
                            // showRangeSelector: true
                        };
                    }
                    //
                    $scope.currentChart.updateOptions($scope.childrenRangeConfig);
                    //  keep the same time window and refersh
                    $scope.chartDateTime = {begin:$scope.chartDateTime.begin, end:$scope.chartDateTime.end};
                    $scope.chartDateWindow = [$scope.chartDateTime.begin,$scope.chartDateTime.end];
                    $scope.loadingShow = false;
                }


            };


            var updateChildrenDetailChart = function (metadata, store, rangeData, allData) {
                //relation
                var relationConfig = metadata.data.groups[2];
                // scatter view shows only one collection
                var collections = relationConfig.collections;
                var newLines = [];
                var newTime = [];
                var series = {};
                var labels = [];
                var colors = [];
                var leftAndRight = {left: relationConfig.leftYAxis, right: relationConfig.rightYAxis};
                var yRange = {min: null, max: null};
                var counter = 0;
                var showY2axis = null;
                angular.forEach(allData, function (device) {
                    if ($scope.defaultColors[counter]) {
                        colors.push($scope.defaultColors[counter]);
                    } else {
                        colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                    }
                    counter++;

                    if (device.data.length > 0) {
                        labels.push(device.device);
                        angular.forEach(collections, function (collection) {
                            if (collection.name == store) {
                                $scope.currentIntervalName = store;
                                if (collection.rows[0].yaxis == 0) {
                                    series[collection.rows[0].label] = {'axis': 'y1'};
                                } else {
                                    series[collection.rows[0].label] = {'axis': 'y2'};
                                    showY2axis = true;
                                }
                                var f = new Function("data", "with(data) { if(" + collection.rows[0].value + ")return " + collection.rows[0].value + ";return null;}");
                                var tempData = [];
                                var tempTime = [];
                                // make data
                                angular.forEach(device.data, function (data) {
                                    var dateTime = new Date(data.timestamp);
                                    try {
                                        var value = f(data);
                                        tempData.push({timestamp: dateTime, value: value});

                                        if (yRange.min == null) {
                                            yRange.min = value;
                                        }

                                        if (yRange.max == null) {
                                            yRange.max = value;
                                        }

                                        if (yRange.min > value) {
                                            yRange.min = value;
                                        }

                                        if (yRange.max < value) {
                                            yRange.max = value;
                                        }

                                    } catch (e) {
                                        tempData.push({timestamp: dateTime, value: null});
                                    }
                                    tempTime.push(dateTime.getTime());
                                });
                                newTime = newTime.concat(tempTime.filter(function (item) {
                                    return newTime.indexOf(item) < 0;
                                }));
                                newLines.push({device: device.device, data: tempData});
                            }
                        });
                    }
                });

                var chartData = [];
                // time needs sort!!!
                newTime = newTime.sort();
                angular.forEach(newTime, function (nt) {
                    chartData.push([new Date(nt)]);
                });


                angular.forEach(newLines, function (line) {
                    angular.forEach(chartData, function (timeTicket) {
                        // line data
                        var flag = false;
                        var lineData = line.data;
                        for (var i = 0; i < lineData.length; i++) {
                            if (lineData[i].timestamp.getTime() == timeTicket[0].getTime()) {
                                timeTicket.push(lineData[i].value);
                                flag = true;
                                break;
                            }
                        }
                        if (flag != true) {
                            // we should use "NaN"
                            timeTicket.push(NaN);
                        }
                    });
                });


                if (yRange.min == yRange.max && yRange.min != null && yRange.max != null) {
                    yRange.min = yRange.min - (yRange.min) * 0.10;
                    yRange.max = yRange.max + (yRange.max) * 0.10;
                }


                if (chartData.length == 0) {
                    $scope.currentChart.updateOptions({
                        'file': []
                    });
                    $scope.loadingShow = false;
                } else {
                    if ($scope.currentChart) {

                        if (showY2axis) {
                            $scope.currentChart.updateOptions({
                                'drawGapEdgePoints': true,
                                'pointSize': 3,
                                'labelsKMB': true,
                                'file': chartData,
                                'labels': ['x'].concat(labels),
                                'ylabel': leftAndRight.left,
                                'y2label': leftAndRight.right,
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {valueRange: [yRange.min, yRange.max], axisLabelWidth: 80}
                                }
                                // showRangeSelector: true
                            });
                        } else {
                            var newLines = [];
                            angular.copy(chartData, newLines);
                            angular.forEach(newLines, function (line) {
                                line.push(NaN);
                            });
                            series["span_y2"] = {axis: 'y2'};
                            $scope.currentChart.updateOptions({
                                'drawGapEdgePoints': true,
                                'pointSize': 3,
                                'labelsKMB': true,
                                'file': newLines,
                                'labels': ['x'].concat(labels).concat(["span_y2"]),
                                'ylabel': leftAndRight.left,
                                'y2label': "",
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {valueRange: [yRange.min, yRange.max], axisLabelWidth: 80},
                                    "y2": {
                                        axisLabelFormatter: function (d) {
                                            return '';
                                        },
                                        axisLabelWidth: 80
                                    }
                                }
                                // showRangeSelector: true
                            });
                        }
                        $scope.loadingShow = false;
                    }
                }


            };


            /**
             * update detail chart
             * @param metadata
             * @param store
             * @param rangeData
             * @param allData
             */
            var updateDetailChart = function (metadata, store, rangeData, allData) {
                var deviceConfig = metadata.data.groups[1];
                var collections = deviceConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {left: deviceConfig.leftYAxis, right: deviceConfig.rightYAxis};
                var allLines = [];
                //0 for y  1 for y2
                var yRanges = [{min: null, max: null}, {min: null, max: null}];
                angular.forEach(collections, function (collection) {
                    if (collection.name == store) {
                        angular.forEach(allData, function (line) {
                            allLines.push([new Date(line.timestamp)]);
                        });

                        // var yRange = {'min': null, 'max': null};
                        var showY2axis = false;
                        angular.forEach(collection.rows, function (row) {
                            labels.push(row.label);
                            colors.push(row.color);

                            if (row.yaxis == 0) {
                                series[row.label] = {'axis': 'y1'};
                            } else {
                                series[row.label] = {'axis': 'y2'};
                                showY2axis = true;
                            }
                            var f = new Function("data", "with(data) { if(" + row.value + ")return " + row.value + ";return null;}");
                            // add value
                            var counter = 0;
                            angular.forEach(allLines, function (realLine) {
                                try {
                                    var value = f(allData[counter]);
                                    realLine.push(value);
                                    if (row.yaxis == 0) {
                                        if (yRanges[0].min == null) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max == null) {
                                            yRanges[0].max = value;
                                        }

                                        if (yRanges[0].min > value) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max < value) {
                                            yRanges[0].max = value;
                                        }
                                    } else {
                                        if (yRanges[1].min == null) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max == null) {
                                            yRanges[1].max = value;
                                        }

                                        if (yRanges[1].min > value) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max < value) {
                                            yRanges[1].max = value;
                                        }
                                    }
                                } catch (ex) {
                                    realLine.push(null);
                                }
                                counter++;
                            });

                        });

                        angular.forEach(yRanges, function (yrange) {
                            if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                yrange.min = yrange.min - (yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.max) * 0.10;
                            }
                        });


                        if (allLines.length == 0) {
                            $scope.currentChart.updateOptions({
                                'file': []
                            });
                            if ($scope.rangeSelectorBar) {
                                $scope.currentChart["xAxisZoomRange"] = $scope.rangeSelectorBar.xAxisExtremes();
                            }
                            $scope.loadingShow = false;
                        } else {
                            if ($scope.currentChart) {

                                if (showY2axis) {
                                    $scope.currentChart.updateOptions({
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'labelsKMB': true,
                                        'file': allLines,
                                        'labels': ['x'].concat(labels),
                                        'ylabel': leftAndRight.left,
                                        'y2label': leftAndRight.right,
                                        'series': series,
                                        'axes': {
                                            'y': {valueRange: [yRanges[0].min, yRanges[0].max], axisLabelWidth: 80},
                                            'y2': {
                                                'labelsKMB': true,
                                                valueRange: [yRanges[1].min, yRanges[1].max],
                                                axisLabelWidth: 80
                                            }
                                        },
                                        'colors': colors
                                        // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    });
                                } else {

                                    var newLines = [];
                                    angular.copy(allLines, newLines);
                                    angular.forEach(newLines, function (line) {
                                        line.push(NaN);
                                    });

                                    series["span-Y2"] = {axis: 'y2'};
                                    $scope.currentChart.updateOptions({
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'labelsKMB': true,
                                        'file': newLines,
                                        'labels': ['x'].concat(labels).concat(['span_y2']),
                                        'ylabel': leftAndRight.left,
                                        'y2label': "",
                                        'series': series,
                                        'axes': {
                                            'y': {valueRange: [yRanges[0].min, yRanges[0].max], axisLabelWidth: 80},
                                            'y2': {
                                                axisLabelFormatter: function (d) {
                                                    return '';
                                                },
                                                axisLabelWidth: 80
                                            }
                                        },
                                        'colors': colors
                                        // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    });

                                }

                                $scope.loadingShow = false;
                            }
                        }


                    }
                });


            };

            /**
             * update range chart
             * @param metadata
             * @param store
             * @param allData
             */
            var updateChart = function (metadata, store, allData) {
                var deviceConfig = metadata.data.groups[1];
                var collections = deviceConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {left: deviceConfig.leftYAxis, right: deviceConfig.rightYAxis};
                var allLines = [];
                //0 for y  1 for y2
                var yRanges = [{min: null, max: null}, {min: null, max: null}];
                angular.forEach(collections, function (collection) {
                    if (collection.name == store) {
                        $scope.currentIntervalName = store;
                        angular.forEach(allData, function (line) {
                            allLines.push([new Date(line.timestamp)]);
                        });

                        $scope.rangeSeriesNumber = collection.rows.length;
                        var showY2axis = false;
                        angular.forEach(collection.rows, function (row) {
                            labels.push(row.label);
                            colors.push(row.color);

                            if (row.yaxis == 0) {
                                series[row.label] = {'axis': 'y1'};
                            } else {
                                series[row.label] = {'axis': 'y2'};
                                showY2axis = true;
                            }

                            var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                            // add value
                            var counter = 0;
                            angular.forEach(allLines, function (realLine) {
                                try {
                                    var value = f(allData[counter]);
                                    realLine.push(value);
                                    if (row.yaxis == 0) {
                                        if (yRanges[0].min == null) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max == null) {
                                            yRanges[0].max = value;
                                        }

                                        if (yRanges[0].min > value) {
                                            yRanges[0].min = value;
                                        }

                                        if (yRanges[0].max < value) {
                                            yRanges[0].max = value;
                                        }
                                    } else {
                                        if (yRanges[1].min == null) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max == null) {
                                            yRanges[1].max = value;
                                        }

                                        if (yRanges[1].min > value) {
                                            yRanges[1].min = value;
                                        }

                                        if (yRanges[1].max < value) {
                                            yRanges[1].max = value;
                                        }
                                    }

                                } catch (ex) {
                                    realLine.push(null);
                                }
                                counter++;
                            });

                        });

                        if ($scope.currentChart) {
                            $scope.rangeData = allLines;
                            var basicInfo = $scope.basicInfo;
                            if (basicInfo && basicInfo.range_show) {
                                var rangeBarLabels = [];
                                for (var i = 0; i < labels.length; i++) {
                                    rangeBarLabels.push("l" + i);
                                }
                                var series_range = {'l0': {axis: 'y1'}};
                                if (showY2axis) {
                                    //noinspection JSDuplicatedDeclaration
                                    series_range = {
                                        'l0': {axis: 'y1'},
                                        'l0': {axis: 'y2'}
                                    };
                                    $scope.rangeSeries = series_range;

                                    $scope.rangeSelectorBar.updateOptions({
                                        'file': allLines,
                                        'labels': ['x'].concat(rangeBarLabels),
                                        'series': series_range
                                    });
                                } else {
                                    series_range["span_y2"] = {axis: 'y2'};
                                    $scope.rangeSeries = series_range;
                                    var newLines = [];
                                    angular.copy(allLines, newLines);
                                    angular.forEach(newLines, function (line) {
                                        line.push(NaN);
                                    });
                                    $scope.rangeSelectorBar.updateOptions({
                                        'file': newLines,
                                        'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                        'series': series_range
                                    });
                                }


                            }

                            angular.forEach(yRanges, function (yrange) {
                                if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                    yrange.min = yrange.min - (yrange.min) * 0.10;
                                    yrange.max = yrange.max + (yrange.max) * 0.10;
                                }
                            });


                            // if graph has 2 yAxis or a yAxis


                            if (showY2axis) {
                                $scope.rangeConfig = {
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'labelsKMB': true,
                                    'file': allLines,
                                    'labels': ['x'].concat(labels),
                                    'ylabel': leftAndRight.left,
                                    'y2label': leftAndRight.right,
                                    'series': series,
                                    'colors': colors,
                                    'axes': {
                                        'y': {valueRange: [yRanges[0].min, yRanges[0].max], axisLabelWidth: 80},
                                        'y2': {
                                            'labelsKMB': true,
                                            valueRange: [yRanges[1].min, yRanges[1].max],
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'dateWindow': [allLines[0][0], allLines[allLines.length - 1][0]],
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    // showRangeSelector: true
                                };
                            } else {
                                series['span_y2'] = {axis: 'y2'};
                                var newLines = [];
                                angular.copy(allLines, newLines);
                                angular.forEach(newLines, function (line) {
                                    line.push(NaN);
                                });
                                $scope.rangeConfig = {
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'labelsKMB': true,
                                    'file': newLines,
                                    'labels': ['x'].concat(labels).concat(['span_y2']),
                                    'ylabel': leftAndRight.left,
                                    'y2label': "",
                                    'series': series,
                                    'colors': colors,
                                    'axes': {
                                        'y': {valueRange: [yRanges[0].min, yRanges[0].max], axisLabelWidth: 80},
                                        'y2': {
                                            axisLabelFormatter: function (d) {
                                                return '';
                                            },
                                            axisLabelWidth: 80
                                        }
                                    },
                                    'dateWindow': [allLines[0][0], allLines[allLines.length - 1][0]],
                                    // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    // showRangeSelector: true
                                };
                            }


                            if (basicInfo && basicInfo.range_show) {
                                Dygraph.synchronize([$scope.rangeSelectorBar, $scope.currentChart], {
                                    zoom: true,
                                    selection: false,
                                    range: false
                                });
                            }


                            if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= allLines[0][0] && $scope.chartDateWindow[1] <= allLines[allLines.length - 1][0])) {
                                // keep the current range bar refresh once.
                                $scope.chartDateTime = {begin:$scope.chartDateTime.begin, end:$scope.chartDateTime.end};
                                $scope.chartDateWindow = [$scope.chartDateTime.begin,$scope.chartDateTime.end];
                            } else {

                                $scope.currentChart["xAxisZoomRange"] = [allLines[0][0], allLines[allLines.length - 1][0]];
                                if (begin_path && end_path && !init_flag) {
                                    // $scope.chartDateTime = {
                                    //     "begin": new Date(new Number(begin_path)),
                                    //     "end": new Date(new Number(end_path))
                                    // };
                                    $scope.chartDateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                    $scope.rangeConfig.dateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                    init_flag = true;
                                } else {
                                    $scope.chartDateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                    $scope.rangeConfig.dateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                }

                                $scope.currentChart.updateOptions($scope.rangeConfig);

                            }


                            //bind
                            $scope.loadingShow = false;
                        }

                    }
                });
            };

            $scope.chartDateTime = {begin: null, end: null};

            // function for show one
            $scope.showOne = function (deviceName) {

                if ($rootScope['standalone'] && $rootScope['standalone'] == true) {
                    return false;
                }


                // device type is
                if ($location.url().indexOf('/app/page/param/') != -1) {
                    //open window
                    $window.open("/#/app/page/param/" + $rootScope.applicationName + "/" + metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1]));
                } else {
                    //open window
                    $window.open("/#" + $location.url().replace("show", "param").replace($location.url().substr($location.url().lastIndexOf('/', $location.url().lastIndexOf('/') - 1) + 1), metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1])));
                }

            };

            var timer = null;
            $scope.refersh = function (g, init) {
                if (timer) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    if(init || g.xAxisRange()[0] != $scope.chartDateTime.begin || g.xAxisRange()[1] != $scope.chartDateTime.end) {
                        $scope.chartDateTime = {begin: g.xAxisRange()[0], end: g.xAxisRange()[1]};
                        $scope.chartDateWindow = g.xAxisRange();
                    }
                }, 600);
            };
        }

    }


    static buildFactory($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams) {
        fgpWidgetGraph.instance = new fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams);
        return fgpWidgetGraph.instance;
    }

}

fgpWidgetGraph.$inject = ['$timeout', 'dataService', '$rootScope', '$interval', '$filter', '$location', '$stateParams'];

export {fgpWidgetGraph as default}