# 🤖 Xeyal Userbot v2.0

> **WhatsApp Userbot — Developer: Xeyal**  
> Pairing Kod ilə giriş (QR yox) — VPS üçün ideal

---

## ✨ Özəlliklər

| Özəllik | İzah |
|---|---|
| 🔑 Pairing Kod | QR yox, kodla giriş — VPS üçün ideal |
| 🤖 GPT-4o AI | OpenAI inteqrasiyası |
| 😴 AFK Sistemi | Avtomatik bildiriş |
| 🖼️ Stiker | Şəkildən stiker yaratma |
| 🌤️ Hava | İstənilən şəhər üçün |
| 👥 Qrup İdarə | Admin funksiyaları |
| 🛡️ Anti-Delete | Silinən mesajları gör |
| 🎉 Welcome/Goodbye | Qrup qarşılama |
| 📥 TikTok | Video yükləmə |
| 💰 Kripto | CoinGecko API |
| 🌐 Tərcümə | MyMemory API |
| 📱 QR Kod | Yaratma |
| 🔢 Hesablama | Math.js ilə |
| 📖 Urban Dict | İngilis sözlər |
| 💱 Valyuta | Məzənnə çevirici |
| 🔐 Şifrə | Güclü şifrə generator |
| 🎮 Əyləncə | Zarafat, atalar sözü, sitat |
| ⚙️ PM Permit | Şəxsi mesaj idarəsi |

---

## 🚀 VPS Qurulumu (Ubuntu/Debian)

### 1. Sistem Yeniləyin

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget ffmpeg
```

### 2. Node.js 20 Qurun

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # v20.x.x olmalıdır
```

### 3. Botu GitHub-dan çəkin (və ya ZIP yüklə)

```bash
# ZIP varsa:
unzip xeyal-userbot.zip -d xeyal-bot
cd xeyal-bot

# Git varsa:
git clone https://github.com/sizin-repo/xeyal-bot.git
cd xeyal-bot
```

### 4. Paketləri Qurun

```bash
npm install
```

> ⚠️ Canvas paketi üçün ek kitabxanalar lazım ola bilər:
```bash
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### 5. Konfiqurasiya

```bash
cp .env.example .env
nano .env
```

`.env` faylında doldurun:
```
PHONE_NUMBER=994501234567        # öz nömrəniz
OPENAI_API_KEY=sk-xxxxx          # OpenAI açarı
WEATHER_API_KEY=xxxxx            # OpenWeather açarı
OWNER_NAME=Xeyal
BOT_NAME=Xeyal Userbot
PREFIX=.
PM_PERMIT=false
ANTI_DELETE=true
AUTO_READ=false
```

### 6. Botu Başladın

```bash
node src/index.js
```

### 7. Pairing Kod ilə Giriş

Terminal çıxışı:
```
📱 WhatsApp nömrənizi daxil edin: 994501234567

╔════════════════════════════════╗
║   XEYAL USERBOT - Pairing Kod  ║
╠════════════════════════════════╣
║   Kodunuz:  ABCD-WXYZ          ║
╠════════════════════════════════╣
║  WhatsApp > Bağlı cihazlar >   ║
║  Cihaz əlavə et > Telefon nöm. ║
╚════════════════════════════════╝
```

**WhatsApp-da:**  
`⋮ (3 nöqtə)` → `Bağlı cihazlar` → `Cihaz əlavə et` → `Telefon nömrəsi ilə` → Kodu daxil edin

---

## 🔄 PM2 ilə Daimi İşlətmə (Tövsiyə edilir)

```bash
# PM2 qurun
npm install -g pm2

# Botu başladın
pm2 start src/index.js --name "xeyal-bot"

# Avtomatik başlama
pm2 startup
pm2 save

# Logları izləyin
pm2 logs xeyal-bot

# Yenidən başladın
pm2 restart xeyal-bot

# Dayandırın
pm2 stop xeyal-bot
```

---

## 📋 Komutlar

```
.komek          — Bütün komutlar menyusu
.ai [sual]      — GPT-4o AI
.analiz [mövzu] — Dərin analiz
.kod [sual]     — AI kod yaz
.afk [səbəb]    — AFK rejiminə keç
.geri           — AFK-dan çıx
.stiker         — Şəkildən stiker
.stikertoimg    — Stikeri şəkilə çevir
.hava [şəhər]   — Hava məlumatı
.cevir [dil]    — Mətn tərcüməsi
.qr [mətn]      — QR kod
.hesabla [ifadə]— Hesablama
.şifrə [uzunluq]— Şifrə yarat
.coinçevir      — Kripto qiymət
.valyuta        — Valyuta kursu
.ip [ünvan]     — IP məlumatı
.kısalt [link]  — Link qısal
.ocr            — Şəkildən mətn
.ud [söz]       — Urban Dictionary
.tiktok [link]  — TikTok yüklə
.zarafat        — Zarafat
.atalar         — Atalar sözü
.sitatlar       — Sitat
.zər            — Zər at
.seç [a|b|c]    — Seçim et
.ping           — Bot gecikməsi
.vaxt           — Cari vaxt
.info           — Bot haqqında
.id             — Chat/User ID
.qrupinfo       — Qrup məlumatı
.qruplink       — Dəvət linki
.qrupad [nöm]   — Üzv əlavə et
.qrupçıxar      — Üzv çıxar
.mute           — Qrubu sustur
.unmute         — Qrubu açıq et
.alqrup         — Üzv siyahısı
.broadcast      — Hamıya yayım
.restart        — Botu yenidən başlat
.sistem         — Server məlumatı
.antidelete     — Anti-delete aç/bağla
.pmpermit       — PM icazəsi aç/bağla
.autookuma      — Avtomatik oxuma
.tertibatci     — Developer məlumatı
```

---

## 🔑 API Açarları

| API | Link | Qiymət |
|---|---|---|
| OpenAI | https://platform.openai.com | Ödənişli |
| OpenWeather | https://openweathermap.org/api | Pulsuz plan var |

---

## ⚠️ Qeyd

Bu bot WhatsApp-ın şərtlərini poza bilər. İstifadə öz məsuliyyətinizdədir.

---

**Developer: Xeyal | Xeyal Userbot v2.0 © 2024**
