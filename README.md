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
  <script src="bower_components/fgp-js-kit/dist/fgp.kit.bundle.js"></script>
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
<div fgp-container application-name="'node-agent'" device-name="'127.0.0.1'"
         configuration="configuration"
         server="'http://localhost:8081'"></div>
```

## Javascript

```javascript
angular.module('app', ['fgp-kit']).controller('ctl', function ($scope) {

    $scope.configuration = [{
        "html": "<titlecontainer id=\"item4094\"></titlecontainer>",
        "configTemplate": "",
        "metadata": {
            "css": {
                "color": "green",
                "width": "col-md-12",
                "border": {"color": "#fff"},
                "background": {"color": "#fff"},
                "title": {"text": "device.name", "color": "#5cb85c", "show": true, "minHeight": 100},
                "subtitle": {"text": "\"subtitle\"", "color": "#5cb85c", "show": true}
            }, "other": {}
        },
        "html_render": "<widget-page-title id=\"item4094\" shown></widget-page-title>",
        "parent": "workingArea",
        "id": "item4094"
    }, {
        "html": "<itemcontainer id=\"item7953\"></itemcontainer>",
        "configTemplate": "",
        "metadata": {
            "css": {
                "color": "green",
                "width": "col-md-12",
                "border": {"color": "#218d13"},
                "background": {"color": "#fff"},
                "title": {"text": "Hello", "color": "#5cb85c", "show": true}
            }, "other": {}
        },
        "html_render": "<widget-container id=\"item7953\" shown showTitle></widget-container>",
        "parent": "workingArea",
        "id": "item7953"
    }, {
        "html": "<line-chart-dygraphs-cache id=\"item2715\" style=\"height: 100%;\" type=\"line\"></line-chart-dygraphs-cache>",
        "configTemplate": "",
        "metadata": {
            "css": {"width": "col-md-12", "height": "400"},
            "data": {
                "basic": {"range_show": true, "childrenChart": [], "parentChart": [], "zoom": true},
                "source": {"store": "memory", "relation": "", "device_group": "platform_node", "relation_group": ""},
                "groups": [{
                    "name": "all",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "substation_va",
                        "rows": [{"label": "label", "value": "value", "color": "#ff0033;", "yaxis": 0}]
                    }]
                }, {
                    "name": "device",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "raw",
                        "rows": [{"color": "#b85c5c", "label": "FREE", "value": "data.free", "yaxis": "0"}]
                    }, {
                        "name": "5min",
                        "rows": [{
                            "color": "#5cabb8",
                            "label": "max free",
                            "value": "data.maxFree",
                            "yaxis": "0"
                        }, {"color": "#009dff", "label": "avg", "value": "data.avgFree", "yaxis": "1"}]
                    }]
                }, {
                    "name": "relation",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "substation_va",
                        "rows": [{"label": "label", "value": "value", "color": "#ff1100;", "yaxis": 0}]
                    }]
                }]
            }
        },
        "html_render": "<widget-graph id=\"item2715\" shown type=line></widget-graph>",
        "parent": "edititem7953",
        "id": "item2715"
    }, {
        "html": "<itemcontainer id=\"item9358\"></itemcontainer>",
        "configTemplate": "",
        "metadata": {
            "css": {
                "color": "green",
                "width": "col-md-12",
                "border": {"color": "#2cc80b"},
                "background": {"color": "#fff"},
                "title": {"text": "info", "color": "#5cb85c", "show": true}
            }, "other": {}
        },
        "html_render": "<widget-container id=\"item9358\" shown showTitle></widget-container>",
        "parent": "workingArea",
        "id": "item9358"
    }, {
        "html": "<itemcontainer id=\"item8956\"></itemcontainer>",
        "configTemplate": "",
        "metadata": {
            "css": {
                "color": "green",
                "width": "col-md-12",
                "border": {"color": "#fff"},
                "background": {"color": "#fff"},
                "title": {"text": "title", "color": "#5cb85c", "show": false}
            }, "other": {}
        },
        "html_render": "<widget-container shown id=\"item8956\"></widget-container>",
        "parent": "workingArea",
        "id": "item8956"
    }, {
        "html": "<fgmap id=\"item4372\"></fgmap>",
        "configTemplate": "",
        "metadata": {
            "css": {"width": "col-md-12", "height": "300"},
            "data": [{"label": "latitude", "value": "device.location.latitude"}, {
                "label": "longitude",
                "value": "device.location.longitude"
            }, {"label": "name", "value": "device.location.name"}, {
                "label": "image",
                "value": "http://download.easyicon.net/png/568804/36/"
            }]
        },
        "html_render": "<widget-map id=\"item4372\" shown></widget-map>",
        "parent": "edititem8956",
        "id": "item4372"
    }, {
        "html": "<itemcontainer id=\"item6688\"></itemcontainer>",
        "configTemplate": "",
        "metadata": {
            "css": {
                "color": "green",
                "width": "col-md-12",
                "border": {"color": "#1de403"},
                "background": {"color": "#fff"},
                "title": {"text": "title", "color": "#5cb85c", "show": true}
            }, "other": {}
        },
        "html_render": "<widget-container id=\"item6688\" shown showTitle></widget-container>",
        "parent": "workingArea",
        "id": "item6688"
    }, {
        "html": "<piechart id=\"item3429\"></piechart>",
        "configTemplate": "",
        "metadata": {
            "css": {"width": "col-md-6", "height": "200"},
            "data": [{"label": "totalVah", "value": "30", "color": "#ff0084"}, {
                "label": "current",
                "value": "40",
                "color": "#89ff00"
            }]
        },
        "html_render": "<widget-pie id=\"item3429\" shown></widget-pie>",
        "parent": "edititem6688",
        "id": "item3429"
    }, {
        "html": "<gridtable id=\"item6225\"></gridtable>",
        "configTemplate": "",
        "metadata": {
            "css": {"width": "col-md-12", "height": "400"},
            "data": {
                "basic": {"range_show": true, "childrenChart": [], "parentChart": [], "zoom": true},
                "source": {"store": "memory", "relation": "", "device_group": "platform_node", "relation_group": ""},
                "groups": [{
                    "name": "all",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "substation_va",
                        "rows": [{"label": "label", "value": "value", "color": "#ff0033;", "yaxis": 0}]
                    }]
                }, {
                    "name": "device",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "raw",
                        "rows": [{"color": "#b85c5c", "label": "FREE", "value": "data.free", "yaxis": "0"}]
                    }, {
                        "name": "5min",
                        "rows": [{
                            "color": "#5cabb8",
                            "label": "max free",
                            "value": "data.maxFree",
                            "yaxis": "0"
                        }, {"color": "#009dff", "label": "avg", "value": "data.avgFree", "yaxis": "1"}]
                    }]
                }, {
                    "name": "relation",
                    "leftYAxis": "Y1",
                    "rightYAxis": "Y2",
                    "collections": [{
                        "name": "substation_va",
                        "rows": [{"label": "label", "value": "value", "color": "#ff1100;", "yaxis": 0}]
                    }]
                }],
                "chartId": "item2715"
            }
        },
        "html_render": "<widget-chart-table id=\"item6225\" shown></widget-chart-table>",
        "parent": "edititem9358",
        "id": "item6225"
    }];


});
```

## Contributors

Thank you to the [contributors](https://github.com/future-grid/fgp-js-kit/contributors)!

# Author

Eric Wang, [[About me](https://github.com/flexdeviser)]

# License

fgp-js-kit is copyright 2016 future-grid and contributors. 
It is licensed under the Apache license. See the include LICENSE file for details.
