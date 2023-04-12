let searchDebounce; // cheers lewis

const stationList = document.getElementById("station-list");
const departureStation = document.getElementById("departure-station");
const date = document.getElementById("date");

date.value = new Date().toISOString().slice(0, 16);

departureStation.addEventListener("input", stepOneinputsChange);
date.addEventListener("input", stepOneinputsChange);

function stepOneinputsChange() {
	const value = departureStation.value;

	if (value.length < 3) return stationList.innerHTML = "<li>Type some more to search</li>";

	stationList.innerHTML = `<li>Searching for ${value}</li>`;

	clearTimeout(searchDebounce);
	searchDebounce = setTimeout(() => {
		stepOneListMatches(value);
	}, 100);
}

document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();

	document.querySelector("ul#station-list li").click();
});

async function stepOneListMatches(name) {
	const url = endpoint + "location?input=" + name + "&format=json";

	const response = await fetch(url);
	const data = await response.json();

	stationList.innerHTML = "";

	if (data.LocationList.StopLocation.length > 0) {
		data.LocationList.StopLocation.forEach((stop) => {
			stationList.innerHTML += `
				<li onclick="
					journey.originId = '${stop.id}';
					journey.origin = '${stop.name}';
					journey.RJdate = '${date.value.split("T")[0]}';
					journey.RJtime = '${date.value.split("T")[1]}';
					journey.originX = ${stop.x};
					journey.originY = ${stop.y};
					stepTwoListDeps();
				">${stop.name}</li>
			`;
		});
	} else {
		stationList.innerHTML = "<li>No matches found</li>";
	}
	document.getElementById("step-1").scrollIntoView();
}



