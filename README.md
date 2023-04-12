# rejseplanen-logger
Log rail journeys made in DK. Intended to save info that can be inputted into RailMiles.me.

# Plans/ToDo
- Should create a proper schema for the data (globalTrain/globalStation and the saved data are all different)
- Trains that span multiple days (e.g. 23:59 -> 00:01) have incorrect dates. The API doesn't provide the date per stop, so need to figure out whether journey takes place over multiple days and adjust arrival date accordingly.
- Investigate "realtime" dates/times - they don't ever seem to be included - maybe they're only for buses? (rtDate, rtTime, rtTrack)
- Include messages about services (messages)
- Save localstorage to csv - should match railmiles export format
- ~~Could save array to browser local storage.~~ Option to push/pull from "cloud" (file kept on server)
- fix Letbane (tram) and Metro services - add manual input option and warning about selecting correct origin station (e.g. picking "Odense Banegård (Odense Letbane)" instead of "Odense St.)
- allow editing of saved journeys, at least allow deleting and changing date/times

# Not Possible?
- Posting straight to RailMiles - csrf, need to get auth token/cookie. Maybe middleman here?
