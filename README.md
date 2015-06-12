This is demo of live reload plugin for mithril views.

## How to run

```bash
git clone https://github.com/AlexeyGrishin/live-reload-demo
npm install
gulp serve
```

- Open http://localhost:3000
- Open `src/main.coffee` in your favourite editor and do some changes in code
  - if you change contents of `view` functions (and hit `save` of course) you'll see changes applied immediately in browser, without reload
  - if you change `controller` functions the page will reload as usual (you'll see red 'Page reloaded' text)
  - click on 'open' button on page and modify `view` function - page will be updated without loosing current state


## How it works

It requires cooperation of 2 plugins

1. `gulp-livereload-mitril` - it processes the js code and moves out mithril `view` functions to separate file called `st8less.js` by default. This class also contains plugin for LiveReload which handles updates of itself and updates functions without whole page reload.

2. `gulp-changed` - it allows to notify LiveReload about only really changed js files (by contents comparison). Without it you'll get page still reloaded as changed time of your js files will be changed due to your edits.

In this example I use `gulp-live-server` module to run both app server and LiveReload server and notify it. I do not think it will be a problem to use another live reload client.

## How to use it in gulp

Here is `gulpfile.js` with comments.

```javascript
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
```

## Integration with browserify

Take a look at `browserify` branch. You may run it with the following commands:
```javascript
git clone https://github.com/AlexeyGrishin/live-reload-demo
git checkout browserify
npm install
gulp serve
```

You may note that first compilation takes ~5s - this is due to `src/something_big.coffee` included to the sources. If we run browserify on every change then we have to wait that time before browser page is updated.

To solve that it is recommended to use:
1. `browserify-incremental`
2. browserify adapter for `gulp-mithril-livereload` plugin (already inside)

Check `gulpfile.js` to see how they are used together. Then to check how it works:

- Open http://localhost:3000
- Open `src/list.coffee` in your favourite editor, change `view` function and save changes
  - you'll see changes immediately
- Open `src/main.coffee` and change `view` function
  - you'll see changes immediately
- Open `src/something_big.coffee` and change `Page1` `view` function
  - you'll see changes after ~5s delay