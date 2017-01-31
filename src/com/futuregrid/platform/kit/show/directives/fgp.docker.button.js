/**
 * Created by eric on 22/11/16.
 */

export default class fgpDockerButton {

    constructor() {
        this.restrict = 'E';
        this.scope = {};
    }


    template(element, attrs) {
        var show_dom = '<div class="col-xs-12 btn-group" role="group" style="padding: 2px;" aria-label="...">' +
            '<div style="float: right;">' +
            '<button type="button" class="btn btn-{{button.color}} btn-xs" ' +
            ' ng-click="action(button)" ng-repeat="button in buttons" ng-show="checkShow(button)"><i class="fa {{button.icon}}"' +
            ' aria-hidden="true"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
        return show_dom;
    }

    controller($scope, $element, $http) {

        $scope.stats = "";

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

        var repeateId = [];

        $scope.checkShow = function (button) {
            if (button.type === "stop") {
                if ($scope.stats === "running") {
                    return true;
                } else {
                    return false;
                }
            } else if (button.type === "start") {
                if ($scope.stats === "exited" || $scope.stats === "created") {
                    return true;
                } else {
                    return false;
                }
            } else if(button.type === "delete"){
                if ($scope.stats === "exited" || $scope.stats === "created") {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };

        if ($scope.$parent.repeat) {
            repeateId = $scope.$parent.repeat.split(",");
        }
        // how many buttons?
        $scope.buttons = [];

        angular.forEach(configuration, function (item) {
            if (item.label == "buttons") {
                $scope.buttons = item.value;
            }
        });

        // submit "action" to rest api
        $scope.action = function (button) {
            // send request through $http
            $http({
                method: 'POST',
                url: '/api/docker/hosts/action',
                data: {
                    func: button.func,
                    script: button.script,
                    container: repeateId[0],
                    host: repeateId[1],
                    application: repeateId[2]
                }
            }).then(function successCallback(response) {
                console.info(response.data);
            }, function errorCallback(response) {
                console.error(response.data);
            });


        };

        $scope.$on('containerStatusEvent', function (event, data) {
            if (data.application === repeateId[2] && data.container === repeateId[0] && data.host === repeateId[1]) {
                $scope.stats = data.stats;
            }
        });


    }


    static buildFactory() {
        fgpDockerButton.instance = new fgpDockerButton();
        return fgpDockerButton.instance;
    }

}