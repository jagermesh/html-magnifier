const gulp = require('gulp');
const jshint = require('gulp-jshint');

const configs = { jshint: { src: ['*.js', '!node_modules/**/*.js'] } };

gulp.task('jshint', function() {
  return gulp.src(configs.jshint.src)
             .pipe(jshint())
             .pipe(jshint.reporter('default'))
             .pipe(jshint.reporter('fail'));
});

gulp.task('build',
  gulp.series( 'jshint' ));
