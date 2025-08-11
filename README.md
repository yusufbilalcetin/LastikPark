# Lastik Fiyat Karşılaştırma UI

Bu proje yalnızca **frontend** (React + Vite + Tailwind) içerir. Mock veri ile tek tuşla çalışır.
Gerçek API için `/offers/search` endpoint'ini bağlayabilirsiniz.

## Kurulum
```bash
npm install
npm run dev
```

## Yapı
- `src/App.tsx` → UI sayfası
- `src/index.css` → Tailwind
- `index.html` → giriş
- `tailwind.config.js`, `postcss.config.js` → Tailwind yapılandırma
- `vite.config.ts` → Vite ayarı

## Not
- Mock veriyi kapatmak için UI'da "Mock veriyi kullan (demo)" checkbox'ını kaldırın; bu durumda `/offers/search` çağrılır.
