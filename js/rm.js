function log(text) {
	console.log(text);
	document.getElementById("log").innerText += `\n[${Date.now()}] ${text}`;
}

log(`Script loaded`);

window.onload = uploadToRailMiles;

async function uploadToRailMiles() {
	log(`uploadToRailMiles() called`);

	if (!localStorage.getItem("journeys")) {
		return log(`No journeys found in localStorage`);
	}

	// get parms
	let params = new URLSearchParams(document.location.search);

	if (params.get("operation") !== "upload") return log(`Operation not set to upload. Did you mean to be here?`);
	if (!params.get("index")) return log(`Journey index not set. Did you mean to be here?`);

	// check for cookie
	if (!localStorage.getItem("cookie")) return log(`No RailMiles cookie found in localStorage. Please set it on the journeys page.`);
	const cookie = localStorage.getItem("cookie");

	if (!cookie) return log(`No RailMiles cookie found in localStorage. Please set it on the journeys page.`);

	if (cookie.length < 10) return log(`Cookie found in localStorage doesn't look valid. Please set it on the journeys page.`);

	// check for server
	if (!localStorage.getItem("serverURL")) return log(`No server URL found in localStorage. Please set it on the journeys page.`);
	const server = localStorage.getItem("serverURL");

	let index = params.get("index");
	log(`Journey index: ${index}`);

	let journey = JSON.parse(localStorage.getItem("journeys"))[index];
	log(`Journey at ${index}: ${JSON.stringify(journey)}`);

	if (!journey) return log(`No journey found with index ${index}. Cannot go futher.`);

	// check if journey is already uploaded
	if (journey.uploaded) return log(`Journey is already uploaded. Cannot go futher.`);

	// check if journey is incomplete
	if (journey.incomplete) return log(`Journey is incomplete. Cannot go futher.`);

	// check if there is an origin
	if (!journey.origin) return log(`Journey has no origin. Cannot go futher.`);
	// check if there is a destination
	if (!journey.destination) return log(`Journey has no destination. Cannot go futher.`);

	// check if there are dates
	if (!journey.departureTimeActual) return log(`Journey has no actual departure date/time. Cannot go futher.`);
	if (!journey.arrivalTimeActual) return log(`Journey has no actual arrival date/time. Cannot go futher.`);

	// format post data
	log(`Formatting journey data`);

	let data = new FormData();
	data.append("cookie", cookie);
	log(`Cookie: [HIDDEN]`);

	data.append("origin_name", journey.origin);
	log(`Origin: ${journey.origin}`);
	data.append("destination_name", journey.destination);
	log(`Destination: ${journey.destination}`);

	// platforms
	if (journey.originPlatform) {
		data.append("origin_platform", journey.originPlatform);
		log(`Origin platform: ${journey.originPlatform}`);
	}
	if (journey.destinationPlatform) {
		data.append("destination_platform", journey.destinationPlatform);
		log(`Destination platform: ${journey.destinationPlatform}`);
	}

	// format actual date
	log(`Formatting actual dates and times`);
	data.append("act_dep_date", formatDate(journey.departureTimeActual)[0]);
	log(`Actual departure date: ${formatDate(journey.departureTimeActual)[0]}`);
	data.append("act_dep_time", formatDate(journey.departureTimeActual)[1]);
	log(`Actual departure time: ${formatDate(journey.departureTimeActual)[1]}`);

	data.append("act_arr_date", formatDate(journey.arrivalTimeActual)[0]);
	log(`Actual arrival date: ${formatDate(journey.arrivalTimeActual)[0]}`);
	data.append("act_arr_time", formatDate(journey.arrivalTimeActual)[1]);
	log(`Actual arrival time: ${formatDate(journey.arrivalTimeActual)[1]}`);

	// if planned departure
	if (journey.departureTimePlanned) {
		// format planned date
		log(`Formatting planned departure date and time`);
		data.append("plan_dep_date", formatDate(journey.departureTimePlanned)[0]);
		log(`Planned departure date: ${formatDate(journey.departureTimePlanned)[0]}`);
		data.append("plan_dep_time", formatDate(journey.departureTimePlanned)[1]);
		log(`Planned departure time: ${formatDate(journey.departureTimePlanned)[1]}`);
	}

	// if planned arrival
	if (journey.arrivalTimePlanned) {
		// format planned date
		log(`Formatting planned arrival date and time`);
		data.append("plan_arr_date", formatDate(journey.arrivalTimePlanned)[0]);
		log(`Planned arrival date: ${formatDate(journey.arrivalTimePlanned)[0]}`);
		data.append("plan_arr_time", formatDate(journey.arrivalTimePlanned)[1]);
		log(`Planned arrival time: ${formatDate(journey.arrivalTimePlanned)[1]}`);
	}

	// timezones
	if (journey.originTZ) {
		data.append("origin_tz", journey.originTZ);
		log(`Origin TZ: ${journey.originTZ}`);
	}
	if (journey.destinationTZ) {
		data.append("destination_tz", journey.destinationTZ);
		log(`Destination TZ: ${journey.destinationTZ}`);
	}

	// route
	if (journey.route) {
		data.append("route_description", journey.route);
		log(`Route: ${journey.route}`);
	}

	// distance
	if (journey.distanceKm) {
		log(`Converting distance (${journey.distanceKm}km) to miles and chains`);
		data.append("distance_miles", convertToMilesAndChains(journey.distanceKm)[0]);
		log(`Distance in miles: ${convertToMilesAndChains(journey.distanceKm)[0]}`);
		data.append("distance_chains", convertToMilesAndChains(journey.distanceKm)[1]);
		log(`and chains: ${convertToMilesAndChains(journey.distanceKm)[1]}`);
	}

	// operator name
	if (journey.operatorName) {
		data.append("operator_name", journey.operatorName);
		log(`Operator name: ${journey.operatorName}`);
	}

	// operator code
	if (journey.operatorCode) {
		data.append("operator_code", journey.operatorCode);
		log(`Operator code: ${journey.operatorCode}`);
	}

	// journey identity
	if (journey.identity) {
		let idToSet = journey.identity;

		if(journey.identity.length > 8) {
			log(`Identity is too long. Trying to shorten it.`);
			idToSet = journey.identity.replace(/ /g, '');
			log(`Identity with no spaces: ${idToSet}`);
			
			if(idToSet.length > 8) {
				idToSet = idToSet.substring(0, 8);
				return log(`Identity is still too long. Cannot continue.`);
			}
		}

		data.append("identity", idToSet);
		log(`Identity: ${idToSet}`);
	}

	// vehicle type
	if (!journey.vehicleType) {
		return log(`Vehicle type not set. Cannot continue.`);
	}

	let vehicleTypeToSet = 0;

	switch (journey.vehicleType.toLowerCase()) {
		case "train":
			vehicleTypeToSet = 0;
			break;
		case "bus":
			vehicleTypeToSet = 1;
			break;
		case "ferry":
			vehicleTypeToSet = 2;
			break;
		case "Metro":
			vehicleTypeToSet = 3;
			break;
		default:
			return log(`Vehicle type not recognised. Cannot continue.`);
	}

	data.append("vehicle_type", vehicleTypeToSet);
	log(`Vehicle type: ${vehicleTypeToSet} (from ${journey.vehicleType})`);

	// vehicles are a bit weird but we handle this later
	if (journey.vehicles) {
		data.append("vehicles", journey.vehicles);
		log(`Vehicles: ${journey.vehicles} (will be handled later)`);
	}

	// notes
	if (journey.notes) {
		// remove new lines
		journey.notes = journey.notes.replace(/\n/g, '. ');

		data.append("notes", journey.notes);
		log(`Notes: ${journey.notes}`);
	}

	log(`Done with data validation and formatting! Check the console for data object!`);
	log(data);
	
	// send data to server
	log(`Sending data to server...`);
	const req = await fetch(`${server}addtoRM.php`, {
		method: "POST",
		credentials: "include",
		body: data
	});

	log(`Server response: ${req.status} ${req.statusText}`);

	const json = await req.json();
	log(json);

	if(json.error) {
		return log(`Error: ${json.error}`);
	}

	if(json.success) {
		log(`Success, hopefully! Setting the uploaded flag to true`);
		journey.uploaded = true;
		JSON.parse(localStorage.getItem("journeys"))[index] = journey;

		alert(`Success, hopefully! You will be redirected to RailMiles in a few seconds to check your journey.`);

		log(`Taking you to RailMiles in 5 seconds`);
		// redirect to journeys list in a few seconds
		window.setTimeout(() => {
			window.location.href = "https://my.railmiles.me/journeys/list/";;
		}, 5000);

		return;
	}
}

// chatgpt!
// "write a javascript function that converts a date
// "in the format "DD.MM.YYYY HH:MM" to "DD/MM/YYYY" and "HH:MM"
function formatDate(dateString) {
	const dateParts = dateString.split(' ');
	const date = dateParts[0].split('.');
	const time = dateParts[1];
	const formattedDate = `${date[0]}/${date[1]}/${date[2]}`;
	return [formattedDate, time];
}

// chatgpt!
// "could you please write a JavaScript function that converts"
// "a length in metres to the British Railway standard of miles and chains?"
// then: "could you have it convert from kilometres instead?"
function convertToMilesAndChains(lengthInKilometers) {
	const metersPerKilometer = 1000;
	const metersPerMile = 1609.344;
	const metersPerChain = 20.1168;

	const totalMeters = lengthInKilometers * metersPerKilometer;
	const totalChains = totalMeters / metersPerChain;
	const miles = Math.floor(totalChains / 80);
	const chains = Math.round(totalChains % 80);

	return [miles, chains];
}