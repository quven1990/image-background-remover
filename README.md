# Image Background Remover

Next.js + Tailwind CSS MVP for an online image background remover.

## Features

- Upload JPG, PNG, and WebP images up to 10 MB
- Remove backgrounds through the Remove.bg API
- Preview original and processed images
- Download transparent PNG
- Export white or custom solid-color backgrounds in the browser
- No image storage in the app layer

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `REMOVEBG_API_KEY` in `.env.local` before using the background removal API.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Docs

- [English MVP PRD](docs/image-background-remover-mvp-prd.md)
- [Chinese MVP PRD](docs/image-background-remover-mvp-prd-zh.md)
