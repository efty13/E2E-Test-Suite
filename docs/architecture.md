# Proje Mimarisi

## Monorepo Yapısı

```
E2E Test Suite/
├── apps/
│   └── panel/                  # Angular 19 uygulaması
│       └── src/app/
│           ├── users/           # Kullanıcı listesi
│           ├── talents/         # Talent profil yönetimi
│           ├── bookings/        # Booking CRUD
│           ├── settings/        # Kullanıcı tercihleri
│           ├── app.routes.ts    # Tüm rotalar
│           ├── app.config.ts    # Angular konfigürasyonu
│           └── app.component.ts # Root component (sadece <router-outlet>)
├── packages/
│   └── e2e/                    # Playwright test paketi
│       └── tests/              # Tüm .spec.ts dosyaları
├── docs/                       # Bu dokümantasyon
├── pnpm-workspace.yaml
└── package.json
```

---

## Angular Uygulaması — `apps/panel`

### Teknik Yığın

| Katman | Teknoloji |
|---|---|
| Framework | Angular 19.2, Standalone Components |
| Change Detection | `provideExperimentalZonelessChangeDetection` (Zone.js yok) |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| Stil | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Persistence | `localStorage` (talent profilleri + kullanıcı tercihleri) |
| Routing | Angular Router, lazy-loaded standalone components |

### Routing Tablosu

```ts
// app.routes.ts — sıra önemli: talents/new mutlaka talents/:id'den önce gelir
''              → redirect → /users
/users          → UserListComponent
/talents        → TalentListComponent
/talents/new    → TalentProfileFormComponent   (create mode)
/talents/:id    → TalentProfileDetailComponent
/talents/:id/edit → TalentProfileFormComponent (edit mode)
/bookings       → BookingListComponent
/bookings/:id   → BookingDetailComponent
/settings       → SettingsComponent
```

---

## Feature'lar

### 1. Users (`/users`)
- Statik kullanıcı listesi, tablo görünümü
- Servis: `UserService` (sadece okuma, localStorage yok)

### 2. Talents / Profil Yönetimi (`/talents`)

**Dosyalar:**
```
talents/
├── talent.model.ts              # TalentProfile interface
├── talent-profile.service.ts   # CRUD + localStorage persistence
├── talent-list.component.ts    # Liste sayfası
├── talent-profile-form.component.ts  # Create + Edit formu
└── talent-profile-detail.component.ts # Detay sayfası
```

**Model:**
```ts
interface TalentProfile {
  id: number;
  firstName: string;
  lastName: string;
  height: string;       // cm
  weight: string;       // kg
  eyeColor: string;
  hairColor: string;
  photoDataUrl: string; // base64 — FileReader.readAsDataURL çıktısı
}
```

**Persistence:** `localStorage` key: `'talent-profiles'`

**Form modu tespiti:** `ActivatedRoute.snapshot.paramMap.get('id')`
- `null` → create mode (`/talents/new`)
- Sayı → edit mode (`/talents/:id/edit`)

**Fotoğraf yükleme:** `FileReader.readAsDataURL()` → `signal<string>` → template'de `[src]` binding

### 3. Bookings (`/bookings`)

**Dosyalar:**
```
bookings/
├── booking.model.ts
├── booking.service.ts         # Signal state, seed data (3 kayıt), CRUD
├── booking-list.component.ts  # Liste + "Yeni Booking" modal
├── booking-modal.component.ts # Create/Edit modal (bookingId input ile mod belirlenir)
└── booking-detail.component.ts # Detay + Edit + Delete
```

**Model:**
```ts
interface Booking {
  id: number;
  model: string;   // MOCK_MODELS listesinden
  client: string;  // MOCK_CLIENTS listesinden
  date: string;    // 'YYYY-MM-DD'
  time: string;    // 'HH:MM'
  notes: string;
}
```

**Seed data** (3 kayıt — her test başında mevcuttur):
| id | Model | Client | Tarih | Saat |
|---|---|---|---|---|
| 1 | Alice Martin | Vogue Paris | 2026-04-10 | 10:00 |
| 2 | Kenji Tanaka | Nike Creative | 2026-04-15 | 14:00 |
| 3 | Sofia Ferreira | Gucci | 2026-04-22 | 09:30 |

**Persistence:** Yok — in-memory signal state. Sayfa yenilenince seed dataya döner.

**Double Booking kuralı:** Aynı `model + date + time` kombinasyonu izin verilmez. `BookingService.hasConflict()` ile kontrol edilir. Edit modunda `excludeId` parametresiyle kendi kaydı hariç tutulur.

**Önemli teknik not:** `<select>` elementlerinde `[selected]` binding kullanılmaz. Zoneless Angular'da `(change)` + `[selected]` kombinasyonu güvenilmez — sadece `(change)` event ve native browser select state kullanılır.

**Modal backdrop:** `booking-modal` div'i `fixed inset-0 z-50` ile tüm ekranı kaplar. `(click)="cancel()"` bu div'de tanımlıdır, iç kart `$event.stopPropagation()` ile korur.

### 4. Settings (`/settings`)

**Dosyalar:**
```
settings/
├── user-preferences.model.ts    # UserPreferences interface + DEFAULT_PREFERENCES
├── user-preferences.service.ts  # Signal state + localStorage persistence
└── settings.component.ts        # UI component
```

**Model:**
```ts
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
```

**Varsayılan değerler:**
```ts
DEFAULT_PREFERENCES = {
  theme: 'light',
  language: 'tr',
  notifications: { email: true, push: true, sms: false }
}
```

**Persistence:** `localStorage` key: `'user-preferences'`

**Auto-save:** Her `setTheme/setLanguage/setNotification` çağrısı hemen `localStorage.setItem` yapar. Ayrı bir "kaydet" butonu yoktur.

**Restore:** `UserPreferencesService` constructor'da `localStorage.getItem` ile yükler. Angular servisi `providedIn: 'root'` olduğu için uygulama açılışında bir kez initialize olur.

**Toggle UI:** `<button role="switch" [attr.aria-checked]="...">` — checkbox değil, styled button. Playwright'ta `getAttribute('aria-checked')` ile okunur.

**Tema göstergesi:** Aktif tema butonunda `data-testid="settings-theme-active-label"` ile "Aktif" rozeti render edilir.

---

## State Yönetimi Özeti

| Feature | State | Persistence |
|---|---|---|
| Users | `UserService` signal | Yok (statik) |
| Talent Profilleri | `TalentProfileService` signal | `localStorage['talent-profiles']` |
| Bookings | `BookingService` signal | Yok (seed data her yüklemede gelir) |
| Ayarlar | `UserPreferencesService` signal | `localStorage['user-preferences']` |

---

## Zoneless Angular — Dikkat Edilecekler

Uygulama `provideExperimentalZonelessChangeDetection` kullanır. Bu şu anlamına gelir:

1. **`(change)` vs `(input)`:** Date/time input'larında `(input)` kullanılır; `(change)` sadece blur'da tetiklenir.
2. **`[selected]` binding yasak:** Select option'larında `[selected]` kullanılmaz; Angular re-render döngüsü native select state'i sıfırlayabilir.
3. **FileReader callback:** `reader.onload` callback içinde `signal.set()` çağrısı zoneless'ta güvenlidir çünkü signal reaktivitesi zone'dan bağımsızdır.
4. **Playwright timing:** `await expect(...).not.toBeVisible()` kullanılır, `isVisible()` doğrudan okumak yerine. Auto-wait mekanizması zoneless async render'ı bekler.
