# İLERLEME

> Bu dosya projenin `sudoku-spec.md` içindeki **Geliştirme Aşamaları**na göre
> nerede olduğumuzu takip eder. Her önemli değişiklikte güncellenir.

**Son güncelleme:** 2026-07-18

---

## Durum Özeti

Aşamalar 1–8 tamamlandı; sırada **Aşama 9 (Yayın hazırlığı)** var —
yapılandırma hazır, ilk EAS derlemesi henüz alınmadı.

| # | Aşama | Durum |
|---|-------|-------|
| 1 | Kurulum (Expo + TS + expo-router) | ✅ Bitti |
| 2 | Oyun motoru (generator + solver + doğrulama) | ✅ Bitti |
| 3 | Tahta UI (çizim, hücre seçimi, rakam girişi) | ✅ Bitti |
| 4 | Yardımcı özellikler (not, undo/redo, silme, ipucu, hata) | ✅ Bitti |
| 5 | Oyun akışı (zamanlayıcı, hata sayacı, kazanma/kaybetme) | ✅ Bitti |
| 6 | Kalıcılık (otomatik kayıt, istatistik, ayarlar) | ✅ Bitti |
| 7 | Bulmaca paylaşımı (link kodlama + deep link) | ✅ Bitti |
| 8 | Tema ve cila (açık/koyu, görsel düzeltmeler, animasyon) | ✅ Bitti |
| 9 | Yayın hazırlığı (ikon, splash, ad, EAS build) | ⏳ Yapılandırma hazır, derleme alınmadı |

---

## Aşama Detayları

### ✅ 1. Kurulum
- expo-router yapısı: `app/` (index, game, play, settings, stats, _layout).
- TypeScript, `app.json`'da `scheme: "sudoku"` (deep link için).

### ✅ 2. Oyun motoru
- `src/engine/`: `generator.ts`, `solver.ts` (bitmask + MRV), `types.ts`.
- **Doğrulandı:** 4 zorlukta 40 bulmaca üretildi — hepsi geçerli, tek çözümlü, <30ms.
- Testler: `engine.test.ts` (jest), `quicktest.mjs` (standalone).
- ⚠️ Not: `npm test` (jest) makinede ts-jest soğuk başlangıcı yüzünden çok yavaş;
  motor mantığı doğru (standalone testte anında geçiyor). Jest kurulumu ayrıca elden geçirilebilir.

### ✅ 3. Tahta UI
- `SudokuBoard`, `NumberPad`, `ControlBar`, `DifficultySheet`.
- State: `useGameContext` + `gameStore` (reducer), hücre seçimi/vurgulama.

### ✅ 4. Yardımcı özellikler
- Not modu, silme, ipucu, hata kontrolü, undo — hepsi çalışıyor.
- **redo** butonu ("Yinele") `ControlBar`'a eklendi ve `game.tsx`'te bağlandı (2026-07-18).

