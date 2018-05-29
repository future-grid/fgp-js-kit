/**
 * Created by ericwang on 15/06/2016.
 */
import angular from "angular";
import Dygraph from "dygraphs";
class fgpWidgetGraph {

    constructor($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile) {
        this.restrict = 'E';
        this.scope = {
            interactions: "="
        };
        this.$timeout = $timeout;
        this._dataService = dataService;
        this._$interval = $interval;
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


            var dom_legend = '<li>{{legendText_device}}</li><li>{{legendText_datetime}}</li><li><label style="color: {{legendColor}}">{{legendText_column}}</label>:{{legendText_value}}</li>';

            var dom_empty_data = '<div ng-show="emptyDataShow" id="emptydata_' + attrs.id + '" style="width: 100%;height:100%;position: absolute;background: rgba(255, 255, 255, 0.1);" data-chartloading><div class="spinner" style="width: 100%;">' +
                '<h1>Empty Data!</h1>' +
                '</div></div>';

            var dom_alert_info = '<span class="label label-warning" ng-show="alertMessage" style="color: #000;">{{alertMessage}}</span>';

            var dom_datetime_interval = '<div ng-show="rangeSelectorBar" class="dropdown"> <button class="btn btn-info dropdown-toggle badge" type="button" data-toggle="dropdown">{{currentIntervalChoosed.name}}<span class="caret"></span></button> <ul class="dropdown-menu" style="font-size:12px;"><li ng-repeat="interval in dateTimeIntervals"><a href="javascript:;" ng-click="changeInterval(interval)">{{interval.name}}</a></li></ul> </div>';


            var dom_series_list = '<div ng-show="currentView === 1" class="dropdown"> <button class="btn btn-warning dropdown-toggle badge" type="button" data-toggle="dropdown">Devices<span class="caret"></span></button> <ul class="dropdown-menu" style="font-size:12px;height:auto;max-height:300px;overflow-x:hidden;"><li ng-repeat="device in childrenDevices"><input type="checkbox" ng-click="showOrHideDevice(device)" ng-checked="device.show"/>{{device.name}}</li></ul> </div>';


            var dom_real_time_grap = '<div class="modal fade " id="real_time_graph_' + attrs.id + '" role="dialog">' +
                '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content">' +
                '<div class="col-md-12"  style="padding-top:3px;height: 1px;background-color: #0e90d2;" ng-style="{ \'width\': completionPercent + \'%\' }"></div>' +
                '<div class="modal-body" style="width: 100%;height: 300px;">' +
                '<div class="real-time-graph" style="width: 100%;height: 100%"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            var html = '<div id="legendbox' + attrs.id + '" ng-show="legendText" ng-style="{top:legendTop,left:legendLeft}" style="border-radius:10px;background-color:#ffffff;position: absolute;border: 1px solid {{legendColor}};-moz-box-shadow: 5px 5px 5px #888888;box-shadow: 5px 5px 5px #888888;z-index: 99999999;margin-right: 5px;"><ul style="list-style: none;list-style-position: inside;text-align: right;">' + dom_legend + '</ul></div><div class="{{css.width}}"><div class="col-md-12" style="padding:0px;height:{{css.height}}px;-webkit-user-select: none; /* Chrome all / Safari all */  -moz-user-select: none; /* Firefox all */  -ms-user-select: none; /* IE 10+ */  user-select: none;"><div class="row"><div class="col-md-12"><a class="tooltips btn btn-xs btn-info badge" href="javascript:;" ng-hide="interactions.graphs.btns.scatter == \'hide\'"  style="float: right;margin-right: 10px;" ng-click="currentView = -currentView"><i class="glyphicon glyphicon-transfer"></i><span>Scatter View</span></a><div id="buttons_area" style=""></div><a ng-show="autoupdate" class="tooltips btn btn-xs btn-info badge" style="float: right;margin-right: 10px;" ng-click="showRealTimeGraph()" data-toggle="modal"><span>Auto Update</span><i class="glyphicon glyphicon-random"></i></a><div style="float: right; margin-right: 10px;">' + dom_series_list + '</div><div style="float: right; margin-right: 10px;">' + dom_datetime_interval + '</div><div ng-hide="true" class="checkbox" style="float: right;margin-right: 10px; margin-bottom: 5px; margin-top: 0;" ng-model="fixInterval" ng-click="fixInterval=!fixInterval"><label><input type="checkbox" ng-model="fixInterval" ng-clicked="fixInterval" ng-change="fixGraphWithGap_click()"/>fixed interval</label></div><div style="float: right; margin-right: 10px;"><label class="label-inline" ng-repeat="item in intevals.device"><span class="badge" style="background-color: {{ item.name == currentIntervalName ? (locked_interval.name == item.name ? \'#e57432;\':\'#009900;\') : (locked_interval.name == item.name ? \'#e57432;\':\'\') }}" ng-click="lock(item)">{{item.name}}</span></label></div><div style="float: right; margin-right: 10px;">' + dom_alert_info + '</div></div></div><div style="position: relative;width: 100%;height:100%;"><div style="position: absolute;left:25px;z-index: 999;" ng-show="basicInfo.zoom" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVULeft()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDLeft()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVLeft()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVLeft()"><i class="fa fa-minus" aria-hidden="true"></i></button></div><div class="line-chart-graph" style="width: 100%;height:100%;"></div><div style="position: absolute;right:-15px;top:0px;z-index: 999;" ng-show="checkY2Btns()" class="btn-group-vertical btn-group-xs"><button type="button" class="btn btn-default" ng-click="btnPanVURight()"><i class="fa fa-arrow-up" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnPanVDRight()"><i class="fa fa-arrow-down" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomInVRight()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnZoomOutVRight()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div>' + dom_loading + dom_empty_data + '<div class="row"><div class="col-md-12" style="min-height: 30px;"></div><div class="col-md-6" style="text-align: left;" ng-show="rangeSelectorBar">{{chartDateWindow[0] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-6" style="text-align: right;" ng-show="rangeSelectorBar">{{chartDateWindow[1] | date : \'dd/MM/yyyy HH:mm:ss\'}}</div><div class="col-md-12" style="min-height: 40px;position: relative"><div class="btn-group btn-group-xs" role="group" style="position: absolute;left: 20px;" ng-show="basicInfo.range_show"><button type="button" class="btn btn-default" ng-click="btnpanleft()"><i class="fa fa-arrow-left" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnpanright()"><i class="fa fa-arrow-right" aria-hidden="true"></i></button></div><div class="range-selector-bar" style="height: 0px;margin-top: 30px;width: 100%;position: absolute;"></div><div class="btn-group btn-group-xs" role="group" style="position: absolute;right: -5px;" ng-show="basicInfo.range_show"><button type="button" class="btn btn-default" ng-click="btnzoomin()"><i class="fa fa-plus" aria-hidden="true"></i></button><button type="button" class="btn btn-default" ng-click="btnzoomout()"><i class="fa fa-minus" aria-hidden="true"></i></button></div></div></div></div></div>' + dom_real_time_grap;

            return html;
        }
    }

    link(scope, element, attrs) {
        scope['defaultColors'] = this._dataService.defaultColors();
        var dataService = this._dataService;
        var _$interval = this._$interval;
        scope.status = true;
        var timeOut = this.$timeout;
        scope.completionPercent = 0;
        scope.graphId = attrs.id;
        this.$timeout(function() {
            var getData = function(numSeries, numRows, name) {
                var result = {
                    labels: null,
                    data: null
                };
                var data = [];
                var labels = [];
                //init date
                var initDate = new Date("2014/01/01 00:00:00");
                for (var j = 0; j < numRows; ++j) {
                    data[j] = [new Date(initDate.getTime() + 900000)];
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
                                Math.pow(Dygraph.LOG_SCALE, maxValue)
                            ];
                            axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)
                            ];
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
                                Math.pow(Dygraph.LOG_SCALE, maxValue)
                            ];
                            axis.valueRange = [Math.pow(Dygraph.LOG_SCALE, minValue),
                                Math.pow(Dygraph.LOG_SCALE, maxValue)
                            ];
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
                                Math.pow(Dygraph.LOG_SCALE, maxDate)
                            ];
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
                    angular.forEach(g.xAxisRange(), function(range) {
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
            var mouseOverHandler = function(e, g, context) {
                //
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }
                //
                if (timer != null) {
                    timeOut.cancel(timer);
                }
                timer = timeOut(function() {
                    canScroll = true;
                }, 1000);
            };


            var mouseEnterHandler = function(e, g, context) {
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }
                //
                if (timer != null) {
                    timeOut.cancel(timer);
                }
                timer = timeOut(function() {
                    canScroll = true;
                }, 1000);
            };

            var mouseOutHandler = function(e, g, context) {
                // set flag to false
                if (timer != null) {
                    timeOut.cancel(timer);
                }
                canScroll = false;
            };

            var scroll = function(e, g, context) {

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
                timeOut(function() {
                    scope.chartDateWindow = g.xAxisRange();
                });
            };

            var firstPoint = null;
            var mousedownHandler = function(e, g, context) {
                if (scope.basicInfo && !scope.basicInfo.zoom) {
                    return;
                }
                context.initializeMouseDown(e, g, context);
                firstPoint = e.clientX;
                Dygraph.startPan(e, g, context);
            };
            var mousemoveHandler = function(e, g, context) {
                if (context.isPanning) {
                    if (e.offsetX <= (g.plotter_.area.x)) {
                        movePan(e, g, context, 'r');
                    } else if (e.offsetX >= (g.plotter_.area.x + g.plotter_.area.w)) {
                        movePan(e, g, context, 'l');
                    } else {
                        movePan(e, g, context, 'h');
                    }
                    timeOut(function() {
                        scope.chartDateWindow = scope.currentChart.xAxisRange();
                    });
                }
            };

            var mouseupHandler = function(e, g, context) {
                if (context.isPanning) {
                    Dygraph.endPan(e, g, context);
                }

                canScroll = true;
            };

            var interactionModel = {
                'mousewheel': scroll,
                'DOMMouseScroll': scroll,
                'wheel': scroll,
                'mousedown': mousedownHandler,
                'mousemove': mousemoveHandler,
                'mouseenter': mouseEnterHandler,
                'mouseup': mouseupHandler,
                // 'mouseover': mouseOverHandler,
                'mouseout': mouseOutHandler
            };


            //init configuration
            var configuration = {
                drawGapEdgePoints: true,
                'pointSize': 3,
                legend: 'follow',
                labelsKMB: true,
                labelsSeparateLines: true,
                // data formate
                labels: ['x'].concat(sampleData.labels),
                highlightSeriesOpts: {
                    strokeWidth: 3,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 5
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
                        valueFormatter: function(y) {
                            return moment(y).format('DD/MM/YYYY HH:mm:ss'); //Hide legend label
                        }
                    }
                },
                pointClickCallback: function(e, p) {
                    if (scope.currentView != -1) {
                        scope.showOne(p.name);
                    }
                },
                drawCallback: function(g, isInit) {
                    if (scope.refersh) { // make sure "scope.refersh" doesn't call when the graph create first time.
                        scope.refersh(g, isInit);
                    }
                },
                'interactionModel': interactionModel
            };
            scope.currentChart = new Dygraph(element.find("div[class='line-chart-graph']")[0], sampleData.data, configuration);
            element.find("canvas").css("zIndex", 99);

