# PRIMA

**Wichtiger Hinweis** Drücke F11 für Vollbildmodus, bei **Performanceproblemen einfach das Browserfenster verkleinern**.
 - [Lauffähiges Spiel](https://plojo.github.io/PRIMA/Tower/index.html)
 - [Quellcode](https://github.com/plojo/PRIMA/tree/master/Tower)
 - [Designdokument](https://github.com/plojo/PRIMA/blob/master/Tower/documents/Designdokument.pdf)
 - [Installations- und Bedienungsanleitung](https://github.com/plojo/PRIMA/blob/master/Tower/documents/Anleitung.pdf)

## Hinweis



## Checkliste für Leistungsnachweis
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU

| Nr | Bezeichnung           | Inhalt                                                                                                                                                                                                                                                                         |
|---:|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    | Titel                 | Tower
|    | Name                  | Bilel Spannagel, Jonas Plotzky
|    | Matrikelnummer        | 256661, 256539
|  1 | Nutzerinteraktion     | Steurung erfolgt über die Tastatur: <br> A - Bewgung nach Links <br> D - Bewegung nach Rechts <br> SPACE - Springen/Bestätigen: Die Sprunghöhe kann dadurch beeinflusst werden wie lange die Leertaste gedrückt wird. <br> ESC - Pausiert das Spiel bzw. öffnet das Optionsmenü. <br> W - Navigation nach oben <br> D - Navigation nach unten |
|  2 | Objektinteraktion     | Der Spieler Charakter prüft sich gegen alle Platformen(Tiles) und löst Kollisionen mit ihnen auf (Er wird aus Platformen heruausgeschoben. <br> Die Windböen(Gusts) prüfen ob sie mit dem Spieler kollidieren und solange sie dies tun schieben sie den Spieler mit einem Teil ihrer zurückgelegten Distanz mit sich mit, wenn der Spieler diese wieder verlässt wird ihm ein Teil der Geschwindigkeit der Windböe auf seine eigene Geschwindigkeit addiert. |
|  3 | Objektanzahl variabel | Es werden periodisch Windböen(Gusts) von den plazierten GustSpawnern erzeugt. Nach dem Ablauf ihrer Lebenszeit entfernen sich die Gusts selbständig wieder. (siehe GustSpawner.ts) |
|  4 | Szenenhierarchie      | Der Game-Node wird hinzugefügt: <br> Eine Level-Node, diese enthält die vom LevelGenerator erzeugten Tiles und GustSpawner. Ebenfalls enthält das Level den Background. Die GustSpawner fügen sich die von ihnen gespawnten Gusts als Kinder hinzu damit die Flugrichtung der Gusts durch die Rotation des GustSpawners bestimmt wird. <br> Eine GUI-Node, welche das Menü und die Camera enthält und dem Spieler folgt. <br> Die Player-Node, welche den Spieler Charakter enthält. <br> <br> Dem Player, den Tiles und den Gusts wird eine Collidable-Node (ihre Hitbox, Player erhält zwei) hinzugefügt damit die HitBox unabhängig skaliert werden kann, sich aber gleichzeitig mit der Eltern-Node mitbewegt. <br> Alle Aktoren (Player, Gust) halten sich ihre verschiedenen NodeSprites in einer AnimatedNodeSprite welche sich um das abspielen von Animationen kümmert. <br> Der Menu-Node werden ihre Komponenten als Kinder hinzugefügt damit diese zusammen mit dieser mitbewegt werden. |
|  5 | Sound                 | Sounds werden durch folgenede Aktionen abgespielt: <br> Springen - Beim Absprung wird ein Geräusch erzeugt. <br> Laufen - beim Laufen werden Schrittgeräusche abgespielt genau dann wenn die Füße des Sprites auf dem Boden aufkommen. <br> Menü: Ein Geräusch wird beim bewegen des Cursors abgespielt, ein anderes beim Bestätigen der ausgewählten Aktion. <br> Die Musik startet nach dem der Titlescreen durch aktivieren von "Play" verlassen wurde. Während man sich im Pausenmenü befindet läuft die Musik auf halber Lautstärke. |
|  6 | GUI                   | Im Titlescreen und Pausenmenü lässt sich jeglicher Sound stumm schalten und die Spielgeschwindigkeit auf normal, 0.5x oder 2x setzen. |
|  7 | Externe Daten         | In der level.json lassen sich die Kameragrenzen konfigurieren und verschiedene Level-Bausteine(Platformen, Mauern, Boden, GustSpawner) platzieren. GustSpwaner können hier auch noch konfiguriert werden (SpawnOffset, SpawnInterval, Rotation, Lebensdauer der Gusts, Geschwindigkeit der Gusts) |
|  8 | Verhaltensklassen     | Folgende Verhaltensklassen sind definiert: <br> Character - kapselt die Characterphysik und das Kollisionsverhalten mit Tiles. <br> Background - kümmert sich um den AUfbau des Hintergrunds <br> Audio - Verwaltung von Soundeffekten. <br> AnimatedNodeSPrite - Verwaltung von Spriteanimationen. <br> Collidable - dienen als Hitbox. <br> Gust - Windböen mit eigener Physik, Spielerinteraktion und Animation. <br> GustSüawner - Erzeugung und konfiguration von Gust-Objekten. <br> LevelGenerator - Erzeugung des Levels us der Datei level.json <br> Menu - Titlescreen und Pausescreen zugleich, verwaltet Optionsmöglichkeiten und stellt diese dar. <br> MenuComponent - stellt die einzlenen Menübausteine dar <br> Tile - Definiert die verschiednen Levelbausteine. <br> Actor - abstracte Oberklasse, enthält Animations-Komponente und Sprites. Verwaltet zusätzlich das registrieren der Update-Methoden in der Game-Loop. |
|  9 | Subklassen            | Folgende Klassenhierachie existiert: <br> Charakter, Gust und GustSpawner  erben alle von der abstrakten Klasse Actor. Jede von ihnen enthält eine Update-Methode welche in der Game-Loop registriert wird. Charakter und Gust nutzen zusätlich die AnimatedNodeSprite von Actor. <br> Folgende Klassen erben direkt von Node: Actor, Background, Menu, Collidable, NodeSprite damit sie zu SPielobjekten werden. <br> Folgende Klassen erben von NodeSprite: MenuComponent, Tile damit sie direkt über die Spriteanzeige-Funktionalität verfügen. |
| 10 | Maße & Positionen     | Eine Einheit enspricht genau einem Meter. Der Spielerchrakter ist somit ca. 1,8m groß. Es werden echte physiklaische Einheiten benutzt(m, s, m/s, m/s^2). Die Levelbausteine wurden so gesetzt, dass sich der Spieler nur auf positiven Welt-Koordinaten bewegt. Gusts bewegen sich in bezug auf die lokalen koordinaten der GustSpawner (Beim drehen des Spawners wird richtung von Gust bestimmt) |
| 11 | Event-System          | Die AnimatedNodeSprite-Komponente sendet folgende Events nach oben in die Hierachie: <br> "frameChanged" - wenn sich ihr dargestlltes SpriteFrame geändert hat, Charakter nimmt dieses Event entgegen um die Fußtritt-Sounds im richtigen Moment abzuspielen. <br> "animationFinished" - wenn alle SpriteFrames einer NodeSprite einmal angezeigt wurden (am Ende der Animation), Charakter nimmt dieses Event entgegen um seine Idle Animationen(Fallen/Rumstehen) im Anschluss an einmalige Animationen(Springen) zu starten. Ebenfalls wird hier nach beendigen der Absprunganimation (JumpSquat) der eigentlich Sprung gestartet. |

## Abgabeformat
* Fasse die Konzeption als ein wohlformatiertes Designdokument in PDF zusammen!
* Platziere einen Link in der Readme-Datei deines PRIMA-Repositories auf Github auf die fertige und in Github-Pages lauffähige Anwendung.
* Platziere ebenso Links zu den Stellen in deinem Repository, an denen der Quellcode und das Designdokument zu finden sind.
* Stelle zudem auf diese Art dort auch ein gepacktes Archiv zur Verfügung, welches folgende Daten enthält
  * Das Designdokument 
  * Die Projektordner inklusive aller erforderlichen Dateien, also auch Bild- und Audiodaten
  * Eine kurze Anleitung zur Installation der Anwendung unter Berücksichtigung erforderlicher Dienste (z.B. Heroku, MongoDB etc.) 
  * Eine kurze Anleitung zur Interaktion mit der Anwendung
