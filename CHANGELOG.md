# Changelog

## 2026-07-01/v3-3d-luxe-ui
**Branch**: main

- Added TiltCard 3D component with mouse-tracking rotation + glow effects
- Redesigned all pages with competitor-research-backed 3D cards (Credit Karma, Experian patterns)
- Refined glass morphism with backdrop-blur, translucent borders, gold accents
- Fixed all TypeScript unused-import errors
- Added render.yaml for Render.com deployment
- Updated README.md, CHANGELOG.md, AI_NOTES.md per Caveman Policy

## 2026-06-30/v2-luxe-dark-encryption
**Branch**: main

- Full luxe dark UI redesign (#0a0b0f + #d4a843 gold)
- AES-256-GCM field-level encryption for all PII
- VantageScore 3.0 auto-analysis engine (deterministic profile generation)
- 4-step "Analyze My Credit" wizard on Dashboard
- Glass morphism cards with Playfair Display headings

## 2026-06-30/v1-core-platform
**Branch**: main

- Initial fullstack build: React + tRPC + Drizzle + MySQL
- 9 database tables, 9 tRPC routers
- 8 dispute letter types (FCRA/FDCPA compliant)
- OAuth 2.0 authentication
- Credit reports, accounts, disputes, letters, creditors, scores, activities, reminders
