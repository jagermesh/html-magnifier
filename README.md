# JavaScript content magnifier.

Simple, lightweight pure JavaScript component that adds a magnifying glass functionality to any web page content.

## Demo

Open [`demo.html`](./demo.html) directly in your browser (no build step needed) for an interactive demo with buttons for every method described below.

## Installation

### npm / bundler (ES module)

~~~
npm install @jagermesh/html-magnifier
~~~

~~~js
import HTMLMagnifier from '@jagermesh/html-magnifier';

const magnifier = new HTMLMagnifier();
~~~

### Plain `<script>` tag

Include the pre-built UMD bundle from `dist/`, or from a CDN:

~~~html
<script src="https://cdn.jsdelivr.net/npm/@jagermesh/html-magnifier/dist/html-magnifier.min.js"></script>
<script>
  var magnifier = new window.HTMLMagnifier();
</script>
~~~

## Usage:

1) Create magnifier instance

~~~js
const magnifier = new HTMLMagnifier();
~~~

2) Show when needed

~~~js
magnifier.show();
~~~

3) Hide when not needed

~~~js
magnifier.hide();
~~~

That's all.

There are also some settings which you can pass to constructor

~~~js
{
  zoom: 2,
  shape: 'square', // 'square' | 'circle'
  width: 200,
  height: 200,
}
~~~

Or set afterwards

~~~js
magnifier.setZoom(2);
magnifier.setShape('circle');
magnifier.setWidth(300);
magnifier.setHeight(300);
~~~

You can also read the current settings and visibility state back:

~~~js
magnifier.getZoom();
magnifier.getShape();
magnifier.getWidth();
magnifier.getHeight();
magnifier.isVisible();
~~~

There are also a couple of events which you may find useful. Handlers receive a plain DOM node (no jQuery required):

1) You may want to remove some elements from magnification:

~~~js
magnifier.on('prepareContent', (magnifierContent) => {
  magnifierContent.querySelectorAll('.some-selector').forEach((el) => el.remove());
});
~~~

2) In some cases you may want to sync scroll positions for scrollable areas:

~~~js
magnifier.on('syncScrollBars', (magnifierContent) => {
  const source = document.querySelector('div.scrollable-area');
  const target = magnifierContent.querySelector('div.scrollable-area');
  if (source && target) {
    target.scrollTop = source.scrollTop;
  }
});
~~~

3) You can also force a re-sync of the magnified content or scroll positions at any time:

~~~js
magnifier.syncContent();
magnifier.syncScrollBars();
~~~

Have fun. Send PR if you find any glitches or want to make improvements.

:)
