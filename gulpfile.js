"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
// var gulp        = require("gulp"),
//     browserify  = require("browserify"),
//     source      = require("vinyl-source-stream"),
//     buffer      = require("vinyl-buffer"),
//     tslint      = require("gulp-tslint"),
//     tsc         = require("gulp-typescript"),
//     sourcemaps  = require("gulp-sourcemaps"),
//     uglify      = require("gulp-uglify"),
//     runSequence = require("run-sequence"),
//     mocha       = require("gulp-mocha"),
//     istanbul    = require("gulp-istanbul"),
//     browserSync = require('browser-sync').create();

var gulp        = require("gulp"),
    watch       = require("gulp-watch"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    browserify  = require("browserify"),    
    runSequence = require("run-sequence"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    browserSync = require('browser-sync').create();

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function () {
    return gulp.src([
        "source/**/**.ts",
        "test/**/**.test.ts"
    ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function () {
    return gulp.src([
        "source/**/**.ts",
        "typings/main.d.ts/",
        "source/interfaces/interfaces.d.ts"
    ])
        .pipe(tsProject())
        .js.pipe(gulp.dest("source/"));
});

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function () {
    return gulp.src([
        "test/**/*.ts",
        "typings/main.d.ts/",
        "source/interfaces/interfaces.d.ts"
    ])
        .pipe(tsTestProject())
        .js.pipe(gulp.dest("test/"));
});

gulp.task("buildAll", function (cb) {
    runSequence(["build-app", "build-test"], cb);
});

//******************************************************************************
//* WATCH
//******************************************************************************
gulp.task("watch", ["default"], function () {

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    watch("source/**/*.ts", "default");
    watch("dist/*.js").on('change', browserSync.reload);
});

//******************************************************************************
//* RUN
//******************************************************************************
gulp.task('run', function () {
    gulp.src('./index.html')
        .pipe(open());
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task("bundle", function() {
  
    var libraryName = "ts";
    var mainTsFilePath = "source/app.js";
    var outputFolder   = "dist/";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: true,
        standalone : libraryName
    });
    
    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});

//******************************************************************************
//* DEFAULT  runSequence("lint", "build", "test", "bundle", cb);
//******************************************************************************
gulp.task("default", function (cb) {
    runSequence("lint", "buildAll", "bundle", cb);
});