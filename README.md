# Lese-Navigator Jahrgang 5

Ein niedrigschwelliger, nicht normierter Förderwegweiser nach dem Übergang in die Sekundarstufe I. Er unterstützt pädagogische Entscheidungen und ersetzt weder Lautlesediagnostik noch die Beobachtung der Lehrkraft. Keine Noten, keine sichtbare Rangfolge der Förderwege.

**Stand:** App **0.7**, Sets Eiche/Ahorn/Birke **0.4**, Regeln **0.3-pilot**, Datenschema **2**.

## Förderwege

| Name | Farbe | Schwerpunkt |
|---|---|---|
| Welle | `#245688` | Lesebasis und begleitendes Lautlesetraining |
| Kompass | `#48DCCB` | Wort-, Satz- und Textverständnis |
| Lupe | `#F0A66F` | Schlussfolgern, Belegen und vertieftes Lesen |

Alle Wege werden gleichwertig dargestellt. Die Kinder sehen keine Punktwerte. Ein Weg ist ein vorläufiger Startpunkt, keine dauerhafte Zuordnung.

## Anschlussförderung / Materialtheke

Die Anschlussförderung wird in `material/` aufgebaut. Sie übersetzt diagnostische Hinweise und Unterrichtsbeobachtungen in konkrete Lernziele und selbstständig nutzbare Übungsformate.

- [Materialtheke und Produktionsworkflow](material/README.md)
- [Materialmatrix](material/materialmatrix.md)
- [Pilot 01 Materialtheke](material/druck/pilot-01/index.html)
- [Sprint-02-Backlog](material/SPRINT-02-BACKLOG.md)
- `data/material-catalog.json`: maschinenlesbarer Status der Materialien

Die Förderwege Welle, Kompass und Lupe bleiben gleichwertige Orientierungspunkte. Materialien werden über **Teilkompetenzen** ausgewählt; eine Hauptempfehlung ist keine dauerhafte Gruppenzuordnung.

## Architektur und Deployment

- `index.html`: statisches HTML mit eingebettetem CSS und Vanilla-JavaScript.
- `data/sets/*.json`: Texte, Aufgaben, Lösungen und Reserveaufgaben.
- `data/scoring/pilot-rules.json`: Maxima, Teilbereiche, Pilotgrenzen, Empfehlungen und Erläuterungen.
- `data/design.json`: Farben und Schriftfamilien mit System-Fallbacks.
- `assets/lesebilder/`: 27 PNG-Bilder, vollständig dekodierbar.
- `docs/`: fachliche Grundlagen, Wartung, Audit und Pilotplan.
- `scripts/`: optionale lokale Wartungsprüfungen; keine Laufzeitabhängigkeiten.

Kein Framework, kein npm, kein Build, kein Backend, keine Datenbank, keine Analytics. Der Host liefert **das Repository-Hauptverzeichnis**, einschließlich `data/` und `assets/`, aus. Die App benötigt HTTPS für die PIN-Kryptografie. Dateien nicht direkt über `file://` öffnen. Gagalin und Glacial Indifference werden verwendet, wenn lokal verfügbar; es werden keine Schriftdateien von Drittservern angefordert.

## Änderungen in 0.7

