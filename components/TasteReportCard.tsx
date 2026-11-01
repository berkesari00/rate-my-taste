import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { theme } from '../constants/theme';

type Props = {
  kicker: string;
  score: number;
  zoneTitle: string;
  zoneEmoji: string;
  message: string;
  avgPopularity: number;
  trackCount: number;
  badges: string[];
};

export default function TasteReportCard({ kicker, score, zoneTitle, zoneEmoji, message, avgPopularity, trackCount, badges }: Props) {
  const [display, setDisplay] = useState(0);
  const meter = useSharedValue(0);

  useEffect(() => {
    setDisplay(0);
    meter.value = 0;
    meter.value = withDelay(250, withTiming(avgPopularity / 100, { duration: 900, easing: Easing.out(Easing.cubic) }));
    const start = Date.now();
    const dur = 1000;
    const tick = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, avgPopularity]);

  const meterStyle = useAnimatedStyle(() => ({ width: `${Math.max(meter.value * 100, 2)}%` }));

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>{kicker}</Text>
      <View style={styles.zoneRow}>
        <Text style={styles.zoneEmoji}>{zoneEmoji}</Text>
        <Text style={styles.zoneTitle}>{zoneTitle}</Text>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{display}</Text>
        <Text style={styles.scoreMax}>/100</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.tasteLabel}>TASTE SCORE</Text>
      </View>
      <Text style={styles.message}>"{message}"</Text>
      <View style={styles.meterBlock}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterLabel}>Ortalama Popülerlik</Text>
          <Text style={styles.meterValue}>{avgPopularity}</Text>
        </View>
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, meterStyle]} />
        </View>
      </View>
      <Text style={styles.stat}>{trackCount} şarkı analiz edildi</Text>
      {badges.length > 0 && (
        <View style={styles.badgeRow}>
          {badges.map((b, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl, padding: 24, marginBottom: 24, ...theme.shadow.button },
  kicker: { fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 2, color: theme.colors.accent, marginBottom: 14 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  zoneEmoji: { fontSize: 28 },
  zoneTitle: { fontFamily: theme.fonts.heading, fontSize: 22, color: '#FFFFFF' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  score: { fontFamily: theme.fonts.heading, fontSize: 56, color: '#FFFFFF', lineHeight: 60 },
  scoreMax: { fontFamily: theme.fonts.body, fontSize: 18, color: 'rgba(255,255,255,0.6)', marginLeft: 4 },
  tasteLabel: { fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.5)' },
  message: { fontFamily: theme.fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginBottom: 20 },
  meterBlock: { gap: 6, marginBottom: 14 },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  meterLabel: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  meterValue: { fontFamily: theme.fonts.heading, fontSize: 13, color: '#FFFFFF' },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.accent },
  stat: { fontFamily: theme.fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: '#FFFFFF' },
});