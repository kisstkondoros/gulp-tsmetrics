# Gulp - TS Metrics

Computes complexity in TypeScript / JavaScript files.

Example usage:
```JavaScript
var gulp = require('gulp');
var Metrics = require('./index');

gulp.task('getmetrics', function() {
    return gulp.src('**/*.ts')
        .pipe(Metrics.create(1 /* ES5 */, true /* silent */))
        .pipe(gulp.dest('./metrics'));
});

```

### License

Licensed under MIT
