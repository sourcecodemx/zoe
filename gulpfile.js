var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    del = require('del'),
    wrap = require('gulp-wrap-amd'),
    exec = require('child_process').exec;;


gulp.task('clean', function(cb){
    del([
        'src/collections',
        'src/components',
        'src/controllers',
        'src/javascripts',
        'src/models',
        'src/stylesheets',
        'src/ui',
        'src/index.html',
        'src/images',
        'src/icons',
        'src/audio'
    ], cb);
});

gulp.task('styles', function() {
    gulp.src('app/stylesheets/app.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest('src/stylesheets'));
});

gulp.task('images', function(){
    return gulp.src(['app/images/*.png', 'app/images/*.jpg'])
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest('src/images'));
});

gulp.task('jade', function(){
    return gulp.src('app/javascripts/templates/*.jade')
        .pipe(jade({
            client: true
        }))
        .pipe(wrap({
            deps: ['jade'],
            params: ['jade']
        }))
        .pipe(gulp.dest('src/javascripts/templates'));
});

gulp.task('scripts', function(){
    return gulp.src([
            'app/**/*.js',
            '!app/stylesheets/',
            '!app/javascripts/progressCircle.js',
            '!app/javascripts/zoe.js',
            '!app/javascripts/onerror.js',
            '!app/javascripts/offline.js',
            '!app/javascripts/infobox.js',
            '!app/javascripts/console.log.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
        
});

gulp.task('copy', function(){
    gulp.src('app/images/*.gif').pipe(gulp.dest('src/images/'));
    gulp.src('app/index.html').pipe(gulp.dest('src/'));
    gulp.src('app/icons/*.*').pipe(gulp.dest('src/icons'));
    gulp.src('app/**/*.js').pipe(gulp.dest('src/'));
    gulp.src('app/audio/*.*').pipe(gulp.dest('src/audio'));
    gulp.src('node_modules/gulp-jade/node_modules/jade/runtime.js').pipe(rename('jade.js')).pipe(gulp.dest('src/javascripts/templates/'));
    gulp.src('**/*.css', {cwd: 'app/stylesheets/**'}).pipe(gulp.dest('src/stylesheets'));
    gulp.src('app/stylesheets/fonts/*').pipe(gulp.dest('src/stylesheets/fonts'));
    gulp.src('app/stylesheets/ionic/fonts/*').pipe(gulp.dest('src/stylesheets/ionic/fonts'));

    return gulp.src([
            'aspect.js/src/aspect.js',
            'aspect.js/src/functional.js',
            'backbone/backbone.js',
            'cryptojslib/rollups/sha3.js',
            'jquery/dist/jquery.min.js',
            'lodash/dist/lodash.min.js',
            'parse-1.2.19.min/index.js',
            'pusher/dist/pusher.min.js',
            'requirejs/require.js',
            'hammerjs/hammer.min.js',
            'jquery-hammerjs/jquery.hammer.js',
            'animate.css/animate.min.css',
            'requirejs-plugins/src/async.js'
        ], {cwd: 'components/**/**'})
        .pipe(gulp.dest('src/components'));
});

gulp.task('build', ['clean'], function(){
    gulp.start('styles', 'images', 'jade', 'scripts', 'copy');
});

gulp.task('build:ios', ['build'], function(cb){
    exec('bash deploy.sh', function(err){
        if(err){
            cb(err);
        }else{
            cb();
        }
    });
});