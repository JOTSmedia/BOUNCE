/* The pitch moves at 45 CSS pixels/second after three quiet seconds. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).has('share-preview')) return;

  const speed = 45;
  const idleDelay = 3000;
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const heldPointers = new Set();
  let heldTouches = 0;
  let heroReady = false;
  let introActive = true;
  let idleDeadline = 0;
  let idleTimer = 0;
  let frame = 0;
  let running = false;
  let previousTime = 0;
  let targetY = window.scrollY;
  let writtenY = window.scrollY;
  let observedY = window.scrollY;

  const maximumY = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const atBottom = () => window.scrollY >= maximumY() - 1;
  const motionOff = () => reducedMotion.matches || document.body.classList.contains('motion-paused');
  const editing = () => {
    const active = document.activeElement;
    return Boolean(active && (active.isContentEditable || active.matches?.('input, textarea, select')));
  };
  const textSelected = () => {
    const selection = window.getSelection();
    return Boolean(selection && !selection.isCollapsed);
  };
  const blocked = () => !heroReady || introActive || document.hidden || motionOff() ||
    heldPointers.size > 0 || heldTouches > 0 || editing() || textSelected() ||
    Boolean(document.querySelector('dialog[open]')) ||
    Boolean(loader && !loader.hidden && loader.style.display !== 'none');

  function stop() {
    clearTimeout(idleTimer);
    idleTimer = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    running = false;
    previousTime = 0;
    root.classList.remove('reading-flow-active');
  }

  function schedule() {
    clearTimeout(idleTimer);
    idleTimer = 0;
    if (blocked() || atBottom()) return;
    idleTimer = setTimeout(begin, Math.max(0, idleDeadline - performance.now()));
  }

  function activity() {
    idleDeadline = performance.now() + idleDelay;
    stop();
    schedule();
  }

  function tick(time) {
    frame = 0;
    if (blocked()) { stop(); return; }
    if (!previousTime) previousTime = time;
    const elapsed = Math.min((time - previousTime) / 1000, .05);
    previousTime = time;
    // Preserve subpixel travel so high-refresh displays retain the same pace.
    targetY = Math.min(maximumY(), targetY + speed * elapsed);
    window.scrollTo({top: targetY, left: window.scrollX, behavior: 'auto'});
    writtenY = window.scrollY;
    if (atBottom()) { stop(); return; }
    frame = requestAnimationFrame(tick);
  }

  function begin() {
    idleTimer = 0;
    if (blocked() || atBottom()) return;
    if (performance.now() < idleDeadline) { schedule(); return; }
    running = true;
    previousTime = 0;
    targetY = writtenY = observedY = window.scrollY;
    root.classList.add('reading-flow-active');
    frame = requestAnimationFrame(tick);
  }

  function heroArrived() {
    introActive = false;
    heroReady = true;
    activity();
  }

  window.addEventListener('bounce-hero-ready', heroArrived);
  window.addEventListener('bounce-intro-start', () => {
    introActive = true;
    stop();
  });
  window.addEventListener('bounce-profile-open', activity);
  window.addEventListener('bounce-profile-close', activity);
  window.addEventListener('bounce-motion-change', activity);
  reducedMotion.addEventListener('change', activity);

  // Capture input before navigation and native scrolling, without cancelling it.
  const passiveCapture = {capture: true, passive: true};
  ['wheel', 'pointermove', 'click', 'keydown'].forEach(type => {
    window.addEventListener(type, activity, passiveCapture);
  });
  window.addEventListener('pointerdown', event => {
    heldPointers.add(event.pointerId);
    activity();
  }, passiveCapture);
  ['pointerup', 'pointercancel'].forEach(type => {
    window.addEventListener(type, event => {
      heldPointers.delete(event.pointerId);
      activity();
    }, passiveCapture);
  });
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(type => {
    window.addEventListener(type, event => {
      heldTouches = event.touches.length;
      activity();
    }, passiveCapture);
  });
  document.addEventListener('selectionchange', activity);
  document.addEventListener('focusin', activity);
  document.addEventListener('focusout', () => {
    // The new active element is established after focusout dispatch finishes.
    queueMicrotask(activity);
  });
  window.addEventListener('hashchange', activity);
  window.addEventListener('popstate', activity);
  window.addEventListener('resize', activity, {passive: true});
  window.addEventListener('focus', activity);
  window.addEventListener('blur', () => {
    heldPointers.clear();
    heldTouches = 0;
    stop();
  });
  document.addEventListener('visibilitychange', () => {
    heldPointers.clear();
    heldTouches = 0;
    if (document.hidden) stop();
    else activity();
  });

  // Observe both built-in dialogs, including an open/close done without a click.
  new MutationObserver(activity).observe(document.body, {
    subtree: true, attributes: true, attributeFilter: ['open']
  });
  let wasMotionOff = motionOff();
  new MutationObserver(() => {
    const isOff = motionOff();
    if (isOff === wasMotionOff) return;
    wasMotionOff = isOff;
    activity();
  }).observe(document.body, {attributes: true, attributeFilter: ['class']});

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const changed = Math.abs(currentY - observedY) > .5;
    observedY = currentY;
    if (!changed) return;
    // Our own scroll events do not reset the idle timer. A scrollbar drag,
    // browser navigation, or other outside movement immediately yields control.
    if (running && Math.abs(currentY - writtenY) <= 2) return;
    activity();
  }, {passive: true});
  document.addEventListener('scroll', event => {
    // Reading within a dossier or dialog also counts as activity.
    if (event.target !== document && event.target !== root && event.target !== document.body) activity();
  }, {capture: true, passive: true});

  // Handles a deferred file loaded after the hero-ready event already fired.
  requestAnimationFrame(() => {
    if (!loader || loader.hidden || loader.style.display === 'none') heroArrived();
  });
})();
