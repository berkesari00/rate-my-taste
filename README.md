Rate My Taste
Müzik zevkinin röntgenini çek. Sonucu dünyaya göster.
Rate My Taste, Spotify ve Last.fm verilerini kullanarak müzik dinleme alışkanlıklarınızı derinlemesine analiz eden, multiplayer "Zevk Savaşı" özelliğine sahip bir mobil uygulamadır. Sadece popülerlik puanlarına bakmaz; obskürite, kült faktörü, enerji ve kişisel bağ gibi 5 farklı metrikle şarkıların DNA'sını çıkarır.
Özellikler
Derin Analiz Motoru: Şarkıları sadece stream sayısına göre değil; Obskürite, Kült Faktörü, Enerji, Karanlık ve Kişisel Bağ olmak üzere 5 boyutlu bir skorla değerlendirir.
Harf Notu Sistemi (S/A/B/C/D): Her analize oyunlaştırılmış bir not ve "Gizli Mücevher", "Marş", "Hayalet Kayıt" gibi archetype'lar atar.
Şarkı Yargıcı: Tekil şarkılar için detaylı rapor, tür DNA'sı ve kıyaslamalı "Biliyor muydun?" kartları sunar.
Zevk Savaşı (Multiplayer Lobi): Arkadaşlarınla gerçek zamanlı odalarda buluş, 5'er şarkı seç ve VS modunda oylama yaparak kimin zevkinin daha iyi olduğunu kanıtla.
Editorial UI/UX: Manrope tipografisi, yumuşak gölgeler ve akıcı animasyonlarla profesyonel, minimalist bir tasarım dili.
Paylaşım Kartları: Analiz sonuçlarını Instagram Story formatında, albüm kapaklı ve havalı kartlar olarak paylaş.
Teknolojiler
Katman
Teknoloji
Framework
React Native (Expo SDK 58)
Routing
Expo Router (File-based routing)
Animasyon
React Native Reanimated
Backend / DB
Supabase (Realtime, PostgreSQL)
Müzik Verisi
Spotify Web API + Last.fm API
Auth
Spotify OAuth 2.0
Stiling
StyleSheet + Custom Theme System

Kurulum ve Çalıştırma
# Depoyu klonla
git clone https://github.com/berkesari/rate-my-taste.git
cd rate-my-taste

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur ve gerekli key'leri ekle
cp .env.example .env

# Geliştirme sunucusunu başlat
npx expo start -c

Lisans
MIT