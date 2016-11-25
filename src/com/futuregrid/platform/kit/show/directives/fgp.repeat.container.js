/**
 * Created by ericwang on 15/06/2016.
 */
'use strict';
class fgpWidgetRepeatContainer {

    constructor($http) {
        this.restrict = 'E';
        this.scope = {};
        this._$http = $http;
    }

    template(element, attrs) {
        var flag = attrs.hasOwnProperty("shown");
        var showTitle = attrs.hasOwnProperty("showtitle");
        var element_id = attrs.id;
        var dom_show = '<div class="" id="' + element_id + '_{{$index}}" ng-repeat="item in items" style="padding-left: 2px; padding-right: 2px;">' +
            '<div class="{{css.width}}" style="padding-left: 1px; padding-right: 1px;">' +
            '<div class="panel" style="border-color:{{css.border.color || \'#fff\'}};">' +
            '<div class="panel-heading" style="background-color: {{css.title.color || \'#fff\'}}">{{css.title.text}} : {{item.name}}</div>' +
            '<div class="panel-body" id="edit' + element_id + '" style="padding:0px;min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}">' +
            '<div style="float:left;">' +
            '<span style="float:left;margin-right: 5px;" class="label label-{{labelstyle[$index]}}" ng-repeat="label in labels">{{label}}:{{item[label]}}</span>' +
            '</div>'+
            '</div>' +
            '</div>' +
            '</div></div>';
        var dom_show_notitle = '<div class="" id="' + element_id + '_{{$index}}" ng-repeat="item in items">' +
            '<div class="{{css.width}}" style="margin-bottom:15px;padding-left: 2px; padding-right: 2px;">' +
            '<div style="border-color:{{css.border.color || \'#fff\'}};">' +
            '<div id="edit' + element_id + '" style="min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"></div>' +
            '</div>' +
            '</div></div>';

        // show or design
        if (flag) {
            if (showTitle) {
                return dom_show;
            } else {
                // without title
                return dom_show_notitle;
            }
        }
    }

    controller($scope, $element, dataService, $rootScope, $timeout, $http, $location, $stateParams) {
        // only show
        var element_id = $element.attr("id");

        var widgetData = null;

        $scope.$emit('fetchWidgetMetadataEvent', {
            id: element_id, callback: function (data) {
                if (data) {
                    widgetData = data;
                }
            }
        });
        // all items
        $scope.items = [];

        $scope.labelstyle = ["default","primary","success","info","warning","danger"];


        var metadata = widgetData.data.metadata;
        $scope.css = {};
        $scope.css["color"] = metadata.css.color;
        $scope.css["width"] = metadata.css.width;
        $scope.css["border"] = {};
        $scope.css["border"]["color"] = metadata.css.border.color;
        $scope.css["background"] = {};
        $scope.css["background"]["color"] = metadata.css.background.color;
        $scope.css["title"] = metadata.css.title;
        $scope.css["title"]["color"] = metadata.css.title.color;
        $scope.css["title"]["show"] = metadata.css.title.show;

        $scope.data = {};

        $scope.labels =[];

        var page = $stateParams.type;
        var applicationName = $stateParams.applicationName;
        var device = $stateParams.device;


        if (metadata.data) {
            $scope.labels = metadata.data.datasource.labels.split(" ");
            // run script
            $http({
                method: 'GET',
                url: '/api/docker/platformnodes/' + page + '/' + device
            }).then(function (data) {
                $scope.items = data.data;
            }, function (error) {
                console.error(error);
            });
            // I'm ready. please give all my children to me~
            $timeout(function () {
                // call stage
                $scope.$emit('bindChildRepeatEvent', {
                    id: element_id
                });
            });


        }

    }


    static buildFactory($http) {
        fgpWidgetRepeatContainer.instance = new fgpWidgetRepeatContainer($http);
        return fgpWidgetRepeatContainer.instance;
    }

}

fgpWidgetRepeatContainer.$inject = ['$http'];

export {fgpWidgetRepeatContainer as default}