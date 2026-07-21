# İLERLEME

> Bu dosya projenin `sudoku-spec.md` içindeki **Geliştirme Aşamaları**na göre
> nerede olduğumuzu takip eder. Her önemli değişiklikte güncellenir.

**Son güncelleme:** 2026-07-20

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
