function stepFourCalcDetails(force) {
	// if metro, s-tog or letbane, the route should be identity
	if (journey.type == "M" || journey.type == "S" || journey.type == "LET") {
		journey.route = `${journey.identity}, ${journey.route}`;
		journey.identity = ``;
	}

	// set some info
	journey.vehicleType = getServiceVehicle(journey.type);
	journey.operatorName = getServiceOperator(journey.type);

	// if things are brokey then skip to adding
	if(force) return location.href = `addedit.html?operation=add&journey=${encodeURIComponent(btoa(JSON.stringify(journey)))}`;

	if (typeof(journey.startStationIndex) !== "number") { 
		alert("Couldn't find a start station!\nYou will need to reload and try again. Sorry!\n\nThis is likely because you are viewing a Letbane service but have selected a station that is not a Letbane stop.");
	}

	if (typeof(journey.endStationIndex) !== "number") {
		alert("Couldn't find an end station!\nYou will need to reload and try again. Sorry!\n\nThis is likely a bug, please let me know and I\'ll investigate.");
	}

	console.log(`
		starting at ${journey.stops[journey.startStationIndex] ? journey.stops[journey.startStationIndex].name : "MISSING START"} (${journey.startStationIndex}),
		ending at ${journey.stops[journey.endStationIndex] ? journey.stops[journey.endStationIndex].name : "MISSING END"} (${journey.endStationIndex})
	`);

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

	journey.distanceKm = runningDist / 1000;

	if (!journey.departureTimePlanned) journey.departureTimePlanned = `${journey.RJdate} ${journey.stops[journey.startStationIndex].depTime ? journey.stops[journey.startStationIndex].depTime : journey.RJtime}`;
	if (!journey.arrivalTimePlanned) journey.arrivalTimePlanned = `${journey.RJdate} ${journey.stops[journey.endStationIndex].arrTime}`;

	// check if journey spills into next day
	let hours = [];
	if (journey.departureTimePlanned) hours.push(journey.departureTimePlanned.split(" ")[1].split(":")[0]);
	if (journey.arrivalTimePlanned) hours.push(journey.arrivalTimePlanned.split(" ")[1].split(":")[0]);
	if (journey.departureTimeActual) hours.push(journey.departureTimeActual.split(" ")[1].split(":")[0]);
	if (journey.arrivalTimeActual) hours.push(journey.arrivalTimeActual.split(" ")[1].split(":")[0]);
	console.log(hours);
	
	// if 23 and 00 are in in the array
	if (hours.includes("23") && hours.includes("00")) {
		alert("This journey appears to span midnight. Please check the dates are correct.");

		// update the arrival dates
		if (journey.arrivalTimePlanned) journey.arrivalTimePlanned = nextDay(journey.arrivalTimePlanned);
		if (journey.arrivalTimeActual) journey.arrivalTimeActual = nextDay(journey.arrivalTimeActual);
	}

	location.href = `addedit.html?operation=add&journey=${encodeURIComponent(btoa(JSON.stringify(journey)))}`;
}


function nextDay(dateStr) {
	console.log("dateStr", dateStr);

	let dayOfMonth = parseInt(dateStr.split(" ")[0].split(".")[0]);
	let month = parseInt(dateStr.split(" ")[0].split(".")[1]);
	let year = parseInt(dateStr.split(" ")[0].split(".")[2]);
	const time = dateStr.split(" ")[1];

	console.log(dayOfMonth, month, year, time);

	// spaghetti code, thank you copilot xo
	if ([1, 3, 5, 7, 8, 10, 12].includes(month)) { // months with 31 days
		console.log("month with 31 days");

		if(dayOfMonth == 31) {
			console.log("last day of month");
			dayOfMonth = "01";
			month = month + 1;
		} else {
			dayOfMonth = dayOfMonth + 1;
		}
	} else if ([4, 6, 9, 11].includes(month)) { // 30 days
		console.log("month with 30 days");
		if(dayOfMonth == 30) {
			console.log("last day of month");
			dayOfMonth = "01";
			month = month + 1;
		} else {
			dayOfMonth = dayOfMonth + 1;
		}
	} else if (month == 2) {
		console.log("february");
		// leap year
		if (new Date(year, 1, 29).getDate() === 29) {
			console.log("leap year");
			if(dayOfMonth == 29) {
				console.log("last day of month");
				dayOfMonth = "01";
				month = "03";
			} else {
				dayOfMonth = dayOfMonth + 1;
			}
		} else {
			console.log("not leap year");
			if(dayOfMonth == 28) {
				console.log("last day of month");
				dayOfMonth = "01";
				month = "03";
			} else {
				dayOfMonth = dayOfMonth + 1;
			}
		}
	}

	const nextDay = `${dayOfMonth.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ${time}`;
	console.log(nextDay);
	return nextDay;
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