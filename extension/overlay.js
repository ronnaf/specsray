(function () {
  const OVERLAY_ID = 'meo-overlay-root';
  const PANEL_ID = 'meo-panel';
  const STYLE_ID = 'meo-style';
  const MAX_ELEMENTS = 1500;
  const DEBOUNCE_MS = 120;

  const existingRoot = document.getElementById(OVERLAY_ID);
  if (existingRoot) {
    const existingStyle = document.getElementById(STYLE_ID);
    const existingPanel = document.getElementById(PANEL_ID);
    if (existingStyle) existingStyle.remove();
    if (existingPanel) existingPanel.remove();
    existingRoot.remove();
    if (window.__meoCleanup) {
      window.__meoCleanup();
      delete window.__meoCleanup;
    }
    window.__meoActive = false;
    return;
  }
  window.__meoActive = true;

  const layerState = {
    dimensions: true,
    spacing: false,
    distances: false,
    font: false,
    colors: false,
  };

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    #${OVERLAY_ID} {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 2147483000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #${OVERLAY_ID} > .meo-scroll-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
    }
    .meo-box {
      position: absolute;
      box-sizing: border-box;
      pointer-events: none;
    }
    .meo-outline {
      border: 1px solid;
    }
    .meo-label {
      position: absolute;
      font-size: 9px;
      line-height: 1.3;
      padding: 1px 3px;
      border-radius: 2px;
      color: #fff;
      background: rgba(0, 0, 0, 0.65);
      white-space: nowrap;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .meo-margin {
      position: absolute;
      background: rgba(246, 178, 107, 0.35);
      pointer-events: none;
    }
    .meo-border {
      position: absolute;
      background: rgba(255, 221, 130, 0.45);
      pointer-events: none;
    }
    .meo-padding {
      position: absolute;
      background: rgba(147, 196, 125, 0.4);
      pointer-events: none;
    }
    .meo-gap {
      position: absolute;
      background: rgba(178, 138, 230, 0.4);
      pointer-events: none;
    }
    .meo-side-label {
      position: absolute;
      font-size: 9px;
      line-height: 1;
      padding: 1px 2px;
      border-radius: 2px;
      color: #fff;
      white-space: nowrap;
      pointer-events: none;
      transform: translate(-50%, -50%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .meo-margin-label {
      background: rgba(140, 84, 24, 0.9);
    }
    .meo-border-label {
      background: rgba(133, 110, 12, 0.9);
    }
    .meo-padding-label {
      background: rgba(45, 92, 32, 0.9);
    }
    .meo-gap-label {
      background: rgba(94, 48, 140, 0.9);
    }
    .meo-distance-line {
      position: absolute;
      pointer-events: none;
      background: rgba(230, 60, 100, 0.85);
    }
    .meo-distance-line-horizontal {
      height: 2px;
      transform: translateY(-1px);
    }
    .meo-distance-line-vertical {
      width: 2px;
      transform: translateX(-1px);
    }
    .meo-distance-label {
      background: rgba(150, 20, 60, 0.9);
    }
    .meo-radius-label {
      background: rgba(24, 116, 140, 0.85);
    }
    .meo-grid-label {
      background: rgba(20, 90, 130, 0.85);
    }
    .meo-swatch {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 1px;
      margin-right: 2px;
      vertical-align: middle;
      border: 1px solid rgba(255, 255, 255, 0.6);
    }
    #${PANEL_ID} {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 2147483647;
      background: #1e1e1e;
      color: #eee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      width: 190px;
      user-select: none;
    }
    #${PANEL_ID} .meo-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      font-weight: 600;
      margin-bottom: 8px;
    }
    #${PANEL_ID} .meo-close {
      cursor: pointer;
      background: none;
      border: none;
      color: #eee;
      font-size: 14px;
      line-height: 1;
      padding: 0 2px;
    }
    #${PANEL_ID} label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 4px 0;
      cursor: pointer;
    }
    #${PANEL_ID} .meo-count {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #444;
      color: #aaa;
      font-size: 11px;
    }
    #${PANEL_ID} .meo-credit {
      margin-top: 6px;
      font-size: 9px;
      color: #888;
      opacity: 0.6;
      pointer-events: none;
    }
    #${PANEL_ID} .meo-credit a {
      color: #888;
      pointer-events: auto;
    }
  `;
  document.head.appendChild(styleEl);

  const overlayRoot = document.createElement('div');
  overlayRoot.id = OVERLAY_ID;
  const scrollLayer = document.createElement('div');
  scrollLayer.className = 'meo-scroll-layer';
  overlayRoot.appendChild(scrollLayer);
  document.body.appendChild(overlayRoot);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  const panelHeaderEl = document.createElement('div');
  panelHeaderEl.className = 'meo-panel-header';
  const panelTitle = document.createElement('span');
  panelTitle.textContent = 'Specsray';
  const closeButton = document.createElement('button');
  closeButton.className = 'meo-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = 'x';
  panelHeaderEl.append(panelTitle, closeButton);
  panel.appendChild(panelHeaderEl);

  const layerLabels = [
    { layer: 'dimensions', text: 'Dimensions' },
    { layer: 'spacing', text: 'Spacing (box model)' },
    { layer: 'distances', text: 'Distances' },
    { layer: 'font', text: 'Fonts' },
    { layer: 'colors', text: 'Colors' },
  ];
  for (const { layer, text } of layerLabels) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.layer = layer;
    checkbox.checked = layerState[layer];
    label.append(checkbox, document.createTextNode(text));
    panel.appendChild(label);
  }

  const countDiv = document.createElement('div');
  countDiv.className = 'meo-count';
  countDiv.textContent = '0 elements';
  panel.appendChild(countDiv);

  const creditDiv = document.createElement('div');
  creditDiv.className = 'meo-credit';
  creditDiv.append(document.createTextNode('made out of frustration by '));
  const creditLink = document.createElement('a');
  creditLink.href = 'https://github.com/ronnaf';
  creditLink.target = '_blank';
  creditLink.rel = 'noopener';
  creditLink.textContent = '@ronnaf';
  creditDiv.appendChild(creditLink);
  panel.appendChild(creditDiv);

  document.body.appendChild(panel);

  const countEl = panel.querySelector('.meo-count');

  panel.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      layerState[event.target.dataset.layer] = event.target.checked;
      render();
    });
  });

  panel.querySelector('.meo-close').addEventListener('click', () => {
    styleEl.remove();
    overlayRoot.remove();
    panel.remove();
    if (window.__meoCleanup) delete window.__meoCleanup;
    window.__meoActive = false;
  });

  let dragState = null;
  const panelHeader = panel.querySelector('.meo-panel-header');
  panelHeader.addEventListener('mousedown', (event) => {
    const rect = panel.getBoundingClientRect();
    dragState = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    panel.style.right = 'auto';
  });
  const onDragMove = (event) => {
    if (!dragState) return;
    panel.style.left = `${event.clientX - dragState.offsetX}px`;
    panel.style.top = `${event.clientY - dragState.offsetY}px`;
  };
  const onDragEnd = () => {
    dragState = null;
  };
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  const isOwnUiNode = (node) => node === overlayRoot || node === panel || overlayRoot.contains(node) || panel.contains(node);

  const isVisibleElement = (node) => {
    const tagName = node.tagName;
    if (!tagName) return false;
    const skippedTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE', 'NOSCRIPT', 'TEMPLATE']);
    if (skippedTags.has(tagName)) return false;
    if (isOwnUiNode(node)) return false;

    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
    if (parseFloat(style.opacity) === 0) return false;

    return true;
  };

  const distanceFromViewport = (rect) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    if (rect.bottom < 0) return -rect.bottom;
    if (rect.top > viewportHeight) return rect.top - viewportHeight;
    if (rect.right < 0) return -rect.right;
    if (rect.left > viewportWidth) return rect.left - viewportWidth;
    return 0;
  };

  const collectCandidateElements = () => {
    const allElements = document.body.querySelectorAll('*');
    const candidates = [];
    for (const node of allElements) {
      if (isVisibleElement(node)) {
        const rect = node.getBoundingClientRect();
        candidates.push({ node, rect, distance: distanceFromViewport(rect) });
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates.slice(0, MAX_ELEMENTS);
  };

  const depthOf = (node) => {
    let depth = 0;
    let current = node;
    while (current.parentElement) {
      depth += 1;
      current = current.parentElement;
    }
    return depth;
  };

  const hueForDepth = (depth) => (depth * 47) % 360;

  const hasDirectTextChild = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) return true;
    }
    return false;
  };

  const MAX_LABELED_CLASS_LENGTH = 20;

  const describeElement = (node) => {
    const tag = node.tagName.toLowerCase();
    const firstClass = node.classList.length > 0 ? node.classList[0] : null;
    if (!firstClass) return tag;
    const truncatedClass =
      firstClass.length > MAX_LABELED_CLASS_LENGTH
        ? `${firstClass.slice(0, MAX_LABELED_CLASS_LENGTH - 1)}…`
        : firstClass;
    return `${tag}.${truncatedClass}`;
  };

  const buildDimensionsBox = ({ node, rect, depth }) => {
    const hue = hueForDepth(depth);
    const box = document.createElement('div');
    box.className = 'meo-box meo-outline';
    box.style.left = `${rect.left + window.scrollX}px`;
    box.style.top = `${rect.top + window.scrollY}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.style.borderColor = `hsla(${hue}, 85%, 55%, 0.8)`;

    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const labelFitsInsideBox = width > 34 && height > 12;
    if (labelFitsInsideBox) {
      const label = document.createElement('div');
      label.className = 'meo-label';
      label.textContent = `${describeElement(node)} · ${width} × ${height}`;
      label.style.left = '0px';
      label.style.top = height < 20 ? '-14px' : '0px';
      label.style.background = `hsla(${hue}, 60%, 25%, 0.85)`;
      box.appendChild(label);
    }
    return box;
  };

  const readBoxModelSide = (style, property) => {
    const top = parseFloat(style[`${property}Top`]) || 0;
    const right = parseFloat(style[`${property}Right`]) || 0;
    const bottom = parseFloat(style[`${property}Bottom`]) || 0;
    const left = parseFloat(style[`${property}Left`]) || 0;
    return { top, right, bottom, left };
  };

  const hasNonzeroSide = (sides) => sides.top || sides.right || sides.bottom || sides.left;

  const buildInsetBand = ({ className, outerLeft, outerTop, outerWidth, outerHeight, thickness }) => {
    const band = document.createElement('div');
    band.className = className;
    band.style.left = `${outerLeft}px`;
    band.style.top = `${outerTop}px`;
    band.style.width = `${outerWidth}px`;
    band.style.height = `${outerHeight}px`;
    band.style.clipPath = `polygon(
      0 0, 100% 0, 100% 100%, 0 100%, 0 0,
      ${thickness.left}px ${thickness.top}px,
      ${thickness.left}px calc(100% - ${thickness.bottom}px),
      calc(100% - ${thickness.right}px) calc(100% - ${thickness.bottom}px),
      calc(100% - ${thickness.right}px) ${thickness.top}px,
      ${thickness.left}px ${thickness.top}px
    )`;
    return band;
  };

  const buildBandSideLabels = ({ labelClass, outerLeft, outerTop, outerWidth, outerHeight, thickness }) => {
    const fragment = document.createDocumentFragment();
    const centerX = outerLeft + outerWidth / 2;
    const centerY = outerTop + outerHeight / 2;

    const sideLabelSpecs = [
      { value: thickness.top, x: centerX, y: outerTop + thickness.top / 2 },
      { value: thickness.bottom, x: centerX, y: outerTop + outerHeight - thickness.bottom / 2 },
      { value: thickness.left, x: outerLeft + thickness.left / 2, y: centerY },
      { value: thickness.right, x: outerLeft + outerWidth - thickness.right / 2, y: centerY },
    ];

    for (const { value, x, y } of sideLabelSpecs) {
      if (value <= 0) continue;
      const label = document.createElement('div');
      label.className = labelClass;
      label.textContent = `${Math.round(value)}`;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      fragment.appendChild(label);
    }
    return fragment;
  };

  const GAP_CONTAINER_DISPLAYS = new Set(['flex', 'inline-flex', 'grid', 'inline-grid']);

  const groupChildRectsIntoRows = (childRects) => {
    const sortedByTop = [...childRects].sort((a, b) => a.top - b.top);
    const rows = [];
    for (const childRect of sortedByTop) {
      const overlappingRow = rows.find((row) => childRect.top < row.bottom - 1);
      if (overlappingRow) {
        overlappingRow.items.push(childRect);
        overlappingRow.top = Math.min(overlappingRow.top, childRect.top);
        overlappingRow.bottom = Math.max(overlappingRow.bottom, childRect.bottom);
      } else {
        rows.push({ top: childRect.top, bottom: childRect.bottom, items: [childRect] });
      }
    }
    rows.sort((a, b) => a.top - b.top);
    for (const row of rows) row.items.sort((a, b) => a.left - b.left);
    return rows;
  };

  const buildGapBand = ({ left, top, width, height }) => {
    const band = document.createElement('div');
    band.className = 'meo-gap';
    band.style.left = `${left}px`;
    band.style.top = `${top}px`;
    band.style.width = `${width}px`;
    band.style.height = `${height}px`;
    return band;
  };

  const buildGapLabel = ({ value, x, y }) => {
    const label = document.createElement('div');
    label.className = 'meo-side-label meo-gap-label';
    label.textContent = `${Math.round(value)}`;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    return label;
  };

  const buildGapRegions = ({ node, rect, border, padding }) => {
    const fragment = document.createDocumentFragment();
    const style = getComputedStyle(node);
    if (!GAP_CONTAINER_DISPLAYS.has(style.display)) return fragment;

    const rowGap = parseFloat(style.rowGap) || 0;
    const columnGap = parseFloat(style.columnGap) || 0;
    if (!rowGap && !columnGap) return fragment;

    const children = Array.from(node.children).filter((child) => isVisibleElement(child));
    if (children.length < 2) return fragment;

    const contentLeft = rect.left + border.left + padding.left;
    const contentWidth = rect.width - border.left - border.right - padding.left - padding.right;

    const rows = groupChildRectsIntoRows(children.map((child) => child.getBoundingClientRect()));

    for (const row of rows) {
      for (let i = 1; i < row.items.length; i += 1) {
        const previousItem = row.items[i - 1];
        const currentItem = row.items[i];
        const gapWidth = currentItem.left - previousItem.right;
        if (gapWidth <= 0) continue;
        const left = previousItem.right + window.scrollX;
        const top = row.top + window.scrollY;
        const height = row.bottom - row.top;
        fragment.appendChild(buildGapBand({ left, top, width: gapWidth, height }));
        fragment.appendChild(buildGapLabel({ value: gapWidth, x: left + gapWidth / 2, y: top + height / 2 }));
      }
    }

    for (let i = 1; i < rows.length; i += 1) {
      const previousRow = rows[i - 1];
      const currentRow = rows[i];
      const gapHeight = currentRow.top - previousRow.bottom;
      if (gapHeight <= 0) continue;
      const left = contentLeft + window.scrollX;
      const top = previousRow.bottom + window.scrollY;
      fragment.appendChild(buildGapBand({ left, top, width: contentWidth, height: gapHeight }));
      fragment.appendChild(
        buildGapLabel({ value: gapHeight, x: left + contentWidth / 2, y: top + gapHeight / 2 })
      );
    }

    return fragment;
  };

  const readBorderRadiusCorners = (style) => ({
    topLeft: parseFloat(style.borderTopLeftRadius) || 0,
    topRight: parseFloat(style.borderTopRightRadius) || 0,
    bottomRight: parseFloat(style.borderBottomRightRadius) || 0,
    bottomLeft: parseFloat(style.borderBottomLeftRadius) || 0,
  });

  const buildRadiusLabel = ({ corners, borderBoxLeft, borderBoxTop }) => {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    const allEqual = topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft;
    const text = allEqual
      ? `r${Math.round(topLeft)}`
      : `r${Math.round(topLeft)}/${Math.round(topRight)}/${Math.round(bottomRight)}/${Math.round(bottomLeft)}`;

    const label = document.createElement('div');
    label.className = 'meo-label meo-radius-label';
    label.textContent = text;
    label.style.left = `${borderBoxLeft + 2}px`;
    label.style.top = `${borderBoxTop + 2}px`;
    return label;
  };

  const GRID_DISPLAYS = new Set(['grid', 'inline-grid']);
  const MAX_GRID_LABEL_TRACK_LENGTH = 40;

  const truncateTrackList = (value) =>
    value.length > MAX_GRID_LABEL_TRACK_LENGTH ? `${value.slice(0, MAX_GRID_LABEL_TRACK_LENGTH - 1)}…` : value;

  const buildGridStructureLabel = ({ node, rect, border }) => {
    const style = getComputedStyle(node);
    const columns = style.gridTemplateColumns;
    const rows = style.gridTemplateRows;
    if (!columns || columns === 'none') return null;

    const label = document.createElement('div');
    label.className = 'meo-label meo-grid-label';
    label.textContent = `grid: ${truncateTrackList(columns)} / ${truncateTrackList(rows)}`;
    label.style.left = `${rect.left + border.left + window.scrollX}px`;
    label.style.top = `${rect.top + border.top + window.scrollY}px`;
    return label;
  };

  const buildSpacingBox = ({ node, rect }) => {
    const style = getComputedStyle(node);
    const fragment = document.createDocumentFragment();

    const margin = readBoxModelSide(style, 'margin');
    const border = readBoxModelSide(style, 'borderWidth');
    const padding = readBoxModelSide(style, 'padding');
    const radiusCorners = readBorderRadiusCorners(style);

    const hasMargin = hasNonzeroSide(margin);
    const hasBorder = hasNonzeroSide(border);
    const hasPadding = hasNonzeroSide(padding);
    const hasGap = GAP_CONTAINER_DISPLAYS.has(style.display) && (parseFloat(style.rowGap) || parseFloat(style.columnGap));
    const hasRadius = radiusCorners.topLeft || radiusCorners.topRight || radiusCorners.bottomRight || radiusCorners.bottomLeft;
    const isGridContainer = GRID_DISPLAYS.has(style.display);
    if (!hasMargin && !hasBorder && !hasPadding && !hasGap && !hasRadius && !isGridContainer) return fragment;

    const borderBoxLeft = rect.left + window.scrollX;
    const borderBoxTop = rect.top + window.scrollY;

    if (hasMargin) {
      const outerLeft = borderBoxLeft - margin.left;
      const outerTop = borderBoxTop - margin.top;
      const outerWidth = rect.width + margin.left + margin.right;
      const outerHeight = rect.height + margin.top + margin.bottom;
      fragment.appendChild(
        buildInsetBand({ className: 'meo-margin', outerLeft, outerTop, outerWidth, outerHeight, thickness: margin })
      );
      fragment.appendChild(
        buildBandSideLabels({
          labelClass: 'meo-side-label meo-margin-label',
          outerLeft,
          outerTop,
          outerWidth,
          outerHeight,
          thickness: margin,
        })
      );
    }

    if (hasBorder) {
      fragment.appendChild(
        buildInsetBand({
          className: 'meo-border',
          outerLeft: borderBoxLeft,
          outerTop: borderBoxTop,
          outerWidth: rect.width,
          outerHeight: rect.height,
          thickness: border,
        })
      );
      fragment.appendChild(
        buildBandSideLabels({
          labelClass: 'meo-side-label meo-border-label',
          outerLeft: borderBoxLeft,
          outerTop: borderBoxTop,
          outerWidth: rect.width,
          outerHeight: rect.height,
          thickness: border,
        })
      );
    }

    if (hasPadding) {
      const outerLeft = borderBoxLeft + border.left;
      const outerTop = borderBoxTop + border.top;
      const outerWidth = rect.width - border.left - border.right;
      const outerHeight = rect.height - border.top - border.bottom;
      fragment.appendChild(
        buildInsetBand({ className: 'meo-padding', outerLeft, outerTop, outerWidth, outerHeight, thickness: padding })
      );
      fragment.appendChild(
        buildBandSideLabels({
          labelClass: 'meo-side-label meo-padding-label',
          outerLeft,
          outerTop,
          outerWidth,
          outerHeight,
          thickness: padding,
        })
      );
    }

    if (hasGap) {
      fragment.appendChild(buildGapRegions({ node, rect, border, padding }));
    }

    if (hasRadius) {
      fragment.appendChild(buildRadiusLabel({ corners: radiusCorners, borderBoxLeft, borderBoxTop }));
    }

    if (isGridContainer) {
      const gridLabel = buildGridStructureLabel({ node, rect, border });
      if (gridLabel) fragment.appendChild(gridLabel);
    }

    return fragment;
  };

  const buildFontLabel = ({ node, rect }) => {
    if (!hasDirectTextChild(node)) return null;
    const style = getComputedStyle(node);
    const firstFamily = style.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const isItalic = style.fontStyle === 'italic';
    const parts = [firstFamily, style.fontSize, `w${style.fontWeight}`, `lh${style.lineHeight}`];
    if (isItalic) parts.push('italic');
    if (style.letterSpacing && style.letterSpacing !== 'normal') parts.push(`ls${style.letterSpacing}`);
    if (style.textAlign && !['left', 'start'].includes(style.textAlign)) parts.push(style.textAlign);
    if (style.textTransform && style.textTransform !== 'none') parts.push(style.textTransform);

    const label = document.createElement('div');
    label.className = 'meo-label';
    label.textContent = parts.join(' · ');
    label.style.left = `${rect.left + window.scrollX}px`;
    label.style.top = `${rect.top + window.scrollY + rect.height}px`;
    label.style.background = 'rgba(60, 40, 120, 0.85)';
    return label;
  };

  const rgbStringToHex = (rgbString) => {
    const match = rgbString.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a] = match[1].split(',').map((part) => parseFloat(part.trim()));
    if (a === 0) return null;
    const toHex = (channel) => Math.round(channel).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const buildColorLabel = ({ node, rect }) => {
    const style = getComputedStyle(node);
    const backgroundHex = rgbStringToHex(style.backgroundColor);
    const textHex = hasDirectTextChild(node) ? rgbStringToHex(style.color) : null;
    if (!backgroundHex && !textHex) return null;

    const label = document.createElement('div');
    label.className = 'meo-label meo-color-label';
    label.style.left = `${rect.left + rect.width + window.scrollX}px`;
    label.style.top = `${rect.top + window.scrollY}px`;
    label.style.transform = 'translateX(-100%)';

    const swatches = [
      backgroundHex && { kind: 'bg', hex: backgroundHex },
      textHex && { kind: 'text', hex: textHex },
    ].filter(Boolean);

    swatches.forEach((swatch, index) => {
      if (index > 0) label.appendChild(document.createTextNode(' / '));
      const swatchEl = document.createElement('span');
      swatchEl.className = 'meo-swatch';
      swatchEl.style.background = swatch.hex;
      label.appendChild(swatchEl);
      label.appendChild(document.createTextNode(`${swatch.kind} ${swatch.hex}`));
    });

    return label;
  };

  const MAX_DISTANCE_CONNECTORS_PER_PARENT = 8;

  const buildDistanceConnector = ({ orientation, left, top, length, distance }) => {
    const fragment = document.createDocumentFragment();

    const line = document.createElement('div');
    line.className = `meo-distance-line meo-distance-line-${orientation}`;
    line.style.left = `${left}px`;
    line.style.top = `${top}px`;
    if (orientation === 'horizontal') {
      line.style.width = `${length}px`;
    } else {
      line.style.height = `${length}px`;
    }
    fragment.appendChild(line);

    const midX = orientation === 'horizontal' ? left + length / 2 : left;
    const midY = orientation === 'horizontal' ? top : top + length / 2;
    const label = document.createElement('div');
    label.className = 'meo-side-label meo-distance-label';
    label.textContent = `${Math.round(distance)}`;
    label.style.left = `${midX}px`;
    label.style.top = `${midY}px`;
    fragment.appendChild(label);

    return fragment;
  };

  const buildDistanceConnectors = ({ node }) => {
    const fragment = document.createDocumentFragment();
    const children = Array.from(node.children).filter((child) => isVisibleElement(child));
    if (children.length < 2) return fragment;

    const style = getComputedStyle(node);
    const isGapContainer = GAP_CONTAINER_DISPLAYS.has(style.display);
    const columnGapExplainsRowAdjacency = isGapContainer && (parseFloat(style.columnGap) || 0) > 0;
    const rowGapExplainsColumnAdjacency = isGapContainer && (parseFloat(style.rowGap) || 0) > 0;

    const rows = groupChildRectsIntoRows(children.map((child) => child.getBoundingClientRect()));
    let connectorsDrawn = 0;

    if (!columnGapExplainsRowAdjacency) {
      for (const row of rows) {
        for (let i = 1; i < row.items.length && connectorsDrawn < MAX_DISTANCE_CONNECTORS_PER_PARENT; i += 1) {
          const previousItem = row.items[i - 1];
          const currentItem = row.items[i];
          const distance = currentItem.left - previousItem.right;
          if (distance <= 0) continue;
          const midY = (Math.max(previousItem.top, currentItem.top) + Math.min(previousItem.bottom, currentItem.bottom)) / 2;
          fragment.appendChild(
            buildDistanceConnector({
              orientation: 'horizontal',
              left: previousItem.right + window.scrollX,
              top: midY + window.scrollY,
              length: distance,
              distance,
            })
          );
          connectorsDrawn += 1;
        }
      }
    }

    if (!rowGapExplainsColumnAdjacency) {
      for (let i = 1; i < rows.length && connectorsDrawn < MAX_DISTANCE_CONNECTORS_PER_PARENT; i += 1) {
        const previousRow = rows[i - 1];
        const currentRow = rows[i];
        const distance = currentRow.top - previousRow.bottom;
        if (distance <= 0) continue;

        for (const previousItem of previousRow.items) {
          for (const currentItem of currentRow.items) {
            if (connectorsDrawn >= MAX_DISTANCE_CONNECTORS_PER_PARENT) break;
            const overlapLeft = Math.max(previousItem.left, currentItem.left);
            const overlapRight = Math.min(previousItem.right, currentItem.right);
            if (overlapRight - overlapLeft <= 0) continue;
            const midX = (overlapLeft + overlapRight) / 2;
            fragment.appendChild(
              buildDistanceConnector({
                orientation: 'vertical',
                left: midX + window.scrollX,
                top: previousRow.bottom + window.scrollY,
                length: distance,
                distance,
              })
            );
            connectorsDrawn += 1;
          }
        }
      }
    }

    return fragment;
  };

  const syncScrollLayerToViewport = () => {
    scrollLayer.style.transform = `translate(${-window.scrollX}px, ${-window.scrollY}px)`;
  };

  const render = () => {
    scrollLayer.textContent = '';
    syncScrollLayerToViewport();
    const candidates = collectCandidateElements();
    countEl.textContent = `${candidates.length} elements`;

    const fragment = document.createDocumentFragment();
    for (const { node, rect } of candidates) {
      const depth = depthOf(node);

      if (layerState.spacing) {
        fragment.appendChild(buildSpacingBox({ node, rect }));
      }
      if (layerState.distances) {
        fragment.appendChild(buildDistanceConnectors({ node }));
      }
      if (layerState.dimensions) {
        fragment.appendChild(buildDimensionsBox({ node, rect, depth }));
      }
      if (layerState.font) {
        const fontLabel = buildFontLabel({ node, rect });
        if (fontLabel) fragment.appendChild(fontLabel);
      }
      if (layerState.colors) {
        const colorLabel = buildColorLabel({ node, rect });
        if (colorLabel) fragment.appendChild(colorLabel);
      }
    }
    scrollLayer.appendChild(fragment);
  };

  let debounceTimer = null;
  const scheduleRender = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, DEBOUNCE_MS);
  };

  const onScroll = () => {
    syncScrollLayerToViewport();
    scheduleRender();
  };

  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', scheduleRender);

  window.__meoCleanup = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', scheduleRender);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  };

  render();
})();
