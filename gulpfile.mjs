import { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass";
import * as sass from "sass";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import rename from "gulp-rename";
import replace from "gulp-replace";
import { rm } from "node:fs/promises";

const sassCompiler = gulpSass(sass);

// Development: compile SCSS to the CSS file used by the existing HTML.
export function styles() {
  return src("scss/style.scss")
    .pipe(sassCompiler().on("error", sassCompiler.logError))
    .pipe(dest("css"));
}

// Production: compile and minify CSS.
function buildStyles() {
  return src("scss/style.scss")
    .pipe(sassCompiler())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/css"));
}

// Production: minify JavaScript.
function buildScripts() {
  return src("js/script.js")
    .pipe(terser())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/js"));
}

// Production: update paths to the minified assets.
function buildHtml() {
  return src("index.html")
    .pipe(
      replace(
        'href="css/style.css"',
        'href="css/style.min.css"'
      )
    )
    .pipe(
      replace(
        'src="js/script.js"',
        'src="js/script.min.js"'
      )
    )
    .pipe(dest("dist"));
}

// Copy optional local assets if these folders are added later.
function copyAssets() {
  return src(["images/**/*", "assets/**/*"], {
    base: ".",
    allowEmpty: true,
  }).pipe(dest("dist"));
}

// Remove stale production files before building.
function clean() {
  return rm("dist", { recursive: true, force: true });
}

// Clean first, then build independent outputs in parallel.
export const build = series(
  clean,
  parallel(buildStyles, buildScripts, buildHtml, copyAssets)
);

// Automatically recompile SCSS when the source changes.
function watchFiles() {
  watch("scss/**/*.scss", styles);
}

export const watchTask = watchFiles;
export const dev = series(styles, watchTask);
