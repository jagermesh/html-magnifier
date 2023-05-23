const gulp = require('gulp');
const eslint = require('gulp-eslint');

const configs = {
  eslint: {
    src: [
      '*.js',
    ]
  }
};

gulp.task('eslint', function() {
  return gulp.src(configs.eslint.src)
    .pipe(eslint({quiet: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build',
  gulp.series('eslint'));