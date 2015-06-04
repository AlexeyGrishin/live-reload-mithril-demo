var gulp = require('gulp');
var gls = require('gulp-live-server');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

//'gulp-changed' is used to notify about really changed js files only - it compares their contents
var changed = require('gulp-changed');

//our hero
var extract = require('gulp-livereload-mithril');


DEST = "./public";
SRC = "src/**/*.coffee";

//we need to store server var here to use it in 2 tasks
var server;

gulp.task('compile', function () {
    //-------------------------------------------------// So here we
    gulp.src(SRC)                                      // 1) get coffeescripts
        .pipe(coffee())                                // 2) compile to javascript
        .pipe(extract())                               // 3) extract mithril views into separate file named `st8less.js`
        .pipe(changed(DEST, {                          // 4) ignore js files which contents not changed
            hasChanged: changed.compareSha1Digest      //
        }))                                            //
        .pipe(gulp.dest(DEST))                         // 5) copy changed to public
        .pipe(server ? server.notify() : gutil.noop());// 6) notify server about changed files only.
});

gulp.task('serve', ['compile'], function () {
    server = gls.new('./server.js');
    server.start();
    gulp.watch(SRC, ['compile']);
});