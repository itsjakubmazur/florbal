// Stanoviště (SPEC kap. 2). Souřadnice pro praváka (forhend = vpravo = +x). mirror: true -> pro leváka x -> -x
// a v textech se prohodí doleva/doprava (src/domain/stations.js swapLR). Kužel 1 je vždy na bekhendové straně.
const SUB = 'Nemáš kužely? Stačí boty, ponožky srolované do kuličky nebo kousek lepicí pásky na zemi.';
// Velký krok osmiletého dítěte ≈ 0,6 m.
const CHECK = 'Polož čepel hole na zem a pomalu s ní opiš kruh kolem sebe. Čepel nesmí do ničeho narazit.';
const QUIET = 'Cvičíš v bytě? Vezmi měkký pěnový míček a cvič na koberci nebo dece, ať to sousedi neslyší.';
const TABLET = (where) => `Tablet postav ${where}, výš než čepel, na židli nebo stojan. Nikdy ne tam, kam poběžíš.`;

export const stations = [
  {
    id: 'spot', name: 'Malý prostor', short: '1 × 2 m + místo pro tablet asi 2 m před tebou', size: [1.4, 2], space: 'small', minCones: 2, mirror: true,
    home: { x: 0, y: 0 },
    cones: [ { n: 1, x: -0.5, y: 0.7, color: 'red' }, { n: 2, x: 0.5, y: 0.7, color: 'blue' } ],
    voiceSetup: 'setup_spot',
    quiet: true,
    setupSteps: [
      { text: CHECK, highlight: [] },
      { text: QUIET, highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden velký krok před sebe a kousek doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož stejně daleko, ale kousek doprava. Mezi kužely je asi jeden metr.', highlight: [2] },
      { text: TABLET('aspoň tři velké kroky před kužely'), highlight: [1, 2] },
      { text: 'Hotovo! Stoupni si do domečku za kužely.', highlight: [1, 2] },
    ],
  },
  {
    id: 'triangle', name: 'Trojúhelník', short: '3 kužely', size: [2.6, 2.8], space: 'medium', minCones: 3, mirror: true,
    home: { x: 0, y: 0 },
    cones: [ { n: 1, x: -0.9, y: 1.1, color: 'red' }, { n: 2, x: 0.9, y: 1.1, color: 'blue' }, { n: 3, x: 0, y: 2.2, color: 'yellow' } ],
    voiceSetup: 'setup_triangle',
    setupSteps: [
      { text: 'Stoupni si do domečku. Před tebou musí být volno na čtyři velké kroky.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož dva velké kroky dopředu a jeden a půl kroku doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož dva velké kroky dopředu a jeden a půl kroku doprava.', highlight: [2] },
      { text: 'Žlutý kužel tři dej doprostřed, o další dva velké kroky dál.', highlight: [3] },
      { text: TABLET('aspoň dva velké kroky za žlutý kužel a ještě kus stranou'), highlight: [3] },
      { text: 'Hotovo! Máš trojúhelník.', highlight: [1, 2, 3] },
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
      { text: 'Stoupni si do domečku. Před tebou musí být volno na pět velkých kroků.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden a půl kroku dopředu a jeden a půl kroku doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož jeden a půl kroku dopředu a jeden a půl kroku doprava.', highlight: [2] },
      { text: 'Žlutý kužel tři polož skoro tři velké kroky za modrý.', highlight: [3] },
      { text: 'Zelený kužel čtyři polož skoro tři velké kroky za červený.', highlight: [4] },
      { text: TABLET('aspoň dva velké kroky za žlutý a zelený kužel a kus stranou'), highlight: [3, 4] },
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
      { text: 'Stoupni si do domečku. Před tebou postavíme rovnou řadu, potřebuješ volno na osm velkých kroků.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden a půl velkého kroku před sebe.', highlight: [1] },
      { text: 'Modrý kužel dva dej o další jeden a půl kroku dál.', highlight: [2] },
      { text: 'Žlutý kužel tři zase o jeden a půl kroku dál.', highlight: [3] },
      { text: 'Zelený kužel čtyři je poslední. Za ním musí být ještě dva kroky volna na otočku.', highlight: [4] },
      { text: TABLET('tři velké kroky za zelený kužel a kus stranou'), highlight: [4] },
      { text: 'Hotovo! Máš slalom.', highlight: [1, 2, 3, 4] },
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
      { text: 'Stoupni si do domečku. Postavíme cik-cak jako písmeno W, potřebuješ volno na osm velkých kroků.', highlight: [] },
      { text: SUB, highlight: [] },
      { text: 'Červený kužel jedna polož jeden velký krok dopředu a jeden velký krok doleva.', highlight: [1] },
      { text: 'Modrý kužel dva polož o velký krok dál a dva a půl kroku doprava od červeného.', highlight: [2] },
      { text: 'Žlutý kužel tři polož o velký krok dál a zase doleva, na stejnou stranu jako červený.', highlight: [3] },
      { text: 'Zelený kužel čtyři polož o velký krok dál a doprava, na stejnou stranu jako modrý.', highlight: [4] },
      { text: 'Bílý kužel pět polož o velký krok dál a doleva, na stejnou stranu jako žlutý. Bílý může být i ponožka.', highlight: [5] },
      { text: TABLET('dva velké kroky za bílý kužel a kus stranou'), highlight: [5] },
      { text: 'Hotovo! Máš cik-cak.', highlight: [1, 2, 3, 4, 5] },
    ],
  },
];
