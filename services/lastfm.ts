const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/';
const KEY = process.env.EXPO_PUBLIC_LASTFM_API_KEY || '';

const cache = new Map<string, number>();

export async function getTrackListeners(artist: string, track: string): Promise<number> {
  const cacheKey = `${artist}::${track}`.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const url =
      `${LASTFM_API}?method=track.getInfo&api_key=${KEY}` +
      `&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}` +
      `&autocorrect=1&format=json`;
    
    const res = await fetch(url);
    const data = await res.json();
    const listeners = parseInt(data?.track?.listeners ?? '0', 10) || 0;
    
    cache.set(cacheKey, listeners);
    return listeners;
  } catch {
    return 0;
  }
}

export function listenersToPopularity(listeners: number): number {
  if (listeners <= 0) return 0;
  const score = (Math.log10(listeners + 1) / 7) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function enrichWithLastfm(
  tracks: { name: string; artist: string }[]
): Promise<number[]> {
  const result: number[] = [];
  for (let i = 0; i < tracks.length; i += 5) {
    const chunk = tracks.slice(i, i + 5);
    const pops = await Promise.all(
      chunk.map((t) =>
        getTrackListeners(t.artist, t.name).then(listenersToPopularity)
      )
    );
    result.push(...pops);
  }
  return result;
}