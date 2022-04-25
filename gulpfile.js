const gulp = require("gulp");
const del = require("del");
const polyfiller = require("gulp-polyfiller");
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");

gulp.task("clean", function () {
  return del(["dist/*"]);
});

gulp.task("css", function () {
  return gulp
    .src(["dev/css/quiz.css", "dev/css/selectus.css", "dev/css/inputs.css"])
    .pipe(concat("quiz.css"))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(gulp.dest("dist/"))
});

gulp.task("scripts", function () {
  return gulp
    .src(["dev/js/selectus.js", "dev/js/inputs.js", "dev/js/quiz.js"])
    .pipe(polyfiller(["Promise", "Fetch"]))
    .pipe(concat("quiz.js"))
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(
      uglify({
        toplevel: true,
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("dist/"))
});

gulp.task("work", gulp.series("clean", "css", "scripts"))