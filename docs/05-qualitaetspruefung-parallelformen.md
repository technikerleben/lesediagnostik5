# Qualitätsprüfung der Parallelformen – Version 0.1 → 0.3

## Ziel

Eiche, Ahorn und Birke sollen bei wiederholter Nutzung des Lese-Navigators möglichst vergleichbar sein. Geprüft wurden:

- Textlänge
- durchschnittliche und maximale Satzlänge
- Wortlänge / auffällig lange Wörter
- Wiederholungseffekte zwischen Items
- Mehrdeutigkeiten
- Vergleichbarkeit der Distraktoren
- thematische und sprachliche Schwierigkeit

Die Prüfung ersetzt keine empirische Kalibrierung. Sie reduziert zunächst offensichtliche Konstruktionsfehler.

## 1. Leseflüssigkeit

### Ausgangsversion

| Set | Wörter | Sätze | Ø Wörter/Satz | längster Satz |
|---|---:|---:|---:|---:|
| Eiche | 130 | 14 | 9,3 | 16 |
| Ahorn | 127 | 11 | 11,5 | 15 |
| Birke | 121 | 13 | 9,3 | 15 |

### Befund

- Eiche ist als Referenz gut geeignet.
- Ahorn hat deutlich längere durchschnittliche Sätze.
- Birke ist rund 7 % kürzer als Eiche.
- Die mittlere Wortlänge ist in allen drei Texten sehr ähnlich.

### Revision

**Eiche bleibt unverändert.**

**Ahorn wird auf 128 Wörter und 12 Sätze angepasst.** Ein längerer Satz wird geteilt.

Revidierter Ahorn-Text:

> Nach dem Unterricht ging Ben mit seinem Freund Sami zur Bushaltestelle. Dort bemerkten sie auf der Bank ein kleines Portemonnaie. Ben wollte es zuerst aufheben. Sami schlug aber vor, gemeinsam nach einem Namen zu suchen. Im Inneren fanden sie eine Fahrkarte, etwas Kleingeld und einen Ausweis. Der Name auf dem Ausweis gehörte einer Frau aus der Nachbarschaft. Die beiden gingen nicht einfach zu ihrer Adresse, sondern brachten das Portemonnaie zur nahen Polizeiwache. Eine Polizistin nahm es entgegen und schrieb auf, wo es gefunden worden war. Am nächsten Tag erzählte Bens Mutter, dass die Besitzerin sich sehr gefreut habe. Sie hatte ihr Portemonnaie schon überall gesucht. Ben und Sami waren zufrieden, weil sie richtig gehandelt hatten. Später bedankte sich die Besitzerin über die Polizei bei den beiden aufmerksamen Findern.

Kennwerte: **128 Wörter · 12 Sätze · Ø 10,7 Wörter/Satz · max. 15 Wörter/Satz**

**Birke wird auf 128 Wörter ergänzt.**

Zusätzlicher Satz nach der Beschreibung der Katze:

> Die beiden beobachteten sie einen Moment lang.

Kennwerte danach: **128 Wörter · 14 Sätze · Ø 9,1 Wörter/Satz · max. 15 Wörter/Satz**

### Ergebnis

Die Leseflusstexte liegen damit bei **128–130 Wörtern**. Der WPM-Wert wird weiterhin anhand der exakten Wortzahl des jeweiligen Textes berechnet.

---

## 2. Textverständnis

### Ausgangsversion

| Set | Wörter | Sätze | Ø Wörter/Satz | längster Satz |
|---|---:|---:|---:|---:|
| Eiche | 157 | 14 | 11,2 | 16 |
| Ahorn | 154 | 13 | 11,8 | 24 |
| Birke | 147 | 13 | 11,3 | 17 |

### Befund

Die Gesamtlängen sind ausreichend nah beieinander. Problematisch war vor allem ein **24 Wörter langer Satz in Ahorn**.

### Revision Ahorn

