const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['build']);

gulp.task('build', ['tsc', 'minify']);

gulp.task('tsc', function () {
    const project = ts.createProject('tsconfig.json');
    return project.src()
        .pipe(sourcemaps.init())
        .pipe(project()).on('error', console.error)
        .pipe(sourcemaps.write('.', {
            includeContent: false
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('minify', ['tsc'], function () {
    return gulp.src(['!dist/*.min.js', 'dist/*.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['tsc'], function () {
    return gulp.watch('src/*', ['tsc']);
})
