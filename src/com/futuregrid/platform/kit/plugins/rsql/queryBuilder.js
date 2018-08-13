(function(root, factory) {
    'use strict'
    if (typeof module !== 'undefined' && module.exports) {
        var ng = typeof angular === 'undefined' ? require('angular') : angular
        var jq = typeof jquery === 'undefined' ? require('jquery') : jquery
        factory(ng, jq)
        module.exports = 'fgp.kit.queryBuilder'
        /* istanbul ignore next */
    } else if (typeof define === 'function' && /* istanbul ignore next */ define.amd) {
        define(['angular', 'jquery'], factory)
    } else {
        factory(root.angular, root.jquery)
    }

}(this, function(angular) {
    'use strict'

    var QueryBuilder = angular.module('fgp.kit.queryBuilder', []);
    //-------------- add services or run config
    QueryBuilder.directive('queryBuilder', ['$interval', function($interval) {

        var _fields = '\
        <div class="col-md-3 dropdown">\
            <button class="btn btn-sm btn-default dropdown-toggle form-control" type="button" data-toggle="dropdown">{{rule.content.field}}<span class="caret" style="float:right;"></span></button>\
            <ul class="dropdown-menu">\
                <li ng-repeat="f in fields"><a ng-click="changeField(f, rule.content, \'field\')"> {{f.label}} </a></li>\
            </ul>\
        </div>\
        ';

        var _singleRule = '\
        <div class="col-md-12">\
            ' + _fields + '\
            <div class="col-md-3 dropdown">\
                <button class="btn btn-sm btn-default dropdown-toggle form-control" type="button" data-toggle="dropdown">{{rule.content.condition}}<span class="caret" style="float:right;"></span></button>\
                <ul class="dropdown-menu">\
                    <li ng-repeat="c in defaultConditions"><a ng-click="changeCondition(c, rule.content, \'condition\')"> {{c.label}} </a></li>\
                </ul>\
            </div>\
            <div class="col-md-4">\
                <input class="form-control" type="text" ng-model="rule.content.value"/>\
            </div>\
            <div class="col-md-2">\
                <button style="button;height: 34px;width:34px;" class="btn btn-sm btn-warning" ng-click="removeRule(rule)"><i class="fa fa-times" aria-hidden="true"></i></button>\
            </div>\
        </div>\
        ';

        var _template = '\
            <div class="fgp-query-builder">\
                <div class="row">\
                    <div class="btn-group" role="group" style="float:left;">\
                        <button type="button" class="btn btn-sm btn-default" ng-click="currentOperator=\'add\'">ADD</button>\
                        <button type="button" class="btn btn-sm btn-default" ng-click="currentOperator=\'or\'">OR</button>\
                    </div>\
                    <div class="btn-group" role="group" style="float:right;">\
                        <button class="btn btn-sm btn-default" ng-click="addNewRule()"><i class="fa fa-plus" aria-hidden="true" style="margin-right:2px;"></i>Rule</button>\
                        <button class="btn btn-sm btn-default"><i class="fa fa-plus" aria-hidden="true" style="margin-right:2px;"></i>Ruleset</button>\
                    </div>\
                </div>\
                <div class="row tree" style="padding-top:3px;">\
                    <ul>\
                        <li ng-repeat="rule in result.rules">\
                        ' + _singleRule + '\
                        </li>\
                    </ul>\
                </div>\
            <div>\
            ';
        var _link = function(scope, element, attrs) {
            // dom action



        };


        var _controller = ["$scope", function($scope) {

            $scope.currentOperator = 'and';

            $scope.fields = [{
                column: 'nic_mac_id',
                label: 'MAC_ID'
            }, {
                column: 'meter_serial_num',
                label: 'SERIAL #'
            }, {
                column: 'nmi_id',
                label: 'NMI'
            }, {
                column: 'supplyPointGisId',
                label: 'SUPPLY POINT GIS'
            }, {
                column: 'lv_circuit',
                label: 'LV_CIRCUIT'
            }, {
                column: 'substation_name',
                label: 'SUBSTATION'
            }, {
                column: 'switch_zone',
                label: 'SWITCH ZONE'
            }, {
                column: 'hv_feeder',
                label: 'HVFEEDER'
            }, {
                column: 'zone_substation',
                label: 'ZONE SUBSTATION'
            }, {
                column: 'premise_address',
                label: 'ADDRESS'
            }];

            $scope.defaultConditions = [{
                    label: "==",
                    value: "=="
                },
                {
                    label: "is null",
                    value: "is null"
                },
                {
                    label: "is not null",
                    value: "is not null"
                }
            ];
            //
            $scope.result = {
                rules: [{
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
                    content: {
                        field: 'nic_mac_id',
                        condition: "==",
                        value: '',
                        operator: ''
                    }
                }]
            };
            //
            $scope.addNewRule = function() {
                $scope.result.rules.push({
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20),
                    content: {
                        field: 'nic_mac_id',
                        condition: "==",
                        value: '',
                        operator: $scope.currentOperator
                    }
                });
            };
            //
            $scope.removeRule = function(rule) {
                var ridIndex = -1;
                angular.forEach($scope.result.rules, function(item, _index) {
                    if (item.id == rule.id) {
                        ridIndex = _index;
                    }
                });
                if(ridIndex != -1){
                    $scope.result.rules.splice(ridIndex, 1);
                }
            };
            //
            $scope.changeCondition = function(condition, obj, prop) {
                obj[prop] = condition.value;
            };

            $scope.changeField = function(field, obj, prop) {
                obj[prop] = field.column;
            };
        }];
        return {
            restrict: 'E',
            template: _template,
            scope: {
                generateCallback: '&'
            },
            link: _link,
            controller: _controller
        };
    }]);
}));
