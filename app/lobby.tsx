import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ChunkyButton from '../components/ChunkyButton';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { searchTracks, TrackSearchResult } from '../services/spotify';
import { Lobby, Player, supabase } from '../services/supabase';

export default function LobbyScreen() {
  const { userName, accessToken } = useAuth();
  const [mode, setMode] = useState<'menu' | 'waiting' | 'selecting' | 'voting' | 'result'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Seçim aşaması state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TrackSearchResult[]>([]);
  const [mySelections, setMySelections] = useState<any[]>([]);
  
  // Oylama aşaması state'leri
  const [hasVoted, setHasVoted] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  // Arama önerileri (Token ile!)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2 || !accessToken) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchTracks(searchQuery, accessToken);
        setSuggestions(results.slice(0, 5));
      } catch (e) {
        console.error('Arama hatası:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, accessToken]);

  const handleCreate = async () => {
    if (!accessToken) return Alert.alert('Hata', 'Önce giriş yapmalısın.');
    setLoading(true);
    const code = generateCode();
    try {
      const { error } = await supabase.from('lobbies').insert({
        id: code,
        host_id: userName,
        status: 'selecting',
        current_round: 0,
        max_rounds: 5,
      });
      if (error) throw error;

      const { data: player, error: pError } = await supabase
        .from('players')
        .insert({ lobby_id: code, user_name: userName, is_ready: false, selections: [] })
        .select()
        .single();
      if (pError) throw pError;

      setMyPlayerId(player.id);
      setRoomCode(code);
      setMode('selecting');
      subscribeToLobby(code);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return Alert.alert('Hata', 'Oda kodu gir.');
    if (!userName) return Alert.alert('Hata', 'Önce giriş yapmalısın.');
    setLoading(true);
    try {
      const { data: lobbyData, error } = await supabase.from('lobbies').select('*').eq('id', roomCode.toUpperCase()).single();
      if (error || !lobbyData) throw new Error('Oda bulunamadı.');

      const { data: player, error: pError } = await supabase
        .from('players')
        .insert({ lobby_id: roomCode.toUpperCase(), user_name: userName, is_ready: false, selections: [] })
        .select()
        .single();
      if (pError) throw pError;

      setMyPlayerId(player.id);
      setLobby(lobbyData);
      setMode(lobbyData.status === 'selecting' ? 'selecting' : lobbyData.status as any);
      subscribeToLobby(roomCode.toUpperCase());
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLobby = (code: string) => {
    const channel = supabase.channel(`lobby:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobbies', filter: `id=eq.${code}` }, (payload) => {
        const newLobby = payload.new as Lobby;
        setLobby(newLobby);
        if (newLobby.status !== mode && newLobby.status !== 'selecting') {
            setMode(newLobby.status as any);
            setHasVoted(false); // Tur değişince oyu sıfırla
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `lobby_id=eq.${code}` }, () => {
        supabase.from('players').select('*').eq('lobby_id', code).then(({ data }) => {
          if (data) {
            setPlayers(data as Player[]);
            const me = data.find(p => p.id === myPlayerId);
            if (me) setMySelections(me.selections || []);
          }
        });
      })
      .subscribe();
      
    // İlk yükleme
    supabase.from('players').select('*').eq('lobby_id', code).then(({ data }) => {
      if (data) {
        setPlayers(data as Player[]);
        const me = data.find(p => p.id === myPlayerId);
        if (me) setMySelections(me.selections || []);
      }
    });
    
    return () => {
        supabase.removeChannel(channel);
    }
  };

  const addSongToSelection = (song: any) => {
    if (mySelections.length >= 5) return Alert.alert('Limit', 'En fazla 5 şarkı seçebilirsin.');
    if (mySelections.find(s => s.name === song.name && s.artist === song.artist)) return;
    
    const newSelections = [...mySelections, song];
    setMySelections(newSelections);
    if (myPlayerId) {
      supabase.from('players').update({ selections: newSelections }).eq('id', myPlayerId);
    }
    setSearchQuery('');
    setSuggestions([]);
  };

  const finishSelection = async () => {
    if (mySelections.length < 5) return Alert.alert('Eksik', 'Lütfen 5 şarkı seç.');
    if (myPlayerId) {
      await supabase.from('players').update({ is_ready: true }).eq('id', myPlayerId);
    }
  };

  const startGame = async () => {
    if (!lobby) return;
    await supabase.from('lobbies').update({ status: 'voting', current_round: 1 }).eq('id', lobby.id);
  };

  const castVote = async (winnerIndex: 0 | 1) => {
    if (!lobby || !myPlayerId || hasVoted) return;
    
    // Basit skor mantığı: Oy kullananın skoru artar
    const { data: player } = await supabase.from('players').select('score').eq('id', myPlayerId).single();
    const newScore = (player?.score || 0) + 10;
    
    await supabase.from('players').update({ score: newScore }).eq('id', myPlayerId);
    setHasVoted(true);
    
    // Sonraki tura geçiş simülasyonu
    setTimeout(async () => {
        if (lobby.current_round >= lobby.max_rounds) {
            await supabase.from('lobbies').update({ status: 'finished' }).eq('id', lobby.id);
        } else {
            await supabase.from('lobbies').update({ current_round: lobby.current_round + 1 }).eq('id', lobby.id);
            setHasVoted(false);
        }
    }, 1500);
  };

  // --- RENDER BÖLÜMLERİ ---

  if (mode === 'menu') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Zevk Savaşı</Text>
        <Text style={styles.headerSub}>5 şarkını seç, arkadaşlarınla kapış</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yeni Oda</Text>
          <ChunkyButton title="Oda Oluştur" onPress={handleCreate} disabled={loading} />
        </View>
        <View style={styles.divider}><Text style={styles.dividerText}>VEYA</Text></View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Odaya Katıl</Text>
          <TextInput style={styles.input} placeholder="ODA KODU" value={roomCode} onChangeText={setRoomCode} autoCapitalize="characters" maxLength={4} />
          <ChunkyButton variant="secondary" title="Katıl" onPress={handleJoin} disabled={loading || roomCode.length < 4} />
        </View>
      </ScrollView>
    );
  }

  if (mode === 'selecting') {
    const allReady = players.length > 1 && players.every(p => p.is_ready);
    const isHost = lobby?.host_id === userName;
    
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.roomCode}>{roomCode}</Text>
        <Text style={styles.sectionTitle}>Şarkılarını Seç ({mySelections.length}/5)</Text>
        
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Şarkı ara..." value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {suggestions.map((s, i) => (
          <Pressable key={i} style={styles.suggestionItem} onPress={() => addSongToSelection(s)}>
            <Text style={styles.suggestionName}>{s.name}</Text>
            <Text style={styles.suggestionArtist}>{s.artist}</Text>
          </Pressable>
        ))}

        <View style={styles.selectionList}>
          {mySelections.map((s, i) => (
            <View key={i} style={styles.selectedChip}>
              <Text style={styles.chipNum}>{i+1}.</Text>
              <Text style={styles.chipText} numberOfLines={1}>{s.name} - {s.artist}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonWrap}>
          <ChunkyButton title="Seçimleri Bitir" onPress={finishSelection} disabled={mySelections.length < 5} />
          {isHost && allReady && <ChunkyButton variant="accent" title="Savaşı Başlat" onPress={startGame} />}
        </View>
      </ScrollView>
    );
  }

  if (mode === 'voting') {
    // Basit demo: Rastgele iki oyuncunun ilk şarkısını göster
    const p1 = players[0]; 
    const p2 = players[1];
    const songA = p1?.selections?.[lobby?.current_round ? lobby.current_round - 1 : 0];
    const songB = p2?.selections?.[lobby?.current_round ? lobby.current_round - 1 : 0];

    if (!songA || !songB) return <View style={styles.container}><Text>Veriler yükleniyor...</Text></View>;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.roundText}>TUR {lobby?.current_round} / {lobby?.max_rounds}</Text>
        <Text style={styles.question}>Hangisi Daha İyi?</Text>
        
        <View style={styles.vsContainer}>
          <Pressable style={[styles.voteCard, hasVoted && styles.disabledCard]} onPress={() => castVote(0)} disabled={hasVoted}>
            <Text style={styles.votePlayer}>{p1.user_name}</Text>
            <Text style={styles.voteSong}>{songA.name}</Text>
            <Text style={styles.voteArtist}>{songA.artist}</Text>
          </Pressable>
          
          <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
          
          <Pressable style={[styles.voteCard, hasVoted && styles.disabledCard]} onPress={() => castVote(1)} disabled={hasVoted}>
            <Text style={styles.votePlayer}>{p2.user_name}</Text>
            <Text style={styles.voteSong}>{songB.name}</Text>
            <Text style={styles.voteArtist}>{songB.artist}</Text>
          </Pressable>
        </View>
        
        {hasVoted && <Text style={styles.waitingText}>Sonuçlar hesaplanıyor...</Text>}
      </ScrollView>
    );
  }

  if (mode === 'result') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.winnerText}>🏆 {sorted[0]?.user_name} KAZANDI!</Text>
        <Text style={styles.sectionTitle}>Sıralama</Text>
        {sorted.map((p, i) => (
          <View key={p.id} style={styles.playerRow}>
            <Text style={styles.rank}>{i + 1}.</Text>
            <Text style={styles.playerName}>{p.user_name}</Text>
            <Text style={styles.playerScore}>{p.score} Puan</Text>
          </View>
        ))}
        <View style={styles.buttonWrap}>
          <ChunkyButton variant="secondary" title="Ana Sayfa" onPress={() => router.back()} />
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 56, backgroundColor: theme.colors.bg },
  headerTitle: { fontFamily: theme.fonts.heading, fontSize: 30, color: theme.colors.ink, marginBottom: 4 },
  headerSub: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, marginBottom: 32 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20, marginBottom: 16, gap: 12, ...theme.shadow.card },
  cardTitle: { fontFamily: theme.fonts.subheading, fontSize: 18, color: theme.colors.ink },
  input: { backgroundColor: theme.colors.bg, borderRadius: theme.radius.md, padding: 14, fontFamily: theme.fonts.bodyBold, fontSize: 16, color: theme.colors.ink, textAlign: 'center', letterSpacing: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerText: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.colors.textMuted, marginHorizontal: 12 },
  roomCode: { fontFamily: theme.fonts.heading, fontSize: 64, color: theme.colors.ink, textAlign: 'center', letterSpacing: 8, marginBottom: 24 },
  sectionTitle: { fontFamily: theme.fonts.heading, fontSize: 20, color: theme.colors.ink, marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 12, marginBottom: 12, ...theme.shadow.card },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.ink },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  suggestionName: { fontFamily: theme.fonts.bodyBold, fontSize: 15, color: theme.colors.ink },
  suggestionArtist: { fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textSecondary },
  selectionList: { marginTop: 16, gap: 8 },
  selectedChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.md, padding: 10 },
  chipNum: { fontFamily: theme.fonts.bodyBold, fontSize: 14, color: theme.colors.accent, marginRight: 8 },
  chipText: { flex: 1, fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.ink },
  buttonWrap: { marginTop: 24, gap: 12 },
  roundText: { fontFamily: theme.fonts.bodyBold, fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 8 },
  question: { fontFamily: theme.fonts.heading, fontSize: 24, color: theme.colors.ink, textAlign: 'center', marginBottom: 24 },
  vsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voteCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, alignItems: 'center', ...theme.shadow.card, marginHorizontal: 4 },
  disabledCard: { opacity: 0.5 },
  votePlayer: { fontFamily: theme.fonts.bodyBold, fontSize: 12, color: theme.colors.accent, marginBottom: 8 },
  voteSong: { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.ink, textAlign: 'center', marginBottom: 4 },
  voteArtist: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  vsBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  vsText: { fontFamily: theme.fonts.heading, fontSize: 16, color: '#FFF' },
  waitingText: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 24 },
  winnerText: { fontFamily: theme.fonts.heading, fontSize: 32, color: theme.colors.accent, textAlign: 'center', marginBottom: 32 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginBottom: 8, ...theme.shadow.card },
  rank: { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.textMuted, width: 30 },
  playerName: { flex: 1, fontFamily: theme.fonts.bodyBold, fontSize: 16, color: theme.colors.ink },
  playerScore: { fontFamily: theme.fonts.heading, fontSize: 18, color: theme.colors.ink },
});