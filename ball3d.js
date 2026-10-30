// One complete CC0 basketball model supplies every visible side of every logo.
// The fallback is a still rendered from this same model, never the old photo.
(async function mountBasketballLogos() {
  const FALLBACK = './assets/basketball-model.png';
  const MODEL = './assets/basketball-cc0.glb';
  const BRAND = './assets/bounce-ball-brand.png';
  const loader = document.getElementById('loader');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sharePreview = new URLSearchParams(location.search).has('share-preview');
  const originals = [...document.querySelectorAll('.wordmark .ball, .brand > .ball')];
  if (!originals.length) return;
  let THREE = null, model = null, modelCenter = null, modelScale = 1, brandTexture = null;
  let frame = 0, previousFrame = 0, disposed = false;
  let loaderActive = false;
  const states = originals.map(original => {
    const isLoader = !!original.closest('.loading-wordmark');
    const isBrand = !!original.closest('.brand');
    const slot = document.createElement('span');
    slot.className = isLoader ? 'ball-slot' : 'ball-slot ball-ambient';
    slot.setAttribute('aria-hidden', 'true');
    Object.assign(slot.style, {position: 'relative', display: 'block', flex: 'none',
      width: isBrand ? '26px' : '.92em', height: isBrand ? '26px' : '.92em',
      margin: isBrand ? '0 1px' : '0 .025em'});
    const bouncer = document.createElement('span');
    bouncer.className = 'ball-bouncer';
    Object.assign(bouncer.style, {position: 'absolute', inset: '0', width: '100%', height: '100%', animation: 'none'});
    const shadow = document.createElement('span');
    shadow.className = 'ball-shadow'; shadow.style.animation = 'none';
    const image = document.createElement('img');
    image.className = 'ball-fallback'; image.src = FALLBACK; image.alt = '';
    Object.assign(image.style, {position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%', objectFit: 'contain',
      filter: 'brightness(.84) saturate(.88) sepia(.12)'});
    bouncer.append(image); slot.append(shadow, bouncer); original.replaceWith(slot);
    slot.dataset.rendering = 'model-still';
    return {slot, bouncer, shadow, image, isLoader, isBrand, visible: false,
      time: 0, spin: 0, hopStart: -100, hopPeak: .08, nextHop: 1.5 + Math.random() * 4,
      turnDuration: 6.2 + Math.random() * .8, turnDirection: Math.random() < .5 ? -1 : 1,
      axisTilt: {x: (Math.random() - .5) * .36, z: (Math.random() - .5) * .24},
      axis: null,
      renderer: null, scene: null, camera: null, rotor: null, canvas: null,
      materials: [], seamUniforms: [], failed: false, angle: 0};
  });
  const loadingBall = states.find(state => state.isLoader);
  const staticMode = () => reduced.matches || sharePreview;
  const paused = () => document.body.classList.contains('motion-paused');
  const loaderShowing = () => !!loader && !loader.hidden && !loader.classList.contains('hidden');

  // A hand-driven dribble in world meters. Progress, rather than a second
  // wall clock, drives this sequence so the ball and the displayed 100% agree.
  // The final smaller bounce and forward-facing catch finish before the hold.
  const GRAVITY = 9.81, WORLD_HEIGHT = 1.05, DISPLAY_HEIGHT = .72;
  const PUSH_VELOCITY = -3.4, RESTITUTION = .84;
  const IMPACT_SPEED = Math.sqrt(PUSH_VELOCITY ** 2 + 2 * GRAVITY * WORLD_HEIGHT);
  const DOWN_TIME = (PUSH_VELOCITY + IMPACT_SPEED) / GRAVITY;
  const UP_VELOCITY = IMPACT_SPEED * RESTITUTION;
  const UP_TIME = (UP_VELOCITY - Math.sqrt(UP_VELOCITY ** 2 - 2 * GRAVITY * WORLD_HEIGHT)) / GRAVITY;
  const CYCLE_TIME = DOWN_TIME + UP_TIME;
  const LOAD_DURATION = 5.2;
  const FULL_DRIBBLES = Math.floor((LOAD_DURATION - DOWN_TIME) / CYCLE_TIME);
  const FINALE_START = FULL_DRIBBLES * CYCLE_TIME;
  const FINALE_DURATION = LOAD_DURATION - FINALE_START;
  const LAST_BOUNCE_DURATION = FINALE_DURATION - DOWN_TIME;
  const REST_ANGLE = 2 * Math.PI * 2;
  // Choose one angular scale for the entire sequence. Its last-cycle braking
  // curve integrates to exactly two full turns, never requiring a late reversal.
  const SPIN_SCALE = REST_ANGLE / (FULL_DRIBBLES * (3 * DOWN_TIME + 2.7 * UP_TIME) + 3 * FINALE_DURATION / 2);
  const PUSH_SPIN = 3 * SPIN_SCALE, RETURN_SPIN = 2.7 * SPIN_SCALE;
  const CYCLE_ANGLE = PUSH_SPIN * DOWN_TIME + RETURN_SPIN * UP_TIME;
  // Every turn visits the unbranded side. Front-weighted timing slows smoothly
  // near the printed face and moves faster through the back without stopping,
  // reversing, drifting the spin axis, or substituting bounded rocking.
  function frontWeightedSpin(phase, weight) {
    return {angle: phase - weight * Math.sin(phase), speedFactor: 1 - weight * Math.cos(phase)};
  }
  function drivenState(seconds) {
    const cycle = Math.floor(seconds / CYCLE_TIME), phase = seconds - cycle * CYCLE_TIME;
    const downward = phase < DOWN_TIME, t = downward ? phase : phase - DOWN_TIME;
    return {
      height: Math.max(0, downward ? WORLD_HEIGHT + PUSH_VELOCITY * t - .5 * GRAVITY * t * t : UP_VELOCITY * t - .5 * GRAVITY * t * t),
      velocity: (downward ? PUSH_VELOCITY : UP_VELOCITY) - GRAVITY * t,
      angle: cycle * CYCLE_ANGLE + (downward ? PUSH_SPIN * t : PUSH_SPIN * DOWN_TIME + RETURN_SPIN * t),
      omega: downward ? PUSH_SPIN : RETURN_SPIN,
      phase: downward ? 'hand-to-floor' : 'floor-to-hand'
    };
  }
  function dribbleState(progress) {
    if (progress >= 1) return {height: 0, velocity: 0, angle: REST_ANGLE, omega: 0, phase: 'settled'};
    const seconds = Math.max(0, progress) * LOAD_DURATION;
    if (seconds < FINALE_START) return drivenState(seconds);
    const t = seconds - FINALE_START, u = t / FINALE_DURATION;
    // Integrating 1-smoothstep(u) gives continuous forward spin, with zero
    // angular velocity/acceleration at the exact front-facing resting pose.
    const angle = FULL_DRIBBLES * CYCLE_ANGLE + PUSH_SPIN * FINALE_DURATION * (u - u * u * u + .5 * u * u * u * u);
    const omega = PUSH_SPIN * (1 - 3 * u * u + 2 * u * u * u);
    let height, velocity, phase;
    if (t < DOWN_TIME) {
      height = WORLD_HEIGHT + PUSH_VELOCITY * t - .5 * GRAVITY * t * t;
      velocity = PUSH_VELOCITY - GRAVITY * t;
      phase = 'final-hand-to-floor';
    } else {
      const bounceTime = t - DOWN_TIME, duration = LAST_BOUNCE_DURATION;
      const bounceVelocity = GRAVITY * duration / 2;
      const catchStart = duration * .8;
      if (bounceTime < catchStart) {
        height = bounceVelocity * bounceTime - .5 * GRAVITY * bounceTime * bounceTime;
        velocity = bounceVelocity - GRAVITY * bounceTime;
        phase = 'final-small-bounce';
      } else {
        // A brief final catch matches the falling arc's position and speed,
        // then brings both to zero at 100%, rather than bouncing afterward.
        const catchDuration = duration - catchStart;
        const h = bounceVelocity * catchStart - .5 * GRAVITY * catchStart * catchStart;
        const v = bounceVelocity - GRAVITY * catchStart;
        const x = (bounceTime - catchStart) / catchDuration, x2 = x * x, x3 = x2 * x;
        height = (2 * x3 - 3 * x2 + 1) * h + (x3 - 2 * x2 + x) * catchDuration * v;
        velocity = ((6 * x2 - 6 * x) * h + (3 * x2 - 4 * x + 1) * catchDuration * v) / catchDuration;
        phase = 'final-catch';
      }
    }
    return {height: Math.max(0, height), velocity, angle, omega, phase};
  }

  function addSeamLight(material, state) {
    // Only the model's dark rubber seam texels emit orange. Its UVs move with
    // the full mesh, so the light stays on the real seams on every side.
    const uniform = {value: .88}; state.seamUniforms.push(uniform);
    material.onBeforeCompile = shader => {
      shader.uniforms.bounceSeamTime = uniform;
      shader.uniforms.bounceBrand = {value: brandTexture};
      shader.uniforms.bounceHasBrand = {value: !!brandTexture};
      shader.vertexShader = 'varying vec3 bounceLocalPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n bounceLocalPosition = position;');
      shader.fragmentShader = `
        uniform float bounceSeamTime;
        uniform sampler2D bounceBrand;
        uniform bool bounceHasBrand;
        varying vec3 bounceLocalPosition;
        float bounceLeatherHash(vec3 p) {
          p = fract(p * .1031);
          p += dot(p, p.yzx + 33.33);
          return fract((p.x + p.y) * p.z);
        }
        float bounceLeatherNoise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(bounceLeatherHash(i), bounceLeatherHash(i + vec3(1,0,0)), f.x),
                         mix(bounceLeatherHash(i + vec3(0,1,0)), bounceLeatherHash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(bounceLeatherHash(i + vec3(0,0,1)), bounceLeatherHash(i + vec3(1,0,1)), f.x),
                         mix(bounceLeatherHash(i + vec3(0,1,1)), bounceLeatherHash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        #include <map_fragment>
        float bounceSeam = 0.0;
        float bounceRunner = 0.0;
        float bounceScuff = 0.0;
        float bounceBurnish = 0.0;
        #ifdef USE_MAP
          float redness = (diffuseColor.r - max(diffuseColor.g, diffuseColor.b)) / max(.003, diffuseColor.r);
          bounceSeam = (1.0 - smoothstep(.10, .30, redness)) * (1.0 - smoothstep(.10, .28, max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b))));
          float sweep = fract(vMapUv.x * .78 + vMapUv.y * .22 - bounceSeamTime / 3.8);
          float distance = min(sweep, 1.0 - sweep);
          bounceRunner = exp(-pow(distance / .055, 2.0));
        #endif
        // Object-space weathering is continuous over the entire sphere. It
        // turns with the leather, with no pasted patch or UV-edge repetition.
        // The source pebbled normal and recessed channels remain unchanged.
        vec3 leatherPoint = normalize(bounceLocalPosition);
        float patina = bounceLeatherNoise(leatherPoint * 7.5 + vec3(3.1, 1.7, 5.2));
        float grainWear = bounceLeatherNoise(leatherPoint * 43.0 + vec3(8.3, 4.6, 2.1));
        float abrasion = bounceLeatherNoise(leatherPoint * vec3(118.0, 15.0, 51.0) + vec3(9.7, 6.4, 11.2));
        float leatherMask = 1.0 - bounceSeam;
        bounceBurnish = smoothstep(.48, .73, patina) * leatherMask;
        bounceScuff = smoothstep(.56, .76, grainWear) * smoothstep(.45, .72, patina);
        float fineScuff = smoothstep(.67, .86, abrasion) * smoothstep(.39, .65, grainWear);
        // Warm oxidized orange-brown, with low-contrast handling marks and
        // small pale abrasions rather than broad artificial dark stains.
        vec3 agedLeather = diffuseColor.rgb * vec3(.72, .69, .62) * mix(.94, 1.06, patina);
        agedLeather = mix(agedLeather, agedLeather * vec3(1.24, 1.25, 1.23) + vec3(.008, .006, .003),
          min(.34, bounceScuff * .42 + fineScuff * .20));
        diffuseColor.rgb = mix(diffuseColor.rgb, agedLeather, leatherMask);
        if (bounceHasBrand) {
          // Curved ink coordinates, anchored to the source mesh. These basis
          // vectors are inverse(Qz90 * Qy120) of camera right/up/forward.
          vec3 n = normalize(bounceLocalPosition);
          float right = dot(n, vec3(0.0, -1.0, 0.0));
          float up = dot(n, vec3(-.5, 0.0, .8660254038));
          float forward = dot(n, vec3(-.8660254038, 0.0, -.5));
          vec2 inkUv = vec2(.5 + atan(right, forward) / 1.25,
            .5 + atan(up, sqrt(right * right + forward * forward)) / .8125);
          if (forward > 0.0 && inkUv.x >= 0.0 && inkUv.x <= 1.0 && inkUv.y >= 0.0 && inkUv.y <= 1.0) {
            vec4 ink = texture2D(bounceBrand, inkUv);
            // Ink changes albedo only. The existing pebbled normal and lighting
            // remain, so the branding is printed into the leather, not a card.
            diffuseColor.rgb = mix(diffuseColor.rgb, ink.rgb, ink.a);
            bounceSeam *= 1.0 - ink.a;
          }
        }
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        // Repeated handling lightly polishes the pebble tops; abrasions stay
        // matte. This variation changes the highlight, not the ball's shape.
        roughnessFactor = clamp(roughnessFactor + .035 - bounceBurnish * .07 + bounceScuff * .045, .52, .96);
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1.0, .19, .018) * bounceSeam * (.08 + 1.2 * bounceRunner);
      `);
    };
    material.customProgramCacheKey = () => 'bounce-weathered-leather-brand-v3';
  }
  function buildRenderer(state) {
    if (!THREE || !model || state.renderer || state.failed || disposed) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'ball-real'; canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%', visibility: 'hidden'});
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'}); }
    catch { state.failed = true; return; }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    const scene = new THREE.Scene();
    // Mild perspective makes the channels visibly wrap away around the ball.
    // Camera distance keeps exactly the same .956-diameter screen silhouette.
    const fieldOfView = 34;
    const camera = new THREE.PerspectiveCamera(fieldOfView, 1, .1, 10);
    const screenRadius = .956 * Math.tan(THREE.MathUtils.degToRad(fieldOfView / 2));
    camera.position.set(0, 0, Math.sqrt(1 + 1 / (screenRadius * screenRadius))); camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x927563, 1.0));
    const key = new THREE.DirectionalLight(0xfff4e8, 4.0); key.position.set(-3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, .9); fill.position.set(4, 1, 3); scene.add(fill);
    const lowFill = new THREE.DirectionalLight(0xffead8, .45); lowFill.position.set(-1, -3, 2); scene.add(lowFill);
    const copy = model.clone(true);
    copy.position.sub(modelCenter);
    copy.traverse(object => {
      if (!object.isMesh) return;
      const cloneMaterial = source => {
        const material = source.clone();
        // Retain the full UV texture and recessed-channel normal map. A slightly
        // broader highlight reads as warm pebbled leather rather than plastic.
        material.roughness = Math.max(material.roughness, .62);
        if (material.map) material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        addSeamLight(material, state); state.materials.push(material); return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(cloneMaterial) : cloneMaterial(object.material);
    });
    const normalized = new THREE.Group(); normalized.scale.setScalar(modelScale); normalized.add(copy);
    // Match the model-rendered still: this three-quarter orientation shows
    // the channels curving around the surface instead of facing a seam edge-on.
    const poseZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    const poseY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 2 / 3);
    normalized.quaternion.copy(poseZ.multiply(poseY));
    const rotor = new THREE.Group(); rotor.add(normalized); scene.add(rotor);
    // A fixed, slightly tilted horizontal axis gives the loader real backspin
    // and reveals the back of the ball. Page logos turn about their own fixed,
    // mainly vertical axes; each complete turn returns to the printed front.
    const axis = state.isLoader ? new THREE.Vector3(1, .12, .18).normalize()
      : new THREE.Vector3(state.axisTilt.x, 1, state.axisTilt.z).normalize();
    Object.assign(state, {renderer, scene, camera, rotor, canvas, axis});
    if (state.isLoader) rotor.quaternion.setFromAxisAngle(axis, state.angle);
    else orientAmbient(state);
    state.bouncer.append(canvas);
    renderer.setSize(Math.max(1, state.slot.clientWidth), Math.max(1, state.slot.clientWidth), false);
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); state.failed = true; canvas.style.visibility = 'hidden'; state.image.style.visibility = 'visible'; state.slot.dataset.rendering = 'model-still'; });
    canvas.addEventListener('webglcontextrestored', () => { state.failed = false; render(state); start(); });
    render(state);
  }
  function render(state, seamTime = state.time) {
    if (!state.renderer || state.failed || disposed) {
      state.image.style.transform = staticMode() ? 'none' : `rotate(${state.isLoader ? state.angle : state.angle * .14}rad)`;
      return;
    }
    for (const uniform of state.seamUniforms) uniform.value = staticMode() ? .88 : seamTime;
    try {
      state.renderer.render(state.scene, state.camera);
      state.image.style.visibility = 'hidden'; state.canvas.style.visibility = 'visible';
      state.slot.dataset.rendering = 'webgl-model';
    } catch {
      state.failed = true; state.canvas.style.visibility = 'hidden'; state.image.style.visibility = 'visible';
      state.slot.dataset.rendering = 'model-still';
    }
  }
  function moveBall(state, height, maxHeight) {
    state.bouncer.style.transform = `translateY(${-height * 100}%)`;
    const distance = Math.min(1, height / maxHeight);
    state.shadow.style.opacity = String(.23 + (1 - distance) * .55);
    state.shadow.style.transform = `scaleX(${.62 + distance * .57}) scaleY(${.66 + distance * .72})`;
    state.shadow.style.filter = `blur(${.012 + distance * .035}em)`;
  }
  function orientAmbient(state) {
    const phase = state.time * Math.PI * 2 / state.turnDuration;
    const rotation = frontWeightedSpin(phase, .80);
    const angle = state.turnDirection * rotation.angle;
    const velocity = state.turnDirection * Math.PI * 2 / state.turnDuration * rotation.speedFactor;
    state.angle = angle; state.spin = angle;
    if (state.rotor) {
      state.rotor.quaternion.setFromAxisAngle(state.axis, angle);
      state.slot.dataset.ambientAxis = state.axis.toArray().map(n => n.toFixed(3)).join(',');
      state.slot.dataset.ambientAngle = angle.toFixed(6);
      state.slot.dataset.ambientAngularVelocity = velocity.toFixed(6);
      state.slot.dataset.ambientTurnDuration = state.turnDuration.toFixed(3);
      const facing = Math.cos(angle);
      state.slot.dataset.brandingPose = facing > .7 ? 'front-facing' : facing < -.7 ? 'unbranded-side' : 'turning';
    }
  }

  function drawAmbient(state, delta) {
    state.time += delta;
    if (state.time >= state.nextHop) {
      state.hopStart = state.time; state.hopPeak = .055 + Math.random() * .065;
      state.nextHop = state.time + 2 * Math.sqrt(2 * state.hopPeak / 3) + 3 + Math.random() * 5;
    }
    const hopTime = state.time - state.hopStart;
    const height = Math.max(0, Math.sqrt(6 * state.hopPeak) * hopTime - 1.5 * hopTime * hopTime);
    moveBall(state, height, .12);
    orientAmbient(state);
    render(state);
  }
  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || staticMode() || paused()) { previousFrame = 0; return; }
    const delta = previousFrame ? Math.min(.05, (now - previousFrame) / 1000) : 0; previousFrame = now;
    if (loaderActive && loadingBall) {
      const progress = Number(loader.querySelector('.loading-track')?.getAttribute('aria-valuenow') || 0);
      const fill = document.getElementById('loading-progress')?.style.transform;
      const precise = Number(fill?.match(/^scaleX\(([^)]+)\)$/)?.[1]);
      // The visible counter rounds to 100 at .995. Reach rest at that same
      // threshold; keep sub-percent precision throughout the moving sequence.
      const fraction = progress >= 100 ? 1 : Math.max(0, Math.min(1, Number.isFinite(precise) ? precise / .995 : progress / 100));
      const motion = dribbleState(fraction);
      const rotation = frontWeightedSpin(motion.angle, .65);
      const angle = rotation.angle, omega = motion.omega * rotation.speedFactor;
      loadingBall.time = fraction * LOAD_DURATION; loadingBall.angle = angle;
      loadingBall.slot.dataset.dribblePhase = motion.phase; loadingBall.slot.dataset.dribbleProgress = String(progress);
      loadingBall.slot.dataset.spinAngle = angle.toFixed(6);
      loadingBall.slot.dataset.spinVelocity = omega.toFixed(6);
      loadingBall.slot.dataset.dribbleHeight = motion.height.toFixed(6);
      loadingBall.slot.dataset.brandingPose = fraction >= 1 ? 'front-facing' : 'dribbling';
      moveBall(loadingBall, motion.height / WORLD_HEIGHT * DISPLAY_HEIGHT, DISPLAY_HEIGHT);
      if (loadingBall.rotor) {
        if (fraction >= 1) loadingBall.rotor.quaternion.identity();
        else loadingBall.rotor.quaternion.setFromAxisAngle(loadingBall.axis, angle);
      }
      render(loadingBall, loadingBall.time * 1.4);
    } else if (!loaderShowing()) {
      for (const state of states) if (!state.isLoader && state.visible) drawAmbient(state, delta);
    }
    if (loaderActive || states.some(state => !state.isLoader && state.visible)) frame = requestAnimationFrame(tick);
    else previousFrame = 0;
  }
  function start() { if (!frame && !disposed && !document.hidden && !staticMode() && !paused()) frame = requestAnimationFrame(tick); }
  function sync() {
    const playing = loaderShowing() && loader.classList.contains('playing');
    if (playing && !loaderActive) {
      if (loadingBall) { loadingBall.time = 0; loadingBall.angle = 0; loadingBall.rotor?.quaternion.identity(); }
    }
    loaderActive = playing;
    if (staticMode() || paused()) {
      cancelAnimationFrame(frame); frame = 0; previousFrame = 0;
      for (const state of states) { moveBall(state, 0, 1); render(state); }
    } else start();
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) { const state = states.find(item => item.slot === entry.target); if (state) state.visible = entry.isIntersecting; }
    start();
  });
  const resize = new ResizeObserver(entries => {
    for (const entry of entries) {
      const state = states.find(item => item.slot === entry.target);
      if (!state?.renderer || state.failed) continue;
      const size = Math.max(1, state.slot.clientWidth); state.renderer.setSize(size, size, false); render(state);
    }
  });
  for (const state of states) { visibility.observe(state.slot); resize.observe(state.slot); moveBall(state, 0, 1); }
  const loaderObserver = new MutationObserver(sync);
  if (loader) loaderObserver.observe(loader, {attributes: true, attributeFilter: ['class', 'hidden', 'style']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('bounce-motion-change', sync);
  window.addEventListener('pagehide', event => {
    if (event.persisted) return; disposed = true; cancelAnimationFrame(frame);
    visibility.disconnect(); resize.disconnect(); loaderObserver.disconnect();
    for (const state of states) { for (const material of state.materials) material.dispose(); state.renderer?.dispose(); }
    const geometries = new Set(), textures = new Set();
    model?.traverse(object => { if (!object.isMesh) return; geometries.add(object.geometry); for (const material of [object.material].flat()) for (const value of Object.values(material)) if (value?.isTexture) textures.add(value); });
    for (const geometry of geometries) geometry.dispose(); for (const texture of textures) texture.dispose(); brandTexture?.dispose();
  });
  sync();
  try {
    const modules = await Promise.all([import('./assets/three.module.js'), import('./assets/GLTFLoader.js')]);
    THREE = modules[0];
    const [gltf, ink] = await Promise.all([
      new modules[1].GLTFLoader().loadAsync(MODEL),
      new THREE.TextureLoader().loadAsync(BRAND).catch(() => null)
    ]);
    if (disposed) { ink?.dispose(); return; }
    brandTexture = ink;
    if (brandTexture) { brandTexture.colorSpace = THREE.SRGBColorSpace; brandTexture.anisotropy = 8; }
    model = gltf.scene; model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3());
    modelCenter = bounds.getCenter(new THREE.Vector3()); modelScale = 2 / Math.max(size.x, size.y, size.z);
    for (const state of states) buildRenderer(state);
    sync();
  } catch { /* The identical model still remains visible if 3D is unavailable. */ }
})();
