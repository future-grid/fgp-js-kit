/**
 * Created by ericwang on 10/06/2016.
 */
'use strict';
import angular from 'angular';
import fgpStage from './com/futuregrid/platform/kit/show/directives/fgp.stage.js';
import dataApi from './com/futuregrid/platform/kit/utils/data.api.js';
import fgpWidgetContainer from './com/futuregrid/platform/kit/show/directives/fgp.container.js';
import fgpWidgetGraph from './com/futuregrid/platform/kit/show/directives/fgp.graph.js';
angular.module('fgp-kit', []).service('dataService', dataApi.buildFactory).directive('fgpContainer', fgpStage.buildFactory).directive('widgetContainer', fgpWidgetContainer.buildFactory).directive('widgetGraph', fgpWidgetGraph.buildFactory);
export default 'fgp-kit';