Der Abschnitt mit den Symbolen wird geteilt:

> Drei Schülerinnen überlegten sich deshalb ein einfaches System. Auf jedes Regalbrett klebten sie ein Symbol. Eine Feder stand für kurze, leicht verständliche Texte. Ein Blatt stand für längere Geschichten und eine Lupe für Sachbücher. Die Bücher selbst bekamen keine Bewertung.

Danach:

**156 Wörter · 15 Sätze · Ø 10,4 Wörter/Satz · max. 16 Wörter/Satz**

### Thematische Schwierigkeit

Eiche verlangt etwas stärker kausales Denken, weil ein kleiner Versuch beschrieben wird. Ahorn und Birke folgen stärker einem Problem-Lösung-Ablauf.

Entscheidung für den Piloten:

- Eiche bleibt erhalten.
- Die Aufgabenstruktur bleibt in allen Sets identisch.
- Die Set-Zuweisung wird zufällig bzw. rotierend vorgenommen.
- Nach Pilotdaten wird geprüft, ob Eiche systematisch schlechtere Trefferquoten erzeugt.

---

## 3. Wiederholungseffekt im Wortschatz

### Problem

Im Eiche-Set wurde **„erschöpft“** zunächst als direkte Wortbedeutung und kurz danach erneut als Kontextwort abgefragt.

Damit könnte die erste Aufgabe die zweite Antwort vorbereiten.

### Revision

Das Kontextitem wird ersetzt.

Neu:

> Der schwere Karton ließ sich nur **mühsam** tragen. Nila musste mehrfach absetzen und brauchte lange bis zur Tür.

Was bedeutet **mühsam** hier?

- mit großer Anstrengung ✅
- besonders leise
- ohne nachzudenken

Damit werden direkte Wortkenntnis und kontextuelles Erschließen wieder getrennt.

---

## 4. Wort-Bild-Aufgaben

### Revision 0.3

Die früheren Platzhalter wurden vollständig durch echte, einheitlich gestaltete PNG-Illustrationen ersetzt.

Jede Parallelform enthält jetzt **9 Wort-Bild-Aufgaben**:

- **Eiche:** Ball, Haus, Fisch, Bus, Buch, Hund, Schuh, Apfel, Fahrrad
- **Ahorn:** Maus, Baum, Brot, Tasse, Uhr, Vogel, Jacke, Banane, Fenster
- **Birke:** Stern, Mond, Blume, Teller, Kerze, Gabel, Schere, Tomate, Schule

Die 27 Bildassets liegen unter:

```
assets/lesebilder/
```

Die JSON-Sets referenzieren die Bilder über `asset`-Felder. Die App lädt diese Assets direkt in den Wort-Bild-Aufgaben.

### Qualitätsregeln

- ausschließlich konkrete, eindeutig benennbare Gegenstände
- pro Aufgabe klar unterscheidbare Bildoptionen
- einheitlicher Illustrationsstil
- keine Beschriftung im Bild
- transparente Hintergründe
- gleiche visuelle Größe und Gewichtung der Optionen
- die Bildpositionen werden wie die übrigen Antwortoptionen in der App gemischt

Die früheren Überlegungen zu Oberbegriffen wie „Werkzeug“ sind damit überholt.

---

## 5. Genaues Wortlesen

### Qualitätsregel

Die Distraktoren sollen sich nur in **einem kleinen, leserelevanten Merkmal** unterscheiden. Keine Option darf durch auffällige Zeichensetzung oder offensichtlich unsinnige Form herausstechen.

Für Birke Item 6 wird verbindlich:

Zielwort: **finden**

- binden
- finden ✅
- fingen

Die frühere Arbeitsnotiz „finden?“ entfällt vollständig.

---

## 6. Pronomen- und Bezugsitems

### Problem

Pronomenaufgaben können unbeabsichtigt mehrdeutig werden.

### Verbindliche Fassungen

**Eiche**

