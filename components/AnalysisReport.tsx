import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { SongAnalysis } from '../services/songAnalyzer';

const GRADE_COLORS: Record<string, string> = {
  S: theme.colors.accent,
  A: theme.colors.purple,
  B: theme.colors.amber,
  C: theme.colors.textSecondary,
  D: theme.colors.danger,
};

function Meter({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(value / 100, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [value, delay]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress.value * 100, 2)}%`,
  }));

  return (
    <View style={styles.meterRow}>
      <View style={styles.meterHeader}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={[styles.meterValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

type Props = {
  analysis: SongAnalysis;
  imageUrl?: string;
  title: string;
  subtitle?: string;
};

export default function AnalysisReport({ analysis, imageUrl, title, subtitle }: Props) {
  const gradeScale = useSharedValue(0.4);

  useEffect(() => {
    gradeScale.value = 0.4;
    gradeScale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 140 }));
  }, [analysis.grade]);

  const gradeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gradeScale.value }],
  }));

  const gradeColor = GRADE_COLORS[analysis.grade] ?? theme.colors.ink;

  return (
    <View style={styles.wrap}>
      {/* Kapak + başlık */}
      <View style={styles.headRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="musical-note" size={32} color={theme.colors.textMuted} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          <View style={[styles.archChip, { backgroundColor: `${analysis.archetype.accent}1A` }]}>
            <Text style={styles.archEmoji}>{analysis.archetype.emoji}</Text>
            <Text style={[styles.archTitle, { color: analysis.archetype.accent === '#0B0B0C' ? theme.colors.ink : analysis.archetype.accent }]}>
              {analysis.archetype.title}
            </Text>
          </View>
        </View>
      </View>

      {/* Not kartı */}
      <View style={styles.gradeCard}>
        <Animated.View style={[styles.gradeBadge, { backgroundColor: gradeColor }, gradeStyle]}>
          <Text style={styles.gradeLetter}>{analysis.grade}</Text>
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={styles.gradeLabel}>{analysis.gradeLabel}</Text>
          <Text style={styles.gradeSub}>Kompozit zevk skoru</Text>
        </View>
        <Text style={styles.composite}>{analysis.composite}</Text>
      </View>

      {/* Metreler */}
      <View style={styles.card}>
        <Meter label="Obskürite" value={analysis.scores.obscurity} color={theme.colors.purple} delay={200} />
        <Meter label="Kült Faktörü" value={analysis.scores.cult} color={theme.colors.accent} delay={320} />
        <Meter label="Enerji" value={analysis.scores.energy} color={theme.colors.amber} delay={440} />
        <Meter label="Karanlık" value={analysis.scores.darkness} color={theme.colors.ink} delay={560} />
        <Meter label="Kişisel Bağın" value={analysis.scores.bond} color={theme.colors.danger} delay={680} />
      </View>

      {/* Tür DNA'sı */}
      <View style={styles.dnaRow}>
        {analysis.genreDNA.map((g, i) => (
          <View key={i} style={styles.dnaChip}>
            <Text style={styles.dnaText}>{g}</Text>
          </View>
        ))}
      </View>

      {/* Roast */}
      <Text style={styles.roast}>"{analysis.roast}"</Text>

      {/* Biliyor muydun */}
      {analysis.funFacts.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.factsTitle}>Biliyor muydun?</Text>
          {analysis.funFacts.map((f, i) => (
            <View key={i} style={styles.factRow}>
              <Ionicons name="bulb-outline" size={16} color={theme.colors.amber} style={{ marginTop: 2 }} />
              <Text style={styles.factText}>{f}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  headRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  cover: { width: 96, height: 96, borderRadius: 20, ...theme.shadow.card },
  coverFallback: { backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: theme.fonts.heading, fontSize: 20, color: theme.colors.ink, marginBottom: 2 },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  archChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  archEmoji: { fontSize: 14 },
  archTitle: { fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  gradeCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20, ...theme.shadow.card },
  gradeBadge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  gradeLetter: { fontFamily: theme.fonts.heading, fontSize: 34, color: '#FFFFFF' },
  gradeLabel: { fontFamily: theme.fonts.subheading, fontSize: 18, color: theme.colors.ink },
  gradeSub: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  composite: { fontFamily: theme.fonts.heading, fontSize: 34, color: theme.colors.ink },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20, gap: 14, ...theme.shadow.card },
  meterRow: { gap: 6 },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  meterLabel: { fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textSecondary },
  meterValue: { fontFamily: theme.fonts.heading, fontSize: 14 },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4 },
  dnaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dnaChip: { backgroundColor: theme.colors.surfaceMuted, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  dnaText: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.colors.textSecondary },
  roast: { fontFamily: theme.fonts.subheading, fontSize: 17, color: theme.colors.ink, lineHeight: 26, textAlign: 'center', paddingHorizontal: 8 },
  factsTitle: { fontFamily: theme.fonts.subheading, fontSize: 15, color: theme.colors.ink, marginBottom: 2 },
  factRow: { flexDirection: 'row', gap: 8 },
  factText: { flex: 1, fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
});