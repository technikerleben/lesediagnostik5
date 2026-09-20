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

Die Anwendung besteht ausschließlich aus statischem HTML, CSS, JavaScript und JSON. Vercel veröffentlicht die statischen Dateien aus dem Repository-Hauptverzeichnis einschließlich `data/` und `assets/`.

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

## Lehrkraft-PIN

Die lokale Datenverwaltung (Anzahl gespeicherter Datensätze, CSV-Export und Löschen) ist durch eine **gerätebezogene Lehrkraft-PIN** geschützt.

- Die PIN besteht aus 4 bis 10 Ziffern.
- Die PIN selbst wird nicht gespeichert.
- Im Browser wird nur ein mit PBKDF2/SHA-256 abgeleiteter Prüfwert mit zufälligem Salt gespeichert.
- Vor dem ersten Diagnosedurchlauf muss die Lehrkraft eine PIN eingerichtet haben.
- Die PIN schützt die Bedienoberfläche vor unbefugtem Zugriff.

Die PIN verschlüsselt die Diagnosewerte in `localStorage` **nicht**. Der Schutz des Geräts und Browserprofils bleibt daher wesentlich.

## Sicherheitsgrenzen

`localStorage` ist lokaler Browserspeicher, aber kein verschlüsselter Datentresor.

Daraus folgen für den Einsatz:

- Gerät durch schulische Anmeldung/Geräteschutz absichern.
- Browserprofil nicht gemeinsam mit unberechtigten Personen nutzen.
- CSV-Exporte ausschließlich in dafür vorgesehenen geschützten schulischen Speicherorten ablegen.
- Nach Gerätewechsel oder Browserbereinigung vorher benötigte Daten exportieren.
- Keine Diagnoseergebnisse in das GitHub-Repository committen.

## Rechtliche Einordnung

Die statische Architektur vermeidet die Übertragung der vom Lese-Navigator erzeugten personenbezogenen Diagnosedaten an externe Anwendungsdienste. Ob der konkrete schulische Einsatz alle lokalen schul-, datenschutz- und dienstrechtlichen Anforderungen erfüllt, ist unabhängig davon nach den Vorgaben des Schulträgers bzw. der zuständigen Datenschutzverantwortlichen zu beurteilen.

## Ergänzungen ab App 0.7

- Geräte-PIN sperrt beim Schülerstart, beim Rückweg zur Startseite und beim Wechsel in den Hintergrund. Exporte und Löschhandler prüfen zusätzlich den Entsperrstatus.
- Neue Durchläufe speichern Datenformat 2, drei Lesebasis-Teilwerte, Optionsreihenfolgen, Durchlaufdauer und Unterbrechungshinweise. Alte Datensätze bleiben unverändert.
- Beschädigte Speicherinhalte werden nicht als leere Datenbestände behandelt. Start/Export können dann gesperrt sein. Eine entsperrte Lehrkraft kann die Originalzeichenfolgen als JSON-Rohsicherung herunterladen; der PIN-Prüfwert wird nicht exportiert. Es gibt keinen automatischen Import dieser Sicherung.
- Misslingt die Ergebnisspeicherung, bleibt das Ergebnis im Arbeitsspeicher erhalten. Die Seite meldet dies und bietet Wiederholen an. Nicht schließen! Beim Verlust des Tabs ist das ungesicherte Ergebnis verloren.
- Ein laufender Durchlauf wird nicht fortlaufend gespeichert. Eine Warnung beim Verlassen ist browserabhängig und garantiert auf iPadOS keine Wiederherstellung.
- CSV-Felder mit möglichem Formelanfang werden mit einem Apostroph neutralisiert. Exporte bleiben lokal und enthalten weiterhin personenbezogene Daten.
- Nach „Fertig“ sind Name/Kürzel und Klasse in der Eingabemaske leer.
- Löschen entfernt Teilnehmer und Durchläufe; die Geräte-PIN bleibt absichtlich erhalten. Zum vollständigen Gerätewechsel können die Website-Daten im Browser entfernt werden.
