let journey = {
	"system": undefined, // this is what we added the journey using

	"origin": undefined, // RM: origin_name - Origin station name
	"destination": undefined, // RM: destination_name - Destination station name

	"originTZ": "", // RM: origin_tz - Origin timezone (eg: Europe/Copenhagen)
	"destinationTZ": "", // RM: destination_tz - Destination timezone (eg: Europe/Copenhagen)

	"originPlatform": undefined, // RM: origin_platform - Origin platform
	"destinationPlatform": undefined, // RM: destination_platform - Destination platform

	"departureTimeActual": undefined, // RM: time_departure_act - Actual departure time
	"departureTimePlanned": undefined, // RM: time_departure_plan - Planned departure time

	"arrivalTimeActual": undefined, // RM: time_arrival_act - Actual arrival time
	"arrivalTimePlanned": undefined, // RM: time_arrival_plan - Planned arrival time

	"operatorName": undefined, // RM: operator_name - Operator name

	"distanceKm": undefined, // RailMiles stores distance in miles, but we will use KM. Importing/sending to RM can handle conversion.

	"route": undefined, // RM: route_description - here we use the "Direction" of the train, which sometimes is different from the destination
	"identity": undefined, // RM: identity - this will be the train "name" - eg IC 1234

	"vehicleType": undefined, // We will use words (Train, Metro) but RM uses letters

	"vehicles": "", // RM: vehicles - a list of units/vehicles used

	"notes": "This journey was created by go.TomR.me/rejselog. Distances are approximate, calculated as-the-crow-flies between stations. Info may not be complete or accurate.",
	// RM: notes - notes about the journey - we will put extra info and disclaimers here

	// extra sysytem-specific details
	// eg: internal IDs, URLs, etc
	"extra": {

	},


	// these details are not for RailMiles
	"snowflake": undefined, // Unique ID for the journey (used for future saving to a database)
	"originId": undefined, // Origin Station ID, used for interacting with Rejseplanen
	"originX": undefined, // Origin Station X coordinate
	"originY": undefined, // Origin Station Y coordinate
	"RJdate": undefined, // Date of journey, as listed in Rejseplanen
	"RJtime": undefined, // Time of journey, as listed in Rejseplanen
	"type": undefined, // Type of service, eg IC, LYN, S
	"stops": [], // List of stops the service makes
	"startStationIndex": undefined, // Index of the origin station in the stops array
	"endStationIndex": undefined, // Index of the destination station in the stops array
	"finalStop": undefined, // Final stop of the service (what would be shown on a destination blind?)
	"journeyDetailUrl": undefined, // URL to the Rejseplanen journey details page, needed for getting service info
	"incomplete": false, // If the journey is incomplete, we will be more permissive with the data we accept
	"uploaded": false // If the journey has been uploaded to RailMiles
};