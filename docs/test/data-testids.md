# data-testid Referansı

Tüm `data-testid` değerleri feature bazında listelenmiştir.
Element seçimi her zaman `page.getByTestId('<testid>')` ile yapılır.

---

## Bookings

### Liste Sayfası (`/bookings`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `booking-page` | Sayfa wrapper `<div>` | |
| `booking-new-button` | "Yeni Booking" `<button>` | |
| `booking-list` | Liste container `<div>` | |
| `booking-list-item` | Her booking için `<button>` | Tekrarlayan — `filter({ hasText })` ile ayırt et |
| `booking-label` | İsim `<p>` (list item içinde) | |

### Modal (`booking-modal.component.ts`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `booking-modal` | Modal container `<div>` | `fixed inset-0 z-50` — backdrop tıklaması bu div'de yakalanır |
| `booking-model-select` | Model `<select>` | `selectOption('Alice Martin')` ile kullan |
| `booking-client-select` | Client `<select>` | `selectOption('Vogue Paris')` ile kullan |
| `booking-date-input` | Tarih `<input type="date">` | `fill('2026-09-20')` formatı |
| `booking-time-input` | Saat `<input type="time">` | `fill('10:00')` formatı |
| `booking-notes-input` | Notlar `<textarea>` | |
| `booking-save-button` | Kaydet `<button>` | |
| `booking-cancel-button` | İptal `<button>` | |
| `booking-conflict-error` | Conflict hata `<p>` | Yalnızca çakışma varsa görünür |

### Detay Sayfası (`/bookings/:id`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `booking-detail-page` | Sayfa wrapper | |
| `booking-detail-model` | Model değeri | |
| `booking-detail-client` | Client değeri | |
| `booking-detail-date` | Tarih değeri | Türkçe format: `'10 Nisan 2026'` |
| `booking-detail-time` | Saat değeri | `'10:00'` |
| `booking-detail-notes` | Notlar değeri | |
| `booking-edit-button` | Düzenle `<button>` | Edit modal açar |
| `booking-delete-button` | Sil `<button>` | Siler + `/bookings`'e yönlendirir |
| `booking-back-button` | Geri `<button>` | `/bookings`'e döner |

---

## Talent Profilleri

### Liste Sayfası (`/talents`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `profile-page` | Sayfa wrapper `<div>` | |
| `profile-new-button` | "Yeni Profil" `<button>` | `/talents/new`'e yönlendirir |
| `profile-list` | Grid container `<div>` | |
| `profile-card` | Her profil için `<button>` | Tekrarlayan — `filter({ hasText })` ile ayırt et |
| `profile-label` | Ad Soyad `<p>` (kart içinde) | |

### Form Sayfası (`/talents/new` ve `/talents/:id/edit`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `profile-form` | `<form>` elementi | |
| `profile-first-name-input` | Ad `<input type="text">` | Zorunlu alan |
| `profile-last-name-input` | Soyad `<input type="text">` | Zorunlu alan |
| `profile-height-input` | Boy `<input type="number">` | cm |
| `profile-weight-input` | Kilo `<input type="number">` | kg |
| `profile-eye-color-input` | Göz rengi `<input type="text">` | |
| `profile-hair-color-input` | Saç rengi `<input type="text">` | |
| `profile-photo-input` | `<input type="file">` | `label` içinde gizli — `setInputFiles()` ile kullan |
| `profile-photo-preview` | `<img>` önizleme | Yalnızca dosya seçilince görünür; `src` → `data:image/...` |
| `profile-save-button` | Kaydet/Güncelle `<button type="submit">` | |
| `profile-cancel-button` | İptal `<button type="button">` | |
| `profile-back-button` | Geri `<button>` | Form ve detay sayfasında var |
| `profile-form-error` | Validation hata `<p>` | Ad veya soyad boşsa görünür |

### Detay Sayfası (`/talents/:id`)

