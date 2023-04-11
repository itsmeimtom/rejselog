function stepFourShowDetails() {	
	if (typeof(globalTrain.startStationIndex) !== "number") alert("Couldn't find a start station!\nIf you are using a local service check if the start stop name is correct - it might not match the name of a nearby DSB station.");
	if (typeof(globalTrain.endStationIndex) !== "number") alert("No end station picked!");

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

	const distanceStr = `
		${convertToMilesAndChains(runningDist)}
		<br>
		${(runningDist / 1000).toFixed(5)} km
	`;

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
			<p>${distanceStr}</p>
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
 	`;

	document.getElementById("step-1").style.display = "none";
	document.getElementById("step-1-strip").style.display = "none";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "none";
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-4").style.display = "block";	
}

function getServiceType(code) {
	switch (code.toUpperCase()) {
		case "IC": return "Intercity";
		case "LYN": return "IntercityLyn";
		case "REG": return "Regionaltog";
		case "S": return "S-tog";
		case "M": return "Københavns Metro";
		case "LET": return "Letbane";
		case "TOG": return "Other Train";
	}

	return "Unknown";
}

function getServiceVehicle(code) {
	code = code.toUpperCase();
	if(
	code === "IC"
	|| code === "LYN"
	|| code === "REG"
	|| code === "S"
	|| code === "TOG"
	) return "Train";

	if(code === "M" || code === "LET") return "Metro";

	return "Unknown";
}

function getServiceOperator(code) {
	code = code.toUpperCase();

	switch(code) {
		case "M": return "Københavns Metro";
		case "S": return "DSB S-tog";
		case "LYN": return "DSB";
	}

	return "Could be:<br>DSB, Arriva, SJ or Oresundstag";
}

// function getServiceTrainType(code) {
// 	code = code.toUpperCase();

// 	switch(code) {
// 		case "M": return "Metro";
// 	}

// 	return "Unknown";
// }

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

	return `${miles} miles, ${chains} chains`;
}
