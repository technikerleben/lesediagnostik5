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

Aus den Teilprofilen entsteht eine Hauptempfehlung und bei passenden Profilen ein zweiter Förderweg.

## SRL-Zyklus

`herausfinden → Ziel wählen → üben → überprüfen → neu entscheiden`

## Repository-Struktur

```
docs/
  01-kompetenzraster.md
  02-diagnostischer-bauplan.md
  03-auswertungsmatrix.md
  04-aufgabenpool-v0.1.md

data/
  design.json
  README.md

app/
  README.md
```

Später enthält `app/` die über Vercel deployte Webapp. Die diagnostischen Inhalte sollen möglichst datengetrieben aus `data/` geladen werden, damit Aufgaben und Auswertungsregeln unabhängig von der Oberfläche gepflegt werden können.

## Status

**Konzeptphase / Version 0.1**

Nächste Schritte:
1. Parallelformen Eiche / Ahorn / Birke auf Vergleichbarkeit prüfen.
2. Aufgabenpool in maschinenlesbare JSON-Dateien überführen.
3. klickbaren Web-Prototyp bauen.
4. Pilotdurchlauf mit wenigen Schülerinnen und Schülern.
5. Schwellenwerte und Items anhand echter Daten kalibrieren.
