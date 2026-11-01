import { SongProfile } from './lastfm';

export type SongArchetype = {
  key: string;
  title: string;
  emoji: string;
  blurb: string;
  accent: string;
};

export type MeterScores = {
  obscurity: number;
  cult: number;
  energy: number;
  darkness: number;
  bond: number;
};

export type SongAnalysis = {
  composite: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeLabel: string;
  scores: MeterScores;
  genreDNA: string[];
  funFacts: string[];
  roast: string;
  archetype: SongArchetype;
  fameScore: number;
  bondScore: number;
  addictionRatio: number;
};

const ENERGY: Record<string, number> = {
  dance: 0.9, edm: 0.9, club: 0.85, techno: 0.8, house: 0.75, trance: 0.7, disco: 0.7, funk: 0.6,
  metal: 0.85, punk: 0.8, hardcore: 0.9, grunge: 0.7, rock: 0.65, indie: 0.5, alternative: 0.55,
  hip: 0.65, rap: 0.6, trap: 0.7, phonk: 0.8, pop: 0.55, rnb: 0.45, soul: 0.4,
  ambient: 0.15, classical: 0.1, piano: 0.15, jazz: 0.35, folk: 0.3, acoustic: 0.25, lofi: 0.3,
  shoegaze: 0.5, postrock: 0.55, doom: 0.6, black: 0.85, noise: 0.7, experimental: 0.4, chillout: 0.2,
};

const DARKNESS: Record<string, number> = {
  metal: 0.8, black: 0.9, doom: 0.85, gothic: 0.8, dark: 0.75, industrial: 0.7, emo: 0.6, grunge: 0.65,
  phonk: 0.7, trap: 0.5, hip: 0.4, shoegaze: 0.55, postrock: 0.5, drone: 0.6, noise: 0.6,
  ambient: 0.35, classical: 0.2, jazz: 0.3, pop: 0.15, dance: 0.1, folk: 0.3, soul: 0.25,
  indie: 0.35, alternative: 0.4, experimental: 0.5, psychedelic: 0.45, prog: 0.4, soundtrack: 0.35,
  chillout: 0.2, piano: 0.2, acoustic: 0.15, love: 0.1, summer: 0.05, party: 0.05, lofi: 0.3,
};

