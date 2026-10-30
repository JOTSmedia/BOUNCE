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
  map.appendChild(defs);
  map.appendChild(element('path', {d:mainland, class:'flight-land'}));
  const mesh = element('g', {'clip-path':'url(#flight-mainland-clip)', class:'flight-mesh'});
  let meshLines = '';
  const stepX = 70, stepY = 60;
  for (let row = 0; row < 11; row++) {
    const y = row * stepY;
    const offset = row % 2 ? stepX / 2 : 0;
    for (let col = -1; col < 17; col++) {
      const x = col * stepX + offset;
      meshLines += `M${x} ${y}h${stepX}M${x} ${y}l${stepX/2} ${stepY}M${x} ${y}l${-stepX/2} ${stepY}`;
    }
  }
  mesh.appendChild(element('path', {d:meshLines}));
  map.appendChild(mesh);
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

  // Original architectural concept drawing: circular arena elevation above an
  // overhead bowl/court plan. Inspired by blueprint drafting, not a reproduction
  // of the user's framed retail print and not an engineering document.
  const arena = element('svg', {viewBox:'0 0 1200 790', preserveAspectRatio:'xMidYMid meet', 'aria-hidden':'true', focusable:'false', class:'arena-wireframe'});
  const line = (d, kind='blueprint-detail') => arena.appendChild(element('path', {d,class:kind}));
  const ellipse = (cx,cy,rx,ry,kind='blueprint-detail') => arena.appendChild(element('ellipse', {cx,cy,rx,ry,class:kind}));
  const rect = (x,y,width,height,kind='blueprint-detail') => arena.appendChild(element('rect', {x,y,width,height,class:kind}));
  const label = (x,y,text,kind='blueprint-caption') => {
    const el=element('text',{x,y,class:kind});el.textContent=text;arena.appendChild(el);
  };
  const curve = (cx,cy,rx,ry,start,end,steps=40) => {
    let d='';for(let i=0;i<=steps;i++){
      const t=start+(end-start)*i/steps;
      d+=`${i?'L':'M'}${(cx+rx*Math.cos(t)).toFixed(2)} ${(cy+ry*Math.sin(t)).toFixed(2)}`;
    }return d;
  };
  label(190,34,'MADISON SQUARE GARDEN', 'blueprint-title');
  label(190,59,'NEW YORK CITY · CONCEPT ELEVATION');
  // Drum, roof rim, roof members, facade mullions, and front curtain-wall bands.
  ellipse(600,118,366,52,'blueprint-structure');
  ellipse(600,118,351,45);
  ellipse(600,118,326,37,'blueprint-faint');
  line('M234 118V321M966 118V321','blueprint-structure');
  line(curve(600,321,366,18,0,Math.PI),'blueprint-structure');
  for(let i=0;i<=66;i++){
    const t=i*Math.PI/66,x=600+366*Math.cos(t),yt=118+52*Math.sin(t),yb=321+18*Math.sin(t);
    line(`M${x.toFixed(2)} ${yt.toFixed(2)}V${yb.toFixed(2)}`,i%6===0?'blueprint-structure':'blueprint-detail');
    if(i%6===0)line(`M${(x+3).toFixed(2)} ${yt.toFixed(2)}V${yb.toFixed(2)}`);
  }
  for(let j=1;j<=15;j++){
    const k=j/16;
    line(curve(600,118+(321-118)*k,366,52+(18-52)*k,0,Math.PI),j===3||j===13?'blueprint-structure':'blueprint-detail');
  }
  for(let i=0;i<34;i++){
    const t=i*2*Math.PI/34;
    line(`M${600+326*Math.cos(t)} ${118+37*Math.sin(t)}L${600+366*Math.cos(t)} ${118+52*Math.sin(t)}`,'blueprint-faint');
  }
  // Lobby volume projects forward from the drum; blank boards avoid event brands.
  line('M218 245L284 218L402 242V334L218 328Z','blueprint-solid');
  line('M218 245L338 261L402 242M338 261V337M218 306L338 317L402 303','blueprint-structure');
  for(let x=230;x<335;x+=13)line(`M${x} ${245+(x-218)*.133}V${329+(x-218)*.07}`);
  for(let y=270;y<320;y+=12)line(`M218 ${y-15}L338 ${y}`);
  rect(355,258,39,43,'blueprint-board');
  rect(480,229,110,70,'blueprint-board');
  rect(760,207,118,72,'blueprint-board');
  rect(484,233,102,62);rect(764,211,110,64);
  for(let x=430;x<935;x+=18)rect(x,319,12,17);
  line('M192 349H1008','blueprint-guide');
  line('M192 345V353M1008 345V353','blueprint-detail');
  // Overhead ring, concourse, radial sections, and independently delineated tiers.
  const cx=600,cy=576;
  ellipse(cx,cy,239,174,'blueprint-structure');
  ellipse(cx,cy,230,167);ellipse(cx,cy,219,157,'blueprint-structure');
  ellipse(cx,cy,198,143);ellipse(cx,cy,185,132,'blueprint-structure');
  ellipse(cx,cy,166,117);ellipse(cx,cy,152,106,'blueprint-structure');
  ellipse(cx,cy,130,89);ellipse(cx,cy,114,78,'blueprint-structure');
  ellipse(cx,cy,91,61);
  for(let tier=0;tier<4;tier++){
    const rx=122+tier*29,ry=84+tier*21;
    for(let section=0;section<32;section++){
      const t=section*2*Math.PI/32+.025,end=(section+1)*2*Math.PI/32-.025;
      const outer=curve(cx,cy,rx+21,ry+15,t,end,5);
      const inner=curve(cx,cy,rx,ry,end,t,5).replace(/^M/,'L');
      line(outer+inner+'Z');
      for(let seatRow=1;seatRow<3;seatRow++)line(curve(cx,cy,rx+seatRow*7,ry+seatRow*5,t,end,5),'blueprint-faint');
    }
  }
  for(let i=0;i<16;i++){
    const t=i*2*Math.PI/16,ex=cx+240*Math.cos(t),ey=cy+175*Math.sin(t);
    const exit=element('rect',{x:ex-12,y:ey-7,width:24,height:14,transform:`rotate(${t*180/Math.PI+90} ${ex} ${ey})`,class:'blueprint-detail'});
    arena.appendChild(exit);
    line(`M${cx+219*Math.cos(t)} ${cy+157*Math.sin(t)}L${ex} ${ey}`,'blueprint-structure');
  }
  // Center basketball floor and markings, kept geometrically readable at small size.
  rect(528,536,144,80,'blueprint-structure');
  rect(537,541,126,70);
  line('M600 541V611');ellipse(600,576,12,12);
  rect(537,561,22,30);rect(641,561,22,30);
  line('M541 566V586M659 566V586');
  ellipse(559,576,12,12);ellipse(641,576,12,12);
  line('M537 546H546Q594 576 546 606H537M663 546H654Q606 576 654 606H663');
  label(190,405,'ARENA PLAN · SCHEMATIC');
  label(865,736,'NOT TO SCALE','blueprint-note');
  // Original vector art replaces the flight in its reserved slot, so neither the
  // logo nor the loading controls are covered by dense architectural lines.
  mapWrap.appendChild(arena);
  loader.classList.add('has-arena-wireframe', 'has-flight-map');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sharePreview = new URLSearchParams(location.search).has('share-preview');
  let lastProgress = -1;
  function syncProgress() {
    const raw = Number(track.getAttribute('aria-valuenow')) || 0;
    const progress = reducedMotion.matches || sharePreview || document.body.classList.contains('motion-paused') ? 1 : clamp(raw / 100);
    if (progress === lastProgress) return;
    lastProgress = progress;
    const arrived = progress === 1;
    loader.style.setProperty('--flight-progress', progress.toFixed(3));
    loader.classList.toggle('arena-arrived', arrived);
    loader.dataset.loaderPhase = arrived ? 'madison-square-garden' : 'flight';
    map.dataset.flightProgress = String(Math.round(progress * 100));
    map.dataset.flightStage = progress === 1 ? 'arrived' : progress < .35 ? 'departing' : progress < .8 ? 'cruising' : 'approaching';
    arena.dataset.wireframeProgress = arrived ? '100' : '0';
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
