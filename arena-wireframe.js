(() => {
  'use strict';
  const loader = document.getElementById('loader');
  const track = document.querySelector('.loading-track');
  if (!loader || !track) return;
  const ns = 'http://www.w3.org/2000/svg';
  const element = (name, attrs = {}) => {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    return el;
  };
  const clamp = n => Math.max(0, Math.min(1, n));

  // Public-domain Natural Earth 1:110m mainland-US coastline, Albers equal-area
  // projection (29.5°/45.5° standard parallels, -96° central meridian).
  // https://www.naturalearthdata.com/about/terms-of-use/
  const mainland = 'M223.4,55.0L258.0,64.5L294.6,73.3L306.7,76.0L344.6,83.5L381.4,89.5L419.0,94.5L456.8,98.3L499.7,101.2L543.0,102.5L569.2,102.6L569.2,95.4L573.5,95.2L575.8,105.5L579.8,108.7L588.7,109.6L601.8,112.2L614.5,117.6L624.7,114.6L640.8,118.5L645.0,118.1L656.0,111.9L668.6,117.7L681.8,123.8L692.9,128.9L703.7,133.8L705.5,138.6L708.8,140.1L708.3,142.1L711.8,142.2L714.1,140.0L715.3,144.4L718.4,147.0L722.0,146.5L724.2,148.6L723.0,152.2L738.0,159.1L743.3,175.9L748.4,191.9L746.0,203.7L741.0,215.1L738.9,222.1L738.9,224.2L740.8,226.7L746.0,229.0L749.5,228.5L764.1,215.9L777.9,210.7L794.2,198.1L794.1,196.2L791.8,190.7L789.0,187.3L794.5,183.2L807.8,180.7L820.1,178.2L822.9,170.0L824.3,168.2L835.4,151.7L840.6,147.0L860.4,142.2L884.5,136.1L884.6,131.2L888.5,129.2L893.2,124.8L895.4,115.2L895.4,99.9L901.0,83.4L906.5,87.0L914.0,81.4L921.1,85.0L928.7,109.8L940.2,117.5L944.3,122.7L933.2,135.8L921.7,146.2L909.3,155.6L905.3,168.5L904.2,173.2L906.7,183.1L913.9,191.7L919.6,190.6L916.3,184.2L921.5,187.2L921.9,192.8L913.6,198.3L906.9,199.8L897.6,205.7L891.9,208.1L884.1,211.1L873.9,219.3L893.3,210.8L898.3,213.2L880.3,223.7L871.4,225.9L871.3,223.5L868.3,229.6L872.6,229.5L872.7,243.7L865.7,260.5L863.5,255.9L860.2,255.6L854.4,252.0L859.6,261.4L863.9,264.0L865.7,271.0L862.7,279.4L857.8,296.2L856.3,295.7L858.0,281.9L849.1,276.3L844.1,261.0L843.0,269.8L848.6,281.1L838.4,280.1L849.7,284.1L854.1,301.9L858.6,302.3L861.5,308.5L867.7,326.8L861.1,342.8L846.4,351.6L838.5,364.6L831.0,367.3L824.5,375.7L823.4,382.4L808.3,397.6L800.8,408.1L795.1,420.5L794.7,434.3L799.6,446.9L807.6,462.2L817.1,474.3L818.5,482.4L830.0,502.7L831.6,515.4L832.1,522.8L829.7,534.8L825.0,538.0L816.1,537.1L812.1,529.4L805.0,526.1L793.6,511.4L783.6,498.1L780.1,491.1L781.8,478.2L775.7,468.5L760.7,454.4L754.0,452.3L738.5,462.9L735.4,462.3L726.5,454.3L715.8,450.7L697.5,454.8L682.8,454.0L670.5,456.2L663.9,459.7L667.2,464.5L667.5,472.2L671.2,475.8L668.3,478.5L661.9,476.1L655.9,480.1L643.8,480.2L630.9,470.8L616.6,473.7L604.4,469.7L594.2,471.3L580.3,476.0L565.3,490.3L548.6,498.5L539.3,507.4L535.3,515.9L534.9,529.0L535.7,538.1L538.9,544.5L532.1,545.0L519.9,540.6L506.6,534.4L502.1,525.3L498.8,511.9L489.3,500.7L484.0,489.3L476.3,475.9L465.1,467.7L451.5,467.2L440.0,481.5L426.7,474.7L418.6,468.2L415.5,457.4L411.0,447.0L402.2,437.6L394.6,430.8L389.4,423.4L361.7,420.0L360.7,427.9L347.9,426.2L316.0,421.6L282.0,402.0L260.0,388.3L262.2,384.9L241.9,382.9L223.9,380.4L223.4,370.3L215.9,357.2L209.3,353.3L209.0,347.5L200.6,344.5L196.5,338.1L182.9,332.7L179.9,328.7L180.8,318.0L171.5,295.5L166.6,266.3L168.3,262.2L163.8,254.3L157.4,235.6L160.0,220.0L155.7,207.7L163.4,193.4L167.7,177.5L167.8,162.1L178.2,146.4L184.9,130.3L191.5,114.2L196.6,89.1L197.4,72.4L196.4,62.9L199.0,59.9L214.9,71.4L216.5,90.5L221.0,86.5L223.3,71.1L223.4,55.0Z';
  const vegas = [268.9, 318.7];
  const newYork = [870.7, 224.3];
  const control = [(vegas[0] + newYork[0]) / 2, Math.min(vegas[1], newYork[1]) - 148];
  const route = `M${vegas[0]} ${vegas[1]}Q${control[0]} ${control[1]} ${newYork[0]} ${newYork[1]}`;
  const map = element('svg', {viewBox:'0 0 1250 600', 'aria-hidden':'true', focusable:'false', class:'flight-map'});
  const defs = element('defs');
  const clip = element('clipPath', {id:'flight-mainland-clip'});
  clip.appendChild(element('path', {d:mainland}));
  defs.appendChild(clip);
  const trailSpectrum = element('linearGradient', {
    id:'flight-trail-spectrum', gradientUnits:'userSpaceOnUse',
    x1:vegas[0], y1:vegas[1], x2:newYork[0], y2:newYork[1],
    'color-interpolation':'sRGB'
  });
  ['#ff3b30', '#ff9500', '#ffe600', '#00d878', '#2496ff', '#6255ff', '#ba5bff'].forEach((color, index) => {
    trailSpectrum.appendChild(element('stop', {offset:`${index / 6 * 100}%`, 'stop-color':color}));
  });
  defs.appendChild(trailSpectrum);
  map.appendChild(defs);
  map.appendChild(element('path', {d:mainland, class:'flight-land'}));
  // Real Census state boundaries, preprojected into this exact Albers viewport.
  // The bundled derivative includes its source and complete distribution license.
  const boundaries = element('g', {'clip-path':'url(#flight-mainland-clip)', class:'flight-state-boundaries'});
  map.appendChild(boundaries);
  map.dataset.stateBoundaries = 'loading';
  fetch('assets/us-state-boundaries.json').then(response => {
    if (!response.ok) throw new Error('State boundaries unavailable');
    return response.json();
  }).then(data => {
    if (typeof data.path !== 'string' || !Array.isArray(data.states)) throw new Error('Invalid boundary data');
    boundaries.appendChild(element('path', {d:data.path}));
    map.dataset.stateBoundaries = String(data.states.length);
  }).catch(() => { map.dataset.stateBoundaries = 'unavailable'; });
  map.appendChild(element('path', {d:mainland, class:'flight-coast'}));
  map.appendChild(element('path', {d:route, class:'flight-route-guide'}));
  const trail = element('path', {d:route, class:'flight-route', pathLength:'100', 'stroke-dasharray':'100 100', 'stroke-dashoffset':'100'});
  map.appendChild(trail);
  [[vegas, 'LAS VEGAS', -8, 36, 'start'], [newYork, 'NEW YORK CITY', 55, 5, 'start']].forEach(([point,label,dx,dy,anchor]) => {
    map.appendChild(element('circle', {cx:point[0],cy:point[1],r:8,class:'flight-city'}));
    const text = element('text', {x:point[0]+dx,y:point[1]+dy,'text-anchor':anchor,class:'flight-label'});
    text.textContent = label;
    map.appendChild(text);
  });
  map.appendChild(element('path', {d:`M${newYork[0]+12} ${newYork[1]}h30`,class:'flight-label-leader'}));
  const plane = element('g', {class:'flight-plane'});
  plane.appendChild(element('path', {d:'M0 -21L4 -5L21 5L21 10L4 5L3 17L10 22L10 26L0 22L-10 26L-10 22L-3 17L-4 5L-21 10L-21 5L-4 -5Z'}));
  map.appendChild(plane);
  const mapWrap = document.createElement('div');
  mapWrap.className = 'flight-map-wrap';
  mapWrap.setAttribute('aria-hidden', 'true');
  mapWrap.appendChild(map);
  track.before(mapWrap);

  // The aerial drawing follows loading progress behind the entire title/flight UI.
  // Image cover and SVG slice share the reference composition's coordinate box.
  const arrival = document.createElement('div');
  arrival.className = 'arena-aerial-scene';
  arrival.setAttribute('aria-hidden', 'true');
  const photograph = document.createElement('img');
  photograph.src = 'assets/msg-video-4k.jpg';
  photograph.alt = '';
  photograph.width = 3840;
  photograph.height = 2160;
  photograph.decoding = 'async';
  photograph.className = 'arena-aerial-photo';
  const photoReady = () => {
    arrival.classList.add('has-aerial-photo');
    arrival.dataset.photoStatus = 'ready';
    updatePhotoReveal();
  };
  photograph.addEventListener('load', photoReady);
  photograph.decode?.().then(photoReady).catch(() => {});
  const arena = element('svg', {
    viewBox:'0 0 960 540', preserveAspectRatio:'xMidYMid slice',
    'aria-hidden':'true', focusable:'false', class:'arena-aerial-wireframe',
    fill:'none', 'data-wireframe-progress':'0'
  });
  const trace = (d, kind='aerial-detail') => {
    // Normalize each disconnected line individually. SVG resets dash patterns at
    // every moveto; one combined facade path would hide short lines until late.
    const parts = d.match(/[Mm][^Mm]*/g) || [];
    parts.forEach(part => {
      arena.appendChild(element('path', {
        d:part, class:kind, fill:'none', pathLength:'1',
        'stroke-dasharray':'1 1', 'stroke-dashoffset':'1'
      }));
    });
  };
  const polygon = (points, kind='aerial-structure', delay=0) =>
    trace(points.map((point,index) => `${index?'L':'M'}${point[0]} ${point[1]}`).join('')+'Z',kind,delay);
  const lerp = (a,b,t) => [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const facade = (corners, floors, bays, delay=90) => {
    polygon(corners,'aerial-structure',delay);
    let d='';
    for(let i=1;i<floors;i++){
      const a=lerp(corners[0],corners[3],i/floors),b=lerp(corners[1],corners[2],i/floors);
      d+=`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
    }
    for(let i=1;i<bays;i++){
      const a=lerp(corners[0],corners[1],i/bays),b=lerp(corners[3],corners[2],i/bays);
      d+=`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
    }
    trace(d,'aerial-detail',delay+80);
  };

  // Lightweight still fallback follows the selected 9.000s source frame. The
  // primary moving linework below comes from that same real camera trajectory.
  facade([[99,0],[136,0],[141,38],[101,31]],8,5);
  facade([[136,0],[164,0],[163,31],[141,38]],8,4);
  facade([[102,42],[135,52],[168,40],[168,96]],10,5);
  polygon([[101,42],[135,52],[168,40],[165,35],[135,45],[101,35]]);
  facade([[107,145],[143,157],[143,227],[108,215]],17,6);
  facade([[143,157],[179,145],[180,214],[143,227]],17,6);
  polygon([[104,139],[143,129],[181,141],[143,154]]);
  facade([[234,117],[255,123],[255,168],[232,161]],9,4);
  facade([[255,123],[278,114],[278,160],[255,168]],9,4);
  polygon([[232,113],[256,106],[279,113],[255,121]]);
  facade([[296,195],[317,203],[317,238],[292,230]],7,4);
  facade([[317,203],[338,195],[338,231],[317,238]],7,4);
  polygon([[295,192],[318,186],[338,194],[316,201]]);
  // The red-and-blue crowned tower immediately behind the arena.
  polygon([[404,173],[435,163],[467,168],[435,182]],'aerial-accent');
  facade([[404,173],[435,182],[435,253],[406,244]],13,6);
  facade([[435,182],[467,168],[469,241],[435,253]],13,6);
  trace('M405 181L435 191L467 177M405 188L435 197L468 183','aerial-accent');
  facade([[467,125],[486,117],[496,237],[469,241]],13,3);
  // The broad dark slab behind the arena on the right.
  polygon([[510,55],[559,40],[629,55],[601,75],[535,74]]);
  facade([[510,55],[535,74],[553,250],[517,240]],20,4);
  facade([[535,74],[601,75],[650,246],[553,250]],20,8);
  trace('M555 249L600 269L650 246M555 259L600 279L650 256M555 270L599 288L650 266','aerial-structure');
  facade([[699,157],[730,170],[727,225],[695,215]],9,5);
  facade([[730,170],[751,157],[751,212],[727,225]],9,4);
  polygon([[697,151],[722,144],[752,155],[730,166]]);
  facade([[706,0],[741,0],[745,95],[704,82]],18,5);
  facade([[741,0],[767,0],[772,112],[745,95]],18,5);
  facade([[825,56],[851,66],[851,150],[823,137]],16,4);
  facade([[851,66],[878,54],[878,135],[851,150]],16,4);
  facade([[908,0],[934,0],[943,126],[905,136]],20,5);
  facade([[934,0],[960,0],[960,114],[943,126]],20,4);
  // MSG roof ring, front drum, and the illuminated vertical ribs.
  trace('M416 262C420 251 449 244 481 244C516 242 549 250 554 261C560 275 532 285 489 286C452 287 424 280 418 270Z','aerial-arena');
  trace('M421 262C425 253 451 247 482 247C515 246 544 253 549 262C553 273 528 281 489 282C455 284 430 277 424 269Z','aerial-accent');
  trace('M418 269L420 288Q449 310 476 320Q516 318 551 291L555 264','aerial-arena');
  [[424,280,425,296],[432,283,433,300],[440,285,441,308],[449,286,450,312],[458,287,459,316],[467,287,468,319],[476,287,477,321],[485,286,486,315],[493,285,494,312],[502,284,503,309],[512,281,513,304],[521,278,522,301],[530,276,531,297],[539,273,540,293],[547,269,548,289]].forEach(([x1,y1,x2,y2]) => trace(`M${x1} ${y1}L${x2} ${y2}`,'aerial-arena'));
  // Low roofs and foreground masses retain the source frame's perspective.
  polygon([[194,248],[261,219],[316,235],[407,246],[342,280],[273,293],[200,276]]);
  trace('M200 276L274 299L342 285L407 251M273 293V299','aerial-detail');
  polygon([[308,355],[350,340],[430,361],[420,372],[356,366]]);
  facade([[356,366],[420,372],[420,412],[356,400]],6,8);
  facade([[512,378],[541,364],[542,404],[510,421]],9,5);
  facade([[573,343],[595,330],[595,418],[571,435]],17,3);
  polygon([[573,343],[563,335],[583,321],[595,330]]);
  facade([[72,376],[107,368],[125,411],[83,424]],9,5);
  facade([[359,463],[387,454],[404,493],[369,508]],9,5);
  facade([[472,453],[492,443],[510,485],[481,499]],10,4);
  facade([[883,405],[914,389],[918,432],[882,450]],8,5);
  trace('M261 330L219 442M542 327L654 268M404 244L385 210M653 263L704 238','aerial-street');

  const motion = document.createElement('video');
  motion.className = 'arena-wireframe-motion';
  motion.src = 'assets/msg-wireframe-motion.mp4?v=2';
  motion.preload = 'auto';
  motion.muted = true;
  motion.defaultMuted = true;
  motion.playsInline = true;
  motion.disablePictureInPicture = true;
  motion.tabIndex = -1;
  motion.setAttribute('aria-hidden', 'true');
  motion.setAttribute('muted', '');
  motion.setAttribute('playsinline', '');
  const motionEnd = 9; // Exact final source frame also supplies msg-video-4k.jpg.
  let motionReady = false;
  let motionPlayPending = false;
  arrival.append(photograph, arena, motion);
  loader.prepend(arrival);
  loader.classList.add('has-arena-wireframe', 'has-flight-map');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sharePreview = new URLSearchParams(location.search).has('share-preview');
  let lastProgress = -1;
  function updatePhotoReveal() {
    const staticView = reducedMotion.matches || sharePreview || document.body.classList.contains('motion-paused');
    const ready = lastProgress === 1 && arrival.classList.contains('has-aerial-photo') &&
      (staticView || !arrival.classList.contains('has-motion-video') || arrival.classList.contains('motion-at-arrival'));
    arrival.classList.toggle('can-reveal-photo', ready);
  }
  function canSeek(time) {
    for (let index=0;index<motion.seekable.length;index++) {
      const start=motion.seekable.start(index),end=motion.seekable.end(index);
      if (end-start > .02 && time >= start && time <= end) return true;
    }
    return false;
  }
  function motionDiagnostics() {
    arrival.dataset.motionTime = motion.currentTime.toFixed(3);
    arrival.dataset.motionSeekable = motion.seekable.length ? motion.seekable.end(motion.seekable.length-1).toFixed(3) : '0.000';
  }
  function playMotion() {
    if (!motion.paused || motionPlayPending) return;
    motionPlayPending = true;
    const playing = motion.play();
    if (playing?.then) playing.catch(error => {
      if (error.name !== 'AbortError') {
        arrival.classList.remove('has-motion-video');
        arrival.dataset.motionStatus = 'fallback';
        updatePhotoReveal();
      }
    }).finally(() => { motionPlayPending = false; });
    else motionPlayPending = false;
  }
  function syncMotion(progress) {
    const still = reducedMotion.matches || sharePreview || document.body.classList.contains('motion-paused');
    const desired = Math.min(motionEnd, progress * motionEnd);
    arrival.dataset.motionTargetTime = desired.toFixed(3);
    motionDiagnostics();
    if (progress < 1) arrival.classList.remove('motion-at-arrival');
    if (!motionReady || still || document.hidden || loader.hidden || loader.classList.contains('hidden')) {
      motion.pause();
      updatePhotoReveal();
      return;
    }
    if (progress === 0) {
      motion.pause();
      if (motion.currentTime > .025) {
        if (canSeek(0) && !motion.seeking) motion.currentTime = 0;
        else if (!motion.seeking) {
          // A non-range server cannot seek even a fully buffered file. Reloading
          // resets a replay without the Safari currentTime-to-zero seek loop.
          motionReady = false;
          arrival.classList.remove('has-motion-video');
          motion.load();
        }
      }
      updatePhotoReveal();
      return;
    }
    motion.playbackRate = motionEnd / 5.2;
    if (progress === 1) {
      if (!motion.seeking && motion.currentTime >= motionEnd-.01) {
        motion.pause();
        arrival.classList.add('motion-at-arrival');
        motionDiagnostics();
        updatePhotoReveal();
        return;
      }
      if (!motion.seeking && canSeek(motionEnd)) {
        motion.pause();
        motion.currentTime = motionEnd;
      } else if (!motion.seeking) {
        // Let the real clip reach the matching frame before revealing its still.
        playMotion();
      }
      updatePhotoReveal();
      return;
    }
    // Continuous native playback preserves parallax. Only correct drift when the
    // media actually advertises a non-empty seekable range (buffered is not enough).
    if (!motion.seeking && Math.abs(motion.currentTime-desired) > .22 && canSeek(desired)) motion.currentTime = desired;
    playMotion();
    updatePhotoReveal();
  }
  motion.addEventListener('loadeddata', () => {
    motionReady = true;
    // Do not replace an already-revealing static fallback with a late video.
    if (lastProgress === 1 && !arrival.classList.contains('has-motion-video')) {
      motion.pause();
      updatePhotoReveal();
      return;
    }
    arrival.classList.add('has-motion-video');
    arrival.dataset.motionStatus = 'ready';
    syncMotion(Math.max(0,lastProgress));
  });
  motion.addEventListener('error', () => {
    motionReady = false;
    arrival.classList.remove('has-motion-video');
    arrival.dataset.motionStatus = 'fallback';
    updatePhotoReveal();
  });
  ['timeupdate','seeked','ended'].forEach(type => motion.addEventListener(type, () => {
    motionDiagnostics();
    if (lastProgress === 1) syncMotion(1);
  }));
  document.addEventListener('visibilitychange', () => syncMotion(Math.max(0,lastProgress)));
  function syncProgress() {
    const raw = Number(track.getAttribute('aria-valuenow')) || 0;
    const progress = reducedMotion.matches || sharePreview || document.body.classList.contains('motion-paused') ? 1 : clamp(raw / 100);
    if (progress === lastProgress) return;
    lastProgress = progress;
    const arrived = progress === 1;
    loader.style.setProperty('--flight-progress', progress.toFixed(3));
    arena.style.setProperty('--aerial-line-offset', (1-progress).toFixed(3));
    const reveal = clamp(progress/.88);
    arrival.style.setProperty('--wire-reveal-solid', `${(reveal*120-20).toFixed(2)}%`);
    arrival.style.setProperty('--wire-reveal-edge', `${(reveal*120).toFixed(2)}%`);
    arrival.dataset.wireframeProgress = String(Math.round(progress*100));
    syncMotion(progress);
    arrival.dataset.aerialPhase = arrived ? 'photo-reveal' : 'wireframe';
    loader.classList.toggle('arena-arrived', arrived);
    loader.dataset.loaderPhase = arrived ? 'madison-square-garden' : 'flight';
    map.dataset.flightProgress = String(Math.round(progress * 100));
    map.dataset.flightStage = progress === 1 ? 'arrived' : progress < .35 ? 'departing' : progress < .8 ? 'cruising' : 'approaching';
    arena.dataset.wireframeProgress = String(Math.round(progress*100));
    trail.setAttribute('stroke-dashoffset', String(100 * (1 - progress)));
    const t = progress, u = 1 - t;
    const x = u*u*vegas[0] + 2*u*t*control[0] + t*t*newYork[0];
    const y = u*u*vegas[1] + 2*u*t*control[1] + t*t*newYork[1];
    const dx = 2*u*(control[0]-vegas[0]) + 2*t*(newYork[0]-control[0]);
    const dy = 2*u*(control[1]-vegas[1]) + 2*t*(newYork[1]-control[1]);
    plane.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(Math.atan2(dy,dx)*180/Math.PI+90).toFixed(2)})`);
  }
  new MutationObserver(syncProgress).observe(track, {attributes:true, attributeFilter:['aria-valuenow']});
  reducedMotion.addEventListener('change', syncProgress);
  window.addEventListener('bounce-motion-change', syncProgress);
  syncProgress();
})();
