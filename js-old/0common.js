const endpoint = "https://xmlopen.rejseplanen.dk/bin/rest.exe/";

let journey = {
	// these are used for RailMiles

	"origin": undefined, // RM: origin_name - Origin station name
	"destination": undefined, // RM: destination_name - Destination station name
	
	"originTZ": "Europe/Copenhagen", // RM: origin_tz - Origin timezone
	"destinationTZ": "Europe/Copenhagen", // RM: destination_tz - Destination timezone

	"originPlatform": undefined, // RM: origin_platform - Origin platform
	"destinationPlatform": undefined, // RM: destination_platform - Destination platform

	"departureTimeActual": undefined, // RM: time_departure_act - Actual departure time
	"departureTimePlanned": undefined, // RM: time_departure_plan - Planned departure time

	"arrivalTimeActual": undefined, // RM: time_arrival_act - Actual arrival time
	"arrivalTimePlanned": undefined, // RM: time_arrival_plan - Planned arrival time

	"operatorName": undefined, // RM: operator_name - Operator name

	"distanceKm": undefined, // RailMiles stores distance in miles, but we will use KM. Importing/sending to RM can handle conversion.

	"route": undefined, // RM: route_description - here we use the "Direction" of the train, which sometimes is different from the destination
	"identity" : undefined, // RM: identity - this will be the train "name" - eg IC 1234

	"vehicleType": undefined, // We will use words (Train, Metro) but RM uses letters

	"vehicles": "", // RM: vehicles - a list of units/vehicles used

	"notes": "This journey was created by go.TomR.me/rejselog. Distances are approximate, calculated as-the-crow-flies between stations. Info may not be complete or accurate.",
	// RM: notes - notes about the journey - we will put extra info and disclaimers here


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

function getEmoji(code) {
	if(!code) return "";

	switch (code.toUpperCase()) {
		case "IC": return emojiIconString("🚅");
		case "LYN": return emojiIconString("⚡");
		case "REG": return emojiIconString("🚆");
		case "S": return emojiIconString("🚇");
		case "M": return emojiIconString("Ⓜ️");
		case "LET": return emojiIconString("🚃");
		case "TOG": return emojiIconString("🚆");
		case "EN": return emojiIconString("🌙");
	}
}

function emojiIconString(emoji) {
	return `<span class="emoji-icon">${emoji}</span>`;
}


function getServiceType(code) {
	if (!code) return "";

	switch (code.toUpperCase()) {
		case "IC": return "Intercity Train";
		case "LYN": return "IntercityLyn (Limited-Stop Intercity)";
		case "REG": return "Regionaltog (Regional Train)";
		case "S": return "S-tog (Suburban City Train)";
		case "M": return "Københavns Metro (Copenhagen Metro)";
		case "LET": return "Letbane (Local Light Rail)";
		case "EN": return "EuroNight";
		case "TOG": return "Other Train";
	}

	return "Unknown";
}

function getServiceVehicle(code) {
	if (!code) return "";

	code = code.toUpperCase();
	if (
		code === "IC"
		|| code === "LYN"
		|| code === "REG"
		|| code === "S"
		|| code === "TOG"
		|| code === "EN"
	) return "Train";

	if (code === "M" || code === "LET") return "Metro";

	return "Unknown";
}

function getServiceOperator(code) {
	if (!code) return "";
	code = code.toUpperCase();

	switch (code) {
		case "M": return "Københavns Metro";
		case "S": return "DSB S-tog";
		case "LYN": return "DSB";
	}

	if(code === "LET") {
		if(journey.origin.toLowerCase().includes("odense")) {
			// odense letbane stops are prefixed with "(Odense)"
			return "Odense Letbane";
		} else {
			// aarhus doesn't have "aarhus" in the names
			return "Aarhus Letbane";
		}
	} else {
		return undefined;
	}

	return undefined;
}

function getTrainDetails(code) {
	code = code.toUpperCase();

	switch (code) {
		case "IC2": return "IC2 XXXX";

		case "IC3": return "IC3 5XXX";
		case "IC4": return "IC4 56XX";
		
		case "IR4": return "ER (IR4) XXXX";
		case "ET": return "ET 4XXX";

		case "SA": return "SA XXXX";
		case "SE": return "SE XXXX";

		case "EG": return "EG 31XX";
		case "EB": return "EB 32XX";

		case "ART": return "2XXX";
		case "ARV": return "1XXX (last two digits)";
		case "OD": return "XX";
	}

	return "?";
}