import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import TasteReportCard from '../components/TasteReportCard';
import TrackRow from '../components/TrackRow';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { successFeedback } from '../services/haptics';
import { getTopTracks, Track } from '../services/spotify';
import { analyzeTaste, TasteResult } from '../services/tasteEngine';

export default function OverallTasteScreen() {
  const { accessToken } = useAuth();
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setError('');
    setTracks(null);
    if (!accessToken) {
      setError('Giriş bulunamadı.');
      return;
    }
    try {
      const top = await getTopTracks(accessToken);
      setTracks(top);
    } catch (e: any) {
      setError(e?.message || 'Top şarkılar çekilemedi.');
    }
  };

  const result: TasteResult | null = useMemo(
    () => (tracks && tracks.length ? analyzeTaste(tracks) : null),
    [tracks]
  );

  useEffect(() => {
    if (result) successFeedback();
  }, [result]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Genel Zevk</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.headerSub}>Son 6 ayda en çok dinlediğin 50 şarkı</Text>

      {!tracks && !error && <ActivityIndicator size="large" color={theme.colors.ink} style={{ marginTop: 40 }} />}
      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {tracks && tracks.length === 0 && !error && (
        <Text style={styles.errorText}>Henüz yeterli dinleme geçmişi yok. Biraz müzik dinle, sonra gel!</Text>
      )}

      {result && tracks && (
        <>
          <Animated.View entering={FadeInUp.springify()}>
            <TasteReportCard
              kicker="MÜZİK KİMLİĞİN"
              score={result.score}
              zoneTitle={result.zoneTitle}
              zoneEmoji={result.zoneEmoji}
              message={result.message}
              avgPopularity={result.avgPopularity}
              trackCount={tracks.length}
              badges={result.badges}
            />
          </Animated.View>

          <Text style={styles.sectionTitle}>En Çok Dinlediklerin</Text>
          {tracks.map((t, i) => (
            <Animated.View key={t.id} entering={FadeInUp.delay(120 + Math.min(i, 10) * 50)}>
              <TrackRow track={t} index={i} />
            </Animated.View>
          ))}
        </>
      )}
      <View style={styles.bottomGap} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 56, backgroundColor: theme.colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', ...theme.shadow.card },
  headerTitle: { fontFamily: theme.fonts.heading, fontSize: 20, color: theme.colors.ink },
  headerSub: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginBottom: 24 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radius.md },
  errorText: { flex: 1, fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.danger },
  sectionTitle: { fontFamily: theme.fonts.heading, fontSize: 20, color: theme.colors.ink, marginBottom: 12 },
  bottomGap: { height: 40 },
});