- Lesebasis wieder aus drei Bildzuordnungen, drei Aufgaben zum genauen Wortunterscheiden und drei Satzergänzungen; weiterhin maximal 9 Punkte.
- Je Set sechs Bildaufgaben als Reserve, ohne Einfluss auf den laufenden Score.
- Mehrdeutige und einige diagnostisch schwache Items überarbeitet; neue IDs für inhaltlich veränderte Aufgaben.
- Antwortpositionen pro Durchlauf und Optionsanzahl ausgewogen verteilt; falsche Antworten mit Fisher-Yates gemischt. Selbstberichte behalten ihre Reihenfolge.
- Kein unmittelbares Wiederholen der letzten beiden abgeschlossenen Parallelformen derselben lokal erkannten Person.
- Auswahl aktualisiert nur Schaltflächen. Textposition bleibt auch bei aufeinanderfolgenden Fragen zum selben Text erhalten.
- Fester Platz für „Weiter“, klare Trennung zwischen Lesematerial und Frage, semantischer Fortschritt, Fokusführung.
- Lehrkraftbereich sperrt beim Start, bei Rückkehr vom Ergebnis und bei Wechsel in den Hintergrund.
- Lokale Teilprofile mit Begründungen, Selbsteinschätzung und vorsichtiger Einordnung der stillen Lesezeit.
- Beschädigte Datensätze werden nicht überschrieben; Rohsicherung möglich. Fehlgeschlagene Ergebnisspeicherung kann auf derselben Seite wiederholt werden.
- CSV-Formelschutz, Durchlauf-IDs und tatsächliche Antwortreihenfolgen im Export.
- Bus ersetzt, Stern-Datenstrom und Schulbild-Abschlussblock repariert.

## Verwendung

1. Lehrkraft öffnet „Für die Lehrkraft“ und legt die Geräte-PIN fest.
2. Kind trägt Kürzel oder Namen und optional Klasse ein.
3. Ungewertetes Bedienbeispiel, anschließend 47 Schritte: 43 gewertete Auswahlaufgaben, ein zeitgemessener Text und drei Selbstberichte.
4. Ergebnis wird ausschließlich im Browser gespeichert. „Fertig“ führt zu einer leeren Eingabemaske.
5. Lehrkraft entsperrt die Verwaltung, betrachtet Teilprofile und exportiert bei Bedarf CSV-Dateien.

**15–20 Minuten sind ein zu prüfendes Ziel**, keine empirisch bestätigte Dauer. Die Lesebasis aus Set 0.3 bestand nur aus Bildaufgaben. Werte aus 0.3 und 0.4 dürfen nicht als unmittelbarer Lernzuwachs verglichen werden. Alte Ergebnisse werden weder neu bewertet noch migriert.

## Datenschutz und Grenzen

Schüleridentitäten, Antworten und Ergebnisse verbleiben in `localStorage`. Keine Übertragung dieser Angaben an Server. Die PIN schützt die Oberfläche, verschlüsselt die Daten aber nicht. Ein Kürzel, das bereits mit derselben Klasse vorkommt, wird derselben lokalen Person zugeordnet; deshalb pro Klasse eindeutige Kürzel verwenden. Exporte und Rohsicherungen enthalten personenbezogene Daten und gehören in geschützte schulische Ablagen, niemals in Git.

Laufende Durchläufe liegen im Arbeitsspeicher. Eine Warnung vor Verlassen der Seite hilft, garantiert aber auf iPadOS keinen Erhalt bei Schließen oder Beenden des Browsers. Kein automatisches Fortsetzen. Bei Wechsel in den Hintergrund wird eine Unterbrechung dokumentiert.

Neutrale Bildlabels verraten keine Lösungen, machen visuelle Aufgaben jedoch nicht nichtvisuell lösbar. Vorlesen von Zielwörtern oder Texten verändert den gemessenen Gegenstand; angepasste Durchführung getrennt dokumentieren.

## Prüfung

Optional lokal, ohne Installation von Paketen:

```sh
node scripts/check.cjs
node scripts/check_materials.cjs
python3 scripts/check_assets.py
```

Der JavaScript-Test führt den tatsächlichen Anwendungscode mit DOM-/Speicher-Testdoubles aus. Er ersetzt keinen Test im Browser. Die PNG-Prüfung kontrolliert CRC, Datenstrom, Scanline-Größe und alle Asset-Verweise.

**Noch ausstehend:** vollständiger Touch-/Safari-Test auf Schul-iPads, einschließlich 1024×768, Texteinstellung/Zoom, Scrollen, Download, Speichervoll- und Unterbrechungsverhalten; danach Schülerpilot. Details: [Audit und Abnahme](docs/08-audit-und-abnahme.md).
