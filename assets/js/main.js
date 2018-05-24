(function (document, window) {

    var navToggle = document.getElementById('nav-toggle');

    var menuElement = document.getElementById('menu');

    var stateHandler = function (openFn, closeFn) {
        var opened = false;

        var handler = {};

        handler.open = function () {
            openFn();
            opened = true;

            return handler;
        };

        handler.close = function () {
            closeFn();
            opened = false;

            return handler;
        };

        handler.toggle = function () {
            opened ? closeFn() : openFn();
            opened = ! opened;

            return handler;
        };

        return handler;
    };

    var openMenu = function () {
        document.documentElement.scrollTop = 0;

        document.body.classList.add('scroll-lock');
        navToggle.classList.add('active');
        menuElement.classList.remove('closed');
        menuElement.classList.add('opened');

        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchend', handleTouchEnd, false);
    };

    var closeMenu = function () {
        menuElement.style.transition = null;
        menuElement.style.transform = null;

        document.body.classList.remove('scroll-lock');
        navToggle.classList.remove('active');
        menuElement.classList.remove('opened');
        menuElement.classList.add('closed');

        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };

    var menu = stateHandler(openMenu, closeMenu);

    navToggle.addEventListener('click', function (event) {
        menu.toggle();
    });

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

        menuElement.style.transition = 'transform 0.3s';
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

                menuElement.style.transform = 'translateX(-' + swipeLength + 'px)';
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
                    menu.close();
                } else {
                    menuElement.style.transform = null;
                }
            });
    };

    var filterChildNodes = function (element, filterFn) {
        return maybe.object(element.childNodes)
            .map(function (childNodes) {
                return [].filter.call(childNodes, filterFn);
            });
    };

    var filterChildNodesByClass = function (element, classFilter) {
        return filterChildNodes(element, function (child) {
            var className = maybe.string(child.className).toString();

            return className.indexOf(classFilter) >= 0;
        });
    };

    var getFirst = function (array) {
        return array[0];
    };

    document
        .querySelectorAll('#menu .pure-menu-has-children')
        .forEach(function (subMenuElement) {
            var menuChildren = filterChildNodesByClass(subMenuElement, 'pure-menu-children')
                    .map(getFirst);

            var menuLink = filterChildNodesByClass(subMenuElement, 'pure-menu-link')
                    .map(getFirst);

            var openSubMenu = function () {
                menuChildren.forEach(function (node) {
                    node.classList.remove('hidden');
                });

                menuLink.forEach(function (node) {
                    node.classList.remove('collapsed-menu-container');
                    node.classList.add('expanded-menu-container');
                });
            };

            var closeSubMenu = function () {
                menuChildren.forEach(function (node) {
                    node.classList.add('hidden');
                });

                menuLink.forEach(function (node) {
                    node.classList.remove('expanded-menu-container');
                    node.classList.add('collapsed-menu-container');
                });
            };

            var subMenu = stateHandler(openSubMenu, closeSubMenu).close();

            subMenuElement.addEventListener('click', function (event) {
                subMenu.toggle();
            });
        });

})(document, window);
