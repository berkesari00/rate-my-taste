import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AnalysisReport from '../components/AnalysisReport';
import ChunkyButton from '../components/ChunkyButton';
import ShareCard, { ShareCardData } from '../components/ShareCard';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getSongProfile, searchTracks, TrackSearchResult } from '../services/lastfm';
import { shareAnalysis } from '../services/shareService';
import { analyzeSong, SongAnalysis } from '../services/songAnalyzer';

export default function SearchSongScreen() {
  const { lastfmUser } = useAuth();
  const shareRef = useRef<View>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TrackSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TrackSearchResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [analysis, setAnalysis] = useState<SongAnalysis | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selected) return;
    setAnalysis(null);
    setError('');
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchTracks(query);
      setSuggestions(results);
      setSearching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (item: TrackSearchResult) => {
    setSelected(item);
    setSuggestions([]);
    setQuery(`${item.artist} - ${item.name}`);
  };

  const handleChangeText = (text: string) => {
    if (selected) setSelected(null);
    setQuery(text);
  };

  const handleAnalyze = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const profile = await getSongProfile(selected.artist, selected.name, lastfmUser || undefined);
      if (profile.listeners === 0 && profile.playcount === 0) {
        setError('Bu şarkı için veri bulunamadı. Başka bir şarkı dene.');
        setLoading(false);
        return;
      }
      setCoverUrl(profile.imageUrl);
      setAnalysis(analyzeSong(profile));
    } catch (e: any) {
      setError(e?.message || 'Analiz yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

    const handleShare = async () => {
    if (!analysis || !shareRef.current || !selected) return;
    setSharing(true);
    try {
      const data: ShareCardData = {
        mode: 'song',
        title: selected.name,
        subtitle: selected.artist,
        score: analysis.composite,
        grade: analysis.grade,
        archetypeEmoji: analysis.archetype.emoji,
        archetypeTitle: analysis.archetype.title,
        message: analysis.roast,
        accent: analysis.archetype.accent,
        imageUrl: coverUrl || undefined,
        meters: [
          { label: 'Obskürite', value: analysis.scores.obscurity, color: theme.colors.purple },
          { label: 'Kült', value: analysis.scores.cult, color: theme.colors.accent },
          { label: 'Bağ', value: analysis.scores.bond, color: theme.colors.danger },
        ],
        tags: analysis.genreDNA,
      };
      await new Promise((r) => setTimeout(r, 300));
      await shareAnalysis(shareRef.current, data);
    } catch (e: any) {
      Alert.alert('Paylaşım Hatası', e?.message || 'Bir şeyler ters gitti.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Şarkı Yargıcı</Text>
      <Text style={styles.headerSub}>Şarkıyı yaz, listeden seç, raporu al</Text>

      <View style={styles.inputWrap}>
        <Ionicons name="musical-note" size={20} color={theme.colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="Şarkı veya sanatçı ara..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={handleChangeText}
        />
        {searching && <ActivityIndicator size="small" color={theme.colors.ink} />}
      </View>

      {!selected && suggestions.length > 0 && (
        <View style={styles.suggestionList}>
          {suggestions.map((s, i) => (
            <Pressable key={i} style={styles.suggestionItem} onPress={() => handleSelect(s)}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.suggestionName} numberOfLines={1}>{s.name}</Text>
                <Text style={styles.suggestionArtist} numberOfLines={1}>{s.artist}</Text>
              </View>
              <Text style={styles.suggestionListeners}>{formatListeners(s.listeners)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {selected && (
        <View style={styles.selectedChip}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.accent} />
          <Text style={styles.selectedText} numberOfLines={1}>
            {selected.artist} - {selected.name}
          </Text>
        </View>
      )}

      <View style={styles.buttonWrap}>
        <ChunkyButton title="Yargıla" onPress={handleAnalyze} disabled={loading || !selected} />
      </View>
      {!selected && !analysis && (
        <Text style={styles.hint}>Önce yukarıdaki listeden bir şarkı seçmelisin.</Text>
      )}

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.ink} />
          <Text style={styles.loadingText}>Şarkının ruhu okunuyor...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {analysis && selected && (
        <View style={styles.reportWrap}>
          <AnalysisReport
            analysis={analysis}
            imageUrl={coverUrl || undefined}
            title={selected.name}
            subtitle={selected.artist}
          />
          <View style={styles.shareWrap}>
            <ChunkyButton variant="primary" title="Raporu Paylaş" onPress={handleShare} disabled={sharing} />
          </View>
        </View>
      )}

      {analysis && selected && (
        <View style={styles.hiddenShare}>
          <View ref={shareRef} collapsable={false}>
            <ShareCard
              data={{
                mode: 'song',
                title: `${selected.artist} - ${selected.name}`,
                subtitle: 'Şarkı karakter analizi',
                score: analysis.composite,
                archetypeEmoji: analysis.archetype.emoji,
                archetypeTitle: `${analysis.grade} · ${analysis.archetype.title}`,
                message: analysis.roast,
                accent: analysis.archetype.accent,
              }}
            />
          </View>
        </View>
      )}

      <View style={styles.bottomGap} />
    </ScrollView>
  );
}

function formatListeners(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 56, backgroundColor: theme.colors.bg },
  headerTitle: { fontFamily: theme.fonts.heading, fontSize: 30, color: theme.colors.ink, marginBottom: 4 },
  headerSub: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginBottom: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, paddingHorizontal: 16, marginBottom: 12, ...theme.shadow.card },
  input: { flex: 1, fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.ink, paddingVertical: 16 },
  suggestionList: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, overflow: 'hidden', marginBottom: 16, ...theme.shadow.card },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  suggestionName: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.colors.ink, marginBottom: 2 },
  suggestionArtist: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary },
  suggestionListeners: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.colors.textMuted },
  selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  selectedText: { flex: 1, fontFamily: theme.fonts.bodyBold, fontSize: 14, color: theme.colors.accent },
  buttonWrap: { marginBottom: 8 },
  hint: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 16 },
  loadingWrap: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginTop: 12 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radius.md, marginBottom: 16 },
  errorText: { flex: 1, fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.danger },
  reportWrap: { marginTop: 8 },
  shareWrap: { marginTop: 20 },
  hiddenShare: { position: 'absolute', left: -9999, top: -9999 },
  bottomGap: { height: 40 },
});