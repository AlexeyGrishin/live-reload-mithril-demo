var gulp = require('gulp');
var gls = require('gulp-live-server');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var binc = require('browserify-incremental');
var splitter = require('st8less');
var buffer = require('vinyl-buffer');

var through = require('through2');


//'gulp-changed' is used to notify about really changed js files only - it compares their contents
var changed = require('gulp-changed');

//our hero
var extract = require('gulp-livereload-mithril');
var fs = require('fs');

//todo: st8less: accept id base or gen
//todo: mithril-gulp: browerify transform
function genMyTransform(dst) {
    //if (fs.existsSync(dst)) {
    //    fs.truncateSync(dst);
    //}
    //fs.appendFileSync(dst, extract.Mithril().append + ";\n\n");
    var injected = false;

    var destBody = {};
    var myTransform = function myTransform(file) {
        var s = new splitter({criteria: extract.Mithril().criteria, fnBase: file.replace(/\W+/g, '_')});
        return through(function (buf, enc, next) {
            console.log("transform", file);
            var self = this;
            s.parse(buf, function (err, changed) {
                s.done(function (err, res) {
                    destBody[file] = res;
                    //fs.appendFile(dst, res + ";\nm.redraw();\n", function (err) {

                        self.push(changed);
                        next();
                    //})
                })
            });
        });
    };
    myTransform.inject = function() {
        //destBody = [];
        injected = false;

        return through.obj(function (file, enc, cb) {
            if (!injected) {
                var webPath = "st8less.js";
                file.contents = new Buffer([
                    "// inject " + webPath + " into page. Inserted automatically by gulp-livereload-plugin",
                    "(function loadScriptSynchronously() {",
                    "  var path = " + JSON.stringify(webPath) + ";",
                    "  document.write('<script src=\"' + path + '\"></script>');",
                    "  var req = new XMLHttpRequest();",
                    "  req.open('GET', path, false);",
                    "  req.send();",
                    "  var src = req.responseText",
                    "  eval(src)",
                    "}.call());",
                    "// end of injection",
                    file.contents.toString(enc)
                ].join("\n"));
                injected = true;
            }
            cb(null, file);
            //ignore
        }, function (cb) {
            injected = false;
            this.push(new gutil.File({
                path: 'st8less.js',
                contents: new Buffer(Object.keys(destBody).map(function(k){return destBody[k]}).join(";\n\n") + "\n\n" + extract.Mithril().append)
            }));
            cb();
        })};

    return myTransform;
}



DEST = "./public";
SRC = "src/**/*.coffee";

//we need to store server var here to use it in 2 tasks
var server;
try {fs.unlinkSync('./browserify-cache.json')} catch(e){}

var b = browserify({
    entries: ["src/main.coffee"],
    extensions: ['.coffee'],

    cache: {}, packageCache: {}, fullPaths: true
});
binc(b, {cacheFile1: './browserify-cache.json'});
var m = genMyTransform();
b.transform('coffeeify').transform(m);

gulp.task('compile2', function () {
    return b.bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(m.inject())
        .pipe(changed(DEST, {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('public'))
        .pipe(server ? server.notify() : gutil.noop())
});


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

gulp.task('serve', ['compile2'], function () {
    server = gls.new('./server.js');
    server.start();
    gulp.watch(SRC, ['compile2']);
});