> Jonas lieh Paul sein Fahrrad. Paul brachte **es** am Abend zurück.

Was bedeutet **es**?  
→ das Fahrrad

**Ahorn**

> Mira legte das Buch in ihren Rucksack. Später holte sie **es** wieder heraus.

→ das Buch

**Birke**

> Amir stellte den Becher auf den Tisch. Kurz danach nahm er **ihn** wieder weg.

→ den Becher

Für das zweite Bezugsitem werden ebenfalls nur eindeutig auflösbare Sätze verwendet:

**Eiche**

> Lina bekam eine neue Tasche geschenkt und zeigte sie ihrer Schwester. Lina freute sich sehr darüber.

Frage: Wer freute sich?  
→ Lina

**Ahorn**

> Bens Vater nahm die Zeitung und begann sofort darin zu lesen.

Frage: Wer begann zu lesen?  
→ Bens Vater

**Birke**

> Nora gab Elif den Schlüssel. Elif steckte ihn in ihre Tasche.

Frage: Wer steckte den Schlüssel ein?  
→ Elif

---

## 7. Distraktoren

### Verbindliche Regeln für Version 0.2

1. Alle Optionen müssen grammatisch zur Frage passen.
2. Keine falsche Antwort darf allein durch ungewöhnliche Länge auffallen.
3. Keine Scherzantworten.
4. Bei Bedeutungsfragen müssen die falschen Optionen grundsätzlich denkbar sein.
5. Die richtige Antwortposition wird in der App **nicht aus der Quelldatei übernommen**, sondern ausgewogen gemischt.
6. „Ich weiß es noch nicht“ steht getrennt von den Inhaltsoptionen und wird nie zufällig einsortiert.

---

## 8. Ergebnis der Qualitätsprüfung

### Freigegeben für die Überführung in JSON

- Grundstruktur der drei Parallelformen
- Lesebasis-Logik
- Wortschatzbereiche nach Entfernung des Wiederholungseffekts
- Satzverständnis nach Bereinigung der Bezugsitems
- Leseflusstexte nach Längenangleichung
- Textverständnistexte nach Satzlängenangleichung
- Worterschließung
- Strategiewissen
- Selbsteinschätzung

### Noch empirisch zu prüfen

- tatsächliche Itemschwierigkeit
- Gleichwertigkeit der drei Textverständnistexte
- Eignung einzelner Distraktoren
- Bearbeitungszeiten
- Zusammenhang zwischen digitaler Lesegeschwindigkeit und Lautlesetest
- Pilot-Schwellenwerte der Auswertungsmatrix

## Aktueller Umsetzungsstand

Die freigegebenen Inhalte sind vollständig in maschinenlesbare Dateien überführt:

```
data/
  sets/
    eiche.json
    ahorn.json
    birke.json
  scoring/
    pilot-rules.json
```

Aktuell gilt:

- alle drei Sets: Version **0.3**
- App: Version **0.5**
- je Parallelform 9 Wort-Bild-Aufgaben
- insgesamt 27 Bildassets
- stabile Item-IDs und Kompetenzcodes
- Auswertungslogik datengetrieben über `pilot-rules.json`
- lokale Speicherung und CSV-Export implementiert

## Nächster Workflow-Schritt

Der nächste Schritt ist **nicht mehr die technische Grundimplementierung**, sondern die praktische Erprobung:

1. technischer Funktionstest auf den vorgesehenen Schulgeräten
2. kleiner Schüler-Pilot
3. Prüfung der Bearbeitungszeit
4. Vergleich der Förderempfehlungen mit Lautlesetest und pädagogischer Einschätzung
5. Analyse auffälliger Items und Distraktoren
6. anschließende Kalibrierung der Pilot-Schwellenwerte und ggf. einzelner Parallelformen

Die aktuelle Fassung ist damit ein **einsatzfähiger Pilotprototyp**, aber noch kein normiertes diagnostisches Verfahren.
