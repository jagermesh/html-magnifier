(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["HTMLMagnifier"] = factory();
	else
		root["HTMLMagnifier"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
const magnifierTemplate = `
  <div class="magnifier" style="display: none;position: fixed;overflow: hidden;background-color: white;border: 1px solid #555;border-radius: 4px;z-index:10000;">
    <div class="magnifier-content" style="top: 0px;left: 0px;margin-left: 0px;margin-top: 0px;overflow: visible;position: absolute;display: block;transform-origin: left top;-moz-transform-origin: left top;-ms-transform-origin: left top;-webkit-transform-origin: left top;-o-transform-origin: left top;user-select: none;-moz-user-select: none;-webkit-user-select: none;padding-top: 0px"></div>
    <div class="magnifier-glass" style="position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;opacity: 0.0;-ms-filter: alpha(opacity=0);background-color: white;cursor: move;"></div>
  </div>
`;

class HTMLMagnifier {
  #options;

  #magnifier;
  #magnifierContent;
  #magnifierBody;

  #observerObj;
  #syncTimeout;
  #isVisible = false;
  #events = {};

  #MutationObserverCtor;
  #domChangedHandler;

  constructor(options) {
    this.#options = Object.assign({
      zoom: 2,
      shape: 'square',
      width: 200,
      height: 200,
    }, options);

    this.#MutationObserverCtor = window.MutationObserver || window.WebKitMutationObserver;

    this.#init();
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  setZoom(value) {
    this.#options.zoom = value;
    this.#setupMagnifier();
  }

  setShape(shape, width, height) {
    this.#options.shape = shape;
    if (width) {
      this.#options.width = width;
    }
    if (height) {
      this.#options.height = height;
    }
    this.#setupMagnifier();
  }

  setWidth(value) {
    this.#options.width = value;
    this.#setupMagnifier();
  }

  setHeight(value) {
    this.#options.height = value;
    this.#setupMagnifier();
  }

  getZoom() {
    return this.#options.zoom;
  }

  getShape() {
    return this.#options.shape;
  }

  getWidth() {
    return this.#options.width;
  }

  getHeight() {
    return this.#options.height;
  }

  isVisible() {
    return this.#isVisible;
  }

  on(event, callback) {
    this.#events[event] = this.#events[event] || [];
    this.#events[event].push(callback);
  }

  syncScrollBars() {
    this.#syncScrollBarsImpl();
  }

  syncContent() {
    this.#syncContentQueued();
  }

  hide() {
    this.#unBindDOMObserver();
    this.#magnifierContent.innerHTML = '';
    this.#magnifier.style.display = 'none';
    this.#isVisible = false;
  }

  show(event) {
    let left, top;
    if (event) {
      left = event.pageX - 20;
      top = event.pageY - 20;
    } else {
      left = 200;
      top = 200;
    }
    this.#setupMagnifier();
    this.#prepareContent();
    this.#setPosition(this.#magnifier, left, top);
    this.#magnifier.style.display = '';
    this.#syncViewport();
    this.#syncScrollBarsImpl();
    this.#initScrollBars();
    this.#bindDOMObserver();
    this.#isVisible = true;
  }

  // ---------------------------------------------------------------------
  // Private implementation
  // ---------------------------------------------------------------------

  #setPosition(element, left, top) {
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  #setDimensions(element, width, height) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }

  #setupMagnifier() {
    switch (this.#options.shape) {
      case 'square':
        this.#setDimensions(this.#magnifier, this.#options.width, this.#options.height);
        // Reset the rounding applied for the "circle" shape back to the
        // component's default corner radius (see magnifierTemplate below).
        this.#magnifier.style.borderRadius = '4px';
        break;
      case 'circle':
        this.#setDimensions(this.#magnifier, this.#options.width, this.#options.height);
        this.#magnifier.style.borderRadius = '50%';
        break;
    }
    this.#magnifierContent.style.WebkitTransform =
    this.#magnifierContent.style.MozTransform =
      this.#magnifierContent.style.OTransform =
        this.#magnifierContent.style.MsTransform =
          this.#magnifierContent.style.transform = `scale(${this.#options.zoom})`;
  }

  #isDescendant(parent, child) {
    let node = child;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  #syncContentImpl() {
    if (this.#isVisible) {
      this.#prepareContent();
      this.#syncViewport();
      this.#syncScrollBarsImpl();
    }
  }

  #syncContentQueued() {
    if (this.#isVisible) {
      window.clearTimeout(this.#syncTimeout);
      this.#syncTimeout = window.setTimeout(() => this.#syncContentImpl(), 100);
    }
  }

  #domChanged() {
    if (this.#isVisible) {
      this.#syncContentQueued();
    }
  }

  #unBindDOMObserver() {
    if (this.#observerObj) {
      this.#observerObj.disconnect();
      this.#observerObj = null;
    }
    if (document.removeEventListener) {
      document.removeEventListener('DOMNodeInserted', this.#domChangedHandler, false);
      document.removeEventListener('DOMNodeRemoved', this.#domChangedHandler, false);
    }
  }

  #bindDOMObserver() {
    if (this.#MutationObserverCtor) {
      this.#observerObj = new this.#MutationObserverCtor((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          if (!this.#isDescendant(this.#magnifier, mutations[i].target)) {
            try {
              this.#triggerEvent('checkMutation', mutations[i]);
              this.#domChanged();
              break;
            } catch {
              //
            }
          }
        }
      });
      this.#observerObj.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          'class',
          'width',
          'height',
          'style',
        ],
        attributeOldValue: true,
      });
    } else
    if (document.addEventListener) {
      document.addEventListener('DOMNodeInserted', this.#domChangedHandler, false);
      document.addEventListener('DOMNodeRemoved', this.#domChangedHandler, false);
    }
  }

  #triggerEvent(event, data) {
    const handlers = this.#events[event];
    if (handlers) {
      for (let i = 0; i < handlers.length; i++) {
        handlers[i].call(this, data);
      }
    }
  }

  #syncViewport() {
    const x1 = this.#magnifier.offsetLeft;
    const y1 = this.#magnifier.offsetTop;
    const x2 = document.body.scrollLeft;
    const y2 = document.body.scrollTop;
    const left = -x1 * this.#options.zoom - x2 * this.#options.zoom;
    const top = -y1 * this.#options.zoom - y2 * this.#options.zoom;
    this.#setPosition(this.#magnifierContent, left, top);
    this.#triggerEvent('viewPortChanged', this.#magnifierBody);
  }

  #removeSelectors(container, selector) {
    const elements = container.querySelectorAll(selector);
    if (elements.length > 0) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }
  }

  #prepareContent() {
    this.#magnifierContent.innerHTML = '';
    const bodyOriginal = document.body;
    const bodyCopy = bodyOriginal.cloneNode(true);
    const color = bodyOriginal.style.backgroundColor;
    if (color) {
      this.#magnifier.style.backgroundColor = color;
    }
    bodyCopy.style.cursor = 'auto';
    bodyCopy.style.paddingTop = '0px';
    bodyCopy.setAttribute('unselectable', 'on');
    const canvasOriginal = bodyOriginal.querySelectorAll('canvas');
    const canvasCopy = bodyCopy.querySelectorAll('canvas');
    if (canvasOriginal.length > 0) {
      if (canvasOriginal.length === canvasCopy.length) {
        for (let i = 0; i < canvasOriginal.length; i++) {
          let ctx = canvasCopy[i].getContext('2d');
          try {
            ctx.drawImage(canvasOriginal[i], 0, 0);
          } catch {
            //
          }
        }
      }
    }
    this.#removeSelectors(bodyCopy, 'script');
    this.#removeSelectors(bodyCopy, 'audio');
    this.#removeSelectors(bodyCopy, 'video');
    this.#removeSelectors(bodyCopy, '.magnifier');
    this.#triggerEvent('prepareContent', bodyCopy);
    this.#magnifierContent.appendChild(bodyCopy);
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    this.#setDimensions(this.#magnifierContent, width, height);
    this.#magnifierBody = this.#magnifierContent.querySelector('body');
    this.#triggerEvent('contentUpdated', this.#magnifierBody);
  }

  #initScrollBars() {
    this.#triggerEvent('initScrollBars', this.#magnifierBody);
  }

  #syncScroll(ctrl) {
    const selectors = [];
    if (ctrl.getAttribute) {
      if (ctrl.getAttribute('id')) {
        selectors.push('#' + ctrl.getAttribute('id'));
      }
      if (ctrl.className) {
        selectors.push('.' + ctrl.className.split(' ').join('.'));
      }
      for (let i = 0; i < selectors.length; i++) {
        let t = this.#magnifierBody.querySelectorAll(selectors[i]);
        if (t.length == 1) {
          t[0].scrollTop = ctrl.scrollTop;
          t[0].scrollLeft = ctrl.scrollLeft;
          return true;
        }
      }
    } else
    if (ctrl == document) {
      this.#syncViewport();
    }
    return false;
  }

  #syncScrollBarsImpl(e) {
    if (this.#isVisible) {
      if (e && e.target) {
        this.#syncScroll(e.target);
      } else {
        let scrolled = [];
        let elements = document.querySelectorAll('div');
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].scrollTop > 0) {
            scrolled.push(elements[i]);
          }
        }
        for (let i = 0; i < scrolled.length; i++) {
          if (!this.#isDescendant(this.#magnifier, scrolled[i])) {
            this.#syncScroll(scrolled[i]);
          }
        }
      }
      this.#triggerEvent('syncScrollBars', this.#magnifierBody);
    }
  }

  #makeDraggable(ctrl, options) {
    let dragObject = null;

    options = options || {};
    options.exclude = [ 'INPUT', 'TEXTAREA', 'SELECT', 'A', 'BUTTON' ];

    const dragHandler = options.handler ? ctrl.querySelector(options.handler) : ctrl;

    let pos_y, pos_x, ofs_x, ofs_y;

    ctrl.style.cursor = 'move';

    const downHandler = (e) => {
      const target = e.target || e.srcElement;
      const parent = target.parentNode;

      if (target && (options.exclude.indexOf(target.tagName.toUpperCase()) == -1)) {
        if (!parent || (options.exclude.indexOf(parent.tagName.toUpperCase()) == -1)) { // img in a
          dragObject = ctrl;

          const pageX = e.pageX || e.touches[0].pageX;
          const pageY = e.pageY || e.touches[0].pageY;

          ofs_x = dragObject.getBoundingClientRect().left - dragObject.offsetLeft;
          ofs_y = dragObject.getBoundingClientRect().top - dragObject.offsetTop;

          pos_x = pageX - (dragObject.getBoundingClientRect().left + document.body.scrollLeft);
          pos_y = pageY - (dragObject.getBoundingClientRect().top + document.body.scrollTop);

          e.preventDefault();
        }
      }
    };

    const moveHandler = (e) => {
      if (dragObject !== null) {
        const pageX = e.pageX || e.touches[0].pageX;
        const pageY = e.pageY || e.touches[0].pageY;
        const left = pageX - pos_x - ofs_x - document.body.scrollLeft;
        const top = pageY - pos_y - ofs_y - document.body.scrollTop;

        this.#setPosition(dragObject, left, top);
        if (options.ondrag) {
          options.ondrag.call(e);
        }
      }
    };

    const upHandler = () => {
      if (dragObject !== null) {
        dragObject = null;
      }
    };

    dragHandler.addEventListener('mousedown', (e) => {
      downHandler(e);
    });

    window.addEventListener('mousemove', (e) => {
      moveHandler(e);
    });

    window.addEventListener('mouseup', (e) => {
      upHandler(e);
    });

    dragHandler.addEventListener('touchstart', (e) => {
      downHandler(e);
    });

    window.addEventListener('touchmove', (e) => {
      moveHandler(e);
    });

    window.addEventListener('touchend', (e) => {
      upHandler(e);
    });
  }

  #init() {
    this.#domChangedHandler = () => this.#domChanged();

    const div = document.createElement('div');
    div.innerHTML = magnifierTemplate;
    this.#magnifier = div.querySelector('.magnifier');
    document.body.appendChild(this.#magnifier);
    this.#magnifierContent = this.#magnifier.querySelector('.magnifier-content');
    if (window.addEventListener) {
      window.addEventListener('resize', () => this.#syncContentImpl(), false);
      window.addEventListener('scroll', (e) => this.#syncScrollBarsImpl(e), true);
    }
    this.#makeDraggable(this.#magnifier, {
      ondrag: () => this.#syncViewport(),
    });
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HTMLMagnifier);

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "default", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=html-magnifier.js.map