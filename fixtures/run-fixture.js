async (page) => {
  const url = '__MEO_URL__';
  const base = 'http://localhost:8199';

  await page.goto(url);
  await page.addScriptTag({ url: base + '/fixtures/measure.js' });
  const before = await page.evaluate(() => window.__meoMetrics());

  await page.addScriptTag({ url: base + '/overlay.js?v=' + Date.now() });
  await page.evaluate(() => {
    document.querySelectorAll('#meo-panel input[type=checkbox]').forEach((cb) => {
      if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  });
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => window.__meoMetrics());
  const rootRect = await page.evaluate(() => {
    const r = document.getElementById('meo-overlay-root');
    if (!r) return null;
    const b = r.getBoundingClientRect();
    const de = document.documentElement;
    return {
      rootRect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','),
      docScroll: [de.scrollWidth, de.scrollHeight].join(','),
      rootRightPastDoc: Math.round(b.right + window.scrollX - de.scrollWidth),
      rootBottomPastDoc: Math.round(b.bottom + window.scrollY - de.scrollHeight),
    };
  });
  const diffs = await page.evaluate(([b, a]) => window.__meoDiff(b, a), [before, after]);

  const compact = (m) => ({ cw: m.clientWidth, iw: m.innerWidth, ch: m.clientHeight, ih: m.innerHeight, sw: m.scrollWidth, sh: m.scrollHeight, v: m.hasVScroll, h: m.hasHScroll });
  return { url, before: compact(before), after: compact(after), root: rootRect, diffs };
}
