// Stanoviště (SPEC kap. 2). Souřadnice pro praváka (forhend = vpravo = +x). mirror: true -> pro leváka x -> -x
// a v textech se prohodí doleva/doprava (src/domain/stations.js swapLR). Kužel 1 je vždy na bekhendové straně.
const SUB = 'Nemáš kužely? Stačí boty, ponožky srolované do kuličky nebo kousek lepicí pásky na zemi.';

export const stations = [
  {
    id: 'spot', name: 'Malý prostor', short: '1 × 2 m, 2 značky', size: [1.4, 2], space: 'small', minCones: 2, mirror: true,
    home: { x: 0, y: 0 },
    cones: [ { n: 1, x: -0.5, y: 0.7, color: 'red' }, { n: 2, x: 0.5, y: 0.7, color: 'blue' } ],
    voiceSetup: 'setup_spot',
    quiet: true,
    setupSteps: [
      { text: 'Najdi volné místo. Rozpaž ruce s holí a zatoč se: nic se nesmí dotknout.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden malý krok před sebe a trochu doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož stejně daleko, ale doprava. Mezi kužely je asi jeden metr.', highlight: [2] },
      { text: 'Ty stojíš v domečku za kužely. Tablet dej daleko dopředu, kam hůl nedosáhne.', highlight: [1, 2] },
    ],
  },
  {
    id: 'triangle', name: 'Trojúhelník', short: '3 kužely', size: [2.6, 2.8], space: 'medium', minCones: 3, mirror: true,
    home: { x: 0, y: 0 },
    cones: [ { n: 1, x: -0.9, y: 1.1, color: 'red' }, { n: 2, x: 0.9, y: 1.1, color: 'blue' }, { n: 3, x: 0, y: 2.2, color: 'yellow' } ],
    voiceSetup: 'setup_triangle',
    setupSteps: [
      { text: 'Stoupni si do domečku. Tablet je daleko před tebou.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden velký krok dopředu a doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož jeden velký krok dopředu a doprava.', highlight: [2] },
      { text: 'Žlutý kužel tři dej doprostřed, o další velký krok dál.', highlight: [3] },
      { text: 'Hotovo! Máš trojúhelník. Tablet je až za žlutým kuželem.', highlight: [1, 2, 3] },
    ],
  },
  {
    id: 'square', name: 'Čtverec', short: '4 kužely', size: [2.8, 3.2], space: 'medium', minCones: 4, mirror: true,
    home: { x: 0, y: 0 },
    cones: [
      { n: 1, x: -0.9, y: 0.8, color: 'red' }, { n: 2, x: 0.9, y: 0.8, color: 'blue' },
      { n: 3, x: 0.9, y: 2.4, color: 'yellow' }, { n: 4, x: -0.9, y: 2.4, color: 'green' },
    ],
    voiceSetup: 'setup_square',
    setupSteps: [
      { text: 'Stoupni si do domečku. Tablet je daleko před tebou.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož malý krok dopředu a velký krok doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož malý krok dopředu a velký krok doprava.', highlight: [2] },
      { text: 'Žlutý kužel tři polož dva velké kroky za modrý.', highlight: [3] },
      { text: 'Zelený kužel čtyři polož dva velké kroky za červený.', highlight: [4] },
      { text: 'Hotovo! Máš čtverec. Uvnitř nesmí nic ležet.', highlight: [1, 2, 3, 4] },
    ],
  },
  {
    id: 'line', name: 'Slalom', short: '4 kužely v řadě', size: [1.6, 4.4], space: 'large', minCones: 4, mirror: true,
    home: { x: 0, y: 0 },
    cones: [
      { n: 1, x: 0, y: 0.9, color: 'red' }, { n: 2, x: 0, y: 1.8, color: 'blue' },
      { n: 3, x: 0, y: 2.7, color: 'yellow' }, { n: 4, x: 0, y: 3.6, color: 'green' },
    ],
    voiceSetup: 'setup_line',
    setupSteps: [
      { text: 'Stoupni si do domečku. Před tebou postavíme rovnou řadu.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden velký krok před sebe.', highlight: [1] },
      { text: 'Modrý kužel dva dej o další velký krok dál.', highlight: [2] },
      { text: 'Žlutý kužel tři zase o velký krok dál.', highlight: [3] },
      { text: 'Zelený kužel čtyři je poslední. Za ním musí být ještě kus volného místa na otočku.', highlight: [4] },
      { text: 'Hotovo! Máš slalom. Tablet dej stranou, ne hned za poslední kužel.', highlight: [1, 2, 3, 4] },
    ],
  },
  {
    id: 'zigzag', name: 'Cik-cak', short: '5 kuželů do W', size: [2.6, 4.6], space: 'large', minCones: 5, mirror: true,
    home: { x: 0, y: 0 },
    cones: [
      { n: 1, x: -0.8, y: 0.8, color: 'red' }, { n: 2, x: 0.8, y: 1.6, color: 'blue' },
      { n: 3, x: -0.8, y: 2.4, color: 'yellow' }, { n: 4, x: 0.8, y: 3.2, color: 'green' },
      { n: 5, x: -0.8, y: 4.0, color: 'white' },
    ],
    voiceSetup: 'setup_zigzag',
    setupSteps: [
      { text: 'Stoupni si do domečku. Postavíme cik-cak jako písmeno W.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož kousek dopředu a doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož o krok dál a doprava.', highlight: [2] },
      { text: 'Žlutý kužel tři zase o krok dál a doleva.', highlight: [3] },
      { text: 'Zelený kužel čtyři o krok dál a doprava.', highlight: [4] },
      { text: 'Bílý kužel pět o krok dál a doleva. Bílý může být i ponožka.', highlight: [5] },
      { text: 'Hotovo! Máš cik-cak.', highlight: [1, 2, 3, 4, 5] },
    ],
  },
];
