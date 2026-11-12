// Mapa zdrojů z rešerše: origin id -> [{url, type, reliability}]
const V = (url, rel = 'ověřené', type = 'video') => ({ url, type, reliability: rel });
const M = (url, rel = 'ověřené', type = 'metodika') => ({ url, type, reliability: rel });

export const URL = {
  ADM8: 'https://portal.usahockey.com/cx/president/hockey-devlopment/8u_fundamentals_stage-adm.pdf',
  ADMSTAT: 'https://www.admkids.com/news_article/show/411437',
  HCPUCK: 'https://cdn.hockeycanada.ca/hockey-canada/Hockey-Programs/Players/Downloads/2020/puck-control-overview-e.pdf',
  HCU9: 'https://www.hockeycanada.ca/en-ca/hockey-programs/coaching/under-9/coaches/skills',
  OHT: 'https://www.onlinehockeytraining.com/blog/hockey-stick-handling-drills',
  HTH: 'https://www.youtube.com/watch?v=7HluVwbAv3w',
  BARBER9: 'https://www.youtube.com/watch?v=Z38QfMBqHss',
  USAOFF: 'https://www.youtube.com/watch?v=DycV8UE5Ua0',
  CH_G: 'https://www.mobilesport.ch/assets/lbwp-cdn/mobilesport/files/2011/02/Grundlagen_Unihockey.pdf',
  CH_L1: 'https://klickin.swissunihockey.ch/index.php/download_file/view/312/279',
  CH_L2: 'https://editor.swissunihockey.ch/index.php/download_file/view/316/279',
  CH_L3: 'https://www.mobilesport.ch/assets/lbwp-cdn/mobilesport/files/2011/02/Unihockey_3_Ich-und-der-Ball-III_d.pdf',
  CH_L4: 'https://www.mobilesport.ch/assets/lbwp-cdn/mobilesport/files/2012/08/Unihockey_Lektion-4_d.pdf',
  CH_L10: 'https://klickin.swissunihockey.ch/index.php/download_file/view/313/279',
  CH_MP: 'https://www.mobilesport.ch/assets/lbwp-cdn/mobilesport/files/2013/09/praxis_2005_02_d.pdf',
  FI_HS: 'https://salibandy.fi/wp-content/uploads/2025/12/hippo-x-sabakipina-lajinomaiset-leikit.pdf',
  FI_TT: 'https://bin.yhdistysavain.fi/1580251/ruuOmGuWdYLL9JFkqrvC0bZWHb/SBVImuistiinpanot.pdf',
  SE_SVA: 'https://docs.google.com/document/d/1etvM2HK8Swz4Eit2b3P62pj4t4lCKR_jOTd2dbEV9_M/export?format=pdf',
  SE_SKE: 'https://laget.se/SkellefteaIBK/Document/Download/1088074/6494953',
  SE_SK: 'https://laget.se/IBKOsby/Document/Download/1148903/6783815',
  CZ_HR: 'https://dspace5.zcu.cz/bitstream/11025/19998/1/Diplomova%20prace%20Matous%20Hrdlicka%202015.pdf',
  CZ_HO: 'https://dspace5.zcu.cz/bitstream/11025/7080/1/Moznosti%20rozvoje%20zakladnich%20pohybovych%20dovednosti%20ve%20florbale%20ve%20vekove%20kategorii%208%20-%2010%20let..pdf',
  CZ_SV: 'https://dspace.jcu.cz/bitstreams/ae895c33-887b-4ac5-b0a7-1fca35df7bb4/download',
  SOI: 'https://www1.specialolympicsontario.com/resources/wp-content/uploads/sites/39/2024/10/SOI_Floorball_Coaching-Guide.pdf',
  IFF: 'https://www.floorball.sport/wp-content/uploads/2026/02/Rules-of-the-Game-2026-with-all-changes-260209.pdf',
  MF_PASSER: 'https://myfloorball.eu/products/my-floorball-passer',
  MF_APP: 'https://apps.apple.com/us/app/my-floorball/id949358436',
  BARBER_ZORRO: 'https://www.youtube.com/watch?v=UPtyRyLBawo',
  FITKOUC: 'https://www.youtube.com/watch?v=ZCEezWMOdA4',
  BOMBARDAK: 'https://www.youtube.com/watch?v=gvFCTOKb7JA',
  UHC: 'https://www.youtube.com/watch?v=6ZRkkhVpz48',
  FB_SCOOP: 'https://www.youtube.com/watch?v=iGx8arbYMhg',
  FB_LIFT: 'https://www.youtube.com/watch?v=3NIkT5qidpM',
  FB_JUGGLE: 'https://www.youtube.com/watch?v=uZdYUHfvZbE',
  FB_BHCUSH: 'https://www.youtube.com/watch?v=GRMyIeTzqV8',
  FB_TOP: 'https://www.youtube.com/watch?v=eaGdEZ1rRWk',
  FB_LEGS: 'https://www.youtube.com/watch?v=KBtAcR6ZAi4',
  LANGER_KLICKY: 'https://www.youtube.com/watch?v=O0MVVCA9H28',
  FRENZY5: 'https://www.youtube.com/watch?v=6pmaHNPC-o8',
  FRENZY_SKILL: 'https://www.youtube.com/watch?v=0pOdD75Mc0k',
  FRENZY_HOME: 'https://www.youtube.com/watch?v=eZkptvPLoog',
  FCZ: 'https://www.youtube.com/watch?v=tFFCRVn9Y2I',
  VERMUND: 'https://www.youtube.com/watch?v=JIeMV8U03WY',
  WIKI_MICH: 'https://en.wikipedia.org/wiki/Michigan_goal',
  LANGER_HAVLAS: 'https://www.youtube.com/watch?v=S-VGfNc1dC8',
  LANGER_FRODL: 'https://www.youtube.com/watch?v=vyOmJdqA7aE',
  SALMING_BAR: 'https://www.youtube.com/watch?v=EbeFZ5roLc8',
  SVRCEK: 'https://www.youtube.com/watch?v=Mk0MFeDAV9Q',
  SVRCEK2: 'https://www.youtube.com/watch?v=6lLPwkvrVe0',
  ERPPA: 'https://www.youtube.com/watch?v=0K3tn5rZ7v0',
  TIMO_PUNKTE: 'https://www.youtube.com/watch?v=LzVCac8Pp04',
  HAYUNGS: 'https://www.youtube.com/watch?v=3vqw3QHZpNo',
  BARBER_SHOOT: 'https://www.youtube.com/watch?v=q5O5Qi-ZQY4',
  WAREHOUSE: 'https://www.youtube.com/watch?v=P7ezNqf1VzI',
  USTI_DIZZY: 'https://www.youtube.com/watch?v=Za4j_Myq-kU',
  MILSPORT: 'https://www.milsport.admin.ch/media/postPdf/SpielFit_Unihockey_Slalom_Torschuss.pdf',
  IFF_FREESTYLE: 'https://floorball.sport/2020/11/26/presenting-freestyle-floorball-cup-contestant-agnes-holgersson',
  IFF_EGLI: 'https://floorball.sport/2020/12/09/presenting-freestyle-floorball-cup-contestant-jonathan-egli',
  FLOOR_MINDSET: 'https://www.youtube.com/watch?v=h3GauavBPtE',
  F221_LEGS: 'https://www.youtube.com/watch?v=8AWo_5Z9Q7o',
  WRDSB: 'https://schools.wrdsb.ca/athome/learn/elementary-home/elementary-2/healthy-active-living/healthy-active-living-all-grades/skill-development/hockey-skills-drills-and-challenges/',
  CUNI_U9: 'https://dspace.cuni.cz/handle/20.500.11956/191512',
};
const U = URL;

