# GitHub Actions Deployment

Bu proje GitHub Actions kullanılarak otomatik olarak GitHub Pages'e deploy edilmektedir.

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
