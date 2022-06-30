const path = require('path');
const { series, parallel, src, dest, watch } = require('gulp');
const clean = require('gulp-clean');
const terser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-minify-css');

const { resolve } = path;

const SPEC_DIR = '.';
const BASE_PATH = resolve(__dirname, './src');
const DIST_PATH = resolve(__dirname, './dist');

function getInAbsolutePath(path) {
    return resolve(BASE_PATH, path);
}

// function getOutAbsolutePath(path) {
//     return "!" + resolve(BASE_PATH, path);
// }

// copy files which no deal with
function copy() {
    return src(
        [getInAbsolutePath(`*.json`), getInAbsolutePath(`./images/**/*`),  getInAbsolutePath(`./static/images/**/*`)],
        { base: './src' }
    ).pipe(dest(resolve(DIST_PATH, SPEC_DIR)));
}

// clean dist
function cleanAll() {
    return src(DIST_PATH, { read: false, allowEmpty: true }).pipe(clean());
}

// pivate task html
function html() {
    return src([
        getInAbsolutePath('./**/*.html')
        // getOutAbsolutePath(`./${SPEC_DIR}/**/*.html`)
    ])
        .pipe(
            htmlmin({
                removeComments: true, //清除HTML注释
                collapseWhitespace: true, //压缩HTML
                collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
                removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
                removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
                removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
                minifyJS: true, //压缩页面JS
                minifyCSS: true //压缩页面CSS
            })
        )
        .pipe(dest(DIST_PATH));
}

// pivate task js
function js() {
    return src([
        getInAbsolutePath('./**/*.js')
        // getOutAbsolutePath(`./${SPEC_DIR}/**/*.js`)
    ])
        .pipe(terser())
        .pipe(dest(DIST_PATH));
}

// pivate task css
function css() {
    return src([
        getInAbsolutePath('./**/*.css')
        // getOutAbsolutePath(`./${SPEC_DIR}/**/*.css`)
    ])
        .pipe(cssmin())
        .pipe(dest(DIST_PATH));
}

// private watch files
function watchFiles() {
    return watch(['./src'], build);
}

var build = series(cleanAll, parallel(html, css, js, copy))

// public build task
exports.build = build;

// public watch task
exports.watch = series(watchFiles);

