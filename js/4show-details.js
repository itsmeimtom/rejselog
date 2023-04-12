function stepFourShowDetails() {

	if (typeof(journey.startStationIndex) !== "number") alert("Couldn't find a start station!\nYou will need to reload and try again. Sorry!\n\nThis is likely because you are viewing a Letbane service but have selected a station that is not a Letbane stop.");
	if (typeof(journey.endStationIndex) !== "number") alert("Couldn't find an end station!\nYou will need to reload and try again. Sorry!\n\nThis is likely a bug, please let me know and I\'ll investigate.");

	console.log(`
		starting at ${journey.stops[journey.startStationIndex].name} (${journey.startStationIndex}),
		ending at ${journey.stops[journey.endStationIndex].name} (${journey.endStationIndex})
	`);
	journey.origin = journey.stops[journey.startStationIndex].name;

	let runningDist = 0;
	for (let i = journey.startStationIndex; i < journey.endStationIndex; i++) {
		const currentStop = journey.stops[i];
		const nextStop = journey.stops[i+1];

		const lat1 = currentStop.y / 1000000;
		const lon1 = currentStop.x / 1000000;
		const lat2 = nextStop.y / 1000000;
		const lon2 = nextStop.x / 1000000;

		const dist = haversine(lat1, lon1, lat2, lon2);
		runningDist += dist;

		console.log(`
			${currentStop.name} to ${nextStop.name} is ${dist} metres
			${lat1}, ${lon1} to ${lat2}, ${lon2}
			total distance is now ${runningDist} metres
		`);
	}

	journey.distanceKm = (runningDist / 1000).toFixed(3);

	// set some info
	journey.vehicleType = getServiceVehicle(journey.type);
	journey.operatorName = getServiceOperator(journey.type);

	if (!journey.departureTimePlanned) journey.departureTimePlanned = `${journey.RJdate} ${journey.stops[journey.startStationIndex].depTime ? journey.stops[journey.startStationIndex].depTime : journey.RJtime}`;
	if (!journey.arrivalTimePlanned) journey.arrivalTimePlanned = `${journey.RJdate} ${journey.stops[journey.endStationIndex].arrTime}`;

	journey.notes = `This journey was created by go.TomR.me/rjl\nDistances are approximate, calculated as-the-crow-flies between stations. Info may not be complete or accurate.`;

	// check if journey spills into next day
	let hours = [];
	if (journey.departureTimePlanned) hours.push(journey.departureTimePlanned.split(" ")[1].split(":")[0]);
	if (journey.arrivalTimePlanned) hours.push(journey.arrivalTimePlanned.split(" ")[1].split(":")[0]);
	if (journey.departureTimeActual) hours.push(journey.departureTimeActual.split(" ")[1].split(":")[0]);
	if (journey.arrivalTimeActual) hours.push(journey.arrivalTimeActual.split(" ")[1].split(":")[0]);
	
	// if 23 and 00 are in in the array
	if (hours.includes("23") && hours.includes("00")) alert("This journey appears to span midnight. Please check the dates are correct.");

	// show the details
	document.getElementById("out-origin").value = journey.origin;
	document.getElementById("out-destination").value = journey.destination;

	document.getElementById("out-originPlatform").value = journey.originPlatform ? journey.originPlatform : "";
	document.getElementById("out-destinationPlatform").value = journey.destinationPlatform ? journey.destinationPlatform : "";

	document.getElementById("out-departureTimeActual").value = journey.departureTimeActual ? journey.departureTimeActual : "SET ME!";
	document.getElementById("out-arrivalTimeActual").value = journey.arrivalTimeActual ? journey.arrivalTimeActual : "SET ME!";

	document.getElementById("out-distanceKm").value = journey.distanceKm;
	document.getElementById("out-route").value = journey.route;

	document.getElementById("out-operatorName").value = journey.operatorName ? journey.operatorName : "SET ME!";
	document.getElementById("out-identity").value = journey.identity;
	document.getElementById("out-vehicleType").value = journey.vehicleType;
	document.getElementById("out-vehicles").value = journey.vehicles.join(",");

	document.getElementById("out-departureTimePlanned").value = journey.departureTimePlanned;
	document.getElementById("out-arrivalTimePlanned").value = journey.arrivalTimePlanned;

	document.getElementById("out-notes").value = journey.notes;


	document.getElementById("step-1").style.display = "none";
	// document.getElementById("step-1-strip").style.display = "none";
	document.getElementById("step-2").style.display = "none";
	// document.getElementById("step-2-strip").style.display = "none";
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-4").style.display = "block";
}

// set up updating onchange
for (const e of document.querySelectorAll("#step-4 input")) {
	e.addEventListener("change", () => {
		console.log("changed", e.id);
		console.log("before journey", journey);
		journey[e.id.replace("out-", "")] = e.value;
		console.log("after journey", journey);
	});
}

document.getElementById("out-notes").addEventListener("change", () => {
	console.log("changed", e.id);
	console.log("before journey", journey);
	journey.notes = document.getElementById("out-notes").value;
	console.log("after journey", journey);
});

function startOverConf() {
	if(confirm("Are you sure you want to start over?")) {
		location.reload();
	} else {
		// do nothing
	}
}

function setActual(which) {
	switch(which) {
		case "dep":
			journey.departureTimeActual = journey.departureTimePlanned;
			break;
		case "arr":
			journey.arrivalTimeActual = journey.arrivalTimePlanned; journey.departureTimeActual = journey.departureTimePlanned;
			break;
		default:
			alert("How did you get here?");
	}

	stepFourShowDetails();
}

function setNow() {
	const now = new Date();

	let date = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0') }.${now.getFullYear()}`;
	let time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

	journey.arrivalTimeActual = `${date} ${time}`;

	stepFourShowDetails();
}

function saveJourney() {
	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	const journeys = JSON.parse(localStorage.getItem("journeys"));
	
	journeys.push(journey);
	localStorage.setItem("journeys", JSON.stringify(journeys));
}


// chatgpt's first attempt 
// "please could you code a JavaScript function that calculates
// "the distance between two sets of WGS84 coordinates, taking
// "into account the ellipsoid shape of the earth"
function haversine(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // Earth's radius in meters
	const φ1 = lat1 * Math.PI / 180; // convert to radians
	const φ2 = lat2 * Math.PI / 180;
	const Δφ = (lat2 - lat1) * Math.PI / 180;
	const Δλ = (lon2 - lon1) * Math.PI / 180;

	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const d = R * c; // distance in meters
	return d;
}