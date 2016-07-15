var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');

var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var rollup = require('gulp-rollup');
var buble = require('gulp-buble');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
const pkg = require('./package.json');

var paths = {
    javascriptRoot: "src/**/*.js",
    stylesheetRoot: "src/**/*.less",
    distRoot: "dist"
};

var moduleName = "fgp.kit";


/**
 * clean
 */
gulp.task('clean', function () {
    return del(['dist']);
});


gulp.task('js', ['clean'], () => {
    return gulp.src(paths.javascriptRoot)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(rollup({
            entry: 'src/index.js',
            sourceMap: true,
            rollup: require('rollup'),
            moduleName: 'fgp_kit',
            banner: '/**\n' +
            ' * fgp-kit\n' +
            ' * @version 1.0 - Homepage <http://www.future-grid.com.au>\n' +
            ' * @copyright (c) 2013-2016 Eric.Wang <flexdeviser@gmail.com>\n' +
            ' * @license Apache. \n' +
            ' * @overview fgp.kit.js is a useful toolkit for future-grid\'s clients.\n' +
            ' */',
            globals: {
                angular: 'angular',
                jquery: "$",
                dygraphs: "Dygraph",
                "chart.js": "chartJS",
                ngmap: "ngmap",
                underscore: '_'
            },
            external: Object.keys(pkg.dependencies),
            format: 'umd'
        }).on('error', e => {
            console.error(`${e.stack}`);
        }))
        .pipe(buble({presets: ['es2015']}))
        .pipe(uglify({
            mangle: false,
            compress: false,
            output: {beautify: false}
        }))
        .pipe(concat(moduleName + '.bundle.min.js'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot));
});

gulp.task('less', ['clean'], () => {
    return gulp.src(paths.stylesheetRoot)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(concat(moduleName + '.bundle.min.css'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot));
});


gulp.task('default', ['less', 'js']);