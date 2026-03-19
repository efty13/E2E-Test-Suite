# Proje Dokümantasyonu

Bu klasör, projeye katılan gelecekteki ajanlar ve geliştiriciler için referans dokümantasyon içerir.

## İçindekiler

| Dosya | Açıklama |
|---|---|
| [architecture.md](./architecture.md) | Proje mimarisi — monorepo yapısı, Angular app, servisler, routing, state |
| [test/test-files.md](./test/test-files.md) | Tüm test dosyaları, senaryolar ve çalıştırma komutları |
| [test/data-testids.md](./test/data-testids.md) | Feature bazlı tam `data-testid` referansı |
| [test/conventions.md](./test/conventions.md) | Test yazım kuralları ve kalıpları |

## Hızlı Başlangıç

```bash
# Bağımlılıkları kur
pnpm install

# Angular dev server başlat
pnpm --filter panel start

# Tüm testleri çalıştır (ayrı terminalde)
pnpm --filter e2e test

# Tek dosya çalıştır
pnpm --filter e2e exec playwright test <dosya-adı> --project=chromium
```

## Mevcut Sayfalar (Rotalar)

| Route | Sayfa |
|---|---|
| `/users` | Kullanıcı listesi |
| `/talents` | Talent profil listesi |
| `/talents/new` | Yeni profil oluşturma formu |
| `/talents/:id` | Profil detay sayfası |
| `/talents/:id/edit` | Profil düzenleme formu |
| `/bookings` | Booking listesi |
| `/bookings/:id` | Booking detay sayfası |
| `/settings` | Kullanıcı tercihleri / ayarlar |
