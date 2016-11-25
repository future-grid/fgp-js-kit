/**
 * Created by eric on 25/11/16.
 */
export default class fgpImage {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }

    template(scope, element) {
        return '' +
            '<div><img src="{{url}}" style="width:{{css.width}}px;height:{{css.height}}px;"></div>' +
            '';
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
            width: "0",
            height: "0"
        };

        $scope.url = "";
        if ($scope.showdata.metadata.css) {
            $scope.css = $scope.showdata.metadata.css;
        }
        if($scope.showdata.metadata.data){
            $scope.url = $scope.showdata.metadata.data.url;
        }
    }

    static buildFactory() {
        fgpImage.instance = new fgpImage();
        return fgpImage.instance;
    }

}