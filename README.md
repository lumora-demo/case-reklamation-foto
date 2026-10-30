# Vorlage Digital: Digitale Produkte

Vorlage für neue Apps der **Lumora Systeme AG** (erfundene Firma, nur Testdaten) im Set „Digitale Produkte“.
Kompass legt für jeden Case aus dieser Vorlage ein eigenes Repository an und übergibt den Bauauftrag als Issue an Claude.

- **Für wen:** Software und Portale für Verarbeiter (Metall- und Fensterbauer), Architekten und Kunden
- **Frontend:** Next.js (React) + TypeScript + Tailwind, statisch gebaut
- **Backend:** C# · .NET 8 Minimal API in `backend/` (Lumora.Api)
- **Betrieb (Zielbild):** AWS, Region Frankfurt: ECS Fargate (API), CloudFront + S3 (Frontend), Amazon RDS (Postgres), Anmeldung über das Kundenkonto (Cognito)
- **Aussehen:** [STYLEGUIDE.md](STYLEGUIDE.md) – Lumora Design-System, identisch in allen Sets
- **Regeln für Claude:** [CLAUDE.md](CLAUDE.md)

## Lokal starten

```
npm install
npm run dev
```

## Live-Vorschau

Jeder Stand auf `main` wird automatisch gebaut und auf GitHub Pages veröffentlicht (Workflow „Live-Vorschau“). Pull Requests werden mit Lint und Build geprüft.
