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
            _graphData.forEach(function(point) {
                if (point[0] instanceof Date && point[0] >= minDate && point[0] <= maxDate) {
                    for (var i = 1; i < point.length - 1; i++) {
                        if (point[i] >= minY && point[i] <= maxY && choosedSeries.indexOf(_series[i]) == -1) {
                            choosedSeries.push(_series[i]);
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