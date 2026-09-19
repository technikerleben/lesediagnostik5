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

assets/
  lesebilder/
    27 PNG-Dateien für die Wort-Bild-Aufgaben

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
  07-datenpflege-und-versionierung.md
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

## Daten als Source of Truth

- Aufgaben und Texte: `data/sets/*.json`
- Schwellen und Empfehlungslogik: `data/scoring/pilot-rules.json`
- Farben und Grunddesign: `data/design.json`

Die Auswertungslogik in `index.html` enthält keine fest verdrahteten Schwellenwerte mehr.

Details: `docs/07-datenpflege-und-versionierung.md`

## Status

**Statischer Prototyp / App-Version 0.6**

Aktueller fachlicher Stand:

- Eiche: Set-Version **0.3**
- Ahorn: Set-Version **0.3**
- Birke: Set-Version **0.3**
- alle drei Parallelformen enthalten jeweils **9 echte Wort-Bild-Aufgaben**
- insgesamt **27 einheitliche PNG-Lesebilder** unter `assets/lesebilder/`
- die Bildaufgaben werden direkt aus den JSON-Sets geladen
- die Empfehlungslogik wird aus `data/scoring/pilot-rules.json` gelesen
- Diagnosedurchläufe werden ausschließlich lokal im Browser gespeichert
- Ergebnis- und Itemdaten können als CSV exportiert werden

Die Implementierungsphase des aktuellen Prototyps ist damit abgeschlossen.

## Schüleroberfläche 0.6

Die Schüleransicht wurde für schwächere Leserinnen und Leser und für die Nutzung auf dem **iPad im Querformat** vereinfacht.

Grundregeln der Oberfläche:

- pro Bildschirm nur die Informationen, die für die aktuelle Aufgabe benötigt werden
- Fortschrittsbalken bleibt sichtbar
- keine Navigations-, Lehrkraft- oder Technikhinweise während der Aufgaben
- Beispiele sind durch eine eigene mintfarbene **„Beispiel“**-Kennzeichnung klar von echten Aufgaben getrennt
- echte Aufgaben tragen eine blaue **„Aufgabe“**-Kennzeichnung
- Lesetexte werden bei Textverständnis-Aufgaben in einer eigenen **„Text“**-Fläche dargestellt
- auf dem iPad im Querformat stehen Text und Frage nebeneinander
- große Schrift, großzügige Abstände und große Touch-Flächen
- Bildantworten werden als drei große gleichwertige Karten dargestellt
- eine Antwort wird zuerst markiert und erst mit **„Weiter“** bestätigt, damit versehentliche Berührungen nicht sofort weiterführen
- bei Wort-Bild-Aufgaben verrät die barrierefreie Beschriftung nicht die richtige Lösung

### Nächster Projektabschnitt: technischer Test und Pilotierung

Vor einem breiteren Einsatz mit Schülerinnen und Schülern:

1. Bedienung auf den vorgesehenen Schulgeräten und Browsern testen.
2. Prüfen, ob alle 27 Bildassets zuverlässig geladen werden.
3. CSV-Export, lokale Speicherung und Löschfunktion praktisch testen.
4. Einen kleinen Pilot mit unterschiedlich starken Leserinnen und Lesern durchführen.
5. Bearbeitungszeit, Aufgabenverständnis und Passung der Förderempfehlungen auswerten.
6. Empfehlungen mit vorhandenen Lautlesedaten bzw. pädagogischen Einschätzungen vergleichen.
7. Erst danach Itemschwierigkeiten, Schwellenwerte und ggf. die Parallelformen kalibrieren.

Die aktuellen Schwellenwerte sind ausdrücklich **Pilotwerte und keine Normwerte**.
