// API der App (Zielbild: ECS Fargate auf AWS). Läuft in der Live-Vorschau nicht mit;
// das Frontend nutzt dort die Testdaten aus src/lib/demo-daten.ts. Felder wie dort.
//
// Anbindungen im Zielbild (hier mit Testdaten nachgestellt):
// - Aufträge und Chargen: SAP S/4HANA (Team Daten & Integration)
// - Verarbeiter: CRM (Team Daten & Integration), angemeldet über das Kundenkonto (Cognito)
// - Reklamationen: Service-Tickets (Team Plattform)
// - Etikett lesen: KI-Schicht (platform-ai) mit Dokumenten-Auslese (platform-documents), Datenschutz-Filter aktiv
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var verarbeiter = new List<Verarbeiter>
{
    new("v1", "Metallbau Kranich GmbH", "Talheim", "K-204711"),
    new("v2", "Fensterwerk Sommerau", "Neuberg", "K-208350"),
};

var auftraege = new List<Auftrag>
{
    new("4500 1182", "v1", "Wohnanlage Lindenhof, Haus B", "2026-10-14",
    [
        new("LP-70-210", "Profilserie 70, Blendrahmen 2,10 m", "profil", "CH-26-0418", 64, "Stück"),
        new("BS-12-DK", "Beschlag B-12 Dreh-Kipp", "beschlag", "CH-26-0377", 32, "Satz"),
    ]),
    new("4500 1209", "v1", "Bürohaus Am Kanal", "2026-10-21",
    [
        new("FS-50-PF", "Fassade F50, Pfostenprofil", "profil", "CH-26-0451", 40, "Stück"),
        new("OB-7016-M", "Pulverbeschichtung Anthrazit matt", "oberflaeche", "CH-26-0462", 40, "Stück"),
    ]),
    new("4500 1233", "v1", "Schule Feldweg, Anbau", "2026-10-27",
    [
        new("TT-60-SW", "Tür T60, Schwellenprofil", "profil", "CH-26-0480", 12, "Stück"),
        new("BS-30-TB", "Türband B-30, 3-teilig", "beschlag", "CH-26-0486", 36, "Stück"),
    ]),
};

var reklamationen = new List<Reklamation>
{
    new("r1", "RK-2026-0142", "4500 1209", "v1", "OB-7016-M", "Pulverbeschichtung Anthrazit matt", "oberflaeche", "CH-26-0462", "farbe", 6,
        "Farbton an sechs Pfosten deutlich heller als der Rest der Lieferung.", "pruefung", "2026-10-28", ["auftrag", "artikel", "charge", "kategorie"], true),
    new("r2", "RK-2026-0137", "4500 1182", "v1", "BS-12-DK", "Beschlag B-12 Dreh-Kipp", "beschlag", "CH-26-0377", "fehlt", 2,
        "Zwei Sätze ohne Schließblech geliefert.", "eingegangen", "2026-10-24", ["auftrag", "artikel", "charge", "kategorie"], true),
    new("r3", "RK-2026-0121", "4500 1182", "v1", "LP-70-210", "Profilserie 70, Blendrahmen 2,10 m", "profil", "CH-26-0418", "beschaedigt", 3,
        "Drei Profile mit Kratzern an der Sichtseite, Verpackung war eingedrückt.", "erledigt", "2026-10-16", ["auftrag", "artikel", "charge"], true),
};

static string Ohne(string s) => s.Replace(" ", "");
Auftrag? FindeAuftrag(string nummer) => auftraege.FirstOrDefault(a => Ohne(a.Nummer) == Ohne(nummer));

app.MapGet("/api/gesund", () => Results.Ok(new { ok = true }));

// Zielbild: nur Daten des angemeldeten Verarbeiters (aus dem Kundenkonto)
app.MapGet("/api/verarbeiter/{id}", (string id) => verarbeiter.FirstOrDefault(v => v.Id == id) is { } v ? Results.Ok(v) : Results.NotFound());
app.MapGet("/api/auftraege/{nummer}", (string nummer) => FindeAuftrag(nummer) is { } a ? Results.Ok(a) : Results.NotFound());

app.MapGet("/api/reklamationen", (string? status) => reklamationen.Where(r => status is null || r.Status == status));
app.MapGet("/api/reklamationen/{id}", (string id) => reklamationen.FirstOrDefault(r => r.Id == id) is { } r ? Results.Ok(r) : Results.NotFound());

// Foto vom Etikett lesen. Zielbild: Weitergabe an die KI-Schicht, das Foto wird nicht gespeichert.
app.MapPost("/api/reklamationen/auslese", (IFormFile foto) =>
    Results.Problem("Die Dokumenten-Auslese ist noch im Bau. Bis dahin Angaben von Hand eintragen.", statusCode: StatusCodes.Status501NotImplemented))
    .DisableAntiforgery();

// Reklamation anlegen: prüft Auftrag und Artikel gegen SAP und legt das Service-Ticket an
app.MapPost("/api/reklamationen", (NeueReklamation n) =>
{
    var auftrag = FindeAuftrag(n.Auftrag);
    var pos = auftrag?.Positionen.FirstOrDefault(p => p.Artikel == n.Artikel.Trim().ToUpperInvariant());
    if (auftrag is null || pos is null) return Results.ValidationProblem(new Dictionary<string, string[]> { ["auftrag"] = ["Auftrag oder Artikel nicht gefunden."] });
    if (n.Menge < 1 || string.IsNullOrWhiteSpace(n.Beschreibung) || string.IsNullOrWhiteSpace(n.Charge))
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["angaben"] = ["Menge, Charge und Beschreibung ausfüllen."] });

    var hoechste = reklamationen.Max(r => int.Parse(r.Nummer.Split('-')[2]));
    var r = new Reklamation($"r{Guid.NewGuid():N}", $"RK-2026-{hoechste + 1:0000}", auftrag.Nummer, n.VerarbeiterId, pos.Artikel, pos.Bezeichnung, pos.Kategorie,
        n.Charge.Trim().ToUpperInvariant(), n.Mangel, n.Menge, n.Beschreibung.Trim(), "eingegangen", DateTime.UtcNow.ToString("yyyy-MM-dd"), n.KiFelder, n.Foto);
    reklamationen.Insert(0, r);
    return Results.Created($"/api/reklamationen/{r.Id}", r);
});

app.Run();

record Verarbeiter(string Id, string Firma, string Ort, string Kundennummer);
record Position(string Artikel, string Bezeichnung, string Kategorie, string Charge, int Menge, string Einheit);
record Auftrag(string Nummer, string VerarbeiterId, string Projekt, string Geliefert, List<Position> Positionen);
record Reklamation(string Id, string Nummer, string Auftrag, string VerarbeiterId, string Artikel, string Bezeichnung, string Kategorie, string Charge,
    string Mangel, int Menge, string Beschreibung, string Status, string Erstellt, List<string> KiFelder, bool Foto);
record NeueReklamation(string Auftrag, string VerarbeiterId, string Artikel, string Charge, string Mangel, int Menge, string Beschreibung, List<string> KiFelder, bool Foto);
