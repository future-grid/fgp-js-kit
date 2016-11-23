/**
 * Created by ericwang on 15/06/2016.
 */
'use strict';
class fgpWidgetRepeatContainer {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(element, attrs) {
        var flag = attrs.hasOwnProperty("shown");
        var showTitle = attrs.hasOwnProperty("showtitle");
        var element_id = attrs.id;
        var dom_show = '<div class="" id="' + element_id + '_{{$index}}" ng-repeat="item in items">' +
            '<div class="{{css.width}}">' +
            '<div class="panel" style="border-color:{{css.border.color || \'#fff\'}};">' +
            '<div class="panel-heading" style="background-color: {{css.title.color || \'#fff\'}}">{{css.title.text}}</div>' +
            '<div class="panel-body" id="edit' + element_id + '" style="padding:0px;min-height:{{css.minHeight || 100}}px;background-color: {{css.background.color||\'#fff\';}}"></div>' +
            '</div>' +
            '</div></div>';
        var dom_show_notitle = '<div class="" id="' + element_id + '_{{$index}}" ng-repeat="item in items">' +
            '<div class="{{css.width}}" style="margin-bottom:15px;">' +
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

    controller($scope, $element, dataService, $rootScope, $timeout) {
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
        if (metadata.data) {
            var script = metadata.data.source.script;
            // run script
            // $http({
            //     method: 'POST',
            //     url: 'http://example.com',
            //     data: { script: script}
            // }).then(function (data) {
            //
            //
            //
            //
            // }, function (error) {
            //     console.error(error);
            // });
            $scope.items.push({name:"a"});
            $scope.items.push({name:"b"});
            $scope.items.push({name:"c"});
            $scope.items.push({name:"d"});

            // I'm ready. please give all my children to me~
            $timeout(function () {
                // call stage
                $scope.$emit('bindChildRepeatEvent', {
                    id: element_id
                });
            });



        }

    }


    static buildFactory() {
        fgpWidgetRepeatContainer.instance = new fgpWidgetRepeatContainer();
        return fgpWidgetRepeatContainer.instance;
    }

}

fgpWidgetRepeatContainer.$inject = [];

export {fgpWidgetRepeatContainer as default}