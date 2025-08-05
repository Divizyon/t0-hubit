# GitHub Actions Deployment

Bu proje GitHub Actions kullanılarak otomatik olarak GitHub Pages'e deploy edilmektedir.

## İlk Kurulum Adımları

**ÖNEMLİ:** GitHub Actions'ın çalışması için önce GitHub Pages'i manuel olarak etkinleştirmeniz gerekiyor:

1. GitHub repository'nize gidin: `https://github.com/Divizyon/t0-hubit`
2. **Settings** sekmesine tıklayın
3. Sol menüden **Pages** seçeneğini bulun
4. **Source** olarak **"GitHub Actions"** seçin
5. **Save** butonuna tıklayın

Bu adımdan sonra workflow otomatik olarak çalışmaya başlayacaktır.

## Deployment Süreci

1. `main` veya `develop2` branch'ine push yapıldığında otomatik olarak deployment başlar
2. Node.js 18 kurulur
3. Dependencies `npm ci` ile yüklenir
4. Proje `npm run build` ile build edilir
5. Build çıktısı GitHub Pages'e deploy edilir

## Live URL

Proje şu adreste live olarak görüntülenebilir:
`https://divizyon.github.io/t0-hubit/`

## Deployment Status

[![Deploy to GitHub Pages](https://github.com/Divizyon/t0-hubit/actions/workflows/deploy.yml/badge.svg)](https://github.com/Divizyon/t0-hubit/actions/workflows/deploy.yml)

## Manuel Deployment

Eğer manuel olarak deploy etmek isterseniz:

```bash
npm ci
npm run build
```

Build çıktısı `dist/` klasöründe oluşacaktır.

## Troubleshooting

Eğer "Pages site failed" hatası alıyorsanız:
1. Repository Settings > Pages'e gidin
2. Source olarak "GitHub Actions" seçili olduğundan emin olun
3. Workflow'u tekrar çalıştırın
