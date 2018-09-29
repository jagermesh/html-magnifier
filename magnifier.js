/* global MutationObserver */

function Magnifier(options) {

  var _this = this;

  options = options || {};

  var zoom  = options.zoom || 2;
  var shape = options.shape || 'square';
  var size  = options.size || 200;

  var magnifierTemplate = '<div draggable="true" class="magnifier" style="display: none;position: fixed;overflow: hidden;background-color: white;border: 1px solid #555;border-radius: 4px;z-index:10000;">' +
                          '  <div class="magnifier-content" style="top: 0px;left: 0px;margin-left: 0px;margin-top: 0px;overflow: visible;position: absolute;display: block;transform-origin: left top;-moz-transform-origin: left top;-ms-transform-origin: left top;-webkit-transform-origin: left top;-o-transform-origin: left top;user-select: none;-moz-user-select: none;-webkit-user-select: none;padding-top: 0px"></div>' +
                          '  <div class="magnifier-glass" style="position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;opacity: 0.0;-ms-filter: alpha(opacity=0);background-color: white;cursor: move;"></div>' +
                          '</div>';

  var magnifier, magnifierContent;
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observerObj;
  var syncTimeout;
  var events = {};
  var isVisible = false;
  var magnifierBody;

  function setPosition(element, left, top) {
    element.style.left = left + 'px';
    element.style.top = top + 'px';
  }

  function setDimensions(element, width, height) {
    element.style.width = width + 'px';
    element.style.height = height + 'px';
  }

  function setupMagnifier() {
    switch(shape) {
      case 'square':
        setDimensions(magnifier, size, size);
        break;
      case 'circle':
        setDimensions(magnifier, size, size);
        magnifier.style.borderRadius = '50%';
        break;
    }
    magnifierContent.style.WebkitTransform =
      magnifierContent.style.MozTransform =
        magnifierContent.style.OTransform =
          magnifierContent.style.MsTransform =
            magnifierContent.style.transform = 'scale(' + zoom + ')';
  }

  function isDescendant(parent, child) {
    var node = child;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function syncContent() {
    prepareContent();
    syncViewport();
    syncScrollBars();
  }

  function syncContentQueued() {
    window.clearTimeout(syncTimeout);
    syncTimeout = window.setTimeout(syncContent, 100);
  }

  function domChanged() {
    if (isVisible) {
      syncContentQueued();
    }
  }

  function unBindDOMObserver() {
    if (observerObj) {
      observerObj.disconnect();
      observerObj = null;
    }
    if (document.removeEventListener) {
      document.removeEventListener('DOMNodeInserted', domChanged, false);
      document.removeEventListener('DOMNodeRemoved', domChanged, false);
    }
  }

  function bindDOMObserver() {
    if (MutationObserver) {
      observerObj = new MutationObserver(function(mutations, observer) {
        for(var i = 0; i < mutations.length; i++) {
          if (!isDescendant(magnifier, mutations[i].target)) {
            domChanged();
            break;
          }
        }
      });
      observerObj.observe(document, {childList:true, subtree:true, attributes:true});
    } else
    if (document.addEventListener) {
      document.addEventListener('DOMNodeInserted', domChanged, false);
      document.addEventListener('DOMNodeRemoved', domChanged, false);
    }
  }

  function triggerEvent(event, data) {
    var handlers = events[event];
    if (handlers) {
      for(var i = 0; i < handlers.length; i++) {
        handlers[i].apply(_this, data);
      }
    }
  }

  function syncViewport() {
    var x1 = magnifier.offsetLeft;
    var y1 = magnifier.offsetTop;
    var x2 = document.body.scrollLeft;
    var y2 = document.body.scrollTop;
    var left = -x1*zoom - x2*zoom;
    var top = -y1*zoom - y2*zoom;
    setPosition(magnifierContent, left, top);
    triggerEvent('viewPortChanged', magnifierBody);
  }

  function removeSelectors(container, selector) {
    var elements = container.querySelectorAll(selector);
    if (elements.length > 0) {
      for(var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }
  }

  function prepareContent() {
    magnifierContent.innerHTML = '';
    var bodyCopy = document.body.cloneNode(true);
    var color = document.body.style.backgroundColor;
    if (color) {
      magnifier.css('background-color', color);
    }
    bodyCopy.style.cursor = 'auto';
    bodyCopy.style.paddingTop = '0px';
    bodyCopy.setAttribute('unselectable', 'on');
    removeSelectors(bodyCopy, 'script');
    removeSelectors(bodyCopy, '.magnifier');
    triggerEvent('prepareContent', bodyCopy);
    magnifierContent.appendChild(bodyCopy);
    var width = document.body.clientWidth;
    var height = document.body.clientHeight;
    setDimensions(magnifierContent, width, height);
    magnifierBody = magnifierContent.querySelector('body');
    triggerEvent('contentUpdated', magnifierBody);
  }

  function initScrollBars() {
    triggerEvent('initScrollBars', magnifierBody);
  }

  function syncScroll(ctrl) {
    var selectors = [];
    if (ctrl.getAttribute) {
      if (ctrl.getAttribute('id')) {
        selectors.push('#' + ctrl.getAttribute('id'));
      }
      if (ctrl.className) {
        selectors.push('.' + ctrl.className.split(' ').join('.'));
      }
      for(var i = 0; i < selectors.length; i++) {
        var t = magnifierBody.querySelectorAll(selectors[i]);
        if (t.length == 1) {
          t[0].scrollTop  = ctrl.scrollTop;
          t[0].scrollLeft = ctrl.scrollLeft;
          return true;
        }
      }
    } else
    if (ctrl == document) {
      syncViewport();
    }
    return false;
  }

  function syncScrollBars(e) {
    if (isVisible) {
      if (e && e.target) {
        syncScroll(e.target);
      } else {
        var scrolled = [], i;
        var elements = document.querySelectorAll('div');
        for(i = 0; i < elements.length; i++) {
          if (elements[i].scrollTop > 0) {
            scrolled.push(elements[i]);
          }
        }
        for(i = 0; i < scrolled.length; i++) {
          if (!isDescendant(magnifier, scrolled[i])) {
            syncScroll(scrolled[i]);
          }
        }
      }
      triggerEvent('syncScrollBars', magnifierBody);
    }
  }

  function setupDrag(ctrl, ondrag) {

    var dragObject = null;

    var drg_h, drg_w, pos_y, pos_x;

    ctrl.style.cursor = 'move';

    ctrl.addEventListener('mousedown', function(e) {
      var target = e.target || e.srcElement;
      dragObject = this;

      drg_h = dragObject.offsetHeight;
      drg_w = dragObject.offsetWidth;
      pos_y = dragObject.getBoundingClientRect().top  + document.body.scrollTop + drg_h - e.pageY;
      pos_x = dragObject.getBoundingClientRect().left + document.body.scrollLeft + drg_w - e.pageX;

      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (dragObject !== null) {
        var left = e.pageX + pos_x - drg_w - document.body.scrollLeft;
        var top = e.pageY + pos_y - drg_h - document.body.scrollTop;
        setPosition(dragObject, left, top);
        ondrag();
      }
    });

    window.addEventListener('mouseup', function() {
      if (dragObject !== null) {
        dragObject = null;
      }
    });

    return this;

  }

  function init() {
    var div = document.createElement('div');
    div.innerHTML = magnifierTemplate;
    magnifier = div.querySelector('.magnifier');
    document.body.appendChild(magnifier);
    magnifierContent = magnifier.querySelector('.magnifier-content');
    if (window.addEventListener) {
      window.addEventListener('resize', syncContent, false);
      window.addEventListener('scroll', syncScrollBars, true);
    }
    setupDrag(magnifier, syncViewport);
  }

  _this.setZoom = function(zoom) {
    zoom = zoom;
    setupMagnifier();
  };

  _this.setShape = function(shape, size) {
    shape = shape;
    if (size) {
      size = size;
    }
    setupMagnifier();
  };

  _this.setSize = function(size) {
    size = size;
    setupMagnifier();
  };

  _this.getZoom = function() {
    return zoom;
  };

  _this.getShape = function() {
    return shape;
  };

  _this.getSize = function() {
    return size;
  };

  _this.isVisible = function() {
    return isVisible;
  };

  _this.on = function(event, callback) {
    events[event] = events[event] || [];
    events[event].push(callback);
  };

  _this.syncScrollBars = function(event) {
    syncScrollBars();
  };

  _this.syncContent = function(event) {
    if (isVisible) {
      syncContentQueued();
    }
  };

  _this.hide = function(event) {
    unBindDOMObserver();
    magnifierContent.innerHTML = '';
    magnifier.style.display = 'none';
    isVisible = false;
  };

  _this.show = function(event) {
    var left, top;
    if (event) {
      left = event.pageX - 20;
      top = event.pageY - 20;
    } else {
      left = 200;
      top = 200;
    }
    setupMagnifier();
    prepareContent();
    bindDOMObserver();
    setPosition(magnifier, left, top);
    magnifier.style.display = '';
    syncViewport();
    syncScrollBars();
    initScrollBars();
    isVisible = true;
  };

  init();

  return _this;

}