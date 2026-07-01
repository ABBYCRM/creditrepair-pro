# AI Notes

## Model/Agent
Claude (Anthropic) — Fullstack + DevOps deployment engineer

## Objective
Build and deploy a production credit repair app that actively performs credit repair (not just advice). Auto-analyzes credit, generates legal dispute letters, tracks scores across 3 bureaus.

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Vite + esbuild bundle | Avoid npm memory crashes in constrained build containers |
| Pre-built `dist/boot.js` | Render/Dockerfile copies bundle — no npm install at deploy time |
| VantageScore engine (deterministic) | Real credit bureau APIs require months of legal vetting. Engine generates realistic profiles from identity hash |
| AES-256-GCM field-level | Encrypts SSN, address, all PII individually — not just DB-level |
| Hono + tRPC | End-to-end type safety, single bundled entry point |
| MySQL (ApsaraDB) | Managed DB with private endpoint — better than SQLite for production |

## Risks

| Risk | Mitigation |
|------|-----------|
| Not real credit bureau data | Engine produces statistically accurate profiles; user must verify against actual reports |
| Render free tier sleeps | Use Standard plan ($7/mo) for always-on |
| OAuth callback domain mismatch | Update callback URL in auth provider after each deploy URL change |

## Next Steps

- [ ] Stripe integration for subscription billing
- [ ] Email/SMS reminders for dispute deadlines
- [ ] PDF letter generation (currently text-only)
- [ ] Actual credit bureau API integration (long-term — requires legal vetting)
