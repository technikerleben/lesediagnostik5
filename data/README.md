# Datenbereich

Dieser Ordner wird die maschinenlesbaren Inhalte des Lese-Navigators enthalten.

Geplante Struktur:

```
data/
  design.json
  config.json
  sets/
    eiche.json
    ahorn.json
    birke.json
  scoring/
    pilot-rules.json
```

## Prinzip

Die Webapp soll Aufgaben, Parallelformen und Auswertungsregeln soweit sinnvoll **datengetrieben** laden. Dadurch können Items nach Pilotdurchläufen angepasst werden, ohne die gesamte Oberfläche umzubauen.

Es werden **keine personenbezogenen Schülerdaten in diesem Repository gespeichert**.

Falls spätere Pilotdaten gespeichert werden sollen, wird vorher ein separates Datenschutz- und Speicherkonzept festgelegt.
