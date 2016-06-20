/**
 * Created by ericwang on 10/06/2016.
 */
'use strict';
import angular from 'angular';
import fgpStage from './com/futuregrid/platform/kit/show/directives/fgp.stage.js';
import dataApi from './com/futuregrid/platform/kit/utils/data.api.js';
import fgpWidgetContainer from './com/futuregrid/platform/kit/show/directives/fgp.container.js';
import fgpWidgetGraph from './com/futuregrid/platform/kit/show/directives/fgp.graph.js';
import fgpWidgetPageTitle from './com/futuregrid/platform/kit/show/directives/fgp.page.title';
import fgpWidgetMap from './com/futuregrid/platform/kit/show/directives/fgp.map';
import fgpWidgetStatus from './com/futuregrid/platform/kit/show/directives/fgp.stage';
import fgpWidgetDetail from './com/futuregrid/platform/kit/show/directives/fgp.device.detail';
import fgpWidgetSpan from './com/futuregrid/platform/kit/show/directives/fgp.span';
import fgpWidgetPie from './com/futuregrid/platform/kit/show/directives/fgp.pie';
// angular module
angular.module('fgp-kit', ['ngMap']).service('dataService', dataApi.buildFactory).directive('fgpContainer', fgpStage.buildFactory)
    .directive('widgetContainer', fgpWidgetContainer.buildFactory)
    .directive('widgetGraph', fgpWidgetGraph.buildFactory)
    .directive('widgetPageTitle', fgpWidgetPageTitle.buildFactory)
    .directive('widgetMap', fgpWidgetMap.buildFactory)
    .directive('widgetStatus', fgpWidgetStatus.buildFactory)
    .directive('widgetDeviceDetail', fgpWidgetDetail.buildFactory)
    .directive('widgetDeviceSpan', fgpWidgetSpan.buildFactory)
    .directive('widgetPie', fgpWidgetPie.buildFactory);
export default 'fgp-kit';