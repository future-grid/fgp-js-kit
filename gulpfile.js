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
    distRoot: "dist",
    distUI: "~/Development/workspace/futuregrid-platform/fgp-rest-ui/src/main/webapp/bower_components/fgp-js-kit/dist",
    distWatt:"~/Development/ww/wattwatchers/fgp-ww-ui/bower_components/fgp-js-kit/dist"
};

var moduleName = "fgp.kit";


/**
 * clean
 */
gulp.task('clean', function () {
    return del(['dist']);
});

/**
 * build javascript
 */
gulp.task('js', ['clean'], () => {
    return gulp.src(paths.javascriptRoot)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(rollup({
            entry: 'src/index.js',
            sourceMap: true,
            rollup: require('rollup'),
            moduleName: 'fgp_kit',
            useStrict: false,
            banner: '/**\n' +
            ' * fgp-kit\n' +
            ' * @version 1.0 - Homepage <http://www.future-grid.com.au>\n' +
            ' * @copyright (c) 2013-2016 Eric.Wang <flexdeviser@gmail.com>\n' +
            ' * @license Apache2. \n' +
            ' * @overview fgp.kit.js is a useful toolkit for future-grid\'s clients.\n' +
            ' */',
            globals: {
                angular: 'angular',
                jquery: "$",
                dygraphs: "Dygraph",
                "chart.js": "chartJS",
                ngmap: "ngmap",
                ws: "angular-websocket",
                underscore: '_'
            },
            external: Object.keys(pkg.dependencies),
            format: 'umd'
        }).on('error', e => {
            console.error(`${e.stack}`);
        }))
        .pipe(buble({presets: ['es2015']}))
        .pipe(concat(moduleName + '.bundle.js'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot))
        .pipe(gulp.dest(paths.distWatt))
        .pipe(gulp.dest(paths.distUI));
});

/**
 * build css
 */
gulp.task('less', ['clean'], () => {
    return gulp.src(paths.stylesheetRoot)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat(moduleName + '.bundle.css'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot))
        .pipe(gulp.dest(paths.distWatt))
        .pipe(gulp.dest(paths.distUI));
});


gulp.task('min', ['less', 'js'], () => {
    var css = gulp.src(paths.distRoot + "/*.css")
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(concat(moduleName + '.bundle.min.css'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot))
        .pipe(gulp.dest(paths.distWatt))
        .pipe(gulp.dest(paths.distUI));

    var js = gulp.src(paths.distRoot + "/*.js")
        .pipe(sourcemaps.init())
        .pipe(uglify({
            mangle: false,
            compress: false,
            output: {beautify: false}
        }))
        .pipe(concat(moduleName + '.bundle.min.js'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.distRoot))
        .pipe(gulp.dest(paths.distWatt))
        .pipe(gulp.dest(paths.distUI));
});

/**
 * default task
 */
gulp.task('default', ['min']);
