function stepFourShowDetails() {

	if (typeof(globalTrain.startStationIndex) !== "number") alert("Couldn't find a start station!\nYou will need to reload and try again. Sorry!\n\nThis is likely because you are viewing a Letbane service but have selected a station that is not a Letbane stop.");
	if (typeof(globalTrain.endStationIndex) !== "number") alert("Couldn't find an end station!\nYou will need to reload and try again. Sorry!\n\nThis is likely a bug, please let me know and I\'ll investigate.");

	console.log(`
		starting at ${globalTrain.stops[globalTrain.startStationIndex].name} (${globalTrain.startStationIndex}),
		ending at ${globalTrain.stops[globalTrain.endStationIndex].name} (${globalTrain.endStationIndex})
	`);

	let runningDist = 0;
	for(let i = globalTrain.startStationIndex; i < globalTrain.endStationIndex; i++) {
		const currentStop = globalTrain.stops[i];
		const nextStop = globalTrain.stops[i+1];

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

	globalTrain.distMiles = convertToMilesAndChains(runningDist)[0];
	globalTrain.distChains = convertToMilesAndChains(runningDist)[1];
	globalTrain.distKm = (runningDist / 1000).toFixed(3);

	document.getElementById("details-output").innerHTML = `
	
	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Origin</h2>
			<p><b>${globalStation.name}</b>, Track ${globalTrain.track?globalTrain.track:'?'}</p>
			<p>${globalTrain.date}, ${globalTrain.stops[0].depTime}</p>
		</div>

		<div>
			<h2>Destination</h2>
			<p><b>${globalTrain.stops[globalTrain.endStationIndex].name}</b></p>
			<p>${globalTrain.date}, ${globalTrain.stops[globalTrain.endStationIndex].arrTime}</p>
		</div>
	</div>

	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Route &amp; Distance</h2>
			<p>${globalTrain.direction}</p>
			<p>
				${globalTrain.distMiles} miles and ${globalTrain.distChains} chains<br>
				(${globalTrain.distKm} km)
			</p>
		</div>

		<div>
			<h2>Operator &amp; Running Info</h2>
			<p>${getServiceOperator(globalTrain.type)}</p>
			<p>${getServiceType(globalTrain.type)} <b>${globalTrain.name}</b></p>
			<p>${getServiceVehicle(globalTrain.type)}</p>
		</div>
	</div>

	<h2>Traction</h2>
	<p>todo</p>


	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Planned Dep</h2>
			<p>todo</p>
		</div>

		<div>
			<h2>Planned Arr</h2>
			<p>todo</p>
		</div>
	</div>

	<h2>Notes</h2>
	<p>Distances are approx, calcualted as-the-crow-flies between stations. Info may not be complete or accurate.</p>

	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<button onclick="startOverConf();">${emojiIconString("❌")} Start Over</button>
		<button onclick="saveJourney();">${emojiIconString("💾")} Save this Journey</button>
	</div>
 	`;

	document.getElementById("step-1").style.display = "none";
	// document.getElementById("step-1-strip").style.display = "none";
	document.getElementById("step-2").style.display = "none";
	// document.getElementById("step-2-strip").style.display = "none";
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-4").style.display = "block";	
}

function startOverConf() {
	if(confirm("Are you sure you want to start over?")) {
		location.reload();
	}
}

function saveJourney() {
	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	const journeys = JSON.parse(localStorage.getItem("journeys"));
	
	journeys.push({
		origin: globalStation.name,
		originTrack: globalTrain.track,
		destination: globalTrain.stops[globalTrain.endStationIndex].name,
		destinationTrack: globalTrain.stops[globalTrain.endStationIndex].track,
		depDate: globalTrain.date,
		depTime: globalTrain.stops[0].depTime,
		arrDate: globalTrain.date,
		arrTime: globalTrain.stops[globalTrain.endStationIndex].arrTime,
		direction: globalTrain.direction,
		distanceMiles: globalTrain.distMiles,
		distanceChains: globalTrain.distChains,
		distanceKm: globalTrain.distKm,
		operator: getServiceOperator(globalTrain.type),
		type: getServiceType(globalTrain.type),
		name: globalTrain.name,
		vehicle: getServiceVehicle(globalTrain.type),
		note: "Distances are approx, calcualted as-the-crow-flies between stations. Info may not be complete or accurate."
	});
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

// thanks again, chatgpt :)
// "could you please write a JavaScript function that converts
// "a length in metres to the British railway standard of
// "miles and chains?"
function convertToMilesAndChains(lengthInMeters) {
	const metersPerMile = 1609.344;
	const metersPerChain = 20.1168;

	const totalChains = lengthInMeters / metersPerChain;
	const miles = Math.floor(totalChains / 80);
	const chains = Math.round(totalChains % 80);

	return [miles, chains];
}