            var timer_auto = null;
            var process_bar_timer = null;
            element.find("#real_time_graph_" + attrs.id).on("hidden.bs.modal", function() {
                // put your default event here
                _$interval.cancel(timer_auto);
                _$interval.cancel(process_bar_timer);
            });


            //real-time-graph
            element.find("#real_time_graph_" + attrs.id).on('shown.bs.modal', function() {

                var tempConifg = {
                    drawGapEdgePoints: true,
                    'pointSize': 3,
                    labelsKMB: true,
                    labelsSeparateLines: false,
                    drawPoints: false,
                    drawAxesAtZero: false,
                    labelsDivStyles: {
                        'text-align': 'right',
                        'position': 'relative',
                        'display': 'inline-block'
                    },
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
                            valueFormatter: function(y) {
                                return moment(y).format('DD/MM/YYYY HH:mm:ss'); //Hide legend label
                            }
                        }
                    },
                    interactionModel: {}
                };

                scope.realTimeGraph = new Dygraph(element.find("div[class='real-time-graph']")[0], sampleData.data, tempConifg);
                scope.realTimeGraph.updateOptions(scope.currentChartOptions);
                scope.realTimeGraph.updateOptions({
                    "file": [],
                    highlightSeriesOpts: {
                        strokeWidth: 3,
                        strokeBorderWidth: 1,
                        highlightCircleSize: 5
                    },
                });

