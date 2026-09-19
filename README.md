# Lese-Navigator Jahrgang 5

Digitaler Förderwegweiser für die Leseförderung direkt nach dem Übergang in die Sekundarstufe I.

## Förderwege

| Symbol | Farbe | Kindername | interne Funktion |
|---|---|---|---|
| 🌊 | Blau `#245688` | Welle | Mindestniveau: Lesebasis und Leseflüssigkeit |
| 🧭 | Türkisgrün `#48DCCB` | Kompass | Regelniveau: Wort-, Satz- und Textverständnis |
| 🔍 | Orange `#F0A66F` | Lupe | Expertenniveau: Schlussfolgern, Belegen, anspruchsvolles Lesen |

Die Kinder sehen keine Niveau-Bezeichnungen, keine Zahlen-/Buchstabenstufen und keine Rangfolge.

## Technische Architektur

Die Webapp ist bewusst eine **reine statische HTML/CSS/JavaScript-Anwendung**.

Es gibt:

- kein Next.js
- kein React
- kein npm-/Node-Build
- keine API
- keine Server-Funktionen
- keine Datenbank
- keine Analytics- oder Tracking-Integration

Vercel veröffentlicht ausschließlich den Ordner `public/`.

## Repository-Struktur

```
public/
  index.html
  styles.css
  app.js
  data/
    design.json
    sets/
      eiche.json
      ahorn.json
      birke.json
    scoring/
      pilot-rules.json

docs/
  01-kompetenzraster.md
  02-diagnostischer-bauplan.md
  03-auswertungsmatrix.md
  04-aufgabenpool-v0.1.md
  05-qualitaetspruefung-parallelformen.md
  06-datenschutz-lokaler-speicher.md

vercel.json
```

## Datenschutz und lokale Verarbeitung

Schüleridentitäten und Diagnoseergebnisse werden ausschließlich in `localStorage` des verwendeten Browsers gespeichert.

Die App sendet diese Daten nicht an Vercel, GitHub oder einen anderen Server.

Die lokale Lehrkraftverwaltung ist durch eine gerätebezogene PIN geschützt. Die PIN selbst wird nicht gespeichert; lokal liegt nur ein abgeleiteter Prüfwert.

CSV-Export:

- Ergebnisübersicht: eine Zeile pro Diagnosedurchlauf
- Itemdaten: eine Zeile pro beantwortetem Item

Die CSV-Dateien werden ausschließlich lokal im Browser erzeugt.

Details: `docs/06-datenschutz-lokaler-speicher.md`

## Vercel Deployment

Das Projekt wird als statische Website deployt.

`vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "other",
  "installCommand": "",
  "buildCommand": "echo Static HTML - no build required",
  "outputDirectory": "public"
}
```

Es müssen keine Dependencies installiert werden und es sind keine Environment Variables erforderlich.

## Status

**Statischer Prototyp / Version 0.3**

Vor einem echten Schüler-Pilot:

1. Wort-Bild-Platzhalter durch einheitliche Illustrationen ersetzen.
2. Bedienung auf den vorgesehenen Dienstgeräten testen.
3. CSV-Export und lokale Löschfunktion praktisch testen.
4. Pilotdurchläufe durchführen und Items/Schwellenwerte kalibrieren.
