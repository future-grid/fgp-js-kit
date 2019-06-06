(function(con) {
    "use strict";
    var prop, method;
    var empty = {};
    var dummy = function() {};
    var properties = "memory".split(",");
    var methods = ("assert,clear,count,debug,dir,dirxml,error,exception,group," + "groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd," + "show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn").split(",");
    while (prop = properties.pop()) con[prop] = con[prop] || empty;
    while (method = methods.pop()) con[method] = con[method] || dummy;
})(this.console = this.console || {});

(function() {
    "use strict";
    CanvasRenderingContext2D.prototype.installPattern = function(pattern) {
        if (typeof this.isPatternInstalled !== "undefined") {
            throw "Must un-install old line pattern before installing a new one.";
        }
        this.isPatternInstalled = true;
        var dashedLineToHistory = [ 0, 0 ];
        var segments = [];
        var realBeginPath = this.beginPath;
        var realLineTo = this.lineTo;
        var realMoveTo = this.moveTo;
        var realStroke = this.stroke;
        this.uninstallPattern = function() {
            this.beginPath = realBeginPath;
            this.lineTo = realLineTo;
            this.moveTo = realMoveTo;
            this.stroke = realStroke;
            this.uninstallPattern = undefined;
            this.isPatternInstalled = undefined;
        };
        this.beginPath = function() {
            segments = [];
            realBeginPath.call(this);
        };
        this.moveTo = function(x, y) {
            segments.push([ [ x, y ] ]);
            realMoveTo.call(this, x, y);
        };
        this.lineTo = function(x, y) {
            var last = segments[segments.length - 1];
            last.push([ x, y ]);
        };
        this.stroke = function() {
            var this$1 = this;

            if (segments.length === 0) {
                realStroke.call(this);
                return;
            }
            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                var x1 = seg[0][0], y1 = seg[0][1];
                for (var j = 1; j < seg.length; j++) {
                    var x2 = seg[j][0], y2 = seg[j][1];
                    this$1.save();
                    var dx = x2 - x1;
                    var dy = y2 - y1;
                    var len = Math.sqrt(dx * dx + dy * dy);
                    var rot = Math.atan2(dy, dx);
                    this$1.translate(x1, y1);
                    realMoveTo.call(this$1, 0, 0);
                    this$1.rotate(rot);
                    var patternIndex = dashedLineToHistory[0];
                    var x = 0;
                    while (len > x) {
                        var segment = pattern[patternIndex];
                        if (dashedLineToHistory[1]) {
                            x += dashedLineToHistory[1];
                        } else {
                            x += segment;
                        }
                        if (x > len) {
                            dashedLineToHistory = [ patternIndex, x - len ];
                            x = len;
                        } else {
                            dashedLineToHistory = [ (patternIndex + 1) % pattern.length, 0 ];
                        }
                        if (patternIndex % 2 === 0) {
                            realLineTo.call(this$1, x, 0);
                        } else {
                            realMoveTo.call(this$1, x, 0);
                        }
                        patternIndex = (patternIndex + 1) % pattern.length;
                    }
                    this$1.restore();
                    x1 = x2;
                    y1 = y2;
                }
            }
            realStroke.call(this);
            segments = [];
        };
    };
    CanvasRenderingContext2D.prototype.uninstallPattern = function() {
        throw "Must install a line pattern before uninstalling it.";
    };
})();

var DygraphOptions = function() {
    if (typeof DEBUG === "undefined") DEBUG = false;
    return function() {
        "use strict";
        var DygraphOptions = function(dygraph) {
            this.dygraph_ = dygraph;
            this.yAxes_ = [];
            this.xAxis_ = {};
            this.series_ = {};
            this.global_ = this.dygraph_.attrs_;
            this.user_ = this.dygraph_.user_attrs_ || {};
            this.labels_ = [];
            this.highlightSeries_ = this.get("highlightSeriesOpts") || {};
            this.reparseSeries();
        };
        DygraphOptions.AXIS_STRING_MAPPINGS_ = {
            y: 0,
            Y: 0,
            y1: 0,
            Y1: 0,
            y2: 1,
            Y2: 1
        };
        DygraphOptions.axisToIndex_ = function(axis) {
            if (typeof axis == "string") {
                if (DygraphOptions.AXIS_STRING_MAPPINGS_.hasOwnProperty(axis)) {
                    return DygraphOptions.AXIS_STRING_MAPPINGS_[axis];
                }
                throw "Unknown axis : " + axis;
            }
            if (typeof axis == "number") {
                if (axis === 0 || axis === 1) {
                    return axis;
                }
                throw "Dygraphs only supports two y-axes, indexed from 0-1.";
            }
            if (axis) {
                throw "Unknown axis : " + axis;
            }
            return 0;
        };
        DygraphOptions.prototype.reparseSeries = function() {
            var this$1 = this;

            var labels = this.get("labels");
            if (!labels) {
                return;
            }
            this.labels_ = labels.slice(1);
            this.yAxes_ = [ {
                series: [],
                options: {}
            } ];
            this.xAxis_ = {
                options: {}
            };
            this.series_ = {};
            var oldStyleSeries = !this.user_["series"];
            if (oldStyleSeries) {
                var axisId = 0;
                for (var idx = 0; idx < this.labels_.length; idx++) {
                    var seriesName = this$1.labels_[idx];
                    var optionsForSeries = this$1.user_[seriesName] || {};
                    var yAxis = 0;
                    var axis = optionsForSeries["axis"];
                    if (typeof axis == "object") {
                        yAxis = ++axisId;
                        this$1.yAxes_[yAxis] = {
                            series: [ seriesName ],
                            options: axis
                        };
                    }
                    if (!axis) {
                        this$1.yAxes_[0].series.push(seriesName);
                    }
                    this$1.series_[seriesName] = {
                        idx: idx,
                        yAxis: yAxis,
                        options: optionsForSeries
                    };
                }
                for (var idx = 0; idx < this.labels_.length; idx++) {
                    var seriesName = this$1.labels_[idx];
                    var optionsForSeries = this$1.series_[seriesName]["options"];
                    var axis = optionsForSeries["axis"];
                    if (typeof axis == "string") {
                        if (!this$1.series_.hasOwnProperty(axis)) {
                            console.error("Series " + seriesName + " wants to share a y-axis with " + "series " + axis + ", which does not define its own axis.");
                            return;
                        }
                        var yAxis = this$1.series_[axis].yAxis;
                        this$1.series_[seriesName].yAxis = yAxis;
                        this$1.yAxes_[yAxis].series.push(seriesName);
                    }
                }
            } else {
                for (var idx = 0; idx < this.labels_.length; idx++) {
                    var seriesName = this$1.labels_[idx];
                    var optionsForSeries = this$1.user_.series[seriesName] || {};
                    var yAxis = DygraphOptions.axisToIndex_(optionsForSeries["axis"]);
                    this$1.series_[seriesName] = {
                        idx: idx,
                        yAxis: yAxis,
                        options: optionsForSeries
                    };
                    if (!this$1.yAxes_[yAxis]) {
                        this$1.yAxes_[yAxis] = {
                            series: [ seriesName ],
                            options: {}
                        };
                    } else {
                        this$1.yAxes_[yAxis].series.push(seriesName);
                    }
                }
            }
            var axis_opts = this.user_["axes"] || {};
            Dygraph.update(this.yAxes_[0].options, axis_opts["y"] || {});
            if (this.yAxes_.length > 1) {
                Dygraph.update(this.yAxes_[1].options, axis_opts["y2"] || {});
            }
            Dygraph.update(this.xAxis_.options, axis_opts["x"] || {});
            if (DEBUG) this.validateOptions_();
        };
        DygraphOptions.prototype.get = function(name) {
            var result = this.getGlobalUser_(name);
            if (result !== null) {
                return result;
            }
            return this.getGlobalDefault_(name);
        };
        DygraphOptions.prototype.getGlobalUser_ = function(name) {
            if (this.user_.hasOwnProperty(name)) {
                return this.user_[name];
            }
            return null;
        };
        DygraphOptions.prototype.getGlobalDefault_ = function(name) {
            if (this.global_.hasOwnProperty(name)) {
                return this.global_[name];
            }
            if (Dygraph.DEFAULT_ATTRS.hasOwnProperty(name)) {
                return Dygraph.DEFAULT_ATTRS[name];
            }
            return null;
        };
        DygraphOptions.prototype.getForAxis = function(name, axis) {
            var axisIdx;
            var axisString;
            if (typeof axis == "number") {
                axisIdx = axis;
                axisString = axisIdx === 0 ? "y" : "y2";
            } else {
                if (axis == "y1") {
                    axis = "y";
                }
                if (axis == "y") {
                    axisIdx = 0;
                } else if (axis == "y2") {
                    axisIdx = 1;
                } else if (axis == "x") {
                    axisIdx = -1;
                } else {
                    throw "Unknown axis " + axis;
                }
                axisString = axis;
            }
            var userAxis = axisIdx == -1 ? this.xAxis_ : this.yAxes_[axisIdx];
            if (userAxis) {
                var axisOptions = userAxis.options;
                if (axisOptions.hasOwnProperty(name)) {
                    return axisOptions[name];
                }
            }
            if (!(axis === "x" && name === "logscale")) {
                var result = this.getGlobalUser_(name);
                if (result !== null) {
                    return result;
                }
            }
            var defaultAxisOptions = Dygraph.DEFAULT_ATTRS.axes[axisString];
            if (defaultAxisOptions.hasOwnProperty(name)) {
                return defaultAxisOptions[name];
            }
            return this.getGlobalDefault_(name);
        };
        DygraphOptions.prototype.getForSeries = function(name, series) {
            if (series === this.dygraph_.getHighlightSeries()) {
                if (this.highlightSeries_.hasOwnProperty(name)) {
                    return this.highlightSeries_[name];
                }
            }
            if (!this.series_.hasOwnProperty(series)) {
                throw "Unknown series: " + series;
            }
            var seriesObj = this.series_[series];
            var seriesOptions = seriesObj["options"];
            if (seriesOptions.hasOwnProperty(name)) {
                return seriesOptions[name];
            }
            return this.getForAxis(name, seriesObj["yAxis"]);
        };
        DygraphOptions.prototype.numAxes = function() {
            return this.yAxes_.length;
        };
        DygraphOptions.prototype.axisForSeries = function(series) {
            return this.series_[series].yAxis;
        };
        DygraphOptions.prototype.axisOptions = function(yAxis) {
            return this.yAxes_[yAxis].options;
        };
        DygraphOptions.prototype.seriesForAxis = function(yAxis) {
            return this.yAxes_[yAxis].series;
        };
        DygraphOptions.prototype.seriesNames = function() {
            return this.labels_;
        };
        if (DEBUG) {
            DygraphOptions.prototype.validateOptions_ = function() {
                var this$1 = this;

                if (typeof Dygraph.OPTIONS_REFERENCE === "undefined") {
                    throw "Called validateOptions_ in prod build.";
                }
                var that = this;
                var validateOption = function(optionName) {
                    if (!Dygraph.OPTIONS_REFERENCE[optionName]) {
                        that.warnInvalidOption_(optionName);
                    }
                };
                var optionsDicts = [ this.xAxis_.options, this.yAxes_[0].options, this.yAxes_[1] && this.yAxes_[1].options, this.global_, this.user_, this.highlightSeries_ ];
                var names = this.seriesNames();
                for (var i = 0; i < names.length; i++) {
                    var name = names[i];
                    if (this$1.series_.hasOwnProperty(name)) {
                        optionsDicts.push(this$1.series_[name].options);
                    }
                }
                for (var i = 0; i < optionsDicts.length; i++) {
                    var dict = optionsDicts[i];
                    if (!dict) continue;
                    for (var optionName in dict) {
                        if (dict.hasOwnProperty(optionName)) {
                            validateOption(optionName);
                        }
                    }
                }
            };
            var WARNINGS = {};
            DygraphOptions.prototype.warnInvalidOption_ = function(optionName) {
                if (!WARNINGS[optionName]) {
                    WARNINGS[optionName] = true;
                    var isSeries = this.labels_.indexOf(optionName) >= 0;
                    if (isSeries) {
                        console.warn("Use new-style per-series options (saw " + optionName + " as top-level options key). See http://bit.ly/1tceaJs");
                    } else {
                        console.warn("Unknown option " + optionName + " (full list of options at dygraphs.com/options.html");
                        throw "invalid option " + optionName;
                    }
                }
            };
            DygraphOptions.resetWarnings_ = function() {
                WARNINGS = {};
            };
        }
        return DygraphOptions;
    }();
}();

var DygraphLayout = function() {
    "use strict";
    var DygraphLayout = function(dygraph) {
        this.dygraph_ = dygraph;
        this.points = [];
        this.setNames = [];
        this.annotations = [];
        this.yAxes_ = null;
        this.xTicks_ = null;
        this.yTicks_ = null;
    };
    DygraphLayout.prototype.addDataset = function(setname, set_xy) {
        this.points.push(set_xy);
        this.setNames.push(setname);
    };
    DygraphLayout.prototype.getPlotArea = function() {
        return this.area_;
    };
    DygraphLayout.prototype.computePlotArea = function() {
        var area = {
            x: 0,
            y: 0
        };
        area.w = this.dygraph_.width_ - area.x - this.dygraph_.getOption("rightGap");
        area.h = this.dygraph_.height_;
        var e = {
            chart_div: this.dygraph_.graphDiv,
            reserveSpaceLeft: function(px) {
                var r = {
                    x: area.x,
                    y: area.y,
                    w: px,
                    h: area.h
                };
                area.x += px;
                area.w -= px;
                return r;
            },
            reserveSpaceRight: function(px) {
                var r = {
                    x: area.x + area.w - px,
                    y: area.y,
                    w: px,
                    h: area.h
                };
                area.w -= px;
                return r;
            },
            reserveSpaceTop: function(px) {
                var r = {
                    x: area.x,
                    y: area.y,
                    w: area.w,
                    h: px
                };
                area.y += px;
                area.h -= px;
                return r;
            },
            reserveSpaceBottom: function(px) {
                var r = {
                    x: area.x,
                    y: area.y + area.h - px,
                    w: area.w,
                    h: px
                };
                area.h -= px;
                return r;
            },
            chartRect: function() {
                return {
                    x: area.x,
                    y: area.y,
                    w: area.w,
                    h: area.h
                };
            }
        };
        this.dygraph_.cascadeEvents_("layout", e);
        this.area_ = area;
    };
    DygraphLayout.prototype.setAnnotations = function(ann) {
        var this$1 = this;

        this.annotations = [];
        var parse = this.dygraph_.getOption("xValueParser") || function(x) {
            return x;
        };
        for (var i = 0; i < ann.length; i++) {
            var a = {};
            if (!ann[i].xval && ann[i].x === undefined) {
                console.error("Annotations must have an 'x' property");
                return;
            }
            if (ann[i].icon && !(ann[i].hasOwnProperty("width") && ann[i].hasOwnProperty("height"))) {
                console.error("Must set width and height when setting " + "annotation.icon property");
                return;
            }
            Dygraph.update(a, ann[i]);
            if (!a.xval) a.xval = parse(a.x);
            this$1.annotations.push(a);
        }
    };
    DygraphLayout.prototype.setXTicks = function(xTicks) {
        this.xTicks_ = xTicks;
    };
    DygraphLayout.prototype.setYAxes = function(yAxes) {
        this.yAxes_ = yAxes;
    };
    DygraphLayout.prototype.evaluate = function() {
        this._xAxis = {};
        this._evaluateLimits();
        this._evaluateLineCharts();
        this._evaluateLineTicks();
        this._evaluateAnnotations();
    };
    DygraphLayout.prototype._evaluateLimits = function() {
        var this$1 = this;

        var xlimits = this.dygraph_.xAxisRange();
        this._xAxis.minval = xlimits[0];
        this._xAxis.maxval = xlimits[1];
        var xrange = xlimits[1] - xlimits[0];
        this._xAxis.scale = xrange !== 0 ? 1 / xrange : 1;
        if (this.dygraph_.getOptionForAxis("logscale", "x")) {
            this._xAxis.xlogrange = Dygraph.log10(this._xAxis.maxval) - Dygraph.log10(this._xAxis.minval);
            this._xAxis.xlogscale = this._xAxis.xlogrange !== 0 ? 1 / this._xAxis.xlogrange : 1;
        }
        for (var i = 0; i < this.yAxes_.length; i++) {
            var axis = this$1.yAxes_[i];
            axis.minyval = axis.computedValueRange[0];
            axis.maxyval = axis.computedValueRange[1];
            axis.yrange = axis.maxyval - axis.minyval;
            axis.yscale = axis.yrange !== 0 ? 1 / axis.yrange : 1;
            if (this$1.dygraph_.getOption("logscale")) {
                axis.ylogrange = Dygraph.log10(axis.maxyval) - Dygraph.log10(axis.minyval);
                axis.ylogscale = axis.ylogrange !== 0 ? 1 / axis.ylogrange : 1;
                if (!isFinite(axis.ylogrange) || isNaN(axis.ylogrange)) {
                    console.error("axis " + i + " of graph at " + axis.g + " can't be displayed in log scale for range [" + axis.minyval + " - " + axis.maxyval + "]");
                }
            }
        }
    };
    DygraphLayout.calcXNormal_ = function(value, xAxis, logscale) {
        if (logscale) {
            return (Dygraph.log10(value) - Dygraph.log10(xAxis.minval)) * xAxis.xlogscale;
        } else {
            return (value - xAxis.minval) * xAxis.scale;
        }
    };
    DygraphLayout.calcYNormal_ = function(axis, value, logscale) {
        if (logscale) {
            var x = 1 - (Dygraph.log10(value) - Dygraph.log10(axis.minyval)) * axis.ylogscale;
            return isFinite(x) ? x : NaN;
        } else {
            return 1 - (value - axis.minyval) * axis.yscale;
        }
    };
    DygraphLayout.prototype._evaluateLineCharts = function() {
        var this$1 = this;

        var isStacked = this.dygraph_.getOption("stackedGraph");
        var isLogscaleForX = this.dygraph_.getOptionForAxis("logscale", "x");
        for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
            var points = this$1.points[setIdx];
            var setName = this$1.setNames[setIdx];
            var connectSeparated = this$1.dygraph_.getOption("connectSeparatedPoints", setName);
            var axis = this$1.dygraph_.axisPropertiesForSeries(setName);
            var logscale = this$1.dygraph_.attributes_.getForSeries("logscale", setName);
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                point.x = DygraphLayout.calcXNormal_(point.xval, this$1._xAxis, isLogscaleForX);
                var yval = point.yval;
                if (isStacked) {
                    point.y_stacked = DygraphLayout.calcYNormal_(axis, point.yval_stacked, logscale);
                    if (yval !== null && !isNaN(yval)) {
                        yval = point.yval_stacked;
                    }
                }
                if (yval === null) {
                    yval = NaN;
                    if (!connectSeparated) {
                        point.yval = NaN;
                    }
                }
                point.y = DygraphLayout.calcYNormal_(axis, yval, logscale);
            }
            this$1.dygraph_.dataHandler_.onLineEvaluated(points, axis, logscale);
        }
    };
    DygraphLayout.prototype._evaluateLineTicks = function() {
        var this$1 = this;

        var i, tick, label, pos;
        this.xticks = [];
        for (i = 0; i < this.xTicks_.length; i++) {
            tick = this$1.xTicks_[i];
            label = tick.label;
            pos = this$1.dygraph_.toPercentXCoord(tick.v);
            if (pos >= 0 && pos < 1) {
                this$1.xticks.push([ pos, label ]);
            }
        }
        this.yticks = [];
        for (i = 0; i < this.yAxes_.length; i++) {
            var axis = this$1.yAxes_[i];
            for (var j = 0; j < axis.ticks.length; j++) {
                tick = axis.ticks[j];
                label = tick.label;
                pos = this$1.dygraph_.toPercentYCoord(tick.v, i);
                if (pos > 0 && pos <= 1) {
                    this$1.yticks.push([ i, pos, label ]);
                }
            }
        }
    };
    DygraphLayout.prototype._evaluateAnnotations = function() {
        var this$1 = this;

        var i;
        var annotations = {};
        for (i = 0; i < this.annotations.length; i++) {
            var a = this$1.annotations[i];
            annotations[a.xval + "," + a.series] = a;
        }
        this.annotated_points = [];
        if (!this.annotations || !this.annotations.length) {
            return;
        }
        for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
            var points = this$1.points[setIdx];
            for (i = 0; i < points.length; i++) {
                var p = points[i];
                var k = p.xval + "," + p.name;
                if (k in annotations) {
                    p.annotation = annotations[k];
                    this$1.annotated_points.push(p);
                }
            }
        }
    };
    DygraphLayout.prototype.removeAllDatasets = function() {
        delete this.points;
        delete this.setNames;
        delete this.setPointsLengths;
        delete this.setPointsOffsets;
        this.points = [];
        this.setNames = [];
        this.setPointsLengths = [];
        this.setPointsOffsets = [];
    };
    return DygraphLayout;
}();

var DygraphCanvasRenderer = function() {
    "use strict";
    var DygraphCanvasRenderer = function(dygraph, element, elementContext, layout) {
        this.dygraph_ = dygraph;
        this.layout = layout;
        this.element = element;
        this.elementContext = elementContext;
        this.height = dygraph.height_;
        this.width = dygraph.width_;
        if (!this.isIE && !Dygraph.isCanvasSupported(this.element)) throw "Canvas is not supported.";
        this.area = layout.getPlotArea();
        if (this.dygraph_.isUsingExcanvas_) {
            this._createIEClipArea();
        } else {
            if (!Dygraph.isAndroid()) {
                var ctx = this.dygraph_.canvas_ctx_;
                ctx.beginPath();
                ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
                ctx.clip();
                ctx = this.dygraph_.hidden_ctx_;
                ctx.beginPath();
                ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
                ctx.clip();
            }
        }
    };
    DygraphCanvasRenderer.prototype.clear = function() {
        var context;
        if (this.isIE) {
            try {
                if (this.clearDelay) {
                    this.clearDelay.cancel();
                    this.clearDelay = null;
                }
                context = this.elementContext;
            } catch (e) {
                return;
            }
        }
        context = this.elementContext;
        context.clearRect(0, 0, this.width, this.height);
    };
    DygraphCanvasRenderer.prototype.render = function() {
        this._updatePoints();
        this._renderLineChart();
    };
    DygraphCanvasRenderer.prototype._createIEClipArea = function() {
        var className = "dygraph-clip-div";
        var graphDiv = this.dygraph_.graphDiv;
        for (var i = graphDiv.childNodes.length - 1; i >= 0; i--) {
            if (graphDiv.childNodes[i].className == className) {
                graphDiv.removeChild(graphDiv.childNodes[i]);
            }
        }
        var backgroundColor = document.bgColor;
        var element = this.dygraph_.graphDiv;
        while (element != document) {
            var bgcolor = element.currentStyle.backgroundColor;
            if (bgcolor && bgcolor != "transparent") {
                backgroundColor = bgcolor;
                break;
            }
            element = element.parentNode;
        }
        function createClipDiv(area) {
            if (area.w === 0 || area.h === 0) {
                return;
            }
            var elem = document.createElement("div");
            elem.className = className;
            elem.style.backgroundColor = backgroundColor;
            elem.style.position = "absolute";
            elem.style.left = area.x + "px";
            elem.style.top = area.y + "px";
            elem.style.width = area.w + "px";
            elem.style.height = area.h + "px";
            graphDiv.appendChild(elem);
        }
        var plotArea = this.area;
        createClipDiv({
            x: 0,
            y: 0,
            w: plotArea.x,
            h: this.height
        });
        createClipDiv({
            x: plotArea.x,
            y: 0,
            w: this.width - plotArea.x,
            h: plotArea.y
        });
        createClipDiv({
            x: plotArea.x + plotArea.w,
            y: 0,
            w: this.width - plotArea.x - plotArea.w,
            h: this.height
        });
        createClipDiv({
            x: plotArea.x,
            y: plotArea.y + plotArea.h,
            w: this.width - plotArea.x,
            h: this.height - plotArea.h - plotArea.y
        });
    };
    DygraphCanvasRenderer._getIteratorPredicate = function(connectSeparatedPoints) {
        return connectSeparatedPoints ? DygraphCanvasRenderer._predicateThatSkipsEmptyPoints : null;
    };
    DygraphCanvasRenderer._predicateThatSkipsEmptyPoints = function(array, idx) {
        return array[idx].yval !== null;
    };
    DygraphCanvasRenderer._drawStyledLine = function(e, color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize) {
        var g = e.dygraph;
        var stepPlot = g.getBooleanOption("stepPlot", e.setName);
        if (!Dygraph.isArrayLike(strokePattern)) {
            strokePattern = null;
        }
        var drawGapPoints = g.getBooleanOption("drawGapEdgePoints", e.setName);
        var points = e.points;
        var setName = e.setName;
        var iter = Dygraph.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
        var stroking = strokePattern && strokePattern.length >= 2;
        var ctx = e.drawingContext;
        ctx.save();
        if (stroking) {
            ctx.installPattern(strokePattern);
        }
        var pointsOnLine = DygraphCanvasRenderer._drawSeries(e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color);
        DygraphCanvasRenderer._drawPointsOnLine(e, pointsOnLine, drawPointCallback, color, pointSize);
        if (stroking) {
            ctx.uninstallPattern();
        }
        ctx.restore();
    };
    DygraphCanvasRenderer._drawSeries = function(e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color) {
        var prevCanvasX = null;
        var prevCanvasY = null;
        var nextCanvasY = null;
        var isIsolated;
        var point;
        var pointsOnLine = [];
        var first = true;
        var ctx = e.drawingContext;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        var arr = iter.array_;
        var limit = iter.end_;
        var predicate = iter.predicate_;
        for (var i = iter.start_; i < limit; i++) {
            point = arr[i];
            if (predicate) {
                while (i < limit && !predicate(arr, i)) {
                    i++;
                }
                if (i == limit) break;
                point = arr[i];
            }
            if (point.canvasy === null || point.canvasy != point.canvasy) {
                if (stepPlot && prevCanvasX !== null) {
                    ctx.moveTo(prevCanvasX, prevCanvasY);
                    ctx.lineTo(point.canvasx, prevCanvasY);
                }
                prevCanvasX = prevCanvasY = null;
            } else {
                isIsolated = false;
                if (drawGapPoints || !prevCanvasX) {
                    iter.nextIdx_ = i;
                    iter.next();
                    nextCanvasY = iter.hasNext ? iter.peek.canvasy : null;
                    var isNextCanvasYNullOrNaN = nextCanvasY === null || nextCanvasY != nextCanvasY;
                    isIsolated = !prevCanvasX && isNextCanvasYNullOrNaN;
                    if (drawGapPoints) {
                        if (!first && !prevCanvasX || iter.hasNext && isNextCanvasYNullOrNaN) {
                            isIsolated = true;
                        }
                    }
                }
                if (prevCanvasX !== null) {
                    if (strokeWidth) {
                        if (stepPlot) {
                            ctx.moveTo(prevCanvasX, prevCanvasY);
                            ctx.lineTo(point.canvasx, prevCanvasY);
                        }
                        ctx.lineTo(point.canvasx, point.canvasy);
                    }
                } else {
                    ctx.moveTo(point.canvasx, point.canvasy);
                }
                if (drawPoints || isIsolated) {
                    pointsOnLine.push([ point.canvasx, point.canvasy, point.idx ]);
                }
                prevCanvasX = point.canvasx;
                prevCanvasY = point.canvasy;
            }
            first = false;
        }
        ctx.stroke();
        return pointsOnLine;
    };
    DygraphCanvasRenderer._drawPointsOnLine = function(e, pointsOnLine, drawPointCallback, color, pointSize) {
        var ctx = e.drawingContext;
        for (var idx = 0; idx < pointsOnLine.length; idx++) {
            var cb = pointsOnLine[idx];
            ctx.save();
            drawPointCallback.call(e.dygraph, e.dygraph, e.setName, ctx, cb[0], cb[1], color, pointSize, cb[2]);
            ctx.restore();
        }
    };
    DygraphCanvasRenderer.prototype._updatePoints = function() {
        var this$1 = this;

        var sets = this.layout.points;
        for (var i = sets.length; i--; ) {
            var points = sets[i];
            for (var j = points.length; j--; ) {
                var point = points[j];
                point.canvasx = this$1.area.w * point.x + this$1.area.x;
                point.canvasy = this$1.area.h * point.y + this$1.area.y;
            }
        }
    };
    DygraphCanvasRenderer.prototype._renderLineChart = function(opt_seriesName, opt_ctx) {
        var this$1 = this;

        var ctx = opt_ctx || this.elementContext;
        var i;
        var sets = this.layout.points;
        var setNames = this.layout.setNames;
        var setName;
        this.colors = this.dygraph_.colorsMap_;
        var plotter_attr = this.dygraph_.getOption("plotter");
        var plotters = plotter_attr;
        if (!Dygraph.isArrayLike(plotters)) {
            plotters = [ plotters ];
        }
        var setPlotters = {};
        for (i = 0; i < setNames.length; i++) {
            setName = setNames[i];
            var setPlotter = this$1.dygraph_.getOption("plotter", setName);
            if (setPlotter == plotter_attr) continue;
            setPlotters[setName] = setPlotter;
        }
        for (i = 0; i < plotters.length; i++) {
            var plotter = plotters[i];
            var is_last = i == plotters.length - 1;
            for (var j = 0; j < sets.length; j++) {
                setName = setNames[j];
                if (opt_seriesName && setName != opt_seriesName) continue;
                var points = sets[j];
                var p = plotter;
                if (setName in setPlotters) {
                    if (is_last) {
                        p = setPlotters[setName];
                    } else {
                        continue;
                    }
                }
                var color = this$1.colors[setName];
                var strokeWidth = this$1.dygraph_.getOption("strokeWidth", setName);
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeWidth;
                p({
                    points: points,
                    setName: setName,
                    drawingContext: ctx,
                    color: color,
                    strokeWidth: strokeWidth,
                    dygraph: this$1.dygraph_,
                    axis: this$1.dygraph_.axisPropertiesForSeries(setName),
                    plotArea: this$1.area,
                    seriesIndex: j,
                    seriesCount: sets.length,
                    singleSeriesName: opt_seriesName,
                    allSeriesPoints: sets
                });
                ctx.restore();
            }
        }
    };
    DygraphCanvasRenderer._Plotters = {
        linePlotter: function(e) {
            DygraphCanvasRenderer._linePlotter(e);
        },
        fillPlotter: function(e) {
            DygraphCanvasRenderer._fillPlotter(e);
        },
        errorPlotter: function(e) {
            DygraphCanvasRenderer._errorPlotter(e);
        }
    };
    DygraphCanvasRenderer._linePlotter = function(e) {
        var g = e.dygraph;
        var setName = e.setName;
        var strokeWidth = e.strokeWidth;
        var borderWidth = g.getNumericOption("strokeBorderWidth", setName);
        var drawPointCallback = g.getOption("drawPointCallback", setName) || Dygraph.Circles.DEFAULT;
        var strokePattern = g.getOption("strokePattern", setName);
        var drawPoints = g.getBooleanOption("drawPoints", setName);
        var pointSize = g.getNumericOption("pointSize", setName);
        if (borderWidth && strokeWidth) {
            DygraphCanvasRenderer._drawStyledLine(e, g.getOption("strokeBorderColor", setName), strokeWidth + 2 * borderWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
        }
        DygraphCanvasRenderer._drawStyledLine(e, e.color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
    };
    DygraphCanvasRenderer._errorPlotter = function(e) {
        var g = e.dygraph;
        var setName = e.setName;
        var errorBars = g.getBooleanOption("errorBars") || g.getBooleanOption("customBars");
        if (!errorBars) return;
        var fillGraph = g.getBooleanOption("fillGraph", setName);
        if (fillGraph) {
            console.warn("Can't use fillGraph option with error bars");
        }
        var ctx = e.drawingContext;
        var color = e.color;
        var fillAlpha = g.getNumericOption("fillAlpha", setName);
        var stepPlot = g.getBooleanOption("stepPlot", setName);
        var points = e.points;
        var iter = Dygraph.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
        var newYs;
        var prevX = NaN;
        var prevY = NaN;
        var prevYs = [ -1, -1 ];
        var rgb = Dygraph.toRGB_(color);
        var err_color = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + fillAlpha + ")";
        ctx.fillStyle = err_color;
        ctx.beginPath();
        var isNullUndefinedOrNaN = function(x) {
            return x === null || x === undefined || isNaN(x);
        };
        while (iter.hasNext) {
            var point = iter.next();
            if (!stepPlot && isNullUndefinedOrNaN(point.y) || stepPlot && !isNaN(prevY) && isNullUndefinedOrNaN(prevY)) {
                prevX = NaN;
                continue;
            }
            newYs = [ point.y_bottom, point.y_top ];
            if (stepPlot) {
                prevY = point.y;
            }
            if (isNaN(newYs[0])) newYs[0] = point.y;
            if (isNaN(newYs[1])) newYs[1] = point.y;
            newYs[0] = e.plotArea.h * newYs[0] + e.plotArea.y;
            newYs[1] = e.plotArea.h * newYs[1] + e.plotArea.y;
            if (!isNaN(prevX)) {
                if (stepPlot) {
                    ctx.moveTo(prevX, prevYs[0]);
                    ctx.lineTo(point.canvasx, prevYs[0]);
                    ctx.lineTo(point.canvasx, prevYs[1]);
                } else {
                    ctx.moveTo(prevX, prevYs[0]);
                    ctx.lineTo(point.canvasx, newYs[0]);
                    ctx.lineTo(point.canvasx, newYs[1]);
                }
                ctx.lineTo(prevX, prevYs[1]);
                ctx.closePath();
            }
            prevYs = newYs;
            prevX = point.canvasx;
        }
        ctx.fill();
    };
    DygraphCanvasRenderer._fastCanvasProxy = function(context) {
        var pendingActions = [];
        var lastRoundedX = null;
        var lastFlushedX = null;
        var LINE_TO = 1, MOVE_TO = 2;
        var actionCount = 0;
        var compressActions = function(opt_losslessOnly) {
            if (pendingActions.length <= 1) return;
            for (var i = pendingActions.length - 1; i > 0; i--) {
                var action = pendingActions[i];
                if (action[0] == MOVE_TO) {
                    var prevAction = pendingActions[i - 1];
                    if (prevAction[1] == action[1] && prevAction[2] == action[2]) {
                        pendingActions.splice(i, 1);
                    }
                }
            }
            for (var i = 0; i < pendingActions.length - 1; ) {
                var action = pendingActions[i];
                if (action[0] == MOVE_TO && pendingActions[i + 1][0] == MOVE_TO) {
                    pendingActions.splice(i, 1);
                } else {
                    i++;
                }
            }
            if (pendingActions.length > 2 && !opt_losslessOnly) {
                var startIdx = 0;
                if (pendingActions[0][0] == MOVE_TO) startIdx++;
                var minIdx = null, maxIdx = null;
                for (var i = startIdx; i < pendingActions.length; i++) {
                    var action = pendingActions[i];
                    if (action[0] != LINE_TO) continue;
                    if (minIdx === null && maxIdx === null) {
                        minIdx = i;
                        maxIdx = i;
                    } else {
                        var y = action[2];
                        if (y < pendingActions[minIdx][2]) {
                            minIdx = i;
                        } else if (y > pendingActions[maxIdx][2]) {
                            maxIdx = i;
                        }
                    }
                }
                var minAction = pendingActions[minIdx], maxAction = pendingActions[maxIdx];
                pendingActions.splice(startIdx, pendingActions.length - startIdx);
                if (minIdx < maxIdx) {
                    pendingActions.push(minAction);
                    pendingActions.push(maxAction);
                } else if (minIdx > maxIdx) {
                    pendingActions.push(maxAction);
                    pendingActions.push(minAction);
                } else {
                    pendingActions.push(minAction);
                }
            }
        };
        var flushActions = function(opt_noLossyCompression) {
            compressActions(opt_noLossyCompression);
            for (var i = 0, len = pendingActions.length; i < len; i++) {
                var action = pendingActions[i];
                if (action[0] == LINE_TO) {
                    context.lineTo(action[1], action[2]);
                } else if (action[0] == MOVE_TO) {
                    context.moveTo(action[1], action[2]);
                }
            }
            if (pendingActions.length) {
                lastFlushedX = pendingActions[pendingActions.length - 1][1];
            }
            actionCount += pendingActions.length;
            pendingActions = [];
        };
        var addAction = function(action, x, y) {
            var rx = Math.round(x);
            if (lastRoundedX === null || rx != lastRoundedX) {
                var hasGapOnLeft = lastRoundedX - lastFlushedX > 1, hasGapOnRight = rx - lastRoundedX > 1, hasGap = hasGapOnLeft || hasGapOnRight;
                flushActions(hasGap);
                lastRoundedX = rx;
            }
            pendingActions.push([ action, x, y ]);
        };
        return {
            moveTo: function(x, y) {
                addAction(MOVE_TO, x, y);
            },
            lineTo: function(x, y) {
                addAction(LINE_TO, x, y);
            },
            stroke: function() {
                flushActions(true);
                context.stroke();
            },
            fill: function() {
                flushActions(true);
                context.fill();
            },
            beginPath: function() {
                flushActions(true);
                context.beginPath();
            },
            closePath: function() {
                flushActions(true);
                context.closePath();
            },
            _count: function() {
                return actionCount;
            }
        };
    };
    DygraphCanvasRenderer._fillPlotter = function(e) {
        if (e.singleSeriesName) return;
        if (e.seriesIndex !== 0) return;
        var g = e.dygraph;
        var setNames = g.getLabels().slice(1);
        for (var i = setNames.length; i >= 0; i--) {
            if (!g.visibility()[i]) setNames.splice(i, 1);
        }
        var anySeriesFilled = function() {
            for (var i = 0; i < setNames.length; i++) {
                if (g.getBooleanOption("fillGraph", setNames[i])) return true;
            }
            return false;
        }();
        if (!anySeriesFilled) return;
        var area = e.plotArea;
        var sets = e.allSeriesPoints;
        var setCount = sets.length;
        var fillAlpha = g.getNumericOption("fillAlpha");
        var stackedGraph = g.getBooleanOption("stackedGraph");
        var colors = g.getColors();
        var baseline = {};
        var currBaseline;
        var prevStepPlot;
        var traceBackPath = function(ctx, baselineX, baselineY, pathBack) {
            ctx.lineTo(baselineX, baselineY);
            if (stackedGraph) {
                for (var i = pathBack.length - 1; i >= 0; i--) {
                    var pt = pathBack[i];
                    ctx.lineTo(pt[0], pt[1]);
                }
            }
        };
        for (var setIdx = setCount - 1; setIdx >= 0; setIdx--) {
            var ctx = e.drawingContext;
            var setName = setNames[setIdx];
            if (!g.getBooleanOption("fillGraph", setName)) continue;
            var stepPlot = g.getBooleanOption("stepPlot", setName);
            var color = colors[setIdx];
            var axis = g.axisPropertiesForSeries(setName);
            var axisY = 1 + axis.minyval * axis.yscale;
            if (axisY < 0) axisY = 0; else if (axisY > 1) axisY = 1;
            axisY = area.h * axisY + area.y;
            var points = sets[setIdx];
            var iter = Dygraph.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
            var prevX = NaN;
            var prevYs = [ -1, -1 ];
            var newYs;
            var rgb = Dygraph.toRGB_(color);
            var err_color = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + fillAlpha + ")";
            ctx.fillStyle = err_color;
            ctx.beginPath();
            var last_x, is_first = true;
            if (points.length > 2 * g.width_ || Dygraph.FORCE_FAST_PROXY) {
                ctx = DygraphCanvasRenderer._fastCanvasProxy(ctx);
            }
            var pathBack = [];
            var point;
            while (iter.hasNext) {
                point = iter.next();
                if (!Dygraph.isOK(point.y) && !stepPlot) {
                    traceBackPath(ctx, prevX, prevYs[1], pathBack);
                    pathBack = [];
                    prevX = NaN;
                    if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
                        baseline[point.canvasx] = area.h * point.y_stacked + area.y;
                    }
                    continue;
                }
                if (stackedGraph) {
                    if (!is_first && last_x == point.xval) {
                        continue;
                    } else {
                        is_first = false;
                        last_x = point.xval;
                    }
                    currBaseline = baseline[point.canvasx];
                    var lastY;
                    if (currBaseline === undefined) {
                        lastY = axisY;
                    } else {
                        if (prevStepPlot) {
                            lastY = currBaseline[0];
                        } else {
                            lastY = currBaseline;
                        }
                    }
                    newYs = [ point.canvasy, lastY ];
                    if (stepPlot) {
                        if (prevYs[0] === -1) {
                            baseline[point.canvasx] = [ point.canvasy, axisY ];
                        } else {
                            baseline[point.canvasx] = [ point.canvasy, prevYs[0] ];
                        }
                    } else {
                        baseline[point.canvasx] = point.canvasy;
                    }
                } else {
                    if (isNaN(point.canvasy) && stepPlot) {
                        newYs = [ area.y + area.h, axisY ];
                    } else {
                        newYs = [ point.canvasy, axisY ];
                    }
                }
                if (!isNaN(prevX)) {
                    if (stepPlot) {
                        ctx.lineTo(point.canvasx, prevYs[0]);
                        ctx.lineTo(point.canvasx, newYs[0]);
                    } else {
                        ctx.lineTo(point.canvasx, newYs[0]);
                    }
                    if (stackedGraph) {
                        pathBack.push([ prevX, prevYs[1] ]);
                        if (prevStepPlot && currBaseline) {
                            pathBack.push([ point.canvasx, currBaseline[1] ]);
                        } else {
                            pathBack.push([ point.canvasx, newYs[1] ]);
                        }
                    }
                } else {
                    ctx.moveTo(point.canvasx, newYs[1]);
                    ctx.lineTo(point.canvasx, newYs[0]);
                }
                prevYs = newYs;
                prevX = point.canvasx;
            }
            prevStepPlot = stepPlot;
            if (newYs && point) {
                traceBackPath(ctx, point.canvasx, newYs[1], pathBack);
                pathBack = [];
            }
            ctx.fill();
        }
    };
    return DygraphCanvasRenderer;
}();

if (typeof DEBUG === "undefined") DEBUG = false;

var Dygraph = function() {
    "use strict";
    var Dygraph = function(div, data, opts, opt_fourth_param) {
        this.is_initial_draw_ = true;
        this.readyFns_ = [];
        if (opt_fourth_param !== undefined) {
            console.warn("Using deprecated four-argument dygraph constructor");
            this.__old_init__(div, data, opts, opt_fourth_param);
        } else {
            this.__init__(div, data, opts);
        }
    };
    Dygraph.NAME = "Dygraph";
    Dygraph.VERSION = "1.1.1";
    Dygraph.__repr__ = function() {
        return "[" + Dygraph.NAME + " " + Dygraph.VERSION + "]";
    };
    Dygraph.toString = function() {
        return Dygraph.__repr__();
    };
    Dygraph.DEFAULT_ROLL_PERIOD = 1;
    Dygraph.DEFAULT_WIDTH = 480;
    Dygraph.DEFAULT_HEIGHT = 320;
    Dygraph.ANIMATION_STEPS = 12;
    Dygraph.ANIMATION_DURATION = 200;
    Dygraph.KMB_LABELS = [ "K", "M", "B", "T", "Q" ];
    Dygraph.KMG2_BIG_LABELS = [ "k", "M", "G", "T", "P", "E", "Z", "Y" ];
    Dygraph.KMG2_SMALL_LABELS = [ "m", "u", "n", "p", "f", "a", "z", "y" ];
    Dygraph.numberValueFormatter = function(x, opts) {
        var sigFigs = opts("sigFigs");
        if (sigFigs !== null) {
            return Dygraph.floatFormat(x, sigFigs);
        }
        var digits = opts("digitsAfterDecimal");
        var maxNumberWidth = opts("maxNumberWidth");
        var kmb = opts("labelsKMB");
        var kmg2 = opts("labelsKMG2");
        var label;
        if (x !== 0 && (Math.abs(x) >= Math.pow(10, maxNumberWidth) || Math.abs(x) < Math.pow(10, -digits))) {
            label = x.toExponential(digits);
        } else {
            label = "" + Dygraph.round_(x, digits);
        }
        if (kmb || kmg2) {
            var k;
            var k_labels = [];
            var m_labels = [];
            if (kmb) {
                k = 1e3;
                k_labels = Dygraph.KMB_LABELS;
            }
            if (kmg2) {
                if (kmb) console.warn("Setting both labelsKMB and labelsKMG2. Pick one!");
                k = 1024;
                k_labels = Dygraph.KMG2_BIG_LABELS;
                m_labels = Dygraph.KMG2_SMALL_LABELS;
            }
            var absx = Math.abs(x);
            var n = Dygraph.pow(k, k_labels.length);
            for (var j = k_labels.length - 1; j >= 0; j--, n /= k) {
                if (absx >= n) {
                    label = Dygraph.round_(x / n, digits) + k_labels[j];
                    break;
                }
            }
            if (kmg2) {
                var x_parts = String(x.toExponential()).split("e-");
                if (x_parts.length === 2 && x_parts[1] >= 3 && x_parts[1] <= 24) {
                    if (x_parts[1] % 3 > 0) {
                        label = Dygraph.round_(x_parts[0] / Dygraph.pow(10, x_parts[1] % 3), digits);
                    } else {
                        label = Number(x_parts[0]).toFixed(2);
                    }
                    label += m_labels[Math.floor(x_parts[1] / 3) - 1];
                }
            }
        }
        return label;
    };
    Dygraph.numberAxisLabelFormatter = function(x, granularity, opts) {
        return Dygraph.numberValueFormatter.call(this, x, opts);
    };
    Dygraph.SHORT_MONTH_NAMES_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    Dygraph.dateAxisLabelFormatter = function(date, granularity, opts) {
        var utc = opts("labelsUTC");
        var accessors = utc ? Dygraph.DateAccessorsUTC : Dygraph.DateAccessorsLocal;
        var timezone = opts("labelsTimezone");
        accessors = timezone ? timezone : accessors;
        var year = accessors.getFullYear(date), month = accessors.getMonth(date), day = accessors.getDate(date), hours = accessors.getHours(date), mins = accessors.getMinutes(date), secs = accessors.getSeconds(date), millis = accessors.getSeconds(date);
        if (granularity >= Dygraph.DECADAL) {
            return "" + year;
        } else if (granularity >= Dygraph.MONTHLY) {
            return Dygraph.SHORT_MONTH_NAMES_[month] + "&#160;" + year;
        } else {
            var frac = hours * 3600 + mins * 60 + secs + .001 * millis;
            if (frac === 0 || granularity >= Dygraph.DAILY) {
                return Dygraph.zeropad(day) + "&#160;" + Dygraph.SHORT_MONTH_NAMES_[month];
            } else {
                return Dygraph.hmsString_(hours, mins, secs);
            }
        }
    };
    Dygraph.dateAxisFormatter = Dygraph.dateAxisLabelFormatter;
    Dygraph.dateValueFormatter = function(d, opts) {
        if (opts("labelsTimezone")) {
            return Dygraph.dateString_(d, opts("labelsTimezone"));
        } else {
            return Dygraph.dateString_(d, opts("labelsUTC"));
        }
    };
    Dygraph.Plotters = DygraphCanvasRenderer._Plotters;
    Dygraph.DEFAULT_ATTRS = {
        highlightCircleSize: 3,
        highlightSeriesOpts: null,
        highlightSeriesBackgroundAlpha: .5,
        labelsDivWidth: 250,
        labelsDivStyles: {},
        labelsSeparateLines: false,
        labelsShowZeroValues: true,
        labelsKMB: false,
        labelsKMG2: false,
        showLabelsOnHighlight: true,
        digitsAfterDecimal: 2,
        maxNumberWidth: 6,
        sigFigs: null,
        strokeWidth: 1,
        strokeBorderWidth: 0,
        strokeBorderColor: "white",
        axisTickSize: 3,
        axisLabelFontSize: 14,
        rightGap: 5,
        showRoller: false,
        xValueParser: Dygraph.dateParser,
        delimiter: ",",
        sigma: 2,
        errorBars: false,
        fractions: false,
        wilsonInterval: true,
        customBars: false,
        fillGraph: false,
        fillAlpha: .15,
        connectSeparatedPoints: false,
        stackedGraph: false,
        stackedGraphNaNFill: "all",
        hideOverlayOnMouseOut: true,
        legend: "onmouseover",
        stepPlot: false,
        avoidMinZero: false,
        xRangePad: 0,
        yRangePad: null,
        drawAxesAtZero: false,
        titleHeight: 28,
        xLabelHeight: 18,
        yLabelWidth: 18,
        drawXAxis: true,
        drawYAxis: true,
        axisLineColor: "black",
        axisLineWidth: .3,
        gridLineWidth: .3,
        axisLabelColor: "black",
        axisLabelWidth: 50,
        drawYGrid: true,
        drawXGrid: true,
        gridLineColor: "rgb(128,128,128)",
        interactionModel: null,
        animatedZooms: false,
        showRangeSelector: false,
        rangeSelectorHeight: 40,
        rangeSelectorPlotStrokeColor: "#808FAB",
        rangeSelectorPlotFillColor: "#A7B1C4",
        showInRangeSelector: null,
        plotter: [ Dygraph.Plotters.fillPlotter, Dygraph.Plotters.errorPlotter, Dygraph.Plotters.linePlotter ],
        plugins: [],
        axes: {
            x: {
                pixelsPerLabel: 70,
                axisLabelWidth: 60,
                axisLabelFormatter: Dygraph.dateAxisLabelFormatter,
                valueFormatter: Dygraph.dateValueFormatter,
                drawGrid: true,
                drawAxis: true,
                independentTicks: true,
                ticker: null
            },
            y: {
                axisLabelWidth: 50,
                pixelsPerLabel: 30,
                valueFormatter: Dygraph.numberValueFormatter,
                axisLabelFormatter: Dygraph.numberAxisLabelFormatter,
                drawGrid: true,
                drawAxis: true,
                independentTicks: true,
                ticker: null
            },
            y2: {
                axisLabelWidth: 50,
                pixelsPerLabel: 30,
                valueFormatter: Dygraph.numberValueFormatter,
                axisLabelFormatter: Dygraph.numberAxisLabelFormatter,
                drawAxis: true,
                drawGrid: false,
                independentTicks: false,
                ticker: null
            }
        }
    };
    Dygraph.HORIZONTAL = 1;
    Dygraph.VERTICAL = 2;
    Dygraph.PLUGINS = [];
    Dygraph.addedAnnotationCSS = false;
    Dygraph.prototype.__old_init__ = function(div, file, labels, attrs) {
        if (labels !== null) {
            var new_labels = [ "Date" ];
            for (var i = 0; i < labels.length; i++) new_labels.push(labels[i]);
            Dygraph.update(attrs, {
                labels: new_labels
            });
        }
        this.__init__(div, file, attrs);
    };
    Dygraph.prototype.__init__ = function(div, file, attrs) {
        var this$1 = this;

        if (/MSIE/.test(navigator.userAgent) && !window.opera && typeof G_vmlCanvasManager != "undefined" && document.readyState != "complete") {
            var self = this;
            setTimeout(function() {
                self.__init__(div, file, attrs);
            }, 100);
            return;
        }
        if (attrs === null || attrs === undefined) {
            attrs = {};
        }
        attrs = Dygraph.mapLegacyOptions_(attrs);
        if (typeof div == "string") {
            div = document.getElementById(div);
        }
        if (!div) {
            console.error("Constructing dygraph with a non-existent div!");
            return;
        }
        this.isUsingExcanvas_ = typeof G_vmlCanvasManager != "undefined";
        this.maindiv_ = div;
        this.file_ = file;
        this.rollPeriod_ = attrs.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
        this.previousVerticalX_ = -1;
        this.fractions_ = attrs.fractions || false;
        this.dateWindow_ = attrs.dateWindow || null;
        this.annotations_ = [];
        this.zoomed_x_ = false;
        this.zoomed_y_ = false;
        div.innerHTML = "";
        if (div.style.width === "" && attrs.width) {
            div.style.width = attrs.width + "px";
        }
        if (div.style.height === "" && attrs.height) {
            div.style.height = attrs.height + "px";
        }
        if (div.style.height === "" && div.clientHeight === 0) {
            div.style.height = Dygraph.DEFAULT_HEIGHT + "px";
            if (div.style.width === "") {
                div.style.width = Dygraph.DEFAULT_WIDTH + "px";
            }
        }
        this.width_ = div.clientWidth || attrs.width || 0;
        this.height_ = div.clientHeight || attrs.height || 0;
        if (attrs.stackedGraph) {
            attrs.fillGraph = true;
        }
        this.user_attrs_ = {};
        Dygraph.update(this.user_attrs_, attrs);
        this.attrs_ = {};
        Dygraph.updateDeep(this.attrs_, Dygraph.DEFAULT_ATTRS);
        this.boundaryIds_ = [];
        this.setIndexByName_ = {};
        this.datasetIndex_ = [];
        this.registeredEvents_ = [];
        this.eventListeners_ = {};
        this.attributes_ = new DygraphOptions(this);
        this.createInterface_();
        this.plugins_ = [];
        var plugins = Dygraph.PLUGINS.concat(this.getOption("plugins"));
        for (var i = 0; i < plugins.length; i++) {
            var Plugin = plugins[i];
            var pluginInstance;
            if (typeof Plugin.activate !== "undefined") {
                pluginInstance = Plugin;
            } else {
                pluginInstance = new Plugin();
            }
            var pluginDict = {
                plugin: pluginInstance,
                events: {},
                options: {},
                pluginOptions: {}
            };
            var handlers = pluginInstance.activate(this$1);
            for (var eventName in handlers) {
                if (!handlers.hasOwnProperty(eventName)) continue;
                pluginDict.events[eventName] = handlers[eventName];
            }
            this$1.plugins_.push(pluginDict);
        }
        for (var i = 0; i < this.plugins_.length; i++) {
            var plugin_dict = this$1.plugins_[i];
            for (var eventName in plugin_dict.events) {
                if (!plugin_dict.events.hasOwnProperty(eventName)) continue;
                var callback = plugin_dict.events[eventName];
                var pair = [ plugin_dict.plugin, callback ];
                if (!(eventName in this$1.eventListeners_)) {
                    this$1.eventListeners_[eventName] = [ pair ];
                } else {
                    this$1.eventListeners_[eventName].push(pair);
                }
            }
        }
        this.createDragInterface_();
        this.start_();
    };
    Dygraph.prototype.cascadeEvents_ = function(name, extra_props) {
        if (!(name in this.eventListeners_)) return false;
        var e = {
            dygraph: this,
            cancelable: false,
            defaultPrevented: false,
            preventDefault: function() {
                if (!e.cancelable) throw "Cannot call preventDefault on non-cancelable event.";
                e.defaultPrevented = true;
            },
            propagationStopped: false,
            stopPropagation: function() {
                e.propagationStopped = true;
            }
        };
        Dygraph.update(e, extra_props);
        var callback_plugin_pairs = this.eventListeners_[name];
        if (callback_plugin_pairs) {
            for (var i = callback_plugin_pairs.length - 1; i >= 0; i--) {
                var plugin = callback_plugin_pairs[i][0];
                var callback = callback_plugin_pairs[i][1];
                callback.call(plugin, e);
                if (e.propagationStopped) break;
            }
        }
        return e.defaultPrevented;
    };
    Dygraph.prototype.getPluginInstance_ = function(type) {
        var this$1 = this;

        for (var i = 0; i < this.plugins_.length; i++) {
            var p = this$1.plugins_[i];
            if (p.plugin instanceof type) {
                return p.plugin;
            }
        }
        return null;
    };
    Dygraph.prototype.isZoomed = function(axis) {
        if (axis === null || axis === undefined) {
            return this.zoomed_x_ || this.zoomed_y_;
        }
        if (axis === "x") return this.zoomed_x_;
        if (axis === "y") return this.zoomed_y_;
        throw "axis parameter is [" + axis + "] must be null, 'x' or 'y'.";
    };
    Dygraph.prototype.toString = function() {
        var maindiv = this.maindiv_;
        var id = maindiv && maindiv.id ? maindiv.id : maindiv;
        return "[Dygraph " + id + "]";
    };
    Dygraph.prototype.attr_ = function(name, seriesName) {
        if (DEBUG) {
            if (typeof Dygraph.OPTIONS_REFERENCE === "undefined") {
                console.error("Must include options reference JS for testing");
            } else if (!Dygraph.OPTIONS_REFERENCE.hasOwnProperty(name)) {
                console.error("Dygraphs is using property " + name + ", which has no " + "entry in the Dygraphs.OPTIONS_REFERENCE listing.");
                Dygraph.OPTIONS_REFERENCE[name] = true;
            }
        }
        return seriesName ? this.attributes_.getForSeries(name, seriesName) : this.attributes_.get(name);
    };
    Dygraph.prototype.getOption = function(name, opt_seriesName) {
        return this.attr_(name, opt_seriesName);
    };
    Dygraph.prototype.getNumericOption = function(name, opt_seriesName) {
        return this.getOption(name, opt_seriesName);
    };
    Dygraph.prototype.getStringOption = function(name, opt_seriesName) {
        return this.getOption(name, opt_seriesName);
    };
    Dygraph.prototype.getBooleanOption = function(name, opt_seriesName) {
        return this.getOption(name, opt_seriesName);
    };
    Dygraph.prototype.getFunctionOption = function(name, opt_seriesName) {
        return this.getOption(name, opt_seriesName);
    };
    Dygraph.prototype.getOptionForAxis = function(name, axis) {
        return this.attributes_.getForAxis(name, axis);
    };
    Dygraph.prototype.optionsViewForAxis_ = function(axis) {
        var self = this;
        return function(opt) {
            var axis_opts = self.user_attrs_.axes;
            if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
                return axis_opts[axis][opt];
            }
            if (axis === "x" && opt === "logscale") {
                return false;
            }
            if (typeof self.user_attrs_[opt] != "undefined") {
                return self.user_attrs_[opt];
            }
            axis_opts = self.attrs_.axes;
            if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
                return axis_opts[axis][opt];
            }
            if (axis == "y" && self.axes_[0].hasOwnProperty(opt)) {
                return self.axes_[0][opt];
            } else if (axis == "y2" && self.axes_[1].hasOwnProperty(opt)) {
                return self.axes_[1][opt];
            }
            return self.attr_(opt);
        };
    };
    Dygraph.prototype.rollPeriod = function() {
        return this.rollPeriod_;
    };
    Dygraph.prototype.xAxisRange = function() {
        return this.dateWindow_ ? this.dateWindow_ : this.xAxisExtremes();
    };
    Dygraph.prototype.xAxisExtremes = function() {
        var pad = this.getNumericOption("xRangePad") / this.plotter_.area.w;
        if (this.numRows() === 0) {
            return [ 0 - pad, 1 + pad ];
        }
        var left = this.rawData_[0][0];
        var right = this.rawData_[this.rawData_.length - 1][0];
        if (pad) {
            var range = right - left;
            left -= range * pad;
            right += range * pad;
        }
        return [ left, right ];
    };
    Dygraph.prototype.yAxisRange = function(idx) {
        if (typeof idx == "undefined") idx = 0;
        if (idx < 0 || idx >= this.axes_.length) {
            return null;
        }
        var axis = this.axes_[idx];
        return [ axis.computedValueRange[0], axis.computedValueRange[1] ];
    };
    Dygraph.prototype.yAxisRanges = function() {
        var this$1 = this;

        var ret = [];
        for (var i = 0; i < this.axes_.length; i++) {
            ret.push(this$1.yAxisRange(i));
        }
        return ret;
    };
    Dygraph.prototype.toDomCoords = function(x, y, axis) {
        return [ this.toDomXCoord(x), this.toDomYCoord(y, axis) ];
    };
    Dygraph.prototype.toDomXCoord = function(x) {
        if (x === null) {
            return null;
        }
        var area = this.plotter_.area;
        var xRange = this.xAxisRange();
        return area.x + (x - xRange[0]) / (xRange[1] - xRange[0]) * area.w;
    };
    Dygraph.prototype.toDomYCoord = function(y, axis) {
        var pct = this.toPercentYCoord(y, axis);
        if (pct === null) {
            return null;
        }
        var area = this.plotter_.area;
        return area.y + pct * area.h;
    };
    Dygraph.prototype.toDataCoords = function(x, y, axis) {
        return [ this.toDataXCoord(x), this.toDataYCoord(y, axis) ];
    };
    Dygraph.prototype.toDataXCoord = function(x) {
        if (x === null) {
            return null;
        }
        var area = this.plotter_.area;
        var xRange = this.xAxisRange();
        if (!this.attributes_.getForAxis("logscale", "x")) {
            return xRange[0] + (x - area.x) / area.w * (xRange[1] - xRange[0]);
        } else {
            var pct = (x - area.x) / area.w;
            var logr0 = Dygraph.log10(xRange[0]);
            var logr1 = Dygraph.log10(xRange[1]);
            var exponent = logr0 + pct * (logr1 - logr0);
            var value = Math.pow(Dygraph.LOG_SCALE, exponent);
            return value;
        }
    };
    Dygraph.prototype.toDataYCoord = function(y, axis) {
        if (y === null) {
            return null;
        }
        var area = this.plotter_.area;
        var yRange = this.yAxisRange(axis);
        if (typeof axis == "undefined") axis = 0;
        if (!this.attributes_.getForAxis("logscale", axis)) {
            return yRange[0] + (area.y + area.h - y) / area.h * (yRange[1] - yRange[0]);
        } else {
            var pct = (y - area.y) / area.h;
            var logr0 = Dygraph.log10(yRange[0]);
            var logr1 = Dygraph.log10(yRange[1]);
            var exponent = logr1 - pct * (logr1 - logr0);
            var value = Math.pow(Dygraph.LOG_SCALE, exponent);
            return value;
        }
    };
    Dygraph.prototype.toPercentYCoord = function(y, axis) {
        if (y === null) {
            return null;
        }
        if (typeof axis == "undefined") axis = 0;
        var yRange = this.yAxisRange(axis);
        var pct;
        var logscale = this.attributes_.getForAxis("logscale", axis);
        if (logscale) {
            var logr0 = Dygraph.log10(yRange[0]);
            var logr1 = Dygraph.log10(yRange[1]);
            pct = (logr1 - Dygraph.log10(y)) / (logr1 - logr0);
        } else {
            pct = (yRange[1] - y) / (yRange[1] - yRange[0]);
        }
        return pct;
    };
    Dygraph.prototype.toPercentXCoord = function(x) {
        if (x === null) {
            return null;
        }
        var xRange = this.xAxisRange();
        var pct;
        var logscale = this.attributes_.getForAxis("logscale", "x");
        if (logscale === true) {
            var logr0 = Dygraph.log10(xRange[0]);
            var logr1 = Dygraph.log10(xRange[1]);
            pct = (Dygraph.log10(x) - logr0) / (logr1 - logr0);
        } else {
            pct = (x - xRange[0]) / (xRange[1] - xRange[0]);
        }
        return pct;
    };
    Dygraph.prototype.numColumns = function() {
        if (!this.rawData_) return 0;
        return this.rawData_[0] ? this.rawData_[0].length : this.attr_("labels").length;
    };
    Dygraph.prototype.numRows = function() {
        if (!this.rawData_) return 0;
        return this.rawData_.length;
    };
    Dygraph.prototype.getValue = function(row, col) {
        if (row < 0 || row > this.rawData_.length) return null;
        if (col < 0 || col > this.rawData_[row].length) return null;
        return this.rawData_[row][col];
    };
    Dygraph.prototype.createInterface_ = function() {
        var enclosing = this.maindiv_;
        this.graphDiv = document.createElement("div");
        this.graphDiv.style.textAlign = "left";
        this.graphDiv.style.position = "relative";
        enclosing.appendChild(this.graphDiv);
        this.canvas_ = Dygraph.createCanvas();
        this.canvas_.style.position = "absolute";
        this.hidden_ = this.createPlotKitCanvas_(this.canvas_);
        this.canvas_ctx_ = Dygraph.getContext(this.canvas_);
        this.hidden_ctx_ = Dygraph.getContext(this.hidden_);
        this.resizeElements_();
        this.graphDiv.appendChild(this.hidden_);
        this.graphDiv.appendChild(this.canvas_);
        this.mouseEventElement_ = this.createMouseEventElement_();
        this.layout_ = new DygraphLayout(this);
        var dygraph = this;
        this.mouseMoveHandler_ = function(e) {
            dygraph.mouseMove_(e);
        };
        this.mouseOutHandler_ = function(e) {
            var target = e.target || e.fromElement;
            var relatedTarget = e.relatedTarget || e.toElement;
            if (Dygraph.isNodeContainedBy(target, dygraph.graphDiv) && !Dygraph.isNodeContainedBy(relatedTarget, dygraph.graphDiv)) {
                dygraph.mouseOut_(e);
            }
        };
        this.addAndTrackEvent(window, "mouseout", this.mouseOutHandler_);
        this.addAndTrackEvent(this.mouseEventElement_, "mousemove", this.mouseMoveHandler_);
        if (!this.resizeHandler_) {
            this.resizeHandler_ = function(e) {
                dygraph.resize();
            };
            this.addAndTrackEvent(window, "resize", this.resizeHandler_);
        }
    };
    Dygraph.prototype.resizeElements_ = function() {
        this.graphDiv.style.width = this.width_ + "px";
        this.graphDiv.style.height = this.height_ + "px";
        var canvasScale = Dygraph.getContextPixelRatio(this.canvas_ctx_);
        this.canvas_.width = this.width_ * canvasScale;
        this.canvas_.height = this.height_ * canvasScale;
        this.canvas_.style.width = this.width_ + "px";
        this.canvas_.style.height = this.height_ + "px";
        if (canvasScale !== 1) {
            this.canvas_ctx_.scale(canvasScale, canvasScale);
        }
        var hiddenScale = Dygraph.getContextPixelRatio(this.hidden_ctx_);
        this.hidden_.width = this.width_ * hiddenScale;
        this.hidden_.height = this.height_ * hiddenScale;
        this.hidden_.style.width = this.width_ + "px";
        this.hidden_.style.height = this.height_ + "px";
        if (hiddenScale !== 1) {
            this.hidden_ctx_.scale(hiddenScale, hiddenScale);
        }
    };
    Dygraph.prototype.destroy = function() {
        var this$1 = this;

        this.canvas_ctx_.restore();
        this.hidden_ctx_.restore();
        for (var i = this.plugins_.length - 1; i >= 0; i--) {
            var p = this$1.plugins_.pop();
            if (p.plugin.destroy) p.plugin.destroy();
        }
        var removeRecursive = function(node) {
            while (node.hasChildNodes()) {
                removeRecursive(node.firstChild);
                node.removeChild(node.firstChild);
            }
        };
        this.removeTrackedEvents_();
        Dygraph.removeEvent(window, "mouseout", this.mouseOutHandler_);
        Dygraph.removeEvent(this.mouseEventElement_, "mousemove", this.mouseMoveHandler_);
        Dygraph.removeEvent(window, "resize", this.resizeHandler_);
        this.resizeHandler_ = null;
        removeRecursive(this.maindiv_);
        var nullOut = function(obj) {
            for (var n in obj) {
                if (typeof obj[n] === "object") {
                    obj[n] = null;
                }
            }
        };
        nullOut(this.layout_);
        nullOut(this.plotter_);
        nullOut(this);
    };
    Dygraph.prototype.createPlotKitCanvas_ = function(canvas) {
        var h = Dygraph.createCanvas();
        h.style.position = "absolute";
        h.style.top = canvas.style.top;
        h.style.left = canvas.style.left;
        h.width = this.width_;
        h.height = this.height_;
        h.style.width = this.width_ + "px";
        h.style.height = this.height_ + "px";
        return h;
    };
    Dygraph.prototype.createMouseEventElement_ = function() {
        if (this.isUsingExcanvas_) {
            var elem = document.createElement("div");
            elem.style.position = "absolute";
            elem.style.backgroundColor = "white";
            elem.style.filter = "alpha(opacity=0)";
            elem.style.width = this.width_ + "px";
            elem.style.height = this.height_ + "px";
            this.graphDiv.appendChild(elem);
            return elem;
        } else {
            return this.canvas_;
        }
    };
    Dygraph.prototype.setColors_ = function() {
        var this$1 = this;

        var labels = this.getLabels();
        var num = labels.length - 1;
        this.colors_ = [];
        this.colorsMap_ = {};
        var sat = this.getNumericOption("colorSaturation") || 1;
        var val = this.getNumericOption("colorValue") || .5;
        var half = Math.ceil(num / 2);
        var colors = this.getOption("colors");
        var visibility = this.visibility();
        for (var i = 0; i < num; i++) {
            if (!visibility[i]) {
                continue;
            }
            var label = labels[i + 1];
            var colorStr = this$1.attributes_.getForSeries("color", label);
            if (!colorStr) {
                if (colors) {
                    colorStr = colors[i % colors.length];
                } else {
                    var idx = i % 2 ? half + (i + 1) / 2 : Math.ceil((i + 1) / 2);
                    var hue = 1 * idx / (1 + num);
                    colorStr = Dygraph.hsvToRGB(hue, sat, val);
                }
            }
            this$1.colors_.push(colorStr);
            this$1.colorsMap_[label] = colorStr;
        }
    };
    Dygraph.prototype.getColors = function() {
        return this.colors_;
    };
    Dygraph.prototype.getPropertiesForSeries = function(series_name) {
        var idx = -1;
        var labels = this.getLabels();
        for (var i = 1; i < labels.length; i++) {
            if (labels[i] == series_name) {
                idx = i;
                break;
            }
        }
        if (idx == -1) return null;
        return {
            name: series_name,
            column: idx,
            visible: this.visibility()[idx - 1],
            color: this.colorsMap_[series_name],
            axis: 1 + this.attributes_.axisForSeries(series_name)
        };
    };
    Dygraph.prototype.createRollInterface_ = function() {
        var this$1 = this;

        if (!this.roller_) {
            this.roller_ = document.createElement("input");
            this.roller_.type = "text";
            this.roller_.style.display = "none";
            this.graphDiv.appendChild(this.roller_);
        }
        var display = this.getBooleanOption("showRoller") ? "block" : "none";
        var area = this.plotter_.area;
        var textAttr = {
            position: "absolute",
            zIndex: 10,
            top: area.y + area.h - 25 + "px",
            left: area.x + 1 + "px",
            display: display
        };
        this.roller_.size = "2";
        this.roller_.value = this.rollPeriod_;
        for (var name in textAttr) {
            if (textAttr.hasOwnProperty(name)) {
                this$1.roller_.style[name] = textAttr[name];
            }
        }
        var dygraph = this;
        this.roller_.onchange = function() {
            dygraph.adjustRoll(dygraph.roller_.value);
        };
    };
    Dygraph.prototype.createDragInterface_ = function() {
        var this$1 = this;

        var context = {
            isZooming: false,
            isPanning: false,
            is2DPan: false,
            dragStartX: null,
            dragStartY: null,
            dragEndX: null,
            dragEndY: null,
            dragDirection: null,
            prevEndX: null,
            prevEndY: null,
            prevDragDirection: null,
            cancelNextDblclick: false,
            initialLeftmostDate: null,
            xUnitsPerPixel: null,
            dateRange: null,
            px: 0,
            py: 0,
            boundedDates: null,
            boundedValues: null,
            tarp: new Dygraph.IFrameTarp(),
            initializeMouseDown: function(event, g, contextB) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                    event.cancelBubble = true;
                }
                var canvasPos = Dygraph.findPos(g.canvas_);
                contextB.px = canvasPos.x;
                contextB.py = canvasPos.y;
                contextB.dragStartX = Dygraph.dragGetX_(event, contextB);
                contextB.dragStartY = Dygraph.dragGetY_(event, contextB);
                contextB.cancelNextDblclick = false;
                contextB.tarp.cover();
            },
            destroy: function() {
                var context = this;
                if (context.isZooming || context.isPanning) {
                    context.isZooming = false;
                    context.dragStartX = null;
                    context.dragStartY = null;
                }
                if (context.isPanning) {
                    context.isPanning = false;
                    context.draggingDate = null;
                    context.dateRange = null;
                    for (var i = 0; i < self.axes_.length; i++) {
                        delete self.axes_[i].draggingValue;
                        delete self.axes_[i].dragValueRange;
                    }
                }
                context.tarp.uncover();
            }
        };
        var interactionModel = this.getOption("interactionModel");
        var self = this;
        var bindHandler = function(handler) {
            return function(event) {
                handler(event, self, context);
            };
        };
        for (var eventName in interactionModel) {
            if (!interactionModel.hasOwnProperty(eventName)) continue;
            this$1.addAndTrackEvent(this$1.mouseEventElement_, eventName, bindHandler(interactionModel[eventName]));
        }
        if (!interactionModel.willDestroyContextMyself) {
            var mouseUpHandler = function(event) {
                context.destroy();
            };
            this.addAndTrackEvent(document, "mouseup", mouseUpHandler);
        }
    };
    Dygraph.prototype.drawZoomRect_ = function(direction, startX, endX, startY, endY, prevDirection, prevEndX, prevEndY) {
        var ctx = this.canvas_ctx_;
        if (prevDirection == Dygraph.HORIZONTAL) {
            ctx.clearRect(Math.min(startX, prevEndX), this.layout_.getPlotArea().y, Math.abs(startX - prevEndX), this.layout_.getPlotArea().h);
        } else if (prevDirection == Dygraph.VERTICAL) {
            ctx.clearRect(this.layout_.getPlotArea().x, Math.min(startY, prevEndY), this.layout_.getPlotArea().w, Math.abs(startY - prevEndY));
        }
        if (direction == Dygraph.HORIZONTAL) {
            if (endX && startX) {
                ctx.fillStyle = "rgba(128,128,128,0.33)";
                ctx.fillRect(Math.min(startX, endX), this.layout_.getPlotArea().y, Math.abs(endX - startX), this.layout_.getPlotArea().h);
            }
        } else if (direction == Dygraph.VERTICAL) {
            if (endY && startY) {
                ctx.fillStyle = "rgba(128,128,128,0.33)";
                ctx.fillRect(this.layout_.getPlotArea().x, Math.min(startY, endY), this.layout_.getPlotArea().w, Math.abs(endY - startY));
            }
        }
        if (this.isUsingExcanvas_) {
            this.currentZoomRectArgs_ = [ direction, startX, endX, startY, endY, 0, 0, 0 ];
        }
    };
    Dygraph.prototype.clearZoomRect_ = function() {
        this.currentZoomRectArgs_ = null;
        this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
    };
    Dygraph.prototype.doZoomX_ = function(lowX, highX) {
        this.currentZoomRectArgs_ = null;
        var minDate = this.toDataXCoord(lowX);
        var maxDate = this.toDataXCoord(highX);
        this.doZoomXDates_(minDate, maxDate);
    };
    Dygraph.prototype.doZoomXDates_ = function(minDate, maxDate) {
        var old_window = this.xAxisRange();
        var new_window = [ minDate, maxDate ];
        this.zoomed_x_ = true;
        var that = this;
        this.doAnimatedZoom(old_window, new_window, null, null, function() {
            if (that.getFunctionOption("zoomCallback")) {
                that.getFunctionOption("zoomCallback").call(that, minDate, maxDate, that.yAxisRanges());
            }
        });
    };
    Dygraph.prototype.doZoomY_ = function(lowY, highY) {
        var this$1 = this;

        this.currentZoomRectArgs_ = null;
        var oldValueRanges = this.yAxisRanges();
        var newValueRanges = [];
        for (var i = 0; i < this.axes_.length; i++) {
            var hi = this$1.toDataYCoord(lowY, i);
            var low = this$1.toDataYCoord(highY, i);
            newValueRanges.push([ low, hi ]);
        }
        this.zoomed_y_ = true;
        var that = this;
        this.doAnimatedZoom(null, null, oldValueRanges, newValueRanges, function() {
            if (that.getFunctionOption("zoomCallback")) {
                var xRange = that.xAxisRange();
                that.getFunctionOption("zoomCallback").call(that, xRange[0], xRange[1], that.yAxisRanges());
            }
        });
    };
    Dygraph.zoomAnimationFunction = function(frame, numFrames) {
        var k = 1.5;
        return (1 - Math.pow(k, -frame)) / (1 - Math.pow(k, -numFrames));
    };
    Dygraph.prototype.resetZoom = function() {
        var this$1 = this;

        var dirty = false, dirtyX = false, dirtyY = false;
        if (this.dateWindow_ !== null) {
            dirty = true;
            dirtyX = true;
        }
        for (var i = 0; i < this.axes_.length; i++) {
            if (typeof this$1.axes_[i].valueWindow !== "undefined" && this$1.axes_[i].valueWindow !== null) {
                dirty = true;
                dirtyY = true;
            }
        }
        this.clearSelection();
        if (dirty) {
            this.zoomed_x_ = false;
            this.zoomed_y_ = false;
            var minDate = this.rawData_[0][0];
            var maxDate = this.rawData_[this.rawData_.length - 1][0];
            if (!this.getBooleanOption("animatedZooms")) {
                this.dateWindow_ = null;
                for (i = 0; i < this.axes_.length; i++) {
                    if (this$1.axes_[i].valueWindow !== null) {
                        delete this$1.axes_[i].valueWindow;
                    }
                }
                this.drawGraph_();
                if (this.getFunctionOption("zoomCallback")) {
                    this.getFunctionOption("zoomCallback").call(this, minDate, maxDate, this.yAxisRanges());
                }
                return;
            }
            var oldWindow = null, newWindow = null, oldValueRanges = null, newValueRanges = null;
            if (dirtyX) {
                oldWindow = this.xAxisRange();
                newWindow = [ minDate, maxDate ];
            }
            if (dirtyY) {
                oldValueRanges = this.yAxisRanges();
                var packed = this.gatherDatasets_(this.rolledSeries_, null);
                var extremes = packed.extremes;
                this.computeYAxisRanges_(extremes);
                newValueRanges = [];
                for (i = 0; i < this.axes_.length; i++) {
                    var axis = this$1.axes_[i];
                    newValueRanges.push(axis.valueRange !== null && axis.valueRange !== undefined ? axis.valueRange : axis.extremeRange);
                }
            }
            var that = this;
            this.doAnimatedZoom(oldWindow, newWindow, oldValueRanges, newValueRanges, function() {
                that.dateWindow_ = null;
                for (var i = 0; i < that.axes_.length; i++) {
                    if (that.axes_[i].valueWindow !== null) {
                        delete that.axes_[i].valueWindow;
                    }
                }
                if (that.getFunctionOption("zoomCallback")) {
                    that.getFunctionOption("zoomCallback").call(that, minDate, maxDate, that.yAxisRanges());
                }
            });
        }
    };
    Dygraph.prototype.doAnimatedZoom = function(oldXRange, newXRange, oldYRanges, newYRanges, callback) {
        var steps = this.getBooleanOption("animatedZooms") ? Dygraph.ANIMATION_STEPS : 1;
        var windows = [];
        var valueRanges = [];
        var step, frac;
        if (oldXRange !== null && newXRange !== null) {
            for (step = 1; step <= steps; step++) {
                frac = Dygraph.zoomAnimationFunction(step, steps);
                windows[step - 1] = [ oldXRange[0] * (1 - frac) + frac * newXRange[0], oldXRange[1] * (1 - frac) + frac * newXRange[1] ];
            }
        }
        if (oldYRanges !== null && newYRanges !== null) {
            for (step = 1; step <= steps; step++) {
                frac = Dygraph.zoomAnimationFunction(step, steps);
                var thisRange = [];
                for (var j = 0; j < this.axes_.length; j++) {
                    thisRange.push([ oldYRanges[j][0] * (1 - frac) + frac * newYRanges[j][0], oldYRanges[j][1] * (1 - frac) + frac * newYRanges[j][1] ]);
                }
                valueRanges[step - 1] = thisRange;
            }
        }
        var that = this;
        Dygraph.repeatAndCleanup(function(step) {
            if (valueRanges.length) {
                for (var i = 0; i < that.axes_.length; i++) {
                    var w = valueRanges[step][i];
                    that.axes_[i].valueWindow = [ w[0], w[1] ];
                }
            }
            if (windows.length) {
                that.dateWindow_ = windows[step];
            }
            that.drawGraph_();
        }, steps, Dygraph.ANIMATION_DURATION / steps, callback);
    };
    Dygraph.prototype.getArea = function() {
        return this.plotter_.area;
    };
    Dygraph.prototype.eventToDomCoords = function(event) {
        if (event.offsetX && event.offsetY) {
            return [ event.offsetX, event.offsetY ];
        } else {
            var eventElementPos = Dygraph.findPos(this.mouseEventElement_);
            var canvasx = Dygraph.pageX(event) - eventElementPos.x;
            var canvasy = Dygraph.pageY(event) - eventElementPos.y;
            return [ canvasx, canvasy ];
        }
    };
    Dygraph.prototype.findClosestRow = function(domX) {
        var minDistX = Infinity;
        var closestRow = -1;
        var sets = this.layout_.points;
        for (var i = 0; i < sets.length; i++) {
            var points = sets[i];
            var len = points.length;
            for (var j = 0; j < len; j++) {
                var point = points[j];
                if (!Dygraph.isValidPoint(point, true)) continue;
                var dist = Math.abs(point.canvasx - domX);
                if (dist < minDistX) {
                    minDistX = dist;
                    closestRow = point.idx;
                }
            }
        }
        return closestRow;
    };
    Dygraph.prototype.findClosestPoint = function(domX, domY) {
        var this$1 = this;

        var minDist = Infinity;
        var dist, dx, dy, point, closestPoint, closestSeries, closestRow;
        for (var setIdx = this.layout_.points.length - 1; setIdx >= 0; --setIdx) {
            var points = this$1.layout_.points[setIdx];
            for (var i = 0; i < points.length; ++i) {
                point = points[i];
                if (!Dygraph.isValidPoint(point)) continue;
                dx = point.canvasx - domX;
                dy = point.canvasy - domY;
                dist = dx * dx + dy * dy;
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = point;
                    closestSeries = setIdx;
                    closestRow = point.idx;
                }
            }
        }
        var name = this.layout_.setNames[closestSeries];
        return {
            row: closestRow,
            seriesName: name,
            point: closestPoint
        };
    };
    Dygraph.prototype.findStackedPoint = function(domX, domY) {
        var this$1 = this;

        var row = this.findClosestRow(domX);
        var closestPoint, closestSeries;
        for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
            var boundary = this$1.getLeftBoundary_(setIdx);
            var rowIdx = row - boundary;
            var points = this$1.layout_.points[setIdx];
            if (rowIdx >= points.length) continue;
            var p1 = points[rowIdx];
            if (!Dygraph.isValidPoint(p1)) continue;
            var py = p1.canvasy;
            if (domX > p1.canvasx && rowIdx + 1 < points.length) {
                var p2 = points[rowIdx + 1];
                if (Dygraph.isValidPoint(p2)) {
                    var dx = p2.canvasx - p1.canvasx;
                    if (dx > 0) {
                        var r = (domX - p1.canvasx) / dx;
                        py += r * (p2.canvasy - p1.canvasy);
                    }
                }
            } else if (domX < p1.canvasx && rowIdx > 0) {
                var p0 = points[rowIdx - 1];
                if (Dygraph.isValidPoint(p0)) {
                    var dx = p1.canvasx - p0.canvasx;
                    if (dx > 0) {
                        var r = (p1.canvasx - domX) / dx;
                        py += r * (p0.canvasy - p1.canvasy);
                    }
                }
            }
            if (setIdx === 0 || py < domY) {
                closestPoint = p1;
                closestSeries = setIdx;
            }
        }
        var name = this.layout_.setNames[closestSeries];
        return {
            row: row,
            seriesName: name,
            point: closestPoint
        };
    };
    Dygraph.prototype.mouseMove_ = function(event) {
        var points = this.layout_.points;
        if (points === undefined || points === null) return;
        var canvasCoords = this.eventToDomCoords(event);
        var canvasx = canvasCoords[0];
        var canvasy = canvasCoords[1];
        var highlightSeriesOpts = this.getOption("highlightSeriesOpts");
        var selectionChanged = false;
        if (highlightSeriesOpts && !this.isSeriesLocked()) {
            var closest;
            if (this.getBooleanOption("stackedGraph")) {
                closest = this.findStackedPoint(canvasx, canvasy);
            } else {
                closest = this.findClosestPoint(canvasx, canvasy);
            }
            selectionChanged = this.setSelection(closest.row, closest.seriesName);
        } else {
            var idx = this.findClosestRow(canvasx);
            selectionChanged = this.setSelection(idx);
        }
        var callback = this.getFunctionOption("highlightCallback");
        if (callback && selectionChanged) {
            callback.call(this, event, this.lastx_, this.selPoints_, this.lastRow_, this.highlightSet_);
        }
    };
    Dygraph.prototype.getLeftBoundary_ = function(setIdx) {
        var this$1 = this;

        if (this.boundaryIds_[setIdx]) {
            return this.boundaryIds_[setIdx][0];
        } else {
            for (var i = 0; i < this.boundaryIds_.length; i++) {
                if (this$1.boundaryIds_[i] !== undefined) {
                    return this$1.boundaryIds_[i][0];
                }
            }
            return 0;
        }
    };
    Dygraph.prototype.animateSelection_ = function(direction) {
        var totalSteps = 10;
        var millis = 30;
        if (this.fadeLevel === undefined) this.fadeLevel = 0;
        if (this.animateId === undefined) this.animateId = 0;
        var start = this.fadeLevel;
        var steps = direction < 0 ? start : totalSteps - start;
        if (steps <= 0) {
            if (this.fadeLevel) {
                this.updateSelection_(1);
            }
            return;
        }
        var thisId = ++this.animateId;
        var that = this;
        Dygraph.repeatAndCleanup(function(n) {
            if (that.animateId != thisId) return;
            that.fadeLevel += direction;
            if (that.fadeLevel === 0) {
                that.clearSelection();
            } else {
                that.updateSelection_(that.fadeLevel / totalSteps);
            }
        }, steps, millis, function() {});
    };
    Dygraph.prototype.updateSelection_ = function(opt_animFraction) {
        var this$1 = this;

        this.cascadeEvents_("select", {
            selectedRow: this.lastRow_,
            selectedX: this.lastx_,
            selectedPoints: this.selPoints_
        });
        var i;
        var ctx = this.canvas_ctx_;
        if (this.getOption("highlightSeriesOpts")) {
            ctx.clearRect(0, 0, this.width_, this.height_);
            var alpha = 1 - this.getNumericOption("highlightSeriesBackgroundAlpha");
            if (alpha) {
                var animateBackgroundFade = true;
                if (animateBackgroundFade) {
                    if (opt_animFraction === undefined) {
                        this.animateSelection_(1);
                        return;
                    }
                    alpha *= opt_animFraction;
                }
                ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
                ctx.fillRect(0, 0, this.width_, this.height_);
            }
            this.plotter_._renderLineChart(this.highlightSet_, ctx);
        } else if (this.previousVerticalX_ >= 0) {
            var maxCircleSize = 0;
            var labels = this.attr_("labels");
            for (i = 1; i < labels.length; i++) {
                var r = this$1.getNumericOption("highlightCircleSize", labels[i]);
                if (r > maxCircleSize) maxCircleSize = r;
            }
            var px = this.previousVerticalX_;
            ctx.clearRect(px - maxCircleSize - 1, 0, 2 * maxCircleSize + 2, this.height_);
        }
        if (this.isUsingExcanvas_ && this.currentZoomRectArgs_) {
            Dygraph.prototype.drawZoomRect_.apply(this, this.currentZoomRectArgs_);
        }
        if (this.selPoints_.length > 0) {
            var canvasx = this.selPoints_[0].canvasx;
            ctx.save();
            for (i = 0; i < this.selPoints_.length; i++) {
                var pt = this$1.selPoints_[i];
                if (!Dygraph.isOK(pt.canvasy)) continue;
                var circleSize = this$1.getNumericOption("highlightCircleSize", pt.name);
                var callback = this$1.getFunctionOption("drawHighlightPointCallback", pt.name);
                var color = this$1.plotter_.colors[pt.name];
                if (!callback) {
                    callback = Dygraph.Circles.DEFAULT;
                }
                ctx.lineWidth = this$1.getNumericOption("strokeWidth", pt.name);
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                callback.call(this$1, this$1, pt.name, ctx, canvasx, pt.canvasy, color, circleSize, pt.idx);
            }
            ctx.restore();
            this.previousVerticalX_ = canvasx;
        }
    };
    Dygraph.prototype.setSelection = function(row, opt_seriesName, opt_locked) {
        var this$1 = this;

        this.selPoints_ = [];
        var changed = false;
        if (row !== false && row >= 0) {
            if (row != this.lastRow_) changed = true;
            this.lastRow_ = row;
            for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
                var points = this$1.layout_.points[setIdx];
                var setRow = row - this$1.getLeftBoundary_(setIdx);
                if (setRow < points.length && points[setRow].idx == row) {
                    var point = points[setRow];
                    if (point.yval !== null) this$1.selPoints_.push(point);
                } else {
                    for (var pointIdx = 0; pointIdx < points.length; ++pointIdx) {
                        var point = points[pointIdx];
                        if (point.idx == row) {
                            if (point.yval !== null) {
                                this$1.selPoints_.push(point);
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            if (this.lastRow_ >= 0) changed = true;
            this.lastRow_ = -1;
        }
        if (this.selPoints_.length) {
            this.lastx_ = this.selPoints_[0].xval;
        } else {
            this.lastx_ = -1;
        }
        if (opt_seriesName !== undefined) {
            if (this.highlightSet_ !== opt_seriesName) changed = true;
            this.highlightSet_ = opt_seriesName;
        }
        if (opt_locked !== undefined) {
            this.lockedSet_ = opt_locked;
        }
        if (changed) {
            this.updateSelection_(undefined);
        }
        return changed;
    };
    Dygraph.prototype.mouseOut_ = function(event) {
        if (this.getFunctionOption("unhighlightCallback")) {
            this.getFunctionOption("unhighlightCallback").call(this, event);
        }
        if (this.getBooleanOption("hideOverlayOnMouseOut") && !this.lockedSet_) {
            this.clearSelection();
        }
    };
    Dygraph.prototype.clearSelection = function() {
        this.cascadeEvents_("deselect", {});
        this.lockedSet_ = false;
        if (this.fadeLevel) {
            this.animateSelection_(-1);
            return;
        }
        this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
        this.fadeLevel = 0;
        this.selPoints_ = [];
        this.lastx_ = -1;
        this.lastRow_ = -1;
        this.highlightSet_ = null;
    };
    Dygraph.prototype.getSelection = function() {
        var this$1 = this;

        if (!this.selPoints_ || this.selPoints_.length < 1) {
            return -1;
        }
        for (var setIdx = 0; setIdx < this.layout_.points.length; setIdx++) {
            var points = this$1.layout_.points[setIdx];
            for (var row = 0; row < points.length; row++) {
                if (points[row].x == this$1.selPoints_[0].x) {
                    return points[row].idx;
                }
            }
        }
        return -1;
    };
    Dygraph.prototype.getHighlightSeries = function() {
        return this.highlightSet_;
    };
    Dygraph.prototype.isSeriesLocked = function() {
        return this.lockedSet_;
    };
    Dygraph.prototype.loadedEvent_ = function(data) {
        this.rawData_ = this.parseCSV_(data);
        this.cascadeDataDidUpdateEvent_();
        this.predraw_();
    };
    Dygraph.prototype.addXTicks_ = function() {
        var range;
        if (this.dateWindow_) {
            range = [ this.dateWindow_[0], this.dateWindow_[1] ];
        } else {
            range = this.xAxisExtremes();
        }
        var xAxisOptionsView = this.optionsViewForAxis_("x");
        var xTicks = xAxisOptionsView("ticker")(range[0], range[1], this.plotter_.area.w, xAxisOptionsView, this);
        this.layout_.setXTicks(xTicks);
    };
    Dygraph.prototype.getHandlerClass_ = function() {
        var handlerClass;
        if (this.attr_("dataHandler")) {
            handlerClass = this.attr_("dataHandler");
        } else if (this.fractions_) {
            if (this.getBooleanOption("errorBars")) {
                handlerClass = Dygraph.DataHandlers.FractionsBarsHandler;
            } else {
                handlerClass = Dygraph.DataHandlers.DefaultFractionHandler;
            }
        } else if (this.getBooleanOption("customBars")) {
            handlerClass = Dygraph.DataHandlers.CustomBarsHandler;
        } else if (this.getBooleanOption("errorBars")) {
            handlerClass = Dygraph.DataHandlers.ErrorBarsHandler;
        } else {
            handlerClass = Dygraph.DataHandlers.DefaultHandler;
        }
        return handlerClass;
    };
    Dygraph.prototype.predraw_ = function() {
        var this$1 = this;

        var start = new Date();
        this.dataHandler_ = new (this.getHandlerClass_())();
        this.layout_.computePlotArea();
        this.computeYAxes_();
        if (!this.is_initial_draw_) {
            this.canvas_ctx_.restore();
            this.hidden_ctx_.restore();
        }
        this.canvas_ctx_.save();
        this.hidden_ctx_.save();
        this.plotter_ = new DygraphCanvasRenderer(this, this.hidden_, this.hidden_ctx_, this.layout_);
        this.createRollInterface_();
        this.cascadeEvents_("predraw");
        this.rolledSeries_ = [ null ];
        for (var i = 1; i < this.numColumns(); i++) {
            var series = this$1.dataHandler_.extractSeries(this$1.rawData_, i, this$1.attributes_);
            if (this$1.rollPeriod_ > 1) {
                series = this$1.dataHandler_.rollingAverage(series, this$1.rollPeriod_, this$1.attributes_);
            }
            this$1.rolledSeries_.push(series);
        }
        this.drawGraph_();
        var end = new Date();
        this.drawingTimeMs_ = end - start;
    };
    Dygraph.PointType = undefined;
    Dygraph.stackPoints_ = function(points, cumulativeYval, seriesExtremes, fillMethod) {
        var lastXval = null;
        var prevPoint = null;
        var nextPoint = null;
        var nextPointIdx = -1;
        var updateNextPoint = function(idx) {
            if (nextPointIdx >= idx) return;
            for (var j = idx; j < points.length; ++j) {
                nextPoint = null;
                if (!isNaN(points[j].yval) && points[j].yval !== null) {
                    nextPointIdx = j;
                    nextPoint = points[j];
                    break;
                }
            }
        };
        for (var i = 0; i < points.length; ++i) {
            var point = points[i];
            var xval = point.xval;
            if (cumulativeYval[xval] === undefined) {
                cumulativeYval[xval] = 0;
            }
            var actualYval = point.yval;
            if (isNaN(actualYval) || actualYval === null) {
                if (fillMethod == "none") {
                    actualYval = 0;
                } else {
                    updateNextPoint(i);
                    if (prevPoint && nextPoint && fillMethod != "none") {
                        actualYval = prevPoint.yval + (nextPoint.yval - prevPoint.yval) * ((xval - prevPoint.xval) / (nextPoint.xval - prevPoint.xval));
                    } else if (prevPoint && fillMethod == "all") {
                        actualYval = prevPoint.yval;
                    } else if (nextPoint && fillMethod == "all") {
                        actualYval = nextPoint.yval;
                    } else {
                        actualYval = 0;
                    }
                }
            } else {
                prevPoint = point;
            }
            var stackedYval = cumulativeYval[xval];
            if (lastXval != xval) {
                stackedYval += actualYval;
                cumulativeYval[xval] = stackedYval;
            }
            lastXval = xval;
            point.yval_stacked = stackedYval;
            if (stackedYval > seriesExtremes[1]) {
                seriesExtremes[1] = stackedYval;
            }
            if (stackedYval < seriesExtremes[0]) {
                seriesExtremes[0] = stackedYval;
            }
        }
    };
    Dygraph.prototype.gatherDatasets_ = function(rolledSeries, dateWindow) {
        var this$1 = this;

        var boundaryIds = [];
        var points = [];
        var cumulativeYval = [];
        var extremes = {};
        var seriesIdx, sampleIdx;
        var firstIdx, lastIdx;
        var axisIdx;
        var num_series = rolledSeries.length - 1;
        var series;
        for (seriesIdx = num_series; seriesIdx >= 1; seriesIdx--) {
            if (!this$1.visibility()[seriesIdx - 1]) continue;
            if (dateWindow) {
                series = rolledSeries[seriesIdx];
                var low = dateWindow[0];
                var high = dateWindow[1];
                firstIdx = null;
                lastIdx = null;
                for (sampleIdx = 0; sampleIdx < series.length; sampleIdx++) {
                    if (series[sampleIdx][0] >= low && firstIdx === null) {
                        firstIdx = sampleIdx;
                    }
                    if (series[sampleIdx][0] <= high) {
                        lastIdx = sampleIdx;
                    }
                }
                if (firstIdx === null) firstIdx = 0;
                var correctedFirstIdx = firstIdx;
                var isInvalidValue = true;
                while (isInvalidValue && correctedFirstIdx > 0) {
                    correctedFirstIdx--;
                    isInvalidValue = series[correctedFirstIdx][1] === null;
                }
                if (lastIdx === null) lastIdx = series.length - 1;
                var correctedLastIdx = lastIdx;
                isInvalidValue = true;
                while (isInvalidValue && correctedLastIdx < series.length - 1) {
                    correctedLastIdx++;
                    isInvalidValue = series[correctedLastIdx][1] === null;
                }
                if (correctedFirstIdx !== firstIdx) {
                    firstIdx = correctedFirstIdx;
                }
                if (correctedLastIdx !== lastIdx) {
                    lastIdx = correctedLastIdx;
                }
                boundaryIds[seriesIdx - 1] = [ firstIdx, lastIdx ];
                series = series.slice(firstIdx, lastIdx + 1);
            } else {
                series = rolledSeries[seriesIdx];
                boundaryIds[seriesIdx - 1] = [ 0, series.length - 1 ];
            }
            var seriesName = this$1.attr_("labels")[seriesIdx];
            var seriesExtremes = this$1.dataHandler_.getExtremeYValues(series, dateWindow, this$1.getBooleanOption("stepPlot", seriesName));
            var seriesPoints = this$1.dataHandler_.seriesToPoints(series, seriesName, boundaryIds[seriesIdx - 1][0]);
            if (this$1.getBooleanOption("stackedGraph")) {
                axisIdx = this$1.attributes_.axisForSeries(seriesName);
                if (cumulativeYval[axisIdx] === undefined) {
                    cumulativeYval[axisIdx] = [];
                }
                Dygraph.stackPoints_(seriesPoints, cumulativeYval[axisIdx], seriesExtremes, this$1.getBooleanOption("stackedGraphNaNFill"));
            }
            extremes[seriesName] = seriesExtremes;
            points[seriesIdx] = seriesPoints;
        }
        return {
            points: points,
            extremes: extremes,
            boundaryIds: boundaryIds
        };
    };
    Dygraph.prototype.drawGraph_ = function() {
        var this$1 = this;

        var start = new Date();
        var is_initial_draw = this.is_initial_draw_;
        this.is_initial_draw_ = false;
        this.layout_.removeAllDatasets();
        this.setColors_();
        this.attrs_.pointSize = .5 * this.getNumericOption("highlightCircleSize");
        var packed = this.gatherDatasets_(this.rolledSeries_, this.dateWindow_);
        var points = packed.points;
        var extremes = packed.extremes;
        this.boundaryIds_ = packed.boundaryIds;
        this.setIndexByName_ = {};
        var labels = this.attr_("labels");
        if (labels.length > 0) {
            this.setIndexByName_[labels[0]] = 0;
        }
        var dataIdx = 0;
        for (var i = 1; i < points.length; i++) {
            this$1.setIndexByName_[labels[i]] = i;
            if (!this$1.visibility()[i - 1]) continue;
            this$1.layout_.addDataset(labels[i], points[i]);
            this$1.datasetIndex_[i] = dataIdx++;
        }
        this.computeYAxisRanges_(extremes);
        this.layout_.setYAxes(this.axes_);
        this.addXTicks_();
        var tmp_zoomed_x = this.zoomed_x_;
        this.zoomed_x_ = tmp_zoomed_x;
        this.layout_.evaluate();
        this.renderGraph_(is_initial_draw);
        if (this.getStringOption("timingName")) {
            var end = new Date();
            console.log(this.getStringOption("timingName") + " - drawGraph: " + (end - start) + "ms");
        }
    };
    Dygraph.prototype.renderGraph_ = function(is_initial_draw) {
        var this$1 = this;

        this.cascadeEvents_("clearChart");
        this.plotter_.clear();
        if (this.getFunctionOption("underlayCallback")) {
            this.getFunctionOption("underlayCallback").call(this, this.hidden_ctx_, this.layout_.getPlotArea(), this, this);
        }
        var e = {
            canvas: this.hidden_,
            drawingContext: this.hidden_ctx_
        };
        this.cascadeEvents_("willDrawChart", e);
        this.plotter_.render();
        this.cascadeEvents_("didDrawChart", e);
        this.lastRow_ = -1;
        this.canvas_.getContext("2d").clearRect(0, 0, this.width_, this.height_);
        if (this.getFunctionOption("drawCallback") !== null) {
            this.getFunctionOption("drawCallback").call(this, this, is_initial_draw);
        }
        if (is_initial_draw) {
            this.readyFired_ = true;
            while (this.readyFns_.length > 0) {
                var fn = this$1.readyFns_.pop();
                fn(this$1);
            }
        }
    };
    Dygraph.prototype.computeYAxes_ = function() {
        var this$1 = this;

        var valueWindows, axis, index, opts, v;
        if (this.axes_ !== undefined && this.user_attrs_.hasOwnProperty("valueRange") === false) {
            valueWindows = [];
            for (index = 0; index < this.axes_.length; index++) {
                valueWindows.push(this$1.axes_[index].valueWindow);
            }
        }
        this.axes_ = [];
        for (axis = 0; axis < this.attributes_.numAxes(); axis++) {
            opts = {
                g: this$1
            };
            Dygraph.update(opts, this$1.attributes_.axisOptions(axis));
            this$1.axes_[axis] = opts;
        }
        v = this.attr_("valueRange");
        if (v) this.axes_[0].valueRange = v;
        if (valueWindows !== undefined) {
            var idxCount = Math.min(valueWindows.length, this.axes_.length);
            for (index = 0; index < idxCount; index++) {
                this$1.axes_[index].valueWindow = valueWindows[index];
            }
        }
        for (axis = 0; axis < this.axes_.length; axis++) {
            if (axis === 0) {
                opts = this$1.optionsViewForAxis_("y" + (axis ? "2" : ""));
                v = opts("valueRange");
                if (v) this$1.axes_[axis].valueRange = v;
            } else {
                var axes = this$1.user_attrs_.axes;
                if (axes && axes.y2) {
                    v = axes.y2.valueRange;
                    if (v) this$1.axes_[axis].valueRange = v;
                }
            }
        }
    };
    Dygraph.prototype.numAxes = function() {
        return this.attributes_.numAxes();
    };
    Dygraph.prototype.axisPropertiesForSeries = function(series) {
        return this.axes_[this.attributes_.axisForSeries(series)];
    };
    Dygraph.prototype.computeYAxisRanges_ = function(extremes) {
        var this$1 = this;

        var isNullUndefinedOrNaN = function(num) {
            return isNaN(parseFloat(num));
        };
        var numAxes = this.attributes_.numAxes();
        var ypadCompat, span, series, ypad;
        var p_axis;
        for (var i = 0; i < numAxes; i++) {
            var axis = this$1.axes_[i];
            var logscale = this$1.attributes_.getForAxis("logscale", i);
            var includeZero = this$1.attributes_.getForAxis("includeZero", i);
            var independentTicks = this$1.attributes_.getForAxis("independentTicks", i);
            series = this$1.attributes_.seriesForAxis(i);
            ypadCompat = true;
            ypad = .1;
            if (this$1.getNumericOption("yRangePad") !== null) {
                ypadCompat = false;
                ypad = this$1.getNumericOption("yRangePad") / this$1.plotter_.area.h;
            }
            if (series.length === 0) {
                axis.extremeRange = [ 0, 1 ];
            } else {
                var minY = Infinity;
                var maxY = -Infinity;
                var extremeMinY, extremeMaxY;
                for (var j = 0; j < series.length; j++) {
                    if (!extremes.hasOwnProperty(series[j])) continue;
                    extremeMinY = extremes[series[j]][0];
                    if (extremeMinY !== null) {
                        minY = Math.min(extremeMinY, minY);
                    }
                    extremeMaxY = extremes[series[j]][1];
                    if (extremeMaxY !== null) {
                        maxY = Math.max(extremeMaxY, maxY);
                    }
                }
                if (includeZero && !logscale) {
                    if (minY > 0) minY = 0;
                    if (maxY < 0) maxY = 0;
                }
                if (minY == Infinity) minY = 0;
                if (maxY == -Infinity) maxY = 1;
                span = maxY - minY;
                if (span === 0) {
                    if (maxY !== 0) {
                        span = Math.abs(maxY);
                    } else {
                        maxY = 1;
                        span = 1;
                    }
                }
                var maxAxisY, minAxisY;
                if (logscale) {
                    if (ypadCompat) {
                        maxAxisY = maxY + ypad * span;
                        minAxisY = minY;
                    } else {
                        var logpad = Math.exp(Math.log(span) * ypad);
                        maxAxisY = maxY * logpad;
                        minAxisY = minY / logpad;
                    }
                } else {
                    maxAxisY = maxY + ypad * span;
                    minAxisY = minY - ypad * span;
                    if (ypadCompat && !this$1.getBooleanOption("avoidMinZero")) {
                        if (minAxisY < 0 && minY >= 0) minAxisY = 0;
                        if (maxAxisY > 0 && maxY <= 0) maxAxisY = 0;
                    }
                }
                axis.extremeRange = [ minAxisY, maxAxisY ];
            }
            if (axis.valueWindow) {
                axis.computedValueRange = [ axis.valueWindow[0], axis.valueWindow[1] ];
            } else if (axis.valueRange) {
                var y0 = isNullUndefinedOrNaN(axis.valueRange[0]) ? axis.extremeRange[0] : axis.valueRange[0];
                var y1 = isNullUndefinedOrNaN(axis.valueRange[1]) ? axis.extremeRange[1] : axis.valueRange[1];
                if (!ypadCompat) {
                    if (axis.logscale) {
                        var logpad = Math.exp(Math.log(span) * ypad);
                        y0 *= logpad;
                        y1 /= logpad;
                    } else {
                        span = y1 - y0;
                        y0 -= span * ypad;
                        y1 += span * ypad;
                    }
                }
                axis.computedValueRange = [ y0, y1 ];
            } else {
                axis.computedValueRange = axis.extremeRange;
            }
            if (independentTicks) {
                axis.independentTicks = independentTicks;
                var opts = this$1.optionsViewForAxis_("y" + (i ? "2" : ""));
                var ticker = opts("ticker");
                axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this$1.plotter_.area.h, opts, this$1);
                if (!p_axis) p_axis = axis;
            }
        }
        if (p_axis === undefined) {
            throw 'Configuration Error: At least one axis has to have the "independentTicks" option activated.';
        }
        for (var i = 0; i < numAxes; i++) {
            var axis = this$1.axes_[i];
            if (!axis.independentTicks) {
                var opts = this$1.optionsViewForAxis_("y" + (i ? "2" : ""));
                var ticker = opts("ticker");
                var p_ticks = p_axis.ticks;
                var p_scale = p_axis.computedValueRange[1] - p_axis.computedValueRange[0];
                var scale = axis.computedValueRange[1] - axis.computedValueRange[0];
                var tick_values = [];
                for (var k = 0; k < p_ticks.length; k++) {
                    var y_frac = (p_ticks[k].v - p_axis.computedValueRange[0]) / p_scale;
                    var y_val = axis.computedValueRange[0] + y_frac * scale;
                    tick_values.push(y_val);
                }
                axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this$1.plotter_.area.h, opts, this$1, tick_values);
            }
        }
    };
    Dygraph.prototype.detectTypeFromString_ = function(str) {
        var isDate = false;
        var dashPos = str.indexOf("-");
        if (dashPos > 0 && (str[dashPos - 1] != "e" && str[dashPos - 1] != "E") || str.indexOf("/") >= 0 || isNaN(parseFloat(str))) {
            isDate = true;
        } else if (str.length == 8 && str > "19700101" && str < "20371231") {
            isDate = true;
        }
        this.setXAxisOptions_(isDate);
    };
    Dygraph.prototype.setXAxisOptions_ = function(isDate) {
        if (isDate) {
            this.attrs_.xValueParser = Dygraph.dateParser;
            this.attrs_.axes.x.valueFormatter = Dygraph.dateValueFormatter;
            this.attrs_.axes.x.ticker = Dygraph.dateTicker;
            this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisLabelFormatter;
        } else {
            this.attrs_.xValueParser = function(x) {
                return parseFloat(x);
            };
            this.attrs_.axes.x.valueFormatter = function(x) {
                return x;
            };
            this.attrs_.axes.x.ticker = Dygraph.numericTicks;
            this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
        }
    };
    Dygraph.prototype.parseCSV_ = function(data) {
        var this$1 = this;

        var ret = [];
        var line_delimiter = Dygraph.detectLineDelimiter(data);
        var lines = data.split(line_delimiter || "\n");
        var vals, j;
        var delim = this.getStringOption("delimiter");
        if (lines[0].indexOf(delim) == -1 && lines[0].indexOf("\t") >= 0) {
            delim = "\t";
        }
        var start = 0;
        if (!("labels" in this.user_attrs_)) {
            start = 1;
            this.attrs_.labels = lines[0].split(delim);
            this.attributes_.reparseSeries();
        }
        var line_no = 0;
        var xParser;
        var defaultParserSet = false;
        var expectedCols = this.attr_("labels").length;
        var outOfOrder = false;
        for (var i = start; i < lines.length; i++) {
            var line = lines[i];
            line_no = i;
            if (line.length === 0) continue;
            if (line[0] == "#") continue;
            var inFields = line.split(delim);
            if (inFields.length < 2) continue;
            var fields = [];
            if (!defaultParserSet) {
                this$1.detectTypeFromString_(inFields[0]);
                xParser = this$1.getFunctionOption("xValueParser");
                defaultParserSet = true;
            }
            fields[0] = xParser(inFields[0], this$1);
            if (this$1.fractions_) {
                for (j = 1; j < inFields.length; j++) {
                    vals = inFields[j].split("/");
                    if (vals.length != 2) {
                        console.error('Expected fractional "num/den" values in CSV data ' + "but found a value '" + inFields[j] + "' on line " + (1 + i) + " ('" + line + "') which is not of this form.");
                        fields[j] = [ 0, 0 ];
                    } else {
                        fields[j] = [ Dygraph.parseFloat_(vals[0], i, line), Dygraph.parseFloat_(vals[1], i, line) ];
                    }
                }
            } else if (this$1.getBooleanOption("errorBars")) {
                if (inFields.length % 2 != 1) {
                    console.error("Expected alternating (value, stdev.) pairs in CSV data " + "but line " + (1 + i) + " has an odd number of values (" + (inFields.length - 1) + "): '" + line + "'");
                }
                for (j = 1; j < inFields.length; j += 2) {
                    fields[(j + 1) / 2] = [ Dygraph.parseFloat_(inFields[j], i, line), Dygraph.parseFloat_(inFields[j + 1], i, line) ];
                }
            } else if (this$1.getBooleanOption("customBars")) {
                for (j = 1; j < inFields.length; j++) {
                    var val = inFields[j];
                    if (/^ *$/.test(val)) {
                        fields[j] = [ null, null, null ];
                    } else {
                        vals = val.split(";");
                        if (vals.length == 3) {
                            fields[j] = [ Dygraph.parseFloat_(vals[0], i, line), Dygraph.parseFloat_(vals[1], i, line), Dygraph.parseFloat_(vals[2], i, line) ];
                        } else {
                            console.warn("When using customBars, values must be either blank " + 'or "low;center;high" tuples (got "' + val + '" on line ' + (1 + i));
                        }
                    }
                }
            } else {
                for (j = 1; j < inFields.length; j++) {
                    fields[j] = Dygraph.parseFloat_(inFields[j], i, line);
                }
            }
            if (ret.length > 0 && fields[0] < ret[ret.length - 1][0]) {
                outOfOrder = true;
            }
            if (fields.length != expectedCols) {
                console.error("Number of columns in line " + i + " (" + fields.length + ") does not agree with number of labels (" + expectedCols + ") " + line);
            }
            if (i === 0 && this$1.attr_("labels")) {
                var all_null = true;
                for (j = 0; all_null && j < fields.length; j++) {
                    if (fields[j]) all_null = false;
                }
                if (all_null) {
                    console.warn("The dygraphs 'labels' option is set, but the first row " + "of CSV data ('" + line + "') appears to also contain " + "labels. Will drop the CSV labels and use the option " + "labels.");
                    continue;
                }
            }
            ret.push(fields);
        }
        if (outOfOrder) {
            console.warn("CSV is out of order; order it correctly to speed loading.");
            ret.sort(function(a, b) {
                return a[0] - b[0];
            });
        }
        return ret;
    };
    Dygraph.prototype.parseArray_ = function(data) {
        var this$1 = this;

        if (data.length === 0) {
            console.warn("Can't plot empty data set");
            return null;
        }
        if (data[0].length === 0) {
            console.error("Data set cannot contain an empty row");
            return null;
        }
        var i;
        if (this.attr_("labels") === null) {
            console.warn("Using default labels. Set labels explicitly via 'labels' " + "in the options parameter");
            this.attrs_.labels = [ "X" ];
            for (i = 1; i < data[0].length; i++) {
                this$1.attrs_.labels.push("Y" + i);
            }
            this.attributes_.reparseSeries();
        } else {
            var num_labels = this.attr_("labels");
            if (num_labels.length != data[0].length) {
                console.error("Mismatch between number of labels (" + num_labels + ")" + " and number of columns in array (" + data[0].length + ")");
                return null;
            }
        }
        if (Dygraph.isDateLike(data[0][0])) {
            this.attrs_.axes.x.valueFormatter = Dygraph.dateValueFormatter;
            this.attrs_.axes.x.ticker = Dygraph.dateTicker;
            this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisLabelFormatter;
            var parsedData = Dygraph.clone(data);
            for (i = 0; i < data.length; i++) {
                if (parsedData[i].length === 0) {
                    console.error("Row " + (1 + i) + " of data is empty");
                    return null;
                }
                if (parsedData[i][0] === null || typeof parsedData[i][0].getTime != "function" || isNaN(parsedData[i][0].getTime())) {
                    console.error("x value in row " + (1 + i) + " is not a Date");
                    return null;
                }
                parsedData[i][0] = parsedData[i][0].getTime();
            }
            return parsedData;
        } else {
            this.attrs_.axes.x.valueFormatter = function(x) {
                return x;
            };
            this.attrs_.axes.x.ticker = Dygraph.numericTicks;
            this.attrs_.axes.x.axisLabelFormatter = Dygraph.numberAxisLabelFormatter;
            return data;
        }
    };
    Dygraph.prototype.parseDataTable_ = function(data) {
        var this$1 = this;

        var shortTextForAnnotationNum = function(num) {
            var shortText = String.fromCharCode(65 + num % 26);
            num = Math.floor(num / 26);
            while (num > 0) {
                shortText = String.fromCharCode(65 + (num - 1) % 26) + shortText.toLowerCase();
                num = Math.floor((num - 1) / 26);
            }
            return shortText;
        };
        var cols = data.getNumberOfColumns();
        var rows = data.getNumberOfRows();
        var indepType = data.getColumnType(0);
        if (indepType == "date" || indepType == "datetime") {
            this.attrs_.xValueParser = Dygraph.dateParser;
            this.attrs_.axes.x.valueFormatter = Dygraph.dateValueFormatter;
            this.attrs_.axes.x.ticker = Dygraph.dateTicker;
            this.attrs_.axes.x.axisLabelFormatter = Dygraph.dateAxisLabelFormatter;
        } else if (indepType == "number") {
            this.attrs_.xValueParser = function(x) {
                return parseFloat(x);
            };
            this.attrs_.axes.x.valueFormatter = function(x) {
                return x;
            };
            this.attrs_.axes.x.ticker = Dygraph.numericTicks;
            this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
        } else {
            console.error("only 'date', 'datetime' and 'number' types are supported " + "for column 1 of DataTable input (Got '" + indepType + "')");
            return null;
        }
        var colIdx = [];
        var annotationCols = {};
        var hasAnnotations = false;
        var i, j;
        for (i = 1; i < cols; i++) {
            var type = data.getColumnType(i);
            if (type == "number") {
                colIdx.push(i);
            } else if (type == "string" && this$1.getBooleanOption("displayAnnotations")) {
                var dataIdx = colIdx[colIdx.length - 1];
                if (!annotationCols.hasOwnProperty(dataIdx)) {
                    annotationCols[dataIdx] = [ i ];
                } else {
                    annotationCols[dataIdx].push(i);
                }
                hasAnnotations = true;
            } else {
                console.error("Only 'number' is supported as a dependent type with Gviz." + " 'string' is only supported if displayAnnotations is true");
            }
        }
        var labels = [ data.getColumnLabel(0) ];
        for (i = 0; i < colIdx.length; i++) {
            labels.push(data.getColumnLabel(colIdx[i]));
            if (this$1.getBooleanOption("errorBars")) i += 1;
        }
        this.attrs_.labels = labels;
        cols = labels.length;
        var ret = [];
        var outOfOrder = false;
        var annotations = [];
        for (i = 0; i < rows; i++) {
            var row = [];
            if (typeof data.getValue(i, 0) === "undefined" || data.getValue(i, 0) === null) {
                console.warn("Ignoring row " + i + " of DataTable because of undefined or null first column.");
                continue;
            }
            if (indepType == "date" || indepType == "datetime") {
                row.push(data.getValue(i, 0).getTime());
            } else {
                row.push(data.getValue(i, 0));
            }
            if (!this$1.getBooleanOption("errorBars")) {
                for (j = 0; j < colIdx.length; j++) {
                    var col = colIdx[j];
                    row.push(data.getValue(i, col));
                    if (hasAnnotations && annotationCols.hasOwnProperty(col) && data.getValue(i, annotationCols[col][0]) !== null) {
                        var ann = {};
                        ann.series = data.getColumnLabel(col);
                        ann.xval = row[0];
                        ann.shortText = shortTextForAnnotationNum(annotations.length);
                        ann.text = "";
                        for (var k = 0; k < annotationCols[col].length; k++) {
                            if (k) ann.text += "\n";
                            ann.text += data.getValue(i, annotationCols[col][k]);
                        }
                        annotations.push(ann);
                    }
                }
                for (j = 0; j < row.length; j++) {
                    if (!isFinite(row[j])) row[j] = null;
                }
            } else {
                for (j = 0; j < cols - 1; j++) {
                    row.push([ data.getValue(i, 1 + 2 * j), data.getValue(i, 2 + 2 * j) ]);
                }
            }
            if (ret.length > 0 && row[0] < ret[ret.length - 1][0]) {
                outOfOrder = true;
            }
            ret.push(row);
        }
        if (outOfOrder) {
            console.warn("DataTable is out of order; order it correctly to speed loading.");
            ret.sort(function(a, b) {
                return a[0] - b[0];
            });
        }
        this.rawData_ = ret;
        if (annotations.length > 0) {
            this.setAnnotations(annotations, true);
        }
        this.attributes_.reparseSeries();
    };
    Dygraph.prototype.cascadeDataDidUpdateEvent_ = function() {
        this.cascadeEvents_("dataDidUpdate", {});
    };
    Dygraph.prototype.start_ = function() {
        var data = this.file_;
        if (typeof data == "function") {
            data = data();
        }
        if (Dygraph.isArrayLike(data)) {
            this.rawData_ = this.parseArray_(data);
            this.cascadeDataDidUpdateEvent_();
            this.predraw_();
        } else if (typeof data == "object" && typeof data.getColumnRange == "function") {
            this.parseDataTable_(data);
            this.cascadeDataDidUpdateEvent_();
            this.predraw_();
        } else if (typeof data == "string") {
            var line_delimiter = Dygraph.detectLineDelimiter(data);
            if (line_delimiter) {
                this.loadedEvent_(data);
            } else {
                var req;
                if (window.XMLHttpRequest) {
                    req = new XMLHttpRequest();
                } else {
                    req = new ActiveXObject("Microsoft.XMLHTTP");
                }
                var caller = this;
                req.onreadystatechange = function() {
                    if (req.readyState == 4) {
                        if (req.status === 200 || req.status === 0) {
                            caller.loadedEvent_(req.responseText);
                        }
                    }
                };
                req.open("GET", data, true);
                req.send(null);
            }
        } else {
            console.error("Unknown data format: " + typeof data);
        }
    };
    Dygraph.prototype.updateOptions = function(input_attrs, block_redraw) {
        if (typeof block_redraw == "undefined") block_redraw = false;
        this.plotter_.clear();
        var file = input_attrs.file;
        var attrs = Dygraph.mapLegacyOptions_(input_attrs);
        if ("rollPeriod" in attrs) {
            this.rollPeriod_ = attrs.rollPeriod;
        }
        if ("dateWindow" in attrs) {
            this.dateWindow_ = attrs.dateWindow;
            if (!("isZoomedIgnoreProgrammaticZoom" in attrs)) {
                this.zoomed_x_ = attrs.dateWindow !== null;
            }
        }
        if ("valueRange" in attrs && !("isZoomedIgnoreProgrammaticZoom" in attrs)) {
            this.zoomed_y_ = attrs.valueRange !== null;
        }
        var requiresNewPoints = Dygraph.isPixelChangingOptionList(this.attr_("labels"), attrs);
        Dygraph.updateDeep(this.user_attrs_, attrs);
        this.attributes_.reparseSeries();
        if (file) {
            this.cascadeEvents_("dataWillUpdate", {});
            this.file_ = file;
            if (!block_redraw) this.start_();
        } else {
            if (!block_redraw) {
                if (requiresNewPoints) {
                    this.predraw_();
                } else {
                    this.renderGraph_(false);
                }
            }
        }
    };
    Dygraph.mapLegacyOptions_ = function(attrs) {
        var my_attrs = {};
        for (var k in attrs) {
            if (!attrs.hasOwnProperty(k)) continue;
            if (k == "file") continue;
            if (attrs.hasOwnProperty(k)) my_attrs[k] = attrs[k];
        }
        var set = function(axis, opt, value) {
            if (!my_attrs.axes) my_attrs.axes = {};
            if (!my_attrs.axes[axis]) my_attrs.axes[axis] = {};
            my_attrs.axes[axis][opt] = value;
        };
        var map = function(opt, axis, new_opt) {
            if (typeof attrs[opt] != "undefined") {
                console.warn("Option " + opt + " is deprecated. Use the " + new_opt + " option for the " + axis + " axis instead. " + "(e.g. { axes : { " + axis + " : { " + new_opt + " : ... } } } " + "(see http://dygraphs.com/per-axis.html for more information.");
                set(axis, new_opt, attrs[opt]);
                delete my_attrs[opt];
            }
        };
        map("xValueFormatter", "x", "valueFormatter");
        map("pixelsPerXLabel", "x", "pixelsPerLabel");
        map("xAxisLabelFormatter", "x", "axisLabelFormatter");
        map("xTicker", "x", "ticker");
        map("yValueFormatter", "y", "valueFormatter");
        map("pixelsPerYLabel", "y", "pixelsPerLabel");
        map("yAxisLabelFormatter", "y", "axisLabelFormatter");
        map("yTicker", "y", "ticker");
        map("drawXGrid", "x", "drawGrid");
        map("drawXAxis", "x", "drawAxis");
        map("drawYGrid", "y", "drawGrid");
        map("drawYAxis", "y", "drawAxis");
        map("xAxisLabelWidth", "x", "axisLabelWidth");
        map("yAxisLabelWidth", "y", "axisLabelWidth");
        return my_attrs;
    };
    Dygraph.prototype.resize = function(width, height) {
        if (this.resize_lock) {
            return;
        }
        this.resize_lock = true;
        if (width === null != (height === null)) {
            console.warn("Dygraph.resize() should be called with zero parameters or " + "two non-NULL parameters. Pretending it was zero.");
            width = height = null;
        }
        var old_width = this.width_;
        var old_height = this.height_;
        if (width) {
            this.maindiv_.style.width = width + "px";
            this.maindiv_.style.height = height + "px";
            this.width_ = width;
            this.height_ = height;
        } else {
            this.width_ = this.maindiv_.clientWidth;
            this.height_ = this.maindiv_.clientHeight;
        }
        if (old_width != this.width_ || old_height != this.height_) {
            this.resizeElements_();
            this.predraw_();
        }
        this.resize_lock = false;
    };
    Dygraph.prototype.adjustRoll = function(length) {
        this.rollPeriod_ = length;
        this.predraw_();
    };
    Dygraph.prototype.visibility = function() {
        var this$1 = this;

        if (!this.getOption("visibility")) {
            this.attrs_.visibility = [];
        }
        while (this.getOption("visibility").length < this.numColumns() - 1) {
            this$1.attrs_.visibility.push(true);
        }
        return this.getOption("visibility");
    };
    Dygraph.prototype.setVisibility = function(num, value) {
        var x = this.visibility();
        if (num < 0 || num >= x.length) {
            console.warn("invalid series number in setVisibility: " + num);
        } else {
            x[num] = value;
            this.predraw_();
        }
    };
    Dygraph.prototype.size = function() {
        return {
            width: this.width_,
            height: this.height_
        };
    };
    Dygraph.prototype.setAnnotations = function(ann, suppressDraw) {
        Dygraph.addAnnotationRule();
        this.annotations_ = ann;
        if (!this.layout_) {
            console.warn("Tried to setAnnotations before dygraph was ready. " + "Try setting them in a ready() block. See " + "dygraphs.com/tests/annotation.html");
            return;
        }
        this.layout_.setAnnotations(this.annotations_);
        if (!suppressDraw) {
            this.predraw_();
        }
    };
    Dygraph.prototype.annotations = function() {
        return this.annotations_;
    };
    Dygraph.prototype.getLabels = function() {
        var labels = this.attr_("labels");
        return labels ? labels.slice() : null;
    };
    Dygraph.prototype.indexFromSetName = function(name) {
        return this.setIndexByName_[name];
    };
    Dygraph.prototype.ready = function(callback) {
        if (this.is_initial_draw_) {
            this.readyFns_.push(callback);
        } else {
            callback.call(this, this);
        }
    };
    Dygraph.addAnnotationRule = function() {
        if (Dygraph.addedAnnotationCSS) return;
        var rule = "border: 1px solid black; " + "background-color: white; " + "text-align: center;";
        var styleSheetElement = document.createElement("style");
        styleSheetElement.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
        for (var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) continue;
            var mysheet = document.styleSheets[i];
            try {
                if (mysheet.insertRule) {
                    var idx = mysheet.cssRules ? mysheet.cssRules.length : 0;
                    mysheet.insertRule(".dygraphDefaultAnnotation { " + rule + " }", idx);
                } else if (mysheet.addRule) {
                    mysheet.addRule(".dygraphDefaultAnnotation", rule);
                }
                Dygraph.addedAnnotationCSS = true;
                return;
            } catch (err) {}
        }
        console.warn("Unable to add default annotation CSS rule; display may be off.");
    };
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = Dygraph;
    }
    return Dygraph;
}();

(function() {
    "use strict";
    Dygraph.LOG_SCALE = 10;
    Dygraph.LN_TEN = Math.log(Dygraph.LOG_SCALE);
    Dygraph.log10 = function(x) {
        return Math.log(x) / Dygraph.LN_TEN;
    };
    Dygraph.DOTTED_LINE = [ 2, 2 ];
    Dygraph.DASHED_LINE = [ 7, 3 ];
    Dygraph.DOT_DASH_LINE = [ 7, 2, 2, 2 ];
    Dygraph.getContext = function(canvas) {
        return canvas.getContext("2d");
    };
    Dygraph.addEvent = function addEvent(elem, type, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        } else {
            elem[type + fn] = function() {
                fn(window.event);
            };
            elem.attachEvent("on" + type, elem[type + fn]);
        }
    };
    Dygraph.prototype.addAndTrackEvent = function(elem, type, fn) {
        Dygraph.addEvent(elem, type, fn);
        this.registeredEvents_.push({
            elem: elem,
            type: type,
            fn: fn
        });
    };
    Dygraph.removeEvent = function(elem, type, fn) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, fn, false);
        } else {
            try {
                elem.detachEvent("on" + type, elem[type + fn]);
            } catch (e) {}
            elem[type + fn] = null;
        }
    };
    Dygraph.prototype.removeTrackedEvents_ = function() {
        var this$1 = this;

        if (this.registeredEvents_) {
            for (var idx = 0; idx < this.registeredEvents_.length; idx++) {
                var reg = this$1.registeredEvents_[idx];
                Dygraph.removeEvent(reg.elem, reg.type, reg.fn);
            }
        }
        this.registeredEvents_ = [];
    };
    Dygraph.cancelEvent = function(e) {
        e = e ? e : window.event;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble = true;
        e.cancel = true;
        e.returnValue = false;
        return false;
    };
    Dygraph.hsvToRGB = function(hue, saturation, value) {
        var red;
        var green;
        var blue;
        if (saturation === 0) {
            red = value;
            green = value;
            blue = value;
        } else {
            var i = Math.floor(hue * 6);
            var f = hue * 6 - i;
            var p = value * (1 - saturation);
            var q = value * (1 - saturation * f);
            var t = value * (1 - saturation * (1 - f));
            switch (i) {
              case 1:
                red = q;
                green = value;
                blue = p;
                break;

              case 2:
                red = p;
                green = value;
                blue = t;
                break;

              case 3:
                red = p;
                green = q;
                blue = value;
                break;

              case 4:
                red = t;
                green = p;
                blue = value;
                break;

              case 5:
                red = value;
                green = p;
                blue = q;
                break;

              case 6:
              case 0:
                red = value;
                green = t;
                blue = p;
                break;
            }
        }
        red = Math.floor(255 * red + .5);
        green = Math.floor(255 * green + .5);
        blue = Math.floor(255 * blue + .5);
        return "rgb(" + red + "," + green + "," + blue + ")";
    };
    Dygraph.findPos = function(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            var copyObj = obj;
            while (1) {
                var borderLeft = "0", borderTop = "0";
                if (window.getComputedStyle) {
                    var computedStyle = window.getComputedStyle(copyObj, null);
                    borderLeft = computedStyle.borderLeft || "0";
                    borderTop = computedStyle.borderTop || "0";
                }
                curleft += parseInt(borderLeft, 10);
                curtop += parseInt(borderTop, 10);
                curleft += copyObj.offsetLeft;
                curtop += copyObj.offsetTop;
                if (!copyObj.offsetParent) {
                    break;
                }
                copyObj = copyObj.offsetParent;
            }
        } else {
            if (obj.x) curleft += obj.x;
            if (obj.y) curtop += obj.y;
        }
        while (obj && obj != document.body) {
            curleft -= obj.scrollLeft;
            curtop -= obj.scrollTop;
            obj = obj.parentNode;
        }
        return {
            x: curleft,
            y: curtop
        };
    };
    Dygraph.pageX = function(e) {
        if (e.pageX) {
            return !e.pageX || e.pageX < 0 ? 0 : e.pageX;
        } else {
            var de = document.documentElement;
            var b = document.body;
            return e.clientX + (de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
        }
    };
    Dygraph.pageY = function(e) {
        if (e.pageY) {
            return !e.pageY || e.pageY < 0 ? 0 : e.pageY;
        } else {
            var de = document.documentElement;
            var b = document.body;
            return e.clientY + (de.scrollTop || b.scrollTop) - (de.clientTop || 0);
        }
    };
    Dygraph.dragGetX_ = function(e, context) {
        return Dygraph.pageX(e) - context.px;
    };
    Dygraph.dragGetY_ = function(e, context) {
        return Dygraph.pageY(e) - context.py;
    };
    Dygraph.isOK = function(x) {
        return !!x && !isNaN(x);
    };
    Dygraph.isValidPoint = function(p, opt_allowNaNY) {
        if (!p) return false;
        if (p.yval === null) return false;
        if (p.x === null || p.x === undefined) return false;
        if (p.y === null || p.y === undefined) return false;
        if (isNaN(p.x) || !opt_allowNaNY && isNaN(p.y)) return false;
        return true;
    };
    Dygraph.floatFormat = function(x, opt_precision) {
        var p = Math.min(Math.max(1, opt_precision || 2), 21);
        return Math.abs(x) < .001 && x !== 0 ? x.toExponential(p - 1) : x.toPrecision(p);
    };
    Dygraph.zeropad = function(x) {
        if (x < 10) return "0" + x; else return "" + x;
    };
    Dygraph.DateAccessorsLocal = {
        getFullYear: function(d) {
            return d.getFullYear();
        },
        getMonth: function(d) {
            return d.getMonth();
        },
        getDate: function(d) {
            return d.getDate();
        },
        getHours: function(d) {
            return d.getHours();
        },
        getMinutes: function(d) {
            return d.getMinutes();
        },
        getSeconds: function(d) {
            return d.getSeconds();
        },
        getMilliseconds: function(d) {
            return d.getMilliseconds();
        },
        getDay: function(d) {
            return d.getDay();
        },
        makeDate: function(y, m, d, hh, mm, ss, ms) {
            return new Date(y, m, d, hh, mm, ss, ms);
        }
    };
    Dygraph.DateAccessorsUTC = {
        getFullYear: function(d) {
            return d.getUTCFullYear();
        },
        getMonth: function(d) {
            return d.getUTCMonth();
        },
        getDate: function(d) {
            return d.getUTCDate();
        },
        getHours: function(d) {
            return d.getUTCHours();
        },
        getMinutes: function(d) {
            return d.getUTCMinutes();
        },
        getSeconds: function(d) {
            return d.getUTCSeconds();
        },
        getMilliseconds: function(d) {
            return d.getUTCMilliseconds();
        },
        getDay: function(d) {
            return d.getUTCDay();
        },
        makeDate: function(y, m, d, hh, mm, ss, ms) {
            return new Date(Date.UTC(y, m, d, hh, mm, ss, ms));
        }
    };
    Dygraph.hmsString_ = function(hh, mm, ss) {
        var zeropad = Dygraph.zeropad;
        var ret = zeropad(hh) + ":" + zeropad(mm);
        if (ss) {
            ret += ":" + zeropad(ss);
        }
        return ret;
    };
    Dygraph.dateString_ = function(time, utc) {
        var zeropad = Dygraph.zeropad;
        var accessors = utc ? Dygraph.DateAccessorsUTC : Dygraph.DateAccessorsLocal;
        var date = new Date(time);
        var y = accessors.getFullYear(date);
        var m = accessors.getMonth(date);
        var d = accessors.getDate(date);
        var hh = accessors.getHours(date);
        var mm = accessors.getMinutes(date);
        var ss = accessors.getSeconds(date);
        var year = "" + y;
        var month = zeropad(m + 1);
        var day = zeropad(d);
        var frac = hh * 3600 + mm * 60 + ss;
        var ret = year + "/" + month + "/" + day;
        if (frac) {
            ret += " " + Dygraph.hmsString_(hh, mm, ss);
        }
        return ret;
    };
    Dygraph.dateTimezoneString_ = function(time, timezone) {
        var zeropad = Dygraph.zeropad;
        var accessors = timezone ? timezone : Dygraph.DateAccessorsLocal;
        var date = new Date(time);
        var y = accessors.getFullYear(date);
        var m = accessors.getMonth(date);
        var d = accessors.getDate(date);
        var hh = accessors.getHours(date);
        var mm = accessors.getMinutes(date);
        var ss = accessors.getSeconds(date);
        var year = "" + y;
        var month = zeropad(m + 1);
        var day = zeropad(d);
        var frac = hh * 3600 + mm * 60 + ss;
        var ret = year + "/" + month + "/" + day;
        if (frac) {
            ret += " " + Dygraph.hmsString_(hh, mm, ss);
        }
        return ret;
    };
    Dygraph.round_ = function(num, places) {
        var shift = Math.pow(10, places);
        return Math.round(num * shift) / shift;
    };
    Dygraph.binarySearch = function(val, arry, abs, low, high) {
        if (low === null || low === undefined || high === null || high === undefined) {
            low = 0;
            high = arry.length - 1;
        }
        if (low > high) {
            return -1;
        }
        if (abs === null || abs === undefined) {
            abs = 0;
        }
        var validIndex = function(idx) {
            return idx >= 0 && idx < arry.length;
        };
        var mid = parseInt((low + high) / 2, 10);
        var element = arry[mid];
        var idx;
        if (element == val) {
            return mid;
        } else if (element > val) {
            if (abs > 0) {
                idx = mid - 1;
                if (validIndex(idx) && arry[idx] < val) {
                    return mid;
                }
            }
            return Dygraph.binarySearch(val, arry, abs, low, mid - 1);
        } else if (element < val) {
            if (abs < 0) {
                idx = mid + 1;
                if (validIndex(idx) && arry[idx] > val) {
                    return mid;
                }
            }
            return Dygraph.binarySearch(val, arry, abs, mid + 1, high);
        }
        return -1;
    };
    Dygraph.dateParser = function(dateStr) {
        var dateStrSlashed;
        var d;
        if (dateStr.search("-") == -1 || dateStr.search("T") != -1 || dateStr.search("Z") != -1) {
            d = Dygraph.dateStrToMillis(dateStr);
            if (d && !isNaN(d)) return d;
        }
        if (dateStr.search("-") != -1) {
            dateStrSlashed = dateStr.replace("-", "/", "g");
            while (dateStrSlashed.search("-") != -1) {
                dateStrSlashed = dateStrSlashed.replace("-", "/");
            }
            d = Dygraph.dateStrToMillis(dateStrSlashed);
        } else if (dateStr.length == 8) {
            dateStrSlashed = dateStr.substr(0, 4) + "/" + dateStr.substr(4, 2) + "/" + dateStr.substr(6, 2);
            d = Dygraph.dateStrToMillis(dateStrSlashed);
        } else {
            d = Dygraph.dateStrToMillis(dateStr);
        }
        if (!d || isNaN(d)) {
            console.error("Couldn't parse " + dateStr + " as a date");
        }
        return d;
    };
    Dygraph.dateStrToMillis = function(str) {
        return new Date(str).getTime();
    };
    Dygraph.update = function(self, o) {
        if (typeof o != "undefined" && o !== null) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    self[k] = o[k];
                }
            }
        }
        return self;
    };
    Dygraph.updateDeep = function(self, o) {
        function isNode(o) {
            return typeof Node === "object" ? o instanceof Node : typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
        }
        if (typeof o != "undefined" && o !== null) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    if (o[k] === null) {
                        self[k] = null;
                    } else if (Dygraph.isArrayLike(o[k])) {
                        self[k] = o[k].slice();
                    } else if (isNode(o[k])) {
                        self[k] = o[k];
                    } else if (typeof o[k] == "object") {
                        if (typeof self[k] != "object" || self[k] === null) {
                            self[k] = {};
                        }
                        Dygraph.updateDeep(self[k], o[k]);
                    } else {
                        self[k] = o[k];
                    }
                }
            }
        }
        return self;
    };
    Dygraph.isArrayLike = function(o) {
        var typ = typeof o;
        if (typ != "object" && !(typ == "function" && typeof o.item == "function") || o === null || typeof o.length != "number" || o.nodeType === 3) {
            return false;
        }
        return true;
    };
    Dygraph.isDateLike = function(o) {
        if (typeof o != "object" || o === null || typeof o.getTime != "function") {
            return false;
        }
        return true;
    };
    Dygraph.clone = function(o) {
        var r = [];
        for (var i = 0; i < o.length; i++) {
            if (Dygraph.isArrayLike(o[i])) {
                r.push(Dygraph.clone(o[i]));
            } else {
                r.push(o[i]);
            }
        }
        return r;
    };
    Dygraph.createCanvas = function() {
        var canvas = document.createElement("canvas");
        var isIE = /MSIE/.test(navigator.userAgent) && !window.opera;
        if (isIE && typeof G_vmlCanvasManager != "undefined") {
            canvas = G_vmlCanvasManager.initElement(canvas);
        }
        return canvas;
    };
    Dygraph.getContextPixelRatio = function(context) {
        try {
            var devicePixelRatio = window.devicePixelRatio;
            var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
            if (devicePixelRatio !== undefined) {
                return devicePixelRatio / backingStoreRatio;
            } else {
                return 1;
            }
        } catch (e) {
            return 1;
        }
    };
    Dygraph.isAndroid = function() {
        return /Android/.test(navigator.userAgent);
    };
    Dygraph.Iterator = function(array, start, length, predicate) {
        start = start || 0;
        length = length || array.length;
        this.hasNext = true;
        this.peek = null;
        this.start_ = start;
        this.array_ = array;
        this.predicate_ = predicate;
        this.end_ = Math.min(array.length, start + length);
        this.nextIdx_ = start - 1;
        this.next();
    };
    Dygraph.Iterator.prototype.next = function() {
        var this$1 = this;

        if (!this.hasNext) {
            return null;
        }
        var obj = this.peek;
        var nextIdx = this.nextIdx_ + 1;
        var found = false;
        while (nextIdx < this.end_) {
            if (!this$1.predicate_ || this$1.predicate_(this$1.array_, nextIdx)) {
                this$1.peek = this$1.array_[nextIdx];
                found = true;
                break;
            }
            nextIdx++;
        }
        this.nextIdx_ = nextIdx;
        if (!found) {
            this.hasNext = false;
            this.peek = null;
        }
        return obj;
    };
    Dygraph.createIterator = function(array, start, length, opt_predicate) {
        return new Dygraph.Iterator(array, start, length, opt_predicate);
    };
    Dygraph.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1e3 / 60);
        };
    }();
    Dygraph.repeatAndCleanup = function(repeatFn, maxFrames, framePeriodInMillis, cleanupFn) {
        var frameNumber = 0;
        var previousFrameNumber;
        var startTime = new Date().getTime();
        repeatFn(frameNumber);
        if (maxFrames == 1) {
            cleanupFn();
            return;
        }
        var maxFrameArg = maxFrames - 1;
        (function loop() {
            if (frameNumber >= maxFrames) return;
            Dygraph.requestAnimFrame.call(window, function() {
                var currentTime = new Date().getTime();
                var delayInMillis = currentTime - startTime;
                previousFrameNumber = frameNumber;
                frameNumber = Math.floor(delayInMillis / framePeriodInMillis);
                var frameDelta = frameNumber - previousFrameNumber;
                var predictOvershootStutter = frameNumber + frameDelta > maxFrameArg;
                if (predictOvershootStutter || frameNumber >= maxFrameArg) {
                    repeatFn(maxFrameArg);
                    cleanupFn();
                } else {
                    if (frameDelta !== 0) {
                        repeatFn(frameNumber);
                    }
                    loop();
                }
            });
        })();
    };
    var pixelSafeOptions = {
        annotationClickHandler: true,
        annotationDblClickHandler: true,
        annotationMouseOutHandler: true,
        annotationMouseOverHandler: true,
        axisLabelColor: true,
        axisLineColor: true,
        axisLineWidth: true,
        clickCallback: true,
        drawCallback: true,
        drawHighlightPointCallback: true,
        drawPoints: true,
        drawPointCallback: true,
        drawXGrid: true,
        drawYGrid: true,
        fillAlpha: true,
        gridLineColor: true,
        gridLineWidth: true,
        hideOverlayOnMouseOut: true,
        highlightCallback: true,
        highlightCircleSize: true,
        interactionModel: true,
        isZoomedIgnoreProgrammaticZoom: true,
        labelsDiv: true,
        labelsDivStyles: true,
        labelsDivWidth: true,
        labelsKMB: true,
        labelsKMG2: true,
        labelsSeparateLines: true,
        labelsShowZeroValues: true,
        legend: true,
        panEdgeFraction: true,
        pixelsPerYLabel: true,
        pointClickCallback: true,
        pointSize: true,
        rangeSelectorPlotFillColor: true,
        rangeSelectorPlotStrokeColor: true,
        showLabelsOnHighlight: true,
        showRoller: true,
        strokeWidth: true,
        underlayCallback: true,
        unhighlightCallback: true,
        zoomCallback: true
    };
    Dygraph.isPixelChangingOptionList = function(labels, attrs) {
        var seriesNamesDictionary = {};
        if (labels) {
            for (var i = 1; i < labels.length; i++) {
                seriesNamesDictionary[labels[i]] = true;
            }
        }
        var scanFlatOptions = function(options) {
            for (var property in options) {
                if (options.hasOwnProperty(property) && !pixelSafeOptions[property]) {
                    return true;
                }
            }
            return false;
        };
        for (var property in attrs) {
            if (!attrs.hasOwnProperty(property)) continue;
            if (property == "highlightSeriesOpts" || seriesNamesDictionary[property] && !attrs.series) {
                if (scanFlatOptions(attrs[property])) return true;
            } else if (property == "series" || property == "axes") {
                var perSeries = attrs[property];
                for (var series in perSeries) {
                    if (perSeries.hasOwnProperty(series) && scanFlatOptions(perSeries[series])) {
                        return true;
                    }
                }
            } else {
                if (!pixelSafeOptions[property]) return true;
            }
        }
        return false;
    };
    Dygraph.Circles = {
        DEFAULT: function(g, name, ctx, canvasx, canvasy, color, radius) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(canvasx, canvasy, radius, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    };
    Dygraph.IFrameTarp = function() {
        this.tarps = [];
    };
    Dygraph.IFrameTarp.prototype.cover = function() {
        var this$1 = this;

        var iframes = document.getElementsByTagName("iframe");
        for (var i = 0; i < iframes.length; i++) {
            var iframe = iframes[i];
            var pos = Dygraph.findPos(iframe), x = pos.x, y = pos.y, width = iframe.offsetWidth, height = iframe.offsetHeight;
            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = x + "px";
            div.style.top = y + "px";
            div.style.width = width + "px";
            div.style.height = height + "px";
            div.style.zIndex = 999;
            document.body.appendChild(div);
            this$1.tarps.push(div);
        }
    };
    Dygraph.IFrameTarp.prototype.uncover = function() {
        var this$1 = this;

        for (var i = 0; i < this.tarps.length; i++) {
            this$1.tarps[i].parentNode.removeChild(this$1.tarps[i]);
        }
        this.tarps = [];
    };
    Dygraph.detectLineDelimiter = function(data) {
        for (var i = 0; i < data.length; i++) {
            var code = data.charAt(i);
            if (code === "\r") {
                if (i + 1 < data.length && data.charAt(i + 1) === "\n") {
                    return "\r\n";
                }
                return code;
            }
            if (code === "\n") {
                if (i + 1 < data.length && data.charAt(i + 1) === "\r") {
                    return "\n\r";
                }
                return code;
            }
        }
        return null;
    };
    Dygraph.isNodeContainedBy = function(containee, container) {
        if (container === null || containee === null) {
            return false;
        }
        var containeeNode = containee;
        while (containeeNode && containeeNode !== container) {
            containeeNode = containeeNode.parentNode;
        }
        return containeeNode === container;
    };
    Dygraph.pow = function(base, exp) {
        if (exp < 0) {
            return 1 / Math.pow(base, -exp);
        }
        return Math.pow(base, exp);
    };
    var RGBA_RE = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([01](?:\.\d+)?))?\)$/;
    function parseRGBA(rgbStr) {
        var bits = RGBA_RE.exec(rgbStr);
        if (!bits) return null;
        var r = parseInt(bits[1], 10), g = parseInt(bits[2], 10), b = parseInt(bits[3], 10);
        if (bits[4]) {
            return {
                r: r,
                g: g,
                b: b,
                a: parseFloat(bits[4])
            };
        } else {
            return {
                r: r,
                g: g,
                b: b
            };
        }
    }
    Dygraph.toRGB_ = function(colorStr) {
        var rgb = parseRGBA(colorStr);
        if (rgb) return rgb;
        var div = document.createElement("div");
        div.style.backgroundColor = colorStr;
        div.style.visibility = "hidden";
        document.body.appendChild(div);
        var rgbStr;
        if (window.getComputedStyle) {
            rgbStr = window.getComputedStyle(div, null).backgroundColor;
        } else {
            rgbStr = div.currentStyle.backgroundColor;
        }
        document.body.removeChild(div);
        return parseRGBA(rgbStr);
    };
    Dygraph.isCanvasSupported = function(opt_canvasElement) {
        var canvas;
        try {
            canvas = opt_canvasElement || document.createElement("canvas");
            canvas.getContext("2d");
        } catch (e) {
            var ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
            var opera = navigator.userAgent.toLowerCase().indexOf("opera") != -1;
            if (!ie || ie[1] < 6 || opera) return false;
            return true;
        }
        return true;
    };
    Dygraph.parseFloat_ = function(x, opt_line_no, opt_line) {
        var val = parseFloat(x);
        if (!isNaN(val)) return val;
        if (/^ *$/.test(x)) return null;
        if (/^ *nan *$/i.test(x)) return NaN;
        var msg = "Unable to parse '" + x + "' as a number";
        if (opt_line !== undefined && opt_line_no !== undefined) {
            msg += " on line " + (1 + (opt_line_no || 0)) + " ('" + opt_line + "') of CSV.";
        }
        console.error(msg);
        return null;
    };
})();

(function() {
    "use strict";
    Dygraph.GVizChart = function(container) {
        this.container = container;
    };
    Dygraph.GVizChart.prototype.draw = function(data, options) {
        this.container.innerHTML = "";
        if (typeof this.date_graph != "undefined") {
            this.date_graph.destroy();
        }
        this.date_graph = new Dygraph(this.container, data, options);
    };
    Dygraph.GVizChart.prototype.setSelection = function(selection_array) {
        var row = false;
        if (selection_array.length) {
            row = selection_array[0].row;
        }
        this.date_graph.setSelection(row);
    };
    Dygraph.GVizChart.prototype.getSelection = function() {
        var selection = [];
        var row = this.date_graph.getSelection();
        if (row < 0) return selection;
        var points = this.date_graph.layout_.points;
        for (var setIdx = 0; setIdx < points.length; ++setIdx) {
            selection.push({
                row: row,
                column: setIdx + 1
            });
        }
        return selection;
    };
})();

(function() {
    "use strict";
    var DRAG_EDGE_MARGIN = 100;
    Dygraph.Interaction = {};
    Dygraph.Interaction.maybeTreatMouseOpAsClick = function(event, g, context) {
        context.dragEndX = Dygraph.dragGetX_(event, context);
        context.dragEndY = Dygraph.dragGetY_(event, context);
        var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
        var regionHeight = Math.abs(context.dragEndY - context.dragStartY);
        if (regionWidth < 2 && regionHeight < 2 && g.lastx_ !== undefined && g.lastx_ != -1) {
            Dygraph.Interaction.treatMouseOpAsClick(g, event, context);
        }
        context.regionWidth = regionWidth;
        context.regionHeight = regionHeight;
    };
    Dygraph.Interaction.startPan = function(event, g, context) {
        var i, axis;
        context.isPanning = true;
        var xRange = g.xAxisRange();
        if (g.getOptionForAxis("logscale", "x")) {
            context.initialLeftmostDate = Dygraph.log10(xRange[0]);
            context.dateRange = Dygraph.log10(xRange[1]) - Dygraph.log10(xRange[0]);
        } else {
            context.initialLeftmostDate = xRange[0];
            context.dateRange = xRange[1] - xRange[0];
        }
        context.xUnitsPerPixel = context.dateRange / (g.plotter_.area.w - 1);
        if (g.getNumericOption("panEdgeFraction")) {
            var maxXPixelsToDraw = g.width_ * g.getNumericOption("panEdgeFraction");
            var xExtremes = g.xAxisExtremes();
            var boundedLeftX = g.toDomXCoord(xExtremes[0]) - maxXPixelsToDraw;
            var boundedRightX = g.toDomXCoord(xExtremes[1]) + maxXPixelsToDraw;
            var boundedLeftDate = g.toDataXCoord(boundedLeftX);
            var boundedRightDate = g.toDataXCoord(boundedRightX);
            context.boundedDates = [ boundedLeftDate, boundedRightDate ];
            var boundedValues = [];
            var maxYPixelsToDraw = g.height_ * g.getNumericOption("panEdgeFraction");
            for (i = 0; i < g.axes_.length; i++) {
                axis = g.axes_[i];
                var yExtremes = axis.extremeRange;
                var boundedTopY = g.toDomYCoord(yExtremes[0], i) + maxYPixelsToDraw;
                var boundedBottomY = g.toDomYCoord(yExtremes[1], i) - maxYPixelsToDraw;
                var boundedTopValue = g.toDataYCoord(boundedTopY, i);
                var boundedBottomValue = g.toDataYCoord(boundedBottomY, i);
                boundedValues[i] = [ boundedTopValue, boundedBottomValue ];
            }
            context.boundedValues = boundedValues;
        }
        context.is2DPan = false;
        context.axes = [];
        for (i = 0; i < g.axes_.length; i++) {
            axis = g.axes_[i];
            var axis_data = {};
            var yRange = g.yAxisRange(i);
            var logscale = g.attributes_.getForAxis("logscale", i);
            if (logscale) {
                axis_data.initialTopValue = Dygraph.log10(yRange[1]);
                axis_data.dragValueRange = Dygraph.log10(yRange[1]) - Dygraph.log10(yRange[0]);
            } else {
                axis_data.initialTopValue = yRange[1];
                axis_data.dragValueRange = yRange[1] - yRange[0];
            }
            axis_data.unitsPerPixel = axis_data.dragValueRange / (g.plotter_.area.h - 1);
            context.axes.push(axis_data);
            if (axis.valueWindow || axis.valueRange) context.is2DPan = true;
        }
    };
    Dygraph.Interaction.movePan = function(event, g, context) {
        context.dragEndX = Dygraph.dragGetX_(event, context);
        context.dragEndY = Dygraph.dragGetY_(event, context);
        var minDate = context.initialLeftmostDate - (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
        if (context.boundedDates) {
            minDate = Math.max(minDate, context.boundedDates[0]);
        }
        var maxDate = minDate + context.dateRange;
        if (context.boundedDates) {
            if (maxDate > context.boundedDates[1]) {
                minDate = minDate - (maxDate - context.boundedDates[1]);
                maxDate = minDate + context.dateRange;
            }
        }
        if (g.getOptionForAxis("logscale", "x")) {
            g.dateWindow_ = [ Math.pow(Dygraph.LOG_SCALE, minDate), Math.pow(Dygraph.LOG_SCALE, maxDate) ];
        } else {
            g.dateWindow_ = [ minDate, maxDate ];
        }
        if (context.is2DPan) {
            var pixelsDragged = context.dragEndY - context.dragStartY;
            for (var i = 0; i < g.axes_.length; i++) {
                var axis = g.axes_[i];
                var axis_data = context.axes[i];
                var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;
                var boundedValue = context.boundedValues ? context.boundedValues[i] : null;
                var maxValue = axis_data.initialTopValue + unitsDragged;
                if (boundedValue) {
                    maxValue = Math.min(maxValue, boundedValue[1]);
                }
                var minValue = maxValue - axis_data.dragValueRange;
                if (boundedValue) {
                    if (minValue < boundedValue[0]) {
                        maxValue = maxValue - (minValue - boundedValue[0]);
                        minValue = maxValue - axis_data.dragValueRange;
                    }
                }
                if (g.attributes_.getForAxis("logscale", i)) {
                    axis.valueWindow = [ Math.pow(Dygraph.LOG_SCALE, minValue), Math.pow(Dygraph.LOG_SCALE, maxValue) ];
                } else {
                    axis.valueWindow = [ minValue, maxValue ];
                }
            }
        }
        g.drawGraph_(false);
    };
    Dygraph.Interaction.endPan = Dygraph.Interaction.maybeTreatMouseOpAsClick;
    Dygraph.Interaction.startZoom = function(event, g, context) {
        context.isZooming = true;
        context.zoomMoved = false;
    };
    Dygraph.Interaction.moveZoom = function(event, g, context) {
        context.zoomMoved = true;
        context.dragEndX = Dygraph.dragGetX_(event, context);
        context.dragEndY = Dygraph.dragGetY_(event, context);
        var xDelta = Math.abs(context.dragStartX - context.dragEndX);
        var yDelta = Math.abs(context.dragStartY - context.dragEndY);
        context.dragDirection = xDelta < yDelta / 2 ? Dygraph.VERTICAL : Dygraph.HORIZONTAL;
        g.drawZoomRect_(context.dragDirection, context.dragStartX, context.dragEndX, context.dragStartY, context.dragEndY, context.prevDragDirection, context.prevEndX, context.prevEndY);
        context.prevEndX = context.dragEndX;
        context.prevEndY = context.dragEndY;
        context.prevDragDirection = context.dragDirection;
    };
    Dygraph.Interaction.treatMouseOpAsClick = function(g, event, context) {
        var clickCallback = g.getFunctionOption("clickCallback");
        var pointClickCallback = g.getFunctionOption("pointClickCallback");
        var selectedPoint = null;
        var closestIdx = -1;
        var closestDistance = Number.MAX_VALUE;
        for (var i = 0; i < g.selPoints_.length; i++) {
            var p = g.selPoints_[i];
            var distance = Math.pow(p.canvasx - context.dragEndX, 2) + Math.pow(p.canvasy - context.dragEndY, 2);
            if (!isNaN(distance) && (closestIdx == -1 || distance < closestDistance)) {
                closestDistance = distance;
                closestIdx = i;
            }
        }
        var radius = g.getNumericOption("highlightCircleSize") + 2;
        if (closestDistance <= radius * radius) {
            selectedPoint = g.selPoints_[closestIdx];
        }
        if (selectedPoint) {
            var e = {
                cancelable: true,
                point: selectedPoint,
                canvasx: context.dragEndX,
                canvasy: context.dragEndY
            };
            var defaultPrevented = g.cascadeEvents_("pointClick", e);
            if (defaultPrevented) {
                return;
            }
            if (pointClickCallback) {
                pointClickCallback.call(g, event, selectedPoint);
            }
        }
        var e = {
            cancelable: true,
            xval: g.lastx_,
            pts: g.selPoints_,
            canvasx: context.dragEndX,
            canvasy: context.dragEndY
        };
        if (!g.cascadeEvents_("click", e)) {
            if (clickCallback) {
                clickCallback.call(g, event, g.lastx_, g.selPoints_);
            }
        }
    };
    Dygraph.Interaction.endZoom = function(event, g, context) {
        g.clearZoomRect_();
        context.isZooming = false;
        Dygraph.Interaction.maybeTreatMouseOpAsClick(event, g, context);
        var plotArea = g.getArea();
        if (context.regionWidth >= 10 && context.dragDirection == Dygraph.HORIZONTAL) {
            var left = Math.min(context.dragStartX, context.dragEndX), right = Math.max(context.dragStartX, context.dragEndX);
            left = Math.max(left, plotArea.x);
            right = Math.min(right, plotArea.x + plotArea.w);
            if (left < right) {
                g.doZoomX_(left, right);
            }
            context.cancelNextDblclick = true;
        } else if (context.regionHeight >= 10 && context.dragDirection == Dygraph.VERTICAL) {
            var top = Math.min(context.dragStartY, context.dragEndY), bottom = Math.max(context.dragStartY, context.dragEndY);
            top = Math.max(top, plotArea.y);
            bottom = Math.min(bottom, plotArea.y + plotArea.h);
            if (top < bottom) {
                g.doZoomY_(top, bottom);
            }
            context.cancelNextDblclick = true;
        }
        context.dragStartX = null;
        context.dragStartY = null;
    };
    Dygraph.Interaction.startTouch = function(event, g, context) {
        event.preventDefault();
        if (event.touches.length > 1) {
            context.startTimeForDoubleTapMs = null;
        }
        var touches = [];
        for (var i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            touches.push({
                pageX: t.pageX,
                pageY: t.pageY,
                dataX: g.toDataXCoord(t.pageX),
                dataY: g.toDataYCoord(t.pageY)
            });
        }
        context.initialTouches = touches;
        if (touches.length == 1) {
            context.initialPinchCenter = touches[0];
            context.touchDirections = {
                x: true,
                y: true
            };
        } else if (touches.length >= 2) {
            context.initialPinchCenter = {
                pageX: .5 * (touches[0].pageX + touches[1].pageX),
                pageY: .5 * (touches[0].pageY + touches[1].pageY),
                dataX: .5 * (touches[0].dataX + touches[1].dataX),
                dataY: .5 * (touches[0].dataY + touches[1].dataY)
            };
            var initialAngle = 180 / Math.PI * Math.atan2(context.initialPinchCenter.pageY - touches[0].pageY, touches[0].pageX - context.initialPinchCenter.pageX);
            initialAngle = Math.abs(initialAngle);
            if (initialAngle > 90) initialAngle = 90 - initialAngle;
            context.touchDirections = {
                x: initialAngle < 90 - 45 / 2,
                y: initialAngle > 45 / 2
            };
        }
        context.initialRange = {
            x: g.xAxisRange(),
            y: g.yAxisRange()
        };
    };
    Dygraph.Interaction.moveTouch = function(event, g, context) {
        context.startTimeForDoubleTapMs = null;
        var i, touches = [];
        for (i = 0; i < event.touches.length; i++) {
            var t = event.touches[i];
            touches.push({
                pageX: t.pageX,
                pageY: t.pageY
            });
        }
        var initialTouches = context.initialTouches;
        var c_now;
        var c_init = context.initialPinchCenter;
        if (touches.length == 1) {
            c_now = touches[0];
        } else {
            c_now = {
                pageX: .5 * (touches[0].pageX + touches[1].pageX),
                pageY: .5 * (touches[0].pageY + touches[1].pageY)
            };
        }
        var swipe = {
            pageX: c_now.pageX - c_init.pageX,
            pageY: c_now.pageY - c_init.pageY
        };
        var dataWidth = context.initialRange.x[1] - context.initialRange.x[0];
        var dataHeight = context.initialRange.y[0] - context.initialRange.y[1];
        swipe.dataX = swipe.pageX / g.plotter_.area.w * dataWidth;
        swipe.dataY = swipe.pageY / g.plotter_.area.h * dataHeight;
        var xScale, yScale;
        if (touches.length == 1) {
            xScale = 1;
            yScale = 1;
        } else if (touches.length >= 2) {
            var initHalfWidth = initialTouches[1].pageX - c_init.pageX;
            xScale = (touches[1].pageX - c_now.pageX) / initHalfWidth;
            var initHalfHeight = initialTouches[1].pageY - c_init.pageY;
            yScale = (touches[1].pageY - c_now.pageY) / initHalfHeight;
        }
        xScale = Math.min(8, Math.max(.125, xScale));
        yScale = Math.min(8, Math.max(.125, yScale));
        var didZoom = false;
        if (context.touchDirections.x) {
            g.dateWindow_ = [ c_init.dataX - swipe.dataX + (context.initialRange.x[0] - c_init.dataX) / xScale, c_init.dataX - swipe.dataX + (context.initialRange.x[1] - c_init.dataX) / xScale ];
            didZoom = true;
        }
        if (context.touchDirections.y) {
            for (i = 0; i < 1; i++) {
                var axis = g.axes_[i];
                var logscale = g.attributes_.getForAxis("logscale", i);
                if (logscale) {} else {
                    axis.valueWindow = [ c_init.dataY - swipe.dataY + (context.initialRange.y[0] - c_init.dataY) / yScale, c_init.dataY - swipe.dataY + (context.initialRange.y[1] - c_init.dataY) / yScale ];
                    didZoom = true;
                }
            }
        }
        g.drawGraph_(false);
        if (didZoom && touches.length > 1 && g.getFunctionOption("zoomCallback")) {
            var viewWindow = g.xAxisRange();
            g.getFunctionOption("zoomCallback").call(g, viewWindow[0], viewWindow[1], g.yAxisRanges());
        }
    };
    Dygraph.Interaction.endTouch = function(event, g, context) {
        if (event.touches.length !== 0) {
            Dygraph.Interaction.startTouch(event, g, context);
        } else if (event.changedTouches.length == 1) {
            var now = new Date().getTime();
            var t = event.changedTouches[0];
            if (context.startTimeForDoubleTapMs && now - context.startTimeForDoubleTapMs < 500 && context.doubleTapX && Math.abs(context.doubleTapX - t.screenX) < 50 && context.doubleTapY && Math.abs(context.doubleTapY - t.screenY) < 50) {
                g.resetZoom();
            } else {
                context.startTimeForDoubleTapMs = now;
                context.doubleTapX = t.screenX;
                context.doubleTapY = t.screenY;
            }
        }
    };
    var distanceFromInterval = function(x, left, right) {
        if (x < left) {
            return left - x;
        } else if (x > right) {
            return x - right;
        } else {
            return 0;
        }
    };
    var distanceFromChart = function(event, g) {
        var chartPos = Dygraph.findPos(g.canvas_);
        var box = {
            left: chartPos.x,
            right: chartPos.x + g.canvas_.offsetWidth,
            top: chartPos.y,
            bottom: chartPos.y + g.canvas_.offsetHeight
        };
        var pt = {
            x: Dygraph.pageX(event),
            y: Dygraph.pageY(event)
        };
        var dx = distanceFromInterval(pt.x, box.left, box.right), dy = distanceFromInterval(pt.y, box.top, box.bottom);
        return Math.max(dx, dy);
    };
    Dygraph.Interaction.defaultModel = {
        mousedown: function(event, g, context) {
            if (event.button && event.button == 2) return;
            context.initializeMouseDown(event, g, context);
            if (event.altKey || event.shiftKey) {
                Dygraph.startPan(event, g, context);
            } else {
                Dygraph.startZoom(event, g, context);
            }
            var mousemove = function(event) {
                if (context.isZooming) {
                    var d = distanceFromChart(event, g);
                    if (d < DRAG_EDGE_MARGIN) {
                        Dygraph.moveZoom(event, g, context);
                    } else {
                        if (context.dragEndX !== null) {
                            context.dragEndX = null;
                            context.dragEndY = null;
                            g.clearZoomRect_();
                        }
                    }
                } else if (context.isPanning) {
                    Dygraph.movePan(event, g, context);
                }
            };
            var mouseup = function(event) {
                if (context.isZooming) {
                    if (context.dragEndX !== null) {
                        Dygraph.endZoom(event, g, context);
                    } else {
                        Dygraph.Interaction.maybeTreatMouseOpAsClick(event, g, context);
                    }
                } else if (context.isPanning) {
                    Dygraph.endPan(event, g, context);
                }
                Dygraph.removeEvent(document, "mousemove", mousemove);
                Dygraph.removeEvent(document, "mouseup", mouseup);
                context.destroy();
            };
            g.addAndTrackEvent(document, "mousemove", mousemove);
            g.addAndTrackEvent(document, "mouseup", mouseup);
        },
        willDestroyContextMyself: true,
        touchstart: function(event, g, context) {
            Dygraph.Interaction.startTouch(event, g, context);
        },
        touchmove: function(event, g, context) {
            Dygraph.Interaction.moveTouch(event, g, context);
        },
        touchend: function(event, g, context) {
            Dygraph.Interaction.endTouch(event, g, context);
        },
        dblclick: function(event, g, context) {
            if (context.cancelNextDblclick) {
                context.cancelNextDblclick = false;
                return;
            }
            var e = {
                canvasx: context.dragEndX,
                canvasy: context.dragEndY
            };
            if (g.cascadeEvents_("dblclick", e)) {
                return;
            }
            if (event.altKey || event.shiftKey) {
                return;
            }
            g.resetZoom();
        }
    };
    Dygraph.DEFAULT_ATTRS.interactionModel = Dygraph.Interaction.defaultModel;
    Dygraph.defaultInteractionModel = Dygraph.Interaction.defaultModel;
    Dygraph.endZoom = Dygraph.Interaction.endZoom;
    Dygraph.moveZoom = Dygraph.Interaction.moveZoom;
    Dygraph.startZoom = Dygraph.Interaction.startZoom;
    Dygraph.endPan = Dygraph.Interaction.endPan;
    Dygraph.movePan = Dygraph.Interaction.movePan;
    Dygraph.startPan = Dygraph.Interaction.startPan;
    Dygraph.Interaction.nonInteractiveModel_ = {
        mousedown: function(event, g, context) {
            context.initializeMouseDown(event, g, context);
        },
        mouseup: Dygraph.Interaction.maybeTreatMouseOpAsClick
    };
    Dygraph.Interaction.dragIsPanInteractionModel = {
        mousedown: function(event, g, context) {
            context.initializeMouseDown(event, g, context);
            Dygraph.startPan(event, g, context);
        },
        mousemove: function(event, g, context) {
            if (context.isPanning) {
                Dygraph.movePan(event, g, context);
            }
        },
        mouseup: function(event, g, context) {
            if (context.isPanning) {
                Dygraph.endPan(event, g, context);
            }
        }
    };
})();

(function() {
    "use strict";
    Dygraph.TickList = undefined;
    Dygraph.Ticker = undefined;
    Dygraph.numericLinearTicks = function(a, b, pixels, opts, dygraph, vals) {
        var nonLogscaleOpts = function(opt) {
            if (opt === "logscale") return false;
            return opts(opt);
        };
        return Dygraph.numericTicks(a, b, pixels, nonLogscaleOpts, dygraph, vals);
    };
    Dygraph.numericTicks = function(a, b, pixels, opts, dygraph, vals) {
        var pixels_per_tick = opts("pixelsPerLabel");
        var ticks = [];
        var i, j, tickV, nTicks;
        if (vals) {
            for (i = 0; i < vals.length; i++) {
                ticks.push({
                    v: vals[i]
                });
            }
        } else {
            if (opts("logscale")) {
                nTicks = Math.floor(pixels / pixels_per_tick);
                var minIdx = Dygraph.binarySearch(a, Dygraph.PREFERRED_LOG_TICK_VALUES, 1);
                var maxIdx = Dygraph.binarySearch(b, Dygraph.PREFERRED_LOG_TICK_VALUES, -1);
                if (minIdx == -1) {
                    minIdx = 0;
                }
                if (maxIdx == -1) {
                    maxIdx = Dygraph.PREFERRED_LOG_TICK_VALUES.length - 1;
                }
                var lastDisplayed = null;
                if (maxIdx - minIdx >= nTicks / 4) {
                    for (var idx = maxIdx; idx >= minIdx; idx--) {
                        var tickValue = Dygraph.PREFERRED_LOG_TICK_VALUES[idx];
                        var pixel_coord = Math.log(tickValue / a) / Math.log(b / a) * pixels;
                        var tick = {
                            v: tickValue
                        };
                        if (lastDisplayed === null) {
                            lastDisplayed = {
                                tickValue: tickValue,
                                pixel_coord: pixel_coord
                            };
                        } else {
                            if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= pixels_per_tick) {
                                lastDisplayed = {
                                    tickValue: tickValue,
                                    pixel_coord: pixel_coord
                                };
                            } else {
                                tick.label = "";
                            }
                        }
                        ticks.push(tick);
                    }
                    ticks.reverse();
                }
            }
            if (ticks.length === 0) {
                var kmg2 = opts("labelsKMG2");
                var mults, base;
                if (kmg2) {
                    mults = [ 1, 2, 4, 8, 16, 32, 64, 128, 256 ];
                    base = 16;
                } else {
                    mults = [ 1, 2, 5, 10, 20, 50, 100 ];
                    base = 10;
                }
                var max_ticks = Math.ceil(pixels / pixels_per_tick);
                var units_per_tick = Math.abs(b - a) / max_ticks;
                var base_power = Math.floor(Math.log(units_per_tick) / Math.log(base));
                var base_scale = Math.pow(base, base_power);
                var scale, low_val, high_val, spacing;
                for (j = 0; j < mults.length; j++) {
                    scale = base_scale * mults[j];
                    low_val = Math.floor(a / scale) * scale;
                    high_val = Math.ceil(b / scale) * scale;
                    nTicks = Math.abs(high_val - low_val) / scale;
                    spacing = pixels / nTicks;
                    if (spacing > pixels_per_tick) break;
                }
                if (low_val > high_val) scale *= -1;
                for (i = 0; i <= nTicks; i++) {
                    tickV = low_val + i * scale;
                    ticks.push({
                        v: tickV
                    });
                }
            }
        }
        var formatter = opts("axisLabelFormatter");
        for (i = 0; i < ticks.length; i++) {
            if (ticks[i].label !== undefined) continue;
            ticks[i].label = formatter.call(dygraph, ticks[i].v, 0, opts, dygraph);
        }
        return ticks;
    };
    Dygraph.dateTicker = function(a, b, pixels, opts, dygraph, vals) {
        var chosen = Dygraph.pickDateTickGranularity(a, b, pixels, opts);
        if (chosen >= 0) {
            return Dygraph.getDateAxis(a, b, chosen, opts, dygraph);
        } else {
            return [];
        }
    };
    Dygraph.SECONDLY = 0;
    Dygraph.TWO_SECONDLY = 1;
    Dygraph.FIVE_SECONDLY = 2;
    Dygraph.TEN_SECONDLY = 3;
    Dygraph.THIRTY_SECONDLY = 4;
    Dygraph.MINUTELY = 5;
    Dygraph.TWO_MINUTELY = 6;
    Dygraph.FIVE_MINUTELY = 7;
    Dygraph.TEN_MINUTELY = 8;
    Dygraph.THIRTY_MINUTELY = 9;
    Dygraph.HOURLY = 10;
    Dygraph.TWO_HOURLY = 11;
    Dygraph.SIX_HOURLY = 12;
    Dygraph.DAILY = 13;
    Dygraph.TWO_DAILY = 14;
    Dygraph.WEEKLY = 15;
    Dygraph.MONTHLY = 16;
    Dygraph.QUARTERLY = 17;
    Dygraph.BIANNUAL = 18;
    Dygraph.ANNUAL = 19;
    Dygraph.DECADAL = 20;
    Dygraph.CENTENNIAL = 21;
    Dygraph.NUM_GRANULARITIES = 22;
    Dygraph.SHORT_SPACINGS = [];
    Dygraph.SHORT_SPACINGS[Dygraph.SECONDLY] = 1e3 * 1;
    Dygraph.SHORT_SPACINGS[Dygraph.TWO_SECONDLY] = 1e3 * 2;
    Dygraph.SHORT_SPACINGS[Dygraph.FIVE_SECONDLY] = 1e3 * 5;
    Dygraph.SHORT_SPACINGS[Dygraph.TEN_SECONDLY] = 1e3 * 10;
    Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_SECONDLY] = 1e3 * 30;
    Dygraph.SHORT_SPACINGS[Dygraph.MINUTELY] = 1e3 * 60;
    Dygraph.SHORT_SPACINGS[Dygraph.TWO_MINUTELY] = 1e3 * 60 * 2;
    Dygraph.SHORT_SPACINGS[Dygraph.FIVE_MINUTELY] = 1e3 * 60 * 5;
    Dygraph.SHORT_SPACINGS[Dygraph.TEN_MINUTELY] = 1e3 * 60 * 10;
    Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_MINUTELY] = 1e3 * 60 * 30;
    Dygraph.SHORT_SPACINGS[Dygraph.HOURLY] = 1e3 * 3600;
    Dygraph.SHORT_SPACINGS[Dygraph.TWO_HOURLY] = 1e3 * 3600 * 2;
    Dygraph.SHORT_SPACINGS[Dygraph.SIX_HOURLY] = 1e3 * 3600 * 6;
    Dygraph.SHORT_SPACINGS[Dygraph.DAILY] = 1e3 * 86400;
    Dygraph.SHORT_SPACINGS[Dygraph.WEEKLY] = 1e3 * 604800;
    Dygraph.DATEFIELD_Y = 0;
    Dygraph.DATEFIELD_M = 1;
    Dygraph.DATEFIELD_D = 2;
    Dygraph.DATEFIELD_HH = 3;
    Dygraph.DATEFIELD_MM = 4;
    Dygraph.DATEFIELD_SS = 5;
    Dygraph.DATEFIELD_MS = 6;
    Dygraph.NUM_DATEFIELDS = 7;
    Dygraph.TICK_PLACEMENT = [];
    Dygraph.TICK_PLACEMENT[Dygraph.SECONDLY] = {
        datefield: Dygraph.DATEFIELD_SS,
        step: 1,
        spacing: 1e3 * 1
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TWO_SECONDLY] = {
        datefield: Dygraph.DATEFIELD_SS,
        step: 2,
        spacing: 1e3 * 2
    };
    Dygraph.TICK_PLACEMENT[Dygraph.FIVE_SECONDLY] = {
        datefield: Dygraph.DATEFIELD_SS,
        step: 5,
        spacing: 1e3 * 5
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TEN_SECONDLY] = {
        datefield: Dygraph.DATEFIELD_SS,
        step: 10,
        spacing: 1e3 * 10
    };
    Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_SECONDLY] = {
        datefield: Dygraph.DATEFIELD_SS,
        step: 30,
        spacing: 1e3 * 30
    };
    Dygraph.TICK_PLACEMENT[Dygraph.MINUTELY] = {
        datefield: Dygraph.DATEFIELD_MM,
        step: 1,
        spacing: 1e3 * 60
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TWO_MINUTELY] = {
        datefield: Dygraph.DATEFIELD_MM,
        step: 2,
        spacing: 1e3 * 60 * 2
    };
    Dygraph.TICK_PLACEMENT[Dygraph.FIVE_MINUTELY] = {
        datefield: Dygraph.DATEFIELD_MM,
        step: 5,
        spacing: 1e3 * 60 * 5
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TEN_MINUTELY] = {
        datefield: Dygraph.DATEFIELD_MM,
        step: 10,
        spacing: 1e3 * 60 * 10
    };
    Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_MINUTELY] = {
        datefield: Dygraph.DATEFIELD_MM,
        step: 30,
        spacing: 1e3 * 60 * 30
    };
    Dygraph.TICK_PLACEMENT[Dygraph.HOURLY] = {
        datefield: Dygraph.DATEFIELD_HH,
        step: 1,
        spacing: 1e3 * 3600
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TWO_HOURLY] = {
        datefield: Dygraph.DATEFIELD_HH,
        step: 2,
        spacing: 1e3 * 3600 * 2
    };
    Dygraph.TICK_PLACEMENT[Dygraph.SIX_HOURLY] = {
        datefield: Dygraph.DATEFIELD_HH,
        step: 6,
        spacing: 1e3 * 3600 * 6
    };
    Dygraph.TICK_PLACEMENT[Dygraph.DAILY] = {
        datefield: Dygraph.DATEFIELD_D,
        step: 1,
        spacing: 1e3 * 86400
    };
    Dygraph.TICK_PLACEMENT[Dygraph.TWO_DAILY] = {
        datefield: Dygraph.DATEFIELD_D,
        step: 2,
        spacing: 1e3 * 86400 * 2
    };
    Dygraph.TICK_PLACEMENT[Dygraph.WEEKLY] = {
        datefield: Dygraph.DATEFIELD_D,
        step: 7,
        spacing: 1e3 * 604800
    };
    Dygraph.TICK_PLACEMENT[Dygraph.MONTHLY] = {
        datefield: Dygraph.DATEFIELD_M,
        step: 1,
        spacing: 1e3 * 7200 * 365.2524
    };
    Dygraph.TICK_PLACEMENT[Dygraph.QUARTERLY] = {
        datefield: Dygraph.DATEFIELD_M,
        step: 3,
        spacing: 1e3 * 21600 * 365.2524
    };
    Dygraph.TICK_PLACEMENT[Dygraph.BIANNUAL] = {
        datefield: Dygraph.DATEFIELD_M,
        step: 6,
        spacing: 1e3 * 43200 * 365.2524
    };
    Dygraph.TICK_PLACEMENT[Dygraph.ANNUAL] = {
        datefield: Dygraph.DATEFIELD_Y,
        step: 1,
        spacing: 1e3 * 86400 * 365.2524
    };
    Dygraph.TICK_PLACEMENT[Dygraph.DECADAL] = {
        datefield: Dygraph.DATEFIELD_Y,
        step: 10,
        spacing: 1e3 * 864e3 * 365.2524
    };
    Dygraph.TICK_PLACEMENT[Dygraph.CENTENNIAL] = {
        datefield: Dygraph.DATEFIELD_Y,
        step: 100,
        spacing: 1e3 * 864e4 * 365.2524
    };
    Dygraph.PREFERRED_LOG_TICK_VALUES = function() {
        var vals = [];
        for (var power = -39; power <= 39; power++) {
            var range = Math.pow(10, power);
            for (var mult = 1; mult <= 9; mult++) {
                var val = range * mult;
                vals.push(val);
            }
        }
        return vals;
    }();
    Dygraph.pickDateTickGranularity = function(a, b, pixels, opts) {
        var pixels_per_tick = opts("pixelsPerLabel");
        for (var i = 0; i < Dygraph.NUM_GRANULARITIES; i++) {
            var num_ticks = Dygraph.numDateTicks(a, b, i);
            if (pixels / num_ticks >= pixels_per_tick) {
                return i;
            }
        }
        return -1;
    };
    Dygraph.numDateTicks = function(start_time, end_time, granularity) {
        var spacing = Dygraph.TICK_PLACEMENT[granularity].spacing;
        return Math.round(1 * (end_time - start_time) / spacing);
    };
    Dygraph.getDateAxis = function(start_time, end_time, granularity, opts, dg) {
        var formatter = opts("axisLabelFormatter");
        var utc = opts("labelsUTC");
        var accessors = utc ? Dygraph.DateAccessorsUTC : Dygraph.DateAccessorsLocal;
        var timezone = opts("labelsTimezone");
        accessors = timezone ? timezone : accessors;
        var datefield = Dygraph.TICK_PLACEMENT[granularity].datefield;
        var step = Dygraph.TICK_PLACEMENT[granularity].step;
        var spacing = Dygraph.TICK_PLACEMENT[granularity].spacing;
        var start_date = new Date(start_time);
        var date_array = [];
        date_array[Dygraph.DATEFIELD_Y] = accessors.getFullYear(start_date);
        date_array[Dygraph.DATEFIELD_M] = accessors.getMonth(start_date);
        date_array[Dygraph.DATEFIELD_D] = accessors.getDate(start_date);
        date_array[Dygraph.DATEFIELD_HH] = accessors.getHours(start_date);
        date_array[Dygraph.DATEFIELD_MM] = accessors.getMinutes(start_date);
        date_array[Dygraph.DATEFIELD_SS] = accessors.getSeconds(start_date);
        date_array[Dygraph.DATEFIELD_MS] = accessors.getMilliseconds(start_date);
        var start_date_offset = date_array[datefield] % step;
        if (granularity == Dygraph.WEEKLY) {
            start_date_offset = accessors.getDay(start_date);
        }
        date_array[datefield] -= start_date_offset;
        for (var df = datefield + 1; df < Dygraph.NUM_DATEFIELDS; df++) {
            date_array[df] = df === Dygraph.DATEFIELD_D ? 1 : 0;
        }
        var ticks = [];
        var tick_date = accessors.makeDate.apply(null, date_array);
        var tick_time = tick_date.getTime();
        if (granularity <= Dygraph.HOURLY) {
            if (tick_time < start_time) {
                tick_time += spacing;
                tick_date = new Date(tick_time);
            }
            while (tick_time <= end_time) {
                ticks.push({
                    v: tick_time,
                    label: formatter.call(dg, tick_date, granularity, opts, dg)
                });
                tick_time += spacing;
                tick_date = new Date(tick_time);
            }
        } else {
            if (tick_time < start_time) {
                date_array[datefield] += step;
                tick_date = accessors.makeDate.apply(null, date_array);
                tick_time = tick_date.getTime();
            }
            while (tick_time <= end_time) {
                if (granularity >= Dygraph.DAILY || accessors.getHours(tick_date) % step === 0) {
                    ticks.push({
                        v: tick_time,
                        label: formatter.call(dg, tick_date, granularity, opts, dg)
                    });
                }
                date_array[datefield] += step;
                tick_date = accessors.makeDate.apply(null, date_array);
                tick_time = tick_date.getTime();
            }
        }
        return ticks;
    };
    if (Dygraph && Dygraph.DEFAULT_ATTRS && Dygraph.DEFAULT_ATTRS["axes"] && Dygraph.DEFAULT_ATTRS["axes"]["x"] && Dygraph.DEFAULT_ATTRS["axes"]["y"] && Dygraph.DEFAULT_ATTRS["axes"]["y2"]) {
        Dygraph.DEFAULT_ATTRS["axes"]["x"]["ticker"] = Dygraph.dateTicker;
        Dygraph.DEFAULT_ATTRS["axes"]["y"]["ticker"] = Dygraph.numericTicks;
        Dygraph.DEFAULT_ATTRS["axes"]["y2"]["ticker"] = Dygraph.numericTicks;
    }
})();

Dygraph.Plugins = {};

Dygraph.Plugins.Annotations = function() {
    "use strict";
    var annotations = function() {
        this.annotations_ = [];
    };
    annotations.prototype.toString = function() {
        return "Annotations Plugin";
    };
    annotations.prototype.activate = function(g) {
        return {
            clearChart: this.clearChart,
            didDrawChart: this.didDrawChart
        };
    };
    annotations.prototype.detachLabels = function() {
        var this$1 = this;

        for (var i = 0; i < this.annotations_.length; i++) {
            var a = this$1.annotations_[i];
            if (a.parentNode) a.parentNode.removeChild(a);
            this$1.annotations_[i] = null;
        }
        this.annotations_ = [];
    };
    annotations.prototype.clearChart = function(e) {
        this.detachLabels();
    };
    annotations.prototype.didDrawChart = function(e) {
        var this$1 = this;

        var g = e.dygraph;
        var points = g.layout_.annotated_points;
        if (!points || points.length === 0) return;
        var containerDiv = e.canvas.parentNode;
        var annotationStyle = {
            position: "absolute",
            fontSize: g.getOption("axisLabelFontSize") + "px",
            zIndex: 10,
            overflow: "hidden"
        };
        var bindEvt = function(eventName, classEventName, pt) {
            return function(annotation_event) {
                var a = pt.annotation;
                if (a.hasOwnProperty(eventName)) {
                    a[eventName](a, pt, g, annotation_event);
                } else if (g.getOption(classEventName)) {
                    g.getOption(classEventName)(a, pt, g, annotation_event);
                }
            };
        };
        var area = e.dygraph.plotter_.area;
        var xToUsedHeight = {};
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            if (p.canvasx < area.x || p.canvasx > area.x + area.w || p.canvasy < area.y || p.canvasy > area.y + area.h) {
                continue;
            }
            var a = p.annotation;
            var tick_height = 6;
            if (a.hasOwnProperty("tickHeight")) {
                tick_height = a.tickHeight;
            }
            var div = document.createElement("div");
            for (var name in annotationStyle) {
                if (annotationStyle.hasOwnProperty(name)) {
                    div.style[name] = annotationStyle[name];
                }
            }
            if (!a.hasOwnProperty("icon")) {
                div.className = "dygraphDefaultAnnotation";
            }
            if (a.hasOwnProperty("cssClass")) {
                div.className += " " + a.cssClass;
            }
            var width = a.hasOwnProperty("width") ? a.width : 16;
            var height = a.hasOwnProperty("height") ? a.height : 16;
            if (a.hasOwnProperty("icon")) {
                var img = document.createElement("img");
                img.src = a.icon;
                img.width = width;
                img.height = height;
                div.appendChild(img);
            } else if (p.annotation.hasOwnProperty("shortText")) {
                div.appendChild(document.createTextNode(p.annotation.shortText));
            }
            var left = p.canvasx - width / 2;
            div.style.left = left + "px";
            var divTop = 0;
            if (a.attachAtBottom) {
                var y = area.y + area.h - height - tick_height;
                if (xToUsedHeight[left]) {
                    y -= xToUsedHeight[left];
                } else {
                    xToUsedHeight[left] = 0;
                }
                xToUsedHeight[left] += tick_height + height;
                divTop = y;
            } else {
                divTop = p.canvasy - height - tick_height;
            }
            div.style.top = divTop + "px";
            div.style.width = width + "px";
            div.style.height = height + "px";
            div.title = p.annotation.text;
            div.style.color = g.colorsMap_[p.name];
            div.style.borderColor = g.colorsMap_[p.name];
            a.div = div;
            g.addAndTrackEvent(div, "click", bindEvt("clickHandler", "annotationClickHandler", p, this$1));
            g.addAndTrackEvent(div, "mouseover", bindEvt("mouseOverHandler", "annotationMouseOverHandler", p, this$1));
            g.addAndTrackEvent(div, "mouseout", bindEvt("mouseOutHandler", "annotationMouseOutHandler", p, this$1));
            g.addAndTrackEvent(div, "dblclick", bindEvt("dblClickHandler", "annotationDblClickHandler", p, this$1));
            containerDiv.appendChild(div);
            this$1.annotations_.push(div);
            var ctx = e.drawingContext;
            ctx.save();
            ctx.strokeStyle = g.colorsMap_[p.name];
            ctx.beginPath();
            if (!a.attachAtBottom) {
                ctx.moveTo(p.canvasx, p.canvasy);
                ctx.lineTo(p.canvasx, p.canvasy - 2 - tick_height);
            } else {
                var y = divTop + height;
                ctx.moveTo(p.canvasx, y);
                ctx.lineTo(p.canvasx, y + tick_height);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    };
    annotations.prototype.destroy = function() {
        this.detachLabels();
    };
    return annotations;
}();

Dygraph.Plugins.Axes = function() {
    "use strict";
    var axes = function() {
        this.xlabels_ = [];
        this.ylabels_ = [];
    };
    axes.prototype.toString = function() {
        return "Axes Plugin";
    };
    axes.prototype.activate = function(g) {
        return {
            layout: this.layout,
            clearChart: this.clearChart,
            willDrawChart: this.willDrawChart
        };
    };
    axes.prototype.layout = function(e) {
        var g = e.dygraph;
        if (g.getOptionForAxis("drawAxis", "y")) {
            var w = g.getOptionForAxis("axisLabelWidth", "y") + 2 * g.getOptionForAxis("axisTickSize", "y");
            e.reserveSpaceLeft(w);
        }
        if (g.getOptionForAxis("drawAxis", "x")) {
            var h;
            if (g.getOption("xAxisHeight")) {
                h = g.getOption("xAxisHeight");
            } else {
                h = g.getOptionForAxis("axisLabelFontSize", "x") + 2 * g.getOptionForAxis("axisTickSize", "x");
            }
            e.reserveSpaceBottom(h);
        }
        if (g.numAxes() == 2) {
            if (g.getOptionForAxis("drawAxis", "y2")) {
                var w = g.getOptionForAxis("axisLabelWidth", "y2") + 2 * g.getOptionForAxis("axisTickSize", "y2");
                e.reserveSpaceRight(w);
            }
        } else if (g.numAxes() > 2) {
            g.error("Only two y-axes are supported at this time. (Trying " + "to use " + g.numAxes() + ")");
        }
    };
    axes.prototype.detachLabels = function() {
        function removeArray(ary) {
            for (var i = 0; i < ary.length; i++) {
                var el = ary[i];
                if (el.parentNode) el.parentNode.removeChild(el);
            }
        }
        removeArray(this.xlabels_);
        removeArray(this.ylabels_);
        this.xlabels_ = [];
        this.ylabels_ = [];
    };
    axes.prototype.clearChart = function(e) {
        this.detachLabels();
    };
    axes.prototype.willDrawChart = function(e) {
        var this$1 = this;

        var g = e.dygraph;
        if (!g.getOptionForAxis("drawAxis", "x") && !g.getOptionForAxis("drawAxis", "y") && !g.getOptionForAxis("drawAxis", "y2")) {
            return;
        }
        function halfUp(x) {
            return Math.round(x) + .5;
        }
        function halfDown(y) {
            return Math.round(y) - .5;
        }
        var context = e.drawingContext;
        var containerDiv = e.canvas.parentNode;
        var canvasWidth = g.width_;
        var canvasHeight = g.height_;
        var label, x, y, tick, i;
        var makeLabelStyle = function(axis) {
            return {
                position: "absolute",
                fontSize: g.getOptionForAxis("axisLabelFontSize", axis) + "px",
                zIndex: 10,
                color: g.getOptionForAxis("axisLabelColor", axis),
                width: g.getOptionForAxis("axisLabelWidth", axis) + "px",
                lineHeight: "normal",
                overflow: "hidden"
            };
        };
        var labelStyles = {
            x: makeLabelStyle("x"),
            y: makeLabelStyle("y"),
            y2: makeLabelStyle("y2")
        };
        var makeDiv = function(txt, axis, prec_axis) {
            var div = document.createElement("div");
            var labelStyle = labelStyles[prec_axis == "y2" ? "y2" : axis];
            for (var name in labelStyle) {
                if (labelStyle.hasOwnProperty(name)) {
                    div.style[name] = labelStyle[name];
                }
            }
            var inner_div = document.createElement("div");
            inner_div.className = "dygraph-axis-label" + " dygraph-axis-label-" + axis + (prec_axis ? " dygraph-axis-label-" + prec_axis : "");
            inner_div.innerHTML = txt;
            div.appendChild(inner_div);
            return div;
        };
        context.save();
        var layout = g.layout_;
        var area = e.dygraph.plotter_.area;
        var makeOptionGetter = function(axis) {
            return function(option) {
                return g.getOptionForAxis(option, axis);
            };
        };
        if (g.getOptionForAxis("drawAxis", "y")) {
            if (layout.yticks && layout.yticks.length > 0) {
                var num_axes = g.numAxes();
                var getOptions = [ makeOptionGetter("y"), makeOptionGetter("y2") ];
                for (i = 0; i < layout.yticks.length; i++) {
                    tick = layout.yticks[i];
                    if (typeof tick == "function") return;
                    x = area.x;
                    var sgn = 1;
                    var prec_axis = "y1";
                    var getAxisOption = getOptions[0];
                    if (tick[0] == 1) {
                        x = area.x + area.w;
                        sgn = -1;
                        prec_axis = "y2";
                        getAxisOption = getOptions[1];
                    }
                    var fontSize = getAxisOption("axisLabelFontSize");
                    y = area.y + tick[1] * area.h;
                    label = makeDiv(tick[2], "y", num_axes == 2 ? prec_axis : null);
                    var top = y - fontSize / 2;
                    if (top < 0) top = 0;
                    if (top + fontSize + 3 > canvasHeight) {
                        label.style.bottom = "0";
                    } else {
                        label.style.top = top + "px";
                    }
                    if (tick[0] === 0) {
                        label.style.left = area.x - getAxisOption("axisLabelWidth") - getAxisOption("axisTickSize") + "px";
                        label.style.textAlign = "right";
                    } else if (tick[0] == 1) {
                        label.style.left = area.x + area.w + getAxisOption("axisTickSize") + "px";
                        label.style.textAlign = "left";
                    }
                    label.style.width = getAxisOption("axisLabelWidth") + "px";
                    containerDiv.appendChild(label);
                    this$1.ylabels_.push(label);
                }
                var bottomTick = this.ylabels_[0];
                var fontSize = g.getOptionForAxis("axisLabelFontSize", "y");
                var bottom = parseInt(bottomTick.style.top, 10) + fontSize;
                if (bottom > canvasHeight - fontSize) {
                    bottomTick.style.top = parseInt(bottomTick.style.top, 10) - fontSize / 2 + "px";
                }
            }
            var axisX;
            if (g.getOption("drawAxesAtZero")) {
                var r = g.toPercentXCoord(0);
                if (r > 1 || r < 0 || isNaN(r)) r = 0;
                axisX = halfUp(area.x + r * area.w);
            } else {
                axisX = halfUp(area.x);
            }
            context.strokeStyle = g.getOptionForAxis("axisLineColor", "y");
            context.lineWidth = g.getOptionForAxis("axisLineWidth", "y");
            context.beginPath();
            context.moveTo(axisX, halfDown(area.y));
            context.lineTo(axisX, halfDown(area.y + area.h));
            context.closePath();
            context.stroke();
            if (g.numAxes() == 2) {
                context.strokeStyle = g.getOptionForAxis("axisLineColor", "y2");
                context.lineWidth = g.getOptionForAxis("axisLineWidth", "y2");
                context.beginPath();
                context.moveTo(halfDown(area.x + area.w), halfDown(area.y));
                context.lineTo(halfDown(area.x + area.w), halfDown(area.y + area.h));
                context.closePath();
                context.stroke();
            }
        }
        if (g.getOptionForAxis("drawAxis", "x")) {
            if (layout.xticks) {
                var getAxisOption = makeOptionGetter("x");
                for (i = 0; i < layout.xticks.length; i++) {
                    tick = layout.xticks[i];
                    x = area.x + tick[0] * area.w;
                    y = area.y + area.h;
                    label = makeDiv(tick[1], "x");
                    label.style.textAlign = "center";
                    label.style.top = y + getAxisOption("axisTickSize") + "px";
                    var left = x - getAxisOption("axisLabelWidth") / 2;
                    if (left + getAxisOption("axisLabelWidth") > canvasWidth) {
                        left = canvasWidth - getAxisOption("axisLabelWidth");
                        label.style.textAlign = "right";
                    }
                    if (left < 0) {
                        left = 0;
                        label.style.textAlign = "left";
                    }
                    label.style.left = left + "px";
                    label.style.width = getAxisOption("axisLabelWidth") + "px";
                    containerDiv.appendChild(label);
                    this$1.xlabels_.push(label);
                }
            }
            context.strokeStyle = g.getOptionForAxis("axisLineColor", "x");
            context.lineWidth = g.getOptionForAxis("axisLineWidth", "x");
            context.beginPath();
            var axisY;
            if (g.getOption("drawAxesAtZero")) {
                var r = g.toPercentYCoord(0, 0);
                if (r > 1 || r < 0) r = 1;
                axisY = halfDown(area.y + r * area.h);
            } else {
                axisY = halfDown(area.y + area.h);
            }
            context.moveTo(halfUp(area.x), axisY);
            context.lineTo(halfUp(area.x + area.w), axisY);
            context.closePath();
            context.stroke();
        }
        context.restore();
    };
    return axes;
}();

Dygraph.Plugins.ChartLabels = function() {
    "use strict";
    var chart_labels = function() {
        this.title_div_ = null;
        this.xlabel_div_ = null;
        this.ylabel_div_ = null;
        this.y2label_div_ = null;
    };
    chart_labels.prototype.toString = function() {
        return "ChartLabels Plugin";
    };
    chart_labels.prototype.activate = function(g) {
        return {
            layout: this.layout,
            didDrawChart: this.didDrawChart
        };
    };
    var createDivInRect = function(r) {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = r.x + "px";
        div.style.top = r.y + "px";
        div.style.width = r.w + "px";
        div.style.height = r.h + "px";
        return div;
    };
    chart_labels.prototype.detachLabels_ = function() {
        var els = [ this.title_div_, this.xlabel_div_, this.ylabel_div_, this.y2label_div_ ];
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (!el) continue;
            if (el.parentNode) el.parentNode.removeChild(el);
        }
        this.title_div_ = null;
        this.xlabel_div_ = null;
        this.ylabel_div_ = null;
        this.y2label_div_ = null;
    };
    var createRotatedDiv = function(g, box, axis, classes, html) {
        var div = document.createElement("div");
        div.style.position = "absolute";
        if (axis == 1) {
            div.style.left = "0px";
        } else {
            div.style.left = box.x + "px";
        }
        div.style.top = box.y + "px";
        div.style.width = box.w + "px";
        div.style.height = box.h + "px";
        div.style.fontSize = g.getOption("yLabelWidth") - 2 + "px";
        var inner_div = document.createElement("div");
        inner_div.style.position = "absolute";
        inner_div.style.width = box.h + "px";
        inner_div.style.height = box.w + "px";
        inner_div.style.top = box.h / 2 - box.w / 2 + "px";
        inner_div.style.left = box.w / 2 - box.h / 2 + "px";
        inner_div.style.textAlign = "center";
        var val = "rotate(" + (axis == 1 ? "-" : "") + "90deg)";
        inner_div.style.transform = val;
        inner_div.style.WebkitTransform = val;
        inner_div.style.MozTransform = val;
        inner_div.style.OTransform = val;
        inner_div.style.msTransform = val;
        if (typeof document.documentMode !== "undefined" && document.documentMode < 9) {
            inner_div.style.filter = "progid:DXImageTransform.Microsoft.BasicImage(rotation=" + (axis == 1 ? "3" : "1") + ")";
            inner_div.style.left = "0px";
            inner_div.style.top = "0px";
        }
        var class_div = document.createElement("div");
        class_div.className = classes;
        class_div.innerHTML = html;
        inner_div.appendChild(class_div);
        div.appendChild(inner_div);
        return div;
    };
    chart_labels.prototype.layout = function(e) {
        this.detachLabels_();
        var g = e.dygraph;
        var div = e.chart_div;
        if (g.getOption("title")) {
            var title_rect = e.reserveSpaceTop(g.getOption("titleHeight"));
            this.title_div_ = createDivInRect(title_rect);
            this.title_div_.style.textAlign = "center";
            this.title_div_.style.fontSize = g.getOption("titleHeight") - 8 + "px";
            this.title_div_.style.fontWeight = "bold";
            this.title_div_.style.zIndex = 10;
            var class_div = document.createElement("div");
            class_div.className = "dygraph-label dygraph-title";
            class_div.innerHTML = g.getOption("title");
            this.title_div_.appendChild(class_div);
            div.appendChild(this.title_div_);
        }
        if (g.getOption("xlabel")) {
            var x_rect = e.reserveSpaceBottom(g.getOption("xLabelHeight"));
            this.xlabel_div_ = createDivInRect(x_rect);
            this.xlabel_div_.style.textAlign = "center";
            this.xlabel_div_.style.fontSize = g.getOption("xLabelHeight") - 2 + "px";
            var class_div = document.createElement("div");
            class_div.className = "dygraph-label dygraph-xlabel";
            class_div.innerHTML = g.getOption("xlabel");
            this.xlabel_div_.appendChild(class_div);
            div.appendChild(this.xlabel_div_);
        }
        if (g.getOption("ylabel")) {
            var y_rect = e.reserveSpaceLeft(0);
            this.ylabel_div_ = createRotatedDiv(g, y_rect, 1, "dygraph-label dygraph-ylabel", g.getOption("ylabel"));
            div.appendChild(this.ylabel_div_);
        }
        if (g.getOption("y2label") && g.numAxes() == 2) {
            var y2_rect = e.reserveSpaceRight(0);
            this.y2label_div_ = createRotatedDiv(g, y2_rect, 2, "dygraph-label dygraph-y2label", g.getOption("y2label"));
            div.appendChild(this.y2label_div_);
        }
    };
    chart_labels.prototype.didDrawChart = function(e) {
        var g = e.dygraph;
        if (this.title_div_) {
            this.title_div_.children[0].innerHTML = g.getOption("title");
        }
        if (this.xlabel_div_) {
            this.xlabel_div_.children[0].innerHTML = g.getOption("xlabel");
        }
        if (this.ylabel_div_) {
            this.ylabel_div_.children[0].children[0].innerHTML = g.getOption("ylabel");
        }
        if (this.y2label_div_) {
            this.y2label_div_.children[0].children[0].innerHTML = g.getOption("y2label");
        }
    };
    chart_labels.prototype.clearChart = function() {};
    chart_labels.prototype.destroy = function() {
        this.detachLabels_();
    };
    return chart_labels;
}();

Dygraph.Plugins.Grid = function() {
    "use strict";
    var grid = function() {};
    grid.prototype.toString = function() {
        return "Gridline Plugin";
    };
    grid.prototype.activate = function(g) {
        return {
            willDrawChart: this.willDrawChart
        };
    };
    grid.prototype.willDrawChart = function(e) {
        var g = e.dygraph;
        var ctx = e.drawingContext;
        var layout = g.layout_;
        var area = e.dygraph.plotter_.area;
        function halfUp(x) {
            return Math.round(x) + .5;
        }
        function halfDown(y) {
            return Math.round(y) - .5;
        }
        var x, y, i, ticks;
        if (g.getOptionForAxis("drawGrid", "y")) {
            var axes = [ "y", "y2" ];
            var strokeStyles = [], lineWidths = [], drawGrid = [], stroking = [], strokePattern = [];
            for (var i = 0; i < axes.length; i++) {
                drawGrid[i] = g.getOptionForAxis("drawGrid", axes[i]);
                if (drawGrid[i]) {
                    strokeStyles[i] = g.getOptionForAxis("gridLineColor", axes[i]);
                    lineWidths[i] = g.getOptionForAxis("gridLineWidth", axes[i]);
                    strokePattern[i] = g.getOptionForAxis("gridLinePattern", axes[i]);
                    stroking[i] = strokePattern[i] && strokePattern[i].length >= 2;
                }
            }
            ticks = layout.yticks;
            ctx.save();
            for (i = 0; i < ticks.length; i++) {
                var axis = ticks[i][0];
                if (drawGrid[axis]) {
                    if (stroking[axis]) {
                        ctx.installPattern(strokePattern[axis]);
                    }
                    ctx.strokeStyle = strokeStyles[axis];
                    ctx.lineWidth = lineWidths[axis];
                    x = halfUp(area.x);
                    y = halfDown(area.y + ticks[i][1] * area.h);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + area.w, y);
                    ctx.closePath();
                    ctx.stroke();
                    if (stroking[axis]) {
                        ctx.uninstallPattern();
                    }
                }
            }
            ctx.restore();
        }
        if (g.getOptionForAxis("drawGrid", "x")) {
            ticks = layout.xticks;
            ctx.save();
            var strokePattern = g.getOptionForAxis("gridLinePattern", "x");
            var stroking = strokePattern && strokePattern.length >= 2;
            if (stroking) {
                ctx.installPattern(strokePattern);
            }
            ctx.strokeStyle = g.getOptionForAxis("gridLineColor", "x");
            ctx.lineWidth = g.getOptionForAxis("gridLineWidth", "x");
            for (i = 0; i < ticks.length; i++) {
                x = halfUp(area.x + ticks[i][0] * area.w);
                y = halfDown(area.y + area.h);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, area.y);
                ctx.closePath();
                ctx.stroke();
            }
            if (stroking) {
                ctx.uninstallPattern();
            }
            ctx.restore();
        }
    };
    grid.prototype.destroy = function() {};
    return grid;
}();

Dygraph.Plugins.Legend = function() {
    "use strict";
    var legend = function() {
        this.legend_div_ = null;
        this.is_generated_div_ = false;
    };
    legend.prototype.toString = function() {
        return "Legend Plugin";
    };
    var generateLegendDashHTML;
    legend.prototype.activate = function(g) {
        var div;
        var divWidth = g.getOption("labelsDivWidth");
        var userLabelsDiv = g.getOption("labelsDiv");
        if (userLabelsDiv && null !== userLabelsDiv) {
            if (typeof userLabelsDiv == "string" || userLabelsDiv instanceof String) {
                div = document.getElementById(userLabelsDiv);
            } else {
                div = userLabelsDiv;
            }
        } else {
            var messagestyle = {
                position: "absolute",
                fontSize: "14px",
                zIndex: 10,
                width: divWidth + "px",
                top: "0px",
                left: g.size().width - divWidth - 2 + "px",
                background: "white",
                lineHeight: "normal",
                textAlign: "left",
                overflow: "hidden"
            };
            Dygraph.update(messagestyle, g.getOption("labelsDivStyles"));
            div = document.createElement("div");
            div.className = "dygraph-legend";
            for (var name in messagestyle) {
                if (!messagestyle.hasOwnProperty(name)) continue;
                try {
                    div.style[name] = messagestyle[name];
                } catch (e) {
                    console.warn("You are using unsupported css properties for your " + "browser in labelsDivStyles");
                }
            }
            g.graphDiv.appendChild(div);
            this.is_generated_div_ = true;
        }
        this.legend_div_ = div;
        this.one_em_width_ = 10;
        return {
            select: this.select,
            deselect: this.deselect,
            predraw: this.predraw,
            didDrawChart: this.didDrawChart
        };
    };
    var calculateEmWidthInDiv = function(div) {
        var sizeSpan = document.createElement("span");
        sizeSpan.setAttribute("style", "margin: 0; padding: 0 0 0 1em; border: 0;");
        div.appendChild(sizeSpan);
        var oneEmWidth = sizeSpan.offsetWidth;
        div.removeChild(sizeSpan);
        return oneEmWidth;
    };
    var escapeHTML = function(str) {
        return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    legend.prototype.select = function(e) {
        var xValue = e.selectedX;
        var points = e.selectedPoints;
        var row = e.selectedRow;
        var legendMode = e.dygraph.getOption("legend");
        if (legendMode === "never") {
            this.legend_div_.style.display = "none";
            return;
        }
        if (points.length == 0) {
            this.legend_div_.style.display = "none";
            return;
        }
        if (legendMode === "highlight") {
            var area = e.dygraph.plotter_.area;
            var labelsDivWidth = this.legend_div_.offsetWidth;
            var yAxisLabelWidth = e.dygraph.getOptionForAxis("axisLabelWidth", "y");
            var leftLegend = points[0].x * area.w + 50;
            var topLegend = points[0].y * area.h - 50;
            if (leftLegend + labelsDivWidth + 1 > area.w) {
                leftLegend = leftLegend - 2 * 50 - labelsDivWidth - (yAxisLabelWidth - area.x);
            }
            e.dygraph.graphDiv.appendChild(this.legend_div_);
            this.legend_div_.style.left = yAxisLabelWidth + leftLegend + "px";
            this.legend_div_.style.top = topLegend + "px";
        }
        if (legendMode === "follow") {
            var area = e.dygraph.plotter_.area;
            var labelsDivWidth = this.legend_div_.offsetWidth;
            var yAxisLabelWidth = e.dygraph.getOptionForAxis("axisLabelWidth", "y");
            var leftLegend = points[0].x * area.w + 50;
            var topLegend = points[0].y * area.h - 50;
            if (leftLegend + labelsDivWidth + 1 > area.w) {
                leftLegend = leftLegend - 2 * 50 - labelsDivWidth - (yAxisLabelWidth - area.x);
            }
            e.dygraph.graphDiv.appendChild(this.legend_div_);
            this.legend_div_.style.left = yAxisLabelWidth + leftLegend + "px";
            this.legend_div_.style.top = topLegend + "px";
        }
        var html = legend.generateLegendHTML(e.dygraph, xValue, points, this.one_em_width_, row);
        this.legend_div_.innerHTML = html;
        this.legend_div_.style.display = "";
    };
    legend.prototype.deselect = function(e) {
        var legendMode = e.dygraph.getOption("legend");
        if (legendMode !== "always") {
            this.legend_div_.style.display = "none";
        }
        var oneEmWidth = calculateEmWidthInDiv(this.legend_div_);
        this.one_em_width_ = oneEmWidth;
        var html = legend.generateLegendHTML(e.dygraph, undefined, undefined, oneEmWidth, null);
        this.legend_div_.innerHTML = html;
    };
    legend.prototype.didDrawChart = function(e) {
        this.deselect(e);
    };
    legend.prototype.predraw = function(e) {
        if (!this.is_generated_div_) return;
        e.dygraph.graphDiv.appendChild(this.legend_div_);
        var area = e.dygraph.plotter_.area;
        var labelsDivWidth = e.dygraph.getOption("labelsDivWidth");
        this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
        this.legend_div_.style.top = area.y + "px";
        this.legend_div_.style.width = labelsDivWidth + "px";
    };
    legend.prototype.destroy = function() {
        this.legend_div_ = null;
    };
    legend.generateLegendHTML = function(g, x, sel_points, oneEmWidth, row) {
        if (g.getOption("showLabelsOnHighlight") !== true) return "";
        var html, sepLines, i, dash, strokePattern;
        var labels = g.getLabels();
        if (typeof x === "undefined") {
            if (g.getOption("legend") != "always") {
                return "";
            }
            sepLines = g.getOption("labelsSeparateLines");
            html = "";
            for (i = 1; i < labels.length; i++) {
                var series = g.getPropertiesForSeries(labels[i]);
                if (!series.visible) continue;
                if (html !== "") html += sepLines ? "<br/>" : " ";
                strokePattern = g.getOption("strokePattern", labels[i]);
                dash = generateLegendDashHTML(strokePattern, series.color, oneEmWidth);
                html += "<span style='font-weight: bold; color: " + series.color + ";'>" + dash + " " + escapeHTML(labels[i]) + "</span>";
            }
            return html;
        }
        var xOptView = g.optionsViewForAxis_("x");
        var xvf = xOptView("valueFormatter");
        html = xvf.call(g, x, xOptView, labels[0], g, row, 0);
        if (html !== "") {
            html += ":";
        }
        var yOptViews = [];
        var num_axes = g.numAxes();
        for (i = 0; i < num_axes; i++) {
            yOptViews[i] = g.optionsViewForAxis_("y" + (i ? 1 + i : ""));
        }
        var showZeros = g.getOption("labelsShowZeroValues");
        sepLines = g.getOption("labelsSeparateLines");
        var highlightSeries = g.getHighlightSeries();
        var legendMode = g.getOption("legend");
        if (legendMode === "highlight") {
            for (i = 0; i < sel_points.length; i++) {
                var pt = sel_points[i];
                if (pt.name == highlightSeries) {
                    if (pt.yval === 0 && !showZeros) continue;
                    if (!Dygraph.isOK(pt.canvasy)) continue;
                    if (sepLines) html += "<br/>";
                    var series = g.getPropertiesForSeries(pt.name);
                    var yOptView = yOptViews[series.axis - 1];
                    var fmtFunc = yOptView("valueFormatter");
                    var yval = fmtFunc.call(g, pt.yval, yOptView, pt.name, g, row, labels.indexOf(pt.name));
                    var cls = pt.name == highlightSeries ? " class='highlight'" : "";
                    html += "<span" + cls + ">" + " <b><span style='color: " + series.color + ";'>" + escapeHTML(pt.name) + "</span></b>:&#160;" + yval + "</span>";
                }
            }
        } else {
            for (i = 0; i < sel_points.length; i++) {
                var pt = sel_points[i];
                if (pt.yval === 0 && !showZeros) continue;
                if (!Dygraph.isOK(pt.canvasy)) continue;
                if (sepLines) html += "<br/>";
                var series = g.getPropertiesForSeries(pt.name);
                var yOptView = yOptViews[series.axis - 1];
                var fmtFunc = yOptView("valueFormatter");
                var yval = fmtFunc.call(g, pt.yval, yOptView, pt.name, g, row, labels.indexOf(pt.name));
                var cls = pt.name == highlightSeries ? " class='highlight'" : "";
                html += "<span" + cls + ">" + " <b><span style='color: " + series.color + ";'>" + escapeHTML(pt.name) + "</span></b>:&#160;" + yval + "</span>";
            }
        }
        return html;
    };
    generateLegendDashHTML = function(strokePattern, color, oneEmWidth) {
        var isIE = /MSIE/.test(navigator.userAgent) && !window.opera;
        if (isIE) return "&mdash;";
        if (!strokePattern || strokePattern.length <= 1) {
            return '<div style="display: inline-block; position: relative; ' + "bottom: .5ex; padding-left: 1em; height: 1px; " + "border-bottom: 2px solid " + color + ';"></div>';
        }
        var i, j, paddingLeft, marginRight;
        var strokePixelLength = 0, segmentLoop = 0;
        var normalizedPattern = [];
        var loop;
        for (i = 0; i <= strokePattern.length; i++) {
            strokePixelLength += strokePattern[i % strokePattern.length];
        }
        loop = Math.floor(oneEmWidth / (strokePixelLength - strokePattern[0]));
        if (loop > 1) {
            for (i = 0; i < strokePattern.length; i++) {
                normalizedPattern[i] = strokePattern[i] / oneEmWidth;
            }
            segmentLoop = normalizedPattern.length;
        } else {
            loop = 1;
            for (i = 0; i < strokePattern.length; i++) {
                normalizedPattern[i] = strokePattern[i] / strokePixelLength;
            }
            segmentLoop = normalizedPattern.length + 1;
        }
        var dash = "";
        for (j = 0; j < loop; j++) {
            for (i = 0; i < segmentLoop; i += 2) {
                paddingLeft = normalizedPattern[i % normalizedPattern.length];
                if (i < strokePattern.length) {
                    marginRight = normalizedPattern[(i + 1) % normalizedPattern.length];
                } else {
                    marginRight = 0;
                }
                dash += '<div style="display: inline-block; position: relative; ' + "bottom: .5ex; margin-right: " + marginRight + "em; padding-left: " + paddingLeft + "em; height: 1px; border-bottom: 2px solid " + color + ';"></div>';
            }
        }
        return dash;
    };
    return legend;
}();

Dygraph.Plugins.RangeSelector = function() {
    "use strict";
    var rangeSelector = function() {
        this.isIE_ = /MSIE/.test(navigator.userAgent) && !window.opera;
        this.hasTouchInterface_ = typeof TouchEvent != "undefined";
        this.isMobileDevice_ = /mobile|android/gi.test(navigator.appVersion);
        this.interfaceCreated_ = false;
    };
    rangeSelector.prototype.toString = function() {
        return "RangeSelector Plugin";
    };
    rangeSelector.prototype.activate = function(dygraph) {
        this.dygraph_ = dygraph;
        this.isUsingExcanvas_ = dygraph.isUsingExcanvas_;
        if (this.getOption_("showRangeSelector")) {
            this.createInterface_();
        }
        return {
            layout: this.reserveSpace_,
            predraw: this.renderStaticLayer_,
            didDrawChart: this.renderInteractiveLayer_
        };
    };
    rangeSelector.prototype.destroy = function() {
        this.bgcanvas_ = null;
        this.fgcanvas_ = null;
        this.leftZoomHandle_ = null;
        this.rightZoomHandle_ = null;
        this.iePanOverlay_ = null;
    };
    rangeSelector.prototype.getOption_ = function(name, opt_series) {
        return this.dygraph_.getOption(name, opt_series);
    };
    rangeSelector.prototype.setDefaultOption_ = function(name, value) {
        this.dygraph_.attrs_[name] = value;
    };
    rangeSelector.prototype.createInterface_ = function() {
        this.createCanvases_();
        if (this.isUsingExcanvas_) {
            this.createIEPanOverlay_();
        }
        this.createZoomHandles_();
        this.initInteraction_();
        if (this.getOption_("animatedZooms")) {
            console.warn("Animated zooms and range selector are not compatible; disabling animatedZooms.");
            this.dygraph_.updateOptions({
                animatedZooms: false
            }, true);
        }
        this.interfaceCreated_ = true;
        this.addToGraph_();
    };
    rangeSelector.prototype.addToGraph_ = function() {
        var graphDiv = this.graphDiv_ = this.dygraph_.graphDiv;
        graphDiv.appendChild(this.bgcanvas_);
        graphDiv.appendChild(this.fgcanvas_);
        graphDiv.appendChild(this.leftZoomHandle_);
        graphDiv.appendChild(this.rightZoomHandle_);
    };
    rangeSelector.prototype.removeFromGraph_ = function() {
        var graphDiv = this.graphDiv_;
        graphDiv.removeChild(this.bgcanvas_);
        graphDiv.removeChild(this.fgcanvas_);
        graphDiv.removeChild(this.leftZoomHandle_);
        graphDiv.removeChild(this.rightZoomHandle_);
        this.graphDiv_ = null;
    };
    rangeSelector.prototype.reserveSpace_ = function(e) {
        if (this.getOption_("showRangeSelector")) {
            e.reserveSpaceBottom(this.getOption_("rangeSelectorHeight") + 4);
        }
    };
    rangeSelector.prototype.renderStaticLayer_ = function() {
        if (!this.updateVisibility_()) {
            return;
        }
        this.resize_();
        this.drawStaticLayer_();
    };
    rangeSelector.prototype.renderInteractiveLayer_ = function() {
        if (!this.updateVisibility_() || this.isChangingRange_) {
            return;
        }
        this.placeZoomHandles_();
        this.drawInteractiveLayer_();
    };
    rangeSelector.prototype.updateVisibility_ = function() {
        var enabled = this.getOption_("showRangeSelector");
        if (enabled) {
            if (!this.interfaceCreated_) {
                this.createInterface_();
            } else if (!this.graphDiv_ || !this.graphDiv_.parentNode) {
                this.addToGraph_();
            }
        } else if (this.graphDiv_) {
            this.removeFromGraph_();
            var dygraph = this.dygraph_;
            setTimeout(function() {
                dygraph.width_ = 0;
                dygraph.resize();
            }, 1);
        }
        return enabled;
    };
    rangeSelector.prototype.resize_ = function() {
        function setElementRect(canvas, context, rect) {
            var canvasScale = Dygraph.getContextPixelRatio(context);
            canvas.style.top = rect.y + "px";
            canvas.style.left = rect.x + "px";
            canvas.width = rect.w * canvasScale;
            canvas.height = rect.h * canvasScale;
            canvas.style.width = rect.w + "px";
            canvas.style.height = rect.h + "px";
            if (canvasScale != 1) {
                context.scale(canvasScale, canvasScale);
            }
        }
        var plotArea = this.dygraph_.layout_.getPlotArea();
        var xAxisLabelHeight = 0;
        if (this.dygraph_.getOptionForAxis("drawAxis", "x")) {
            xAxisLabelHeight = this.getOption_("xAxisHeight") || this.getOption_("axisLabelFontSize") + 2 * this.getOption_("axisTickSize");
        }
        this.canvasRect_ = {
            x: plotArea.x,
            y: plotArea.y + plotArea.h + xAxisLabelHeight + 4,
            w: plotArea.w,
            h: this.getOption_("rangeSelectorHeight")
        };
        setElementRect(this.bgcanvas_, this.bgcanvas_ctx_, this.canvasRect_);
        setElementRect(this.fgcanvas_, this.fgcanvas_ctx_, this.canvasRect_);
    };
    rangeSelector.prototype.createCanvases_ = function() {
        this.bgcanvas_ = Dygraph.createCanvas();
        this.bgcanvas_.className = "dygraph-rangesel-bgcanvas";
        this.bgcanvas_.style.position = "absolute";
        this.bgcanvas_.style.zIndex = 9;
        this.bgcanvas_ctx_ = Dygraph.getContext(this.bgcanvas_);
        this.fgcanvas_ = Dygraph.createCanvas();
        this.fgcanvas_.className = "dygraph-rangesel-fgcanvas";
        this.fgcanvas_.style.position = "absolute";
        this.fgcanvas_.style.zIndex = 9;
        this.fgcanvas_.style.cursor = "default";
        this.fgcanvas_ctx_ = Dygraph.getContext(this.fgcanvas_);
    };
    rangeSelector.prototype.createIEPanOverlay_ = function() {
        this.iePanOverlay_ = document.createElement("div");
        this.iePanOverlay_.style.position = "absolute";
        this.iePanOverlay_.style.backgroundColor = "white";
        this.iePanOverlay_.style.filter = "alpha(opacity=0)";
        this.iePanOverlay_.style.display = "none";
        this.iePanOverlay_.style.cursor = "move";
        this.fgcanvas_.appendChild(this.iePanOverlay_);
    };
    rangeSelector.prototype.createZoomHandles_ = function() {
        var img = new Image();
        img.className = "dygraph-rangesel-zoomhandle";
        img.style.position = "absolute";
        img.style.zIndex = 10;
        img.style.visibility = "hidden";
        img.style.cursor = "col-resize";
        if (/MSIE 7/.test(navigator.userAgent)) {
            img.width = 7;
            img.height = 14;
            img.style.backgroundColor = "white";
            img.style.border = "1px solid #333333";
        } else {
            img.width = 9;
            img.height = 16;
            img.src = "data:image/png;base64," + "iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAA" + "zwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENv" + "bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl" + "6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7s" + "qSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII=";
        }
        if (this.isMobileDevice_) {
            img.width *= 2;
            img.height *= 2;
        }
        this.leftZoomHandle_ = img;
        this.rightZoomHandle_ = img.cloneNode(false);
    };
    rangeSelector.prototype.initInteraction_ = function() {
        var self = this;
        var topElem = document;
        var clientXLast = 0;
        var handle = null;
        var isZooming = false;
        var isPanning = false;
        var dynamic = !this.isMobileDevice_ && !this.isUsingExcanvas_;
        var tarp = new Dygraph.IFrameTarp();
        var toXDataWindow, onZoomStart, onZoom, onZoomEnd, doZoom, isMouseInPanZone, onPanStart, onPan, onPanEnd, doPan, onCanvasHover;
        var onZoomHandleTouchEvent, onCanvasTouchEvent, addTouchEvents;
        toXDataWindow = function(zoomHandleStatus) {
            var xDataLimits = self.dygraph_.xAxisExtremes();
            var fact = (xDataLimits[1] - xDataLimits[0]) / self.canvasRect_.w;
            var xDataMin = xDataLimits[0] + (zoomHandleStatus.leftHandlePos - self.canvasRect_.x) * fact;
            var xDataMax = xDataLimits[0] + (zoomHandleStatus.rightHandlePos - self.canvasRect_.x) * fact;
            return [ xDataMin, xDataMax ];
        };
        onZoomStart = function(e) {
            Dygraph.cancelEvent(e);
            isZooming = true;
            clientXLast = e.clientX;
            handle = e.target ? e.target : e.srcElement;
            if (e.type === "mousedown" || e.type === "dragstart") {
                Dygraph.addEvent(topElem, "mousemove", onZoom);
                Dygraph.addEvent(topElem, "mouseup", onZoomEnd);
            }
            self.fgcanvas_.style.cursor = "col-resize";
            tarp.cover();
            return true;
        };
        onZoom = function(e) {
            if (!isZooming) {
                return false;
            }
            Dygraph.cancelEvent(e);
            var delX = e.clientX - clientXLast;
            if (Math.abs(delX) < 4) {
                return true;
            }
            clientXLast = e.clientX;
            var zoomHandleStatus = self.getZoomHandleStatus_();
            var newPos;
            if (handle == self.leftZoomHandle_) {
                newPos = zoomHandleStatus.leftHandlePos + delX;
                newPos = Math.min(newPos, zoomHandleStatus.rightHandlePos - handle.width - 3);
                newPos = Math.max(newPos, self.canvasRect_.x);
            } else {
                newPos = zoomHandleStatus.rightHandlePos + delX;
                newPos = Math.min(newPos, self.canvasRect_.x + self.canvasRect_.w);
                newPos = Math.max(newPos, zoomHandleStatus.leftHandlePos + handle.width + 3);
            }
            var halfHandleWidth = handle.width / 2;
            handle.style.left = newPos - halfHandleWidth + "px";
            self.drawInteractiveLayer_();
            if (dynamic) {
                doZoom();
            }
            return true;
        };
        onZoomEnd = function(e) {
            if (!isZooming) {
                return false;
            }
            isZooming = false;
            tarp.uncover();
            Dygraph.removeEvent(topElem, "mousemove", onZoom);
            Dygraph.removeEvent(topElem, "mouseup", onZoomEnd);
            self.fgcanvas_.style.cursor = "default";
            if (!dynamic) {
                doZoom();
            }
            return true;
        };
        doZoom = function() {
            try {
                var zoomHandleStatus = self.getZoomHandleStatus_();
                self.isChangingRange_ = true;
                if (!zoomHandleStatus.isZoomed) {
                    self.dygraph_.resetZoom();
                } else {
                    var xDataWindow = toXDataWindow(zoomHandleStatus);
                    self.dygraph_.doZoomXDates_(xDataWindow[0], xDataWindow[1]);
                }
            } finally {
                self.isChangingRange_ = false;
            }
        };
        isMouseInPanZone = function(e) {
            if (self.isUsingExcanvas_) {
                return e.srcElement == self.iePanOverlay_;
            } else {
                var rect = self.leftZoomHandle_.getBoundingClientRect();
                var leftHandleClientX = rect.left + rect.width / 2;
                rect = self.rightZoomHandle_.getBoundingClientRect();
                var rightHandleClientX = rect.left + rect.width / 2;
                return e.clientX > leftHandleClientX && e.clientX < rightHandleClientX;
            }
        };
        onPanStart = function(e) {
            if (!isPanning && isMouseInPanZone(e) && self.getZoomHandleStatus_().isZoomed) {
                Dygraph.cancelEvent(e);
                isPanning = true;
                clientXLast = e.clientX;
                if (e.type === "mousedown") {
                    Dygraph.addEvent(topElem, "mousemove", onPan);
                    Dygraph.addEvent(topElem, "mouseup", onPanEnd);
                }
                return true;
            }
            return false;
        };
        onPan = function(e) {
            if (!isPanning) {
                return false;
            }
            Dygraph.cancelEvent(e);
            var delX = e.clientX - clientXLast;
            if (Math.abs(delX) < 4) {
                return true;
            }
            clientXLast = e.clientX;
            var zoomHandleStatus = self.getZoomHandleStatus_();
            var leftHandlePos = zoomHandleStatus.leftHandlePos;
            var rightHandlePos = zoomHandleStatus.rightHandlePos;
            var rangeSize = rightHandlePos - leftHandlePos;
            if (leftHandlePos + delX <= self.canvasRect_.x) {
                leftHandlePos = self.canvasRect_.x;
                rightHandlePos = leftHandlePos + rangeSize;
            } else if (rightHandlePos + delX >= self.canvasRect_.x + self.canvasRect_.w) {
                rightHandlePos = self.canvasRect_.x + self.canvasRect_.w;
                leftHandlePos = rightHandlePos - rangeSize;
            } else {
                leftHandlePos += delX;
                rightHandlePos += delX;
            }
            var halfHandleWidth = self.leftZoomHandle_.width / 2;
            self.leftZoomHandle_.style.left = leftHandlePos - halfHandleWidth + "px";
            self.rightZoomHandle_.style.left = rightHandlePos - halfHandleWidth + "px";
            self.drawInteractiveLayer_();
            if (dynamic) {
                doPan();
            }
            return true;
        };
        onPanEnd = function(e) {
            if (!isPanning) {
                return false;
            }
            isPanning = false;
            Dygraph.removeEvent(topElem, "mousemove", onPan);
            Dygraph.removeEvent(topElem, "mouseup", onPanEnd);
            if (!dynamic) {
                doPan();
            }
            return true;
        };
        doPan = function() {
            try {
                self.isChangingRange_ = true;
                self.dygraph_.dateWindow_ = toXDataWindow(self.getZoomHandleStatus_());
                self.dygraph_.drawGraph_(false);
            } finally {
                self.isChangingRange_ = false;
            }
        };
        onCanvasHover = function(e) {
            if (isZooming || isPanning) {
                return;
            }
            var cursor = isMouseInPanZone(e) ? "move" : "default";
            if (cursor != self.fgcanvas_.style.cursor) {
                self.fgcanvas_.style.cursor = cursor;
            }
        };
        onZoomHandleTouchEvent = function(e) {
            if (e.type == "touchstart" && e.targetTouches.length == 1) {
                if (onZoomStart(e.targetTouches[0])) {
                    Dygraph.cancelEvent(e);
                }
            } else if (e.type == "touchmove" && e.targetTouches.length == 1) {
                if (onZoom(e.targetTouches[0])) {
                    Dygraph.cancelEvent(e);
                }
            } else {
                onZoomEnd(e);
            }
        };
        onCanvasTouchEvent = function(e) {
            if (e.type == "touchstart" && e.targetTouches.length == 1) {
                if (onPanStart(e.targetTouches[0])) {
                    Dygraph.cancelEvent(e);
                }
            } else if (e.type == "touchmove" && e.targetTouches.length == 1) {
                if (onPan(e.targetTouches[0])) {
                    Dygraph.cancelEvent(e);
                }
            } else {
                onPanEnd(e);
            }
        };
        addTouchEvents = function(elem, fn) {
            var types = [ "touchstart", "touchend", "touchmove", "touchcancel" ];
            for (var i = 0; i < types.length; i++) {
                self.dygraph_.addAndTrackEvent(elem, types[i], fn);
            }
        };
        this.setDefaultOption_("interactionModel", Dygraph.Interaction.dragIsPanInteractionModel);
        this.setDefaultOption_("panEdgeFraction", 1e-4);
        var dragStartEvent = window.opera ? "mousedown" : "dragstart";
        this.dygraph_.addAndTrackEvent(this.leftZoomHandle_, dragStartEvent, onZoomStart);
        this.dygraph_.addAndTrackEvent(this.rightZoomHandle_, dragStartEvent, onZoomStart);
        if (this.isUsingExcanvas_) {
            this.dygraph_.addAndTrackEvent(this.iePanOverlay_, "mousedown", onPanStart);
        } else {
            this.dygraph_.addAndTrackEvent(this.fgcanvas_, "mousedown", onPanStart);
            this.dygraph_.addAndTrackEvent(this.fgcanvas_, "mousemove", onCanvasHover);
        }
        if (this.hasTouchInterface_) {
            addTouchEvents(this.leftZoomHandle_, onZoomHandleTouchEvent);
            addTouchEvents(this.rightZoomHandle_, onZoomHandleTouchEvent);
            addTouchEvents(this.fgcanvas_, onCanvasTouchEvent);
        }
    };
    rangeSelector.prototype.drawStaticLayer_ = function() {
        var ctx = this.bgcanvas_ctx_;
        ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
        try {
            this.drawMiniPlot_();
        } catch (ex) {
            console.warn(ex);
        }
        var margin = .5;
        this.bgcanvas_ctx_.lineWidth = 1;
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, this.canvasRect_.h - margin);
        ctx.lineTo(this.canvasRect_.w - margin, this.canvasRect_.h - margin);
        ctx.lineTo(this.canvasRect_.w - margin, margin);
        ctx.stroke();
    };
    rangeSelector.prototype.drawMiniPlot_ = function() {
        var fillStyle = this.getOption_("rangeSelectorPlotFillColor");
        var strokeStyle = this.getOption_("rangeSelectorPlotStrokeColor");
        if (!fillStyle && !strokeStyle) {
            return;
        }
        var stepPlot = this.getOption_("stepPlot");
        var combinedSeriesData = this.computeCombinedSeriesAndLimits_();
        var yRange = combinedSeriesData.yMax - combinedSeriesData.yMin;
        var ctx = this.bgcanvas_ctx_;
        var margin = .5;
        var xExtremes = this.dygraph_.xAxisExtremes();
        var xRange = Math.max(xExtremes[1] - xExtremes[0], 1e-30);
        var xFact = (this.canvasRect_.w - margin) / xRange;
        var yFact = (this.canvasRect_.h - margin) / yRange;
        var canvasWidth = this.canvasRect_.w - margin;
        var canvasHeight = this.canvasRect_.h - margin;
        var prevX = null, prevY = null;
        ctx.beginPath();
        ctx.moveTo(margin, canvasHeight);
        for (var i = 0; i < combinedSeriesData.data.length; i++) {
            var dataPoint = combinedSeriesData.data[i];
            var x = dataPoint[0] !== null ? (dataPoint[0] - xExtremes[0]) * xFact : NaN;
            var y = dataPoint[1] !== null ? canvasHeight - (dataPoint[1] - combinedSeriesData.yMin) * yFact : NaN;
            if (!stepPlot && prevX !== null && Math.round(x) == Math.round(prevX)) {
                continue;
            }
            if (isFinite(x) && isFinite(y)) {
                if (prevX === null) {
                    ctx.lineTo(x, canvasHeight);
                } else if (stepPlot) {
                    ctx.lineTo(x, prevY);
                }
                ctx.lineTo(x, y);
                prevX = x;
                prevY = y;
            } else {
                if (prevX !== null) {
                    if (stepPlot) {
                        ctx.lineTo(x, prevY);
                        ctx.lineTo(x, canvasHeight);
                    } else {
                        ctx.lineTo(prevX, canvasHeight);
                    }
                }
                prevX = prevY = null;
            }
        }
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.closePath();
        if (fillStyle) {
            var lingrad = this.bgcanvas_ctx_.createLinearGradient(0, 0, 0, canvasHeight);
            lingrad.addColorStop(0, "white");
            lingrad.addColorStop(1, fillStyle);
            this.bgcanvas_ctx_.fillStyle = lingrad;
            ctx.fill();
        }
        if (strokeStyle) {
            this.bgcanvas_ctx_.strokeStyle = strokeStyle;
            this.bgcanvas_ctx_.lineWidth = 1.5;
            ctx.stroke();
        }
    };
    rangeSelector.prototype.computeCombinedSeriesAndLimits_ = function() {
        var this$1 = this;

        var g = this.dygraph_;
        var logscale = this.getOption_("logscale");
        var i;
        var numColumns = g.numColumns();
        var labels = g.getLabels();
        var includeSeries = new Array(numColumns);
        var anySet = false;
        for (i = 1; i < numColumns; i++) {
            var include = this$1.getOption_("showInRangeSelector", labels[i]);
            includeSeries[i] = include;
            if (include !== null) anySet = true;
        }
        if (!anySet) {
            for (i = 0; i < includeSeries.length; i++) includeSeries[i] = true;
        }
        var rolledSeries = [];
        var dataHandler = g.dataHandler_;
        var options = g.attributes_;
        for (i = 1; i < g.numColumns(); i++) {
            if (!includeSeries[i]) continue;
            var series = dataHandler.extractSeries(g.rawData_, i, options);
            if (g.rollPeriod() > 1) {
                series = dataHandler.rollingAverage(series, g.rollPeriod(), options);
            }
            rolledSeries.push(series);
        }
        var combinedSeries = [];
        for (i = 0; i < rolledSeries[0].length; i++) {
            var sum = 0;
            var count = 0;
            for (var j = 0; j < rolledSeries.length; j++) {
                var y = rolledSeries[j][i][1];
                if (y === null || isNaN(y)) continue;
                count++;
                sum += y;
            }
            combinedSeries.push([ rolledSeries[0][i][0], sum / count ]);
        }
        var yMin = Number.MAX_VALUE;
        var yMax = -Number.MAX_VALUE;
        for (i = 0; i < combinedSeries.length; i++) {
            var yVal = combinedSeries[i][1];
            if (yVal !== null && isFinite(yVal) && (!logscale || yVal > 0)) {
                yMin = Math.min(yMin, yVal);
                yMax = Math.max(yMax, yVal);
            }
        }
        var extraPercent = .25;
        if (logscale) {
            yMax = Dygraph.log10(yMax);
            yMax += yMax * extraPercent;
            yMin = Dygraph.log10(yMin);
            for (i = 0; i < combinedSeries.length; i++) {
                combinedSeries[i][1] = Dygraph.log10(combinedSeries[i][1]);
            }
        } else {
            var yExtra;
            var yRange = yMax - yMin;
            if (yRange <= Number.MIN_VALUE) {
                yExtra = yMax * extraPercent;
            } else {
                yExtra = yRange * extraPercent;
            }
            yMax += yExtra;
            yMin -= yExtra;
        }
        return {
            data: combinedSeries,
            yMin: yMin,
            yMax: yMax
        };
    };
    rangeSelector.prototype.placeZoomHandles_ = function() {
        var xExtremes = this.dygraph_.xAxisExtremes();
        var xWindowLimits = this.dygraph_.xAxisRange();
        var xRange = xExtremes[1] - xExtremes[0];
        var leftPercent = Math.max(0, (xWindowLimits[0] - xExtremes[0]) / xRange);
        var rightPercent = Math.max(0, (xExtremes[1] - xWindowLimits[1]) / xRange);
        var leftCoord = this.canvasRect_.x + this.canvasRect_.w * leftPercent;
        var rightCoord = this.canvasRect_.x + this.canvasRect_.w * (1 - rightPercent);
        var handleTop = Math.max(this.canvasRect_.y, this.canvasRect_.y + (this.canvasRect_.h - this.leftZoomHandle_.height) / 2);
        var halfHandleWidth = this.leftZoomHandle_.width / 2;
        this.leftZoomHandle_.style.left = leftCoord - halfHandleWidth + "px";
        this.leftZoomHandle_.style.top = handleTop + "px";
        this.rightZoomHandle_.style.left = rightCoord - halfHandleWidth + "px";
        this.rightZoomHandle_.style.top = this.leftZoomHandle_.style.top;
        this.leftZoomHandle_.style.visibility = "visible";
        this.rightZoomHandle_.style.visibility = "visible";
    };
    rangeSelector.prototype.drawInteractiveLayer_ = function() {
        var ctx = this.fgcanvas_ctx_;
        ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
        var margin = 1;
        var width = this.canvasRect_.w - margin;
        var height = this.canvasRect_.h - margin;
        var zoomHandleStatus = this.getZoomHandleStatus_();
        ctx.strokeStyle = "black";
        if (!zoomHandleStatus.isZoomed) {
            ctx.beginPath();
            ctx.moveTo(margin, margin);
            ctx.lineTo(margin, height);
            ctx.lineTo(width, height);
            ctx.lineTo(width, margin);
            ctx.stroke();
            if (this.iePanOverlay_) {
                this.iePanOverlay_.style.display = "none";
            }
        } else {
            var leftHandleCanvasPos = Math.max(margin, zoomHandleStatus.leftHandlePos - this.canvasRect_.x);
            var rightHandleCanvasPos = Math.min(width, zoomHandleStatus.rightHandlePos - this.canvasRect_.x);
            ctx.fillStyle = "rgba(240, 240, 240, 0.6)";
            ctx.fillRect(0, 0, leftHandleCanvasPos, this.canvasRect_.h);
            ctx.fillRect(rightHandleCanvasPos, 0, this.canvasRect_.w - rightHandleCanvasPos, this.canvasRect_.h);
            ctx.beginPath();
            ctx.moveTo(margin, margin);
            ctx.lineTo(leftHandleCanvasPos, margin);
            ctx.lineTo(leftHandleCanvasPos, height);
            ctx.lineTo(rightHandleCanvasPos, height);
            ctx.lineTo(rightHandleCanvasPos, margin);
            ctx.lineTo(width, margin);
            ctx.stroke();
            if (this.isUsingExcanvas_) {
                this.iePanOverlay_.style.width = rightHandleCanvasPos - leftHandleCanvasPos + "px";
                this.iePanOverlay_.style.left = leftHandleCanvasPos + "px";
                this.iePanOverlay_.style.height = height + "px";
                this.iePanOverlay_.style.display = "inline";
            }
        }
    };
    rangeSelector.prototype.getZoomHandleStatus_ = function() {
        var halfHandleWidth = this.leftZoomHandle_.width / 2;
        var leftHandlePos = parseFloat(this.leftZoomHandle_.style.left) + halfHandleWidth;
        var rightHandlePos = parseFloat(this.rightZoomHandle_.style.left) + halfHandleWidth;
        return {
            leftHandlePos: leftHandlePos,
            rightHandlePos: rightHandlePos,
            isZoomed: leftHandlePos - 1 > this.canvasRect_.x || rightHandlePos + 1 < this.canvasRect_.x + this.canvasRect_.w
        };
    };
    return rangeSelector;
}();

Dygraph.PLUGINS.push(Dygraph.Plugins.Legend, Dygraph.Plugins.Axes, Dygraph.Plugins.RangeSelector, Dygraph.Plugins.ChartLabels, Dygraph.Plugins.Annotations, Dygraph.Plugins.Grid);

Dygraph.OPTIONS_REFERENCE = {
    xValueParser: {
        "default": "parseFloat() or Date.parse()*",
        labels: [ "CSV parsing" ],
        type: "function(str) -> number",
        description: "A function which parses x-values (i.e. the dependent series). Must return a number, even when the values are dates. In this case, millis since epoch are used. This is used primarily for parsing CSV data. *=Dygraphs is slightly more accepting in the dates which it will parse. See code for details."
    },
    stackedGraph: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "If set, stack series on top of one another rather than drawing them independently. The first series specified in the input data will wind up on top of the chart and the last will be on bottom. NaN values are drawn as white areas without a line on top, see stackedGraphNaNFill for details."
    },
    stackedGraphNaNFill: {
        "default": "all",
        labels: [ "Data Line display" ],
        type: "string",
        description: 'Controls handling of NaN values inside a stacked graph. NaN values are interpolated/extended for stacking purposes, but the actual point value remains NaN in the legend display. Valid option values are "all" (interpolate internally, repeat leftmost and rightmost value as needed), "inside" (interpolate internally only, use zero outside leftmost and rightmost value), and "none" (treat NaN as zero everywhere).'
    },
    pointSize: {
        "default": "1",
        labels: [ "Data Line display" ],
        type: "integer",
        description: 'The size of the dot to draw on each point in pixels (see drawPoints). A dot is always drawn when a point is "isolated", i.e. there is a missing point on either side of it. This also controls the size of those dots.'
    },
    labelsDivStyles: {
        "default": "null",
        labels: [ "Legend" ],
        type: "{}",
        description: "Additional styles to apply to the currently-highlighted points div. For example, { 'fontWeight': 'bold' } will make the labels bold. In general, it is better to use CSS to style the .dygraph-legend class than to use this property."
    },
    drawPoints: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "Draw a small dot at each point, in addition to a line going through the point. This makes the individual data points easier to see, but can increase visual clutter in the chart. The small dot can be replaced with a custom rendering by supplying a <a href='#drawPointCallback'>drawPointCallback</a>."
    },
    drawGapEdgePoints: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "Draw points at the edges of gaps in the data. This improves visibility of small data segments or other data irregularities."
    },
    drawPointCallback: {
        "default": "null",
        labels: [ "Data Line display" ],
        type: "function(g, seriesName, canvasContext, cx, cy, color, pointSize)",
        parameters: [ [ "g", "the reference graph" ], [ "seriesName", "the name of the series" ], [ "canvasContext", "the canvas to draw on" ], [ "cx", "center x coordinate" ], [ "cy", "center y coordinate" ], [ "color", "series color" ], [ "pointSize", "the radius of the image." ], [ "idx", "the row-index of the point in the data." ] ],
        description: "Draw a custom item when drawPoints is enabled. Default is a small dot matching the series color. This method should constrain drawing to within pointSize pixels from (cx, cy).  Also see <a href='#drawHighlightPointCallback'>drawHighlightPointCallback</a>"
    },
    height: {
        "default": "320",
        labels: [ "Overall display" ],
        type: "integer",
        description: "Height, in pixels, of the chart. If the container div has been explicitly sized, this will be ignored."
    },
    zoomCallback: {
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(minDate, maxDate, yRanges)",
        parameters: [ [ "minDate", "milliseconds since epoch" ], [ "maxDate", "milliseconds since epoch." ], [ "yRanges", "is an array of [bottom, top] pairs, one for each y-axis." ] ],
        description: "A function to call when the zoom window is changed (either by zooming in or out)."
    },
    pointClickCallback: {
        snippet: "function(e, point){<br>&nbsp;&nbsp;alert(point);<br>}",
        "default": "null",
        labels: [ "Callbacks", "Interactive Elements" ],
        type: "function(e, point)",
        parameters: [ [ "e", "the event object for the click" ], [ "point", "the point that was clicked See <a href='#point_properties'>Point properties</a> for details" ] ],
        description: "A function to call when a data point is clicked. and the point that was clicked."
    },
    color: {
        "default": "(see description)",
        labels: [ "Data Series Colors" ],
        type: "string",
        example: "red",
        description: "A per-series color definition. Used in conjunction with, and overrides, the colors option."
    },
    colors: {
        "default": "(see description)",
        labels: [ "Data Series Colors" ],
        type: "array<string>",
        example: "['red', '#00FF00']",
        description: 'List of colors for the data series. These can be of the form "#AABBCC" or "rgb(255,100,200)" or "yellow", etc. If not specified, equally-spaced points around a color wheel are used. Overridden by the \'color\' option.'
    },
    connectSeparatedPoints: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "Usually, when Dygraphs encounters a missing value in a data series, it interprets this as a gap and draws it as such. If, instead, the missing values represents an x-value for which only a different series has data, then you'll want to connect the dots by setting this to true. To explicitly include a gap with this option set, use a value of NaN."
    },
    highlightCallback: {
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(event, x, points, row, seriesName)",
        description: "When set, this callback gets called every time a new point is highlighted.",
        parameters: [ [ "event", "the JavaScript mousemove event" ], [ "x", "the x-coordinate of the highlighted points" ], [ "points", "an array of highlighted points: <code>[ {name: 'series', yval: y-value}, &hellip; ]</code>" ], [ "row", "integer index of the highlighted row in the data table, starting from 0" ], [ "seriesName", "name of the highlighted series, only present if highlightSeriesOpts is set." ] ]
    },
    drawHighlightPointCallback: {
        "default": "null",
        labels: [ "Data Line display" ],
        type: "function(g, seriesName, canvasContext, cx, cy, color, pointSize)",
        parameters: [ [ "g", "the reference graph" ], [ "seriesName", "the name of the series" ], [ "canvasContext", "the canvas to draw on" ], [ "cx", "center x coordinate" ], [ "cy", "center y coordinate" ], [ "color", "series color" ], [ "pointSize", "the radius of the image." ], [ "idx", "the row-index of the point in the data." ] ],
        description: "Draw a custom item when a point is highlighted.  Default is a small dot matching the series color. This method should constrain drawing to within pointSize pixels from (cx, cy) Also see <a href='#drawPointCallback'>drawPointCallback</a>"
    },
    highlightSeriesOpts: {
        "default": "null",
        labels: [ "Interactive Elements" ],
        type: "Object",
        description: "When set, the options from this object are applied to the timeseries closest to the mouse pointer for interactive highlighting. See also 'highlightCallback'. Example: highlightSeriesOpts: { strokeWidth: 3 }."
    },
    highlightSeriesBackgroundAlpha: {
        "default": "0.5",
        labels: [ "Interactive Elements" ],
        type: "float",
        description: "Fade the background while highlighting series. 1=fully visible background (disable fading), 0=hiddden background (show highlighted series only)."
    },
    includeZero: {
        "default": "false",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "Usually, dygraphs will use the range of the data plus some padding to set the range of the y-axis. If this option is set, the y-axis will always include zero, typically as the lowest value. This can be used to avoid exaggerating the variance in the data"
    },
    rollPeriod: {
        "default": "1",
        labels: [ "Error Bars", "Rolling Averages" ],
        type: "integer &gt;= 1",
        description: "Number of days over which to average data. Discussed extensively above."
    },
    unhighlightCallback: {
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(event)",
        parameters: [ [ "event", "the mouse event" ] ],
        description: "When set, this callback gets called every time the user stops highlighting any point by mousing out of the graph."
    },
    axisTickSize: {
        "default": "3.0",
        labels: [ "Axis display" ],
        type: "number",
        description: "The size of the line to display next to each tick mark on x- or y-axes."
    },
    labelsSeparateLines: {
        "default": "false",
        labels: [ "Legend" ],
        type: "boolean",
        description: "Put <code>&lt;br/&gt;</code> between lines in the label string. Often used in conjunction with <strong>labelsDiv</strong>."
    },
    xValueFormatter: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "",
        description: "Prefer axes: { x: { valueFormatter } }"
    },
    valueFormatter: {
        "default": "Depends on the type of your data.",
        labels: [ "Legend", "Value display/formatting" ],
        type: "function(num or millis, opts, seriesName, dygraph, row, col)",
        description: "Function to provide a custom display format for the values displayed on mouseover. This does not affect the values that appear on tick marks next to the axes. To format those, see axisLabelFormatter. This is usually set on a <a href='per-axis.html'>per-axis</a> basis. .",
        parameters: [ [ "num_or_millis", "The value to be formatted. This is always a number. For date axes, it's millis since epoch. You can call new Date(millis) to get a Date object." ], [ "opts", "This is a function you can call to access various options (e.g. opts('labelsKMB')). It returns per-axis values for the option when available." ], [ "seriesName", "The name of the series from which the point came, e.g. 'X', 'Y', 'A', etc." ], [ "dygraph", "The dygraph object for which the formatting is being done" ], [ "row", "The row of the data from which this point comes. g.getValue(row, 0) will return the x-value for this point." ], [ "col", "The column of the data from which this point comes. g.getValue(row, col) will return the original y-value for this point. This can be used to get the full confidence interval for the point, or access un-rolled values for the point." ] ]
    },
    pixelsPerYLabel: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "integer",
        description: "Prefer axes: { y: { pixelsPerLabel } }"
    },
    annotationMouseOverHandler: {
        "default": "null",
        labels: [ "Annotations" ],
        type: "function(annotation, point, dygraph, event)",
        description: "If provided, this function is called whenever the user mouses over an annotation."
    },
    annotationMouseOutHandler: {
        "default": "null",
        labels: [ "Annotations" ],
        type: "function(annotation, point, dygraph, event)",
        parameters: [ [ "annotation", "the annotation left" ], [ "point", "the point associated with the annotation" ], [ "dygraph", "the reference graph" ], [ "event", "the mouse event" ] ],
        description: "If provided, this function is called whenever the user mouses out of an annotation."
    },
    annotationClickHandler: {
        "default": "null",
        labels: [ "Annotations" ],
        type: "function(annotation, point, dygraph, event)",
        parameters: [ [ "annotation", "the annotation left" ], [ "point", "the point associated with the annotation" ], [ "dygraph", "the reference graph" ], [ "event", "the mouse event" ] ],
        description: "If provided, this function is called whenever the user clicks on an annotation."
    },
    annotationDblClickHandler: {
        "default": "null",
        labels: [ "Annotations" ],
        type: "function(annotation, point, dygraph, event)",
        parameters: [ [ "annotation", "the annotation left" ], [ "point", "the point associated with the annotation" ], [ "dygraph", "the reference graph" ], [ "event", "the mouse event" ] ],
        description: "If provided, this function is called whenever the user double-clicks on an annotation."
    },
    drawCallback: {
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(dygraph, is_initial)",
        parameters: [ [ "dygraph", "The graph being drawn" ], [ "is_initial", "True if this is the initial draw, false for subsequent draws." ] ],
        description: "When set, this callback gets called every time the dygraph is drawn. This includes the initial draw, after zooming and repeatedly while panning."
    },
    labelsKMG2: {
        "default": "false",
        labels: [ "Value display/formatting" ],
        type: "boolean",
        description: "Show k/M/G for kilo/Mega/Giga on y-axis. This is different than <code>labelsKMB</code> in that it uses base 2, not 10."
    },
    delimiter: {
        "default": ",",
        labels: [ "CSV parsing" ],
        type: "string",
        description: "The delimiter to look for when separating fields of a CSV file. Setting this to a tab is not usually necessary, since tab-delimited data is auto-detected."
    },
    axisLabelFontSize: {
        "default": "14",
        labels: [ "Axis display" ],
        type: "integer",
        description: "Size of the font (in pixels) to use in the axis labels, both x- and y-axis."
    },
    underlayCallback: {
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(context, area, dygraph)",
        parameters: [ [ "context", "the canvas drawing context on which to draw" ], [ "area", "An object with {x,y,w,h} properties describing the drawing area." ], [ "dygraph", "the reference graph" ] ],
        description: "When set, this callback gets called before the chart is drawn. It details on how to use this."
    },
    width: {
        "default": "480",
        labels: [ "Overall display" ],
        type: "integer",
        description: "Width, in pixels, of the chart. If the container div has been explicitly sized, this will be ignored."
    },
    interactionModel: {
        "default": "...",
        labels: [ "Interactive Elements" ],
        type: "Object",
        description: "TODO(konigsberg): document this"
    },
    ticker: {
        "default": "Dygraph.dateTicker or Dygraph.numericTicks",
        labels: [ "Axis display" ],
        type: "function(min, max, pixels, opts, dygraph, vals) -> [{v: ..., label: ...}, ...]",
        parameters: [ [ "min", "" ], [ "max", "" ], [ "pixels", "" ], [ "opts", "" ], [ "dygraph", "the reference graph" ], [ "vals", "" ] ],
        description: "This lets you specify an arbitrary function to generate tick marks on an axis. The tick marks are an array of (value, label) pairs. The built-in functions go to great lengths to choose good tick marks so, if you set this option, you'll most likely want to call one of them and modify the result. See dygraph-tickers.js for an extensive discussion. This is set on a <a href='per-axis.html'>per-axis</a> basis."
    },
    xAxisLabelWidth: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "integer",
        description: "Prefer axes: { x: { axisLabelWidth } }"
    },
    xAxisHeight: {
        "default": "(null)",
        labels: [ "Axis display" ],
        type: "integer",
        description: "Height, in pixels, of the x-axis. If not set explicitly, this is computed based on axisLabelFontSize and axisTickSize."
    },
    showLabelsOnHighlight: {
        "default": "true",
        labels: [ "Interactive Elements", "Legend" ],
        type: "boolean",
        description: "Whether to show the legend upon mouseover."
    },
    axis: {
        "default": "(none)",
        labels: [ "Axis display" ],
        type: "string",
        description: "Set to either 'y1' or 'y2' to assign a series to a y-axis (primary or secondary). Must be set per-series."
    },
    pixelsPerXLabel: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "integer",
        description: "Prefer axes { x: { pixelsPerLabel } }"
    },
    pixelsPerLabel: {
        "default": "70 (x-axis) or 30 (y-axes)",
        labels: [ "Axis display", "Grid" ],
        type: "integer",
        description: "Number of pixels to require between each x- and y-label. Larger values will yield a sparser axis with fewer ticks. This is set on a <a href='per-axis.html'>per-axis</a> basis."
    },
    labelsDiv: {
        "default": "null",
        labels: [ "Legend" ],
        type: "DOM element or string",
        example: "<code style='font-size: small'>document.getElementById('foo')</code>or<code>'foo'",
        description: "Show data labels in an external div, rather than on the graph.  This value can either be a div element or a div id."
    },
    fractions: {
        "default": "false",
        labels: [ "CSV parsing", "Error Bars" ],
        type: "boolean",
        description: 'When set, attempt to parse each cell in the CSV file as "a/b", where a and b are integers. The ratio will be plotted. This allows computation of Wilson confidence intervals (see below).'
    },
    logscale: {
        "default": "false",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "When set for the y-axis or x-axis, the graph shows that axis in log scale. Any values less than or equal to zero are not displayed. Showing log scale with ranges that go below zero will result in an unviewable graph.\n\n Not compatible with showZero. connectSeparatedPoints is ignored. This is ignored for date-based x-axes."
    },
    strokeWidth: {
        "default": "1.0",
        labels: [ "Data Line display" ],
        type: "float",
        example: "0.5, 2.0",
        description: "The width of the lines connecting data points. This can be used to increase the contrast or some graphs."
    },
    strokePattern: {
        "default": "null",
        labels: [ "Data Line display" ],
        type: "array<integer>",
        example: "[10, 2, 5, 2]",
        description: "A custom pattern array where the even index is a draw and odd is a space in pixels. If null then it draws a solid line. The array should have a even length as any odd lengthed array could be expressed as a smaller even length array. This is used to create dashed lines."
    },
    strokeBorderWidth: {
        "default": "null",
        labels: [ "Data Line display" ],
        type: "float",
        example: "1.0",
        description: "Draw a border around graph lines to make crossing lines more easily distinguishable. Useful for graphs with many lines."
    },
    strokeBorderColor: {
        "default": "white",
        labels: [ "Data Line display" ],
        type: "string",
        example: "red, #ccffdd",
        description: "Color for the line border used if strokeBorderWidth is set."
    },
    wilsonInterval: {
        "default": "true",
        labels: [ "Error Bars" ],
        type: "boolean",
        description: 'Use in conjunction with the "fractions" option. Instead of plotting +/- N standard deviations, dygraphs will compute a Wilson confidence interval and plot that. This has more reasonable behavior for ratios close to 0 or 1.'
    },
    fillGraph: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "Should the area underneath the graph be filled? This option is not compatible with error bars. This may be set on a <a href='per-axis.html'>per-series</a> basis."
    },
    highlightCircleSize: {
        "default": "3",
        labels: [ "Interactive Elements" ],
        type: "integer",
        description: "The size in pixels of the dot drawn over highlighted points."
    },
    gridLineColor: {
        "default": "rgb(128,128,128)",
        labels: [ "Grid" ],
        type: "red, blue",
        description: "The color of the gridlines. This may be set on a per-axis basis to define each axis' grid separately."
    },
    gridLinePattern: {
        "default": "null",
        labels: [ "Grid" ],
        type: "array<integer>",
        example: "[10, 2, 5, 2]",
        description: "A custom pattern array where the even index is a draw and odd is a space in pixels. If null then it draws a solid line. The array should have a even length as any odd lengthed array could be expressed as a smaller even length array. This is used to create dashed gridlines."
    },
    visibility: {
        "default": "[true, true, ...]",
        labels: [ "Data Line display" ],
        type: "Array of booleans",
        description: "Which series should initially be visible? Once the Dygraph has been constructed, you can access and modify the visibility of each series using the <code>visibility</code> and <code>setVisibility</code> methods."
    },
    valueRange: {
        "default": "Full range of the input is shown",
        labels: [ "Axis display" ],
        type: "Array of two numbers",
        example: "[10, 110]",
        description: "Explicitly set the vertical range of the graph to [low, high]. This may be set on a per-axis basis to define each y-axis separately. If either limit is unspecified, it will be calculated automatically (e.g. [null, 30] to automatically calculate just the lower bound)"
    },
    labelsDivWidth: {
        "default": "250",
        labels: [ "Legend" ],
        type: "integer",
        description: "Width (in pixels) of the div which shows information on the currently-highlighted points."
    },
    colorSaturation: {
        "default": "1.0",
        labels: [ "Data Series Colors" ],
        type: "float (0.0 - 1.0)",
        description: "If <strong>colors</strong> is not specified, saturation of the automatically-generated data series colors."
    },
    yAxisLabelWidth: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "integer",
        description: "Prefer axes { y: { axisLabelWidth } }"
    },
    hideOverlayOnMouseOut: {
        "default": "true",
        labels: [ "Interactive Elements", "Legend" ],
        type: "boolean",
        description: "Whether to hide the legend when the mouse leaves the chart area."
    },
    yValueFormatter: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "",
        description: "Prefer axes: { y: { valueFormatter } }"
    },
    legend: {
        "default": "onmouseover",
        labels: [ "Legend" ],
        type: "string",
        description: 'When to display the legend. By default, it only appears when a user mouses over the chart. Set it to "always" to always display a legend of some sort. When set to "follow", legend follows highlighted points.'
    },
    labelsShowZeroValues: {
        "default": "true",
        labels: [ "Legend" ],
        type: "boolean",
        description: "Show zero value labels in the labelsDiv."
    },
    stepPlot: {
        "default": "false",
        labels: [ "Data Line display" ],
        type: "boolean",
        description: "When set, display the graph as a step plot instead of a line plot. This option may either be set for the whole graph or for single series."
    },
    labelsUTC: {
        "default": "false",
        labels: [ "Value display/formatting", "Axis display" ],
        type: "boolean",
        description: "Show date/time labels according to UTC (instead of local time)."
    },
    labelsTimezone: {
        "default": "",
        labels: [ "Value display/formatting", "Axis display" ],
        type: "",
        description: "Show date/time labels according to UTC (instead of local time)."
    },
    labelsKMB: {
        "default": "false",
        labels: [ "Value display/formatting" ],
        type: "boolean",
        description: "Show K/M/B for thousands/millions/billions on y-axis."
    },
    rightGap: {
        "default": "5",
        labels: [ "Overall display" ],
        type: "integer",
        description: "Number of pixels to leave blank at the right edge of the Dygraph. This makes it easier to highlight the right-most data point."
    },
    avoidMinZero: {
        "default": "false",
        labels: [ "Deprecated" ],
        type: "boolean",
        description: "Deprecated, please use yRangePad instead. When set, the heuristic that fixes the Y axis at zero for a data set with the minimum Y value of zero is disabled. \nThis is particularly useful for data sets that contain many zero values, especially for step plots which may otherwise have lines not visible running along the bottom axis."
    },
    drawAxesAtZero: {
        "default": "false",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "When set, draw the X axis at the Y=0 position and the Y axis at the X=0 position if those positions are inside the graph's visible area. Otherwise, draw the axes at the bottom or left graph edge as usual."
    },
    xRangePad: {
        "default": "0",
        labels: [ "Axis display" ],
        type: "float",
        description: "Add the specified amount of extra space (in pixels) around the X-axis value range to ensure points at the edges remain visible."
    },
    yRangePad: {
        "default": "null",
        labels: [ "Axis display" ],
        type: "float",
        description: "If set, add the specified amount of extra space (in pixels) around the Y-axis value range to ensure points at the edges remain visible. If unset, use the traditional Y padding algorithm."
    },
    xAxisLabelFormatter: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "",
        description: "Prefer axes { x: { axisLabelFormatter } }"
    },
    axisLabelFormatter: {
        "default": "Depends on the data type",
        labels: [ "Axis display" ],
        type: "function(number or Date, granularity, opts, dygraph)",
        parameters: [ [ "number or date", "Either a number (for a numeric axis) or a Date object (for a date axis)" ], [ "granularity", "specifies how fine-grained the axis is. For date axes, this is a reference to the time granularity enumeration, defined in dygraph-tickers.js, e.g. Dygraph.WEEKLY." ], [ "opts", "a function which provides access to various options on the dygraph, e.g. opts('labelsKMB')." ], [ "dygraph", "the referenced graph" ] ],
        description: "Function to call to format the tick values that appear along an axis. This is usually set on a <a href='per-axis.html'>per-axis</a> basis."
    },
    clickCallback: {
        snippet: "function(e, date_millis){<br>&nbsp;&nbsp;alert(new Date(date_millis));<br>}",
        "default": "null",
        labels: [ "Callbacks" ],
        type: "function(e, x, points)",
        parameters: [ [ "e", "The event object for the click" ], [ "x", "The x value that was clicked (for dates, this is milliseconds since epoch)" ], [ "points", "The closest points along that date. See <a href='#point_properties'>Point properties</a> for details." ] ],
        description: "A function to call when the canvas is clicked."
    },
    yAxisLabelFormatter: {
        "default": "",
        labels: [ "Deprecated" ],
        type: "",
        description: "Prefer axes: { y: { axisLabelFormatter } }"
    },
    labels: {
        "default": '["X", "Y1", "Y2", ...]*',
        labels: [ "Legend" ],
        type: "array<string>",
        description: "A name for each data series, including the independent (X) series. For CSV files and DataTable objections, this is determined by context. For raw data, this must be specified. If it is not, default values are supplied and a warning is logged."
    },
    dateWindow: {
        "default": "Full range of the input is shown",
        labels: [ "Axis display" ],
        type: "Array of two numbers",
        example: "[<br>&nbsp;&nbsp;Date.parse('2006-01-01'),<br>&nbsp;&nbsp;(new Date()).valueOf()<br>]",
        description: "Initially zoom in on a section of the graph. Is of the form [earliest, latest], where earliest/latest are milliseconds since epoch. If the data for the x-axis is numeric, the values in dateWindow must also be numbers."
    },
    showRoller: {
        "default": "false",
        labels: [ "Interactive Elements", "Rolling Averages" ],
        type: "boolean",
        description: "If the rolling average period text box should be shown."
    },
    sigma: {
        "default": "2.0",
        labels: [ "Error Bars" ],
        type: "float",
        description: "When errorBars is set, shade this many standard deviations above/below each point."
    },
    customBars: {
        "default": "false",
        labels: [ "CSV parsing", "Error Bars" ],
        type: "boolean",
        description: 'When set, parse each CSV cell as "low;middle;high". Error bars will be drawn for each point between low and high, with the series itself going through middle.'
    },
    colorValue: {
        "default": "1.0",
        labels: [ "Data Series Colors" ],
        type: "float (0.0 - 1.0)",
        description: "If colors is not specified, value of the data series colors, as in hue/saturation/value. (0.0-1.0, default 0.5)"
    },
    errorBars: {
        "default": "false",
        labels: [ "CSV parsing", "Error Bars" ],
        type: "boolean",
        description: "Does the data contain standard deviations? Setting this to true alters the input format (see above)."
    },
    displayAnnotations: {
        "default": "false",
        labels: [ "Annotations" ],
        type: "boolean",
        description: "Only applies when Dygraphs is used as a GViz chart. Causes string columns following a data series to be interpreted as annotations on points in that series. This is the same format used by Google's AnnotatedTimeLine chart."
    },
    panEdgeFraction: {
        "default": "null",
        labels: [ "Axis display", "Interactive Elements" ],
        type: "float",
        description: "A value representing the farthest a graph may be panned, in percent of the display. For example, a value of 0.1 means that the graph can only be panned 10% pased the edges of the displayed values. null means no bounds."
    },
    title: {
        labels: [ "Chart labels" ],
        type: "string",
        "default": "null",
        description: "Text to display above the chart. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-title' classes."
    },
    titleHeight: {
        "default": "18",
        labels: [ "Chart labels" ],
        type: "integer",
        description: "Height of the chart title, in pixels. This also controls the default font size of the title. If you style the title on your own, this controls how much space is set aside above the chart for the title's div."
    },
    xlabel: {
        labels: [ "Chart labels" ],
        type: "string",
        "default": "null",
        description: "Text to display below the chart's x-axis. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-xlabel' classes."
    },
    xLabelHeight: {
        labels: [ "Chart labels" ],
        type: "integer",
        "default": "18",
        description: "Height of the x-axis label, in pixels. This also controls the default font size of the x-axis label. If you style the label on your own, this controls how much space is set aside below the chart for the x-axis label's div."
    },
    ylabel: {
        labels: [ "Chart labels" ],
        type: "string",
        "default": "null",
        description: "Text to display to the left of the chart's y-axis. You can supply any HTML for this value, not just text. If you wish to style it using CSS, use the 'dygraph-label' or 'dygraph-ylabel' classes. The text will be rotated 90 degrees by default, so CSS rules may behave in unintuitive ways. No additional space is set aside for a y-axis label. If you need more space, increase the width of the y-axis tick labels using the yAxisLabelWidth option. If you need a wider div for the y-axis label, either style it that way with CSS (but remember that it's rotated, so width is controlled by the 'height' property) or set the yLabelWidth option."
    },
    y2label: {
        labels: [ "Chart labels" ],
        type: "string",
        "default": "null",
        description: "Text to display to the right of the chart's secondary y-axis. This label is only displayed if a secondary y-axis is present. See <a href='http://dygraphs.com/tests/two-axes.html'>this test</a> for an example of how to do this. The comments for the 'ylabel' option generally apply here as well. This label gets a 'dygraph-y2label' instead of a 'dygraph-ylabel' class."
    },
    yLabelWidth: {
        labels: [ "Chart labels" ],
        type: "integer",
        "default": "18",
        description: "Width of the div which contains the y-axis label. Since the y-axis label appears rotated 90 degrees, this actually affects the height of its div."
    },
    isZoomedIgnoreProgrammaticZoom: {
        "default": "false",
        labels: [ "Zooming" ],
        type: "boolean",
        description: "When this option is passed to updateOptions() along with either the <code>dateWindow</code> or <code>valueRange</code> options, the zoom flags are not changed to reflect a zoomed state. This is primarily useful for when the display area of a chart is changed programmatically and also where manual zooming is allowed and use is made of the <code>isZoomed</code> method to determine this."
    },
    drawXGrid: {
        "default": "true",
        labels: [ "Grid", "Deprecated" ],
        type: "boolean",
        description: "Use the per-axis option drawGrid instead. Whether to display vertical gridlines under the chart."
    },
    drawYGrid: {
        "default": "true",
        labels: [ "Grid", "Deprecated" ],
        type: "boolean",
        description: "Use the per-axis option drawGrid instead. Whether to display horizontal gridlines under the chart."
    },
    drawGrid: {
        "default": "true for x and y, false for y2",
        labels: [ "Grid" ],
        type: "boolean",
        description: "Whether to display gridlines in the chart. This may be set on a per-axis basis to define the visibility of each axis' grid separately."
    },
    independentTicks: {
        "default": "true for y, false for y2",
        labels: [ "Axis display", "Grid" ],
        type: "boolean",
        description: "Only valid for y and y2, has no effect on x: This option defines whether the y axes should align their ticks or if they should be independent. Possible combinations: 1.) y=true, y2=false (default): y is the primary axis and the y2 ticks are aligned to the the ones of y. (only 1 grid) 2.) y=false, y2=true: y2 is the primary axis and the y ticks are aligned to the the ones of y2. (only 1 grid) 3.) y=true, y2=true: Both axis are independent and have their own ticks. (2 grids) 4.) y=false, y2=false: Invalid configuration causes an error."
    },
    drawXAxis: {
        "default": "true",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "Deprecated. Use axes : { x : { drawAxis } }."
    },
    drawYAxis: {
        "default": "true",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "Deprecated. Use axes : { y : { drawAxis } }."
    },
    drawAxis: {
        "default": "true for x and y, false for y2",
        labels: [ "Axis display" ],
        type: "boolean",
        description: "Whether to draw the specified axis. This may be set on a per-axis basis to define the visibility of each axis separately. Setting this to false also prevents axis ticks from being drawn and reclaims the space for the chart grid/lines."
    },
    gridLineWidth: {
        "default": "0.3",
        labels: [ "Grid" ],
        type: "float",
        description: "Thickness (in pixels) of the gridlines drawn under the chart. The vertical/horizontal gridlines can be turned off entirely by using the drawXGrid and drawYGrid options. This may be set on a per-axis basis to define each axis' grid separately."
    },
    axisLineWidth: {
        "default": "0.3",
        labels: [ "Axis display" ],
        type: "float",
        description: "Thickness (in pixels) of the x- and y-axis lines."
    },
    axisLineColor: {
        "default": "black",
        labels: [ "Axis display" ],
        type: "string",
        description: "Color of the x- and y-axis lines. Accepts any value which the HTML canvas strokeStyle attribute understands, e.g. 'black' or 'rgb(0, 100, 255)'."
    },
    fillAlpha: {
        "default": "0.15",
        labels: [ "Error Bars", "Data Series Colors" ],
        type: "float (0.0 - 1.0)",
        description: "Error bars (or custom bars) for each series are drawn in the same color as the series, but with partial transparency. This sets the transparency. A value of 0.0 means that the error bars will not be drawn, whereas a value of 1.0 means that the error bars will be as dark as the line for the series itself. This can be used to produce chart lines whose thickness varies at each point."
    },
    axisLabelColor: {
        "default": "black",
        labels: [ "Axis display" ],
        type: "string",
        description: "Color for x- and y-axis labels. This is a CSS color string."
    },
    axisLabelWidth: {
        "default": "50 (y-axis), 60 (x-axis)",
        labels: [ "Axis display", "Chart labels" ],
        type: "integer",
        description: "Width (in pixels) of the containing divs for x- and y-axis labels. For the y-axis, this also controls the width of the y-axis. Note that for the x-axis, this is independent from pixelsPerLabel, which controls the spacing between labels."
    },
    sigFigs: {
        "default": "null",
        labels: [ "Value display/formatting" ],
        type: "integer",
        description: "By default, dygraphs displays numbers with a fixed number of digits after the decimal point. If you'd prefer to have a fixed number of significant figures, set this option to that number of sig figs. A value of 2, for instance, would cause 1 to be display as 1.0 and 1234 to be displayed as 1.23e+3."
    },
    digitsAfterDecimal: {
        "default": "2",
        labels: [ "Value display/formatting" ],
        type: "integer",
        description: "Unless it's run in scientific mode (see the <code>sigFigs</code> option), dygraphs displays numbers with <code>digitsAfterDecimal</code> digits after the decimal point. Trailing zeros are not displayed, so with a value of 2 you'll get '0', '0.1', '0.12', '123.45' but not '123.456' (it will be rounded to '123.46'). Numbers with absolute value less than 0.1^digitsAfterDecimal (i.e. those which would show up as '0.00') will be displayed in scientific notation."
    },
    maxNumberWidth: {
        "default": "6",
        labels: [ "Value display/formatting" ],
        type: "integer",
        description: "When displaying numbers in normal (not scientific) mode, large numbers will be displayed with many trailing zeros (e.g. 100000000 instead of 1e9). This can lead to unwieldy y-axis labels. If there are more than <code>maxNumberWidth</code> digits to the left of the decimal in a number, dygraphs will switch to scientific notation, even when not operating in scientific mode. If you'd like to see all those digits, set this to something large, like 20 or 30."
    },
    file: {
        "default": "(set when constructed)",
        labels: [ "Data" ],
        type: "string (URL of CSV or CSV), GViz DataTable or 2D Array",
        description: "Sets the data being displayed in the chart. This can only be set when calling updateOptions; it cannot be set from the constructor. For a full description of valid data formats, see the <a href='http://dygraphs.com/data.html'>Data Formats</a> page."
    },
    timingName: {
        "default": "null",
        labels: [ "Debugging" ],
        type: "string",
        description: "Set this option to log timing information. The value of the option will be logged along with the timimg, so that you can distinguish multiple dygraphs on the same page."
    },
    showRangeSelector: {
        "default": "false",
        labels: [ "Interactive Elements" ],
        type: "boolean",
        description: "Show or hide the range selector widget."
    },
    rangeSelectorHeight: {
        "default": "40",
        labels: [ "Interactive Elements" ],
        type: "integer",
        description: "Height, in pixels, of the range selector widget. This option can only be specified at Dygraph creation time."
    },
    rangeSelectorPlotStrokeColor: {
        "default": "#808FAB",
        labels: [ "Interactive Elements" ],
        type: "string",
        description: 'The range selector mini plot stroke color. This can be of the form "#AABBCC" or "rgb(255,100,200)" or "yellow". You can also specify null or "" to turn off stroke.'
    },
    rangeSelectorPlotFillColor: {
        "default": "#A7B1C4",
        labels: [ "Interactive Elements" ],
        type: "string",
        description: 'The range selector mini plot fill color. This can be of the form "#AABBCC" or "rgb(255,100,200)" or "yellow". You can also specify null or "" to turn off fill.'
    },
    showInRangeSelector: {
        "default": "null",
        labels: [ "Interactive Elements" ],
        type: "boolean",
        description: "Mark this series for inclusion in the range selector. The mini plot curve will be an average of all such series. If this is not specified for any series, the default behavior is to average all the series. Setting it for one series will result in that series being charted alone in the range selector."
    },
    animatedZooms: {
        "default": "false",
        labels: [ "Interactive Elements" ],
        type: "boolean",
        description: "Set this option to animate the transition between zoom windows. Applies to programmatic and interactive zooms. Note that if you also set a drawCallback, it will be called several times on each zoom. If you set a zoomCallback, it will only be called after the animation is complete."
    },
    plotter: {
        "default": "[DygraphCanvasRenderer.Plotters.fillPlotter, DygraphCanvasRenderer.Plotters.errorPlotter, DygraphCanvasRenderer.Plotters.linePlotter]",
        labels: [ "Data Line display" ],
        type: "array or function",
        description: "A function (or array of functions) which plot each data series on the chart. TODO(danvk): more details! May be set per-series."
    },
    axes: {
        "default": "null",
        labels: [ "Configuration" ],
        type: "Object",
        description: "Defines per-axis options. Valid keys are 'x', 'y' and 'y2'. Only some options may be set on a per-axis basis. If an option may be set in this way, it will be noted on this page. See also documentation on <a href='http://dygraphs.com/per-axis.html'>per-series and per-axis options</a>."
    },
    series: {
        "default": "null",
        labels: [ "Series" ],
        type: "Object",
        description: "Defines per-series options. Its keys match the y-axis label names, and the values are dictionaries themselves that contain options specific to that series. When this option is missing, it falls back on the old-style of per-series options comingled with global options."
    },
    group: {
        "default": "null",
        labels: [ "Bar Chart Group" ],
        type: "string",
        description: "Defines per-series stacked bar group"
    },
    plugins: {
        "default": "[]",
        labels: [ "Configuration" ],
        type: "Array<plugin>",
        description: "Defines per-graph plugins. Useful for per-graph customization"
    },
    dataHandler: {
        "default": "(depends on data)",
        labels: [ "Data" ],
        type: "Dygraph.DataHandler",
        description: "Custom DataHandler. This is an advanced customization. See http://bit.ly/151E7Aq."
    }
};

(function() {
    "use strict";
    var warn = function(msg) {
        if (window.console) window.console.warn(msg);
    };
    var flds = [ "type", "default", "description" ];
    var valid_cats = [ "Annotations", "Axis display", "Chart labels", "CSV parsing", "Callbacks", "Data", "Data Line display", "Data Series Colors", "Error Bars", "Grid", "Interactive Elements", "Legend", "Overall display", "Rolling Averages", "Series", "Value display/formatting", "Zooming", "Debugging", "Configuration", "Deprecated", "Bar Chart Group" ];
    var i;
    var cats = {};
    for (i = 0; i < valid_cats.length; i++) cats[valid_cats[i]] = true;
    for (var k in Dygraph.OPTIONS_REFERENCE) {
        if (!Dygraph.OPTIONS_REFERENCE.hasOwnProperty(k)) continue;
        var op = Dygraph.OPTIONS_REFERENCE[k];
        for (i = 0; i < flds.length; i++) {
            if (!op.hasOwnProperty(flds[i])) {
                warn("Option " + k + ' missing "' + flds[i] + '" property');
            } else if (typeof op[flds[i]] != "string") {
                warn(k + "." + flds[i] + " must be of type string");
            }
        }
        var labels = op.labels;
        if (typeof labels !== "object") {
            warn('Option "' + k + '" is missing a "labels": [...] option');
        } else {
            for (i = 0; i < labels.length; i++) {
                if (!cats.hasOwnProperty(labels[i])) {
                    warn('Option "' + k + '" has label "' + labels[i] + '", which is invalid.');
                }
            }
        }
    }
})();

Dygraph.DataHandler = function() {};

Dygraph.DataHandlers = {};

(function() {
    "use strict";
    var handler = Dygraph.DataHandler;
    handler.X = 0;
    handler.Y = 1;
    handler.EXTRAS = 2;
    handler.prototype.extractSeries = function(rawData, seriesIndex, options) {};
    handler.prototype.seriesToPoints = function(series, setName, boundaryIdStart) {
        var points = [];
        for (var i = 0; i < series.length; ++i) {
            var item = series[i];
            var yraw = item[1];
            var yval = yraw === null ? null : handler.parseFloat(yraw);
            var point = {
                x: NaN,
                y: NaN,
                xval: handler.parseFloat(item[0]),
                yval: yval,
                name: setName,
                idx: i + boundaryIdStart
            };
            points.push(point);
        }
        this.onPointsCreated_(series, points);
        return points;
    };
    handler.prototype.onPointsCreated_ = function(series, points) {};
    handler.prototype.rollingAverage = function(series, rollPeriod, options) {};
    handler.prototype.getExtremeYValues = function(series, dateWindow, options) {};
    handler.prototype.onLineEvaluated = function(points, axis, logscale) {};
    handler.prototype.computeYInterpolation_ = function(p1, p2, xValue) {
        var deltaY = p2[1] - p1[1];
        var deltaX = p2[0] - p1[0];
        var gradient = deltaY / deltaX;
        var growth = (xValue - p1[0]) * gradient;
        return p1[1] + growth;
    };
    handler.prototype.getIndexesInWindow_ = function(series, dateWindow) {
        var firstIdx = 0, lastIdx = series.length - 1;
        if (dateWindow) {
            var idx = 0;
            var low = dateWindow[0];
            var high = dateWindow[1];
            while (idx < series.length - 1 && series[idx][0] < low) {
                firstIdx++;
                idx++;
            }
            idx = series.length - 1;
            while (idx > 0 && series[idx][0] > high) {
                lastIdx--;
                idx--;
            }
        }
        if (firstIdx <= lastIdx) {
            return [ firstIdx, lastIdx ];
        } else {
            return [ 0, series.length - 1 ];
        }
    };
    handler.parseFloat = function(val) {
        if (val === null) {
            return NaN;
        }
        return val;
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.DefaultHandler = function() {};
    var DefaultHandler = Dygraph.DataHandlers.DefaultHandler;
    DefaultHandler.prototype = new Dygraph.DataHandler();
    DefaultHandler.prototype.extractSeries = function(rawData, i, options) {
        var series = [];
        var logScale = options.get("logscale");
        for (var j = 0; j < rawData.length; j++) {
            var x = rawData[j][0];
            var point = rawData[j][i];
            if (logScale) {
                if (point <= 0) {
                    point = null;
                }
            }
            series.push([ x, point ]);
        }
        return series;
    };
    DefaultHandler.prototype.rollingAverage = function(originalData, rollPeriod, options) {
        rollPeriod = Math.min(rollPeriod, originalData.length);
        var rollingData = [];
        var i, j, y, sum, num_ok;
        if (rollPeriod == 1) {
            return originalData;
        }
        for (i = 0; i < originalData.length; i++) {
            sum = 0;
            num_ok = 0;
            for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
                y = originalData[j][1];
                if (y === null || isNaN(y)) continue;
                num_ok++;
                sum += originalData[j][1];
            }
            if (num_ok) {
                rollingData[i] = [ originalData[i][0], sum / num_ok ];
            } else {
                rollingData[i] = [ originalData[i][0], null ];
            }
        }
        return rollingData;
    };
    DefaultHandler.prototype.getExtremeYValues = function(series, dateWindow, options) {
        var minY = null, maxY = null, y;
        var firstIdx = 0, lastIdx = series.length - 1;
        for (var j = firstIdx; j <= lastIdx; j++) {
            y = series[j][1];
            if (y === null || isNaN(y)) continue;
            if (maxY === null || y > maxY) {
                maxY = y;
            }
            if (minY === null || y < minY) {
                minY = y;
            }
        }
        return [ minY, maxY ];
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.DefaultFractionHandler = function() {};
    var DefaultFractionHandler = Dygraph.DataHandlers.DefaultFractionHandler;
    DefaultFractionHandler.prototype = new Dygraph.DataHandlers.DefaultHandler();
    DefaultFractionHandler.prototype.extractSeries = function(rawData, i, options) {
        var series = [];
        var x, y, point, num, den, value;
        var mult = 100;
        var logScale = options.get("logscale");
        for (var j = 0; j < rawData.length; j++) {
            x = rawData[j][0];
            point = rawData[j][i];
            if (logScale && point !== null) {
                if (point[0] <= 0 || point[1] <= 0) {
                    point = null;
                }
            }
            if (point !== null) {
                num = point[0];
                den = point[1];
                if (num !== null && !isNaN(num)) {
                    value = den ? num / den : 0;
                    y = mult * value;
                    series.push([ x, y, [ num, den ] ]);
                } else {
                    series.push([ x, num, [ num, den ] ]);
                }
            } else {
                series.push([ x, null, [ null, null ] ]);
            }
        }
        return series;
    };
    DefaultFractionHandler.prototype.rollingAverage = function(originalData, rollPeriod, options) {
        rollPeriod = Math.min(rollPeriod, originalData.length);
        var rollingData = [];
        var i;
        var num = 0;
        var den = 0;
        var mult = 100;
        for (i = 0; i < originalData.length; i++) {
            num += originalData[i][2][0];
            den += originalData[i][2][1];
            if (i - rollPeriod >= 0) {
                num -= originalData[i - rollPeriod][2][0];
                den -= originalData[i - rollPeriod][2][1];
            }
            var date = originalData[i][0];
            var value = den ? num / den : 0;
            rollingData[i] = [ date, mult * value ];
        }
        return rollingData;
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.BarsHandler = function() {
        Dygraph.DataHandler.call(this);
    };
    Dygraph.DataHandlers.BarsHandler.prototype = new Dygraph.DataHandler();
    var BarsHandler = Dygraph.DataHandlers.BarsHandler;
    BarsHandler.prototype.extractSeries = function(rawData, seriesIndex, options) {};
    BarsHandler.prototype.rollingAverage = function(series, rollPeriod, options) {};
    BarsHandler.prototype.onPointsCreated_ = function(series, points) {
        for (var i = 0; i < series.length; ++i) {
            var item = series[i];
            var point = points[i];
            point.y_top = NaN;
            point.y_bottom = NaN;
            point.yval_minus = Dygraph.DataHandler.parseFloat(item[2][0]);
            point.yval_plus = Dygraph.DataHandler.parseFloat(item[2][1]);
        }
    };
    BarsHandler.prototype.getExtremeYValues = function(series, dateWindow, options) {
        var minY = null, maxY = null, y;
        var firstIdx = 0;
        var lastIdx = series.length - 1;
        for (var j = firstIdx; j <= lastIdx; j++) {
            y = series[j][1];
            if (y === null || isNaN(y)) continue;
            var low = series[j][2][0];
            var high = series[j][2][1];
            if (low > y) low = y;
            if (high < y) high = y;
            if (maxY === null || high > maxY) maxY = high;
            if (minY === null || low < minY) minY = low;
        }
        return [ minY, maxY ];
    };
    BarsHandler.prototype.onLineEvaluated = function(points, axis, logscale) {
        var point;
        for (var j = 0; j < points.length; j++) {
            point = points[j];
            point.y_top = DygraphLayout.calcYNormal_(axis, point.yval_minus, logscale);
            point.y_bottom = DygraphLayout.calcYNormal_(axis, point.yval_plus, logscale);
        }
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.CustomBarsHandler = function() {};
    var CustomBarsHandler = Dygraph.DataHandlers.CustomBarsHandler;
    CustomBarsHandler.prototype = new Dygraph.DataHandlers.BarsHandler();
    CustomBarsHandler.prototype.extractSeries = function(rawData, i, options) {
        var series = [];
        var x, y, point;
        var logScale = options.get("logscale");
        for (var j = 0; j < rawData.length; j++) {
            x = rawData[j][0];
            point = rawData[j][i];
            if (logScale && point !== null) {
                if (point[0] <= 0 || point[1] <= 0 || point[2] <= 0) {
                    point = null;
                }
            }
            if (point !== null) {
                y = point[1];
                if (y !== null && !isNaN(y)) {
                    series.push([ x, y, [ point[0], point[2] ] ]);
                } else {
                    series.push([ x, y, [ y, y ] ]);
                }
            } else {
                series.push([ x, null, [ null, null ] ]);
            }
        }
        return series;
    };
    CustomBarsHandler.prototype.rollingAverage = function(originalData, rollPeriod, options) {
        rollPeriod = Math.min(rollPeriod, originalData.length);
        var rollingData = [];
        var y, low, high, mid, count, i, extremes;
        low = 0;
        mid = 0;
        high = 0;
        count = 0;
        for (i = 0; i < originalData.length; i++) {
            y = originalData[i][1];
            extremes = originalData[i][2];
            rollingData[i] = originalData[i];
            if (y !== null && !isNaN(y)) {
                low += extremes[0];
                mid += y;
                high += extremes[1];
                count += 1;
            }
            if (i - rollPeriod >= 0) {
                var prev = originalData[i - rollPeriod];
                if (prev[1] !== null && !isNaN(prev[1])) {
                    low -= prev[2][0];
                    mid -= prev[1];
                    high -= prev[2][1];
                    count -= 1;
                }
            }
            if (count) {
                rollingData[i] = [ originalData[i][0], 1 * mid / count, [ 1 * low / count, 1 * high / count ] ];
            } else {
                rollingData[i] = [ originalData[i][0], null, [ null, null ] ];
            }
        }
        return rollingData;
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.ErrorBarsHandler = function() {};
    var ErrorBarsHandler = Dygraph.DataHandlers.ErrorBarsHandler;
    ErrorBarsHandler.prototype = new Dygraph.DataHandlers.BarsHandler();
    ErrorBarsHandler.prototype.extractSeries = function(rawData, i, options) {
        var series = [];
        var x, y, variance, point;
        var sigma = options.get("sigma");
        var logScale = options.get("logscale");
        for (var j = 0; j < rawData.length; j++) {
            x = rawData[j][0];
            point = rawData[j][i];
            if (logScale && point !== null) {
                if (point[0] <= 0 || point[0] - sigma * point[1] <= 0) {
                    point = null;
                }
            }
            if (point !== null) {
                y = point[0];
                if (y !== null && !isNaN(y)) {
                    variance = sigma * point[1];
                    series.push([ x, y, [ y - variance, y + variance, point[1] ] ]);
                } else {
                    series.push([ x, y, [ y, y, y ] ]);
                }
            } else {
                series.push([ x, null, [ null, null, null ] ]);
            }
        }
        return series;
    };
    ErrorBarsHandler.prototype.rollingAverage = function(originalData, rollPeriod, options) {
        rollPeriod = Math.min(rollPeriod, originalData.length);
        var rollingData = [];
        var sigma = options.get("sigma");
        var i, j, y, v, sum, num_ok, stddev, variance, value;
        for (i = 0; i < originalData.length; i++) {
            sum = 0;
            variance = 0;
            num_ok = 0;
            for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
                y = originalData[j][1];
                if (y === null || isNaN(y)) continue;
                num_ok++;
                sum += y;
                variance += Math.pow(originalData[j][2][2], 2);
            }
            if (num_ok) {
                stddev = Math.sqrt(variance) / num_ok;
                value = sum / num_ok;
                rollingData[i] = [ originalData[i][0], value, [ value - sigma * stddev, value + sigma * stddev ] ];
            } else {
                v = rollPeriod == 1 ? originalData[i][1] : null;
                rollingData[i] = [ originalData[i][0], v, [ v, v ] ];
            }
        }
        return rollingData;
    };
})();

(function() {
    "use strict";
    Dygraph.DataHandlers.FractionsBarsHandler = function() {};
    var FractionsBarsHandler = Dygraph.DataHandlers.FractionsBarsHandler;
    FractionsBarsHandler.prototype = new Dygraph.DataHandlers.BarsHandler();
    FractionsBarsHandler.prototype.extractSeries = function(rawData, i, options) {
        var series = [];
        var x, y, point, num, den, value, stddev, variance;
        var mult = 100;
        var sigma = options.get("sigma");
        var logScale = options.get("logscale");
        for (var j = 0; j < rawData.length; j++) {
            x = rawData[j][0];
            point = rawData[j][i];
            if (logScale && point !== null) {
                if (point[0] <= 0 || point[1] <= 0) {
                    point = null;
                }
            }
            if (point !== null) {
                num = point[0];
                den = point[1];
                if (num !== null && !isNaN(num)) {
                    value = den ? num / den : 0;
                    stddev = den ? sigma * Math.sqrt(value * (1 - value) / den) : 1;
                    variance = mult * stddev;
                    y = mult * value;
                    series.push([ x, y, [ y - variance, y + variance, num, den ] ]);
                } else {
                    series.push([ x, num, [ num, num, num, den ] ]);
                }
            } else {
                series.push([ x, null, [ null, null, null, null ] ]);
            }
        }
        return series;
    };
    FractionsBarsHandler.prototype.rollingAverage = function(originalData, rollPeriod, options) {
        rollPeriod = Math.min(rollPeriod, originalData.length);
        var rollingData = [];
        var sigma = options.get("sigma");
        var wilsonInterval = options.get("wilsonInterval");
        var low, high, i, stddev;
        var num = 0;
        var den = 0;
        var mult = 100;
        for (i = 0; i < originalData.length; i++) {
            num += originalData[i][2][2];
            den += originalData[i][2][3];
            if (i - rollPeriod >= 0) {
                num -= originalData[i - rollPeriod][2][2];
                den -= originalData[i - rollPeriod][2][3];
            }
            var date = originalData[i][0];
            var value = den ? num / den : 0;
            if (wilsonInterval) {
                if (den) {
                    var p = value < 0 ? 0 : value, n = den;
                    var pm = sigma * Math.sqrt(p * (1 - p) / n + sigma * sigma / (4 * n * n));
                    var denom = 1 + sigma * sigma / den;
                    low = (p + sigma * sigma / (2 * den) - pm) / denom;
                    high = (p + sigma * sigma / (2 * den) + pm) / denom;
                    rollingData[i] = [ date, p * mult, [ low * mult, high * mult ] ];
                } else {
                    rollingData[i] = [ date, 0, [ 0, 0 ] ];
                }
            } else {
                stddev = den ? sigma * Math.sqrt(value * (1 - value) / den) : 1;
                rollingData[i] = [ date, mult * value, [ mult * (value - stddev), mult * (value + stddev) ] ];
            }
        }
        return rollingData;
    };
})();
Dygraph.Plugins.HideLines = function() {
    "use strict";
    var hideLines = function(opt_options) {
        this.visibility = [];
        this.opt_options = opt_options || {};
    };
    hideLines.prototype.toString = function() {
        return "Hide Lines Plugin";
    };
    hideLines.prototype.activate = function(g) {};
    return hideLines;
}();
Dygraph.Plugins.RectSelection = function() {
    "use strict";
    var rectSelection = function(opt_options) {
        this.canvas_ = document.createElement("canvas");
        this.opt_options = opt_options || {};
    };
    rectSelection.prototype.enable = function() {
        this.canvas_.setAttribute("style", "position: absolute;z-index:99;");
    };
    rectSelection.prototype.disable = function() {
        this.ctx.clearRect(0, 0, this.graph.graphDiv.clientWidth, this.graph.graphDiv.clientHeight);
        this.canvas_.setAttribute("style", "position: absolute;pointer-events:none;");
    };
    rectSelection.prototype.toString = function() {
        return "Rect Selection Plugin";
    };
    rectSelection.prototype.activate = function(g) {
        var graph = this.graph = g;
        var opts = this.opt_options;
        this.canvas_.width = g.graphDiv.clientWidth;
        this.canvas_.height = g.graphDiv.clientHeight;
        this.canvas_.style.width = g.graphDiv.clientWidth + "px";
        this.canvas_.style.height = g.graphDiv.clientHeight + "px";
        this.canvas_.setAttribute("style", "position: absolute;pointer-events:none;z-index:99;");
        g.graphDiv.appendChild(this.canvas_);
        var canDraw_ = false;
        var mousePosition = {
            x: 0,
            y: 0,
            startX: 0,
            startY: 0
        };
        var ctx = this.ctx = this.ctx = this.canvas_.getContext("2d");
        this.canvas_.addEventListener("mousedown", function(e) {
            canDraw_ = true;
            mousePosition.x = e.offsetX;
            mousePosition.y = e.offsetY;
            mousePosition.startX = mousePosition.x;
            mousePosition.startY = mousePosition.y;
            this.style.cursor = "crosshair";
            var width = graph.width_;
            var height = graph.height_;
            ctx.clearRect(0, 0, width, height);
        });
        this.canvas_.addEventListener("mousemove", function(e) {
            if (canDraw_) {
                mousePosition.x = e.offsetX;
                mousePosition.y = e.offsetY;
                var width = graph.width_;
                var height = graph.height_;
                ctx.strokeStyle = "#FF0000";
                ctx.clearRect(0, 0, width, height);
                ctx.strokeRect(mousePosition.startX, mousePosition.startY, mousePosition.x - mousePosition.startX, mousePosition.y - mousePosition.startY);
            }
        });
        this.canvas_.addEventListener("mouseup", function(e) {
            canDraw_ = false;
            var width = graph.width_;
            var height = graph.height_;
            ctx.clearRect(0, 0, width, height);
            this.style.cursor = "default";
            var rect = mousePosition;
            var startX = rect.startX <= rect.x ? rect.startX : rect.x;
            var endX = rect.startX > rect.x ? rect.startX : rect.x;
            var startY = rect.startY <= rect.y ? rect.startY : rect.y;
            var endY = rect.startY > rect.y ? rect.startY : rect.y;
            var minDate = graph.toDataXCoord(startX);
            var maxDate = graph.toDataXCoord(endX);
            var maxY = graph.toDataYCoord(startY);
            var minY = graph.toDataYCoord(endY);
            console.info("[" + new Date(minDate) + "," + new Date(maxDate) + "]", "[" + minY + "," + maxY + "]");
            var _graphData = graph.file_;
            var _series = graph.getLabels();
            var choosedSeries = [];
            var visibility = graph.getOption("visibility");
            _graphData.forEach(function(point) {
                if (point[0] instanceof Date && point[0] >= minDate && point[0] <= maxDate) {
                    for (var i = 1; i < point.length - 1; i++) {
                        if (point[i] >= minY && point[i] <= maxY && choosedSeries.indexOf(_series[i]) == -1) {
                            if (visibility[i - 1]) {
                                choosedSeries.push(_series[i]);
                            }
                        }
                    }
                }
            });
            if (opts && opts.highlight) {
                opts.highlight(choosedSeries);
            }
        });
        return {};
    };
    rectSelection.prototype.clear = function(e) {
        var ctx = this.canvas_.getContext("2d");
        ctx.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    };
    rectSelection.prototype.destroy = function() {
        this.canvas_ = null;
    };
    return rectSelection;
}();
Dygraph.Export = {};

Dygraph.Export.DEFAULT_ATTRS = {
    backgroundColor: "white",
    titleFont: "bold 18px serif",
    titleFontColor: "black",
    axisLabelFont: "bold 14px serif",
    axisLabelFontColor: "black",
    labelFont: "normal 12px serif",
    labelFontColor: "black",
    legendFont: "bold 12px serif",
    legendFontColor: "black",
    vLabelLeft: 20,
    legendHeight: 20,
    legendMargin: 20,
    lineHeight: 30,
    maxlabelsWidth: 0,
    labelTopMargin: 35,
    magicNumbertop: 8
};

Dygraph.Export.isSupported = function() {
    "use strict";
    try {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        return !!canvas.toDataURL && !!context.fillText;
    } catch (e) {}
    return false;
};

Dygraph.Export.asPNG = function(dygraph, img, userOptions) {
    "use strict";
    var canvas = Dygraph.Export.asCanvas(dygraph, userOptions);
    img.src = canvas.toDataURL();
};

Dygraph.Export.asPNGStr = function(dygraph, userOptions) {
    "use strict";
    var canvas = Dygraph.Export.asCanvasWithoutLegend(dygraph, userOptions);
    return canvas.toDataURL();
};

Dygraph.Export.asCanvas = function(dygraph, userOptions) {
    "use strict";
    var options = {}, canvas = Dygraph.createCanvas();
    Dygraph.update(options, Dygraph.Export.DEFAULT_ATTRS);
    Dygraph.update(options, userOptions);
    canvas.width = dygraph.width_;
    canvas.height = dygraph.height_ + options.legendHeight;
    Dygraph.Export.drawPlot(canvas, dygraph, options);
    Dygraph.Export.drawLegend(canvas, dygraph, options);
    return canvas;
};

Dygraph.Export.asCanvasWithoutLegend = function(dygraph, userOptions) {
    "use strict";
    var options = {}, canvas = Dygraph.createCanvas();
    Dygraph.update(options, Dygraph.Export.DEFAULT_ATTRS);
    Dygraph.update(options, userOptions);
    canvas.width = dygraph.width_;
    canvas.height = dygraph.height_;
    Dygraph.Export.drawPlot(canvas, dygraph, options);
    return canvas;
};

Dygraph.Export.drawPlot = function(canvas, dygraph, options) {
    "use strict";
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var plotCanvas = dygraph.hidden_;
    var i = 0;
    ctx.drawImage(plotCanvas, 0, 0, canvas.width, canvas.height);
    var axesPluginDict = Dygraph.Export.getPlugin(dygraph, "Axes Plugin");
    if (axesPluginDict) {
        var axesPlugin = axesPluginDict.plugin;
        for (i = 0; i < axesPlugin.ylabels_.length; i++) {
            Dygraph.Export.putLabel(ctx, axesPlugin.ylabels_[i], options, options.labelFont, options.labelFontColor);
        }
        for (i = 0; i < axesPlugin.xlabels_.length; i++) {
            Dygraph.Export.putLabel(ctx, axesPlugin.xlabels_[i], options, options.labelFont, options.labelFontColor);
        }
    }
    var labelsPluginDict = Dygraph.Export.getPlugin(dygraph, "ChartLabels Plugin");
    if (labelsPluginDict) {
        var labelsPlugin = labelsPluginDict.plugin;
        Dygraph.Export.putLabel(ctx, labelsPlugin.title_div_, options, options.titleFont, options.titleFontColor);
        Dygraph.Export.putLabel(ctx, labelsPlugin.xlabel_div_, options, options.axisLabelFont, options.axisLabelFontColor);
        Dygraph.Export.putVerticalLabelY1(ctx, labelsPlugin.ylabel_div_, options, options.axisLabelFont, options.axisLabelFontColor, "center");
        Dygraph.Export.putVerticalLabelY2(ctx, labelsPlugin.y2label_div_, options, options.axisLabelFont, options.axisLabelFontColor, "center");
    }
    for (i = 0; i < dygraph.layout_.annotations.length; i++) {
        Dygraph.Export.putLabelAnn(ctx, dygraph.layout_.annotations[i], options, options.labelFont, options.labelColor);
    }
};

Dygraph.Export.putLabel = function(ctx, divLabel, options, font, color) {
    "use strict";
    if (!divLabel || !divLabel.style) {
        return;
    }
    var top = parseInt(divLabel.style.top, 10);
    var left = parseInt(divLabel.style.left, 10);
    if (!divLabel.style.top.length) {
        var bottom = parseInt(divLabel.style.bottom, 10);
        var height = parseInt(divLabel.style.height, 10);
        top = ctx.canvas.height - options.legendHeight - bottom - height;
    }
    top = top + options.magicNumbertop;
    var width = parseInt(divLabel.style.width, 10);
    switch (divLabel.style.textAlign) {
      case "center":
        left = left + Math.ceil(width / 2);
        break;

      case "right":
        left = left + width;
        break;
    }
    Dygraph.Export.putText(ctx, left, top, divLabel, font, color);
};

Dygraph.Export.putVerticalLabelY1 = function(ctx, divLabel, options, font, color, textAlign) {
    "use strict";
    if (!divLabel) {
        return;
    }
    var top = parseInt(divLabel.style.top, 10);
    var left = parseInt(divLabel.style.left, 10) + parseInt(divLabel.style.width, 10) / 2;
    var text = divLabel.innerText || divLabel.textContent;
    if (!left) left = options.vLabelLeft;
    if (textAlign == "center") {
        var textDim = ctx.measureText(text);
        top = Math.ceil((ctx.canvas.height - textDim.width) / 2 + textDim.width);
    }
    ctx.save();
    ctx.translate(0, ctx.canvas.height);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.fillText(text, top, left);
    ctx.restore();
};

Dygraph.Export.putVerticalLabelY2 = function(ctx, divLabel, options, font, color, textAlign) {
    "use strict";
    if (!divLabel) {
        return;
    }
    var top = parseInt(divLabel.style.top, 10);
    var right = parseInt(divLabel.style.right, 10) + parseInt(divLabel.style.width, 10) * 2;
    var text = divLabel.innerText || divLabel.textContent;
    if (textAlign == "center") {
        top = Math.ceil(ctx.canvas.height / 2);
    }
    ctx.save();
    ctx.translate(parseInt(divLabel.style.width, 10), 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.fillText(text, top, right - ctx.canvas.width);
    ctx.restore();
};

Dygraph.Export.putText = function(ctx, left, top, divLabel, font, color) {
    "use strict";
    var textAlign = divLabel.style.textAlign || "left";
    var text = divLabel.innerText || divLabel.textContent;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    ctx.fillText(text, left, top);
};

Dygraph.Export.drawLegend = function(canvas, dygraph, options) {
    "use strict";
    var ctx = canvas.getContext("2d");
    var labelTopMargin = 10;
    var labelMargin = 5;
    var colors = dygraph.getColors();
    var labels = dygraph.attr_("labels").slice(1);
    var labelsWidth = 0;
    var i;
    for (i = 0; i < labels.length; i++) {
        labelsWidth = labelsWidth + ctx.measureText("- " + labels[i]).width + labelMargin;
    }
    var labelsX = Math.floor((canvas.width - labelsWidth) / 2);
    var labelsY = canvas.height - options.legendHeight + labelTopMargin;
    var labelVisibility = dygraph.attr_("visibility");
    ctx.font = options.legendFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    var usedColorCount = 0;
    for (i = 0; i < labels.length; i++) {
        if (labelVisibility[i]) {
            var txt = "- " + labels[i];
            ctx.fillStyle = colors[usedColorCount];
            usedColorCount++;
            ctx.fillText(txt, labelsX, labelsY);
            labelsX = labelsX + ctx.measureText(txt).width + labelMargin;
        }
    }
};

Dygraph.Export.getPlugin = function(dygraph, name) {
    for (i = 0; i < dygraph.plugins_.length; i++) {
        if (dygraph.plugins_[i].plugin.toString() == name) {
            return dygraph.plugins_[i];
        }
    }
    return null;
};
(function() {
    "use strict";
    var Dygraph;
    if (window.Dygraph) {
        Dygraph = window.Dygraph;
    } else if (typeof module !== "undefined") {
        Dygraph = require("../dygraph");
    }
    var synchronize = function() {
        var arguments$1 = arguments;

        if (arguments.length === 0) {
            throw "Invalid invocation of Dygraph.synchronize(). Need >= 1 argument.";
        }
        var OPTIONS = [ "selection", "zoom", "range" ];
        var opts = {
            selection: true,
            zoom: true,
            range: true
        };
        var dygraphs = [];
        var prevCallbacks = [];
        var parseOpts = function(obj) {
            if (!(obj instanceof Object)) {
                throw "Last argument must be either Dygraph or Object.";
            } else {
                for (var i = 0; i < OPTIONS.length; i++) {
                    var optName = OPTIONS[i];
                    if (obj.hasOwnProperty(optName)) opts[optName] = obj[optName];
                }
            }
        };
        if (arguments[0] instanceof Dygraph) {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments$1[i] instanceof Dygraph) {
                    dygraphs.push(arguments$1[i]);
                } else {
                    break;
                }
            }
            if (i < arguments.length - 1) {
                throw "Invalid invocation of Dygraph.synchronize(). " + "All but the last argument must be Dygraph objects.";
            } else if (i == arguments.length - 1) {
                parseOpts(arguments[arguments.length - 1]);
            }
        } else if (arguments[0].length) {
            for (var i = 0; i < arguments[0].length; i++) {
                dygraphs.push(arguments$1[0][i]);
            }
            if (arguments.length == 2) {
                parseOpts(arguments[1]);
            } else if (arguments.length > 2) {
                throw "Invalid invocation of Dygraph.synchronize(). " + "Expected two arguments: array and optional options argument.";
            }
        } else {
            throw "Invalid invocation of Dygraph.synchronize(). " + "First parameter must be either Dygraph or list of Dygraphs.";
        }
        if (dygraphs.length < 2) {
            throw "Invalid invocation of Dygraph.synchronize(). " + "Need two or more dygraphs to synchronize.";
        }
        var readycount = dygraphs.length;
        for (var i = 0; i < dygraphs.length; i++) {
            var g = dygraphs[i];
            g.ready(function() {
                if (--readycount == 0) {
                    var callBackTypes = [ "drawCallback", "highlightCallback", "unhighlightCallback" ];
                    for (var j = 0; j < dygraphs.length; j++) {
                        if (!prevCallbacks[j]) {
                            prevCallbacks[j] = {};
                        }
                        for (var k = callBackTypes.length - 1; k >= 0; k--) {
                            prevCallbacks[j][callBackTypes[k]] = dygraphs[j].getFunctionOption(callBackTypes[k]);
                        }
                    }
                    if (opts.zoom) {
                        attachZoomHandlers(dygraphs, opts, prevCallbacks);
                    }
                    if (opts.selection) {
                        attachSelectionHandlers(dygraphs, prevCallbacks);
                    }
                }
            });
        }
        return {
            detach: function() {
                for (var i = 0; i < dygraphs.length; i++) {
                    var g = dygraphs[i];
                    if (opts.zoom) {
                        g.updateOptions({
                            drawCallback: prevCallbacks[i].drawCallback
                        });
                    }
                    if (opts.selection) {
                        g.updateOptions({
                            highlightCallback: prevCallbacks[i].highlightCallback,
                            unhighlightCallback: prevCallbacks[i].unhighlightCallback
                        });
                    }
                }
                dygraphs = null;
                opts = null;
                prevCallbacks = null;
            }
        };
    };
    function attachZoomHandlers(gs, syncOpts, prevCallbacks) {
        var block = false;
        for (var i = 0; i < gs.length; i++) {
            var g = gs[i];
            g.updateOptions({
                drawCallback: function(me, initial) {
                    var arguments$1 = arguments;
                    var this$1 = this;

                    if (block || initial) return;
                    block = true;
                    var opts = {
                        dateWindow: me.xAxisRange()
                    };
                    if (syncOpts.range) opts.valueRange = me.yAxisRange();
                    for (var j = 0; j < gs.length; j++) {
                        if (gs[j] == me) {
                            if (prevCallbacks[j] && prevCallbacks[j].drawCallback) {
                                prevCallbacks[j].drawCallback.apply(this$1, arguments$1);
                            }
                            continue;
                        }
                        if (gs[j].id && gs[j].hasOwnProperty("hideLines") && gs[j]["hideLines"]) {
                            var _tempVisibility = gs[j].getOption("visibility");
                            for (var k = 0; k < _tempVisibility.length; k++) {
                                _tempVisibility[k] = false;
                            }
                        }
                        gs[j].updateOptions(opts);
                    }
                    block = false;
                }
            }, true);
        }
    }
    function attachSelectionHandlers(gs, prevCallbacks) {
        var block = false;
        for (var i = 0; i < gs.length; i++) {
            var g = gs[i];
            g.updateOptions({
                highlightCallback: function(event, x, points, row, seriesName) {
                    var arguments$1 = arguments;
                    var this$1 = this;

                    if (block) return;
                    block = true;
                    var me = this;
                    for (var i = 0; i < gs.length; i++) {
                        if (me == gs[i]) {
                            if (prevCallbacks[i] && prevCallbacks[i].highlightCallback) {
                                prevCallbacks[i].highlightCallback.apply(this$1, arguments$1);
                            }
                            continue;
                        }
                        var idx = gs[i].getRowForX(x);
                        if (idx !== null) {
                            gs[i].setSelection(idx, seriesName);
                        }
                    }
                    block = false;
                },
                unhighlightCallback: function(event) {
                    var arguments$1 = arguments;
                    var this$1 = this;

                    if (block) return;
                    block = true;
                    var me = this;
                    for (var i = 0; i < gs.length; i++) {
                        if (me == gs[i]) {
                            if (prevCallbacks[i] && prevCallbacks[i].unhighlightCallback) {
                                prevCallbacks[i].unhighlightCallback.apply(this$1, arguments$1);
                            }
                            continue;
                        }
                        gs[i].clearSelection();
                    }
                    block = false;
                }
            }, true);
        }
    }
    Dygraph.synchronize = synchronize;
})();
(function(root, factory) {
    "use strict";
    if (typeof module !== "undefined" && module.exports) {
        var ng = typeof angular === "undefined" ? require("angular") : angular;
        var jq = typeof jquery === "undefined" ? require("jquery") : jquery;
        factory(ng, jq);
        module.exports = "fgp.kit.queryBuilder";
    } else if (typeof define === "function" && define.amd) {
        define([ "angular", "jquery" ], factory);
    } else {
        factory(root.angular, root.jquery);
    }
})(this, function(angular) {
    "use strict";
    var QueryBuilder = angular.module("fgp.kit.queryBuilder", []);
    QueryBuilder.directive("queryBuilder", [ "$interval", function($interval) {
        var _fields = '        <div class="col-md-3 dropdown">            <button class="btn btn-sm btn-default dropdown-toggle form-control" type="button" data-toggle="dropdown">{{rule.content.field}}<span class="caret" style="float:right;"></span></button>            <ul class="dropdown-menu">                <li ng-repeat="f in fields"><a ng-click="changeField(f, rule.content, \'field\')"> {{f.label}} </a></li>            </ul>        </div>        ';
        var _singleRule = '        <div class="col-md-12">            ' + _fields + '            <div class="col-md-3 dropdown">                <button class="btn btn-sm btn-default dropdown-toggle form-control" type="button" data-toggle="dropdown">{{rule.content.condition}}<span class="caret" style="float:right;"></span></button>                <ul class="dropdown-menu">                    <li ng-repeat="c in defaultConditions"><a ng-click="changeCondition(c, rule.content, \'condition\')"> {{c.label}} </a></li>                </ul>            </div>            <div class="col-md-4">                <input class="form-control" type="text" ng-model="rule.content.value"/>            </div>            <div class="col-md-2">                <button style="button;height: 34px;width:34px;" class="btn btn-sm btn-warning" ng-click="removeRule(rule)"><i class="fa fa-times" aria-hidden="true"></i></button>            </div>        </div>        ';
        var _template = '            <div class="fgp-query-builder">                <div class="row">                    <div class="btn-group" role="group" style="float:left;">                        <button type="button" class="btn btn-sm btn-default" ng-click="currentOperator=\'add\'">ADD</button>                        <button type="button" class="btn btn-sm btn-default" ng-click="currentOperator=\'or\'">OR</button>                    </div>                    <div class="btn-group" role="group" style="float:right;">                        <button class="btn btn-sm btn-default" ng-click="addNewRule()"><i class="fa fa-plus" aria-hidden="true" style="margin-right:2px;"></i>Rule</button>                        <button class="btn btn-sm btn-default"><i class="fa fa-plus" aria-hidden="true" style="margin-right:2px;"></i>Ruleset</button>                    </div>                </div>                <div class="row tree" style="padding-top:3px;">                    <ul>                        <li ng-repeat="rule in result.rules">                        ' + _singleRule + "                        </li>                    </ul>                </div>            <div>            ";
        var _link = function(scope, element, attrs) {};
        var _controller = [ "$scope", function($scope) {
            $scope.currentOperator = "and";
            $scope.fields = [ {
                column: "nic_mac_id",
                label: "MAC_ID"
            }, {
                column: "meter_serial_num",
                label: "SERIAL #"
            }, {
                column: "nmi_id",
                label: "NMI"
            }, {
                column: "supplyPointGisId",
                label: "SUPPLY POINT GIS"
            }, {
                column: "lv_circuit",
                label: "LV_CIRCUIT"
            }, {
                column: "substation_name",
                label: "SUBSTATION"
            }, {
                column: "switch_zone",
                label: "SWITCH ZONE"
            }, {
                column: "hv_feeder",
                label: "HVFEEDER"
            }, {
                column: "zone_substation",
                label: "ZONE SUBSTATION"
            }, {
                column: "premise_address",
                label: "ADDRESS"
            } ];
            $scope.defaultConditions = [ {
                label: "==",
                value: "=="
            }, {
                label: "is null",
                value: "is null"
            }, {
                label: "is not null",
                value: "is not null"
            } ];
            $scope.result = {
                rules: [ {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 20),
                    content: {
                        field: "nic_mac_id",
                        condition: "==",
                        value: "",
                        operator: ""
                    }
                } ]
            };
            $scope.addNewRule = function() {
                $scope.result.rules.push({
                    id: Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 20),
                    content: {
                        field: "nic_mac_id",
                        condition: "==",
                        value: "",
                        operator: $scope.currentOperator
                    }
                });
            };
            $scope.removeRule = function(rule) {
                var ridIndex = -1;
                angular.forEach($scope.result.rules, function(item, _index) {
                    if (item.id == rule.id) {
                        ridIndex = _index;
                    }
                });
                if (ridIndex != -1) {
                    $scope.result.rules.splice(ridIndex, 1);
                }
            };
            $scope.changeCondition = function(condition, obj, prop) {
                obj[prop] = condition.value;
            };
            $scope.changeField = function(field, obj, prop) {
                obj[prop] = field.column;
            };
        } ];
        return {
            restrict: "E",
            template: _template,
            scope: {
                generateCallback: "&"
            },
            link: _link,
            controller: _controller
        };
    } ]);
});
(function(root, factory) {
    "use strict";
    if (typeof module !== "undefined" && module.exports) {
        var ng = typeof angular === "undefined" ? require("angular") : angular;
        var jq = typeof jquery === "undefined" ? require("jquery") : jquery;
        factory(ng, jq);
        module.exports = "fgp.auth";
    } else if (typeof define === "function" && define.amd) {
        define([ "angular", "jquery" ], factory);
    } else {
        factory(root.angular, root.jquery);
    }
})(this, function(angular) {
    "use strict";
    var FgpAuth = angular.module("fgp.auth", [ "angular-jwt", "auth0.lock" ]);
});