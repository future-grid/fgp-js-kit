/**
 * Created by ericwang on 10/06/2016.
 */
'use strict';
import angular from "angular";
import fgpStage from "./com/futuregrid/platform/kit/show/directives/fgp.stage.js";
import fgpWidgetStatus from "./com/futuregrid/platform/kit/show/directives/fgp.stage.js";
import dataApi from "./com/futuregrid/platform/kit/utils/data.api.js";
import fgpWidgetContainer from "./com/futuregrid/platform/kit/show/directives/fgp.container.js";
import fgpWidgetGraph from "./com/futuregrid/platform/kit/show/directives/fgp.graph.js";
import fgpWidgetPageTitle from "./com/futuregrid/platform/kit/show/directives/fgp.page.title.js";
import fgpWidgetMap from "./com/futuregrid/platform/kit/show/directives/fgp.map.js";
import fgpWidgetDetail from "./com/futuregrid/platform/kit/show/directives/fgp.device.detail.js";
import fgpWidgetSpan from "./com/futuregrid/platform/kit/show/directives/fgp.span.js";
import fgpWidgetPie from "./com/futuregrid/platform/kit/show/directives/fgp.pie.js";
import fgpDockerButton from "./com/futuregrid/platform/kit/show/directives/fgp.docker.button.js";
import fgpWidgetRepeatContainer from "./com/futuregrid/platform/kit/show/directives/fgp.repeat.container";
import fgpWidgetImage from "./com/futuregrid/platform/kit/show/directives/fgp.image.js";
import fgpWidgetIcon from "./com/futuregrid/platform/kit/show/directives/fgp.icon.js";
import fgpWidgetAppContainer from "./com/futuregrid/platform/kit/show/directives/fgp.app.container.js";
import fgpWidgetChartTable from "./com/futuregrid/platform/kit/show/directives/fgp.chart.table.js";
// angular module
angular.module('fgp-kit', ['ngMap', 'ui.router', 'angular-cache']).service('dataService', dataApi.buildFactory)
    .filter('removeSlash', function() {
        return function(input) {
            if (input.startsWith("/")) {
                return input.substring(1, input.length);
            }
            return input;
        }
    })
    .factory('$graphstorage', ['$window', function($window) {
        return {
            setTree: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getTree: function(key) {
                return JSON.parse($window.localStorage[key]) || false;
            },
            addTree: function(key, value) {
                if ($window.localStorage[key]) {
                    var trees = JSON.parse($window.localStorage[key]);
                    trees.push(value);
                    this.setTree(key, trees);
                } else {
                    this.setTree(key, [value]);
                }
            },
            clear: function() {
                $window.localStorage.clear();
            }
        }
    }])
    .directive('fgpContainer', fgpStage.buildFactory)
    .directive('widgetContainer', fgpWidgetContainer.buildFactory)
    .directive('widgetGraph', fgpWidgetGraph.buildFactory)
    .directive('widgetPageTitle', fgpWidgetPageTitle.buildFactory)
    .directive('widgetMap', fgpWidgetMap.buildFactory)
    .directive('widgetStatus', fgpWidgetStatus.buildFactory)
    .directive('widgetDeviceDetail', fgpWidgetDetail.buildFactory)
    .directive('widgetDeviceSpan', fgpWidgetSpan.buildFactory)
    .directive('widgetPie', fgpWidgetPie.buildFactory)
    .directive('widgetDockerButton', fgpDockerButton.buildFactory)
    .directive('widgetRepeatContainer', fgpWidgetRepeatContainer.buildFactory)
    .directive('widgetImage', fgpWidgetImage.buildFactory)
    .directive('widgetIcon', fgpWidgetIcon.buildFactory)
    .directive('widgetAppContainer', fgpWidgetAppContainer.buildFactory)
    .directive('widgetChartTable', fgpWidgetChartTable.buildFactory)
    .directive('emitLastRepeaterElement', [function() {
        return function(scope) {
            if (scope.$last) {
                scope.$emit('LastRepeaterElement');
            }
        };
    }]).config(function(CacheFactoryProvider) {
        angular.extend(CacheFactoryProvider.defaults, {
            maxAge: 30 * 60 * 1000, // half an hour
            deleteOnExpire: 'aggressive',
        });
    }).service('graphDataService', function(CacheFactory) {
        var graphCache = null;
        if (!CacheFactory.get('graphCache')) {
            graphCache = CacheFactory('graphCache',{
                maxAge: 30 * 60 * 1000, // half an hour
                deleteOnExpire: 'aggressive'
            });
        }
        return {
            get: function(name) {
                return graphCache.get('/graph/'+name);
            },
            put: function(name, data) {
                return graphCache.put('/graph/'+name, data);
            }
        };
    })
    .filter('tableformatter', ['$filter', function($filter) {
        return function(input, obj, field, formatter) {
            if (formatter) {
                if (obj[field]) {
                    if ("date" == formatter) {
                        return $filter('date')(new Date(obj[field]), 'd/M/yy h:mm a');
                    } else {
                        return input;
                    }
                }
            } else {
                return input;
            }
        };
    }]);
export default 'fgp-kit';
