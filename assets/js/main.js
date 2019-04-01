/* global maybe */

(function (document, window) {
  var navToggle = document.getElementById('nav-toggle');
  var menuNavElem = document.getElementById('menu');
  var subMenuHandlers = [];
  var isHamburgerVisible;

  function menuHandler (openFn, closeFn) {
    var isMenuOpened = false;
    var handler = {};

    function updateState (newState) {
      newState ? openFn() : closeFn();
      isMenuOpened = newState;

      return handler;
    }

    handler.click = function () {
      return isHamburgerVisible ? updateState(!isMenuOpened) : handler;
    };

    handler.open = function () {
      return updateState(true);
    };

    handler.close = function () {
      return updateState(false);
    };

    return handler;
  }

  var menuElemsWithChildren = document.querySelectorAll('#menu .pure-menu-has-children');

  menuElemsWithChildren.forEach(function (subMenuElem) {
    var menuChildren = subMenuElem.querySelectorAll('.pure-menu-children');
    var menuLink = maybe.object(subMenuElem.querySelector('.pure-menu-link'));

    function openSubMenu () {
      menuChildren.forEach(function (node) {
        node.classList.remove('hidden');
      });

      menuLink.forEach(function (node) {
        node.classList.remove('collapsed-menu-container');
        node.classList.add('expanded-menu-container');
      });
    }

    function closeSubMenu () {
      menuChildren.forEach(function (node) {
        node.classList.add('hidden');
      });

      menuLink.forEach(function (node) {
        node.classList.remove('expanded-menu-container');
        node.classList.add('collapsed-menu-container');
      });
    }

    menuLink.forEach(function (menuLink) {
      var subMenuState = menuHandler(openSubMenu, closeSubMenu);

      subMenuHandlers.push(subMenuState);
      menuLink.addEventListener('click', subMenuState.click);
    });
  });

  function openMenu () {
    document.documentElement.scrollTop = 0;

    document.body.classList.add('scroll-lock');
    navToggle.classList.add('active');
    menuNavElem.classList.remove('closed');
    menuNavElem.classList.add('opened');

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
  }

  function closeMenu () {
    menuNavElem.style.transition = null;
    menuNavElem.style.transform = null;

    document.body.classList.remove('scroll-lock');
    navToggle.classList.remove('active');
    menuNavElem.classList.remove('opened');
    menuNavElem.classList.add('closed');

    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  var hamburgerHandler = menuHandler(openMenu, closeMenu);

  navToggle.addEventListener('click', hamburgerHandler.click);

  function point (x, y) {
    return { x: x, y: y };
  }

  function touchEventToPoint (event) {
    return point(event.touches[0].clientX, event.touches[0].clientY);
  }

  var touch = {};

  touch.from = maybe.nothing;
  touch.to = maybe.nothing;

  function handleTouchStart (event) {
    touch.from = maybe.just(touchEventToPoint(event));
    touch.to = maybe.nothing;

    menuNavElem.style.transition = 'transform 0.3s';
  }

  var minSwipeOffset = 10;

  function handleTouchMove (event) {
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

        menuNavElem.style.transform = 'translateX(-' + swipeLength + 'px)';
        touch.to = maybe.just(currentPoint);
      });
  }

  function handleTouchEnd (event) {
    touch.from
      .filter(function () {
        return touch.to.nonEmpty;
      })
      .map(function (from) {
        return from.x - touch.to.get().x;
      })
      .forEach(function (swipeLength) {
        if (swipeLength > 100) {
          hamburgerHandler.close();
        } else {
          menuNavElem.style.transform = null;
        }
      });
  }

  var sizeCheckScheduled;

  function sizeCheck () {
    sizeCheckScheduled = false;
    isHamburgerVisible = navToggle.offsetHeight > 0;

    if (isHamburgerVisible) {
      subMenuHandlers.forEach(function (subMenuHandler) {
        subMenuHandler.close();
      });
    } else {
      subMenuHandlers.forEach(function (subMenuHandler) {
        subMenuHandler.open();
      });
    }
  }

  sizeCheck();

  window.addEventListener('resize', function () {
    if (sizeCheckScheduled) {
      return;
    }

    sizeCheckScheduled = true;
    setTimeout(sizeCheck, 100);
  });
})(document, window);
