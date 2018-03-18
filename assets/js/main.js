
var app = {};

app.navToggle = document.getElementById('nav-toggle');

app.menu = document.getElementById('menu');

app.menuOpened = false;

app.point = function (x, y) {
    return { x: x, y: y };
};

app.touchEventToPoint = function (event) {
    return app.point(event.touches[0].clientX, event.touches[0].clientY);
};

app.viewPortHeight = function () {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

app.viewPortWidth = function () {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
};

app.touch = {};
app.touch.from = maybe.nothing;
app.touch.to = maybe.nothing;

app.handleTouchStart = function (event) {
    app.touch.from = maybe.just(app.touchEventToPoint(event));
    app.touch.to = maybe.nothing;

    app.menu.style.transition = 'transform 0.3s';
};

app.handleTouchMove = function (event) {
    var currentPoint = app.touchEventToPoint(event);

    event.preventDefault();

    app.touch.from
        .filter(function () {
            return Math.abs(currentPoint.x - app.touch.to.getOrElse({x: 0}).x) > 10;
        })
        .map(function () {
            return app.touch.from.get().x - currentPoint.x;
        })
        .forEach(function (translation) {
            app.menu.style.transform = 'translateX(-' + translation + 'px)';
            app.touch.to = maybe.just(currentPoint);
        });
};

app.handleTouchEnd = function (event) {
    app.touch.from
        .filter(function () {
            return app.touch.to.nonEmpty;
        })
        .map(function () {
            return Math.abs(app.touch.from.get().x - app.touch.to.get().x);
        })
        .forEach(function (swipeLength) {
            if (swipeLength > 100) {
                app.closeMenu();
            } else {
                app.menu.style.transform = null;
            }
        });
};

app.openMenu = function () {
    document.documentElement.scrollTop = 0;

    document.body.classList.add('scroll-lock');
    app.navToggle.classList.add('active');
    app.menu.classList.remove('closed');
    app.menu.classList.add('opened');
    app.menuOpened = true;

    document.addEventListener('touchstart', app.handleTouchStart, false);
    document.addEventListener('touchmove', app.handleTouchMove, false);
    document.addEventListener('touchend', app.handleTouchEnd, false);
};

app.closeMenu = function () {
    app.menu.style.transition = null;
    app.menu.style.transform = null;

    document.body.classList.remove('scroll-lock');
    app.navToggle.classList.remove('active');
    app.menu.classList.remove('opened');
    app.menu.classList.add('closed');
    app.menuOpened = false;

    document.removeEventListener('touchstart', app.handleTouchStart);
    document.removeEventListener('touchmove', app.handleTouchMove);
    document.removeEventListener('touchend', app.handleTouchEnd);
};

app.navToggle.addEventListener('click', function (event) {
    app.menuOpened ? app.closeMenu() : app.openMenu();
});
