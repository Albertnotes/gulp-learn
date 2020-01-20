// 宣告變數 gulp 
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('autoprefixer');
const mainBowerFiles = require('main-bower-files');


// html任務區
gulp.task('html', function () {
    return gulp.src('./source/**/*.html')
        .pipe(gulp.dest('./public/'))
});
$.watch(['./source/**/*.html'], function () {
    // 直接呼叫 html 這個 Task
    gulp.start('html');
});

// css任務區
gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        //sass編譯完成後 autoprefixer 偵測瀏覽器支援度+前綴詞
        .pipe($.postcss([autoprefixer()]))
        .pipe($.sourcemaps.write('.'))
        // gulp.dest(輸出路徑)
        .pipe(gulp.dest('./public/css/'))
});
$.watch(['./source/scss/**/*.scss'], function () {
    // 直接呼叫 sass 這個 Task
    gulp.start('sass');
});

// js任務區
gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
);

$.watch(['./source/js/**/*.js'], function () {
    // 直接呼叫 babel 這個 Task
    gulp.start('babel');
});

// bower
gulp.task('bower', function () {
    return gulp.src(mainBowerFiles({
        "overrides": {
            "bootstrap": {                       // 套件名稱
                "main": "dist/js/bootstrap.js"      // 取用的資料夾路徑
            }
        }
    }))
        .pipe(gulp.dest('./.tmp/vendors'))
});

//bower 打包
gulp.task('vendorJs', ['bower'], function () {
    return gulp.src(['./.tmp/vendors/**/**.js'])
        .pipe($.order([
            'jquery.js',
            'bootstrap.js'
        ]))
        .pipe($.concat('vendor.js'))
        .pipe(gulp.dest('./public/js'))
})

//執行
gulp.task('default',
    ['html',
        'sass',
        'babel',
        'bower',
        'vendorJs',
    ]
)