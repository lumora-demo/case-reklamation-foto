# Betrieb im Zielbild (AWS)

Die Live-Vorschau läuft auf GitHub Pages (nur Frontend, Testdaten). Im echten Betrieb:

| Teil | Dienst |
|---|---|
| Frontend | CloudFront + S3, Region Frankfurt (eu-central-1) |
| API (`backend/Lumora.Api`) | ECS Fargate hinter Application Load Balancer |
| Datenbank | Amazon RDS (Postgres) |
| Anmeldung | Kundenkonto über Amazon Cognito |
| Geheimnisse | AWS Secrets Manager |

Vorgaben: Jeder Schritt ein Branch und ein Pull Request, Freigabe durch Menschen; Lint, Build und Tests grün; Sicherheits-Scan vor dem Merge; keine Zugangsdaten im Code.
