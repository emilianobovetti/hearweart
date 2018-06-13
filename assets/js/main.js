/* global maybe */

(function (document, window) {
  var navToggle = document.getElementById('nav-toggle');

  var menuElement = document.getElementById('menu');

  function stateHandler (openFn, closeFn) {
    var lastStateChange = 0;
    var opened = false;
    var handler = {};

    /*
     * `click` and `mouseenter` events could be fired together
     * in that case we have to ensure at least 100 ms are passed
     * before to update the state again.
     */
    function updateState (newState) {
      var now = Date.now();

      if (now - lastStateChange > 100) {
        newState ? openFn() : closeFn();
        opened = newState;
        lastStateChange = now;
      }

      return handler;
    }

    handler.open = function () {
      return updateState(true);
    }

    handler.close = function () {
      return updateState(false);
    }

    handler.toggle = function () {
      return opened ? handler.close() : handler.open();
    }

    return handler;
  }

  function filterChildNodes (element, filterFn) {
    return maybe.object(element.childNodes)
      .map(function (childNodes) {
        return [].filter.call(childNodes, filterFn);
      });
  }

  function filterChildNodesByClass (element, classFilter) {
    return filterChildNodes(element, function (child) {
      var className = maybe.string(child.className).toString();

      return className.indexOf(classFilter) >= 0;
    });
  }

  function getFirst (array) {
    return array[0];
  }

  document.querySelectorAll('#menu .pure-menu-has-children')
    .forEach(function (subMenuElement) {
      var menuChildren = filterChildNodesByClass(subMenuElement, 'pure-menu-children')
        .map(getFirst);

      var menuLink = filterChildNodesByClass(subMenuElement, 'pure-menu-link')
        .map(getFirst);

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

      var subMenu = stateHandler(openSubMenu, closeSubMenu).close();

      subMenuElement.addEventListener('click', function (event) {
        subMenu.toggle();
      });

      subMenuElement.addEventListener('mouseenter', function (event) {
        subMenu.open();
      });

      subMenuElement.addEventListener('mouseleave', function (event) {
        subMenu.close();
      });

      return subMenu;
    });

  function openMenu () {
    document.documentElement.scrollTop = 0;

    document.body.classList.add('scroll-lock');
    navToggle.classList.add('active');
    menuElement.classList.remove('closed');
    menuElement.classList.add('opened');

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
  }

  function closeMenu () {
    menuElement.style.transition = null;
    menuElement.style.transform = null;

    document.body.classList.remove('scroll-lock');
    navToggle.classList.remove('active');
    menuElement.classList.remove('opened');
    menuElement.classList.add('closed');

    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }

  var menu = stateHandler(openMenu, closeMenu);

  navToggle.addEventListener('click', function (event) {
    menu.toggle();
  });

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

    menuElement.style.transition = 'transform 0.3s';
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

        menuElement.style.transform = 'translateX(-' + swipeLength + 'px)';
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
          menu.close();
        } else {
          menuElement.style.transform = null;
        }
      });
  }
})(document, window);
