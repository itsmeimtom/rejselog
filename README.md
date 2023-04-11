# rejseplanen-logger
Save rail journeys made in DK. Intended to create files with info thag can be inputted into RailMiles.me

# Plans/ToDo
- Should create a proper schema for the data (globalTrain/globalStation and the saved data are all different)
- Investigate "realtime" dates/times - they don't ever seem to be included - maybe they're only for buses? (rtDate, rtTime, rtTrack)
- Include messages about services (messages)
- Save to CSV file(s?) that get/s updated
- ~~Could save array to browser local storage.~~ Option to push/pull from "cloud" (file kept on server)

# Not Possible?
- Posting straight to RailMiles - csrf, need to get auth token/cookie. Maybe middleman here?
