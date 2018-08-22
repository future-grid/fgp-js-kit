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