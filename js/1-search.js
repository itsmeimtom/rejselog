// Step One: when the users inputs text into the search box,
// we need to search for it
const searchInput = document.getElementById("departure-station");
const dateInput = document.getElementById("date");
const stationList = document.getElementById("station-list");

// set date to now
dateInput.value = new Date(Date.now() + (-1 * new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16); // thanks, dav

searchInput.addEventListener("input", inputsChanged);
dateInput.addEventListener("input", inputsChanged);

async function inputsChanged() {
	const value = searchInput.value;

	if (value.length < 3) return stationList.innerHTML = "<li>Type some more to search</li>";

	stationList.innerHTML = `<li>Searching for ${value}</li>`;

	const results = await searchForStation(value);
	let output = ``;

	console.log(results);

	if (results.length > 0) {
		for(const station of results) {
			output += `
				<li
					class="station-list-item"
					data-id="${station.id}"
					data-name="${station.name}"
					data-extra="${station.extra ? btoa(JSON.stringify(station.extra)) : ''}"
				>${station.name}</li>
			`;
		}
	} else {
		output = "<li>No matches found</li>";
	}

	stationList.innerHTML = output;

	// when the user clicks on a station, we need to handle that
	// and send that to the next bit
	document.querySelectorAll(".station-list-item").forEach((e) => {
		console.log(e);
		e.addEventListener("click", (event) => {
			stationClicked(event.target);
		});
	});
}