const H = {
  H01: [V('https://www.youtube.com/watch?v=HFlw8A4xye0'), V(U.USAOFF)],
  H02: [V('https://www.youtube.com/watch?v=BIRR2Kb0aEA'), V(U.HTH, 'inspirace')],
  H03: [V('https://www.youtube.com/watch?v=JQ-SLP2V5W8')],
  H04: [V('https://www.youtube.com/watch?v=o9JQAEPACr4')],
  H05: [V('https://www.youtube.com/watch?v=lw7rrPkh2pc')],
  H06: [V(U.HTH, 'inspirace')],
  H07: [V('https://www.youtube.com/watch?v=IT9Wu3P_C6I', 'inspirace'), M(U.ADM8)],
  H08: [V(U.OHT, 'inspirace', 'článek'), M(U.ADM8)],
  H09: [V('https://www.youtube.com/watch?v=8l4CnuQcZKo')],
  H10: [V('https://www.youtube.com/watch?v=qybWCftpnbk')],
  H11: [V('https://www.youtube.com/watch?v=aEsQAQGETEY')],
  H12: [V('https://www.youtube.com/watch?v=C6n2gCRYgzY')],
  H13: [V(U.HTH, 'inspirace')],
  H14: [V(U.HTH, 'inspirace'), V('https://www.youtube.com/watch?v=p5mfzsB4Tec', 'inspirace')],
  H15: [V(U.OHT, 'inspirace', 'článek')],
  H16: [V(U.OHT, 'inspirace', 'článek')],
  H17: [V('https://www.youtube.com/watch?v=HV5FFCzQJfM'), V(U.OHT, 'inspirace', 'článek')],
  H18: [V('https://www.youtube.com/watch?v=UlkAnet3d-A'), V('https://www.youtube.com/watch?v=TQe8UUIICqw', 'inspirace')],
  H19: [V('https://www.youtube.com/watch?v=A1cfLXnJ16s', 'inspirace')],
  H20: [V('https://www.youtube.com/watch?v=6J0qRfZRVNM', 'inspirace')],
  H21: [V(U.BARBER9, 'inspirace')],
  H22: [V(U.BARBER9, 'inspirace')],
  H23: [V(U.BARBER9, 'inspirace'), M(U.HCPUCK)],
  H24: [V(U.BARBER9, 'inspirace')],
  H25: [V('https://hockeyshot.com/blogs/training-academy/movement-puck-vision', 'inspirace', 'článek')],
  H26: [M(U.HCPUCK), V('https://hockeyshot.com/blogs/training-academy/movement-puck-vision', 'inspirace', 'článek')],
  H27: [V('https://www.youtube.com/watch?v=HV5FFCzQJfM')],
  H28: [V(U.OHT, 'inspirace', 'článek')],
  H29: [V('https://www.youtube.com/watch?v=5Ls0RzDATIY'), V(U.USAOFF)],
  H30: [V(U.USAOFF)],
  H31: [V('https://www.youtube.com/watch?v=4WBgqEPIFxw')],
  H32: [M(U.HCU9)],
  H33: [V('https://www.youtube.com/watch?v=GQK1RBm8Vx4', 'inspirace')],
  H34: [M(U.HCU9)],
  H35: [M(U.ADM8)],
  H36: [V('https://www.youtube.com/watch?v=P5dO2zNmxhc'), M(U.WRDSB, 'inspirace', 'článek')],
  H37: [M('https://www.hockeyshare.com/drills/print/477220', 'inspirace', 'článek')],
  H38: [V(U.USAOFF)],
  H39: [V(U.USAOFF)],
  H40: [M(U.HCPUCK, 'odvozené')],
  H41: [V(U.HTH, 'inspirace')],
  H42: [V('https://www.youtube.com/watch?v=IT9Wu3P_C6I', 'inspirace'), M(U.HCPUCK)],
  H43: [M('https://hockeyshot.com/products/reactive-sniper', 'inspirace', 'výrobce'), M(U.HCPUCK)],
  H44: [V('https://www.youtube.com/watch?v=bYFiH1BF_HA')],
  H45: [V('https://www.youtube.com/watch?v=GU47Ecj98JM')],
  H46: [M(U.ADM8, 'odvozené')],
  H47: [M(U.WRDSB, 'inspirace', 'článek'), M(U.HCPUCK)],
  H48: [M(U.ADMSTAT)],
  H49: [M(U.CUNI_U9, 'odvozené', 'VŠ práce'), V(U.HTH, 'inspirace')],
  H50: [V('https://www.youtube.com/watch?v=XzQ_26K05sU', 'inspirace')],
  H51: [V('https://www.youtube.com/watch?v=pmNnMqKU-PU', 'inspirace')],
  H52: [V('https://www.youtube.com/watch?v=rP-KX2zzzqA')],
};

