import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

type AuthContextType = {
  accessToken: string | null;
  userName: string;
  lastfmUser: string;
  loading: boolean;
  request: AuthSession.AuthRequest | null;
  promptLogin: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [lastfmUser, setLastfmUser] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET!;
  const redirectUri = 'ratemytaste://callback';

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      scopes: [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-top-read',
        'user-read-recently-played',
      ],
      redirectUri: redirectUri,
      extraParams: { show_dialog: 'true' },
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      exchangeCodeForToken(response.params.code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    setLoading(true);
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: request?.codeVerifier ?? '',
      });

      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = await res.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        fetchUserProfile(data.access_token);
      }
    } catch (e) {
      console.error('Token hatası:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserName(data.display_name || 'Müzik Sever');
      // Spotify id'sini Last.fm username'i olarak dene (kişisel bağ skoru için)
      setLastfmUser(data.id || '');
    } catch (e) {
      console.error('Profil hatası:', e);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUserName('');
    setLastfmUser('');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userName,
        lastfmUser,
        loading,
        request,
        promptLogin: () => promptAsync(),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}