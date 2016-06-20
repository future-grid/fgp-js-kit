/**
 * Created by ericwang on 20/06/2016.
 */
export default class fgpWidgetSpan {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(scope, element) {
        return '<div class = "{{css.width}}" style="padding:0px;"><div class="row" style="height: {{css.height}}px;">' +
            '</div>';
    }

    controller($scope, $element) {

        var element_id = $element.attr("id");
        var widgetData = null;
        $scope.$emit('fetchWidgetMetadataEvent', {
            id: element_id, callback: function (data) {
                if (data) {
                    widgetData = data;
                }
            }
        });

        $scope.showdata = widgetData.data;
        $scope.css = {
            width: "col-md-12",
            height: "400"
        };
        if ($scope.showdata.metadata.css) {
            $scope.css = $scope.showdata.metadata.css;
        }
    }

    static buildFactory() {
        fgpWidgetSpan.instance = new fgpWidgetSpan();
        return fgpWidgetSpan.instance;
    }

}