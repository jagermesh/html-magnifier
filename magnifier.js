/* global MutationObserver */

function Magnifier(options) {

  var _this = this;

  options = options || {};

  var zoom  = options.zoom || 2;
  var shape = options.shape || 'square';
  var size  = options.size || 200;

  var magnifierTemplate = '<div class="magnifier" style="display: none;position: fixed;overflow: hidden;background-color: white;border: 1px solid #555;border-radius: 4px;z-index:10000;">' +
                          '  <div class="magnifier-content" style="top: 0px;left: 0px;margin-left: 0px;margin-top: 0px;overflow: visible;position: absolute;display: block;transform-origin: left top;-moz-transform-origin: left top;-ms-transform-origin: left top;-webkit-transform-origin: left top;-o-transform-origin: left top;user-select: none;-moz-user-select: none;-webkit-user-select: none;padding-top: 0px"></div>' +
                          '  <div class="magnifier-glass" style="position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;opacity: 0.0;-ms-filter: alpha(opacity=0);background-color: white;cursor: move;"></div>' +
                          '</div>';

  var magnifier, magnifierContent, magnifierDom;
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observerObj;
  var syncTimeout;
  var events = {};
  var isVisible = false;

  function setupMagnifier() {
    switch(shape) {
      case 'square':
        magnifier.css({ 'width': size + 'px'
                      , 'height': size + 'px'
                      });
        break;
      case 'circle':
        magnifier.css({ 'width': size + 'px'
                      , 'height': size + 'px'
                      , 'border-radius': '50%'
                      });
        break;
    }
    magnifierContent.css({ 'transform': 'scale(' + zoom + ')'
                         , '-moz-transform': 'scale(' + zoom + ')'
                         , '-webkit-transform': 'scale(' + zoom + ')'
                         , '-ms-transform': 'scale(' + zoom + ')'
                         , '-o-transform': 'scale(' + zoom + ')'
                         });
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
          if (!isDescendant(magnifierDom, mutations[i].target)) {
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
    var x1 = magnifier.position().left;
    var y1 = magnifier.position().top;
    magnifierContent.css('left', -x1*zoom);
    magnifierContent.css('top', -y1*zoom);
    triggerEvent('viewPortChanged', magnifierContent.find('body'));
  }

  function prepareContent() {
    magnifierContent.html('');
    var b = $('body').clone();
    var color = $('body').css('background-color');
    if (color) {
      magnifier.css('background-color', color);
    }
    b.css('cursor', 'auto');
    b.css('padding-top', '0px');
    b.attr('unselectable', 'on');
    $('script', b).remove();
    $('.magnifier', b).remove();
    triggerEvent('prepareContent', b);
    magnifierContent.append(b);
    magnifierContent.css('width', $(document).width());
    magnifierContent.css('height', $(document).height());
    triggerEvent('contentUpdated', magnifierContent.find('body'));
  }

  function initScrollBars() {
    var mb = magnifierContent.find('body');
    triggerEvent('initScrollBars', mb);
  }

  function syncScrollTop(ctrl, mb) {
    var selectors = [];
    if (ctrl.getAttribute) {
      if (ctrl.getAttribute('id')) {
        selectors.push('#' + ctrl.getAttribute('id'));
      }
      if (ctrl.className) {
        selectors.push('.' + ctrl.className.split(' ').join('.'));
      }
      for(var i = 0; i < selectors.length; i++) {
        var t = $(selectors[i], mb);
        if (t.length == 1) {
          t[0].scrollTop = ctrl.scrollTop;
          return true;
        }
      }
    }
    return false;
  }

  function syncScrollBars(e) {
    if (isVisible) {
      var mb = magnifierContent.find('body');
      if (e && e.target) {
        syncScrollTop(e.target, mb);
      } else {
        var scrolled = [];
        $('div').each(function() {
          if (this.scrollTop > 0) {
            scrolled.push(this);
          }
        });
        for(var i = 0; i < scrolled.length; i++) {
          if (!isDescendant(magnifierDom, scrolled[i])) {
            syncScrollTop(scrolled[i], mb);
          }
        }
      }
      triggerEvent('syncScrollBars', mb);
    }
  }

  function init() {
    magnifier = $(magnifierTemplate);
    $('body').append(magnifier);
    magnifierContent = magnifier.find('.magnifier-content');
    magnifierDom = magnifier[0];
    if (window.addEventListener) {
      window.addEventListener('resize', syncContent, false);
      window.addEventListener('scroll', syncScrollBars, true);
    }
    magnifier.draggable({ drag: syncViewport});
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
    magnifierContent.html('');
    magnifier.hide();
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
    magnifier.css({ 'left': left
                  , 'top': top
                  });
    magnifier.show();
    syncViewport();
    syncScrollBars();
    initScrollBars();
    isVisible = true;
  };

  init();

  return _this;

}