                timer_auto = dataService.autoUpdateGraph(scope.applicationName, scope.auto_device_name, scope.auto_schema, scope.auto_store, scope.auto_fields, element.find("div[class='real-time-graph']").width() / 4, function(graph_data, worker, interval) {
                    // update graph
                    var deviceConfig = scope.auto_metadata.data.groups[1];
                    var collections = deviceConfig.collections;
                    var labels = [];
                    var series = {};
                    var colors = [];
                    var allLines = [];
                    //0 for y  1 for y2
                    var yRanges = [{
                        min: null,
                        max: null
                    }, {
                        min: null,
                        max: null
                    }];
                    angular.forEach(collections, function(collection) {
                        if (collection.name == scope.auto_store) {
                            angular.forEach(graph_data.data, function(line) {
                                allLines.push([new Date(line.timestamp)]);
                            });

                            var showY2axis = false;
                            angular.forEach(collection.rows, function(row) {
                                labels.push(row.label);
                                colors.push(row.color);

                                if (row.yaxis == 0) {
                                    series[row.label] = {
                                        'axis': 'y1'
                                    };
                                } else {
                                    series[row.label] = {
                                        'axis': 'y2'
                                    };
                                    showY2axis = true;
                                }
                                var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                                // add value
                                var counter = 0;
                                angular.forEach(allLines, function(realLine) {
                                    try {
                                        var value = f(graph_data.data[counter]);
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

                            angular.forEach(yRanges, function(yrange) {
                                if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                    yrange.min = yrange.min - (yrange.min) * 0.10;
                                    yrange.max = yrange.max + (yrange.min) * 0.10;
                                } else {
                                    yrange.min = yrange.min - (yrange.max - yrange.min) * 0.10;
                                    yrange.max = yrange.max + (yrange.max - yrange.min) * 0.10;
                                }
                            });

                            var newLines = [];
                            if (!showY2axis) {
                                angular.copy(allLines, newLines);
                                angular.forEach(newLines, function(line) {
                                    line.push(null);
                                });
                                // update graph
                                scope.realTimeGraph.updateOptions({
                                    file: newLines,
                                    axes: {
                                        y: {
                                            valueRange: [yRanges[0].min, yRanges[0].max]
                                        },
                                        y2: {
                                            valueRange: [yRanges[1].min, yRanges[1].max]
                                        }
                                    }
                                });
                            } else {
                                // update graph
                                scope.realTimeGraph.updateOptions({
                                    file: allLines,
                                    axes: {
                                        y: {
                                            valueRange: [yRanges[0].min, yRanges[0].max]
                                        },
                                        y2: {
                                            valueRange: [yRanges[1].min, yRanges[1].max]
                                        }
                                    }
                                });
                            }
                        }
                    });
                    if (worker) {
                        timer_auto = worker;
                    }


                    //
                    var perInterval = interval / 100;
                    var counter = 0;

                    if (process_bar_timer) {
                        _$interval.cancel(process_bar_timer);
                        counter = 0;
                    }

                    process_bar_timer = _$interval(function() {
                        scope.completionPercent = counter;
                        counter++;
                    }, perInterval, 100);


                });
            });


            scope.currentChartOptions = {};

            scope.showRealTimeGraph = function() {
                element.find("#real_time_graph_" + attrs.id).modal();
            };


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
                    });
                    scope.chartDateWindow = scope.rangeSelectorBar.xAxisRange();
                }


                var status = false;
                // add mouse up event to range select
                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mouseup', function(event) {
                    status = false;
                    timeOut(function() {
                        var finalDateRagne = scope.currentChart.xAxisRange();
                        scope.chartDateTime = {
                            begin: finalDateRagne[0],
                            end: finalDateRagne[1]
                        };
                    });
                });

                scope.$on('mouseUpMessage', function($scope, e) {
                    if ("mouseup" === e.type && status) {
                        status = false;
                        timeOut(function() {
                            var finalDateRange = scope.currentChart.xAxisRange();
                            scope.chartDateTime = {
                                begin: finalDateRange[0],
                                end: finalDateRange[1]
                            };
                        });
                    }
                });

                scope.$on('parentScatterViewChangedEvent', function(event, params) {
                    angular.forEach(params.children, function(item) {
                        if (item == attrs.id) {
                            scope.currentView = params.view;
                        }
                    });
                });


                scope.$on('bindFatherGraphEvent', function(event, data) {
                    angular.forEach(data.children, function(child) {
                        if (child == attrs.id) {
                            Dygraph.synchronize([scope.currentChart].concat(data.parent), {
                                zoom: true,
                                selection: false,
                                range: false
                            });
                            scope.currentChart.updateOptions({
                                drawCallback: function(g, isInit) {
                                    // console.info("refersh running!" + " is  Init?"+ isInit);
                                    scope.refersh(g, isInit);
                                }
                            });

                        }
                    });


                });


                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousemove', function(event) {
                    if (status) {
                        timeOut(function() {
                            scope.chartDateWindow = scope.currentChart.xAxisRange();
                        });
                    }
                });

                element.find('.dygraph-rangesel-fgcanvas, .dygraph-rangesel-zoomhandle').on('mousedown', function(event) {
                    status = true;
                });

                //bind chart
                if (basicInfo && basicInfo.childrenChart.length > 0) {
                    var param = {
                        'graphs': [scope.currentChart],
                        children: basicInfo.childrenChart
                    };
                    if (scope.rangeSelectorBar) {
                        param.graphs.push(scope.rangeSelectorBar);
                    }
                    scope.$emit('bindChildChartEvent', param);
                }
            }
        }, 0);
    }

    //controller: ['$scope', '$element', '$window', '$interval', '$timeout', '$filter', '$location', function ($scope, $element, $window, $interval, $timeout, $filter, $location) {
    controller($scope, $element, $window, $interval, $timeout, $filter, $location, dataService, $rootScope, $stateParams, graphDataService, $compile) {
        var element_id = $element.attr("id");
        $scope.elementId = element_id;

        $scope['defaultColors'] = dataService.defaultColors();
        var metadata = null;
        var widgetData = null;
        $scope.emptyDataShow = false;
        // attributes----------------------
        $scope.applicationName = $rootScope.applicationName;

        $scope.alertMessage;

        $scope.showY2Btns = false;

        $scope.legendText = null;
        $scope.legendText_device = null;
        $scope.legendText_datetime = null;
        $scope.legendText_column = null;
        $scope.legendText_value = null;
        $scope.legendColor = null;
        $scope.autoupdate = false;
        $scope.auto_device_name = "";
        $scope.auto_schema = "";
        $scope.auto_store = "";
        $scope.auto_fields = [];
        // default data-time intervals

        $scope.defaultTimeIntervals = [{
                name: "10 seconds",
                interval: 10000
            },
            {
                name: "30 seconds",
                interval: 30000,
                scales: [10000]
            },
            {
                name: "1 minutes",
                interval: 60000,
                scales: [10000, 30000]
            },
            {
                name: "5 minutes",
                interval: 300000,
                scales: [30000, 60000]
            },
            {
                name: "30 minutes",
                interval: 1800000,
                scales: [60000, 300000]
            }, {
                name: "1 hour",
                interval: 3600000,
                scales: [60000, 300000, 1800000]
            }, {
                name: "1 day",
                interval: 86400000,
                scales: [300000, 1800000, 3600000]
            }, {
                name: "1 week",
                interval: 604800017,
                scales: [3600000, 86400000]
            }, {
                name: "1 month",
                interval: 2629800000,
                scales: [86400000, 604800017]
            }, {
                name: "1 year",
                interval: 31557600000,
                scales: [2629800000]
            }
        ];

        $scope.dateTimeIntervals = [].concat($scope.defaultTimeIntervals);

        $scope.locked_interval = null;
        // lock interval
        $scope.lock = function(interval) {
            if ($scope.locked_interval) {
                if ($scope.locked_interval == interval) {
                    $scope.locked_interval = null; // unlocked
                    if (!$scope.dateTimeIntervals) {
                        $scope.dateTimeIntervals = [].concat($scope.defaultTimeIntervals);
                    }
                    // change default choosed interval
                    $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
                    $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
                } else {
                    $scope.locked_interval = interval; // locked
                    // change color
                    // change dropdown list
                    $scope.defaultTimeIntervals.forEach(function(item) {
                        //
                        if (item["scales"] && item["scales"].length > 0) {
                            item["scales"].forEach(function(_item) {
                                if (_item == interval.interval) {
                                    //
                                    $scope.dateTimeIntervals.push(item);
                                }
                            });
                        }

                    });

                    $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
                    $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
                }
            } else {
                $scope.locked_interval = interval;
                // change color

                // change dropdown list
                // check the user default config first
                if ($scope.dateTimeIntervals) {

                } else {
                    $scope.defaultTimeIntervals.forEach(function(item) {
                        //
                        if (item["scales"] && item["scales"].length > 0) {
                            item["scales"].forEach(function(_item) {
                                if (_item == interval.interval) {
                                    //
                                    $scope.dateTimeIntervals.push(item);
                                }
                            });
                        }

                    });
                }


                $scope.currentIntervalName = $scope.dateTimeIntervals[0].name;
                $scope.currentIntervalChoosed = $scope.dateTimeIntervals[0];
            }
            // change
            $scope.changeInterval($scope.currentIntervalChoosed);
        };

        $scope.$emit('fetchWidgetMetadataEvent', {
            id: element_id,
            callback: function(data) {
                if (data) {
                    widgetData = data;
                    if (widgetData.data.metadata.data.basic.ranges) {
                        if (widgetData.data.metadata.data.basic.hasOwnProperty("ranges")) {
                            $scope.dateTimeIntervals = widgetData.data.metadata.data.basic.ranges;
                            angular.forEach($scope.dateTimeIntervals, function(range) {
                                range["interval"] = range.value;
                                if (range.checked == true) {
                                    $scope.currentIntervalChoosed = range;
                                }
                            });
                        }
                    } else {
                        $scope.currentIntervalChoosed = $scope.dateTimeIntervals[1];
                    }
                }
            }
        });


        $scope.changeInterval = function(interval) {

            var range = $scope.currentChart["xAxisZoomRange"];

            if (range[0] instanceof Date) {
                range[0] = range[0].getTime();
            }

            if (range[1] instanceof Date) {
                range[1] = range[1].getTime();
            }

            if (interval && ((range[1] - interval.interval) >= range[0])) {
                $scope.rangeConfig.dateWindow = [new Date(range[1] - interval.interval), range[1]];
                $scope.currentChart.updateOptions($scope.rangeConfig);
                $scope.currentIntervalChoosed = interval;
            }
        };


        if (widgetData.data && widgetData.from == "show") {
            $scope.loadingShow = false;

            $scope.intevals = {
                device: []
            };


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
            $scope.fixGraphWithGap = function() {
                if ($scope.currentChart && $scope.fixInterval) {
                    var currentInterval = -1;
                    angular.forEach($scope.intevals.device, function(item) {
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
                                    obj.push(null);
                                }
                                fixed.push(obj);
                            }
                            tempDate += currentInterval;
                        }
                        $scope.currentChart.updateOptions({
                            file: fixed
                        });
                    }
                } else if ($scope.currentChart && !$scope.fixInterval) {
                    noneFixed = [];
                    angular.copy($scope.currentChart.file_, noneFixed);
                    $scope.currentChart.updateOptions({
                        file: noneFixed
                    });
                }

            };

            $scope.showOrHideDevice = function(device) {
                angular.forEach($scope.childrenDevices, function(item, index) {
                    if (item.name === device.name) {
                        var graph = $scope.currentChart;
                        if (device.show == true) {
                            graph.setVisibility(index, false);
                            device.show = false;
                        } else {
                            graph.setVisibility(index, true);
                            device.show = true;
                        }

                    }
                });
            };

            $scope.fixGraphWithGap_click = function() {
                if ($scope.currentChart && !$scope.fixInterval) {
                    noneFixed = [];
                    angular.copy($scope.currentChart.file_, noneFixed);
                    var currentInterval = -1;
                    angular.forEach($scope.intevals.device, function(item) {
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
                                    obj.push(null);
                                }
                                fixed.push(obj);
                            }
                            tempDate += currentInterval;
                        }
                        $scope.currentChart.updateOptions({
                            file: fixed
                        });
                    }
                } else if ($scope.currentChart && $scope.fixInterval) {
                    $scope.currentChart.updateOptions({
                        file: noneFixed
                    });
                }

            };


            metadata = widgetData.data.metadata;
            $scope.basicInfo = metadata.data.basic;
            $scope.currentView = -1; // -1 is device view and 1 is scatter view

            $scope.parent_container = widgetData.data.parent;

            $scope.data_from = "application";

            $scope.checkY2Btns = function() {
                return $scope.basicInfo.zoom === true && $scope.showY2Btns === true;
            };

            $scope.$on('deviceInfoEvent', function(event, deviceData) {
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
                $scope.auto_schema = metadata.data.source.store;
                $scope.auto_metadata = metadata;
                $scope.auto_device_name = deviceData.device.name;

                $scope.$watch('currentView', function(nObj, oObj) {
                    // change
                    if (nObj != oObj) {
                        $scope.$emit('graphScatterViewChangeEvent', {
                            children: $scope.basicInfo.childrenChart,
                            view: nObj
                        });
                        $scope.button_handlers = {}; // clean handlers
                        $element.find("#buttons_area").empty();
                        if (nObj == -1) {
                            $scope.autoupdate = true;
                            var rangeLevel = null;
                            var otherLevels = [];
                            angular.forEach(metadata.data.groups[1].collections, function(level) {
                                if (level.rows.length > 0) {
                                    if (rangeLevel != null) {
                                        otherLevels.push(rangeLevel);
                                    }
                                    rangeLevel = level.name;
                                }
                            });
                            if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {
                                // show device view
                                var fields = [];
                                var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                                angular.forEach(metadata.data.groups[1].collections, function(level) {
                                    if (level.rows.length > 0 && level.name === rangeLevel) {
                                        var lines = level.rows;
                                        if (lines) {
                                            angular.forEach(lines, function(line) {
                                                if (line.value) {
                                                    var columns = (line.value).match(patt);
                                                    angular.forEach(columns, function(column) {
                                                        if (column.startsWith('data.')) {
                                                            fields.push(column.replace('data.', ''));
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                                $scope.auto_fields = fields;
                                dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                                    initChart(data, deviceData.device.name);
                                }, function(error) {
                                    console.error(error)
                                });
                            }

                        } else {
                            $scope.autoupdate = false;
                            //get relation config
                            if (!metadata.data.source.relation || "none" === metadata.data.source.relation) {
                                return;
                            } else {
                                var rangeLevel = null;
                                var otherLevels = [];
                                angular.forEach(metadata.data.groups[2].collections, function(level) {
                                    if (level.rows.length > 0) {
                                        if (rangeLevel != null) {
                                            otherLevels.push(rangeLevel);
                                        }
                                        rangeLevel = level.name;
                                    }
                                });
                                if (deviceData.device.name && deviceData.device.name != "" && deviceData.device.name != "undefined") {

                                    var fields = [];
                                    var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                                    angular.forEach(metadata.data.groups[2].collections, function(level) {
                                        if (level.rows.length > 0 && level.name === rangeLevel) {
                                            var lines = level.rows;
                                            if (lines) {
                                                angular.forEach(lines, function(line) {
                                                    if (line.value) {
                                                        var columns = (line.value).match(patt);
                                                        angular.forEach(columns, function(column) {
                                                            if (column.startsWith('data.')) {
                                                                fields.push(column.replace('data.', ''));
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    $scope.auto_fields = fields;
                                    // show children view
                                    dataService.childrenExtensionInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, metadata.data.source.relation, metadata.data.source.relation_group, metadata.data.source.relation_group, rangeLevel, otherLevels, fields).then(function(data) {
                                        if (data != null && data.length > 0) {
                                            initChildrenChart(data);
                                            // interactions for scatter view
                                            if ($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.buttons && $scope.interactions.graphs.buttons.scatter) {
                                                // 1. color
                                                if ($scope.interactions.graphs.buttons.scatter.color) {
                                                    // change color by "field"
                                                    var buttons = $scope.interactions.graphs.buttons.scatter.color;

                                                    angular.forEach(buttons, function(button) {
                                                        var buttons_html = '';
                                                        // create an event handler
                                                        var _func = '_' + (Math.random().toString(36).slice(2, 13));
                                                        $scope.button_handlers[_func] = function() {
                                                            var colors = [];
                                                            // set button status
                                                            if (button["active"]) {
                                                                // make them random colors
                                                                angular.forEach($scope.childrenDevices, function(device, $index) {
                                                                    if ($scope.defaultColors[$index]) {
                                                                        colors.push($scope.defaultColors[$index]);
                                                                    } else {
                                                                        colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                                                                    }
                                                                });
                                                                button["active"] = false;
                                                            } else {
                                                                // the custom func returns color.
                                                                var field = button.field;
                                                                var _func = button._func;
                                                                // devices
                                                                angular.forEach($scope.childrenDevices, function(device, $index) {
                                                                    colors.push(_func(device[field]));
                                                                });
                                                                button["active"] = true;
                                                            }
                                                            // update graph colors
                                                            $scope.currentChart.updateOptions({
                                                                "colors": colors
                                                            });
                                                        }
                                                        // create click event handler for this button and put it into $scope
                                                        buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                                                        // compile the html and add it into toolbar
                                                        $element.find("#buttons_area").append($compile(buttons_html)($scope));
                                                    });
                                                }
                                                // 2. data filter
                                                if ($scope.interactions.graphs.buttons.scatter.dataFilter) {
                                                    var buttons = $scope.interactions.graphs.buttons.scatter.dataFilter;

                                                    angular.forEach(buttons, function(button) {
                                                        var buttons_html = '';
                                                        // create an event handler
                                                        var _func = '_' + (Math.random().toString(36).slice(2, 13));
                                                        $scope.button_handlers[_func] = function() {
                                                            // set button status
                                                            // the custom func returns color.
                                                            var field = button.field;
                                                            var _func = button._func;
                                                            // devices
                                                            angular.forEach($scope.childrenDevices, function(device, $index) {
                                                                if (_func(device[field])) {
                                                                    device.show = true;
                                                                    $scope.currentChart.setVisibility($index, true);
                                                                } else {
                                                                    device.show = false;
                                                                    $scope.currentChart.setVisibility($index, false);
                                                                }
                                                            });
                                                        }
                                                        // create click event handler for this button and put it into $scope
                                                        buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                                                        // compile the html and add it into toolbar
                                                        $element.find("#buttons_area").append($compile(buttons_html)($scope));
                                                    });
                                                }
                                                // highlight   $scope.currentChart.setSelection(false, line);
                                                if ($scope.interactions && $scope.interactions.graphs && $scope.interactions.graphs.buttons && $scope.interactions.graphs.buttons.scatter && $scope.interactions.graphs.buttons.scatter.highlighting) {
                                                    var buttons = $scope.interactions.graphs.buttons.scatter.highlighting;
                                                    angular.forEach(buttons, function(button) {
                                                        var buttons_html = '';
                                                        // create an event handler
                                                        var _func = '_' + (Math.random().toString(36).slice(2, 13));
                                                        $scope.button_handlers[_func] = function() {
                                                            // set button status
                                                            // the custom func returns color.
                                                            var field = button.field;
                                                            var _func = button._func;
                                                            // devices
                                                            var timerInterval = 0;
                                                            angular.forEach($scope.childrenDevices, function(device, $index) {
                                                                if (_func(device[field])) {
                                                                    $timeout(function(){
                                                                        $scope.currentChart.setSelection(false, device[field]);
                                                                    }, timerInterval);
                                                                    timerInterval += 1000;
                                                                }
                                                            });
                                                        }
                                                        // create click event handler for this button and put it into $scope
                                                        buttons_html += '<span class="btn btn-xs btn-info badge" style="float:right;margin-right:10px;" ng-click="button_handlers.' + _func + '();">' + button.label + '</span>';
                                                        // compile the html and add it into toolbar
                                                        $element.find("#buttons_area").append($compile(buttons_html)($scope));
                                                    });
                                                }

                                            }
                                            // n. other.....
                                        } else {
                                            return;
                                        }
                                    }, function(error) {
                                        console.error(error)
                                    });

                                }
                            }
                        }
                    }
                    $scope.fixInterval = false;

                });
                // first time of showing chart
                $scope.$watch('currentChart', function(newValue) {
                    if (newValue) {
                        //device first level
                        var rangeLevel = null;
                        var otherLevels = [];
                        angular.forEach(metadata.data.groups[1].collections, function(level) {
                            if (level.rows.length > 0) {
                                if (rangeLevel != null) {
                                    otherLevels.push(rangeLevel);
                                }
                                rangeLevel = level.name;
                            }
                        });

                        // fields of range level
                        var fields = [];
                        var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                        angular.forEach(metadata.data.groups[1].collections, function(level) {
                            if (level.rows.length > 0 && level.name === rangeLevel) {
                                var lines = level.rows;
                                if (lines) {
                                    angular.forEach(lines, function(line) {
                                        //
                                        if (line.value) {
                                            var columns = (line.value).match(patt);
                                            angular.forEach(columns, function(column) {
                                                if ((column).startsWith('data.')) {
                                                    fields.push(column.replace('data.', ''));
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });

                        $scope.auto_fields = fields;
                        //send a rest request
                        dataService.deviceInitInfo($rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, rangeLevel, otherLevels, fields).then(function(data) {
                            if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {
                                //call scatter view init.
                                $scope.currentView = 1;
                            } else {
                                $scope.currentView = -1;
                                initChart(data, deviceData.device.name);
                            }

                        }, function(error) {
                            console.error(error)
                        });
                    }
                });
                $scope.$watch("chartDateTime", function(newValue, oldValue) {
                    if (newValue.begin != null && newValue.end != null) {
                        var expect_points = Math.floor($element.parent().width());
                        // find a interval
                        var expectedInterval = (newValue.end - newValue.begin) / expect_points;
                        if ($scope.locked_interval) {
                            expectedInterval = $scope.locked_interval.interval;
                        }
                        var conf = $scope.intevals.device;

                        if(conf == null || conf.length == 0){
                            return false;
                        }
                        // device detail view
                        var preOne = conf[0].interval;
                        var lastOne = conf[conf.length - 1].interval;
                        var cin = "";
                        if (expectedInterval >= preOne) {
                            expectedInterval = preOne;
                            $scope.autoupdate = false;
                        } else if (expectedInterval <= lastOne) {
                            expectedInterval = lastOne;


                            if ($scope.currentView == -1) {
                                $scope.autoupdate = true;
                                $scope.auto_store = conf[conf.length - 1].name;
                            }


                        } else {
                            for (var i = 1; i < conf.length; i++) {
                                if (expectedInterval <= preOne && expectedInterval > conf[i].interval) {
                                    expectedInterval = preOne;
                                } else {
                                    preOne = conf[i].interval;
                                    cin = conf[i].name;
                                }
                            }
                            $scope.autoupdate = false;
                        }

                        $scope.currentIntervalName = "";

                        angular.forEach(conf, function(config) {
                            if (config.interval == expectedInterval) {
                                $scope.currentIntervalName = config.name;
                            }
                        });

                        // check the interval(data) no more than the number of expected points
                        if (expectedInterval == lastOne) {

                            // check
                            if ($scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.limits) {
                                expect_points = $scope['interactions'].graphs.limits;
                            }
                            //
                            if (((newValue.end - newValue.begin) / expectedInterval) > expect_points) {
                                // reset range bar
                                $scope.rangeConfig.dateWindow = [new Date(newValue.end - (expect_points - 1) * expectedInterval), new Date(newValue.end)];
                                $scope.currentChart.updateOptions($scope.rangeConfig);
                                $scope.currentChartOptions = $scope.rangeConfig;
                                $scope.alertMessage = "Limit the number of \"Zoom-Out\" points to " + expect_points + ".";
                                $timeout(function() {
                                    $scope.alertMessage = null;
                                }, 5000);
                                return;
                            }
                        }

                        // update range-bar
                        if ($scope.rangeSelectorBar) {
                            angular.forEach($scope.trees, function(tree) {
                                if (tree.range == true) {
                                    // send request
                                    var fields = [];
                                    var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                                    angular.forEach(metadata.data.groups[1].collections, function(level) {
                                        if (level.rows.length > 0 && level.name === tree.store) {
                                            var lines = level.rows;
                                            if (lines) {
                                                angular.forEach(lines, function(line) {
                                                    //
                                                    if (line.value) {
                                                        var columns = (line.value).match(patt);
                                                        angular.forEach(columns, function(column) {
                                                            if ((column).startsWith('data.')) {
                                                                fields.push(column.replace('data.', ''));
                                                            }
                                                        });

                                                    }

                                                });
                                            }
                                        }
                                    });

                                    $scope.auto_fields = fields;
                                    dataService.deviceStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, new Date(newValue.begin).getTime(), new Date(newValue.end).getTime(), fields, expectedInterval).then(function(data) {
                                            // udpate chart
                                            var showData = data;
                                            showData = showData.filter(function(obj) {
                                                return obj != null;
                                            });

                                            // update range bar
                                            var basicInfo = $scope.basicInfo;
                                            var allLines = [];
                                            angular.forEach(showData, function(line) {
                                                allLines.push([new Date(line.timestamp)]);
                                            });
                                            var series_range = {
                                                'l0': {
                                                    axis: 'y1'
                                                }
                                            };

                                            var rangeBarLabels = [];
                                            for (var i = 0; i < fields.length; i++) {
                                                rangeBarLabels.push(fields[i]);

                                                var f = new Function("data", "with(data) { if(data." + fields[i] + "!=null)return data." + fields[i] + ";return null;}");
                                                // add value
                                                var counter = 0;
                                                angular.forEach(allLines, function(realLine) {
                                                    try {
                                                        var value = f(showData[counter]);
                                                        realLine.push(value);
                                                    } catch (ex) {
                                                        realLine.push(null);
                                                    }
                                                    counter++;
                                                });
                                            }
                                            //

                                            if ($scope.rangeConfig && $scope.rangeConfig.file && $scope.rangeConfig.file != null) {
                                                var objNeed2Add = [];
                                                angular.forEach($scope.rangeConfig.file, function(item) {
                                                    var flag = false;
                                                    var dataLength = -1;
                                                    angular.forEach(allLines, function(line) {
                                                        dataLength = line.length;
                                                        if (line.length > 0 && line[0].getTime() === item[0].getTime()) {
                                                            flag = true;
                                                        } else if (line.length === 0) {
                                                            flag = true;
                                                        } else {
                                                            dataLength = line.length;
                                                        }

                                                    });
                                                    if (!flag) {
                                                        var tempObj = [];
                                                        for (var i = 0; i < dataLength; i++) {
                                                            tempObj[i] = item[i];
                                                        }
                                                        objNeed2Add.push(tempObj);
                                                    }
                                                });
                                            }
                                            allLines = allLines.concat(objNeed2Add);
                                            allLines.sort(function(a, b) {
                                                return a[0] > b[0] ? 1 : -1;
                                            });
                                            if ($scope.showY2Btns) {
                                                //noinspection JSDuplicatedDeclaration
                                                if (!$scope.rangeConfig.axes.hasOwnProperty("y2")) {
                                                    series_range = {
                                                        'l0': {
                                                            axis: 'y1'
                                                        },
                                                        'l0': {
                                                            axis: 'y2'
                                                        }
                                                    };
                                                    $scope.rangeSeries = series_range;
                                                    $scope.rangeConfig = {
                                                        'file': allLines,
                                                        'labels': ['x'].concat(rangeBarLabels),
                                                        'series': series_range,
                                                        highlightSeriesOpts: {
                                                            strokeWidth: 3,
                                                            strokeBorderWidth: 1,
                                                            highlightCircleSize: 5
                                                        }
                                                    };
                                                    if (basicInfo && basicInfo.range_show) {
                                                        $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                                    }
                                                } else {
                                                    $scope.rangeSelectorBar.updateOptions({
                                                        'file': allLines,
                                                        highlightSeriesOpts: {
                                                            strokeWidth: 3,
                                                            strokeBorderWidth: 1,
                                                            highlightCircleSize: 5
                                                        }
                                                    });
                                                }

                                            } else {
                                                series_range["span_y2"] = {
                                                    axis: 'y2'
                                                };
                                                $scope.rangeSeries = series_range;
                                                var newLines = [];
                                                angular.copy(allLines, newLines);
                                                angular.forEach(newLines, function(line) {
                                                    line.push(null);
                                                });
                                                $scope.rangeConfig = {
                                                    'file': newLines,
                                                    'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                                    'series': series_range,
                                                    highlightSeriesOpts: {
                                                        strokeWidth: 3,
                                                        strokeBorderWidth: 1,
                                                        highlightCircleSize: 5
                                                    }
                                                };
                                                if (basicInfo && basicInfo.range_show) {
                                                    $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                                                }
                                            }
                                        },
                                        function(data) {
                                            console.info(data);
                                        }
                                    );
                                }
                            });
                        }


                        $scope.loadingShow = true;
                        // check separated points config
                        if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                            $scope.currentChart.updateOptions({
                                connectSeparatedPoints: true
                            });
                        } else {
                            $scope.currentChart.updateOptions({
                                connectSeparatedPoints: false
                            });
                        }

                        if ($scope.currentView == 1) {
                            // scatter detail view
                            $scope.legendText = null;
                            var deviceInfo = [];
                            var currentStore = "";
                            $scope.childrenDevices = [];
                            angular.forEach($scope.childTrees, function(device) {
                                angular.forEach(device.trees, function(tree, index) {
                                    if (expectedInterval == tree.frequency) {
                                        currentStore = tree.store;
                                        deviceInfo.push({
                                            name: device.name,
                                            tree: tree.tree
                                        });
                                        device["show"] = true;
                                        $scope.childrenDevices.push(device);
                                    }
                                });
                            });
                            var fields = [];
                            var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);
                            angular.forEach(metadata.data.groups[2].collections, function(level) {
                                if (level.rows.length > 0 && level.name === $scope.currentIntervalName) {
                                    var lines = level.rows;
                                    if (lines) {
                                        angular.forEach(lines, function(line) {
                                            if (line.value) {
                                                var columns = (line.value).match(patt);
                                                angular.forEach(columns, function(column) {
                                                    if (column && (column).startsWith('data.')) {
                                                        fields.push(column.replace('data.', ''));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });

                            $scope.auto_fields = fields;
                            dataService.devicesStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceInfo, metadata.data.source.store, currentStore, new Date(newValue.begin).getTime(), new Date(newValue.end).getTime(), fields, expectedInterval).then(function(data) {
                                var showData = [];
                                angular.forEach(data, function(arr, key) {
                                    var deviceData = [].concat(arr);
                                    showData.push({
                                        device: key,
                                        data: deviceData
                                    });
                                    if(deviceData.length == 0){
                                        var deleteIndex = -1;
                                        // no data
                                        angular.forEach($scope.childrenDevices, function(item, index){
                                            if(item.name == key){
                                                deleteIndex = index;
                                            }
                                        });
                                        if(deleteIndex != -1){
                                            $scope.childrenDevices.splice(deleteIndex, 1);
                                        }
                                    }
                                });
                                // order childrenDevices by showData
                                var devicesMatchData = [];
                                angular.forEach(showData, function(item){
                                    angular.forEach($scope.childrenDevices, function(device){
                                        if(item.device == device.name){
                                            devicesMatchData.push(device);
                                        }
                                    });
                                });
                                //reset childrenDevies
                                $scope.childrenDevices = devicesMatchData;
                                //get configuration
                                updateChildrenDetailChart(metadata, currentStore, $scope.rangeChildrenData, showData);
                            }, function(data) {
                                console.info(data);
                            });
                            $scope.fixGraphWithGap();
                        } else {
                            // cal tree
                            angular.forEach($scope.trees, function(tree, index) {
                                if (expectedInterval == tree.frequency) {
                                    // send request
                                    var fields = [];
                                    var patt = new RegExp(/data[.]{1}[a-zA-Z0-9]+/g);

                                    angular.forEach(metadata.data.groups[1].collections, function(level) {
                                        if (level.rows.length > 0 && level.name === $scope.currentIntervalName) {
                                            var lines = level.rows;
                                            if (lines) {
                                                angular.forEach(lines, function(line) {
                                                    //
                                                    if (line.value) {
                                                        var columns = (line.value).match(patt);
                                                        angular.forEach(columns, function(column) {
                                                            if ((column).startsWith('data.')) {
                                                                fields.push(column.replace('data.', ''));
                                                            }
                                                        });

                                                    }

                                                });
                                            }
                                        }
                                    });

                                    $scope.auto_fields = fields;
                                    dataService.deviceStoreData($scope.graphId, $rootScope.host, $rootScope.applicationName, deviceData.device.name, metadata.data.source.store, tree.store, tree.tree, new Date(newValue.begin).getTime(), new Date(newValue.end).getTime(), fields, tree.frequency).then(function(data) {
                                        // udpate chart
                                        var showData = data;
                                        showData = showData.filter(function(obj) {
                                            return obj != null;
                                        });
                                        showData.sort(function(a, b) {
                                            return a.timestamp > b.timestamp ? 1 : -1;
                                        });
                                        // get configuration
                                        updateDetailChart(metadata, tree.store, $scope.rangeData, showData);
                                        // rest visibility
                                        angular.forEach(showData, function(item){
                                            item["show"] = true;
                                        });

                                        // tell some other widgets, the graph is changed.
                                        $timeout(function() {
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

                                    }, function(data) {
                                        console.info(data);
                                    });
                                }
                            });

                            $scope.fixGraphWithGap();
                        }
                        // 2. series highlighting

                        $scope.status = false;
                    }
                });

            });


            var fetchData = function(values, node) {
                if (node.children[0] != null) {
                    fetchData(values, node.children[0]);
                }

                if (node.children[1] != null) {
                    fetchData(values, node.children[1]);
                }

                if (node.children[0] == null && node.children[1] == null) {
                    if (node.data != null && node.data.array) {
                        Array.prototype.push.apply(values, node.data.array.slice(0, node.data.size));
                    } else if (node.data != null) {
                        Array.prototype.push.apply(values, node.data.slice(0, node.data.length));
                    }

                }

            };


            $scope.trees = [];
            $scope.rangeData = [];

            $scope.ordinalRangeData = [];

            var initChart = function(data, deviceName) {
                $scope.intevalforshow = [];
                //
                $scope.intevals.device = [];
                var trees = data.trees;
                $scope.trees = trees;
                var rangeTree = null;
                angular.forEach(trees, function(tree) {
                    if (tree.range) {
                        rangeTree = tree;
                    }
                    $scope.intevals.device.push({
                        name: tree.store,
                        interval: tree.frequency
                    });
                });


                // init chart with range data
                var store = rangeTree.store;

                // get all data
                var allData = [];
                // fetchData(allData, rangeTree.tree);    only get first and last
                // fix the problem of never seen the current data.
                rangeTree.last.timestamp = rangeTree.last.timestamp + (rangeTree.frequency - 1);
                allData = allData.concat([rangeTree.first, rangeTree.last]);

                allData = allData.filter(function(obj) {
                    return obj != null;
                });

                allData.sort(function(a, b) {
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
                    newData.push({
                        timestamp: timestamp - currentInterval
                    });
                    Array.prototype.push.apply(newData, allData);
                    newData.push({
                        timestamp: timestamp + currentInterval
                    });
                    allData = newData;
                }
                $scope.ordinalRangeData = allData;
                // put the data into range tree cache
                if (rangeTree) {
                    //
                    graphDataService.put(deviceName + "/" + rangeTree.store + "/" + $scope.graphId, [rangeTree.first, {
                        timestamp: moment().endOf('day').toDate().getTime()
                    }]);
                }
                // get configuration and make real data
                updateChart(metadata, store, allData, rangeTree);
            };

            var initChildrenChart = function(deviceDatas) {
                var devicesInfo = {};
                $scope.intevals.device = [];
                //range data with all device
                $scope.childTrees = [];
                $scope.childrenDevices = [];

                angular.forEach(deviceDatas, function(deviceData, _index) {
                    var device = {};
                    device["show"] = true;
                    angular.merge(device, deviceData.device, deviceData.extension);
                    $scope.childrenDevices.push(device);
                    var trees = deviceData.trees;
                    device["trees"] = trees;
                    $scope.childTrees.push(device);
                    var rangeTree = null;
                    angular.forEach(trees, function(tree) {
                        if (tree.range) {
                            rangeTree = tree;
                        }

                        var flag = false;
                        angular.forEach($scope.intevals.device, function(interval) {
                            if (interval.name == tree.store && interval.interval == tree.frequency) {
                                // has same one
                                flag = true;
                            }
                        });
                        if (!flag) {
                            $scope.intevals.device.push({
                                name: tree.store,
                                interval: tree.frequency
                            });
                        }

                    });

                    if (rangeTree != null) {
                        var deviceObj = devicesInfo[device.name] = {};
                        // get all data
                        var allData = [rangeTree.first, {
                            timestamp: moment().endOf('day').toDate().getTime()
                        }];
                        allData = allData.filter(function(obj) {
                            return obj != null;
                        });
                        allData.sort(function(a, b) {
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

            var updateChildrenChart = function(metadata, devicesInfo) {
                //relation
                var relationConfig = metadata.data.groups[2];
                // scatter view shows only one collection
                var collections = relationConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {
                    left: relationConfig.leftYAxis,
                    right: relationConfig.rightYAxis
                };
                var allLines = [];
                var allXLabels = [];
                angular.forEach(devicesInfo, function(device, key, _index) {
                    angular.forEach(device.data, function(item) {
                        var flag = false;
                        angular.forEach(allXLabels, function(label) {
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
                allXLabels.sort(function(a, b) {
                    return a > b ? 1 : -1;
                });

                // make all line
                angular.forEach(allXLabels, function(label) {
                    allLines.push([label]);
                });

                var yRange = {
                    min: null,
                    max: null
                };
                var showY2axis = false;
                var counter = 0;
                angular.forEach(devicesInfo, function(device, key) {
                    if ($scope.defaultColors[counter]) {
                        colors.push($scope.defaultColors[counter]);
                    } else {
                        colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                    }
                    counter++;

                    angular.forEach(collections, function(collection) {
                        if (collection.name == device.range.store) {
                            $scope.currentIntervalName = device.range.store;
                            var originalData = device.data;

                            // always same for each device
                            if (collection.rows[0].yaxis == 0) {
                                series[collection.rows[0].label] = {
                                    'axis': 'y1'
                                };
                            } else {
                                series[collection.rows[0].label] = {
                                    'axis': 'y2'
                                };
                                showY2axis = true;
                                $scope.showY2Btns = true;
                            }
                            labels.push(key);
                            // make a line
                            var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                            // add value
                            angular.forEach(allLines, function(realLine, index) {

                                var flag = false;
                                angular.forEach(originalData, function(odata) {
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
                var connectSeparatedPoints = false;
                if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                    connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                }

                //update chart
                if ($scope.currentChart) {
                    $scope.rangeChildrenData = allLines;

                    if (showY2axis) {
                        $scope.childrenRangeConfig = {
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'labelsKMB': true,
                            'file': allLines,
                            legend: 'never',
                            labelsKMB: true,
                            labelsSeparateLines: false,
                            highlightCircleSize: 2,

                            strokeBorderWidth: 1,
                            // data formate
                            labels: ['x'].concat(sampleData.labels),
                            highlightSeriesOpts: {
                                strokeWidth: 3,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 5
                            },
                            'labels': ['x'].concat(labels),
                            'ylabel': leftAndRight.left,
                            'y2label': leftAndRight.right,
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max],
                                    axisLabelWidth: 80
                                },
                                'y2': {}
                            }
                            // showRangeSelector: true
                        };
                    } else {
                        $scope.showY2Btns = false;
                        var newLines = [];
                        angular.copy(allLines, newLines);
                        angular.forEach(newLines, function(line) {
                            line.push(null);
                        });
                        series["span_y2"] = {
                            'axis': 'y2'
                        };
                        $scope.childrenRangeConfig = {
                            'connectSeparatedPoints': connectSeparatedPoints,
                            'drawGapEdgePoints': true,
                            'pointSize': 3,
                            'legend': 'never',
                            'labelsKMB': true,
                            'file': newLines,
                            'labelsSeparateLines': false,
                            highlightCircleSize: 2,

                            strokeBorderWidth: 1,
                            highlightSeriesOpts: {
                                strokeWidth: 3,
                                strokeBorderWidth: 1,
                                highlightCircleSize: 5
                            },
                            'labels': ['x'].concat(labels).concat(['span_y2']),
                            'ylabel': leftAndRight.left,
                            'y2label': "",
                            'series': series,
                            'colors': colors,
                            'axes': {
                                'y': {
                                    valueRange: [yRange.min, yRange.max]
                                },
                                'y2': {
                                    axisLabelFormatter: function(d) {
                                        return '';
                                    }
                                }
                            }
                            // showRangeSelector: true
                        };
                    }
                    //
                    $scope.currentChart.updateOptions($scope.childrenRangeConfig);

                    // set the first one to range bar
                    // update range bar with the first channel data
                    if ($scope.basicInfo && $scope.basicInfo.range_show && $scope['interactions'] && $scope['interactions'].graphs && $scope['interactions'].graphs.scatter) {

                        Dygraph.synchronize([$scope.rangeSelectorBar, $scope.currentChart], {
                            zoom: true,
                            selection: false,
                            range: false
                        });
                        if (showY2axis) {
                            $scope.rangeConfig = {
                                'file': newLines,
                                'series': series,
                                'labels': ['x'].concat(labels),
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                }
                            };
                        } else {
                            $scope.rangeConfig = {
                                'file': newLines,
                                'series': series,
                                'labels': ['x'].concat(labels).concat(['span_y2']),
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                }
                            };
                        }
                        $scope.rangeSelectorBar.updateOptions($scope.rangeConfig);
                        // reset the datetime for current chart

                        if ($scope.chartDateWindow && ($scope.chartDateWindow[0] != 1388495700000 || $scope.chartDateWindow[0] != 1388503800000) && ($scope.chartDateWindow[0] >= newLines[0][0] && $scope.chartDateWindow[1] <= newLines[newLines.length - 1][0])) {
                            // keep the current range bar refresh once.
                            $scope.chartDateTime = {
                                begin: $scope.chartDateTime.begin,
                                end: $scope.chartDateTime.end
                            };
                            $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                        } else {

                            $scope.currentChart["xAxisZoomRange"] = [newLines[0][0], newLines[newLines.length - 1][0]];
                            if (begin_path && end_path && !init_flag) {
                                // $scope.chartDateTime = {
                                //     "begin": new Date(new Number(begin_path)),
                                //     "end": new Date(new Number(end_path))
                                // };
                                $scope.chartDateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                $scope.rangeConfig.dateWindow = [new Date(new Number(begin_path)), new Date(new Number(end_path))];
                                init_flag = true;
                            } else {
                                if ($scope.currentIntervalChoosed && ((newLines[newLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= newLines[0][0].getTime())) {
                                    $scope.rangeConfig.dateWindow = [new Date(newLines[newLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval), newLines[newLines.length - 1][0]];
                                } else {
                                    $scope.chartDateWindow = [newLines[0][0], newLines[newLines.length - 1][0]];
                                    $scope.rangeConfig.dateWindow = [newLines[0][0], newLines[newLines.length - 1][0]];
                                }
                            }
                            $scope.currentChart.updateOptions($scope.rangeConfig);
                            $scope.currentChartOptions = $scope.rangeConfig;
                        }
                    } else {
                        //  keep the same time window and refersh
                        $scope.chartDateTime = {
                            begin: $scope.chartDateTime.begin,
                            end: $scope.chartDateTime.end
                        };
                        $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
                        $scope.loadingShow = false;
                    }

                }


            };


            var updateChildrenDetailChart = function(metadata, store, rangeData, allData) {
                //relation
                var relationConfig = metadata.data.groups[2];
                // scatter view shows only one collection
                var collections = relationConfig.collections;
                var newLines = [];
                var newTime = [];
                var series = {};
                var labels = [];
                var colors = [];
                var leftAndRight = {
                    left: relationConfig.leftYAxis,
                    right: relationConfig.rightYAxis
                };
                var yRange = {
                    min: null,
                    max: null
                };
                var counter = 0;
                var showY2axis = null;
                angular.forEach(allData, function(device) {
                    if ($scope.defaultColors[counter]) {
                        colors.push($scope.defaultColors[counter]);
                    } else {
                        colors.push('#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6));
                    }
                    counter++;

                    if (device.data.length > 0) {
                        labels.push(device.device);
                        angular.forEach(collections, function(collection) {
                            if (collection.name == store) {
                                $scope.currentIntervalName = store;
                                if (collection.rows[0].yaxis == 0) {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y1',
                                    };
                                } else {
                                    series[collection.rows[0].label] = {
                                        'axis': 'y2'
                                    };
                                    showY2axis = true;
                                    $scope.showY2Btns = true;
                                }
                                var f = new Function("data", "with(data) { if(" + collection.rows[0].value + "!=null)return " + collection.rows[0].value + ";return null;}");
                                var tempData = [];
                                var tempTime = [];
                                // make data
                                angular.forEach(device.data, function(data) {
                                    var dateTime = new Date(data.timestamp);
                                    try {
                                        var value = f(data);
                                        tempData.push({
                                            timestamp: dateTime,
                                            value: value
                                        });

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
                                        tempData.push({
                                            timestamp: dateTime,
                                            value: null
                                        });
                                    }
                                    tempTime.push(dateTime.getTime());
                                });
                                newTime = newTime.concat(tempTime.filter(function(item) {
                                    return newTime.indexOf(item) < 0;
                                }));
                                newLines.push({
                                    device: device.device,
                                    data: tempData
                                });
                            }
                        });
                    }
                });

                var chartData = [];
                // time needs sort!!!
                newTime = newTime.sort();
                angular.forEach(newTime, function(nt) {
                    chartData.push([new Date(nt)]);
                });


                angular.forEach(newLines, function(line) {
                    angular.forEach(chartData, function(timeTicket) {
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
                            timeTicket.push(null);
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
                        var connectSeparatedPoints = false;
                        if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                            connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                        }
                        if (showY2axis) {
                            $scope.currentChartOptions = {
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'pointSize': 3,
                                'legend': 'never',
                                'labelsKMB': true,
                                highlightCircleSize: 2,
                                strokeBorderWidth: 1,
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                },
                                labelsSeparateLines: false,
                                'file': chartData,
                                'labels': ['x'].concat(labels),
                                'ylabel': leftAndRight.left,
                                'y2label': leftAndRight.right,
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRange.min, yRange.max],
                                        axisLabelWidth: 80
                                    }
                                }
                            };

                            $scope.currentChart.updateOptions({
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'pointSize': 3,
                                'legend': 'never',
                                'labelsKMB': true,
                                highlightCircleSize: 2,
                                strokeBorderWidth: 1,
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                },
                                labelsSeparateLines: false,
                                'file': chartData,
                                'labels': ['x'].concat(labels),
                                'ylabel': leftAndRight.left,
                                'y2label': leftAndRight.right,
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRange.min, yRange.max],
                                        axisLabelWidth: 80
                                    }
                                }
                                // showRangeSelector: true
                            });
                        } else {
                            var newLines = [];
                            $scope.showY2Btns = false;
                            angular.copy(chartData, newLines);
                            angular.forEach(newLines, function(line) {
                                line.push(null);
                            });
                            series["span_y2"] = {
                                axis: 'y2'
                            };
                            $scope.currentChartOptions = {
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'pointSize': 3,
                                'legend': 'never',
                                'labelsKMB': true,
                                'file': newLines,
                                labelsSeparateLines: false,
                                'labels': ['x'].concat(labels).concat(["span_y2"]),
                                'ylabel': leftAndRight.left,
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                },
                                'y2label': "",
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRange.min, yRange.max],
                                        axisLabelWidth: 80
                                    },
                                    "y2": {
                                        axisLabelFormatter: function(d) {
                                            return '';
                                        },
                                        axisLabelWidth: 80
                                    }
                                }
                                // showRangeSelector: true
                            };
                            $scope.currentChart.updateOptions({
                                'connectSeparatedPoints': connectSeparatedPoints,
                                'pointSize': 3,
                                'legend': 'never',
                                'labelsKMB': true,
                                'file': newLines,
                                labelsSeparateLines: false,
                                'labels': ['x'].concat(labels).concat(["span_y2"]),
                                'ylabel': leftAndRight.left,
                                highlightCircleSize: 2,

                                strokeBorderWidth: 1,
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                },
                                highlightCallback: function(e, x, pts, row, seriesName) {
                                    if($scope.currentView == -1){
                                        // device view is using default legend
                                        return false;
                                    }
                                    var maxWidth = e.target.offsetWidth;
                                    var sn = "";
                                    angular.forEach(series, function(value, name, item) {
                                        if (value.axis === "y1") {
                                            sn = name;
                                        }
                                    });
                                    var point_show = {
                                        x: 0,
                                        y: 0
                                    };
                                    angular.forEach(pts, function(item, index) {
                                        if (item.name === seriesName) {
                                            $scope.legendText = seriesName;
                                            var colorIndex = -1;
                                            //get index from childrenDevices
                                            angular.forEach($scope.childrenDevices, function(device, _index){
                                                if(device.name == seriesName){
                                                    colorIndex = _index;
                                                }
                                            });
                                            $scope.legendColor = $scope.currentChart.user_attrs_.colors[colorIndex];
                                            // $scope.legendText = seriesName +"["+moment(item.xval).format('l HH:mm:ss')+", "+sn+":"+ item.yval+"]";
                                            $scope.legendText_device = seriesName;
                                            if (moment.tz.guess()) {
                                                $scope.legendText_datetime = moment(item.xval).tz(moment.tz.guess()).format('DD/MM/YYYY HH:mm:ss');
                                            } else {
                                                $scope.legendText_datetime = moment(item.xval).format('DD/MM/YYYY HH:mm:ss');
                                            }
                                            $scope.legendText_column = sn;
                                            $scope.legendText_value = item.yval;
                                            angular.forEach(pts, function(point) {
                                                if (point.name === seriesName) {
                                                    point_show.y = point.canvasy + 30;
                                                    point_show.x = point.canvasx + 30;
                                                }
                                            });
                                        }
                                    });
                                    var legendbox = angular.element("#legendbox" + element_id);

                                    $scope.$apply(function() {
                                        $scope.legendTop = point_show.y;
                                        if (maxWidth < (point_show.x + 200)) {
                                            $scope.legendLeft = point_show.x - 200;
                                        } else {
                                            $scope.legendLeft = point_show.x;
                                        }
                                    });

                                },

                                unhighlightCallback: function(e) {
                                    $scope.$apply(function() {
                                        $scope.legendText = null;
                                        $scope.legendText_device = null;
                                        $scope.legendText_datetime = null;
                                        $scope.legendText_column = null;
                                        $scope.legendText_value = null;
                                    });
                                },
                                'y2label': "",
                                'series': series,
                                'colors': colors,
                                'axes': {
                                    'y': {
                                        valueRange: [yRange.min, yRange.max],
                                        axisLabelWidth: 80
                                    },
                                    "y2": {
                                        axisLabelFormatter: function(d) {
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
            var updateDetailChart = function(metadata, store, rangeData, allData) {

                var deviceConfig = metadata.data.groups[1];
                var collections = deviceConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {
                    left: deviceConfig.leftYAxis,
                    right: deviceConfig.rightYAxis
                };
                var allLines = [];
                //0 for y  1 for y2
                var yRanges = [{
                    min: null,
                    max: null
                }, {
                    min: null,
                    max: null
                }];
                angular.forEach(collections, function(collection) {
                    if (collection.name == store) {
                        angular.forEach(allData, function(line) {
                            allLines.push([new Date(line.timestamp)]);
                        });

                        // var yRange = {'min': null, 'max': null};
                        var showY2axis = false;
                        angular.forEach(collection.rows, function(row) {
                            labels.push(row.label);
                            colors.push(row.color);

                            if (row.yaxis == 0) {
                                series[row.label] = {
                                    'axis': 'y1'
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y2'
                                };
                                showY2axis = true;
                                $scope.showY2Btns = true;
                            }
                            var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                            // add value
                            var counter = 0;
                            angular.forEach(allLines, function(realLine) {
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

                        angular.forEach(yRanges, function(yrange) {
                            if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                yrange.min = yrange.min - (yrange.min) * 0.10;
                                yrange.max = yrange.max + (yrange.max) * 0.10;
                            }
                        });

                        if (allLines.length == 0) {
                            $scope.currentChart.updateOptions({
                                'file': [],
                                highlightSeriesOpts: {
                                    strokeWidth: 3,
                                    strokeBorderWidth: 1,
                                    highlightCircleSize: 5
                                },
                            });
                            if ($scope.rangeSelectorBar) {
                                $scope.currentChart["xAxisZoomRange"] = $scope.rangeSelectorBar.xAxisExtremes();
                            }
                            $scope.loadingShow = false;
                        } else {
                            if ($scope.currentChart) {
                                var connectSeparatedPoints = false;
                                if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                                    connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                                }
                                if (showY2axis) {
                                    $scope.currentChartOptions = {
                                        'connectSeparatedPoints': connectSeparatedPoints,
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'legend': 'follow',
                                        labelsSeparateLines: true,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                        'labelsKMB': true,
                                        'file': allLines,
                                        'labels': ['x'].concat(labels),
                                        'ylabel': leftAndRight.left,
                                        'y2label': leftAndRight.right,
                                        'series': series,
                                        'axes': {
                                            'y': {
                                                valueRange: [yRanges[0].min, yRanges[0].max],
                                                axisLabelWidth: 80
                                            },
                                            'y2': {
                                                'labelsKMB': true,
                                                valueRange: [yRanges[1].min, yRanges[1].max],
                                                axisLabelWidth: 80
                                            }
                                        },
                                        'colors': colors
                                        // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    };
                                    $scope.currentChart.updateOptions({
                                        'connectSeparatedPoints': connectSeparatedPoints,
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'legend': 'follow',
                                        labelsSeparateLines: true,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                        'labelsKMB': true,
                                        'file': allLines,
                                        'labels': ['x'].concat(labels),
                                        'ylabel': leftAndRight.left,
                                        'y2label': leftAndRight.right,
                                        'series': series,
                                        'axes': {
                                            'y': {
                                                valueRange: [yRanges[0].min, yRanges[0].max],
                                                axisLabelWidth: 80
                                            },
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
                                    $scope.showY2Btns = false;
                                    angular.copy(allLines, newLines);
                                    angular.forEach(newLines, function(line) {
                                        line.push(null);
                                    });

                                    series["span-Y2"] = {
                                        axis: 'y2'
                                    };
                                    $scope.currentChartOptions = {
                                        'connectSeparatedPoints': connectSeparatedPoints,
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'legend': 'follow',
                                        labelsSeparateLines: true,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                        'labelsKMB': true,
                                        'file': newLines,
                                        'labels': ['x'].concat(labels).concat(['span_y2']),
                                        'ylabel': leftAndRight.left,
                                        'y2label': "",
                                        'series': series,
                                        'axes': {
                                            'y': {
                                                valueRange: [yRanges[0].min, yRanges[0].max],
                                                axisLabelWidth: 80
                                            },
                                            'y2': {
                                                axisLabelFormatter: function(d) {
                                                    return '';
                                                },
                                                axisLabelWidth: 80
                                            }
                                        },
                                        'colors': colors
                                        // 'valueRange': [yRange.min - (Math.abs(yRange.min) * 0.1), yRange.max + (Math.abs(yRange.max) * 0.1)]
                                    };
                                    $scope.currentChart.updateOptions({
                                        'connectSeparatedPoints': connectSeparatedPoints,
                                        'drawGapEdgePoints': true,
                                        'pointSize': 3,
                                        'legend': 'follow',
                                        labelsSeparateLines: true,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                        'labelsKMB': true,
                                        'file': newLines,
                                        'labels': ['x'].concat(labels).concat(['span_y2']),
                                        'ylabel': leftAndRight.left,
                                        'y2label': "",
                                        'series': series,
                                        'axes': {
                                            'y': {
                                                valueRange: [yRanges[0].min, yRanges[0].max],
                                                axisLabelWidth: 80
                                            },
                                            'y2': {
                                                axisLabelFormatter: function(d) {
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

            $scope.autoUpdateChart = updateDetailChart;

            /**
             * update range chart
             * @param metadata
             * @param store
             * @param allData
             */
            var updateChart = function(metadata, store, allData, rangeTree) {
                var deviceConfig = metadata.data.groups[1];
                var collections = deviceConfig.collections;
                var labels = [];
                var series = {};
                var colors = [];
                var leftAndRight = {
                    left: deviceConfig.leftYAxis,
                    right: deviceConfig.rightYAxis
                };
                var allLines = [];
                //0 for y  1 for y2
                var yRanges = [{
                    min: null,
                    max: null
                }, {
                    min: null,
                    max: null
                }];
                angular.forEach(collections, function(collection) {
                    if (collection.name == store) {
                        $scope.currentIntervalName = store;
                        angular.forEach(allData, function(line) {
                            allLines.push([new Date(line.timestamp)]);
                        });

                        $scope.rangeSeriesNumber = collection.rows.length;
                        var showY2axis = false;
                        angular.forEach(collection.rows, function(row) {
                            labels.push(row.label);
                            colors.push(row.color);

                            if (row.yaxis == 0) {
                                series[row.label] = {
                                    'axis': 'y1'
                                };
                            } else {
                                series[row.label] = {
                                    'axis': 'y2'
                                };
                                showY2axis = true;
                                $scope.showY2Btns = true;
                            }

                            var f = new Function("data", "with(data) { if(" + row.value + "!=null)return " + row.value + ";return null;}");
                            // add value
                            var counter = 0;
                            angular.forEach(allLines, function(realLine) {
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
                                var series_range = {
                                    'l0': {
                                        axis: 'y1'
                                    }
                                };
                                if (showY2axis) {
                                    //noinspection JSDuplicatedDeclaration
                                    series_range = {
                                        'l0': {
                                            axis: 'y1'
                                        },
                                        'l0': {
                                            axis: 'y2'
                                        }
                                    };
                                    $scope.rangeSeries = series_range;

                                    $scope.rangeSelectorBar.updateOptions({
                                        'file': allLines,
                                        'labels': ['x'].concat(rangeBarLabels),
                                        'series': series_range,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                    });
                                } else {
                                    series_range["span_y2"] = {
                                        axis: 'y2'
                                    };
                                    $scope.showY2Btns = false;
                                    $scope.rangeSeries = series_range;
                                    var newLines = [];
                                    angular.copy(allLines, newLines);
                                    angular.forEach(newLines, function(line) {
                                        line.push(null);
                                    });
                                    $scope.rangeSelectorBar.updateOptions({
                                        'file': newLines,
                                        'labels': ['x'].concat(rangeBarLabels).concat(['span_y2']),
                                        'series': series_range,
                                        highlightSeriesOpts: {
                                            strokeWidth: 3,
                                            strokeBorderWidth: 1,
                                            highlightCircleSize: 5
                                        },
                                    });
                                    // save
                                }


                            }

                            angular.forEach(yRanges, function(yrange) {
                                if (yrange.min == yrange.max && yrange.min != null && yrange.max != null) {
                                    yrange.min = yrange.min - (yrange.min) * 0.10;
                                    yrange.max = yrange.max + (yrange.max) * 0.10;
                                }
                            });


                            // if graph has 2 yAxis or a yAxis
                            var connectSeparatedPoints = false;
                            if ($scope.basicInfo && $scope.basicInfo.points && $scope.basicInfo.points.connected) {
                                connectSeparatedPoints = true; //'connectSeparatedPoints': connectSeparatedPoints,
                            }

                            if (showY2axis) {
                                $scope.rangeConfig = {
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    labelsSeparateLines: true,
                                    highlightSeriesOpts: {
                                        strokeWidth: 3,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 5
                                    },
                                    'labelsKMB': true,
                                    'file': allLines,
                                    'labels': ['x'].concat(labels),
                                    'ylabel': leftAndRight.left,
                                    'y2label': leftAndRight.right,

                                    'series': series,
                                    'colors': colors,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
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
                                series['span_y2'] = {
                                    axis: 'y2'
                                };
                                $scope.showY2Btns = false;
                                var newLines = [];
                                angular.copy(allLines, newLines);
                                angular.forEach(newLines, function(line) {
                                    line.push(null);
                                });
                                $scope.rangeConfig = {
                                    'connectSeparatedPoints': connectSeparatedPoints,
                                    'drawGapEdgePoints': true,
                                    'pointSize': 3,
                                    'legend': 'follow',
                                    labelsSeparateLines: true,
                                    highlightSeriesOpts: {
                                        strokeWidth: 3,
                                        strokeBorderWidth: 1,
                                        highlightCircleSize: 5
                                    },
                                    'labelsKMB': true,
                                    'file': newLines,
                                    'labels': ['x'].concat(labels).concat(['span_y2']),
                                    'ylabel': leftAndRight.left,
                                    'y2label': "",
                                    'series': series,
                                    'colors': colors,
                                    'axes': {
                                        'y': {
                                            valueRange: [yRanges[0].min, yRanges[0].max],
                                            axisLabelWidth: 80
                                        },
                                        'y2': {
                                            axisLabelFormatter: function(d) {
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
                                $scope.chartDateTime = {
                                    begin: $scope.chartDateTime.begin,
                                    end: $scope.chartDateTime.end
                                };
                                $scope.chartDateWindow = [$scope.chartDateTime.begin, $scope.chartDateTime.end];
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
                                    if ($scope.currentIntervalChoosed && ((allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval) >= allLines[0][0].getTime())) {
                                        $scope.rangeConfig.dateWindow = [new Date(allLines[allLines.length - 1][0].getTime() - $scope.currentIntervalChoosed.interval), allLines[allLines.length - 1][0]];
                                    } else {
                                        $scope.chartDateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                        $scope.rangeConfig.dateWindow = [allLines[0][0], allLines[allLines.length - 1][0]];
                                    }
                                }
                                $scope.currentChart.updateOptions($scope.rangeConfig);
                                $scope.currentChartOptions = $scope.rangeConfig;
                            }
                            //bind
                            $scope.loadingShow = false;
                        }

                    }
                });
            };

            $scope.chartDateTime = {
                begin: null,
                end: null
            };

            // function for show one
            $scope.showOne = function(deviceName) {

                if ($rootScope['standalone'] && $rootScope['standalone'] == true) {
                    return false;
                }

                // device type is
                if ($location.url().indexOf('/app/page/param/') != -1) {
                    //open window
                    $window.open("/admin/#/app/page/param/" + $rootScope.applicationName + "/" + metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1]));
                } else {
                    //open window
                    $window.open("/admin/#" + $location.url().replace("show", "param").replace($location.url().substr($location.url().lastIndexOf('/', $location.url().lastIndexOf('/') - 1) + 1), metadata.data.source.relation_group + "/" + deviceName + "/" + Math.floor($scope.chartDateWindow[0]) + "/" + Math.floor($scope.chartDateWindow[1])));
                }

            };


            var btntimer = null;


            $scope.btnZoomInVLeft = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[0].valueRange;
                yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            $scope.btnZoomOutVLeft = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[0].valueRange;
                yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            $scope.btnZoomInVRight = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[1].valueRange;
                yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            $scope.btnZoomOutVRight = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[1].valueRange;
                yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            $scope.btnPanVULeft = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[0].valueRange;
                yAxes[0]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                yAxes[0]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };


            $scope.btnPanVDLeft = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[0].valueRange;
                yAxes[0]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                yAxes[0]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };


            $scope.btnPanVURight = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[1].valueRange;
                yAxes[1]['valueRange'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                yAxes[1]['valueWindow'] = [range[0] - (range[1] - range[0]) * 0.2, range[1] - (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            $scope.btnPanVDRight = function() {
                var g = $scope.currentChart;
                var yAxes = g.axes_;
                var range = yAxes[1].valueRange;
                yAxes[1]['valueRange'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                yAxes[1]['valueWindow'] = [range[0] + (range[1] - range[0]) * 0.2, range[1] + (range[1] - range[0]) * 0.2];
                g.drawGraph_(false);
            };

            // functions for buttons
            $scope.btnpanleft = function() {
                // get current datetime window
                var g = $scope.currentChart;
                var panRange = g.xAxisZoomRange;
                if (g.xAxisZoomRange[0] instanceof Date) {
                    panRange[0] = g.xAxisZoomRange[0].getTime();
                }
                if (g.xAxisZoomRange[1] instanceof Date) {
                    panRange[1] = g.xAxisZoomRange[1].getTime();
                }

                //split range to 20 pieces
                var pan_delta = (panRange[1] - panRange[0]) / 20;
                var startDate;
                var endDate;
                if ($scope.chartDateWindow[0] instanceof Date) {
                    if (($scope.chartDateWindow[0].getTime() - pan_delta) < panRange[0]) {
                        // go to the left
                        startDate = panRange[0];
                    } else {
                        startDate = $scope.chartDateWindow[0].getTime() - pan_delta;
                    }
                } else {
                    if (($scope.chartDateWindow[0] - pan_delta) < panRange[0]) {
                        // go to the left
                        startDate = panRange[0];
                    } else {
                        startDate = $scope.chartDateWindow[0] - pan_delta;
                    }
                }

                if ($scope.chartDateWindow[1] instanceof Date) {
                    if (($scope.chartDateWindow[1].getTime() - pan_delta) < (panRange[0] + pan_delta)) {
                        // go to the left
                        endDate = panRange[0] + pan_delta;
                    } else {
                        endDate = $scope.chartDateWindow[1].getTime() - pan_delta;
                    }
                } else {
                    if (($scope.chartDateWindow[1] - pan_delta) < (panRange[0] + pan_delta)) {
                        // go to the left
                        endDate = panRange[0] + pan_delta;
                    } else {
                        endDate = $scope.chartDateWindow[1] - pan_delta;
                    }
                }

                //update graph
                $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
                g.updateOptions({
                    dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
                });

                if (btntimer) {
                    $timeout.cancel(btntimer);
                }

                btntimer = $timeout(function() {
                    $scope.chartDateTime = {
                        begin: new Date(new Number(startDate)),
                        end: new Date(new Number(endDate))
                    };
                }, 600);
            };

            $scope.btnpanright = function() {
                // get current datetime window
                var g = $scope.currentChart;
                var panRange = g.xAxisZoomRange;
                if (g.xAxisZoomRange[0] instanceof Date) {
                    panRange[0] = g.xAxisZoomRange[0].getTime();
                }
                if (g.xAxisZoomRange[1] instanceof Date) {
                    panRange[1] = g.xAxisZoomRange[1].getTime();
                }

                //split range to 20 pieces
                var pan_delta = (panRange[1] - panRange[0]) / 20;
                var startDate;
                var endDate;
                if ($scope.chartDateWindow[0] instanceof Date) {
                    if (($scope.chartDateWindow[0].getTime() + pan_delta) < (panRange[1] - pan_delta)) {
                        // go to the left
                        startDate = $scope.chartDateWindow[0].getTime() + pan_delta;
                    } else {
                        startDate = (panRange[1] - pan_delta);
                    }
                } else {
                    if (($scope.chartDateWindow[0] + pan_delta) < (panRange[1] - pan_delta)) {
                        // go to the left
                        startDate = ($scope.chartDateWindow[0] + pan_delta);
                    } else {
                        startDate = (panRange[1] - pan_delta);
                    }
                }

                if ($scope.chartDateWindow[1] instanceof Date) {
                    if (($scope.chartDateWindow[1].getTime() + pan_delta) < panRange[1]) {
                        // go to the left
                        endDate = ($scope.chartDateWindow[1].getTime() + pan_delta);
                    } else {
                        endDate = panRange[1];
                    }
                } else {
                    if (($scope.chartDateWindow[1] + pan_delta) < panRange[1]) {
                        // go to the left
                        endDate = ($scope.chartDateWindow[1] + pan_delta);
                    } else {
                        endDate = panRange[1];
                    }
                }

                //update graph
                $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
                g.updateOptions({
                    dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
                });

                if (btntimer) {
                    $timeout.cancel(btntimer);
                }

                btntimer = $timeout(function() {
                    $scope.chartDateTime = {
                        begin: new Date(new Number(startDate)),
                        end: new Date(new Number(endDate))
                    };
                }, 600);
            };


            $scope.btnzoomin = function() {
                // get current datetime window
                var g = $scope.currentChart;
                //split range to 20 pieces
                var startDate;
                var endDate;

                var rangeStart = $scope.chartDateWindow[0];
                if ($scope.chartDateWindow[0] instanceof Date) {
                    rangeStart = $scope.chartDateWindow[0].getTime();
                }
                var rangeEnd = $scope.chartDateWindow[1];
                if ($scope.chartDateWindow[1] instanceof Date) {
                    rangeEnd = $scope.chartDateWindow[1].getTime();
                }

                var delta = (rangeEnd - rangeStart) / 20;

                startDate = rangeStart + (delta * 2);
                endDate = rangeEnd - (delta * 2);
                //update graph
                $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
                //
                g.updateOptions({
                    dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
                });

                if (btntimer) {
                    $timeout.cancel(btntimer);
                }

                btntimer = $timeout(function() {
                    $scope.chartDateTime = {
                        begin: new Date(new Number(startDate)),
                        end: new Date(new Number(endDate))
                    };
                }, 600);
            };

            $scope.btnzoomout = function() {
                // get current datetime window
                var g = $scope.currentChart;
                var panRange = g.xAxisZoomRange;
                if (g.xAxisZoomRange[0] instanceof Date) {
                    panRange[0] = g.xAxisZoomRange[0].getTime();
                }
                if (g.xAxisZoomRange[1] instanceof Date) {
                    panRange[1] = g.xAxisZoomRange[1].getTime();
                }
                //split range to 20 pieces
                var startDate;
                var endDate;

                var rangeStart = $scope.chartDateWindow[0];
                if ($scope.chartDateWindow[0] instanceof Date) {
                    rangeStart = $scope.chartDateWindow[0].getTime();
                }
                var rangeEnd = $scope.chartDateWindow[1];
                if ($scope.chartDateWindow[1] instanceof Date) {
                    rangeEnd = $scope.chartDateWindow[1].getTime();
                }

                var delta = (rangeEnd - rangeStart) / 20;

                if ((rangeStart - (delta * 2)) > panRange[0]) {
                    startDate = rangeStart - (delta * 2);
                } else {
                    startDate = panRange[0];
                }

                if ((rangeEnd + (delta * 2)) < panRange[1]) {
                    endDate = rangeEnd + (delta * 2);
                } else {
                    endDate = panRange[1];
                }

                //update graph
                $scope.chartDateWindow = [new Date(new Number(startDate)), new Date(new Number(endDate))];
                g.updateOptions({
                    dateWindow: [new Date(new Number(startDate)), new Date(new Number(endDate))]
                });

                if (btntimer) {
                    $timeout.cancel(btntimer);
                }

                btntimer = $timeout(function() {
                    $scope.chartDateTime = {
                        begin: new Date(new Number(startDate)),
                        end: new Date(new Number(endDate))
                    };
                }, 600);
            };


            var timer = null;
            $scope.refersh = function(g, init) {
                if (timer) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function() {
                    if (init || g.xAxisRange()[0] != $scope.chartDateTime.begin || g.xAxisRange()[1] != $scope.chartDateTime.end) {
                        $scope.chartDateTime = {
                            begin: g.xAxisRange()[0],
                            end: g.xAxisRange()[1]
                        };
                        $scope.chartDateWindow = g.xAxisRange();
                    }
                }, 600);
            };
        }

    }


    static
    buildFactory($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile) {
        fgpWidgetGraph.instance = new fgpWidgetGraph($timeout, dataService, $rootScope, $interval, $filter, $location, $stateParams, $compile);
        return fgpWidgetGraph.instance;
    }

}

fgpWidgetGraph
    .$inject = ['$timeout', 'dataService', '$rootScope', '$interval', '$filter', '$location', '$stateParams', '$compile'];

export {
    fgpWidgetGraph
    as
    default
}
