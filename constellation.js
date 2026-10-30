/* Eight pinned lives and the ten relationships that connect them. */
(() => {
  'use strict';
  const network = document.getElementById('network');
  if (!network || typeof characters === 'undefined' || typeof edges === 'undefined') return;
  const section = document.getElementById('connections');
  const title = document.getElementById('connection-title');
  const detail = document.getElementById('connection-detail');
  const links = document.getElementById('connection-links');
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  const compactBoard = matchMedia('(max-width: 760px)');
  let pinnedId = 'zay', previewId = null;
  // Desktop spreads the same ten links across a shallow board. Phones retain
  // the compact arrangement so the faces and their labels never shrink away.
  const widePlaces = {zay:[47,8],ben:[10,17],lena:[31,46],morgan:[66,12],jude:[89,25],dani:[14,60],iris:[52,59],andre:[80,62]};
  const smallPlaces = {zay:[48,9],ben:[44,73],lena:[79,25],morgan:[35,39],jude:[57,48],dani:[18,17],iris:[15,52],andre:[81,64]};
  const getPlaces = () => characters.map(person => (compactBoard.matches ? smallPlaces : widePlaces)[person.id]);
  let places = getPlaces();
  const angles = [-3, 3.2, -4, 2.4, -2, 3, -2.7, 2];
  const byId = new Map(characters.map((person, index) => [person.id, { ...person, point: places[index] }]));
  const displayName = person => person.id === 'andre' ? 'Velvet' : person.short;
  const gradientFor = person => person.gradient || `linear-gradient(${person.color},${person.color})`;
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  section.classList.remove('astral-connections');
  section.classList.add('board-connections');
  network.classList.remove('constellation');
  network.classList.add('relationship-board');
  network.setAttribute('role', 'group');
  network.setAttribute('aria-label', 'Pinned relationship board. Choose a character to show all their connections.');
  function yarnMarkup() {
  const width = compactBoard.matches ? 600 : 1000, height = compactBoard.matches ? 600 : 350;
  const gradients = edges.map((edge, index) => {
    const from = byId.get(edge[0]), to = byId.get(edge[1]);
    // Zay carries every color along the strand; retain the other person's
    // own color at their pin rather than reducing this connection to yellow.
    const colors = from.spectrum ? [...from.spectrum, to.color] : to.spectrum ? [from.color, ...to.spectrum.slice().reverse()] : [from.color, to.color];
    const stops = colors.map((color, stop) => `<stop offset="${stop / (colors.length - 1)}" stop-color="${color}"/>`).join('');
    return `<linearGradient id="board-yarn-${index}" gradientUnits="userSpaceOnUse" x1="${from.point[0] * width / 100}" y1="${from.point[1] * height / 100}" x2="${to.point[0] * width / 100}" y2="${to.point[1] * height / 100}">${stops}</linearGradient>`;
  }).join('');
  const paths = edges.map((edge, index) => {
    const from = byId.get(edge[0]).point, to = byId.get(edge[1]).point;
    const ax = from[0] * width / 100, ay = from[1] * height / 100;
    const bx = to[0] * width / 100, by = to[1] * height / 100;
    const sag = Math.min(35, 9 + Math.hypot(bx - ax, by - ay) * .06);
    const path = `M${ax} ${ay} Q${(ax + bx) / 2 + (index % 2 ? -6 : 6)} ${(ay + by) / 2 + sag} ${bx} ${by}`;
    return `<g class="board-yarn" data-relationship="${index}" style="--yarn-color:url(#board-yarn-${index});--yarn-duration:${7 + index * .4}s;--yarn-delay:-${index * .8}s"><path class="board-yarn-shadow" d="${path}"/><path class="board-yarn-body" d="${path}"/><path class="board-yarn-fiber" d="${path}"/><path class="board-yarn-light" d="${path}" pathLength="100"/></g>`;
  }).join('');
  return `<svg class="board-threads" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>${gradients}</defs>${paths}</svg>`;
  }
  network.innerHTML = yarnMarkup();
  const buttons = characters.map((person, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'board-person';
    button.dataset.person = person.id;
    button.style.cssText = `left:${places[index][0]}%;top:${places[index][1]}%;--pin-color:${person.color};--pin-gradient:${gradientFor(person)};--clipping-angle:${angles[index]}deg`;
    button.setAttribute('aria-label', `Show all of ${person.name}’s relationships`);
    button.setAttribute('aria-controls', 'connection-links');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="board-pin" aria-hidden="true"></span><img src="assets/characters/${person.id}.png" alt="" width="1086" height="1448" loading="lazy" draggable="false"><span class="board-person-name">${escape(displayName(person))}</span><span class="board-file" aria-hidden="true">FILE ${String(index + 1).padStart(2, '0')}</span>`;
    button.addEventListener('click', () => selectPerson(person.id));
    button.addEventListener('pointerenter', event => {
      if (hoverPointer.matches && event.pointerType !== 'touch') selectPerson(person.id, true);
    });
    button.addEventListener('pointerleave', () => {
      if (previewId === person.id) restorePinned();
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const destination = event.key === 'Home' ? 0 : event.key === 'End' ? characters.length - 1 : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + characters.length) % characters.length;
      buttons[destination].focus({ preventScroll: true });
      selectPerson(characters[destination].id);
    });
    network.append(button);
    return button;
  });
  const status = document.createElement('span');
  status.className = 'board-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  network.append(status);
  const instruction = document.createElement('p');
  instruction.className = 'board-instruction';
  const updateInstruction = () => {
    instruction.textContent = hoverPointer.matches ? 'HOVER TO FOLLOW. CLICK TO KEEP OPEN.' : 'SELECT A PHOTO. FOLLOW THE THREADS.';
    if (!hoverPointer.matches) restorePinned();
  };
  network.after(instruction);
  const figure = document.createElement('div');
  figure.className = 'board-figure';
  network.before(figure);
  figure.append(network, instruction);
  function selectPerson(id, preview = false) {
    if (preview) previewId = id;
    else { pinnedId = id; previewId = null; }
    const person = byId.get(id);
    const connected = edges.map((edge, index) => ({ edge, index })).filter(({ edge }) => edge[0] === id || edge[1] === id);
    buttons.forEach(button => {
      const selected = button.dataset.person === id;
      const neighbor = connected.some(({ edge }) => edge[0] === button.dataset.person || edge[1] === button.dataset.person);
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-connected', neighbor && !selected);
      button.classList.toggle('is-pinned', button.dataset.person === pinnedId);
      button.classList.toggle('is-previewing', previewId !== null && button.dataset.person === previewId);
    });
    network.querySelectorAll('.board-yarn').forEach(thread => {
      thread.classList.toggle('is-active', connected.some(({ index }) => index === Number(thread.dataset.relationship)));
    });
    section.style.setProperty('--selected-pin', person.color);
    section.style.setProperty('--selected-gradient', gradientFor(person));
    section.dataset.selectedPerson = id;
    network.dataset.pinnedPerson = pinnedId;
    network.dataset.previewPerson = previewId || '';
    title.textContent = person.name;
    detail.textContent = `${connected.length} relationships. Every connection changes the terms.`;
    links.style.setProperty('--connection-count', connected.length);
    links.innerHTML = connected.map(({ edge }) => {
      const other = byId.get(edge[0] === id ? edge[1] : edge[0]);
      return `<section class="board-note" style="--connection-color:${other.color};--connection-gradient:${gradientFor(other)}"><h4>${escape(edge[2])}<span>${escape(displayName(person))} × ${escape(displayName(other))}</span></h4><p>${escape(edge[3])}</p></section>`;
    }).join('');
    status.textContent = `${person.name} ${preview ? 'previewed' : 'pinned'}. All ${connected.length} relationships are shown.`;
  }
  function restorePinned() { if (previewId !== null) selectPerson(pinnedId); }
  const updateBoardLayout = () => {
    places = getPlaces();
    characters.forEach((person, index) => {
      byId.get(person.id).point = places[index];
      buttons[index].style.left = `${places[index][0]}%`;
      buttons[index].style.top = `${places[index][1]}%`;
    });
    network.querySelector('.board-threads').outerHTML = yarnMarkup();
    selectPerson(previewId || pinnedId, previewId !== null);
  };
  network.addEventListener('pointerleave', restorePinned);
  hoverPointer.addEventListener('change', updateInstruction);
  compactBoard.addEventListener('change', updateBoardLayout);
  selectPerson('zay');
  updateInstruction();
  // Only a soft strand highlight moves. Stop it when the board is not visible.
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    network.classList.toggle('board-offscreen', !entries[0].isIntersecting);
  }, { threshold: .03 }) : null;
  observer?.observe(network);
  const visibility = () => network.classList.toggle('board-hidden', document.hidden);
  document.addEventListener('visibilitychange', visibility);
  visibility();
  window.addEventListener('pagehide', event => {
    if (!event.persisted) {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      hoverPointer.removeEventListener('change', updateInstruction);
      compactBoard.removeEventListener('change', updateBoardLayout);
    }
  });
})();
