Dygraph.Plugins.HideLines = (function() {
    "use strict";

    /**
     * Creates the RectSelection
     * @constructor
     */
    var hideLines = function(opt_options) {
        this.visibility = [];
        this.opt_options = opt_options || {};
    };

    hideLines.prototype.toString = function() {
        return "Hide Lines Plugin";
    };

    /**
     * @param {Dygraph} g Graph instance.
     * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
     */
    hideLines.prototype.activate = function(g) {
        // var graph = this.graph = g;
        // var opts = this.opt_options;
        //
        // var timer = null;
        // var _hideLines = function(e) {
        //     var graph = e.dygraph;
        //     if (graph.getOption('visibility')) {
        //         var v = graph.getOption('visibility');
        //         for (var i = 0; i < v.length; i++) {
        //             v[i] = false;
        //         }
        //     }
        //     console.info("pre called");
        // };
        //
        // var _showLines = function(e) {
        //     var graph = e.dygraph;
        //     if (graph.getOption('visibility')) {
        //         var v = graph.getOption('visibility');
        //         for (var i = 0; i < v.length; i++) {
        //             v[i] = true;
        //         }
        //     }
        //     console.info("will called");
        // }
        //
        // return {
        //     predraw: _hideLines,
        //     willDrawChart: _showLines
        // };
    };

    return hideLines;
})();