const chMap = {
  '01': U.CH_MP, '02': U.CH_L1, '03': U.CH_MP, '04': U.CH_MP, '05': U.CH_L3, '06': U.CH_MP, '07': U.CH_MP, '08': U.CH_MP,
  '09': U.CH_MP, '10': U.CH_MP, '11': U.CH_MP, '12': U.CH_MP, '13': U.CH_L1, '14': U.CH_L1, '15': U.CH_L2, '16': U.CH_L2,
  '17': U.CH_L2, '18': U.CH_L3, '19': U.CH_L4, '20': U.CH_MP, '21': U.CH_MP, '22': U.CH_L2, '23': U.CH_L3, '24': U.CH_L10, '25': U.CH_L10,
};
const CH = Object.fromEntries(Object.entries(chMap).map(([k, u]) => [`CH-${k}`, [M(u)]]));
const FI = {};
for (let i = 1; i <= 20; i++) {
  const k = `FI-${String(i).padStart(2, '0')}`;
  FI[k] = i <= 7 ? [M(U.FI_HS)] : [M(U.FI_TT, [8, 11, 12, 13, 14, 17].includes(i) ? 'ověřené' : 'inspirace')];
}
const SE = {};
for (let i = 1; i <= 9; i++) SE[`SE-0${i}`] = [M(i === 9 ? U.SE_SKE : U.SE_SVA, 'inspirace')];
const CZ = {};
for (let i = 1; i <= 38; i++) {
  const k = `CZ-${String(i).padStart(2, '0')}`;
  if (i >= 31 && i <= 33) CZ[k] = [M(U.CZ_HO, 'inspirace', 'VŠ práce')];
  else if (i >= 36) CZ[k] = [M(U.CZ_SV, 'inspirace', 'VŠ práce')];
  else CZ[k] = [M(U.CZ_HR, 'ověřené', 'VŠ práce (metodika ČFbU)')];
}
const SO = {};
for (let i = 1; i <= 10; i++) SO[`SO-${String(i).padStart(2, '0')}`] = [M(U.SOI)];
const MF = { 'MF-01': [M(U.MF_PASSER, 'inspirace', 'výrobce')], 'MF-02': [M(U.MF_APP, 'inspirace', 'výrobce')] };

