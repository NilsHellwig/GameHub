# Meine Spiele - Kommentar

Die Anwendung "Meine Spiele" (GameHub) wurde als mobile Anwendung entwickelt, bei der es vor allem um das Einholen anderer Meinungen zu Spielen geht. Auch das Sammeln und Kategorisieren von Spielen wird jedem/r Nutzer/in individuell ermöglicht. Das Gestalten einer möglichst angenehmen User Experience bei dem Entdecken/Sammeln neuer Spiele war eines unserer Hauptanliegen.

## Features - Tatsächliche Umsätzung

Ein paar Features wurden anders als zuerst vorgesehen implementiert.

| Feature | Beschreibung | 
|---------|--------------|
| **Spiele bewerten** | Die Bewertung erfolgt über ein ***Punktesystem*** (statt ursprünglich ein Sternesystem) und einen Text. Es wurde die **automatische Generierung** von Statistiken auf der Profilseite implementiert, wobei eine sogenannte [Gauge](https://choosealicense.com/licenses/mit/) verwendet wurde, bei der sich schließlich eine Punkteskala zwischen 1-5 etabliert hat. Das Hinzufügen eines Bildes bei einem Review wurde nicht implementiert, da dies zum Einen zu einer noch größeren Datenmenge im Firebase Storage geführt hätte und zum Anderen, weil die Implementierung den Umfang der Anwendung nochmals deutlich vergößert hätte. Es müsste zusätzlich ein UI zum Betrachten und Hochladen der Bilder funktional umgesetzt werden. Desweiteren wäre die Speicherung zwar ähnlich, wie bei der Persistierung von Bildern für die Games, man müsste jedoch auch den Security-Aspekt im Firebase Storage beachten, dass nur sowohl der/die Verfasser/in des Reviews, als auch der/die Ersteller/in des jeweiligen Spiels das Review löschen darf.|
|**Spiele hinzufügen - optional**| Spiele Hinzufügen wurde, auch wenn wir es als "optional" gekennzeichnet haben, **vollständig** implementiert. Der Ersteller eines Games darf die Reviews zu diesem löschen. Desweiteren wurde ein Admin-Account implementiert. Dadurch kann zusätzlich dafür gesorgt werden, dass unzulässige Bewertungen (Spam) gelöscht werden können. Bewertungen werden nicht automatisch gelöscht, nach einer bestimmten Anzahl an Downvotes. Dafür müsste die Firebase-Datenbank Infrastruktur in der Lage sein, bei einer bestimmten Anzahl an vote-children mit *value = **false*** das Review zu löschen. Es wäre sicherheitstechnisch nicht vernünftig, jedem/r eingeloggten Nutzer/in das Recht zu geben, alle Reviews zu löschen. Diese Funktionalität müsste von Seite der Datenbank ermöglicht werden.| 

