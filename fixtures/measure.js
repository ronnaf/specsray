// Returns a snapshot of layout-sensitive metrics for the current document.
window.__meoMetrics = () => {
  const de = document.documentElement;
  const rectsOf = () => {
    const root = document.getElementById('meo-overlay-root');
    const panel = document.getElementById('meo-panel');
    const nodes = Array.from(document.body.querySelectorAll('*')).filter(
      (n) => !(root && (n === root || root.contains(n))) && !(panel && (n === panel || panel.contains(n)))
    );
    return nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return [n.tagName, n.className, Math.round(r.left * 100) / 100, Math.round(r.top * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100].join('|');
    });
  };
  return {
    clientWidth: de.clientWidth,
    clientHeight: de.clientHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: de.scrollWidth,
    scrollHeight: de.scrollHeight,
    hasVScroll: de.clientWidth < window.innerWidth,
    hasHScroll: de.clientHeight < window.innerHeight,
    rects: rectsOf(),
  };
};

// diff two metric snapshots; returns array of human-readable deltas
window.__meoDiff = (before, after) => {
  const diffs = [];
  for (const k of ['clientWidth', 'clientHeight', 'innerWidth', 'innerHeight', 'scrollWidth', 'scrollHeight']) {
    if (before[k] !== after[k]) diffs.push(`${k}: ${before[k]} -> ${after[k]}`);
  }
  if (before.hasVScroll !== after.hasVScroll) diffs.push(`vscroll: ${before.hasVScroll} -> ${after.hasVScroll}`);
  if (before.hasHScroll !== after.hasHScroll) diffs.push(`hscroll: ${before.hasHScroll} -> ${after.hasHScroll}`);
  const setB = new Set(before.rects);
  let rectChanges = 0;
  for (const r of after.rects) if (!setB.has(r)) rectChanges += 1;
  if (before.rects.length !== after.rects.length) diffs.push(`rectCount: ${before.rects.length} -> ${after.rects.length}`);
  if (rectChanges > 0) diffs.push(`rectChanged: ${rectChanges}`);
  return diffs;
};
