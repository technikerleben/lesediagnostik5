# Bildassets – Reparatur 0.7

Alle 27 PNG-Dateien liegen unter `assets/lesebilder/`. CSS zeigt sie gleich groß und proportional an. Kein beschreibender Alt-Text in den Antwortkarten, um die Lösung nicht vorwegzunehmen; diese Aufgaben sind daher nicht nichtvisuell zugänglich.

## Bus

`assets/lesebilder/bus.png` wurde mit dem eingebauten Bildgenerierungswerkzeug neu erzeugt, weil sowohl die letzte RGBA-Fassung als auch die vorherige Palette-Datei unvollständige Bilddaten enthielten. Das vollständige generierte PNG bleibt als Projektasset erhalten. Es wird proportional in derselben Antwortkarte wie die übrigen Bilder dargestellt.

Prompt:

> Create one square educational word-picture asset: a single clearly recognizable yellow bus, full vehicle with two visible wheels and windows, slight three-quarter side view, centered and entirely inside the frame with comfortable margins. Simple clean colorful clipart with brown/dark outlines and gentle flat shading, consistent with primary-school vocabulary illustrations, no face, no people, no text or letters, no logos, no extra objects. Transparent background. This is a replacement bus PNG for a German reading diagnostic webapp; it must remain recognizable when displayed at 128x128 pixels.

## Stern und Schule

Stern: Der vollständige rohe Deflate-Datenstrom enthielt alle 65.664 Scanline-Bytes. Diese wurden unverändert neu in einen korrekten zlib-/PNG-Container geschrieben. Keine Bildinhalte ergänzt oder abgeschnitten.

Schule: Der fehlerhafte letzte Chunk wurde durch einen korrekten leeren `IEND`-Chunk ersetzt. Die Bilddaten bleiben unverändert.

## Wartung

`python3 scripts/check_assets.py` prüft alle Dateien und Referenzen. Ein HTTP-Status 200 oder `naturalWidth > 0` genügt nicht: Ein Browser kann bei beschädigten PNGs ein unvollständiges Bild anzeigen. Ergänzend ist eine visuelle Geräteprüfung erforderlich.
