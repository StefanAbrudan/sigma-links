/* Lightweight draped fabric: curved pleats deform and compress as two panels gather.
   No video, WebGPU, framework, or continuously running animation. */
window.createSigmaCurtain = (host, texture = 'silk-poster.jpg') => {
  const NS = 'http://www.w3.org/2000/svg';
  const node = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) el.setAttribute(key, value);
    parent?.appendChild(el);
    return el;
  };
  const svg = node('svg', {viewBox: '0 0 1000 1000', preserveAspectRatio: 'none', 'aria-hidden': 'true'}, host);
  const defs = node('defs', {}, svg);
  const uid = `drape-${Math.random().toString(36).slice(2)}`;
  const panels = [], count = 10;
  const boundary = i => i === 0 ? 0 : i === count ? 1 : i / count + Math.sin(i * 1.7) * .012;
  for (let side = 0; side < 2; side++) {
    const group = node('g', {}, svg), folds = [];
    for (let i = 0; i < count; i++) {
      const id = `${uid}-${side}-${i}`;
      const gradient = node('linearGradient', {id, x1: '0%', y1: '25%', x2: '100%', y2: '45%'}, defs);
      // Broad, muted silk highlights with a narrow dark trough between pleats.
      const light = i % 3 === 0 ? '#36383a' : i % 3 === 1 ? '#252729' : '#303234';
      for (const [offset, color] of [['0%', '#070809'], ['20%', '#17191b'], ['43%', light], ['60%', '#27292b'], ['82%', '#0d0e10'], ['100%', '#040506']]) {
        node('stop', {offset, 'stop-color': color}, gradient);
      }
      folds.push(node('path', {fill: `url(#${id})`}, group));
    }
    const clip = node('clipPath', {id: `${uid}-clip-${side}`}, defs);
    const silhouette = node('path', {}, clip);
    const sheen = node('image', {href: texture, x: '0', y: '0', width: '560', height: '1040', preserveAspectRatio: 'none', opacity: '.23', 'clip-path': `url(#${uid}-clip-${side})`, style: 'mix-blend-mode:screen'}, group);
    // A fine soft hem follows the inner edge instead of a straight polygon cut.
    const hem = node('path', {fill: 'none', stroke: '#55575a', 'stroke-opacity': '.16', 'stroke-width': '2'}, group);
    panels.push({group, folds, hem, silhouette, sheen});
  }
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const point = (u, gather, phase, side) => {
    const ripple = Math.sin(u * 18 + phase * 3 + side * .7) * 9 * Math.sin(Math.PI * phase);
    const top = [u * 502, -8];
    const bottom = [u * 502 * (1 - .89 * gather), 1015 * (1 - .76 * gather * Math.pow(u, .8)) + ripple];
    const c1 = [top[0] * (1 - .32 * gather), 340 * (1 - .3 * gather * u)];
    const c2 = [bottom[0] + 80 * gather * Math.sin(Math.PI * u) + ripple * .3 * Math.sin(Math.PI * u), bottom[1] * .78];
    return {top, c1, c2, bottom};
  };
  const xy = p => p.map(n => n.toFixed(2)).join(' ');
  const down = p => `C ${xy(p.c1)} ${xy(p.c2)} ${xy(p.bottom)}`;
  let frame = 0, stopped = false;
  const render = progress => {
    panels.forEach(({group, folds, hem, silhouette, sheen}, side) => {
      const t = Math.max(0, Math.min(1, progress - side * .018));
      const gather = smooth(t / .78);
      const lift = smooth((progress - .72) / .28) * 1040;
      group.setAttribute('transform', `${side ? 'translate(1000 0) scale(-1 1) ' : ''}translate(0 ${-lift})`);
      folds.forEach((path, i) => {
        const a = point(boundary(i), gather, t, side), b = point(boundary(i + 1), gather, t, side);
        path.setAttribute('d', `M ${xy(a.top)} ${down(a)} Q ${(a.bottom[0] + b.bottom[0]) / 2} ${Math.max(a.bottom[1], b.bottom[1]) + 5} ${xy(b.bottom)} C ${xy(b.c2)} ${xy(b.c1)} ${xy(b.top)} Z`);
      });
      const inner = point(1, gather, t, side), outer = point(0, gather, t, side);
      let outline = `M ${xy(outer.top)} ${down(outer)}`;
      for (let i = 1; i <= count; i++) outline += ` L ${xy(point(boundary(i), gather, t, side).bottom)}`;
      outline += ` C ${xy(inner.c2)} ${xy(inner.c1)} ${xy(inner.top)} Z`;
      silhouette.setAttribute('d', outline);
      sheen.setAttribute('width', 560 * (1 - .45 * gather));
      sheen.setAttribute('height', 1040 * (1 - .12 * gather));
      hem.setAttribute('d', `M ${xy(inner.top)} ${down(inner)}`);
    });
  };
  render(0);
  return {
    play(duration) {
      const start = performance.now();
      const tick = now => {
        if (stopped || !host.isConnected) return;
        const progress = Math.min(1, (now - start) / duration);
        render(progress);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
    destroy() { stopped = true; cancelAnimationFrame(frame); },
  };
};
