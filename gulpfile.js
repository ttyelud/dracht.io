var gulp = require('gulp')
var jshint = require('gulp-jshint')
var jshintReporter = require('jshint-stylish')
var sass = require('gulp-sass')
var minifyCSS = require('gulp-csso')
var nodemon = require('nodemon')
var browserSync = require('browser-sync')

var paths = {
  'src':['index.js', 'router.js'],
  'styles':['./public/styles/*.scss','./public/styles/src/*.scss'],
  'views':['./views/*.pug','./views/**/*.pug']
};

gulp.task('serve', ['nodemon','sass'], function() {
    browserSync.init(null, {
      proxy: "http://localhost:8080",
      open: false,
      port: 7000
    })

    gulp.watch(paths.styles, ['sass'])
    gulp.watch(paths.views).on('change', browserSync.reload)
    gulp.watch(paths.src, ['js-watch'])
})

gulp.task('lint', function(){
  gulp.src(paths.src)
    .pipe(jshint())
    .pipe(jshint.reporter(jshintReporter))

})

gulp.task('js-watch', ['lint'], function (done) {
    browserSync.reload()
    done()
})

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("public/styles/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("public/styles"))
        .pipe(browserSync.stream())
})

gulp.task('nodemon', function (cb) {
	var started = false

	return nodemon({
		script: 'index.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb()
			started = true
		}
	})
})



gulp.task('default', ['serve'])
