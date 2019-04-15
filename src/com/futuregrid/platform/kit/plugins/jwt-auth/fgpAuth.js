(function(root, factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports) {
        var ng = typeof angular === 'undefined' ? require('angular') : angular;
        var jq = typeof jquery === 'undefined' ? require('jquery') : jquery;
        factory(ng, jq);
        module.exports = 'fgp.auth';
        /* istanbul ignore next */
    } else if (
        typeof define === 'function' &&
        /* istanbul ignore next */ define.amd
    ) {
        define(['angular', 'jquery'], factory);
    } else {
        factory(root.angular, root.jquery);
    }
})(this, function(angular) {
    'use strict';
    // import js files in index.html
    // base on
    var FgpAuth = angular.module('fgp.auth', ['angular-jwt', 'auth0.lock']);
});
