const serviceList = document.getElementById("service-list");

const metroToggle = document.getElementById("metro-toggle");
metroToggle.checked = false;
metroToggle.addEventListener("change", () => {
	stepTwoListDeps();
});


async function stepTwoListDeps() {
	if (!journey.originId) return alert("Have you selected a station? If so, please try again. If this error persists, please let me know.");
	if (!journey.RJdate || !journey.RJtime) return alert("Please select a date and time. You can refresh the page to set the date and time to now.");

	// date as DD.MM.YYYY
	const dateParts = journey.RJdate.split("-");
	const dateFormatted = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

	// time as HH:MM
	const time = journey.RJtime.split(":");
	const timeFormatted = `${time[0]}:${time[1]}`;


	let tog = 0;
	let metro = 0;
	let dateUrl = "";

	if (journey.origin.toLowerCase().includes("(metro)")) metroToggle.checked = true;

	if(metroToggle.checked) {
		tog = 0;
		metro = 1;
		dateUrl = "";

	} else {
		tog = 1;
		metro = 0;
		dateUrl = `&date=${dateFormatted}&time=${timeFormatted}`;
	}

	const url = endpoint + `departureBoard?id=${journey.originId}&useTog=${tog}&useMetro=${metro}&useBus=0${dateUrl}&format=json`;

	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if(data.DepartureBoard.error) return alert(`Something went wrong at the API end. Please try again later.\n\nError from Rejseplanen: ${data.DepartureBoard.error}`);

	document.getElementById("step-2").style.display = "block";
	serviceList.innerHTML = "";

	if (data.DepartureBoard.Departure.length > 0) {
		data.DepartureBoard.Departure.forEach((service) => {
			// set departure station details in the status bar and hide the station selection
			document.getElementById("step-1").style.display = "none";
			document.getElementById("step-1-strip").style.display = "flex";
			document.getElementById("departure-station-name").innerHTML = journey.origin;
			if(metroToggle.checked) {
				document.getElementById("departure-station-date").innerHTML = "Now";
			} else {
				document.getElementById("departure-station-date").innerHTML = `${dateFormatted}, ${timeFormatted}`;
			}

			let extra = "";
			if(service.direction !== service.finalStop) extra += `<br><i>${service.direction}</i>`;
			
			let cancelled = "";
			if(service.cancelled) cancelled = " cancelled";


			let track = "";
			if(service.track) track = service.track; // planned track
			if(service.rtTrack) track = service.rtTrack; // 'realtime' track (not sure if this is included here but just in case)

			serviceList.innerHTML += `
				<li onclick="
					journey.identity = '${service.name}';
					journey.type = '${service.type}';
					journey.originPlatform = '${track}';
					journey.RJtime = '${service.time}';
					journey.RJdate = '${dateFormatted}';
					journey.route = '${service.direction}';
					journey.destination = '${service.finalStop}';
					journey.journeyDetailUrl = '${btoa(service.JourneyDetailRef.ref)}';
					stepThreeShowService();
				" class="service${cancelled}">
					<span class="service-name">${getEmoji(service.type)} ${service.name}</span>

					<span class="service-time">${service.time}</span>

					<span class="service-track">${service.track ? `&bull; Track ${track}` : " "}</span>
					
					<span class="service-dest">${service.finalStop}${extra}</span>
				</li>
			`;
		});
	} else {
		serviceList.innerHTML = "<li>No departures found</li>";
	}
}