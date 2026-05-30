# 🦖 Dino-RP — Web Sitesi

Baba-oğul (7 yaş) için tasarlanmış dinozor savaşı rol yapma oyununun dijital yardımcısı.

## MVP Özellikleri

- ✅ Karakter yönetimi (oluştur, düzenle, sil)
- ✅ Savaş sistemi (zar atma, yetenek, HP, CD, efektler)
- ✅ XP & Level sistemi (kalıcı ilerleme)
- ✅ Maç günlüğü
- ✅ Mobil-first, Türkçe arayüz
- 🔧 Online altyapısı (hazır, feature gelecek)

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + Framer Motion
- **Database:** Supabase (PostgreSQL + Realtime)
- **Hosting:** Render (Static Site)

## Kurulum & Deployment

1. **Supabase:** `SUPABASE_SETUP.sql` dosyasındaki komutları SQL Editor'de çalıştır
2. **Environment:** `.env` dosyasını oluştur ve Supabase anahtarlarını ekle
3. **Render:** Repository'yi bağla ve env değişkenlerini set et

Detaylı adımlar için bkz. [DEPLOYMENT.md](./DEPLOYMENT.md)

## Geliştirme

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # Üretim build
```

## Yapı

```
src/
  game/          # Saf oyun motoru (UI'dan bağımsız)
    engine.ts    # Tüm kurallar (zar, hasar, efekt, turn)
    config.ts    # Ayarlanabilir sabitler
    types.ts     # TypeScript tipleri
  lib/
    supabase.ts  # Supabase client & helpers
  components/    # React komponentleri
    BattleScreen.tsx
    DinoList.tsx
    DinoForm.tsx
    MatchLog.tsx
    DiceRoller.tsx
  pages/
    Home.tsx     # Ana sayfa & navigasyon
```

---

💡 **Not:** Online düello altyapısı hazır; feature eklenecek.
