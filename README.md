# Lese-Navigator Jahrgang 5

Digitaler Förderwegweiser für die Leseförderung direkt nach dem Übergang in die Sekundarstufe I.

## Förderwege

| Symbol | Farbe | Kindername | interne Funktion |
|---|---|---|---|
| 🌊 | Blau `#245688` | Welle | Mindestniveau: Lesebasis und Leseflüssigkeit |
| 🧭 | Türkisgrün `#48DCCB` | Kompass | Regelniveau: Wort-, Satz- und Textverständnis |
| 🔍 | Orange `#F0A66F` | Lupe | Expertenniveau: Schlussfolgern, Belegen, anspruchsvolles Lesen |

Die Kinder sehen keine Niveau-Bezeichnungen, keine Zahlen-/Buchstabenstufen und keine Rangfolge.

## Endgültige Repo-Struktur

```
index.html

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
```

## Technische Architektur

Die App besteht aus genau **einer selbstständigen `index.html` im Hauptverzeichnis**.

CSS und JavaScript sind direkt in dieser Datei eingebettet.

Die App lädt lediglich die fachlichen JSON-Daten aus `data/`.

Es gibt:

- kein Framework
- kein Next.js
- kein React
- kein npm
- kein Node-Build
- kein `vercel.json`
- keine API
- keine Server-Funktionen
- keine Datenbank
- keine Analytics- oder Tracking-Integration

## Datenschutz und lokale Verarbeitung

Schüleridentitäten und Diagnoseergebnisse werden ausschließlich im `localStorage` des verwendeten Browsers gespeichert.

Die App sendet diese Daten nicht an den Webserver.

Die lokale Lehrkraftverwaltung ist durch eine gerätebezogene PIN geschützt. Die PIN selbst wird nicht gespeichert; lokal liegt nur ein abgeleiteter Prüfwert.

CSV-Export:

- Ergebnisübersicht: eine Zeile pro Diagnosedurchlauf
- Itemdaten: eine Zeile pro beantwortetem Item

Details: `docs/06-datenschutz-lokaler-speicher.md`

## Deployment

Das Repository benötigt selbst **keine Build- oder Deployment-Konfiguration**.

Ein statischer Webhost muss lediglich:

1. `index.html` aus dem Repository-Hauptverzeichnis ausliefern,
2. den Ordner `data/` unverändert unter `/data/` bereitstellen.

Für Vercel sollte kein Framework über eine Repo-Datei erzwungen werden. Die Projektkonfiguration kann als einfache statische Website / ohne Framework geführt werden.

## Status

**Statischer Prototyp / Version 0.3**

Vor einem echten Schüler-Pilot:

1. Wort-Bild-Platzhalter durch einheitliche Illustrationen ersetzen.
2. Bedienung auf den vorgesehenen Dienstgeräten testen.
3. CSV-Export und lokale Löschfunktion praktisch testen.
4. Pilotdurchläufe durchführen und Items/Schwellenwerte kalibrieren.