const T = {
  T01: [V(U.FITKOUC, 'inspirace'), V(U.BOMBARDAK, 'inspirace'), V(U.BARBER_ZORRO, 'inspirace')],
  T02: [V(U.FB_SCOOP, 'inspirace'), V(U.FB_LIFT, 'inspirace'), M(U.CZ_HR, 'ověřené', 'VŠ práce (metodika ČFbU)')],
  T03: [V(U.BARBER_ZORRO, 'inspirace'), M(U.CH_MP), M(U.SOI)],
  T04: [V(U.FB_JUGGLE, 'inspirace'), M(U.IFF_FREESTYLE, 'inspirace', 'článek'), M(U.CZ_HR, 'ověřené', 'VŠ práce (metodika ČFbU)')],
  T05: [V(U.FB_BHCUSH, 'inspirace'), V(U.FB_JUGGLE, 'inspirace')],
  T06: [V(U.SVRCEK2, 'inspirace'), V('https://www.youtube.com/watch?v=najf9c-GmbA', 'inspirace')],
  T07: [V(U.BARBER_ZORRO, 'inspirace'), M(U.FI_TT, 'ověřené'), M(U.CZ_HR, 'ověřené', 'VŠ práce (metodika ČFbU)')],
  T08: [V(U.BOMBARDAK, 'inspirace'), V(U.BARBER_ZORRO, 'inspirace')],
  T09: [V(U.BARBER_ZORRO, 'inspirace'), V(U.FITKOUC, 'inspirace'), V(U.BOMBARDAK, 'inspirace'), V(U.UHC, 'inspirace'), M(U.IFF, 'ověřené', 'pravidla')],
  T10: [V(U.BOMBARDAK, 'inspirace'), V(U.FITKOUC, 'inspirace'), V('https://www.youtube.com/watch?v=DzE7Sh5eSj0', 'inspirace')],
  T11: [V(U.UHC, 'inspirace'), V(U.BARBER_ZORRO, 'inspirace')],
  T12: [V(U.BOMBARDAK, 'inspirace')],
  T13: [V(U.VERMUND, 'inspirace'), V('https://www.youtube.com/watch?v=tWURMI7pZzA', 'inspirace'), M(U.WIKI_MICH, 'inspirace', 'článek')],
  T14: [V(U.LANGER_KLICKY, 'inspirace'), V(U.FRENZY5, 'inspirace'), V(U.FCZ, 'inspirace')],
  T15: [V(U.FRENZY_SKILL, 'inspirace'), V('https://www.youtube.com/watch?v=UlkAnet3d-A')],
  T16: [V(U.FCZ, 'inspirace'), V(U.LANGER_KLICKY, 'inspirace'), M(U.HCU9)],
  T17: [V(U.FB_LEGS, 'inspirace'), V(U.F221_LEGS, 'inspirace'), M(U.IFF, 'ověřené', 'pravidla')],
  T18: [V(U.FLOOR_MINDSET, 'inspirace'), M(U.IFF, 'ověřené', 'pravidla')],
};
const C = {
  C01: [V(U.LANGER_HAVLAS, 'inspirace')],
  C02: [V(U.SALMING_BAR, 'inspirace'), V(U.LANGER_FRODL, 'inspirace')],
  C03: [V(U.ERPPA, 'inspirace'), V(U.SVRCEK, 'inspirace')],
  C04: [M(U.IFF, 'ověřené', 'pravidla'), V(U.SVRCEK, 'inspirace')],
  C05: [V(U.TIMO_PUNKTE, 'inspirace'), V(U.LANGER_HAVLAS, 'inspirace')],
  C06: [V(U.TIMO_PUNKTE, 'inspirace')],
  C07: [M(U.CH_L3)],
  C08: [V(U.FITKOUC, 'inspirace')],
  C09: [V(U.FB_JUGGLE, 'inspirace'), M(U.IFF_FREESTYLE, 'inspirace', 'článek')],
  C10: [V(U.BARBER_ZORRO, 'inspirace'), M(U.SOI)],
  C11: [M(U.MILSPORT, 'ověřené'), M(U.CH_MP)],
  C12: [V(U.HAYUNGS, 'inspirace')],
  C13: [M(U.CH_MP), M(U.CH_L10)],
  C14: [V(U.BARBER_SHOOT, 'inspirace'), V(U.LANGER_FRODL, 'inspirace')],
  C15: [V(U.LANGER_HAVLAS, 'inspirace')],
  C16: [V(U.WAREHOUSE, 'inspirace')],
  C17: [V(U.USTI_DIZZY, 'inspirace')],
  C18: [V(U.BOMBARDAK, 'inspirace'), V(U.UHC, 'inspirace')],
  C19: [V(U.VERMUND, 'inspirace')],
  C20: [V(U.FRENZY_HOME, 'inspirace')],
};