### ✅ 5. Oyun akışı
- Zamanlayıcı (duraklatınca tahta gizlenir), hata sayacı (3'te kayıp), kazanma/kaybetme overlay.
- Kaybetmede **"Tekrar Dene"** (aynı bulmaca sıfırlanır), kazanmada **"Yeni Oyun"**
  (aynı zorlukta yeni bulmaca) butonları eklendi + "Ana Ekrana Dön" (2026-07-18).

### ✅ 6. Kalıcılık
- AsyncStorage: aktif oyun otomatik kayıt/devam, zorluk başına istatistik, ayarlar.

### ✅ 7. Bulmaca paylaşımı
- `handleShare`: 81 haneli given → `sudoku://play?p=...&d=...` linki. Panoya kopyalanır
  **ve** sistem paylaş menüsü (`react-native` `Share`) açılır; menü yoksa (web) pano yedek.
- `play.tsx`: linki çözer, doğrular (geçersizse ana ekrana döner), bulmacayı baştan başlatır.

### ✅ 8. Tema ve cila
- Açık/koyu/sistem tema (`useSettings` + `src/theme`).
- **2026-07-18:** Tahta render hatası düzeltildi + görsel doğrulandı; kalan UX
  eksikleri kapatıldı (redo butonu, "Tekrar Dene"/"Yeni Oyun", sistem paylaş menüsü).

### ⏳ 9. Yayın hazırlığı
- `app.json`: ad "Sudoku", `scheme: sudoku`, ikon (`icon.png`), bundle/package `com.sudoku.app`.
- **2026-07-18 düzeltildi:** Android adaptive icon kırık referanstaydı
  (`./assets/adaptive-icon.png` yoktu). Artık mevcut dosyalara bağlı:
  `android-icon-foreground/background/monochrome.png` (SDK 56 şeması, dokümanla doğrulandı).
- `eas.json`: development / preview / production build profilleri hazır.

**Kalan işler (ağ + Expo hesabı gerektirir — kullanıcı tarafında):**
1. **Splash migration (önerilen):** SDK 56'da top-level `splash` anahtarı şemada yok;
   `expo-splash-screen` plugin'ine taşınmalı. Expo Go'da mevcut hâliyle çalışıyor ama
   standalone derlemede plugin gerekir. Adım: `npx expo install expo-splash-screen`,
   sonra `app.json` `plugins`'e `["expo-splash-screen", { image, resizeMode, backgroundColor }]`
   ekle ve top-level `splash`'i kaldır. (Ağ olmadığı için şu an kurulamadı.)
2. `npx expo-doctor` ile son kontrol (ağ gerekir).
3. EAS: `eas login` → `eas build -p android --profile preview` (APK) / `-p ios`.
4. Mağaza gönderimi: `eas.json` → `submit.production` alanlarını doldur
   (Apple ID, ASC app ID, Apple Team ID / Android service account) — kullanıcıya özel sırlar.

---

## Sıradaki Adım

**Aşama 9 (Yayın hazırlığı):** İlk EAS derlemesini al (`eas build`), ikon/splash/ad
son kontrol, mağaza gönderim bilgilerini (`eas.json` → `submit`) doldur.

---

## Değişiklik Günlüğü

### 2026-07-18
- **Tahta render hatası düzeltildi** (`SudokuBoard.tsx`). Belirti: silik/düzensiz
  ızgara çizgileri ve sayıların yanlış sütunda görünmesi ("aynı sütunda iki 4").
  Kök neden: dış çerçeve `borderWidth` + `flexWrap` yüzünden hücrelerin taşıp
  yanlış sarması (motor değil, çizim hatası). Çözüm: `flexWrap` yerine 9 satır
  açıkça çiziliyor, dış kap içeriğe göre boyutlanıyor, hücre boyutu tam sayıya
  yuvarlanıyor. Motorun doğru çalıştığı bağımsız testle doğrulandı.
- **Görsel doğrulama** yapıldı: expo web + Playwright ile açık ve koyu temada
  Uzman oyunu ekran görüntüsü alındı — ızgara düzgün hizalı 9×9, kutu sınırları
  tutarlı, satır/sütun/kutuda tekrar yok.
- **Aşama 8 UX eksikleri kapatıldı:**
  - `ControlBar`'a **"Yinele" (redo)** butonu eklendi; `game.tsx`'te `redo` +
    `canRedo` bağlandı. Sonuç overlay'inde çift kayıt olmasın diye `recordedRef`
    yeni oyun başlayınca (`status === 'playing'`) sıfırlanıyor.
  - Sonuç ekranı: kaybetmede **"Tekrar Dene"** (aynı bulmaca `startSharedGame` ile
    sıfırdan), kazanmada **"Yeni Oyun"** (aynı zorlukta `startGame`) + "Ana Ekrana Dön".
  - Paylaşım artık panoya kopyalamanın yanında **sistem paylaş menüsünü** açıyor
    (`react-native` `Share.share`); menü yoksa (web) pano + Alert yedeği.
  - Playwright ile doğrulandı: 6 butonlu kontrol çubuğu düzgün diziliyor; 3 hata
    yaptırılarak kaybetme ekranı ve "Tekrar Dene" butonu görsel onaylandı.
- **Aşama 9 başladı — Android adaptive icon düzeltildi** (`app.json`). Kırık referans
  `./assets/adaptive-icon.png` (dosya yok) → mevcut `android-icon-{foreground,background,
  monochrome}.png` dosyalarına bağlandı. `npx expo config` ile çözümlendiği doğrulandı.
  Kalan EAS/splash adımları ağ + Expo hesabı gerektiriyor (bkz. Aşama 9 detayı).
