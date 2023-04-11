async function fetchDepartures() {
	const urlParams = new URLSearchParams(window.location.search);
	
	const id = urlParams.get("id");
	if(!id) return alert("No station id provided");

	const train = urlParams.get("train") ? urlParams.get("train") : false;
	const metro = urlParams.get("metro") ? urlParams.get("metro") : false;	

	const date = urlParams.get("date") ? urlParams.get("date") : new Date().toISOString().slice(0, 16);

	// date as DD.MM.YYYY
	const dateParts = date.split("T")[0].split("-");
	const dateFormatted = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

	// time as HH:MM
	const time = date.split("T")[1].split(":");
	const timeFormatted = `${time[0]}:${time[1]}`;

	const url = endpoint + `departureBoard?id=${id}&useTog=${train?1:0}&metro=${metro?1:0}&useBus=0&date=${dateFormatted}&time=${timeFormatted}&format=json`;

	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	output.innerHTML = "";

	if (data.DepartureBoard.Departure.length > 0) {
		data.DepartureBoard.Departure.forEach((service) => {
			output.innerHTML += `
				<li>
					<a href="service.html?url=${btoa(service.JourneyDetailRef.ref)}"><b>${service.name}</b></a> from ${service.stop} ${service.track?`Track ${service.track}`:""}<br>
					<b>${service.time}</b> to ${service.finalStop} (${service.direction})
				</li>
			`;
		});
	}
}

window.onload = fetchDepartures;