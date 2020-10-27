# Meine Spiele

Erste Planung vom 29. Januar 2020. Tatsächliche Umsetzung/Features siehe README.md

## Features

| Feature | Beschreibung | Priorität | Geschätzter Aufwand | Betroffene Schichten |
|---------|--------------|-----------|--------------------|---------------------|
| **Profil anlegen und speichern** | Nutzer können beim initialen Start der Anwendung ein Nutzerprofil erstellen, in dem ihr echter Name und möglicherweise ein perönlicher Nutzername vergeben werden kann. Auf dem Profil sind die Bewertungen eines Nutzers sichtbar, seine Spielelisten (je nach Einstellung) sichtbar und einige Statistiken (Lieblingsspiel, durchschnittliche Bewertung etc.)| hoch (kritisch) | 1 Tag | UI, Datenbank, Javascript |
| **Profil editieren** | Nutzer können ihren Nutzernamen ändern. Nutzer erhalten Feedback über das Ergebnis der einzelnen Bearbeitungen und deren Speicherung. | mittel (unkritisch) | 0.5 Tage | UI, Datenbank, Javascript |
| **Spiele bewerten** | Nutzer können jedes Spiel auf der Plattform bewerten und so zu ihrer Spieleliste hinzuzufügen. Die Bewertung erfolgt über ein Sternesystem und einen Text. Optional können Screenshots mit Bildbeschreibungen hinzugefügt werden. Die Bewertungsaktivität ist sowohl auf der Spieleseite als auch auf der Userseite einsehbar.| hoch (kritisch) | 2 Tage | UI, Datenbank, Javascript |
| **Eigene Listen erstellen und pflegen** | Nutzer können ihre Spiele auf ihrem Profil sortieren und kategorisieren (Beispielsweise Liste der Lieblingsspiel, Unterteilung nach Kategorien) | mittel | 1 Tag | UI, Datenbank, Javascript |
|**Spiele hinzufügen - optional**| Neue oder selbst entwickelte Spiele können der allgemeinen Liste hinzugefügt werden - User erstellen über Dialoge eine neue Spielseite mit Beschreibung, Screenshots etc. Spieleentwickler können Posts auf der Seite ihres Spiels veröffentlichen, diese aber nicht bewerten. | mittel-niedrig | 1 Tag | UI, Datenbank, JavaScript |
|**Bewertungen bewerten**| Bewertungen können hoch- oder runtergewählt werden - so können sinnlose oder disinformierende Reviews von anderen Nutzern beseitigt werden, sobald sie ein gewisses Pensum an negativen Bewertungen bekommen. | niedrig | 0.5 Tage | UI, JS, Datenbank |
