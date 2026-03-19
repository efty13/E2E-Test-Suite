# Test Dosyaları

Tüm test dosyaları `packages/e2e/tests/` altındadır.

## Çalıştırma Komutları

```bash
# Tüm testler
pnpm --filter e2e exec playwright test --project=chromium

# Tek dosya
pnpm --filter e2e exec playwright test <dosya-adı> --project=chromium

# Headed (tarayıcı görünür)
pnpm --filter e2e exec playwright test <dosya-adı> --project=chromium --headed

# Yavaş (görsel takip için)
pnpm --filter e2e exec playwright test <dosya-adı> --project=chromium --headed --slow-mo=800
```

---

## Spec Dosyaları

### `smoke.spec.ts`
**Senaryo:** Temel ayağa kalkma testi
**Kapsam:** `/` → `/users` redirect
```
✓ app loads
```

---

### `booking-crud.spec.ts`
**Senaryo:** Booking CRUD — happy path smoke
**Kapsam:** Yeni booking oluştur → listede doğrula → detay sayfası → geri dön

**Test verisi:**
```ts
{ model: 'Alice Martin', client: 'Vogue Paris', date: '2026-09-20', time: '11:30' }
// Türkçe tarih: '20 Eylül 2026'
```

```
✓ yeni booking oluşturulur ve listede görünür
✓ booking detayı doğru gösterilir ve geri dönünce liste korunur
```

---

### `booking-conflict.spec.ts`
**Senaryo:** Double booking prevention (çeşitli iş kuralı kombinasyonları)
**Kapsam:** Conflict engelleme, farklı saat izni, conflict sonrası hata temizleme

**Test verisi:**
```ts
// Tarih: 2026-11-05 → '5 Kasım 2026'
```

```
✓ ilk booking başarıyla oluşturulur
✓ aynı model + tarih + saat ile ikinci booking oluşturulamaz ve hata gösterilir
✓ conflict hatası alan değiştirilince temizlenir
✓ aynı model + aynı tarih ama farklı saat ile booking oluşturulabilir
```

---

### `double-booking-prevention.spec.ts`
**Senaryo:** Double booking prevention — negative test (izolasyon odaklı, net assertions)
**Kapsam:** Conflict engel → list count → yokluk doğrulaması + iş kuralı sınır testleri

**Test verisi:**
```ts
FIRST_BOOKING:    { model: 'Alice Martin', date: '2026-03-15', time: '10:00' }
DUPLICATE:        { model: 'Alice Martin', date: '2026-03-15', time: '10:00' }  // conflict
DIFFERENT_TIME:   { model: 'Alice Martin', date: '2026-03-15', time: '14:00' }  // izin
DIFFERENT_MODEL:  { model: 'Kenji Tanaka', date: '2026-03-15', time: '10:00' }  // izin
// Türkçe tarih: '15 Mart 2026'
```

```
✓ aynı model + aynı tarih + aynı saat ile ikinci booking engellenir
✓ aynı model + aynı tarih + farklı saat ile booking oluşturulabilir
✓ farklı model + aynı tarih + aynı saat ile booking oluşturulabilir
```

---

### `profile-management.spec.ts`
**Senaryo:** Profile management + photo upload — complex E2E
**Kapsam:** Validasyon, tam form doldurma, `setInputFiles` ile fotoğraf yükleme, liste, detay, edit, localStorage persistence

**Test verisi:**
```ts
PROFILE = { firstName: 'Ceren', lastName: 'Yıldız', height: '170',
            weight: '56', eyeColor: 'Ela', hairColor: 'Kumral' }
UPDATED = { hairColor: 'Siyah', weight: '60' }
// Test görseli: /tmp/pw-talent-photo.png (1×1 kırmızı PNG)
```

```
✓ Soyad boş bırakılınca kayıt gerçekleşmez, hata mesajı gösterilir
✓ Tüm alanlar + fotoğraf ile profil oluşturulur ve listede görünür
✓ Profil detay sayfasında tüm alanlar kayıtlı değerlerle eşleşir
✓ Düzenlenen alan kaydedilir ve sayfa yenilemesi sonrası persist eder
```

---

### `user-preferences-persistence.spec.ts`
**Senaryo:** localStorage persistence regression test
**Kapsam:** Tema + dil + tüm bildirimler değiştir → reload öncesi/sonrası UI + localStorage raw verisi doğrula

```
✓ tercihler değiştirilir, reload sonrası UI ve localStorage tutarlı kalır
```

---

### Manuel / Geçici Test Dosyaları

Bu dosyalar belirli UI akışlarını headed modda görsel olarak test etmek için yazılmıştır.
CI'da çalıştırılmaları **önerilmez** — `slowMo` ve screenshot içerirler.

| Dosya | Kapsam |
|---|---|
| `manual-ui-check.spec.ts` | Booking UI — tüm interaktif elementler |
| `manual-profile-check.spec.ts` | Talent profil UI — tüm akışlar |
| `manual-settings-check.spec.ts` | Settings UI — 11-madde kontrol listesi |
| `debug-save.spec.ts` | Booking modal save() debug (geçici, production'da kaldırılabilir) |

---

## Test İzolasyon Stratejisi

### Bookings
Booking service in-memory signal kullanır. Her test yeni bir browser context'te başlar → seed data otomatik restore olur. `beforeEach` ile `/bookings`'e gidilir.

**Tarih seçimi kuralı:** Test booking'leri seed datadaki tarihleri kullanmaz. Türkçe tarih formatıyla benzersiz filtre yapılır:
```ts
page.getByTestId('booking-list-item').filter({ hasText: '20 Eylül 2026' })
```

### Talent Profilleri
localStorage kullanır → her test başında temizlenir:
```ts
await page.evaluate(() => localStorage.removeItem('talent-profiles'));
await page.reload();
```

### Settings
localStorage kullanır → her test başında temizlenir:
```ts
await page.evaluate(() => localStorage.removeItem('user-preferences'));
await page.reload();
```

---

## Toplam Test Sayısı

```
smoke.spec.ts                        →  1 test
booking-crud.spec.ts                 →  2 test
booking-conflict.spec.ts             →  4 test
double-booking-prevention.spec.ts    →  3 test
profile-management.spec.ts           →  4 test
user-preferences-persistence.spec.ts →  1 test
─────────────────────────────────────────────
Toplam (CI'a uygun)                  → 15 test

manual-ui-check.spec.ts              → 13 test (headed, screenshot)
manual-profile-check.spec.ts         → 13 test (headed, screenshot)
manual-settings-check.spec.ts        → 11 test (headed, screenshot)
debug-save.spec.ts                   →  2 test (debug)
─────────────────────────────────────────────────
Genel Toplam                         → 54 test
```
