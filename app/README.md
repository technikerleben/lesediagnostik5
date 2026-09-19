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
- keine dauerhafte Datenspeicherung

## Deployment

Vercel kann das Repository direkt aus dem Root deployen.

Framework: **Next.js**

Build command: Standardwert `next build`  
Install command: Standardwert  
Output: Standardwert

Es sind aktuell keine Environment Variables erforderlich.

## Noch nicht für den Schüler-Pilot freigegeben

Die ersten visuellen Worterkennungsitems verwenden derzeit Symbol-Platzhalter. Diese müssen durch einheitliche diagnostische Illustrationen ersetzt werden, bevor daraus belastbare Schülerdaten gewonnen werden.
