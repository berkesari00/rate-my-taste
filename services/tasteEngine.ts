import { Track } from './spotify';

export type TasteResult = {
  score: number;
  zoneTitle: string;
  zoneEmoji: string;
  message: string;
  badges: string[];
  avgPopularity: number;
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function analyzeTaste(tracks: Track[]): TasteResult {
  const list = tracks.length ? tracks : [];
  const allZero = list.length > 0 && list.every((t) => t.popularity === 0);
  const avg = list.reduce((s, t) => s + t.popularity, 0) / Math.max(list.length, 1);
  const score = allZero ? 50 : Math.round(100 - avg);

  let zoneTitle = '';
  let zoneEmoji = '';
  let message = '';

  if (allZero) {
    zoneTitle = 'Gizemli Liste';
    zoneEmoji = '🌫️';
    message = pick([
      'Spotify bize popülerlik verisini vermedi, ama bu liste bile yeterince ilginç.',
      'Veriler gizlenmiş ama sezgilerim bu listenin sıradan olmadığını söylüyor.',
    ]);
  } else if (avg >= 80) {
    zoneTitle = 'Popüler Kültür Kölesi';
    zoneEmoji = '📻';
    message = pick([
      'Fazlasıyla popüler kültür kölesi bir seçim! Bu bir playlist mi, radyo listesi mi?',
      'Bu listeyi Spotify algoritması yapmış deseler inanırdım. Algoritma senin adına yaşıyor.',
      'Billboard’a toplu üyelik mi aldın? Her şarkı listebaşı mübarek.',
    ]);
  } else if (avg >= 60) {
    zoneTitle = 'Mainstream Ama Farkında';
    zoneEmoji = '🎧';
    message = pick([
      'Popüler sularda yüzüyorsun ama en azından dalgaların farkındasın.',
      'Liste başı şarkılar var ve utanmadan sahipleniyorsun. Bu da bir özgüven.',
    ]);
  } else if (avg >= 40) {
    zoneTitle = 'Dengeli Kaşif';
    zoneEmoji = '🧭';
    message = pick([
      'Ne tamamen mainstream ne tamamen underground: tam kıvamında bir denge.',
      'Hem radyo hem plakçı: ikili hayat yaşıyorsun ve ikisi de mutlu.',
    ]);
  } else if (avg >= 20) {
    zoneTitle = 'Niche Lord';
    zoneEmoji = '🕳️';
    message = pick([
      'Çok niche bir seçim. Saygı duyarım. Bu şarkıları bulan GPS bile yolunu kaybeder.',
      'Bu playlist’in yorum bölümü 3 kişiden oluşuyor ve biri büyük ihtimalle sensin.',
    ]);
  } else {
    zoneTitle = 'Music God';
    zoneEmoji = '👑';
    message = pick([
      'Sen müzik aramıyorsun, müzik seni buluyor. Bu bir playlist değil, kazı çalışması.',
      'Bu şarkıları Spotify bile unutmuştu. Arkeolojik değerleri var, saygı.',
    ]);
  }

  const badges: string[] = [];
  const years = list
    .map((t) => parseInt(t.releaseDate.slice(0, 4), 10))
    .filter((y) => !isNaN(y));
  const avgYear = years.reduce((s, y) => s + y, 0) / Math.max(years.length, 1);
  const currentYear = new Date().getFullYear();

  if (years.length && avgYear < 2000) badges.push('📼 Nostalji Koleksiyoncusu');
  if (years.length && avgYear > currentYear - 3) badges.push('🌱 Taze Avcı');
  if (!allZero && score >= 80) badges.push('👑 Music God');
  if (!allZero && score <= 20) badges.push('📻 Mainstream Kurbanı');

  const uniqueArtists = new Set(list.map((t) => t.artist)).size;
  if (list.length > 4 && uniqueArtists <= Math.max(3, list.length * 0.2)) {
    badges.push('🔁 Sadık Dinleyici');
  }

  return { score, zoneTitle, zoneEmoji, message, badges, avgPopularity: Math.round(avg) };
}