// API der App (Zielbild: ECS Fargate auf AWS). Läuft in der Live-Vorschau nicht mit;
// das Frontend nutzt dort die Testdaten aus src/lib/demo-daten.ts. Felder wie dort.
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var eintraege = new List<Eintrag>
{
    new("e1", "Profilserie 70 – Datenblatt prüfen", "Maße der Dichtung weichen vom Katalog ab.", "offen", "2026-10-29"),
    new("e2", "Beschlag B-12 – Ersatzteil anlegen", "Neue Artikelnummer ab Werk 2.", "arbeit", "2026-10-28"),
};

app.MapGet("/api/gesund", () => Results.Ok(new { ok = true }));
app.MapGet("/api/eintraege", () => eintraege);
app.MapGet("/api/eintraege/{id}", (string id) => eintraege.FirstOrDefault(e => e.Id == id) is { } e ? Results.Ok(e) : Results.NotFound());

app.Run();

record Eintrag(string Id, string Titel, string Beschreibung, string Status, string Geaendert);
