# Datenpflege und Versionierung

## Verbindliche Quellen

- Aufgaben: `data/sets/eiche.json`, `ahorn.json`, `birke.json` – Version 0.4, Schema 2.
- Regeln: `data/scoring/pilot-rules.json` – Version 0.3-pilot, Schema 2.
- Design: `data/design.json`.
- Anwendung: `index.html` – App 0.7.

Die App prüft beim Laden IDs, Typen, Optionen, Lösungsschlüssel, Punktmaxima, Lesebasis-Komponenten und Wortzahlen. Empfehlungsregeln müssen für alle zulässigen grundlegenden Score-Kombinationen genau einen Hauptweg liefern. Alle Bilddateien werden vor dem Start geladen.

## Aufgabenfelder

- `id`: eindeutige, versionsübergreifend nachvollziehbare ID.
- `type`: `visual_choice`, `choice`, `timed_reading` oder `self_report`.
- `stimulus` (optional): gesondert dargestelltes Zielwort oder Kontextsatz.
- `prompt`: kurze eigentliche Frage/Anweisung.
- `scoreKey`, `competency`, `options`, `correctOption`: für gewertete Auswahlaufgaben erforderlich.
- `section.passage`: bei Textaufgaben dauerhaft sichtbarer Text.
- `text`, `wordCount`: nur für den zeitgemessenen Text; Wortzahl anhand Leerraumtrennung.
- `reserveItems`: nicht angezeigter, nicht gewerteter Aufgabenpool. Keine zufällige Einmischung ohne neue Konzeption/Versionierung.

Bei deutlicher Inhalts-/Kompetenzänderung neue ID vergeben. Beispiele: `eiche-base-v04-04`, `birke-18-v04`. Kleine Darstellungsaufteilungen können die ID behalten, werden aber über die Set-Version sichtbar. Änderungen am gemeinsamen Passage-Text können alle abhängigen Items betreffen.

## Regeln

`scoreKeys` enthält Labels und Maxima. `readingBaseComponents` definiert die drei Teilbereiche. `primaryLogic`, `secondaryLogic`, `strategyHint` und deren Texte sind datengetrieben. Vergleichsoperatoren: `lt`, `lte`, `gt`, `gte`, `eq`; `any` gruppiert Alternativen. Unbekannte Operatoren oder Bereiche sind Fehler, keine stillschweigenden Treffer.

Score-Zählung bleibt ein Punkt je richtiger Antwort; Selbstberichte werden nicht gewertet. Gewichte erfordern eine ausdrücklich geplante Modelländerung. `fluency.checkInterpretation` und `checkLabels` steuern die vorsichtige Tempo-Einordnung; keine WPM-Schwellen.

## Versionen und alte Ergebnisse

Jeder Durchlauf enthält `appVersion`, `setVersion`, `rulesVersion`, `schemaVersion`, eine eindeutige Durchlauf-ID und Zeitstempel. Regeln bei Auswertungsänderungen erhöhen, Sets bei Inhaltsänderungen erhöhen, App bei Verhaltensänderungen erhöhen. Ein Versionssprung garantiert keine Vergleichbarkeit.

Alte lokale Ergebnisse werden nicht neu berechnet. Vor App-Updates keine Speicherkeys löschen/umbenennen. Prüfungen müssen historische Ergebnisse und beschädigte Speicherinhalte abdecken.

## Exporte

Ergebnis-CSV enthält zusätzlich Lesebasis-Teilwerte, Tempo-Einordnung, Gesamtdauer, Unterbrechungen und Durchlauf-ID. Item-CSV enthält Antwortreihenfolge und Durchlauf-ID. Historische Snapshots von Kürzel/Name und Klasse haben Vorrang vor später veränderten Teilnehmerdaten. Nicht erhobene Zusatzdaten bleiben leer. Rohsicherung enthält originale JSON-Zeichenfolgen und keinen PIN-Prüfwert.

## Wartungsprüfung

```sh
node scripts/check.cjs
python3 scripts/check_assets.py
```

Beide Skripte laufen ohne Paketinstallation. Node ist ausschließlich optionales Wartungswerkzeug; die App benötigt weiterhin weder Node noch einen Build. Funktionstests verwenden synthetische Daten und einen DOM-/Speicher-Testdouble. Echte Layout-, Touch- und Safari-Tests bleiben erforderlich.

Nie Schülerdaten, lokale Speicherstände, Exporte oder personenbezogene Screenshots committen. Auch Test-Fixtures ausschließlich synthetisch erzeugen.
