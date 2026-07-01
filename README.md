# CreditRepair Pro

A production-grade credit repair application that actively performs credit repair — not just advice. Built with AES-256 encryption, VantageScore 3.0 auto-analysis engine, and professional FCRA/FDCPA dispute letter generation.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Hono + tRPC 11 + Drizzle ORM + MySQL
- **Auth**: OAuth 2.0 (Kimi)
- **Security**: AES-256-GCM field-level encryption for all PII
- **Scoring**: VantageScore 3.0 deterministic credit analysis engine

## Features

- **Auto Credit Analysis** — Enter your info, app generates a full 3-bureau credit report with negative items
- **8 Dispute Letter Types** — FCRA 609/611/623, FDCPA 809, Goodwill, Pay-for-Delete, Cease & Desist
- **AES-256 Encryption** — All SSN, addresses, PII encrypted at field level
- **3D Luxe UI** — Glass morphism, mouse-tracking tilt cards, gold accent dark theme
- **Score Tracking** — Monitor score changes across all 3 bureaus over time
- **Creditor Management** — Track contact info, account status, negotiation history

## Deploy

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Start (production)
npm start
```

## Render.com Deployment

Use the included `render.yaml` Blueprint or configure manually:
- **Build Command**: `npm run build`
- **Start Command**: `node dist/boot.js`
- **Health Check**: `/api/trpc/ping`
