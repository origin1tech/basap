var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    path = require('path'),
    ls = require('gulp-live-server'),
    util = plugins.util,
    del = require('del'),
    Builder = require('systemjs-builder'),
    argv = process.argv,
    watched = ['./index.html', './app.js', './config.js',
               './src/**/*.js', './components/**/*.*', './example/**/*.*'],
    servDeps = [],
    server;

if (argv.indexOf('-b') !== -1 || argv.indexOf('--bundle') !== -1 || argv.indexOf('build') !== -1){
    util.log(util.colors.green('Build:') + ' this may take a moment, ' +
        'wait until process exits/serves.');
    servDeps.push('build');
}

var isTest = argv.indexOf('serve-test') !== -1;

// plumber util
function plumber() {
    return plugins.plumber({errorHandler: plugins.notify.onError()});
}

// clean dist directories
gulp.task('clean', function (cb) {
    return del('./dist', cb);
});

// lint the project.
gulp.task('lint', function () {
    return gulp.src('./src/**/*.js')
        .pipe(plumber())
        .pipe(plugins.cached('jshint'))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});

// bundle using systemjs-builder
gulp.task('bundle', ['clean'], function (cb) {

    var builder = new Builder();
    var configFile = './config.js';
    var opts = {
        minify: false,
        sourceMaps: true
    };
    builder.loadConfig(configFile)
        .then(function () {
            builder.config({baseURL: path.resolve('./')});
            builder.build('src/base', './dist/basap.js', opts)
                .then(function () {
                    builder.buildSFX('src/base', './dist/basap.sfx.js', opts)
                        .then(function() {
                            opts.runtime = true;
                            builder.buildSFX('src/base', './dist/basap.runtime.js', opts)
                                .then(function() {
                                    return cb();
                                })
                                .catch(function(ex) {
                                    util.log(util.colors.red('Bundle SFX Runtime:'), ex.message);
                                    return cb();
                                });
                        })
                        .catch(function(ex) {
                            util.log(util.colors.red('Bundle SFX:'), ex.message);
                            return cb();
                        });
                })
                .catch(function(ex) {
                    util.log(util.colors.red('Bundle:'), ex.message);
                    return cb();
                });
        })
        .catch(function(ex) {
            util.log(util.colors.red('Bundle Config:'), ex.message);
        });

});

gulp.task('uglify', ['clean','bundle'], function () {
    gulp.src('./dist/*.js')
        .pipe(plugins.uglify())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['uglify']);

gulp.task('reload', servDeps, function () {
    return gulp.src(watched)
        .pipe(server.notify());
});

// run the web server.
gulp.task('serve', servDeps, function (cb) {
    server = ls.new('./server.js');
    server.start();
    // watch for file changes.
    var watch = gulp.watch(watched, ['reload']);
    watch.on('change', function (changed) {
        changed = path.relative(process.cwd(), changed.path);
        util.log(util.colors.green('Watched:'), changed);
    });
    return cb();
});

gulp.task('serve-test', ['serve'], function () {
    process.exit();
});

// bump project version
gulp.task('bump', function () {
    return gulp.src('./package.json')
        .pipe(plugins.bump())
        .pipe(gulp.dest('./'));
});