| `data-testid` | Element | Notlar |
|---|---|---|
| `profile-detail-page` | Sayfa wrapper `<div>` | |
| `profile-detail-first-name` | Ad değeri `<p>` | |
| `profile-detail-last-name` | Soyad değeri `<p>` | |
| `profile-detail-height` | Boy değeri `<span>` | `'172 cm'` formatında |
| `profile-detail-weight` | Kilo değeri `<span>` | `'56 kg'` formatında |
| `profile-detail-eye-color` | Göz rengi `<span>` | |
| `profile-detail-hair-color` | Saç rengi `<span>` | |
| `profile-detail-photo` | Fotoğraf `<img>` veya avatar `<div>` | Fotoğraf varsa `<img>`, yoksa `<div>` |
| `profile-edit-button` | Düzenle `<button>` | `/talents/:id/edit`'e yönlendirir |
| `profile-delete-button` | Sil `<button>` | Siler + `/talents`'a yönlendirir |
| `profile-back-button` | Geri `<button>` | `/talents`'a döner |

---

## Settings

### Ayarlar Sayfası (`/settings`)

| `data-testid` | Element | Tip | Varsayılan | Test yöntemi |
|---|---|---|---|---|
| `settings-page` | Sayfa wrapper `<div>` | — | — | `toBeVisible()` |
| `settings-theme-group` | Tema buton grubu `<div>` | — | — | |
| `settings-theme-light` | Açık tema `<button>` | `aria-pressed` | `'true'` | `getAttribute('aria-pressed')` |
| `settings-theme-dark` | Koyu tema `<button>` | `aria-pressed` | `'false'` | `getAttribute('aria-pressed')` |
| `settings-theme-active-label` | "Aktif" rozeti `<span>` | görünürlük | light'ta görünür | `toBeVisible()` / `not.toBeVisible()` |
| `settings-language-select` | Dil `<select>` | value | `'tr'` | `toHaveValue()` / `selectOption()` |
| `settings-notif-email-toggle` | E-posta `<button role="switch">` | `aria-checked` | `'true'` | `getAttribute('aria-checked')` |
| `settings-notif-push-toggle` | Push `<button role="switch">` | `aria-checked` | `'true'` | `getAttribute('aria-checked')` |
| `settings-notif-sms-toggle` | SMS `<button role="switch">` | `aria-checked` | `'false'` | `getAttribute('aria-checked')` |
| `settings-reset-button` | Varsayılanlara Dön `<button>` | — | — | `click()` |

---

## Kullanım Kalıpları

### Tekrarlayan elementleri filtrele
```ts
// Belirli bir booking'i tarihle bul
page.getByTestId('booking-list-item').filter({ hasText: '20 Eylül 2026' })

// Belirli bir profil kartını isimle bul
page.getByTestId('profile-card').filter({ hasText: 'Ceren Yıldız' })

// İlk elemanı al
page.getByTestId('profile-card').first()

// Kaç tane var?
await page.getByTestId('profile-card').count()

// Hepsinin text içerikleri
await page.getByTestId('profile-label').allTextContents()
```

### Toggle state kontrolü
```ts
// Settings toggle'ları aria-checked ile kontrol et
await expect(page.getByTestId('settings-notif-sms-toggle'))
  .toHaveAttribute('aria-checked', 'false');

// Tema butonları aria-pressed ile
await expect(page.getByTestId('settings-theme-dark'))
  .toHaveAttribute('aria-pressed', 'true');
```

### Fotoğraf yükleme
```ts
await page.getByTestId('profile-photo-input').setInputFiles('/tmp/test-image.png');
// Preview görünmeli
await expect(page.getByTestId('profile-photo-preview')).toBeVisible();
// src base64 formatında
const src = await page.getByTestId('profile-photo-preview').getAttribute('src');
expect(src).toMatch(/^data:image\//);
```

### localStorage okuma
```ts
const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('user-preferences'); // veya 'talent-profiles'
  return raw ? JSON.parse(raw) : null;
});
expect(stored.theme).toBe('dark');
```

### localStorage temizleme (test izolasyonu)
```ts
await page.evaluate(() => localStorage.removeItem('user-preferences'));
await page.evaluate(() => localStorage.removeItem('talent-profiles'));
```
