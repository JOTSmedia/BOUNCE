/* 45% reading pace = 45 CSS pixels per second. Manual interaction always wins. */
(() => {
  'use strict';
  const speed = 45;
  const heroDelay = 3000;
  const sharePreview = new URLSearchParams(location.search).has('share-preview');
  if (sharePreview) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.getElementById('loader');
  const reader = document.getElementById('reader');
  const root = document.documentElement;
  let heroReady = false;
  let introActive = true;
  let userPaused = false;
  let wantsScroll = false;
  let atEnd = false;
  let deadline = 0;
  let delayTimer = 0;
  let frame = 0;
  let previousTime = 0;
  let targetY = 0;

  const control = document.createElement('aside');
  control.className = 'reading-flow';
  control.hidden = true;
  control.setAttribute('aria-label', 'Automatic reading controls');
  control.title = '45% reading pace: 45 pixels per second. Any scrolling or page interaction pauses it.';
  const label = document.createElement('span');
  label.className = 'reading-flow-label';
  label.textContent = 'Auto scroll · 45%';
  const status = document.createElement('span');
  status.className = 'reading-flow-status';
  status.setAttribute('aria-live', 'polite');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reading-flow-toggle';
  control.append(label, status, button);
  document.body.append(control);

  const maximumY = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const isAtBottom = () => window.scrollY >= maximumY() - 2;
  const motionIsOff = () => reducedMotion.matches || document.body.classList.contains('motion-paused');
  const isObstructed = () => introActive || !heroReady || document.hidden || Boolean(document.querySelector('dialog[open]'));

  function updateControl() {
    control.hidden = !heroReady || introActive || Boolean(document.querySelector('dialog[open]'));
    const off = motionIsOff();
    const active = wantsScroll && !userPaused && !off;
    const waiting = active && performance.now() < deadline;
    const message = off ? 'Motion is off' : atEnd && isAtBottom() ? 'End of pitch' : waiting ? 'Starts in 3s' : active && !document.hidden ? 'Reading' : 'Paused';
    if (status.textContent !== message) status.textContent = message;
    button.textContent = active ? 'Pause' : 'Resume';
    button.setAttribute('aria-label', active ? 'Pause auto scroll' : 'Resume auto scroll');
    button.setAttribute('aria-pressed', String(active));
    button.disabled = off || (atEnd && isAtBottom());
    control.dataset.state = active ? 'active' : 'paused';
  }

  function stopFrame() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    root.classList.remove('reading-flow-active');
  }

  function pause(manual = true) {
    if (manual) userPaused = true;
    wantsScroll = false;
    clearTimeout(delayTimer);
    stopFrame();
    updateControl();
  }

  function tick(time) {
    frame = 0;
    if (!wantsScroll || userPaused || motionIsOff() || isObstructed()) {
      stopFrame();
      updateControl();
      return;
    }
    if (!previousTime) {
      previousTime = time;
      targetY = window.scrollY;
    }
    const elapsed = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    // A fractional target retains the full 45 px/s pace on high-refresh displays.
    targetY = Math.min(maximumY(), targetY + speed * elapsed);
    window.scrollTo({ top: targetY, left: window.scrollX, behavior: 'auto' });
    if (isAtBottom()) {
      atEnd = true;
      pause(true);
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    clearTimeout(delayTimer);
    if (!wantsScroll || userPaused || motionIsOff() || isObstructed()) {
      updateControl();
      return;
    }
    const remaining = deadline - performance.now();
    if (remaining > 0) {
      delayTimer = setTimeout(start, remaining);
      updateControl();
      return;
    }
    if (isAtBottom()) {
      atEnd = true;
      pause(true);
      return;
    }
    stopFrame();
    root.classList.add('reading-flow-active');
    frame = requestAnimationFrame(tick);
    updateControl();
  }

  function heroArrived() {
    if (heroReady && !introActive) return;
    introActive = false;
    heroReady = true;
    deadline = performance.now() + heroDelay;
    if (!userPaused && !motionIsOff()) {
      wantsScroll = true;
      start();
    }
    updateControl();
  }

  window.addEventListener('bounce-hero-ready', heroArrived);
  window.addEventListener('bounce-profile-open', () => pause(true));
  window.addEventListener('bounce-profile-close', updateControl);
  window.addEventListener('bounce-intro-start', () => {
    introActive = true;
    clearTimeout(delayTimer);
    stopFrame();
    updateControl();
  });

  // Capture input before navigation, native scrolling, or another handler runs.
  // Never preventDefault: ordinary scrolling, selection and keyboard access remain intact.
  function userInteraction(event) {
    if (!event.isTrusted || !heroReady || introActive) return;
    const inControl = control.contains(event.target);
    if (inControl && event.type !== 'wheel' && event.type !== 'touchstart' &&
        (event.type !== 'keydown' || event.key === 'Enter' || event.key === ' ')) return;
    if (event.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
    pause(true);
  }
  ['wheel', 'touchstart', 'pointerdown', 'click', 'keydown'].forEach(type => {
    window.addEventListener(type, userInteraction, { capture: true, passive: true });
  });

  button.addEventListener('click', () => {
    if (wantsScroll && !userPaused) {
      pause(true);
    } else if (!motionIsOff() && !isObstructed()) {
      userPaused = false;
      atEnd = false;
      wantsScroll = true;
      deadline = 0;
      start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(delayTimer);
      stopFrame();
      updateControl();
    } else {
      start();
    }
  });
  if (reader) {
    new MutationObserver(() => {
      if (reader.open) pause(true);
      updateControl();
    }).observe(reader, { attributes: true, attributeFilter: ['open'] });
  }
  const motionChanged = () => {
    if (motionIsOff()) pause(true);
    else updateControl();
  };
  reducedMotion.addEventListener('change', motionChanged);
  window.addEventListener('bounce-motion-change', motionChanged);
  window.addEventListener('hashchange', () => { if (heroReady) pause(true); });
  window.addEventListener('popstate', () => { if (heroReady) pause(true); });
  window.addEventListener('scroll', () => {
    // A native scrollbar drag can move the page without a DOM pointer event.
    if (wantsScroll && !userPaused && previousTime && Math.abs(window.scrollY - targetY) > 4) pause(true);
    if (atEnd) updateControl();
  }, { passive: true });
  window.addEventListener('resize', updateControl, { passive: true });

  // Handles a deferred file arriving after the hero-ready event has already fired.
  requestAnimationFrame(() => {
    if (loader?.hidden || loader?.style.display === 'none') heroArrived();
  });
})();
