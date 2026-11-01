import { enrichWithLastfm } from './lastfm';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export type Playlist = {
  id: string;
  name: string;
  imageUrl: string | null;
  totalTracks: number;
  isPublic: boolean;
};

export type Track = {
  id: string;
  name: string;
  artist: string;
  popularity: number;
  releaseDate: string;
  imageUrl: string | null;
};

export type TrackSearchResult = {
  name: string;
  artist: string;
  id: string;
  imageUrl: string | null;
};

// --- ARAMA FONKSİYONU (Lobi İçin) ---
export async function searchTracks(query: string, token: string): Promise<TrackSearchResult[]> {
  if (!query.trim() || !token) return [];
  try {
    const res = await fetch(
      `${SPOTIFY_API}/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return (data.tracks?.items ?? []).map((t: any) => ({
      name: t.name,
      artist: t.artists.map((a: any) => a.name).join(', '),
      id: t.id,
      imageUrl: t.album?.images?.[0]?.url || null,
    }));
  } catch (e) {
    console.error('Spotify arama hatası:', e);
    return [];
  }
}

// --- PLAYLIST İŞLEMLERİ ---
export async function getMyPlaylists(token: string): Promise<Playlist[]> {
  const userRes = await fetch(`${SPOTIFY_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userData = await userRes.json();
  const userId = userData.id;

  const res = await fetch(`${SPOTIFY_API}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Playlistler alınamadı');

  return (data.items ?? [])
    .filter((p: any) => p.owner?.id === userId && p.public === true)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.images?.[0]?.url ?? null,
      totalTracks: p.tracks?.total ?? p.items?.total ?? 0,
      isPublic: true,
    }));
}

export async function getPlaylistTracks(token: string, playlistId: string): Promise<Track[]> {
  let res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let data = await res.json();
  if (!res.ok) {
    res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/items?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    data = await res.json();
  }
  if (!res.ok) throw new Error(data.error?.message || `Şarkılar alınamadı (HTTP ${res.status})`);

  const base: Track[] = (data.items ?? [])
    .map((e: any) => e.track || e.item || e)
    .filter((t: any) => t && t.id)
    .slice(0, 50)
    .map((t: any) => ({
      id: t.id,
      name: t.name || 'Bilinmeyen Şarkı',
      artist: (t.artists ?? []).map((a: any) => a.name).join(', ') || 'Bilinmeyen Sanatçı',
      popularity: t.popularity ?? 0,
      releaseDate: t.album?.release_date ?? '2000-01-01',
      imageUrl: t.album?.images?.[0]?.url ?? null,
    }));

  if (base.length === 0) return [];

  // 🔍 LOG: Spotify popülerlik durumu
  console.log(`🔍 [getPlaylistTracks] Toplam şarkı: ${base.length}`);
  console.log(`🔍 [getPlaylistTracks] Popülerliği > 0 olan var mı? ${base.some(t => t.popularity > 0)}`);

  // Eğer Spotify popularity verdiyse onu kullan
  if (base.some((t) => t.popularity > 0)) {
    console.log('✅ Spotify popülerlik verisi bulundu, Last.fm\'e gerek yok.');
    return base;
  }

  // VERMEDİYSE LAST.FM'E BAŞVUR
  console.log('⚠️ Spotify popülerlik vermedi, Last.fm ile zenginleştiriliyor...');
  const pops = await enrichWithLastfm(base);
  const enriched = base.map((t, i) => ({ ...t, popularity: pops[i] ?? 0 }));
  
  console.log(`✅ Last.fm sonrası ilk 3 şarkı popülerliği:`, enriched.slice(0,3).map(t => `${t.name} (${t.popularity})`));
  return enriched;
}

// --- TOP TRACKS (Lobi Seçimi İçin) ---
export async function getTopTracks(token: string): Promise<Track[]> {
  const res = await fetch(`${SPOTIFY_API}/me/top/tracks?limit=50&time_range=medium_term`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Top şarkılar alınamadı');

  const base: Track[] = (data.items ?? [])
    .filter((t: any) => t && t.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name || 'Bilinmeyen Şarkı',
      artist: (t.artists ?? []).map((a: any) => a.name).join(', ') || 'Bilinmeyen Sanatçı',
      popularity: t.popularity ?? 0,
      releaseDate: t.album?.release_date ?? '2000-01-01',
      imageUrl: t.album?.images?.[0]?.url ?? null,
    }));

  if (base.length === 0) return [];

  // 🔍 LOG: Top tracks popülerlik durumu
  console.log(`🔍 [getTopTracks] Toplam şarkı: ${base.length}`);
  console.log(`🔍 [getTopTracks] Popülerliği > 0 olan var mı? ${base.some(t => t.popularity > 0)}`);

  if (base.some((t) => t.popularity > 0)) {
    console.log('✅ Spotify popülerlik verisi bulundu.');
    return base;
  }

  console.log('⚠️ Spotify popülerlik vermedi, Last.fm ile zenginleştiriliyor...');
  const pops = await enrichWithLastfm(base);
  const enriched = base.map((t, i) => ({ ...t, popularity: pops[i] ?? 0 }));
  
  console.log(`✅ Last.fm sonrası ilk 3 şarkı popülerliği:`, enriched.slice(0,3).map(t => `${t.name} (${t.popularity})`));
  return enriched;
}