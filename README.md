# Specsray

A one-click overlay that shows every measurement on a page at once: dimensions, spacing (with actual pixel values), distances between siblings, fonts, colors, and flex/grid gaps. No hovering over one element at a time, no opening dev tools, no guessing.

Toggle it on, read the numbers, toggle it off. That's the whole workflow.

**Install:** [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/specsray/) or drag the [bookmarklet](#bookmarklet) from `install.html`.

## Two ways to use it

### Bookmarklet

Open `install.html` in a browser, drag the button to your bookmarks bar, done. Click the bookmark on any page to toggle the overlay, click it again to remove it. Works in any browser, no install, no permissions.

### Browser extension

The `extension/` folder is a MV3 extension that wraps the same overlay in a toolbar button.

- Chrome (or any Chromium browser): go to `chrome://extensions`, enable Developer mode, Load unpacked, pick the `extension/` folder.
- Firefox: install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/specsray/). You can also load it temporarily via `about:debugging#/runtime/this-firefox` for testing, or self-sign a build with `web-ext sign` for a permanent install outside the store.

See `extension/README.md` for the full install and signing notes.

## Build

`overlay.js` is the source of truth. Everything else is generated from it:

```
node build.mjs
```

This minifies `overlay.js` into `overlay.min.js` (via terser), builds `bookmarklet.txt`, patches the bookmarklet link and textarea inside `install.html`, and copies the overlay into `extension/overlay.js`.

To package the extension into store-ready zips (separate manifests for Firefox and Chrome, since they don't agree on how `background` should be declared):

```
node extension/build.mjs
```

Zips land in `extension/web-ext-artifacts/` (gitignored).

## Development and verification

`fixtures/` holds a small set of layout edge cases (body margins, relative margins, edge-flush elements, exact viewport sizing) plus a measurement harness (`measure.js`, `run-fixture.js`) used to check one guarantee: the overlay never changes page geometry.

It works by snapshotting scroll dimensions and every element's bounding rect before injecting the overlay, injecting it, then snapshotting again and diffing. If the overlay adds a pixel of scroll or nudges a single rect, the diff shows it. This matters because an overlay that's supposed to measure a page has no business changing what it measures.

`test.html` is a general playground page for manually exercising all the layers together.

## License

MIT, see `LICENSE`.
