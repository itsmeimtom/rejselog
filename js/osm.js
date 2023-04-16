// interact with OpenStreetMap to find nearby stops

// overpass turbo query to find nearby stops
// [out:json];
// node[railway = stop](around: 150, 55.6723, 12.5638);
// out;

// get nearby stops from OpenStreetMap

// copied from overpass turbo

// element to update with status
let e = undefined;

async function queryOSM(lat, lon) {
	e.value = "Querying OSM API";
	console.log(`Querying OSM for stops near ${lat}, ${lon}`);

	const query = `[out:json];node["railway"="stop"](around:2000,${lat},${lon});out;`;

	const url = "https://overpass-api.de/api/interpreter";

	const req = await fetch(`${url}?data=${encodeURIComponent(query)}`, {
		method: "GET",
	});
	
	return await req.json();
}


async function getNearestStations(element) {
	console.log("getNearestStations");

	e = element;

	const pos = await getCurrentLocation();

	if (typeof pos === "string") {
		alert(`Could not get your location: ${pos}`);
		return false;
	} else {
		console.log(`Location is ${pos.lat}, ${pos.lon} with an accuracy of ${pos.accuracy}m`);

		const data = await queryOSM(pos.lat, pos.lon);

		return data;
	}
}

// thank you, chatgpt <3
// query: "write a single javascript function that gets the user's current lat/lon that handles errors"
// followup: "can you make it an async function that returns the co-ordinates or an error message"
async function getCurrentLocation() {
	console.log("getCurrentLocation");

	e.value = "Calling geolocation API";

	if (!navigator.geolocation) {
		return "Geolocation is not supported by your browser";
	} else {
		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});
			return {
				lat: position.coords.latitude,
				lon: position.coords.longitude,
				accuracy: position.coords.accuracy
			};
		} catch (error) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					return "You denied the permissions required to get your location";
				case error.POSITION_UNAVAILABLE:
					return "Location information is unavailable";
				case error.TIMEOUT:
					return "The request to get user location timed out";
				default:
					return `An unknown error occurred:\n\n${error.code}\n${error.message}`;
			}
		}
	}
}

