# Test Yazım Kuralları ve Kalıpları

Bu projede yazılan tüm Playwright testleri bu kurallara uyar.
Yeni test yazarken bu dosyayı referans al.

---

## Temel Kurallar

### 1. Sadece `getByTestId()` kullan
CSS sınıfı, tag adı, `getByRole`, `getByText` ile element seçme. Her zaman `data-testid` ile:
```ts
// ✅ Doğru
page.getByTestId('booking-save-button')

// ❌ Yanlış
page.locator('button.bg-indigo-600')
page.locator('button:has-text("Kaydet")')
```

### 2. `data-testid` format kuralı
`{bölüm}-{element}` — küçük harf, tire ile ayrılmış:
```
booking-modal         ✅
booking-save-button   ✅
bookingSaveButton     ❌
save_button           ❌
```

### 3. Tekrarlayan elementlerde aynı testid
Listeler, kartlar, toggle'lar — hepsine **aynı** testid verilir:
```html
<!-- Her booking item için aynı testid -->
<button data-testid="booking-list-item">...</button>
<button data-testid="booking-list-item">...</button>
```
Test tarafında `filter()` veya `.all()` ile ayırt et:
```ts
page.getByTestId('booking-list-item').filter({ hasText: '20 Eylül 2026' })
```

### 4. Her test izole çalışmalı
Testler birbirine bağımlı olmamalı. localStorage kullanan feature'larda:
```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/settings');
  await page.evaluate(() => localStorage.removeItem('user-preferences'));
  await page.reload();
});
```

### 5. Test verisi sabit ve açık olmalı
Magic string / inline değer kullanma — test başında sabit olarak tanımla:
```ts
// ✅ Doğru
const BOOKING = {
  model: 'Alice Martin',
  date: '2026-09-20',
  time: '11:30',
};

// ❌ Yanlış
await page.getByTestId('booking-model-select').selectOption('Alice Martin');
await page.getByTestId('booking-date-input').fill('2026-09-20');
```

---

## Assertion Kalıpları

### Görünürlük
```ts
await expect(locator).toBeVisible();
await expect(locator).not.toBeVisible();  // auto-wait ile — isVisible() kullanma
```

### URL
```ts
await expect(page).toHaveURL('/bookings');
await expect(page).toHaveURL(/\/talents\/\d+$/);
await expect(page).toHaveURL(/\/talents\/\d+\/edit$/);
```

### Metin içeriği
```ts
await expect(locator).toHaveText('Alice Martin');      // tam eşleşme
await expect(locator).toContainText('172');            // içerme
```

### Input değeri
```ts
await expect(input).toHaveValue('en');                 // select, text input
```

### Attribute
```ts
await expect(btn).toHaveAttribute('aria-pressed', 'true');
await expect(toggle).toHaveAttribute('aria-checked', 'false');
```

### Sayma
```ts
await expect(page.getByTestId('profile-card')).toHaveCount(3);
const count = await page.getByTestId('profile-card').count();
```

---

## Tarih Formatı

Booking listesinde tarihler Türkçe formatlanır. Test dosyalarında her zaman hem raw hem de Türkçe halini tanımla:

```ts
const BOOKING = { date: '2026-09-20' };
const EXPECTED_DATE = '20 Eylül 2026';  // new Date('2026-09-20').toLocaleDateString('tr-TR', {...})

// Listede filtrelerken
page.getByTestId('booking-list-item').filter({ hasText: EXPECTED_DATE })
```

**Önemli:** Test booking'i seed datadaki tarihlerden farklı bir tarih kullanmalıdır.
Seed data tarihleri: `2026-04-10`, `2026-04-15`, `2026-04-22`

---

## Fotoğraf Yükleme

`setInputFiles` ile gerçek bir dosya kullan. Test başında `/tmp`'ye yaz:

```ts
const TEST_IMAGE_PATH = path.join('/tmp', 'pw-test-photo.png');
const RED_1PX_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

test.beforeAll(() => {
  fs.writeFileSync(TEST_IMAGE_PATH, RED_1PX_PNG);
});

// Testte
await page.getByTestId('profile-photo-input').setInputFiles(TEST_IMAGE_PATH);
await expect(page.getByTestId('profile-photo-preview')).toBeVisible();
const src = await page.getByTestId('profile-photo-preview').getAttribute('src');
expect(src).toMatch(/^data:image\//);
```

---

## localStorage ile Çalışma

```ts
// Okuma
const stored = await page.evaluate(() => {
  const raw = localStorage.getItem('user-preferences');
  return raw ? JSON.parse(raw) : null;
});

// Temizleme
await page.evaluate(() => localStorage.removeItem('talent-profiles'));

// Persistence testi şablonu
// 1. Değiştir
// 2. Reload öncesi UI doğrula
// 3. localStorage doğrula
// 4. page.reload()
// 5. Reload sonrası UI doğrula
// 6. localStorage tekrar oku → UI ile karşılaştır
```

---

## Select Kullanımı

Angular'da zoneless modda `<select>` için sadece `selectOption()` kullan:

```ts
await page.getByTestId('booking-model-select').selectOption('Alice Martin');
await page.getByTestId('settings-language-select').selectOption('en');
```

---

## Dosya Adlandırma

| Tür | Format | Örnek |
|---|---|---|
| Feature E2E testi | `{feature-adı}.spec.ts` | `booking-crud.spec.ts` |
| Regression testi | `{konu}-{tip}.spec.ts` | `user-preferences-persistence.spec.ts` |
| Negative test | `{feature}-prevention.spec.ts` | `double-booking-prevention.spec.ts` |
| Manuel UI gezinti | `manual-{konu}-check.spec.ts` | `manual-settings-check.spec.ts` |

---

## describe / test Yapısı

```ts
test.describe('Feature — Senaryo Adı', () => {
  test.beforeEach(async ({ page }) => {
    // izolasyon: localStorage temizle, sayfaya git, temel element doğrula
  });

  test('beklenen davranışı Türkçe yaz', async ({ page }) => {
    // Arrange: ön koşulları hazırla
    // Act: kullanıcı aksiyonlarını gerçekleştir
    // Assert: sonuçları doğrula
  });
});
```

---

## Neler Yapılmaz

```ts
// ❌ CSS selector
page.locator('.rounded-lg')

// ❌ XPath
page.locator('//button[text()="Kaydet"]')

// ❌ isVisible() doğrudan okuma (timing sorunu)
const visible = await locator.isVisible();
expect(visible).toBe(false);
// Bunun yerine:
await expect(locator).not.toBeVisible();

// ❌ Sabit wait (flaky)
await page.waitForTimeout(1000);
// Bunun yerine:
await expect(locator).toBeVisible();

// ❌ Seed data tarihlerini test verisi olarak kullanmak
date: '2026-04-10'  // Seed data — conflict riski
```
