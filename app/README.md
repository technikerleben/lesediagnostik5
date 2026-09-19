# Webapp

Die Webapp ist als Next.js-App-Router-Prototyp umgesetzt.

## Aktueller Funktionsumfang

- selbstständig bedienbarer Start
- Welle / Kompass / Lupe gleichwertig dargestellt
- zufällige Auswahl von Eiche, Ahorn oder Birke pro Durchlauf
- Aufgaben werden aus `data/sets/*.json` geladen
- Antwortreihenfolge wird innerhalb eines Durchlaufs gemischt
- separate Option „Ich weiß es noch nicht“
- Lesetext mit Start-/Fertig-Zeitmessung
- Textverständnis mit sichtbarem Ausgangstext
- Pilot-Auswertung zu Welle / Kompass / Lupe
- optionale Zweitempfehlung
- Strategiekarten-Hinweis
- keine sichtbaren Punkte oder Niveaubegriffe
- dauerhafte Speicherung ausschließlich im lokalen Browserspeicher des Dienstgeräts
- lokale Teilnehmerverwaltung mit Name/Kürzel und optional Klasse
- CSV-Export für Ergebnisübersicht und Itemdaten
- vollständiges lokales Löschen

## Deployment

Vercel kann das Repository direkt aus dem Root deployen.

Framework: **Next.js**

Build command: Standardwert `next build`  
Install command: Standardwert  
Output: Standardwert

Es sind aktuell keine Environment Variables erforderlich.

Die App nutzt `output: "export"` und benötigt keinen Server-Endpunkt für Diagnosedaten.

## Noch nicht für den Schüler-Pilot freigegeben

Die ersten visuellen Worterkennungsitems verwenden derzeit Symbol-Platzhalter. Diese müssen durch einheitliche diagnostische Illustrationen ersetzt werden, bevor daraus belastbare Schülerdaten gewonnen werden.
