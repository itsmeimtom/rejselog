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

	journey.distanceKm = runningDist / 1000;

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
	console.log(hours);
	
	// if 23 and 00 are in in the array
	if (hours.includes("23") && hours.includes("00")) {
		alert("This journey appears to span midnight. Please check the dates are correct.");

		// update the arrival dates
		if (journey.arrivalTimePlanned) journey.arrivalTimePlanned = nextDay(journey.arrivalTimePlanned);
		if (journey.arrivalTimeActual) journey.arrivalTimeActual = nextDay(journey.arrivalTimeActual);
	}

	
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
	document.getElementById("out-vehicles").value = journey.vehicles;

	document.getElementById("out-departureTimePlanned").value = journey.departureTimePlanned;
	document.getElementById("out-arrivalTimePlanned").value = journey.arrivalTimePlanned;

	document.getElementById("out-notes").value = journey.notes;


	document.getElementById("step-1").style.display = "none";
	document.getElementById("step-1-strip").style.display = "none";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "none";
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-4").style.display = "block";
	document.getElementById("step-4").scrollIntoView();

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
	if (!journey.departureTimeActual) return alert("Please set the actual departure time.");
	if (!journey.arrivalTimeActual) return alert("Please set the actual arrival time.");
	if (!journey.operatorName || journey.operatorName == "SET ME!") return alert("Please set the operator name.");

	if(journey.vehicles.length < 2) {
		if (!confirm("You have not entered any vehicles.\nOK to ignore, cancel to return.")) return;
	};

	for(const e of document.querySelectorAll("#step-4 input")) {
		if (e.value == "SET ME!") return alert("Please set all the fields marked 'SET ME!'");
		if (e.value.includes("undefined")) return alert("Please check all the fields, there are some undefined values.");
	}

	// check dates
	for (const id of ["departureTimeActual", "arrivalTimeActual", "departureTimePlanned", "arrivalTimePlanned"]) {
		// if doesnt match the regex (holy crap copilot generated this regex without any prompting)
		if (!journey[id].match(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)) return alert(`Please check the ${id} date format. It should be DD.MM.YYYY HH:MM`);
	}


	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	const journeys = JSON.parse(localStorage.getItem("journeys"));
	
	journeys.push(journey);
	localStorage.setItem("journeys", JSON.stringify(journeys));

	alert("Saved! Taking you to the list of journeys...");
	document.getElementById("step-4").style["pointer-events"] = "none";
	document.getElementById("step-4").style["opacity"] = "0.5";
	location.href = "localstorage.html";
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