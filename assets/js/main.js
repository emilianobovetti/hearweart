(function (document, window) {

    var navToggle = document.getElementById('nav-toggle');

    var menu = document.getElementById('menu');

    var menuOpened = false;

    var point = function (x, y) {
        return { x: x, y: y };
    };

    var touchEventToPoint = function (event) {
        return point(event.touches[0].clientX, event.touches[0].clientY);
    };

    var touch = {};
    touch.from = maybe.nothing;
    touch.to = maybe.nothing;

    var handleTouchStart = function (event) {
        touch.from = maybe.just(touchEventToPoint(event));
        touch.to = maybe.nothing;

        menu.style.transition = 'transform 0.3s';
    };

    var minSwipeOffset = 10;

    var handleTouchMove = function (event) {
        var currentPoint = touchEventToPoint(event);

        touch.to
            .map(function (to) {
                return Math.abs(to.x - currentPoint.x);
            })
            .orElse(minSwipeOffset + 1)
            .filter(function (swipeOffset) {
                return swipeOffset > minSwipeOffset && touch.from.nonEmpty;
            })
            .forEach(function () {
                var swipeLength = touch.from.get().x - currentPoint.x;

                if (swipeLength < 0) {
                    swipeLength = 0;
                }

                menu.style.transform = 'translateX(-' + swipeLength + 'px)';
                touch.to = maybe.just(currentPoint);
            });
    };

    var handleTouchEnd = function (event) {
        touch.from
            .filter(function () {
                return touch.to.nonEmpty;
            })
            .map(function (from) {
                return from.x - touch.to.get().x;
            })
            .forEach(function (swipeLength) {
                if (swipeLength > 100) {
                    closeMenu();
                } else {
                    menu.style.transform = null;
                }
            });
    };

    var openMenu = function () {
        document.documentElement.scrollTop = 0;

        document.body.classList.add('scroll-lock');
        navToggle.classList.add('active');
        menu.classList.remove('closed');
        menu.classList.add('opened');
        menuOpened = true;

        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchend', handleTouchEnd, false);
    };

    var closeMenu = function () {
        menu.style.transition = null;
        menu.style.transform = null;

        document.body.classList.remove('scroll-lock');
        navToggle.classList.remove('active');
        menu.classList.remove('opened');
        menu.classList.add('closed');
        menuOpened = false;

        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };

    navToggle.addEventListener('click', function (event) {
        menuOpened ? closeMenu() : openMenu();
    });

})(document, window);
