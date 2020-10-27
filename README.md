# Projekt: GameHub

GameHub bietet User/innen die Möglichkeit, neue Spiele zu entdecken, Spiele zu bewerten und ihre Erfahrungen mit anderen Nutzern zu teilen. Dabei können auch die Reviews anderer Nutzer/innen bewertet werden. Desweiteren spielt das Sammeln bzw. Kategorisieren von Spielen in beliebig vielen sogenannten "Catalogs" eine wichtige Rolle. Diese ermöglichen beispielsweise das Sammlen von Lieblingsspielen.
Die Anwendung wurde auf der Basis von Webtechnologien primär für **mobile Geräte** in Form einer **App** entwickelt.
Im Prinzip ist es möglich, die Web-Anwendung über den Smartphone Browser zum Homescreen hinzuzufügen, um unsere Anwendung im vollen Umfang zu entdecken. In einem nächsten Schritt wäre aber auch eine Konvertierung in eine richtige App (apk/ipa) denkbar, z.B. mit [Apache Cordova](https://cordova.apache.org/ "Apache Cordova").

Unsere Anwendung ist jederzeit unter [diesem Link](https://homepages.ur.de/~gol59231/mme/app/ "GameHub") verfügbar.

Wir haben einen Admin-Account eingerichtet, mit dem alle Games/Reviews gelöscht werden können, empfehlen aber auch das Anlegen eines neuen Accounts über den Registrierungs-Dialog.

**E-Mail:** admin@gol59231.org

**Password:** "gol59231"

## Team / Arbeitsumgebung

Unser Team hat früh mit der Entwicklung der Anwendung begonnen, sodass wir uns 3 Wochen lang vor der Corona-Krise noch in Präsenzform jeden Tag treffen konnten. Dadurch hatten wir auch immer einen guten Überblick darüber, woran der jeweils andere gerade gearbeitet hat.

In der Zeit danach haben wir über Discord kommuniziert, um Bugs zu fixen, Features zu vervollständigen und um die Codequalität zu optimieren. Auch den Hauptteil der documentation wurde dann angefertigt.

#### Mitglieder

Profilbild|Name | E-Mail | GitHub Username | Hauptverantwortung
-------- |-------- | -------- | -------- | --------
![imageview](https://avatars3.githubusercontent.com/u/53035057?s=60&v=4)|Lukas Goclik   | Lukas.Goclik@stud.uni-regensburg.de   | @Lukas-glc | GameView Ansicht
![imageview](https://avatars2.githubusercontent.com/u/44339207?s=60&v=4)|Nils Constantin Hellwig   | Nils-Constantin.Hellwig@stud.uni-regensburg.de   | @NilsHellwig | Authorisierungsprozess, Catalogs
![imageview](https://avatars0.githubusercontent.com/u/52962919?s=60&v=4)|Thilo Hohl   | Thilo.Hohl@stud.uni-regensburg.de   | @thiilo | Review Ansicht, Profil


## Setup und Testing

>Im Starterpaket ist ein einfacher Webserver vorgegeben, mit dem Sie die Inhalte des Ordners `/app` statisch ausliefern können. Benutzen Sie diesen, um Ihre Anwendung zu entwickeln und zu testen. Sollten Sie zu Realisierung Ihrer Anwendung eine komplexere Serverkomponente benötigen, können Sie die vorhandenen Dateien (`index.js` und `lib/AppServer.js`) als Ausgangslage für eigene Erweiterungen nutzten. Speichern Sie alle weiteren, serverseitig verwendeten Dateien im Verzeichnis `/lib` ab.
>
>So nutzen Sie den vorgegebenen Server:
>
>1. Führen Sie **einmalig** den Befehl `npm install` aus, um die notwendigen Abhängigkeiten (`express`) zu installieren.
>
>2. Führen Sie den Befehl `npm start` aus um die Anwendung zu starten. Der Inhalt des `/app`-Verzeichnis ist anschließend über die die >Adresse `http://localhost:8000/app` erreichbar.

Beim Testen ist es außerdem sehr empfehlenswert, im Browser auf die **mobile Ansicht** zu wechseln. Unser Team hat primär die Ansicht eines **iPhone X** verwendet (siehe Bild). Wir haben außerdem zum Testen primär Chrome genutzt.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/mobile_view.png" width="20%">
</p>
<br>
<br>
<br>

### Automatisches Bauen der Anwendung [Für unsere Anwendung irrelevant]

>Unter Umständen müssen oder wollen Sie vor dem Ausführen bzw. Bereitstellen Ihrer Anwendung bestimmte Optimierungsvorgänge durchführen (z.B. mehrere Javascript-Dateien zu einer zusammenfügen oder Grafikdateien für die Verwendung im Browser anpassen). Versuchen Sie diese Schritte mithilfe entsprechende *Node.js*-Module zu lösen und implementieren Sie die Automatisierung in der Datei `build.js`. Sie können diese Datei über den Befehl `npm run build` starten. Dabei wird vor dem Ausführen der Datei der Javascript-Code unter `app/resources/js/` auf Fehler und Warnungen (*eslint*) geprüft. Der automatisierte Bau der Software startet nur dann, wenn Ihr Code fehlerfrei ist.

## Beschreibung

### UI, Funktionalität & Usability

Wird die Webanwendung das erste Mal geöffnet (ohne, dass man bereits eingeloggt ist), wird der/die Nutzer/in mit einem Popup begrüßt, um ihnen grundlegend GameHub zu erklären. Schiebt der/die Nutzer/in dann durch Wischen das Popup weg, erwartet sie der Login-Screen.

<p align="center"><img src="/docs/media/documentation/gif/intro.gif" width="20%"></center>
<br>
<br>
<br>
Wenn die Login-Daten nicht korrekt sind (z.B. falsches Passwort), erscheint ein Hinweistext. Dieser hilft den Nutzer/innen, den Fehler zu korrigieren.
<br>
<br>
<br>
<p align="center"><img src="/docs/media/documentation/gif/login_wrong_password.gif" width="20%"></center>
<br>
<br>
<br>

Alternativ besteht auch die Möglichkeit, einen neuen Account anzulegen. Auch hier wird den Nutzer/innen anhand von **Hinweistexten** geholfen, sollten die Eingaben nicht **valide** sein.

<br>
<br>
<br>
<p align="center"><img src="/docs/media/documentation/gif/login_and_register.gif" width="20%"></center>
<br>
<br>
<br>

Nachdem der/die Nutzer/in erfolgreich einen Account angelegt hat, wird das **Main-UI** geladen.

<br>
<br>
<br>
<p align="center"><img src="/docs/media/documentation/gif/register_new_account.gif" width="20%"></center>
<br>
<br>
<br>

Das Main-UI besteht aus **4 Hauptseiten**:

**1. Reviews:** Alle von Nutzer/innen verfassten Reviews zu Spielen aus der Datenbank.

**2. Catalogs:** Die Nutzer/innen können Spiele zu sogenannten **Catalogs** hinzufügen.

**3. Games:** Alle Spiele, die es in der Datenbank gibt.

**4. Profile:** Kleine Statistiken, ein Log-Out-Button und ein Button, um zu den Einstellungen zu gelangen.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/your-reviews.png" width="20%">
  <img src="/docs/media/documentation/img/your-catalogs.png" width="20%">
  <img src="/docs/media/documentation/img/all-games.png" width="20%">
  <img src="/docs/media/documentation/img/your-statistics.png" width="20%">
</p>
<br>
<br>
<br>

Im **Review-Tab** können die eigenen Reviews gelesen und gelöscht werden. Wird ein Review gelöscht, so wird die Anwendung neu geladen, da das Löschen eines Reviews einen großen Einfluss auf die Seiten Reviews, Games und Profile hat.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/gif/review_page.gif" width="20%">
  <img src="/docs/media/documentation/gif/delete_review.gif" width="20%">
</center>
<br>
<br>
<br>


Jede/r Nutzer/in besitzt den *Catalog* **My Games**. In diesem *Catalog* ist immer **jedes** Spiel, was in **irgendeinem** sonstigen eigens erstellten Catalog ist.

Dennoch ist es möglich, auch ein Spiel nur zu **My Games** hinzuzufügen.

Wird ein Spiel aus **My Games** gelöscht, so wird es auch aus allen anderen Catalogs gelöscht. Wird hingegen aus einem von Nutzer/innen angelegten Catalog ein Spiel gelöscht, so bleibt das Spiel in **My Games**.  
Dazu wird einfach auf dem Listenelement des Spiels nach rechts gewischt, um es aus dem Catalog zu löschen.

Die von Nutzer/innen angelegten Catalogs können auch gelöscht werden.

Im Prinzip ist es möglich, zweimal den Catalog mit dem selben Namen zu erstellen, da jeder Catalog eine individuelle Id in der Realtime Database besitzt.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/gif/delete_game_from_all_catalogs.gif" width="20%">
  <img src="/docs/media/documentation/gif/delete_game_from_regular_catalog.gif" width="20%">
  <img src="/docs/media/documentation/gif/delete_catalog.gif" width="20%">
  <img src="/docs/media/documentation/gif/add_new_catalog.gif" width="20%">
</center>
<br>
<br>
<br>

Im **Game-Tab** sind alle Spiele aus der Datenbank zu finden. Die Nutzer/innen können durch einfaches Scrollen durch diese stöbern. Anhand der Suchzeile in der Toolbar kann außerdem nach Spielen gesucht werden. Klickt der/die Nutzer/in auf das `+` in der Toolbar, so öffnet sich ein Fenster zum Hinzufügen eines neuen Spiels. Wenn die Eingaben korrekt sind und der/die Nutzer/in auf `Add Game` klickt, dann erscheint ein Ladesymbol (gif), das so lange angezeigt wird, bis das Spiel erfolgreich inklusive Bild in der Datenbank gespeichert ist.

Die **Einzelansicht** eines Spiels öffnet sich, sobald der/die Nutzer/in entweder im **Game-Tab** oder im **Catalog-Tab** auf das Listenelement eines Spiels klickt.

Klickt der/die Nutzer/in auf die **Card**, werden Ihnen Daten zu dem Spiel angezeigt, beispielsweise die Durchschnittsbewertung, die aus den Bewertungen der Reviews (1-5) errechnet wird. In der Einzelansicht des Spiels kann außerdem ein Spiel zu einem Catalog hinzugefügt werden. Dafür öffnet sich ein Sheet, welches alle Catalogs des/der eingeloggten Nutzer/in in einer Liste anzeigt, zu denen dann Spiele hinzugefügt werden können.  

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/gif/search_for_game.gif" width="20%">
  <img src="/docs/media/documentation/img/create-games.png" width="20%">
  <img src="/docs/media/documentation/gif/single_game.gif" width="20%">
  <img src="/docs/media/documentation/img/add-game-to-catalog.png" width="20%">
</center>
<br>
<br>
<br>

Klickt der/die Nutzer/in auf `Write Review`, so kann eine Review verfasst werden. Die Größe des Input-Feldes für die Beschreibung des Reviews passt sich der Größe des eingegebenen Textes an. Sollte eine Eingabe fehlen, so wird der/die Nutzer/in mit einer Notification darüber informiert.
Hat der/die Nutzer/in bereits ein Review verfasst, öffnet sich kein Sheet zum Verfassen eines neuen Reviews. Der/die Nutzer/in wird jedoch durch eine Notification darüber informiert, dass bereits ein Review zu dem geöffneten Spiel verfasst wurde.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/write-review.png" width="20%">
  <img src="/docs/media/documentation/gif/already_written_a_review.gif" width="20%">
</center>
<br>
<br>
<br>

Der **Profil-Tab** zeigt den Nutzer/innen einige Statistiken wie die durchschnittliche Bewertung von Spielen an. Außerdem werden die besten Bewertungen des/der Eingeloggten mit den zugehörigen Spielen angezeigt. Klickt man auf das `Einstellungen-Icon` in der **Nav-Bar**, so gelangt der/die Nutzer/in zu den Einstellungen. Hier kann der/die Nutzer/in zum einen seine/ihre Einstellung für die Rolle betrachten und zum anderen auch das Theme der App anpassen. Auch der Nutzername kann durch ein einfaches Klicken auf das `Stift-Icon` geändert werden.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/your-statistics.png" width="20%">
  <img src="/docs/media/documentation/gif/darkmode.gif" width="20%">
</center>
<br>
<br>
<br>

### Layout: [Framework7](https://www.framework7.io "Framework7 - Offizielle Website")

Da wir früh zu dem Entschluss kamen, dass unsere Anwendung primär für **mobile Geräte** wie Smartphones und Tablets konzipiert werden soll, waren wir auf der Suche nach einem Framework, dass uns einige **vorgefertige Layouts** und **Designs** für diesen Anwendungsfall bereitstellt.

Framework7 bietet für jedes Element des GUI ein passendes Layout und vorgefertigte Funktionalitäten wie z.B. Toggle-Switches.
Auch passt sich das Design der Anwendung an das Betriebssystem des Nutzers individuell an.

Einzelne **HTML Elemente** bzw. Templates, die dann möglicherweise in das **Main UI** (index.html) geladen werden sollen, haben wir meist anhand des [Request Libarys von Framework7](https://framework7.io/docs/media/documentation/request.html "Framework7 - Request Libary") gefetcht.

### Datenbank: [Firebase](https://www.firebase.google.com/ "Firebase by Google - Offizielle Website")

Zum einen haben wir die Realtime Database von Firebase zur Speicherung von Strings, Booleans und Integern verwendet.

Des Weiteren haben wir den Firebase Storage zur Speicherung von Bildern genutzt. Bilder werden im .jpg-Format gespeichert. Insgesamt besteht die Datenbank aus drei Teilen. In allen drei Objekten befinden sich jeweils weitere Objekte (User Accounts, Reviews, Games), mit individuellen Keys.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/database.png" width="30%">
</center>
<br>
<br>
<br>

Jede/r registrierte Nutzer/in bekommt automatisch ein Objekt in der Datenbank mit den persönlichen Daten, die auch nur von dieser Person bearbeitet werden können (in den rules definiert).

Neben allgemeinen Daten wie dem *username* oder dem *dayOfJoining* werden außerdem im Nutzerprofil auch Referenzen gespeichert. So werden beispielsweise die Ids der Reviews, die der/die Nutzer/in verfasst hat, in der **Profil-Datenbank** gespeichert.
Wenn man die Reviews des eingeloggten Nutzers laden möchte, muss dann nicht durch alle Reviews in der Datenbank iterieren werden. Es wird lediglich durch die Reviews mit einer **Referenz** im Profil iteriert. In einer **Instanz** in der **users-Datenbank** werden außerdem auch die **Catalogs** der/des eingeloggten Nutzers/in gespeichert.

Bei Erstellen eines Accounts wird automatisch auch der **Catalog** **"My Games"** erstellt. Dieser kann nicht von Nutzer/innen im UI gelöscht werden, besitzt aber ebenfalls wie alle individuell erstellten Catalogs ein Objekt mit allen GameIds (Spiele, die sich in diesem **Catalog** befinden), dem **Erstellungsdatum** und einem **Namen** des Catalogs.

<br>
<br>
<div align="center">
  <img src="/docs/media/documentation/img/user_database.png" width="20%">
</div>
<br>
<br>

Dieses Prinzip des Speicherns von Referenzen haben wir auch in den anderen beiden Objekten (Reviews und Games) praktiziert, um nicht immer alle Daten aufeinmal fetchen zu müssen. So werden beispielsweise in der Game-Database auch die Ids der Nutzer/innen gespeichert, die das Spiel in irgendeinem ihrer Catalogs haben oder alle Ids der Reviews, die für das Game verfasst wurden.

<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/game_database.png" width="40%">
</center>
<br>
<br>

Letztlich gibt es noch Objekte für alle **Reviews**. Neben den individuellen Daten wie *dayOfCreation*, der *Id* des Games, für das das Review verfasst wurde oder dem *ranking* (1-5), werden auch die Ids der Nutzer/innen gespeichert, die dieser Review entweder einen upvote oder downvote gegeben haben (true=upvote, false=downvote).

<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/review_database.png" width="40%">
</center>
<br>
<br>

Bilder werden anhand der Firestore Storages persistiert.

<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/firebase_storage.png" width="80%">
</center>
<br>
<br>

```
/gamehub-c16d6.appspot.com/images/games
```
Wichtig dabei ist die Wahl des Dateinamens. Möchte man also für ein Spiel ein Bild speichern, so wird das Bild mit folgendem Dateinamen gespeichert.

```
[gameId]_[userId des/der Eingeloggten].jpg
```

Sei beispielsweise:

```
gameId: -M3jiOZrX8x8XZ2BABhq
userId: iy0ZoUMC02e4VFIx06K7sYcp7Su2
```

Dann wird die Datei mit folgedem Dateinamen gespeichert:

```
-M3jiOZrX8x8XZ2BABhq_iy0ZoUMC02e4VFIx06K7sYcp7Su2.jpg

```

Falls das Spiel irgendwann gelöscht werden soll, wird in den Rules des Firebase Storages überprüft, ob das Bild des/der Nutzer/in erzeugt wurde, indem die userId im Dateinamen getestet wird (regulärer Ausdruck). 

<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/img/firebase_storage_rules.png" width="50%">
</center>
<br>
<br>

### Wichtige Informationen zu den Dateipfaden

Das Hauptverzeichnis der Anwendung befindet sich im `/app` Ordner. 

Vorgegebene Skripte sowie Stylesheets von Framework7 befinden sich in dem Ordner `/framework7` sowie die Initialisierung von Icons von Framework7 in `/css/icons.css`. Ein paar Definitionen, die nicht im Standard Libary von Framework7 enthalten waren, haben wir zusätzlich enfalls in den Ordner `/css` gepackt (`/app.css`).

Templates für einzelene Elemente, die zur Runtime benötigt werden, befinden sich in dem Ordner `/templates`. Diese haben wir individuell gestaltet anhand von [Kitchen Sink](https://framework7.io/docs/kitchen-sink.html "Framework7 - Kitchen Sink"), einem Libary von Framework7 zur Gestaltung von HTML Elementen.  

Bilder, die für das Introduction-Popup benötigt werden, befinden sich in dem Ordner `/assets/introduction-images` und von Framework7 vorgegebene Schriftarten sind in `/fonts`.

Die Javascript-Dateien zur Umsetzung der Hauptfunktionalität unserer Anwendung befindet sich in dem Ordner `/js`.
Dieser enthält neben der `/app.js` Datei vier vorgegebene Ordner für unterschiedliche Funktionalitäten. 
Den Prozess der Authorisierung haben wir von der restlichen Initialisierung des Main-UI strikt getrennt.

### Bugs/Probleme

1. Scrollen im GameTab funktioniert in Firefox(rechts) nur bedingt. Es ist nicht möglich richtig bis zum Ende des Tabs zu Scrollen. In Chrome(siehe links) / bei mobilen Geräten gibt es dieses Problem nicht.

<br>
<br>
<br>
<p align="center">
  <img src="/docs/media/documentation/gif/chrome-working-game-tab.gif" width="20%">
  <img src="/docs/media/documentation/gif/firefox-not-working-game-tab.gif" width="20%">
</center>
<br>
<br>
<br>

### Informationen zur abgegebenen Datenbank

Die Datenbank wurde bereits mit einigen Beispielen gefüllt, damit man sich die Anwendung in der Praxis besser vorstellen kann. Sollte es Probleme geben, können wir jederzeit die Datenbank auf den Zustand am Tag der Abgabe zurücksetzen, dafür bitte einfach eine E-Mail/Issue an das Entwicklerteam senden. Die Beispiele in der Datenbank sind alle fiktiv. Die Bilder wurden entweder selbst mit GIMP designt oder anhand von Bildern von den Internetseiten Pixabay / Pexels. Die Beschreibungen wurden größtenteils mit [DeepAI (Text Generator)](https://deepai.org/machine-learning-model/text-generator "DeepAI - Text Generator") generiert.

Spielname | Bildquelle
---|---
Super Plumber | Grafik selbst erstellt
Racing Sim 3000 | https://www.pexels.com/de-de/foto/abend-asphalt-autobahn-baume-373248/
Mystic Warlords | https://www.pexels.com/de-de/foto/fantasie-giftpilze-hd-wallpaper-insekten-326055/
Clash of Men | https://www.pexels.com/de-de/foto/angriff-armee-attacke-bewaffnet-2514316/
Perry Schotter | https://www.pexels.com/de-de/foto/100-bank-banknoten-bitcoin-730547/
Mac Man Classic | https://www.pexels.com/de-de/foto/arkade-ausla-nder-backstein-backsteinmauer-1670977/
Regular-Man | https://www.pexels.com/de-de/foto/anstellung-arbeit-arbeitsbereich-arbeitsplatz-6972/
Finecraft (Java Edition) | https://pixabay.com/illustrations/computer-game-minecraft-house-wheat-2873192/#
Call of Honor (alle drei) | https://www.pexels.com/de-de/foto/action-aktion-armee-bewaffnung-163347/
Kazoo Hero | https://pixabay.com/vectors/music-toy-wind-instrument-kazoo-41933/
The Secret of Donkey Island | https://www.pexels.com/de-de/foto/ausserorts-bauernhof-baum-baume-1120104/
Trees vs. Zombies | https://pixabay.com/photos/lost-hell-limbo-night-dark-forest-474124/
Just Lance | https://pixabay.com/de/photos/ritter-ritterspiele-lanze-pferd-2837796/, https://www.pexels.com/de-de/foto/ausserorts-bauernhof-baum-baume-1120104/
Poodle Jump | https://pixabay.com/vectors/yellow-dog-pet-animal-mammal-48484/, https://pixabay.com/illustrations/retro-background-the-consignment-4237850/
Corona Defense 1504 | https://www.pexels.com/de-de/foto/licht-kunst-malerei-safe-3957982/
Tomb Twix | https://pixabay.com/photos/angkor-temple-cambodia-wat-siem-2438222/
Master Blaster | https://www.pexels.com/de-de/foto/bewaffnet-draussen-gewehr-krieg-der-sterne-1437218/
Big Car Theft VI | https://pixabay.com/photos/car-burglary-thief-burglar-1590508/
Age of Vampires | https://pixabay.com/de/vectors/flederm%C3%A4use-burg-b%C3%B6se-fliegen-2027875/
Dedris | Grafik selbst erstellt
Indiana Bones | https://pixabay.com/photos/cowboy-horse-riding-water-ocean-757575/
Assassin's Greed | https://pixabay.com/photos/trees-average-age-killers-4929310/
Super Clash Bros | https://www.pexels.com/de-de/foto/abbildung-actionfiguren-bunt-charakter-163036/
