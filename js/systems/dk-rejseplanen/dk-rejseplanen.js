const endpoint = "https://xmlopen.rejseplanen.dk/bin/rest.exe/";

journey.system = "dk-rejseplanen";
journey.originTZ = "Europe/Copenhagen";
journey.destinationTZ = "Europe/Copenhagen";

async function searchForStation(name) {
	console.log("REJSEPLANEN searching for station " + name);

	const url = endpoint + "location?input=" + name + "&format=json";

	const response = await fetch(url);
	const data = await response.json();

	if (data.LocationList.StopLocation.length > 0) {
		return data.LocationList.StopLocation.map((stop) => {
			return {
				"id": stop.id,
				"name": stop.name,
				"extra": {
					"lat": stop.y,
					"lon": stop.x
				}
			};
		});
	} else {
		return [];
	}
}

