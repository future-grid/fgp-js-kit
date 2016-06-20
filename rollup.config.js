import buble from 'rollup-plugin-buble';
var pkg = require('./package.json')
export default {
    entry: 'src/index.js',
    moduleName: 'fgp_kit',
    banner: '/**\n' +
    ' * fgp-kit\n' +
    ' * @version ' + pkg.version + ' - Homepage <http://www.future-grid.com.au>\n' +
    ' * @copyright (c) 2013-2016 Eric.Wang <flexdeviser@gmail.com>\n' +
    ' * @license MIT \n' +
    ' * @overview fgp.kit.js is a useful toolkit for future-grid\'s clients.\n' +
    ' */',
    globals: {
        angular: 'angular',
        dygraphs: 'Dygraph',
        ngmap:'ngMap',
        underscore: '_'
    },
    plugins: [buble()],
    targets: [
        {dest: 'dist/fgp.kit.bundle.js', moduleName: 'fgp_kit', format: 'umd'}
    ]
};