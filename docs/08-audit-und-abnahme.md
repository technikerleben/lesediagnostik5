# Audit, Änderungen und Abnahme – App 0.7

Ausgangsstand: `59c67608e23daa8a6c55f73e1b93530b9fb095c2`, geprüft am 19.09.2026. Auftrag: diagnostische Plausibilität, Nutzbarkeit für schwache Leser, ruhiges UI, Wartbarkeit und Robustheit; statische Architektur erhalten.

## Behobene Befunde

| Ausgangsbefund | Umsetzung |
|---|---|
| Neun Bilditems verdrängten zwei Lesebasis-Komponenten | 3+3+3-Modell, Teilprofile, neue IDs, Reservepool |
| Unausgewogene Hash-Sortierung | ausgewogene Zielpositionen plus Fisher-Yates |
| Widersprüchliche Zusatzempfehlung | jeweils anderer Grundbereich muss Grenze erreichen |
| Lupe als Fallback bei ungültigen Scores | kein automatischer Weg; Prüfhinweis |
| Lehrkraftbereich blieb nach Durchlauf offen | Sperre beim Start, Reset und Tabwechsel |
| Gesamte Ansicht bei jeder Auswahl ersetzt | Auswahlzustand direkt ändern, Fokus und Textposition erhalten |
| Beweglicher Weiter-Knopf | feste Bestätigungsfläche, zunächst deaktiviert |
| Kontext und Frage als gemeinsamer Textblock | eigenes `stimulus`-Feld und eigener Darstellungsbereich |
| Unkommentierte stille Lesezeit | Kontrollfragen, Unterbrechung, Rohzeit und Einordnung zusammen |
| Stiller Verlust beschädigter Speicherinhalte | strikte Prüfung, Originaldaten erhalten, Rohsicherung |
| CSV-Formeleingaben | neutralisieren und weiterhin korrekt quotieren |
| Defekte Bus-/Stern-/Schul-PNGs | Bus ersetzt, andere Dateien verlustfrei technisch repariert |
| Widersprüchliche Dokumentation | aktuelle Fassungen; historisches Konzept klar markiert |

## Automatisiert geprüft

- JavaScript-Syntax und vollständige Datenverträge aller drei Sets.
- 1.170 Hauptempfehlungskombinationen, Grenzfälle und fehlerhafte Profile.
- Ausgewogene Positionen aller Sets für jeweils 1.000 Seeds.
- Synthetische vollständige Durchläufe aller Sets einschließlich Beispiel, Auswahl, Bestätigung, Zeittext, Selbstbericht, Ergebnis und Speicherung.
- Kein DOM-Austausch bei Auswahl; Übernahme der Textscrollposition bei Folgefragen.
- PIN-Prüfung, automatische Sperre, Export-/Löschguards.
- Nullwerte für unbekannte Antworten, Formrotation, unterbrochene Zeitmessung.
- Fehlgeschlagene Speicherung mit einmaliger, erfolgreicher Wiederholung.
- Beide CSV-Strukturen, Formel-/HTML-Maskierung, alte Ergebnisse, beschädigter Speicher und Löschen.
- 27 PNGs: Chunk-Längen, CRC, vollständiger zlib-Datenstrom, Scanline-Größe, Asset-Verweise.

**Grenze:** Die Funktionstests verwenden den tatsächlichen Anwendungscode mit DOM-/Speicher-Testdoubles. Keine Browser-Engine, keine Behauptung eines bestandenen Safari-Tests. Der verfügbare Cloud-Browser konnte die lokale Vorschau nicht öffnen.

## Noch durchzuführende Geräteabnahme

- iPad Safari im Querformat nahe 1024×768: alle Aufgabentypen, Scrollen, sichtbarer Weiter-Knopf, Bildschirmtastatur.
- Kleinere Displays und vergrößerte Schrift: kein horizontaler Verlust von Antwortkarten/Text.
- VoiceOver/Tastatur: Fokuswechsel und Fortschritt; visuelle Items brauchen eine gesonderte zugängliche Diagnostik.
- PNG-Darstellung aller Antwortoptionen, besonders Bus und Stern.
- PIN, CSV-Downloads, Speicherfehler und erneutes Speichern im echten Browser.
- Unterbrechung/Tabwechsel und Betriebssystem-Beenden: keine Fortsetzung oder Datensicherheit behaupten.

## Pilotfreigabe

Technisch geprüfte Überarbeitung, noch kein empirisch validiertes Verfahren. Erst Geräteabnahme, dann kleiner heterogener Schülerpilot. Zeitbedarf, notwendige Hilfen, Distraktoren, Formunterschiede und Übereinstimmung mit Lautlesediagnostik dokumentieren. Pilotgrenzen nicht als Normen oder stabile Fähigkeitsgruppen ausgeben.
