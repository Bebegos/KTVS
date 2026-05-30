# 🚀 Deployment Rehberi

## 1. Supabase Hazırlık

### 1.1 SQL Tabloları Oluştur

1. [supabase.com](https://supabase.com) → Yeni Proje
2. **SQL Editor** sekmesine git
3. `SUPABASE_SETUP.sql` dosyasının tüm içeriğini kopyala ve çalıştır

### 1.2 API Anahtarlarını Al

1. **Settings → API** sekmesine git
2. Kopyala:
   - **Project URL** (Ör: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public key** (herhangi bir key'e tıkla, ilk satır)

## 2. GitHub Setup

### 2.1 Environment Dosyası

Proje kökünde `.env` dosyası oluştur:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

⚠️ **.env dosyasını GitHub'a yükleme!** `.gitignore`'de zaten var.

### 2.2 GitHub'a Push Et

```bash
git add .
git commit -m "Initial Dino-RP web game setup with game engine, components, and Supabase integration"
git push -u origin claude/dino-rp-web-game-3zGnB
```

## 3. Render Deployment

### 3.1 Yeni Static Site

1. [render.com](https://render.com) → **New → Static Site**
2. GitHub repository'yi bağla (`bebegos/ktvs`)
3. Branch: `claude/dino-rp-web-game-3zGnB`

### 3.2 Build & Deploy Ayarları

| Alan | Değer |
|------|-------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3.3 Environment Variables

**Environment** sekmesine git ve ekle:

```
VITE_SUPABASE_URL = https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxxxxx...
```

### 3.4 SPA Rewrite Kuralı

**Redirects/Rewrites** sekmesine git:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** `Rewrite`

Kaydet → Deploy → Bitti! 🎉

## 4. Telefondan Erişim

1. Render deployment URL'sini kopyala (Ör: `https://dino-rp.onrender.com`)
2. Telefondan aç
3. **Ana ekrana kısayol ekle** (mobil tarayıcı → menü → "Ana Ekrana Ekle")

## 5. Sonraki Adımlar

- 🎮 Dinozor oluştur ve savaş yap
- 📊 XP & Level sistemi test et
- 🐛 Hataları rapor et
- 🌐 Online düello feature'ı eklenecek

---

**Sorular?** `.env` veya authentication sorunuz varsa, bkz. [Güvenlik Notu](./GUVENLIK.md)
