var gulp = require('gulp');
var concat = require('gulp-concat');


gulp.task('default', function () {
    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NetworkAdapter.js",
                "public/js/form.js"
            ])
            .pipe(concat('form.js'))
            .pipe(gulp.dest('public/dist'));

    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NotificationBuilder.js",
                "public/js/gameSelect.js",
                "public/js/material.min.js"
            ])
            .pipe(concat('gameselect.js'))
            .pipe(gulp.dest('public/dist'));

    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NotificationBuilder.js",
                "public/js/svgFactory.js",
                "public/js/GameController.js",
                "public/js/NetworkAdapter.js",
                "public/js/GameSocket.js",
                "public/js/NetworkGameController.js",
                "public/js/AIGameController.js",
                "public/js/HotSeatGameController.js",
                "public/js/gameboard.js",
                "public/js/gamespace.js",
                "public/js/view.js",
                "public/js/GameViewPage.js"
            ])
            .pipe(concat('gameview.js'))
            .pipe(gulp.dest('public/dist'));

    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NetworkAdapter.js",
                "public/js/index.js"
            ])
            .pipe(concat('login.js'))
            .pipe(gulp.dest('public/dist'));

    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NetworkAdapter.js",
                "public/js/NotificationBuilder.js",
                "public/js/multiplayer_lobby.js"
            ])
            .pipe(concat('multiplayerlobby.js'))
            .pipe(gulp.dest('public/dist'));

    gulp.src([
                "public/js/jquery.min.js",
                "public/js/socket.io.js",
                "public/js/NetworkAdapter.js",
                "public/js/profileView.js",
                "public/js/material.min.js"
            ])
            .pipe(concat('profile.js'))
            .pipe(gulp.dest('public/dist'));

})
