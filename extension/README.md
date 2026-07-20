# Specsray - browser extension

Wraps `overlay.js` (the measurement overlay bookmarklet) in a WebExtension.
Click the toolbar icon to inject and toggle the overlay on the active tab.

`overlay.js` in this folder is a generated copy of the root `overlay.js` -
don't edit it directly. Regenerate it with `node extension/build.mjs` (also
runs automatically as part of the root `node build.mjs`).

## Install in Chrome (or any Chromium browser)

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin the "Specsray" icon and click it on any page to toggle the overlay.

## Install in Firefox (temporary, for testing)

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select `manifest.json` inside this `extension/` folder.
4. The extension is removed automatically when Firefox restarts - reload it here again next session.

## Making it permanent in Firefox

Release and Beta Firefox require every add-on to be signed by Mozilla since
Firefox 48; the old `xpinstall.signatures.required` toggle in `about:config`
no longer bypasses this on those channels. Two real options:

- **Firefox Developer Edition or Nightly**: these builds still honor
  `xpinstall.signatures.required = false` in `about:config`, so you can load
  an unsigned build permanently there.
- **Self-distribute a signed build**: run `npx web-ext sign --source-dir extension/`
  (needs a free AMO API key/secret from https://addons.mozilla.org/developers/addon/api/key/).
  This uploads to Mozilla for automated signing and produces a `.xpi` you can
  install permanently in any Firefox channel via drag-and-drop or
  `about:addons`.

For day-to-day development, the temporary-add-on route above is simplest -
just note it needs reloading each time Firefox restarts.
