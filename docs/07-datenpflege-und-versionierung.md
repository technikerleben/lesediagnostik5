# Datenpflege – Lese-Navigator

## Grundsatz

Die fachlichen Inhalte des Lese-Navigators werden möglichst vollständig im Ordner `data/` gepflegt.

`index.html` enthält die allgemeine Programmlogik und sollte für normale fachliche Änderungen nicht bearbeitet werden müssen.

## 1. Aufgaben und Texte

Dateien:

```
data/sets/eiche.json
data/sets/ahorn.json
data/sets/birke.json
```

Hier werden gepflegt:

- Aufgabenstellungen
- Antwortoptionen
- richtige Antworten
- Kompetenzcodes
- Auswertungsbereiche
- Lesetexte
- Wortzahl der Lesetexte
- Parallelform
- Versionsnummer des Aufgabensatzes

### Stabile Item-IDs

Bestehende Item-IDs sollen nicht wiederverwendet werden, wenn sich die diagnostische Bedeutung einer Aufgabe wesentlich ändert.

Beispiel:

```
eiche-14
```

Wird nur ein Tippfehler korrigiert, kann die ID bleiben.

Wird die Aufgabe inhaltlich ersetzt, sollte eine neue ID bzw. eine dokumentierte neue Set-Version verwendet werden.

## 2. Auswertungslogik

Datei:

```
data/scoring/pilot-rules.json
```

Diese Datei ist die **verbindliche Quelle** für:

- sichere / noch unsichere Bereiche
- Schwellenwerte
- Hauptempfehlung Welle / Kompass / Lupe
- Zweitempfehlungen
- Strategietipp
- spätere Regeln zur Lesegeschwindigkeit

Die App liest `primaryLogic`, `secondaryLogic` und `strategyHint` direkt aus dieser Datei.

### Beispiel

```json
{
  "when": {
    "reading_base": {
      "lt": 7
    }
  },
  "recommend": "wave"
}
```

Unterstützte Vergleichsoperatoren:

- `lt` = kleiner als
- `lte` = kleiner oder gleich
- `gt` = größer als
- `gte` = größer oder gleich
- `eq` = genau gleich

Mit `any` können alternative Bedingungen formuliert werden.

## 3. Design

Datei:

```
data/design.json
```

Die App übernimmt daraus aktuell:

- Hintergrundfarbe
- Textfarbe
- helle Flächenfarbe
- Blau der Welle
- Türkis des Kompasses
- Orange der Lupe
- Grundschriftfamilie

Die drei Förderwege bleiben für Kinder gleichwertig dargestellt.

## 4. Versionierung

Jeder gespeicherte Diagnosedurchlauf erhält automatisch:

- `appVersion`
- `setVersion`
- `rulesVersion`

Diese Angaben werden auch in beide CSV-Exporte geschrieben.

Dadurch bleibt später nachvollziehbar, mit welcher Aufgaben- und Auswertungsfassung ein Ergebnis entstanden ist.

### Aufgabensatz-Version erhöhen

In jeder Parallelform:

```json
"version": "0.2"
```

Die Versionsnummer sollte erhöht werden, wenn:

- Aufgaben ersetzt werden,
- diagnostische Anforderungen verändert werden,
- Texte deutlich überarbeitet werden,
- Items ergänzt oder entfernt werden.

Reine Tippfehlerkorrekturen müssen nicht zwingend eine neue Version erzeugen.

### Regeln-Version erhöhen

In:

```
data/scoring/pilot-rules.json
```

Beispiel:

```json
"version": "0.2-pilot"
```

Erhöhen bei:

- neuen Schwellenwerten
- geänderter Empfehlungslogik
- neuer Gewichtung
- Einbeziehung der Lesegeschwindigkeit
- Änderungen an Zweitempfehlungen

## 5. Vor jeder Pilotphase prüfen

1. Alle drei JSON-Sets sind syntaktisch gültig.
2. Jede auswertbare Aufgabe hat eine `correctOption`.
3. Jede gewertete Aufgabe hat einen `scoreKey`.
4. Jede Aufgabe besitzt eine eindeutige Item-ID.
5. Lesetext und hinterlegte `wordCount` stimmen überein.
6. Parallelformen bleiben ungefähr vergleichbar.
7. `pilot-rules.json` enthält für alle erwartbaren Profile eine Hauptempfehlung.
8. Versionsnummern wurden bei inhaltlichen Änderungen angepasst.

## 6. CSV-Daten

### Ergebnisübersicht

Jeder Durchlauf enthält unter anderem:

- Person/Kürzel
- Klasse
- Zeitpunkt
- Parallelform
- Aufgabensatz-Version
- Auswertungsregeln-Version
- App-Version
- Teilbereichswerte
- Wörter pro Minute
- Empfehlung

### Itemdaten

Zusätzlich pro Aufgabe:

- Item-ID
- Antwort
- Kompetenz
- Auswertungsbereich
- richtig/falsch

Damit können Pilotdaten später auch dann ausgewertet werden, wenn sich die App inzwischen weiterentwickelt hat.

## 7. Was nicht in das Repository gehört

Nie committen:

- Schülernamen
- Schülerkürzel mit Personenbezug
- einzelne Diagnoseergebnisse
- exportierte CSV-Dateien mit Schülerdaten
- Browser-Speicherstände

Das Repository enthält ausschließlich App-Code, fachliche Daten und Dokumentation.
