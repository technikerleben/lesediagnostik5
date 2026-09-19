# Datenschutz- und Speicherarchitektur – lokale Verarbeitung

## Grundprinzip

Die App verarbeitet **Schüleridentitäten und Diagnoseergebnisse ausschließlich im Browser des verwendeten Geräts**.

Es gibt für diese Daten:

- keine Server-API,
- keine Datenbank,
- keinen Cloud-Speicher,
- keine Übertragung an GitHub,
- keine Übertragung an Vercel,
- keine Analytics- oder Tracking-Schnittstelle.

Die Next.js-App wird mit `output: "export"` als statische Website gebaut. Vercel stellt nur die statischen App-Dateien bereit.

> Hinweis: Der Hosting-Anbieter kann technisch übliche Zugriffs-/Infrastrukturdaten zum Aufruf der Website verarbeiten. Die vom Lese-Navigator erzeugten Identitäten und Diagnoseergebnisse werden von der App jedoch nicht an den Hosting-Anbieter gesendet.

## Lokaler Speicher

Die App verwendet `localStorage`.

Schlüssel:

```
lesediagnostik5:v1:participants
lesediagnostik5:v1:runs
```

### Teilnehmerdaten

Gespeichert werden lokal:

- interne zufällige ID
- Name oder Kürzel
- Klasse (optional)
- Zeitpunkt der lokalen Anlage

### Diagnosedurchlauf

Gespeichert werden lokal:

- Teilnehmer-ID
- Name/Kürzel als Snapshot
- Klasse als Snapshot
- Zeitpunkt
- verwendete Parallelform
- Versionsnummer des Aufgabensatzes
- Teilbereichswerte
- Lesegeschwindigkeit
- Lesezeit
- Antworten pro Item
- Kompetenzcode pro Item
- richtig/falsch pro auswertbarem Item
- Hauptempfehlung
- Zweitempfehlung
- Strategiewissen

## CSV-Export

Es gibt zwei lokale Exporte.

### Ergebnisübersicht

Eine Zeile pro Durchlauf mit:

- Name/Kürzel
- Klasse
- Zeitpunkt
- Parallelform
- Teilbereichswerten
- Wörter pro Minute
- Empfehlung
- Anzahl „Ich weiß es noch nicht“

### Itemdaten

Eine Zeile pro beantwortetem Item mit:

- Teilnehmer
- Zeitpunkt
- Parallelform
- Item-ID
- Antwort
- Kompetenz
- Auswertungsbereich
- richtig/falsch

Die CSV-Dateien werden direkt im Browser erzeugt und heruntergeladen. Es findet dabei kein Upload statt.

Für deutschsprachige Tabellenprogramme wird Semikolon als Trennzeichen und UTF-8 mit BOM verwendet.

## Löschen

Über **Lokale Datenverwaltung – Lehrkraft** können sämtliche von der App gespeicherten Teilnehmer- und Diagnosedaten aus `localStorage` gelöscht werden.

Das Löschen von Browser-/Website-Daten durch das Betriebssystem oder den Browser löscht die Daten ebenfalls.

## Sicherheitsgrenzen

`localStorage` ist lokaler Browserspeicher, aber kein verschlüsselter Datentresor.

Daraus folgen für den Einsatz:

- Gerät durch schulische Anmeldung/Geräteschutz absichern.
- Browserprofil nicht gemeinsam mit unberechtigten Personen nutzen.
- CSV-Exporte ausschließlich in dafür vorgesehenen geschützten schulischen Speicherorten ablegen.
- Nach Gerätewechsel oder Browserbereinigung vorher benötigte Daten exportieren.
- Keine Diagnoseergebnisse in das GitHub-Repository committen.

## Rechtliche Einordnung

Die Architektur minimiert die Übertragung personenbezogener Diagnosedaten an externe Dienste. Ob der konkrete schulische Einsatz alle lokalen schul-, datenschutz- und dienstrechtlichen Anforderungen erfüllt, ist unabhängig davon nach den Vorgaben des Schulträgers bzw. der zuständigen Datenschutzverantwortlichen zu beurteilen.
