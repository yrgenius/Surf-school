const { src, dest, watch, parallel, series } = require('gulp');
const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const autoprefixer  = require('gulp-autoprefixer');
const urlify        = require('gulp-uglify-es').default;
const browserSync   = require('browser-sync').create();
// const imagemin      = require('gulp-imagemin');
// import imagemin from 'gulp-imagemin';
const imagecomp = require('compress-images');
const del = require('del');


function styles(){
    return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream()) 
}

function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(urlify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream()) 
}

// function images(){
//     gulp.src('app/images/**/*.*')
//     .pipe(imagemin())
//     .pipe(gulp.dest('dist/images'))
// }

async function images(){
    imagecomp(
        'app/images/**/*',
        'dist/images/', { compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
        //Сжатие различных типов файлов разными движками
        { jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
        { png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } }, { svg: { engine: "svgo", command: "--multipass" } }, { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
        // Обновляем страницу по завершению
        function(err, completed) { 
            if (completed === true) {
                browserSync.reload()
            }
        }
    )
}

function browsersync(){
    browserSync.init({ //инициализация Browsersync
        server: { baseDir: 'app/' }, //указываем папку сервера
        notify: false, //отключаем уведомления
        online: true, //режим работы true или false
    })
}

function build(){
    return src([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/images/**/*',
        'app/**/*.html',
        ], { base: 'app' }) 
        .pipe(dest('dist')) 
}

function watching(){
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/images/**/*', images);
}

function cleaning() {
    return del('app/images/*.jpg', { forse: true }) // Удаляем все содержимое папки "app/images/dest/"
}


exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.browsersync = browsersync;
exports.watching = watching;
exports.cleaning = cleaning;
// exports.build = series(cleaning, images, build);
// exports.default = parallel(styles, scripts, browsersync, watching);
exports.build = series( /*cleandist,*/ styles, scripts, images, build);
exports.default = parallel(cleaning, images, styles, scripts, browsersync, watching);

