# İLERLEME

> Bu dosya projenin `sudoku-spec.md` içindeki **Geliştirme Aşamaları**na göre
> nerede olduğumuzu takip eder. Her önemli değişiklikte güncellenir.

**Son güncelleme:** 2026-07-25

> Kontrol çubuğu düğme sırası soldan sağa: Geri Al · Yinele · Sil · Not · İpucu.
> Kontrol çubuğu + rakam tuşları, tahtanın altındaki boşluğun yarısı kadar yukarı
> çekildi (`game.tsx`, onLayout ölçümü + `translateY`).
> Duraklatma ekranı düzeltildi: eski `opacity: 0.05` bug'ı (ekran görünmezdi)
> giderildi; artık tam ekran opak katman — ⏸️ + "Oyun Duraklatıldı" + mod·süre +
> Devam Et butonu.
> Performans/akıcılık: (1) auto-save 600ms debounce (her dokunuş/tick'te diske
> yazma kaldırıldı), (2) context callback'leri useCallback ile sabitlendi,
> (3) `applyDigit` değişmeyen hücrelerin referansını koruyor, (4) hücreler ve
> tahta/NumberPad `React.memo` — artık seçim/giriş sadece değişen hücreyi çiziyor.
> Kırmızı (yanlış) sayı dururken aynı sayı tekrar girilince hücre boşalıyor ve
> hata sayısı ARTMIYOR (`gameStore.applyDigit`).
> Ayarlar ekranı yeniden tasarlandı: gruplu kartlar + ikon + açıklama + toggle/nav
> satırları. 18 ayar `useSettings`'e eklendi. CANLI olanlar: Saat, Bölge Vurgusu,
> Aynı Sayıları Vurgula, Otomatik Temizle, Kalan numara, Aydınlık modu(→tema).
> PLACEHOLDER (kayıtlı ama etkisiz, sonra bağlanacak): Ses Efekti, Titreşim,
> Bildirim, Hata limiti, Önce Sayı, Otomatik Tamamlama, Bulmaca Bilgileri,
> Puanı Göster. Nav: İstatistikler(→/stats), Nasıl Oynanır/Geri Bildirim/Hakkında
> (Alert), Çık(→ana ekran).
> 2. tur: Puanı Göster / Aydınlık modu / Önce Sayı satırları kaldırıldı. Tema
> artık Ses Efekti kartındaki "Tema" satırı (dokun → aydınlık/karanlık). GERÇEK
> yapıldı: Hata limiti (kapalıyken 3 hatada kaybetme yok — `applyDigit`'e
> mistakeLimit param), Titreşim (RN `Vibration`, yanlış girişte), Ses Efekti
> (expo-audio + `assets/sounds/pop.wav`, her hamlede), Bildirim (expo-notifications,
> günlük 20:00 hatırlatma; izin reddedilirse toggle geri alınır). Yeni paketler:
> expo-audio ~56, expo-notifications ~56.
> ⚠️ expo-notifications Expo Go Android'de import anında ÇÖKÜYOR (SDK 53'te push
> kaldırıldı). Bu yüzden `useSettings`'te lazy `require` + try/catch ile yükleniyor
> (`getNotifications`/`notificationsSupported`). Expo Go'da toggle açılınca uyarı
> gösterilip geri kapanıyor; gerçek DEV BUILD'de çalışır. Ses/titreşim Expo Go'da OK.
> 4. tur (ana ekran & navigasyon): Zorluk sayfası (`DifficultySheet`) artık ALTTAN
> yukarı kayıyor + "17-22 ipucu" açıklamaları kaldırıldı. Ana ekran (`index.tsx`)
> yatay pager oldu: sayfa 1 Ana sayfa, sayfa 2 İstatistikler; sola/sağa kaydırma +
> altta yazısız 2 ikonlu sekme (⌂ ana sayfa, 👤 profil/istatistik), aktif olan
> accent renkte. "Devam Et" butonu Yeni ile aynı boyut/renk, üstünde zorluk·süre.
> İstatistik kartları `StatsView` bileşenine çıkarıldı (hem pager hem /stats route
> kullanıyor). Ayarlarda Tema artık 3 ikon (☀️ aydınlık / 🌙 karanlık / 📱 sistem)
> ile seçiliyor; seçili olan accent ile vurgulanıyor. Durum çubuğu (`_layout`)
> artık uygulama temasını izliyor (`ThemedStatusBar`, cihaz şeması değil).
> 5. tur: Alt sekmede aktif sayfa artık koyu bir "hap" (cardBackground + kenarlık,
> `tabPill`) ile de vurgulanıyor (renk + dikdörtgen). Timer bug'ı düzeltildi:
> TICK artık global değil, yalnızca oyun ekranı ODAKTAYKEN `useFocusEffect` ile
> işliyor (context'e `tick` eklendi). Böylece ana ekrandayken/Devam Et butonunda
> süre AKMIYOR; sadece oyun ekranında oynanırken ilerliyor.
> 6. tur: Sayı butonları (`NumberPad`) ekran genişliğine göre dinamik boyutlanıyor —
> kenardan SIDE=5, aralarında GAP=5 ile 9 buton neredeyse tam genişliğe yayılıyor
> (buttonW = (width-2*SIDE-8*GAP)/9, yükseklik ×1.5, font ×0.52). `controls`'un yatay
> padding'i kaldırılıp yalnızca ControlBar'a taşındı (`controlBarWrap`).
> 7. tur: Dokunma/seçim "pulse" animasyonu (kenar kalınlaşıp sönen accent halka).
> Sayı butonlarında hafif (`PadButton`, borderWidth 0→3, basınca), kutucuklarda
> daha belirgin (`Cell`, borderWidth 0→5, seçilince). Aynı-sayı vurgusu ayarı
> açıksa aynı rakamlı kutular da animasyona girer (isSameNum zaten ayarla gated,
> kapalıyken sadece seçilen kutu oynar). Animated borderWidth (JS driver).
> 8. tur: Kutu pulse rengi kalın çizgi rengi (`colors.thickLine`) oldu. Animasyon
> artık her basışta (tekrar basış dahil, istisnasız) çalışıyor: tetikleme kutu-içi
> `isSameNum` efektinden çıkarılıp board seviyesine taşındı — `handleSelect` her
> basışta ilgili kutulara imperatif `pulse()` gönderiyor (Cell `forwardRef` +
> `useImperativeHandle`; stable ref setter'lar + ref'lerden okuyan sabit handler,
> memoization korunuyor). Aynı-sayı vurgusu açıksa aynı rakamlı kutular da her
> basışta pulse'a girer. Kutuda rakam varsa rakam da pulse'la eşzamanlı büyüyüp
> küçülüyor (digitScale 1→1.28→1, Animated.Text).
> 9. tur: Animasyonlar NATIVE driver'a taşındı (giriş hızlandırıldı + ilk/ikinci
> basış tutarlılığı). Sayı butonu: onPress önce çağrılıp pulse UI thread'de (240ms).
> Kutu pulse: eskiden JS-driven animated borderWidth ilk basışta seçim render'ıyla
> yarışıp kareleri düşürdüğü için hafif görünüyordu; artık SABİT kalın kenar (5px,
> `cellPulse`) + opacity fade, native driver (420ms), idle=1 (görünmez). Böylece
> ilk basış da ikincisi kadar kalın. Rakam ölçeği de native (transform).
> 10. tur: İlk basıştaki "drop"/sıçrama giderildi. Sebep: her render'da
> `anim.interpolate(...)` yeni düğüm yaratıyordu; ilk basışta seçim re-render'ı bu
> düğümü değiştirince native animasyon kopup sıçrıyordu. interpolation düğümleri
> artık `useMemo([anim])` ile bir kez oluşturuluyor (Cell + PadButton) → ilk ve
> ikinci basış tıpatıp aynı, pürüzsüz.
> 11. tur: Kalan "drop" giderildi. Sebep sıra: pulse seçim dispatch'inden ÖNCE
> başlıyordu → ilk basışta "önce pulse, sonra vurgu oturur" iki aşamalı görünüyordu.
> Artık `handleSelect` önce seçimi uyguluyor, `requestAnimationFrame` ile bir kare
> sonra (vurgu commit olduktan sonra) pulse'ı çalıştırıyor → her basış lit kutuya
> tekrar basış gibi, tıpatıp aynı.
> 12. tur (eksikleri tamamlama): Geri Bildirim artık `mailto:` ile e-posta açıyor
> (settings.tsx, FEEDBACK_EMAIL); mail uygulaması yoksa adresi Alert'te gösteriyor.
> Nasıl Oynanır ayrı ekran (`app/how-to.tsx`, kurallar kartları), Hakkında ayrı
> ekran (`app/about.tsx`, sürüm expo-constants'tan). Her ikisi Stack'e eklendi;
> settings nav router.push ile bağlandı. NOT: Bildirim Android kanalı düzenlemesi
> kullanıcı tarafından geri alındı, dokunulmadı. Paylaşım linki tıklanabilirliği
> kullanıcı isteğiyle şimdilik atlandı. Build (Play Store/Android) sonraya bırakıldı.
> 13. tur: Bildirim TAMAM (app.json plugin + Android `reminders` kanalı + channelId,
> günlük 20:00). Paylaşım linki: `docs/index.html` yönlendirme sayfası (p&d okur,
> sudoku:// deep link'e yönlendirir + "Oyunu Aç" butonu). `src/config.ts` →
> `SHARE_BASE_URL` (boşken sudoku://, doluyken https link paylaşılır). game.tsx
> handleShare koşullu. KALAN: kullanıcının docs/'u GitHub Pages'te barındırıp
> SHARE_BASE_URL'yi ayarlaması (repo/remote henüz yok).
> 3. tur: Otomatik Tamamlama GERÇEK — aktifken ve ≤5 boş kutu kaldığında sağ altta
> onay pop-up'ı çıkar ("Son N kutu kaldı. Otomatik tamamlansın mı? Evet/Hayır").
> Evet → tahta çözümden tamamlanıp oyun kazanılır (`gameStore.completeBoardState`,
> tek history girişi → undo geri alır). Hayır → o oyun boyunca bir daha sorulmaz
> (yeni oyunda sıfırlanır). Bulmaca Bilgileri GERÇEK — açıkken
> info satırında zorluk yanında canlı "%doluluk" gösterilir; Hata limiti kapalıysa
> "Hata: N" (/3 gizli). "Muhteşem Oyun": hatasız (errorCount 0) kazanılan oyun.
> useStats'a diff başına `perfect` sayacı eklendi (eski kayıtlar EMPTY_DIFF ile
> merge edilir), istatistik kartında "✨ Muhteşem Oyun" satırı, bitiş ekranında
> hatasız kazanınca "Muhteşem Oyun! / Hatasız çözdün 🏆".

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
- Testler: `engine.test.ts` (jest), `quicktest.mjs` (standalone) — ikisi de
  `src/engine/__tests__/` altında, ikisi de 6/6 geçiyor.
- **2026-07-25:** `npm test`'in asılı kalması ts-jest yavaşlığı değil, solver'da
  çelişkili tahtaların reddedilmemesi hatasıymış — düzeltildi, süre 0.4 sn
  (bkz. değişiklik günlüğü, 3. tur).

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
- **2026-07-25:** Yeni görseller (`icon.png`, `adaptive-icon.png`, `splash-icon.png`)
  bağlandı; splash `expo-splash-screen` plugin'ine taşındı (bkz. günlük).
- `eas.json`: development / preview / production build profilleri hazır.

**Kalan işler (ağ + Expo hesabı gerektirir — kullanıcı tarafında):**
1. `npx expo-doctor` ile son kontrol (ağ gerekir).
2. EAS: `eas login` → `eas build -p android --profile preview` (APK) / `-p ios`.
3. Mağaza gönderimi: `eas.json` → `submit.production` alanlarını doldur
   (Apple ID, ASC app ID, Apple Team ID / Android service account) — kullanıcıya özel sırlar.

---

## Sıradaki Adım

**Aşama 9 (Yayın hazırlığı):** İlk EAS derlemesini al (`eas build`), ikon/splash/ad
son kontrol, mağaza gönderim bilgilerini (`eas.json` → `submit`) doldur.

---

## Değişiklik Günlüğü

### 2026-07-26 (ses efekti)
- **`assets/sounds/pop.wav` → `assets/sounds/tap.wav`** (kullanıcının seçtiği yeni ses).
  `game.tsx`'teki `require` güncellendi.
- **Ses optimize edildi** (tını değiştirilmeden, yalnızca kesim/sönüm/seviye):
  1032ms → **130ms**, tepe 1.000 → **0.35**, 194KB → **24KB**. dB zarfı ölçüldü:
  tepe 20ms'de, -40dB 95ms'de, -60dB 115ms'de; yani 130ms'den sonrası duyulamayan
  gürültü tabanıydı, duyulabilir hiçbir şey kırpılmadı. Son 15ms'ye yükselen
  kosinüs sönüm eklendi (dosya tam sıfırda bitiyor, kesim çıtırtısı yok).
  Stereo 48kHz korundu — L/R korelasyonu -0.10, yani gerçek stereo; mono'ya
  indirmek karakteri bozardı.
- **Süre neden önemliydi:** ses her hamlede `seekTo(0); play()` ile baştan
  başlatılıyor ve 70ms throttle var; 1 saniyelik hâli normal oyunda hiç tam
  duyulamıyordu.
- Optimizasyon script'i tek seferlik değil, parametreli:
  `node optimise-wav.mjs <in> <out> <ms> <tepe>` (scratchpad'de).
- ⚠️ **Ses SADECE doğru girişte değil, HER hamlede çalıyor** — yanlış girişte,
  not eklemede, silmede de. Koşul `history.length` artışı (`game.tsx`), doğruluk
  kontrolü yok. Kullanıcı bunu doğru girişe özel sanıyordu; şimdilik davranış
  bilinçli olarak değiştirilmedi.

### 2026-07-25 (4. tur — titreşim düzeltmesi)
- **Hata sayacındaki 3 sınırı kaldırıldı** (`gameStore.ts`). `Math.min(errorCount+1, 3)`
  yüzünden "Hata limiti" ayarı KAPALIYKEN sayaç 3'te donuyordu; buna bağlı iki yan
  etki vardı: (1) `game.tsx`'teki titreşim efekti `errorCount > prevErrorCount`
  koşuluna baktığı için 4. ve sonraki hatalarda TİTREŞİM GELMİYORDU, (2) ekrandaki
  "Hata: N" yazısı gerçek sayıyı göstermiyordu. Limit AÇIKKEN oyun zaten 3'te
  bittiği için `/3` gösterimi etkilenmiyor.
- **Titreşim uçtan uca doğrulandı** (Playwright + `navigator.vibrate` sarmalayıcı;
  react-native-web `Vibration`'ı buna bağlıyor). Boş bir hücreye 1–9 arası tüm
  rakamlar girildi: 8 hata → 8 titreşim (hepsi 200ms), doğru rakamda titreşim yok.
  Sayaç "Hata: 8"e ulaştı (düzeltme öncesi 3'te donardı). Negatif kontrol: ayar
  kapalıyken hatalar kaydedildi ama sıfır titreşim.
- Titreşimin tetiklendiği TEK durum: not modu kapalıyken bir hücreye çözümdekinden
  farklı rakam yazmak. Not modunda, aynı yanlış rakamı tekrar girince (hücreyi
  temizler) ve diğer hiçbir etkileşimde titreşim yok.

### 2026-07-25 (2. tur — yayın öncesi denetim, KIRMIZI maddeler)
Play Store öncesi tam denetim yapıldı. Bloke eden 5 madde düzeltildi:
1. **`expo-asset` eksik peer + SDK çakışması (çökme riski).** `expo-audio`'nun peer'ı
   `expo-asset: "*"` olduğu için npm SDK 57'yi (57.0.6) çekip hoist etmişti; `expo`
   ise 56.0.17 istiyordu. expo-doctor: "app may crash outside of Expo Go". Expo Go'da
   görünmeyen, sadece gerçek build'de patlayan bir hataydı. `npx expo install expo-asset`
   ile hepsi 56.0.21'e dedupe edildi.
2. **Hassas Android izinleri temizlendi.** Tek bir `pop.wav` için manifest'te
   `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE(_MEDIA_PLAYBACK)`,
   `READ/WRITE_EXTERNAL_STORAGE` vardı — Play'de mikrofon izni hassas izin beyanı
   gerektirir ve bir Sudoku oyununda ret sebebidir. Çözüm: `expo-audio` plugin'i
   `{ recordAudioAndroid: false, microphonePermission: false, enableBackgroundPlayback: false }`
   + `android.blockedPermissions` ile şablondan gelen 3 izin (`SYSTEM_ALERT_WINDOW`,
   `READ/WRITE_EXTERNAL_STORAGE`) `tools:node="remove"` ile silindi.
   **Kalan efektif izinler: INTERNET, VIBRATE, MODIFY_AUDIO_SETTINGS (+POST_NOTIFICATIONS).**
3. **Paket adı `com.sudoku.app` → `com.saliherenparca.sudoku`** (android.package +
   ios.bundleIdentifier). Eski ad çok jenerikti, Play'de alınmış olma ihtimali
   yüksekti ve yayınlandıktan sonra ASLA değiştirilemez. Kullanıcı onayıyla yapıldı.
4. **Gizlilik politikası eklendi:** `docs/privacy.html` (GitHub Pages'te
   `https://saliherenp.github.io/sudoku/privacy.html`). İçerik kodla doğrulandı:
   sıfır ağ çağrısı, sıfır analitik, sadece 3 yerel AsyncStorage anahtarı.
   Play Console'a bu URL girilecek.
5. **10 paket SDK 56 ile hizalandı** (`npx expo install --fix`): expo 56.0.12→56.0.17,
   expo-router 56.2.11→56.2.16, react-native-screens 4.25.2→4.26.0, jest 30→29.7 vb.

**expo-doctor artık 20/21 geçiyor** (kalan tek hata yerel CocoaPods kurulu olmaması —
EAS bulut derlemesini etkilemez). `tsc --noEmit` temiz. Expo web + Playwright ile
duman testi: ana ekran → zorluk sayfası → üretilmiş tahta akışı çalışıyor, konsol
hatası yok (yani sürüm yükseltmeleri ve paket adı değişikliği bir şey bozmadı).

### 2026-07-25 (3. tur — SARI maddeler)

- **🐛 SOLVER HATASI BULUNDU VE DÜZELTİLDİ (`src/engine/solver.ts`).** `npm test`'in
  "bu makinede ts-jest yavaş" sanılan takılması aslında gerçek bir motor hatasıymış.
  `solve()` ve `countSolutions()` aday bit maskelerini yalnızca BOŞ hücreler için
  kuruyor, dolu hücrelerin birbiriyle çelişip çelişmediğini hiç kontrol etmiyordu.
  Çelişkili bir tahta verildiğinde (test: aynı satırda iki 1) solver bunları sabit
  kabul edip kalan 79 hücre için var olmayan bir çözüm arıyor → arama uzayı
  astronomik → pratikte sonsuz döngü. Düzeltme: her iki fonksiyonun başına
  `if (!isValid(grid)) return null / 0`. Test süresi **sonsuz → 0.4 saniye**.
  Teşhis: aynı jest yapılandırmasıyla basit bir test 0.35 sn'de geçti, yani
  altyapı sağlamdı; sorun test dosyasının kendisindeydi.
- **`npm test` artık ÇALIŞIYOR: 6/6 geçiyor, 0.4 sn.** ("jest çok yavaş" notu
  bu yüzden yukarıdaki Aşama 2 açıklamasından kaldırıldı — sebep buydu.)
  `quicktest.mjs` silinmemiş, `src/engine/__tests__/` içinde; o da 6/6 geçiyor.
- **Bildirim ikonu eklendi:** `assets/notification-icon.png` — 96×96 beyaz-şeffaf
  sudoku ızgarası silüeti (bağımlılıksız üretildi; Android ikonu alfa maskesi
  olarak kullandığı için renkli app ikonu beyaz kareye dönüşüyordu). `app.json`
  `expo-notifications` plugin'ine `icon` + `color: #4F66E8` verildi. Doğrulandı:
  5 yoğunlukta `drawable-*/notification_icon.png` üretildi, manifest meta-data
  ve `notification_icon_color` bağlandı.
- **`ErrorBoundary` üretim modu ayrıldı** (`app/_layout.tsx`): `__DEV__` değilken
  ham JS stack yerine splash zeminiyle uyumlu sade bir özür ekranı gösteriliyor.
  Geliştirmede stack trace aynen duruyor.
- **`playwright` + `@expo/ngrok` `devDependencies`'e taşındı.**
- `useSettings.ts`'teki yanlış `(placeholder)` yorumları düzeltildi (hepsi canlı).

**Son durum:** `tsc --noEmit` temiz · `npm test` 6/6 · `expo-doctor` 20/21 (kalan
tek hata yerel CocoaPods, EAS'i etkilemez) · efektif Android izinleri yalnızca
INTERNET, VIBRATE, MODIFY_AUDIO_SETTINGS.

**HÂLÂ AÇIK:**
- OTA güncelleme kapalı (`expo-updates` yok) → hotfix için yeni build + inceleme.
  Bilinçli tercih; istenirse `npx expo install expo-updates` ile açılabilir.
- **Uygulama hiç gerçek cihazda çalıştırılmadı.** Tüm doğrulama expo web üzerinden;
  ses, titreşim, bildirim, deep link ve splash'in native davranışı test edilmedi.
  Play'e yüklemeden önce `eas build -p android --profile preview` ile APK alınıp
  telefonda bir tur oynanmalı.
- `docs/privacy.html` ve tüm bu değişiklikler henüz commit/push edilmedi.

### 2026-07-25
- **İkon/splash varlıkları yenilendi** (`app.json`): `assets/` artık sadece
  `icon.png`, `adaptive-icon.png`, `splash-icon.png` içeriyor. Android adaptive icon
  eski `android-icon-{foreground,background,monochrome}.png` referanslarından
  (dosyalar silinmişti) `foregroundImage: ./assets/adaptive-icon.png` +
  `backgroundColor: #1c2139` şemasına geçti. `web.favicon` da var olmayan
  `favicon.png` yerine `icon.png`'ye bağlandı.
- **Splash migration TAMAM:** `expo-splash-screen` (~56.0.14) kuruldu, top-level
  `splash` anahtarı kaldırılıp plugin eklendi (`image: splash-icon.png`,
  `imageWidth: 220`, `resizeMode: contain`, `backgroundColor: #1c2139`).
  `npx expo config --type prebuild` ile çözümlendiği doğrulandı.
- **Markalı açılış ekranı** (`src/components/SplashScreen.tsx`, yeni): dikey
  gradyan (#292f51 → #1c2139 → #161a2d, `expo-linear-gradient`), 180×180 logo,
  "Sudoku" (40px bold) + "Zihnini çalıştır" (#8fa4ea). 1.8 sn sonra `onFinish`.
  Girişte kısa fade+yukarı kayma (native driver, projedeki animasyon deseniyle aynı).
- **`_layout.tsx` bağlandı:** kullanıcının örnek kodu `App.js` varsayıyordu, bizde
  expo-router olduğu için mantık root layout'a taşındı. Splash, `Stack`'in ÜSTÜNDE
  `absoluteFill` katman olarak duruyor — navigator mount kalıyor, böylece splash
  ekrandayken deep link (`sudoku://play?...`) çözülmeye devam ediyor. Native splash
  `preventAutoHideAsync()` ile tutulup layout mount olunca `hideAsync()` ile
  bırakılıyor (arada beyaz flaş yok). Splash görünürken durum çubuğu `light`.
- **Doğrulama:** `npx tsc --noEmit` temiz; expo web + Playwright ile splash ekranı
  ve 1.8 sn sonra ana ekrana geçiş görsel olarak onaylandı, konsol hatası yok.
- **`npx expo prebuild --clean` çalıştırıldı** (native doğrulama). Üretilen dosyalar
  kontrol edildi: `values/colors.xml` → `splashscreen_background`/`iconBackground`
  `#1c2139`, tüm yoğunluklarda `splashscreen_logo.png`, `mipmap-anydpi-v26/ic_launcher.xml`
  adaptive icon doğru. `android/`+`ios/` zaten `.gitignore`'da (satır 40-41) —
  EAS Build bulutta kendi prebuild'ini yapıyor, bu klasörler tek kullanımlık.
- **`expo-system-ui` (~56.0.5) eklendi:** prebuild `userInterfaceStyle: automatic`
  için bu paketi istiyordu (Android'de tema otomatiği onsuz çalışmıyor). Uyarı gitti.
- NOT: prebuild yerel iOS için CocoaPods kurmayı önerir; EAS kullanıldığı için
  gerek yok, `--no-install` ile atlanabilir.
- **Splash animasyonu Reanimated'a geçti:** `react-native-reanimated` 4.3.1 +
  `react-native-worklets` 0.8.3 kuruldu. `SplashScreen.tsx` artık RN `Animated`
  yerine `Animated.Image entering={FadeIn.duration(700)}`, başlık
  `FadeInDown.delay(400).duration(600)`, slogan `FadeInDown.delay(650).duration(600)`
  kullanıyor (kademeli giriş). Gradyan ve 1.8 sn `onFinish` aynı.
  ⚠️ `babel.config.js` YOK ve gerekmiyor — SDK 56'da Reanimated babel plugin'i
  `babel-preset-expo` tarafından paket kurulunca otomatik ekleniyor. Elle
  `react-native-reanimated/plugin` yazmak Reanimated 4'te hatalı (artık
  `react-native-worklets/plugin`) ve çift-plugin hatası verir.
  Doğrulama: `tsc --noEmit` temiz; expo web + Playwright ile kademeli giriş kare
  kare onaylandı (logo tek başına → başlık alttan → slogan), konsol hatası yok.
  Reanimated native bağımlılık olduğu için `prebuild --clean --no-install`
  tekrar çalıştırıldı.

### 2026-07-20
- **Oyun ekranı üst düzeni marketteki uygulamalara yaklaştırıldı** (`app/game.tsx`):
  - Üst çubukta sadece geri oku (`←`) kaldı; "Ana Ekran" yazısı silindi.
  - Zorluk / süre / `Hata: 0/3` bilgisi ayrı bir satıra alınıp **tahtanın hemen
    üstüne** yerleştirildi (satır genişliği `SudokuBoard` ile aynı formülle hizalı).
  - Sağ üst köşeye **duraklat (❚❚)** ve **ayarlar (⚙)** ikon butonları eklendi
    (yazısız). Duraklat mevcut duraklatma katmanını, ayarlar `/settings` ekranını açar.
  - Alt kontroller **rakamların üstüne** taşındı (market düzeni): Not/Sil/Geri Al/
    Yinele/İpucu/Paylaş üstte, 1-9 altta.
- **Koyu mod görünürlük hatası düzeltildi** (`ControlBar.tsx`): tek renkli glif
  ikonlarına (`⌫ ↩ ↪`) renk atanmamıştı, koyu zeminde siyaha yakın kalıp
  görünmüyordu. Artık `colors.primaryText` (aktifken beyaz) kullanılıyor.
- **Görsel doğrulama:** expo web + Playwright ile Uzman oyunu açık ve koyu temada
  ekran görüntüsüyle onaylandı.
- **İkinci tur düzeltmeler (aynı gün):**
  - Paylaş, kontrol çubuğundan alınıp üst çubuğa (duraklatın soluna) yazısız ikon
    olarak taşındı (`↗`). Üst çubuk ikonları tek renkli/uyumlu: ana ekran `⌂`,
    paylaş `↗`, duraklat (iki ince çubuk), ayarlar `⚙`.
  - Duraklat ikonu `❚❚` glifi yerine iki ince `View` çubuğuyla çizildi — çok geniş
    görünme sorunu çözüldü.
  - Kontrol çubuğu 5 butona indi (Not/Sil/Geri Al/Yinele/İpucu) ve butonlar
    büyütüldü (ikon 22→27, min 50→60) — paylaşın boşalttığı yeri dolduruyor.
  - **Not hatası düzeltildi** (`SudokuBoard.tsx` `PencilMarks`): eski `flexWrap`
    düzeni `markSize = cellSize/3` kullanıyordu ama hücre içi genişlik kenarlık
    kadar dardı; 3 işaret satıra sığmayıp taşıyor, notlar yanlış yere düşüyordu.
    Artık 3 esnek (`flex:1`) satır × 3 slot ile her rakam sabit yerde
    (1 sol üst … 9 sağ alt, telefon tuş takımı gibi).
  - **Not modunda tıkanma düzeltildi** (`NumberPad.tsx`): tahtaya 9 kez konmuş
    rakam butonu not modunda da pasifti; artık not modunda her rakam not olarak
    eklenebiliyor (`disabled = done && !noteMode`).
  - NumberPad'deki kalan-adet sayısının etrafındaki renkli dikdörtgen kaldırıldı;
    sadece sayı görünüyor.

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
