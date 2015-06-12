var gulp = require('gulp');
var gls = require('gulp-live-server');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

var source = require('vinyl-source-stream');
var browserifyIncremental = require('browserify-incremental');
var buffer = require('vinyl-buffer');

//'gulp-changed' is used to notify about really changed js files only - it compares their contents
var changed = require('gulp-changed');

//our hero
var extract = require('gulp-livereload-mithril');

DEST = "./public";
SRC = "src/**/*.coffee";

//we need to store server var here to use it in 2 tasks
var server, b;

//initialize browserify and extractor
function browserifyAndExtract() {
    if (!b) {
        b = browserifyIncremental({
            entries: ["src/main.coffee"],
            extensions: ['.coffee']
        });
        var m = extract().browserify;                       // 1.1) create extractor, get browserify adapter
        b.transform('coffeeify').transform(m.transform());  // 1.2) add transformer to browserify
        browserifyAndExtract.inject = m.inject;             // 1.3) store inject function for further use
    }
    return b;
}

gulp.task('compile', function () {
    //-----------------------------------------------------------------------------------------------------------
    return browserifyAndExtract().bundle()                 // 1) prepare browserify incremental and extractor
        .pipe(source('main.js'))                           // 2) put composed file to pipe with name 'index.js'
        .pipe(buffer())                                    // 3) convert stream to buffer
        .pipe(browserifyAndExtract.inject())               // 4) inject extracted functions to pipe
        .pipe(changed(DEST, {                              // 5) proceed with only changed files ('index.js' or 'st8less.js')
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest(DEST))                             // 6) copy to public
        .pipe(server ? server.notify() : gutil.noop());    // 7) and notify live reload server
});


gulp.task('serve', ['compile'], function () {
    server = gls.new('./server.js');
    server.start();
    gulp.watch(SRC, ['compile']);
});