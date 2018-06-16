const gulp = require('gulp');
const jshint = require('gulp-jshint');
const jshintReporter = require('jshint-stylish');
const sass = require('gulp-sass');
const nodemon = require('nodemon');
const browserSync = require('browser-sync');
const gutil = require('gulp-util');
const gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
const rename = require('gulp-rename');
const git = require('gulp-git');

const paths = {
  'src':['index.js', 'router.js'],
  'styles':['./public/styles/*.scss', './public/styles/src/*.scss'],
  'views':['./views/*.pug', './views/**/*.pug']
};

gulp.task('serve', ['nodemon', 'sass'], () => {
  browserSync.init(null, {
    proxy: 'http://localhost:8080',
    open: false,
    port: 7000
  });

  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.views).on('change', browserSync.reload);
  gulp.watch(paths.src, ['js-watch']);
});

gulp.task('lint', () => {
  gulp.src(paths.src)
    .pipe(jshint())
    .pipe(jshint.reporter(jshintReporter));
});

gulp.task('js-watch', ['lint'], (done) => {
  browserSync.reload();
  done();
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', () => {
  return gulp.src('public/styles/*.scss')
    .pipe(sass({includePaths: 'node_modules'}))
    .pipe(gulp.dest('public/styles'))
    .pipe(browserSync.stream());
});

gulp.task('nodemon', (cb) => {
  let started = false;

  return nodemon({
    script: 'index.js'
  }).on('start', () => {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('docs', () => {
  git.clone('https://github.com/davehorton/drachtio-srf', (err) => {
    if (err) {
      process.chdir('./drachtio-srf');
      git.pull('origin', 'master', (err) => {
        if (err) {
          console.error(`git pull error: ${err}`);
          throw err;
        }
      });
    }
  });
  process.chdir('./');
  return gulp.src(['drachtio-srf/lib/*.js'])
    .pipe(gulpJsdoc2md({ plugin: 'dmd-clear' }))
    .on('error', (err) => {
      gutil.log(gutil.colors.red('jsdoc2md failed'), err.message);
    })
    .pipe(rename((path) => {
      path.extname = '.md';
    }))
    .pipe(gulp.dest('docs/api'));
});


gulp.task('default', ['serve']);
