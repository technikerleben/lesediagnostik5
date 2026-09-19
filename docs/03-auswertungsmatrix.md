# Auswertungsmatrix – Pilotversion

> Alle Schwellenwerte sind **Pilotwerte**, keine Normwerte.

## Teilprofile

### A. Lesebasis
Items 1–9, maximal 9 Punkte.

- 7–9: sicher
- 5–6: noch nicht durchgehend sicher
- 0–4: deutlicher Übungsbedarf

### B. Wort- und Satzverständnis
maximal 12 Punkte.

- 9–12: sicher
- 6–8: noch nicht durchgehend sicher
- 0–5: deutlicher Übungsbedarf

### C. Grundlegendes Textverständnis
maximal 8 Punkte.

- 6–8: sicher
- 4–5: noch nicht durchgehend sicher
- 0–3: deutlicher Übungsbedarf

### D. Tiefes Textverständnis
maximal 7 Punkte.

- 5–7: sicher
- 3–4: im Aufbau
- 0–2: nächster Lernschritt

### E. Worterschließung
2 Punkte separat.

### F. Strategiewissen
3 Punkte separat. Beeinflusst die Hauptempfehlung nicht direkt.

## Lesegeschwindigkeit

Es werden Wörter pro Minute berechnet. In Version 0.1 wird **kein fester WPM-Grenzwert** verwendet. Der Wert wird zunächst mit vorhandenen Lautlesedaten und weiteren Schülerdaten kalibriert.

Kontrollfragen:
- 2/2 richtig: Messwert verwendbar
- 1/2 richtig: vorsichtig interpretieren
- 0/2 richtig: Geschwindigkeit nicht für Empfehlung verwenden

## Hauptentscheidung

### 🌊 Welle
Wenn **Lesebasis < 7/9**.

### 🧭 Kompass
Wenn Lesebasis sicher ist, aber mindestens eines gilt:
- Wort-/Satzverständnis < 9/12
- Textverständnis < 6/8

### 🔍 Lupe
Wenn alle drei Voraussetzungen erfüllt sind:
- Lesebasis ≥ 7/9
- Wort-/Satzverständnis ≥ 9/12
- Textverständnis ≥ 6/8

Das tiefe Textverständnis steuert die Auswahl innerhalb des Lupe-Angebots.

## Zweitempfehlungen

### Welle + Kompass
Lesebasis 5–6/9, aber Wort-/Satzverständnis ≥ 9/12 und Textverständnis ≥ 6/8.

### Kompass + Lupe
Ein Regelniveau-Bereich liegt knapp unter der sicheren Grenze, während tiefes Textverständnis stark ausgeprägt ist.

Weitere Kombinationen werden nach Pilotdaten kalibriert.

## Sonderprofile

### Langsamer/unsicherer Lesefluss, gutes Verständnis
Welle als Hauptweg, anspruchsvollere Kompass-/Lupe-Aufgaben als Zusatz. Keine inhaltliche Unterforderung.

### Schnelles Lesen, schwaches Verständnis
Kompass. Schnelligkeit allein führt nicht zu Welle oder Lupe.

### Überall sicher
Lupe mit anspruchsvollerem Material.

## SRL-Selbsteinschätzung

Nicht bepunktet. Große Abweichungen zwischen Selbsteinschätzung und Aufgabenprofil werden als Gesprächsanlass markiert, nicht psychologisch interpretiert.

## Entscheidungsbaum

```
START
  |
  |-- Lesebasis < 7/9?
  |      |-- JA --> 🌊 WELLE
  |      |            \-- gutes Verständnis? --> Zusatzweg
  |      |
  |      \-- NEIN
  |
  |-- Wort/Satz < 9/12 ODER Text < 6/8?
  |      |-- JA --> 🧭 KOMPASS
  |      \-- NEIN --> 🔍 LUPE
  |
  \-- Zusatzprofil:
         Lesetempo
         tiefes Textverständnis
         Worterschließung
         Strategiewissen
         Selbsteinschätzung
```
