# Lese-Navigator Jahrgang 5

Digitaler Förderwegweiser für die Leseförderung direkt nach dem Übergang in die Sekundarstufe I.

## Förderwege

| Symbol | Farbe | Kindername | interne Funktion |
|---|---|---|---|
| 🌊 | Blau `#245688` | Welle | Mindestniveau: Lesebasis und Leseflüssigkeit |
| 🧭 | Türkisgrün `#48DCCB` | Kompass | Regelniveau: Wort-, Satz- und Textverständnis |
| 🔍 | Orange `#F0A66F` | Lupe | Expertenniveau: Schlussfolgern, Belegen, anspruchsvolles Lesen |

Die Kinder sehen **keine Niveau-Bezeichnungen**, keine Zahlen-/Buchstabenstufen und keine Rangfolge. Alle drei Wege werden gleich groß und gleichwertig dargestellt.

## Prinzip

Der Navigator ist ein **Förderwegweiser und kein normierter diagnostischer Test**.

Er erfasst ohne freie Texteingaben:
- Worterkennung und Lesegenauigkeit
- Wortschatz
- Satzverständnis
- Lesegeschwindigkeit
- grundlegendes Textverständnis
- Schlussfolgern und Belegen
- Strategiewissen
- Selbsteinschätzung

## SRL-Zyklus

`herausfinden → Ziel wählen → üben → überprüfen → neu entscheiden`

## Technischer Stand

Die Webapp ist als Next.js-App-Router-Anwendung angelegt und kann über Vercel aus dem Repository-Root deployt werden.

- Next.js 16.3.3
- React 19.3.0
- keine Anmeldung
- Name oder Kürzel und optional Klasse werden ausschließlich lokal im Browser gespeichert
- Diagnoseergebnisse werden ausschließlich lokal im Browser gespeichert
- keine serverseitige Speicherung oder Diagnose-API
- lokaler CSV-Export für Ergebnisübersicht und Itemdaten
- drei zufällig ausgewählte Parallelformen
- Lesetempo wird lokal während des Durchlaufs gemessen
- Pilot-Auswertung erfolgt im Browser

## Repository-Struktur

```
app/
  Navigator.js
  globals.css
  layout.js
  page.js

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
```

## Status

**Technischer Prototyp / Version 0.1**

### Jetzt möglich
- Deployment auf Vercel
- technischer Test auf Laptop/iPad/Desktop
- Durchlauf der drei Parallelformen
- Prüfung der Navigation, Zeitmessung und Ergebnislogik

### Vor einem echten Schüler-Pilot
1. Platzhalter der Wort-Bild-Aufgaben durch einheitliche Illustrationen ersetzen.
2. vollständigen Durchlauf auf Bedienbarkeit prüfen.
3. erste Lehrkraftansicht ergänzen.
4. Pilotprotokoll für anonyme Itemdaten festlegen.
5. erst danach Kalibrierung mit Schülerinnen und Schülern.

## Datenschutz und lokale Verarbeitung

Die App wird statisch ausgeliefert. Schüleridentitäten und Diagnoseergebnisse werden ausschließlich in `localStorage` des verwendeten Browsers gespeichert.

Es gibt keine Diagnose-API und keine Datenbank. Die App überträgt diese Daten weder an GitHub noch an Vercel. Für die schulinterne Weiterverarbeitung können Ergebnisübersichten und Itemdaten lokal als CSV exportiert werden.

Details: `docs/06-datenschutz-lokaler-speicher.md`
