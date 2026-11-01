import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export type ShareCardData = {
  mode: 'song' | 'overall' | 'playlist';
  title: string;
  subtitle: string;
  score: number;
  grade?: string; // S, A, B, C, D
  archetypeEmoji: string;
  archetypeTitle: string;
  message: string;
  accent: string;
  imageUrl?: string;
  meters?: { label: string; value: number; color: string }[];
  tags?: string[];
};

type Props = {
  data: ShareCardData;
};

const GRADE_COLORS: Record<string, string> = {
  S: theme.colors.accent,
  A: theme.colors.purple,
  B: theme.colors.amber,
  C: theme.colors.textSecondary,
  D: theme.colors.danger,
};

export default function ShareCard({ data }: Props) {
  const gradeColor = data.grade ? (GRADE_COLORS[data.grade] ?? theme.colors.ink) : data.accent;

  return (
    <View style={styles.frame}>
      <View style={styles.card}>
        {/* Üst: Logo + Mod */}
        <View style={styles.topRow}>
          <View style={styles.logoMark}>
            <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.brand}>RATE MY TASTE</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Kapak + Başlık */}
        <View style={styles.headRow}>
          {data.imageUrl ? (
            <Image source={{ uri: data.imageUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="musical-note" size={32} color={theme.colors.textMuted} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.modeLabel}>
              {data.mode === 'song' ? 'ŞARKI YARGICI' : data.mode === 'overall' ? 'MÜZİK KİMLİĞİM' : 'PLAYLİST ANALİZİ'}
            </Text>
            <Text style={styles.title} numberOfLines={2}>{data.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{data.subtitle}</Text>
          </View>
        </View>

        {/* Not + Archetype */}
        <View style={styles.verdictRow}>
          {data.grade && (
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
              <Text style={styles.gradeLetter}>{data.grade}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.archRow}>
              <Text style={styles.archEmoji}>{data.archetypeEmoji}</Text>
              <Text style={styles.archTitle}>{data.archetypeTitle}</Text>
            </View>
            <Text style={styles.scoreText}>
              {data.score}<Text style={styles.scoreMax}>/100</Text>
            </Text>
          </View>
        </View>

        {/* Mesaj */}
        <Text style={styles.message}>"{data.message}"</Text>

        {/* Metreler (varsa) */}
        {data.meters && data.meters.length > 0 && (
          <View style={styles.metersBlock}>
            {data.meters.slice(0, 3).map((m, i) => (
              <View key={i} style={styles.miniMeter}>
                <Text style={styles.miniLabel}>{m.label}</Text>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${Math.max(m.value, 4)}%`, backgroundColor: m.color }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tür DNA'sı (varsa) */}
        {data.tags && data.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {data.tags.slice(0, 3).map((t, i) => (
              <View key={i} style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Alt imza */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>sen de zevkini sorgulat · ratemytaste.app</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 360,
    backgroundColor: theme.colors.bg,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    minHeight: 580,
    justifyContent: 'space-between',
    ...theme.shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.ink,
  },
  headRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: 88,
    height: 88,
    borderRadius: 18,
    ...theme.shadow.card,
  },
  coverFallback: {
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: 20,
    color: theme.colors.ink,
    lineHeight: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  gradeBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: {
    fontFamily: theme.fonts.heading,
    fontSize: 30,
    color: '#FFFFFF',
  },
  archRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  archEmoji: { fontSize: 18 },
  archTitle: {
    fontFamily: theme.fonts.subheading,
    fontSize: 16,
    color: theme.colors.ink,
  },
  scoreText: {
    fontFamily: theme.fonts.heading,
    fontSize: 28,
    color: theme.colors.ink,
  },
  scoreMax: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  message: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  metersBlock: {
    gap: 8,
    marginBottom: 16,
  },
  miniMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniLabel: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    color: theme.colors.textSecondary,
    width: 70,
  },
  miniTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
  },
  miniFill: {
    height: 6,
    borderRadius: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  footerText: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});