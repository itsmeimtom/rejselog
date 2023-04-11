let searchDebounce; // cheers lewis

const departureStation = document.getElementById("departure-station");
const trainSelect = document.getElementById("train-select");
const metroSelect = document.getElementById("metro-select");
const date = document.getElementById("date");

date.value = new Date().toISOString().slice(0, 16);

departureStation.addEventListener("input", inputsChange);
trainSelect.addEventListener("input", inputsChange);
metroSelect.addEventListener("input", inputsChange);
date.addEventListener("input", inputsChange);

function inputsChange() {
	const value = departureStation.value;
	output.innerHTML = value;

	if (value.length < 3) return output.innerHTML = "<li>Type some more to search</li>";

	clearTimeout(searchDebounce);
	searchDebounce = setTimeout(() => {
		listPossibleMatches(value);
	}, 100);
	
}


async function listPossibleMatches(name) {
	const url = endpoint + "location?input=" + name + "&format=json";

	const response = await fetch(url);
	const data = await response.json();

	output.innerHTML = "";

	if (data.LocationList.StopLocation.length > 0) {
		data.LocationList.StopLocation.forEach((stop) => {
			output.innerHTML += `
				<li><a href="departures.html?id=${stop.id}&train=${trainSelect.checked}&metro=${metroSelect.checked}&date=${date.value}">${stop.name}</a></li>
			`;
		});
	}
}


