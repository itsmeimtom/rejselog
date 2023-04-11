let searchDebounce; // cheers lewis

const stationList = document.getElementById("station-list");
const departureStation = document.getElementById("departure-station");
const date = document.getElementById("date");

date.value = new Date().toISOString().slice(0, 16);

departureStation.addEventListener("input", stepOneinputsChange);
date.addEventListener("input", stepOneinputsChange);

function stepOneinputsChange() {
	const value = departureStation.value;
	stationList.innerHTML = value;

	if (value.length < 3) return stationList.innerHTML = "<li>Type some more to search</li>";

	clearTimeout(searchDebounce);
	searchDebounce = setTimeout(() => {
		stepOneListMatches(value);
	}, 100);
	
}

async function stepOneListMatches(name) {
	const url = endpoint + "location?input=" + name + "&format=json";

	const response = await fetch(url);
	const data = await response.json();

	stationList.innerHTML = "";

	if (data.LocationList.StopLocation.length > 0) {
		data.LocationList.StopLocation.forEach((stop) => {
			stationList.innerHTML += `
				<li onclick="stepTwoListDeps(${stop.id}, '${stop.name}', '${date.value}', true, true)">${stop.name}</li>
			`;
		});
	}
}



