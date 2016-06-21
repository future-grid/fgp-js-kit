# fgp-js-kit
Future Grid JavaScript Library.

Reactive, responsive Graph. using [Dygraphs](http://dygraphs.com). 

# v1.0.* - fgp-js-kit

This is the first version of graph library that uses the v1.1.1 version of Dygraphs.

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

    $scope.configuration = JSON.parse('[{\"html\":\"<widget-container id=\\"item5019\\"></widget-container>\",\"configTemplate\":\"\",\"metadata\":{\"css\":{\"color\":\"green\",\"width\":\"col-md-12\",\"border\":{\"color\":\"#11e12a\"},\"background\":{\"color\":\"#fff\"},\"title\":{\"text\":\"Standalone\",\"color\":\"#5cb85c\",\"show\":false}},\"other\":{}},\"html_render\":\"<widget-container shown id=\\"item5019\\"></widget-container>\",\"parent\":\"workingArea\",\"id\":\"item5019\"},{\"html\":\"<widget-graph id=\\"item7428\\" style=\\"height: 100%;\\" type=\\"line\\"></widget-graph>\",\"configTemplate\":\"\",\"metadata\":{\"css\":{\"width\":\"col-md-12\",\"height\":\"200\"},\"data\":{\"basic\":{\"range_show\":true,\"childrenChart\":[\"item3299\"],\"parentChart\":[],\"zoom\":true},\"source\":{\"store\":\"memory\",\"relation\":\"\",\"device_group\":\"platform_node\",\"relation_group\":\"\"},\"groups\":[{\"name\":\"all\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"substation_va\",\"rows\":[{\"label\":\"label\",\"value\":\"value\",\"color\":\"#ff0033;\",\"yaxis\":0}]}]},{\"name\":\"device\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"raw\",\"rows\":[{\"color\":\"#1ad53d\",\"label\":\"free\",\"value\":\"data.free\",\"yaxis\":\"0\"}]},{\"name\":\"5min\",\"rows\":[{\"color\":\"#d51a1a\",\"label\":\"max\",\"value\":\"data.maxFree + data.maximum\",\"yaxis\":\"0\"}]}]},{\"name\":\"relation\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"substation_va\",\"rows\":[{\"label\":\"label\",\"value\":\"value\",\"color\":\"#ff1100;\",\"yaxis\":0}]}]}]}},\"html_render\":\"<widget-graph id=\\"item7428\\" shown type=line></widget-graph>\",\"parent\":\"edititem5019\",\"id\":\"item7428\"},{\"html\":\"<widget-graph id=\\"item3299\\" style=\\"height: 100%;\\" type=\\"line\\"></widget-graph>\",\"configTemplate\":\"\",\"metadata\":{\"css\":{\"width\":\"col-md-12\",\"height\":\"200\"},\"data\":{\"basic\":{\"range_show\":false,\"childrenChart\":[],\"parentChart\":[],\"zoom\":false},\"source\":{\"store\":\"memory\",\"relation\":\"\",\"device_group\":\"platform_node\",\"relation_group\":\"\"},\"groups\":[{\"name\":\"all\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"substation_va\",\"rows\":[{\"label\":\"label\",\"value\":\"value\",\"color\":\"#ff0033;\",\"yaxis\":0}]}]},{\"name\":\"device\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"raw\",\"rows\":[{\"color\":\"#1a6cd5\",\"label\":\"Free\",\"value\":\"data.free\",\"yaxis\":\"0\"},{\"color\":\"#902929\",\"label\":\"avg\",\"value\":\"2\",\"yaxis\":\"1\"}]},{\"name\":\"5min\",\"rows\":[]}]},{\"name\":\"relation\",\"leftYAxis\":\"Y1\",\"rightYAxis\":\"Y2\",\"collections\":[{\"name\":\"substation_va\",\"rows\":[{\"label\":\"label\",\"value\":\"value\",\"color\":\"#ff1100;\",\"yaxis\":0}]}]}]}},\"html_render\":\"<widget-graph id=\\"item3299\\" shown type=line></widget-graph>\",\"parent\":\"edititem5019\",\"id\":\"item3299\"}]')


});
```



## Contributors

Thank you to the [contributors](https://github.com/future-grid/fgp-js-kit/contributors)!

# Author

Eric Wang, [[About me](https://github.com/flexdeviser)]

# License

fgp-js-kit is copyright 2016 future-grid and contributors. 
It is licensed under the Apache license. See the include LICENSE file for details.
