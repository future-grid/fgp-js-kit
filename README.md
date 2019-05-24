# fgp-js-kit
Future Grid JavaScript Library.

Reactive, responsive Graph. using [Dygraphs](http://dygraphs.com). 

# v1.0.* - fgp-js-kit

This is the first version of graph library that uses the v1.1.1 version of Dygraphs. You can also use "eric_dygraphs".

# Installation

### bower

    bower install --save fgp-js-kit

### npm

    Not support right now!

### cdn

    Not support right now!

### manually

or copy the files from `dist/`. 

Then add the sources to your code (adjust paths as needed) after 
adding the dependencies for Angular and Dygraphs first:

```html
<head>
  // css fgp.kit.bundle.min.css
<head>
<body>
  ...
</body>
  <script src="bower_components/angular/angular.min.js"></script>
  <script src="bower_components/dygraphs/dygraph-combined.js"></script>
  <script src="bower_components/dygraphs/extras/synchronizer.js"></script>
  <!--
   <script src="bower_components/eric_dygraphs/dygraph-combined-dev.js"></script>
   <script src="bower_components/eric_dygraphs/extras/synchronizer.js"></script>
   -->
  <script src="bower_components/fgp-js-kit/dist/fgp.kit.bundle.min.js"></script>
```

# Utilisation

There are 4 attributes of this directive. 
`application-name="'node-agent'"` 
`device-name="'127.0.0.1'"`
`configuration="configuration"`
`server="'http://localhost:8081'"`

*DEPRECATION WARNING*: Note that 'configuration' attribute should be a Array.

# Example

## Markup

```html
<div fgp-container application-name="application" device-name="meter" configuration="graphConfig" server="api_server" device-type="meter" date-formatter="df" style="font-size:14px;border:1px solid #eee;border-radius: 3px;"></div>
```

## Javascript

```javascript
angular.module('app', ['fgp-kit']).controller('ctl', function ($scope) {

    $scope.configuration = [{
            "html": "<itemcontainer id=\"item1384\" date-formatter=\"dateFormatter\"></itemcontainer>",
            "metadata": {
                "css": {
                    "color": "green",
                    "width": "col-md-12",
                    "border": {
                        "color": "#f3f3f3"
                    },
                    "background": {
                        "color": "#fff"
                    },
                    "title": {
                        "text": "Meter Graph",
                        "color": "#f3f3f3",
                        "show": true
                    }
                },
                "data": {
                    "source": {
                        "store": "",
                        "device_group": ""
                    }
                }
            },
            "html_render": "<widget-container id=\"item1384\" shown date-formatter=\"dateFormatter\"></widget-container>", //showTitle
            "parent": "workingArea",
            "id": "item1384"
        },
        // graph
        {
            "html": "<line-chart-dygraphs-cache id=\"item6305\" style=\"height: 100%;\" type=\"line\" date-formatter=\"dateFormatter\"></line-chart-dygraphs-cache>",
            "metadata": {
                "css": {
                    "width": "col-md-12",
                    "height": "200"
                },
                "data": {
                    "basic": {
                        "range_show": true,
                        "childrenChart": [],
                        "parentChart": [],
                        "zoom": true,
                        "ranges": [{                  // init datetime period
                            "name": "7 days",
                            "value": "604800000",
                            "checked": true
                        }, {
                            "name": "1 month",
                            "value": "2592000000",
                            "checked": false
                        }],
                        "refresh": 5000
                    },
                    "source": {
                        "device_group": "meter"
                    },
                    "groups": [{
                        "name": "all",
                        "leftYAxis": "voltage",
                        "rightYAxis": "Y2",
                        "collections": []
                    }, {
                        "name": "device",                 // device view configuration
                        "leftYAxis": "wh",
                        "rightYAxis": "",
                        "collections": [                  // intervals  5 minutes or day
                            {
                                "name": "meter_interval",
                                "interval": 3600000,      // interval in milliseconds
                                "rows": [{                      //  lines  
                                    "color": "#035db9",       // color of the line
                                    "label": "consumption",     // label of the line
                                    "value": "data.consumptionWh",  // data of the line, start with data.(dto atrribute name)
                                    "yaxis": "0",                 // yaxis . 0 left 1 right
                                    "type": "line"                // type of the line . line or dots or bar...
                                }, {
                                    "color": "#0453b9",
                                    "label": "generation",
                                    "value": "data.generationWh",
                                    "yaxis": "0",
                                    "type": "line"
                                }, {
                                    "color": "#f453b9",
                                    "label": "export",
                                    "value": "data.exportWh",
                                    "yaxis": "0",
                                    "type": "line"
                                }]
                            },
                            {
                                "name": "meter_interval_day",
                                "interval": 86400000,
                                "rows": [{
                                    "color": "#035db9",
                                    "label": "consumption",
                                    "value": "data.consumptionWh",
                                    "yaxis": "0",
                                    "type": "line"
                                }, {
                                    "color": "#0453b9",
                                    "label": "generation",
                                    "value": "data.generationWh",
                                    "yaxis": "0",
                                    "type": "line"
                                }, {
                                    "color": "#f453b9",
                                    "label": "export",
                                    "value": "data.exportWh",
                                    "yaxis": "0",
                                    "type": "line"
                                }]
                            }
                        ]
                    }, {
                        "name": "relation",
                        "leftYAxis": "voltage",
                        "rightYAxis": "Y2",
                        "collections": []
                    }]
                }
            },
            "html_render": "<widget-graph id=\"item6305\" shown type=\"line\" date-formatter=\"dateFormatter\"></widget-graph>",
            "parent": "edititem1384",
            "id": "item6305"
        }
    ];


});
```

## Contributors

Thank you to the [contributors](https://github.com/future-grid/fgp-js-kit/contributors)!

# Author

Eric Wang, [[About me](https://github.com/flexdeviser)]

# License

fgp-js-kit is copyright 2016 future-grid and contributors. 
It is licensed under the Apache license. See the include LICENSE file for details.
