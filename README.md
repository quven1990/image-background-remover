# Image Background Remover

Next.js + Tailwind CSS MVP for an online image background remover.

## Features

- Upload JPG, PNG, and WebP images up to 10 MB
- Remove backgrounds through the Remove.bg API
- Preview original and processed images
- Download transparent PNG
- Export white or custom solid-color backgrounds in the browser
- No image storage in the app layer
- Cloudflare Pages native deployment with Pages Functions

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `REMOVEBG_API_KEY` in `.env.local` before using the background removal API.

For local Cloudflare Pages Function testing, build the static app and run it with Wrangler:

```bash
npm run build
npx wrangler pages dev out --binding REMOVEBG_API_KEY="$REMOVEBG_API_KEY" --binding MAX_UPLOAD_MB=10
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Cloudflare Pages

Use these settings for the native GitHub integration:

- Build command: `npm run build`
- Build output directory: `out`
- Production branch: `main`
- Runtime environment variables: `REMOVEBG_API_KEY`, `MAX_UPLOAD_MB`

## Docs

- [English MVP PRD](docs/image-background-remover-mvp-prd.md)
- [Chinese MVP PRD](docs/image-background-remover-mvp-prd-zh.md)
