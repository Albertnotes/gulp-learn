// "browser-sync": "^2.26.7", 網頁伺服器渲染
// "gulp": "^3.9.1", 
// "gulp-clean": "^0.4.0", 刪除套件
// "gulp-clean-css": "^4.2.0", 壓縮css套件
// "gulp-concat": "^2.6.1", 合併套件
// "gulp-gh-pages": "^0.5.4", gitHub-page 上傳套件
// "gulp-if": "^3.0.0", if判斷式套件
// "gulp-imagemin": "^7.0.0", image壓縮套件，但是第三方應用程式壓縮率大於套件
// "gulp-load-plugins": "^2.0.2", gulp 群組套件免變數宣告
// "gulp-order": "^1.2.0", 執行順序
// "gulp-plumber": "^1.2.1", 遇錯誤不中斷執行
// "gulp-postcss": "^8.0.0", autoprefixer - 主套件
// "autoprefixer": "^9.7.4",  Can I use? 前綴詞 - gulp-postcss - 子套件
// "gulp-sass": "^4.0.2", sass編譯器
// "gulp-sequence": "^1.0.0",  //執行順序套件 gulp 4 可不使用有語法代替
// "gulp-sourcemaps": "^2.6.5", // 指引開發者工具 css 與 js 合併前原檔位置
// "gulp-uglify": "^3.0.2", // js壓縮套件
// "gulp-watch": "^5.0.1", 3.9.1版本 內建watch 無即時監控新增檔案功能 =>補足套件 gulp 4 可不使用
// "main-bower-files": "^2.13.3", bower抓取套件
// "minimist": "^1.2.0" 用來讀取指令轉成變數

// 宣告變數 gulp 
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync');
var minimist = require('minimist');

var envOptions = {
    string: 'env',
    default: { env: 'develop' }
}
var options = minimist(process.argv.slice(2), envOptions);
console.log(options)

gulp.task('clean', () => {
    return gulp.src(['./public', './.tmp'], { read: false }) // 選項讀取：false阻止gulp讀取文件的內容，使此任務更快。
        .pipe($.clean());
});

// html任務區
gulp.task('html', function () {
    return gulp.src('./source/**/*.html')
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream());
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
        .pipe($.if(options.env === 'production', $.cleanCss()))
        .pipe($.sourcemaps.write('.'))
        // gulp.dest(輸出路徑)
        .pipe(gulp.dest('./public/css/'))
        .pipe(browserSync.stream());
});

$.watch(['./source/scss/**/*.scss'], function () {
    // 直接呼叫 sass 這個 Task
    gulp.start('sass');
});

// js任務區
gulp.task('js', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.concat('all.js'))
        .pipe($.if(options.env === 'production', $.uglify()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
        .pipe(browserSync.stream())
);

$.watch(['./source/js/**/*.js'], function () {
    // 直接呼叫 babel 這個 Task
    gulp.start('js');
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
        .pipe(gulp.dest('./.tmp/vendors'));
});

//bower 打包
gulp.task('vendorJs', ['bower'], function () {
    return gulp.src(['./.tmp/vendors/**/**.js'])
        .pipe($.order([
            'jquery.js',
            'bootstrap.js'
        ]))
        .pipe($.concat('vendor.js'))
        .pipe(gulp.dest('./public/js'));
});

//images 壓縮
gulp.task('imageMin', function () {
    gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production', $.imagemin()))
        .pipe(gulp.dest('./public/images'));
});

// browserSync

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public",
            reloadDebounce: 2000
        }
    })
})

gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

gulp.task('sequence', $.sequence('clean', 'html', 'sass', 'js', 'vendorJs', 'imageMin'));
//執行
gulp.task('default', ['html', 'sass', 'js', 'bower', 'vendorJs', 'browser-sync']);
gulp.task('build', ['sequence']);