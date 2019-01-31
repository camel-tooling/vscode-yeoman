(function() { "use strict"; } ());

var gulp = require("gulp");
var gulp_tslint = require("gulp-tslint");

gulp.task("tslint", () => {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'])
      .pipe(gulp_tslint())
      .pipe(gulp_tslint.report());
});