const BENCH = { name: 'Blinding Lights', listeners: 12_000_000 };

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function tagAvg(tags: string[], map: Record<string, number>, fallback: number): number {
  if (tags.length === 0) return fallback;
  const vals = tags.map((t) => map[t] ?? fallback);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function analyzeSong(profile: SongProfile): SongAnalysis {
  const fameScore = clamp100((Math.log10(profile.listeners + 1) / 7) * 100);
  const obscurity = 100 - fameScore;

  const bondScore = profile.userplaycount > 0
    ? clamp100((Math.log10(profile.userplaycount + 1) / 3) * 100)
    : 0;

  const addictionRatio = profile.listeners > 0 ? profile.playcount / profile.listeners : 0;
  const cult = addictionRatio > 1
    ? clamp100((Math.log10(addictionRatio) / Math.log10(20)) * 100)
    : 0;

  const energy = clamp100(tagAvg(profile.tags, ENERGY, 0.45) * 100);
  const darkness = clamp100(tagAvg(profile.tags, DARKNESS, 0.4) * 100);

  const composite = clamp100(obscurity * 0.4 + cult * 0.25 + bondScore * 0.2 + energy * 0.15);

  let grade: SongAnalysis['grade'];
  let gradeLabel: string;
  if (composite >= 80) { grade = 'S'; gradeLabel = 'Efsane Avcısı'; }
  else if (composite >= 65) { grade = 'A'; gradeLabel = 'Kâşif'; }
  else if (composite >= 50) { grade = 'B'; gradeLabel = 'Meraklı Kulak'; }
  else if (composite >= 35) { grade = 'C'; gradeLabel = 'Güvenli Sular'; }
  else { grade = 'D'; gradeLabel = 'Algoritmaya Teslim'; }

  // Archetype
  let archetype: SongArchetype;
  if (profile.listeners === 0) {
    archetype = { key: 'ghost', title: 'Hayalet Kayıt', emoji: '👻', accent: '#A0A0A6',
      blurb: 'Last.fm bile bu şarkıyı tanımıyor. Ya çok yeni ya da evrenin unuttuğu bir köşede.' };
  } else if (bondScore >= 60 && fameScore < 45) {
    archetype = { key: 'hidden-gem', title: 'Gizli Mücevher', emoji: '💎', accent: '#8E4EC6',
      blurb: 'Dünya bilmiyor ama sen defalarca dönmüşsün. İşte gerçek keşif budur.' };
  } else if (bondScore >= 60 && fameScore >= 70) {
    archetype = { key: 'guilty-pleasure', title: 'Guilty Pleasure', emoji: '🍫', accent: '#F5A623',
      blurb: 'Herkes biliyor VE sen de bıkmadan dinliyorsun. Utanma, sahiplen.' };
  } else if (fameScore >= 75 && addictionRatio >= 8) {
    archetype = { key: 'anthem', title: 'Marş', emoji: '📣', accent: '#E5484D',
      blurb: 'Dinleyenler tekrar tekrar dönüyor. Bu bir şarkı değil, bir marş.' };
  } else if (darkness >= 65 && fameScore < 50) {
    archetype = { key: 'cult', title: 'Kült Klasik', emoji: '🕯️', accent: '#0B0B0C',
      blurb: 'Karanlık, derin, az kişinin anladığı bir kült. Saygı duyulur.' };
  } else if (fameScore >= 70) {
    archetype = { key: 'mainstream', title: 'Listebaşı', emoji: '📻', accent: '#E5484D',
      blurb: 'Radyoların sevdiği, kalabalıkların bildiği bir iş.' };
  } else if (fameScore >= 40) {
    archetype = { key: 'balanced', title: 'Dengeli İş', emoji: '⚖️', accent: '#F5A623',
      blurb: 'Ne tamamen yeraltı ne tamamen mainstream. Tam kıvamında.' };
  } else {
    archetype = { key: 'niche', title: 'Niche Seçim', emoji: '🕳️', accent: '#8E4EC6',
      blurb: 'Az bilinen, derinlere inen bir seçim. GPS burada yolunu kaybeder.' };
  }

  // Biliyor muydun kartları
  const funFacts: string[] = [];
  if (profile.listeners > 0) {
    const ratio = BENCH.listeners / profile.listeners;
    if (ratio >= 2) {
      funFacts.push(`${BENCH.name}'ı ~${fmt(BENCH.listeners)} insan dinledi; bu parçayı ~${fmt(profile.listeners)}. Yani kabuca ${fmt(Math.round(ratio))} kat daha gizli.`);
    } else {
      funFacts.push(`Bu parça, ${BENCH.name} ile aynı ligde dinlenmiş. Devler ligindesin.`);
    }
  }
  if (profile.listeners >= 16_000_000) funFacts.push('Bu şarkıyı İstanbul\'un nüfusundan fazla insan dinlemiş.');
  else if (profile.listeners >= 8_500_000) funFacts.push('Bu şarkıyı New York\'tan fazla insan dinlemiş.');
  else if (profile.listeners >= 1_000_000) funFacts.push('Bu şarkıyı milyonluk bir şehirden fazla insan dinlemiş.');
  else if (profile.listeners > 0 && profile.listeners < 50_000) funFacts.push('Bu şarkıyı bir stadı dolduracak kalabalıktan daha az insan dinlemiş.');
  if (addictionRatio >= 8) funFacts.push(`Dinleyenler ortalama ${addictionRatio.toFixed(1)} kez geri dönmüş. Bu bir bağımlılık.`);
  if (profile.userplaycount > 0) funFacts.push(`Sen bu şarkıyı Last.fm'de ${profile.userplaycount} kez dinlemişsin. Bağın kayıtlarda.`);
  else funFacts.push('Last.fm hesabınla eşleşme yok — gizli dinlemelerin güvende.');

  // Roast (çok cümleli)
  const gradeComment: Record<SongAnalysis['grade'], string> = {
    S: 'Bu zevk ders olarak okutulmalı.',
    A: 'Algoritma seni yakalayamaz; sen onu yakalarsın.',
    B: 'Meraklı bir kulak — ama daha derinlere inebilirsin.',
    C: 'Güvenli sular. Ara sıra kıyıdan uzaklaş.',
    D: 'Algoritma senin adına karar veriyor ve sen teşekkür ediyorsun.',
  };
  const roast = `${archetype.blurb} ${gradeComment[grade]}`;

  return {
    composite,
    grade,
    gradeLabel,
    scores: { obscurity, cult, energy, darkness, bond: bondScore },
    genreDNA: profile.tags.length ? profile.tags.slice(0, 3) : ['tür verisi yok'],
    funFacts: funFacts.slice(0, 4),
    roast,
    archetype,
    fameScore,
    bondScore,
    addictionRatio,
  };
}