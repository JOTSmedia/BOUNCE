/* Neon is a non-interactive overlay: the text, ball and layout remain intact. */
(async function addNeonWordmarks() {
  const SVG = 'http://www.w3.org/2000/svg';
  let font;
  try {
    const url = new URL('./assets/neon-glyphs.json', document.currentScript?.src || document.baseURI);
    const result = await fetch(url);
    if (!result.ok) return;
    font = await result.json();
    await document.fonts.load('100px Anton');
  } catch { return; }

  const words = [...document.querySelectorAll('.wordmark, .brand')];
  const textSpans = [];
  const create = tag => document.createElementNS(SVG, tag);
  function pathsFor(d, delay) {
    const group = create('g');
    for (const kind of ['base', 'runner']) {
      const path = create('path');
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '1000');
      path.setAttribute('class', 'neon-' + kind);
      path.style.setProperty('--neon-delay', delay + 's');
      group.append(path);
    }
    return group;
  }
  for (const word of words) {
    // In the navigation the B and UNCE begin as anonymous flex text nodes.
    // Wrapping each node preserves its existing run, advances and letter spacing.
    for (const node of [...word.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE && /^[BUNCE]+$/.test(node.textContent.trim())) {
        const span = document.createElement('span');
        span.textContent = node.textContent;
        node.replaceWith(span);
      }
    }
    for (const span of [...word.children]) {
      if (span.tagName !== 'SPAN' || span.classList.contains('ball-slot') || span.classList.contains('neon-text')) continue;
      const text = span.textContent.trim();
      if (!/^[BUNCE]+$/.test(text)) continue;
      span.classList.add('neon-text');
      const svg = create('svg');
      svg.setAttribute('class', 'neon-outline');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('preserveAspectRatio', 'none');
      for (let i = 0; i < text.length; i++) svg.append(pathsFor(font.glyphs[text[i]].d, -i * .87));
      span.append(svg);
      textSpans.push({span, svg, text});
    }
  }

  function layoutText(item) {
    const {span, svg, text} = item;
    const style = getComputedStyle(span);
    const size = parseFloat(style.fontSize);
    if (!size || !span.clientHeight) return;
    const width = span.getBoundingClientRect().width / size * 1000;
    const height = span.getBoundingClientRect().height / size * 1000;
    // Browser line-box centering uses Anton's ascent/descent. The paths have
    // baseline zero; this puts the overlay exactly on the live type's baseline.
    const baseline = (height - (font.ascender - font.descender)) / 2 + font.ascender;
    const tracking = (parseFloat(style.letterSpacing) || 0) / size * 1000;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    let x = 0;
    [...svg.children].forEach((group, i) => {
      if (i) x += font.kerning[text[i - 1] + text[i]] || 0;
      group.setAttribute('transform', `translate(${x} ${baseline})`);
      x += font.glyphs[text[i]].advance + tracking;
    });
  }
  const resizing = new ResizeObserver(entries => {
    for (const entry of entries) {
      const item = textSpans.find(item => item.span === entry.target);
      if (item) layoutText(item);
    }
  });
  for (const item of textSpans) { layoutText(item); resizing.observe(item.span); }

  function rimBalls() {
    for (const bouncer of document.querySelectorAll('.ball-bouncer')) {
      if (bouncer.querySelector('.neon-ball-outline')) continue;
      const svg = create('svg');
      svg.setAttribute('class', 'neon-ball-outline');
      svg.setAttribute('viewBox', '0 0 1000 1000');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      for (const kind of ['base', 'runner']) {
        const circle = create('circle');
        circle.setAttribute('cx', '500'); circle.setAttribute('cy', '500');
        circle.setAttribute('r', '477'); circle.setAttribute('pathLength', '1000');
        circle.setAttribute('class', 'neon-' + kind);
        circle.style.setProperty('--neon-delay', '-.9s');
        svg.append(circle);
      }
      bouncer.append(svg);
    }
  }
  rimBalls();
  const mutations = new MutationObserver(rimBalls);
  for (const word of words) mutations.observe(word, {childList: true, subtree: true});
  const visible = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('neon-offscreen', !entry.isIntersecting);
  });
  words.forEach(word => visible.observe(word));
  const toggleHidden = () => {
    for (const word of words) word.classList.toggle('neon-document-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', toggleHidden);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    resizing.disconnect(); mutations.disconnect(); visible.disconnect();
  });
})();
