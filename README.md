# Frava — E2E Test Suite

Angular panel uygulaması ve Playwright E2E test paketini içeren pnpm monorepo.

## Hızlı Başlangıç

```bash
pnpm install                        # bağımlılıkları kur
pnpm --filter panel start           # Angular dev server → http://localhost:4200
pnpm --filter e2e test              # tüm testleri çalıştır (ayrı terminalde)
```

## Sayfalar

| Route | Sayfa |
|---|---|
| `/users` | Kullanıcı listesi |
| `/talents` | Talent profil listesi |
| `/talents/new` | Yeni profil formu |
| `/talents/:id` | Profil detayı |
| `/talents/:id/edit` | Profil düzenleme |
| `/bookings` | Booking listesi |
| `/bookings/:id` | Booking detayı |
| `/settings` | Kullanıcı tercihleri |

## Test Dosyaları

| Dosya | Senaryo |
|---|---|
| `smoke.spec.ts` | App ayağa kalkar |
| `booking-crud.spec.ts` | Booking oluştur → listede gör → detay |
| `booking-conflict.spec.ts` | Double booking prevention |
| `double-booking-prevention.spec.ts` | Negative test — conflict iş kuralları |
| `profile-management.spec.ts` | Profil CRUD + fotoğraf yükleme + persistence |
| `user-preferences-persistence.spec.ts` | Settings localStorage regression |

## Dokümantasyon

Detaylı referans için → **[docs/](./docs/README.md)**

| Döküman | İçerik |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | Mimari, servisler, state, routing, teknik notlar |
| [docs/test/test-files.md](./docs/test/test-files.md) | Tüm spec dosyaları ve senaryolar |
| [docs/test/data-testids.md](./docs/test/data-testids.md) | Feature bazlı tam testid referansı |
| [docs/test/conventions.md](./docs/test/conventions.md) | Test yazım kuralları ve kalıpları |

## Teknik Yığın

| Katman | Teknoloji |
|---|---|
| Frontend | Angular 19, Standalone, Zoneless, Signals |
| Stil | Tailwind CSS v4 |
| Testler | Playwright, Chromium |
| Paket yönetimi | pnpm workspaces |
