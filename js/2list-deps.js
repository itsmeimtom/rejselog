const serviceList = document.getElementById("service-list");

const metroToggle = document.getElementById("metro-toggle");
metroToggle.checked = false;
metroToggle.addEventListener("change", () => {
	stepTwoListDeps();
});


async function stepTwoListDeps() {
	if(!globalStation.id) return alert("No station ID?");
	if(!globalStation.date) return alert("No date?");
	if(!globalStation.time) return alert("No time?");

	// date as DD.MM.YYYY
	const dateParts = globalStation.date.split("-");
	const dateFormatted = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

	// time as HH:MM
	const time = globalStation.time.split(":");
	const timeFormatted = `${time[0]}:${time[1]}`;


	let tog = 0;
	let metro = 0;
	let dateUrl = "";

	if(metroToggle.checked) {
		tog = 0;
		metro = 1;
		dateUrl = "";

	} else {
		tog = 1;
		metro = 0;
		dateUrl = `&date=${dateFormatted}&time=${timeFormatted}`;
	}

	const url = endpoint + `departureBoard?id=${globalStation.id}&useTog=${tog}&useMetro=${metro}&useBus=0${dateUrl}&format=json`;

	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if(data.DepartureBoard.error) return alert(data.DepartureBoard.error);

	document.getElementById("step-2").style.display = "block";
	serviceList.innerHTML = "";

	if (data.DepartureBoard.Departure.length > 0) {
		data.DepartureBoard.Departure.forEach((service) => {
			document.getElementById("step-1").style.display = "none";
			document.getElementById("step-1-strip").style.display = "flex";
			document.getElementById("departure-station-name").innerHTML = globalStation.name;
			if(metroToggle.checked) {
				document.getElementById("departure-station-date").innerHTML = "Now";
			} else {
				document.getElementById("departure-station-date").innerHTML = `${dateFormatted}, ${timeFormatted}`;
			}

			let extra = "";
			if(service.direction !== service.finalStop) extra += `<br><i>${service.direction}</i>`;
			
			let cancelled = "";
			if(service.cancelled) cancelled = " cancelled";

			serviceList.innerHTML += `
				<li onclick="
					globalTrain.name = '${service.name}';
					globalTrain.type = '${service.type}';
					globalTrain.time = '${service.time}';
					globalTrain.date = '${dateFormatted}';
					globalTrain.direction = '${service.direction}';
					globalTrain.finalStop = '${service.finalStop}';
					globalTrain.journeyDetailUrl = '${btoa(service.JourneyDetailRef.ref)}';
					globalTrain.track = ${service.track};

					stepThreeShowService();
				" class="service${cancelled}">
					<span class="service-name">${getEmoji(service.type)} ${service.name}</span>

					<span class="service-time">${service.time}</span>

					<span class="service-track">${service.track ? `&bull; Track ${service.track}` : " "}</span>
					
					<span class="service-dest">${service.finalStop}${extra}</span>
				</li>
			`;
		});
	} else {
		serviceList.innerHTML = "<li>No departures found</li>";
	}
}