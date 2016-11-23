/**
 * Created by eric on 22/11/16.
 */

export default class fgpDockerButton {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }


    template(element, attrs) {
        var show_dom = '<div class="col-xs-12 btn-group" role="group" aria-label="...">' +
            '<button type="button" class="btn btn-success btn-xs" ' +
            ' ng-click="action(button)" ng-repeat="button in buttons"><i class="fa {{button.icon}}"' +
            ' aria-hidden="true"></i>' +
            '</button>' +
            '</div>';
        return show_dom;
    }

    controller($scope, $element) {
        // get configuration
        var id = $element.attr("id");
        var configuration = null;
        $scope.$emit('fetchWidgetMetadataEvent', {
            id: id, callback: function (data) {
                if (data) {
                    configuration = data.data.metadata.data;
                }
            }
        });
        // how many buttons?
        $scope.buttons = [];

        angular.forEach(configuration, function (item) {
           if(item.label == "buttons"){
               $scope.buttons = item.value;
           }
        });

        //
        $scope.action = function (button) {
            // send request through $http









        };
    }


    static buildFactory() {
        fgpDockerButton.instance = new fgpDockerButton();
        return fgpDockerButton.instance;
    }

}