// step two: show the departures for the selected station

async function stationClicked(e) {
	console.log(e);
	
	const stationId = e.dataset.id;
	const stationName = e.dataset.name;
	const stationExtra = e.dataset.extra ? JSON.parse(atob(e.dataset.extra)) : undefined;

	journey.origin = stationName;
	journey.originId = stationId;

	journey.originX = stationExtra ? stationExtra.lon : undefined;
	journey.originY = stationExtra ? stationExtra.lat : undefined;

	// get the departures

}