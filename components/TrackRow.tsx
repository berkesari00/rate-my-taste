import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { Track } from '../services/spotify';

const popLabel = (p: number) => {
  if (p >= 75) return { text: 'Popüler', bg: theme.colors.dangerSoft, fg: theme.colors.danger };
  if (p >= 40) return { text: 'Dengeli', bg: theme.colors.amberSoft, fg: theme.colors.amber };
  return { text: 'Niche', bg: theme.colors.purpleSoft, fg: theme.colors.purple };
};

export default function TrackRow({ track, index }: { track: Track; index: number }) {
  const label = popLabel(track.popularity);
  return (
    <View style={styles.row}>
      {track.imageUrl ? (
        <Image source={{ uri: track.imageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.fallback]}>
          <Ionicons name="musical-note" size={18} color={theme.colors.textMuted} />
        </View>
      )}
      <Text style={styles.num}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: label.bg }]}>
        <Text style={[styles.pillText, { color: label.fg }]}>{label.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 12, marginBottom: 10, ...theme.shadow.card },
  cover: { width: 48, height: 48, borderRadius: 12 },
  fallback: { backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textMuted, width: 20, textAlign: 'center' },
  name: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.colors.ink, marginBottom: 2 },
  artist: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontFamily: theme.fonts.bodyBold, fontSize: 11 },
});