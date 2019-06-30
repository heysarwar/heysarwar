////////////////////////////////////////////////////////////////////////////////////////////
// Include Gulp and Gulp Plugins
////////////////////////////////////////////////////////////////////////////////////////////
var gulp          =  require('gulp');
var sass          =  require('gulp-sass');
var sourcemaps    =  require('gulp-sourcemaps');
var browserSync   =  require('browser-sync');
var useref        =  require('gulp-useref');
var uglify        =  require('gulp-uglify');
var gulpIf        =  require('gulp-if');
var cssnano       =  require('gulp-cssnano');
var imagemin      =  require('gulp-imagemin');
var cache         =  require('gulp-cache');
var del           =  require('del');
var runSequence   =  require('run-sequence');
var autoprefix    = require("gulp-autoprefixer");


////////////////////////////////////////////////////////////////////////////////////////////
// Development Tasks
////////////////////////////////////////////////////////////////////////////////////////////

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})

// Complie Sass
gulp.task('sass', function(){
  gulp.src('app/scss/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(autoprefix("last 2 versions"))
      .pipe(gulp.dest('app/css'))
      .pipe(browserSync.reload({stream: true}))
});

// Watchers
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})


////////////////////////////////////////////////////////////////////////////////////////////
// Optimization Tasks
////////////////////////////////////////////////////////////////////////////////////////////

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('img', function() {
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/img'))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/img', '!dist/img/**/*']);
});


////////////////////////////////////////////////////////////////////////////////////////////
// Build Sequences
////////////////////////////////////////////////////////////////////////////////////////////

// Default Task
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})

// Build Task
gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'img', 'fonts'],
    callback
  )
})