const PRIK = 'https://theses.cz/id/4qeyny/', PETR = 'https://theses.cz/id/7arhdl/', BRAB = 'https://theses.cz/id/vj1m99/';
const OB = (slug) => M('https://www.innebandy.se/ovningsbanken/' + slug, 'ověřené', 'metodika (övningsbanken)');
const CR = {};
for (let i = 1; i <= 10; i++) CR['CR-' + String(i).padStart(2, '0')] = [M(PRIK, 'ověřené', 'VŠ práce')];
for (let i = 11; i <= 20; i++) CR['CR-' + i] = [M(PETR, 'ověřené', 'VŠ práce')];
for (let i = 21; i <= 27; i++) CR['CR-' + i] = [M(BRAB, 'ověřené', 'VŠ práce')];
Object.assign(CR, {
  'CR-28': [OB('jag-och-bollen')], 'CR-29': [OB('vickningar')], 'CR-30': [OB('vaxlingar')], 'CR-31': [OB('snurr-med-boll-grundteknik')],
  'CR-32': [OB('teknikbana')], 'CR-33': [OB('vanda-jaktlek')], 'CR-34': [OB('reflexen')], 'CR-35': [OB('kon-kaos')],
  'CR-36': [OB('krabb-boll')], 'CR-37': [OB('tjuva-koner')], 'CR-38': [OB('hinderbana')],
  'CR-39': [M('https://www.florbal.com/doplnky/treninkove-doplnky/myfloorball-skiller-pro/', 'inspirace', 'výrobce'), M(U.MF_APP, 'inspirace', 'výrobce')],
  CESTA: [M('https://www.ceskyflorbal.cz/cesta-hrace', 'ověřené', 'metodika ČFbU')],
  SABA: [M('https://salibandy.fi/harrastaminen/sabakipina/sabakipinakerho/', 'ověřené', 'svaz')],
});

export const SRC = { ...H, ...CR, ...CH, ...FI, ...SE, ...CZ, ...SO, ...MF, ...T, ...C,
  ADM: [M(U.ADM8)], SIU: [M(U.SE_SK)], SKE: [M(U.SE_SKE, 'inspirace')], JS: [M(U.CH_G)], IFF: [M(U.IFF, 'ověřené', 'pravidla')],
};

export function srcFor(origins) {
  const out = []; const seen = new Set();
  for (const o of origins) {
    const list = SRC[o];
    if (!list) throw new Error('neznámý origin ' + o);
    for (const s of list) { if (seen.has(s.url)) continue; seen.add(s.url); out.push(s); }
  }
  return out;
}
