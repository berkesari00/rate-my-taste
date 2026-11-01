import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import ChunkyButton from '../../components/ChunkyButton';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getMyPlaylists, Playlist } from '../../services/spotify';

export default function HomeScreen() {
  const { accessToken, userName, loading, request, promptLogin, logout } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const orbA = useSharedValue(0);
  const orbB = useSharedValue(0);

  useEffect(() => {
    orbA.value = withRepeat(
      withSequence(withTiming(-24, { duration: 4000 }), withTiming(0, { duration: 4000 })),
      -1,
      true
    );
    orbB.value = withRepeat(
      withSequence(withTiming(20, { duration: 5000 }), withTiming(0, { duration: 5000 })),
      -1,
      true
    );
  }, []);

  const orbAStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbA.value }] }));
  const orbBStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbB.value }] }));

  useEffect(() => {
    if (accessToken) {
      setLoadingPlaylists(true);
      getMyPlaylists(accessToken)
        .then(setPlaylists)
        .catch((e) => console.error(e))
        .finally(() => setLoadingPlaylists(false));
    }
  }, [accessToken]);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Oturumun sıfırlanacak. Emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!userName) {
    return (
      <View style={styles.loginContainer}>
        <Animated.View style={[styles.orbA, orbAStyle]} />
        <Animated.View style={[styles.orbB, orbBStyle]} />

        <Animated.View entering={FadeInUp.springify().damping(14)} style={styles.mark}>
          <Image source={require('../../assets/images/logo.png')} style={styles.markImage} />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(80).springify()} style={styles.loginTitle}>
          Rate My Taste
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(140).springify()} style={styles.loginSub}>
          Müzik zevkinin röntgenini çek.{'\n'}Sonucu dünyaya göster.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(220).springify()} style={styles.loginButtonWrap}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.ink} />
          ) : Platform.OS === 'web' ? (
            <ChunkyButton variant="secondary" title="Demo Modu" onPress={() => {}} />
          ) : (
            <ChunkyButton title="Spotify ile Bağlan" onPress={promptLogin} disabled={!request} />
          )}
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(300)} style={styles.loginFooter}>
          Güvenli giriş · Spotify OAuth
        </Animated.Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.dash}>
      <Animated.View entering={FadeInUp.springify()} style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerKicker}>HOŞ GELDİN</Text>
          <Text style={styles.headerName} numberOfLines={1}>
            {userName}
          </Text>
        </View>
        <Pressable style={styles.iconButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).springify()}>
        <Pressable style={styles.heroCard} onPress={() => router.push('/taste')}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="sparkles" size={22} color={theme.colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Genel Zevkim</Text>
            <Text style={styles.heroSub}>Son 6 ayın · müzik kimliğin</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(140).springify()}>
        <Pressable style={styles.actionCard} onPress={() => router.push('/search')}>
          <View style={[styles.actionIconWrap, { backgroundColor: theme.colors.purpleSoft }]}>
            <Ionicons name="search" size={22} color={theme.colors.purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Şarkı Yargıcı</Text>
            <Text style={styles.actionSub}>Tek şarkı · derin karakter analizi</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </Animated.View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Playlistlerin</Text>
        <Text style={styles.sectionCount}>{playlists.length}</Text>
      </View>

      {loadingPlaylists ? (
        <ActivityIndicator size="large" color={theme.colors.ink} style={{ marginTop: 24 }} />
      ) : playlists.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="musical-notes" size={40} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Henüz playlist yok</Text>
          <Text style={styles.emptySub}>Spotify'da bir tane oluştur, burada belirsin.</Text>
        </View>
      ) : (
        playlists.map((p, index) => (
          <Animated.View key={p.id} entering={FadeInUp.delay(180 + index * 60).springify()}>
            <Pressable style={styles.playlistCard} onPress={() => router.push(`/playlist/${p.id}`)}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={styles.playlistImage} />
              ) : (
                <View style={[styles.playlistImage, styles.playlistFallback]}>
                  <Ionicons name="musical-note" size={24} color={theme.colors.textMuted} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.playlistName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.playlistMeta}>{p.totalTracks} şarkı</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))
      )}
      <View style={styles.bottomGap} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32, overflow: 'hidden' },
  orbA: { position: 'absolute', top: -80, right: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: theme.colors.accentSoft },
  orbB: { position: 'absolute', bottom: -120, left: -120, width: 380, height: 380, borderRadius: 190, backgroundColor: theme.colors.purpleSoft },
  mark: { width: 104, height: 104, borderRadius: 30, overflow: 'hidden', marginBottom: 28, ...theme.shadow.button },
  markImage: { width: '100%', height: '100%' },
  loginTitle: { fontFamily: theme.fonts.heading, fontSize: 40, color: theme.colors.ink, textAlign: 'center', marginBottom: 10 },
  loginSub: { fontFamily: theme.fonts.body, fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 44 },
  loginButtonWrap: { width: '100%', maxWidth: 320 },
  loginFooter: { fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 28 },
  dash: { padding: 24, paddingTop: 56, backgroundColor: theme.colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  headerKicker: { fontFamily: theme.fonts.bodyBold, fontSize: 11, letterSpacing: 2, color: theme.colors.textMuted, marginBottom: 4 },
  headerName: { fontFamily: theme.fonts.heading, fontSize: 32, color: theme.colors.ink },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', ...theme.shadow.card },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl, padding: 22, marginBottom: 14, ...theme.shadow.button },
  heroIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(29, 185, 84, 0.16)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: theme.fonts.subheading, fontSize: 19, color: '#FFFFFF', marginBottom: 2 },
  heroSub: { fontFamily: theme.fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 22, marginBottom: 32, ...theme.shadow.card },
  actionIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontFamily: theme.fonts.subheading, fontSize: 19, color: theme.colors.ink, marginBottom: 2 },
  actionSub: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontFamily: theme.fonts.heading, fontSize: 22, color: theme.colors.ink },
  sectionCount: { fontFamily: theme.fonts.bodyBold, fontSize: 13, color: theme.colors.textMuted },
  playlistCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 14, marginBottom: 12, ...theme.shadow.card },
  playlistImage: { width: 56, height: 56, borderRadius: 14 },
  playlistFallback: { backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  playlistName: { fontFamily: theme.fonts.bodyBold, fontSize: 16, color: theme.colors.ink, marginBottom: 2 },
  playlistMeta: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary },
  emptyCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 36, alignItems: 'center', ...theme.shadow.card },
  emptyTitle: { fontFamily: theme.fonts.subheading, fontSize: 17, color: theme.colors.ink, marginTop: 12, marginBottom: 4 },
  emptySub: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  bottomGap: { height: 40 },
});