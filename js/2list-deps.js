// async function fetchDepartures() {
// 	const urlParams = new URLSearchParams(window.location.search);
	
// 	const id = urlParams.get("id");
// 	if(!id) return alert("No station id provided");

// 	const train = urlParams.get("train") ? urlParams.get("train") : false;
// 	const metro = urlParams.get("metro") ? urlParams.get("metro") : false;	


	




// 	output.innerHTML = "";

// 	if (data.DepartureBoard.Departure.length > 0) {
// 		data.DepartureBoard.Departure.forEach((service) => {
// 			output.innerHTML += `
// 				<li>
// 					<a href="service.html?url=${btoa(service.JourneyDetailRef.ref)}"><b>${service.name}</b></a> from ${service.stop} ${service.track?`Track ${service.track}`:""}<br>
// 					<b>${service.time}</b> to ${service.finalStop} (${service.direction})
// 				</li>
// 			`;
// 		});
// 	}
// }

// window.onload = fetchDepartures;


const serviceList = document.getElementById("service-list");

async function stepTwoListDeps(id, name, date) {
	if(!name || !id) return alert("No station name or id provided");

	const unformattedDate = date ? date : new Date().toISOString().slice(0, 16);

	// date as DD.MM.YYYY
	const dateParts = unformattedDate.split("T")[0].split("-");
	const dateFormatted = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

	// time as HH:MM
	const time = unformattedDate.split("T")[1].split(":");
	const timeFormatted = `${time[0]}:${time[1]}`;

	const url = endpoint + `departureBoard?id=${id}&useTog=1&metro=1&useBus=0&date=${dateFormatted}&time=${timeFormatted}&format=json`;


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
			document.getElementById("departure-station-name").innerHTML = name;
			document.getElementById("departure-station-id").innerHTML = id;
			document.getElementById("departure-station-date").innerHTML = `${dateFormatted}, ${timeFormatted}`;

			let extra = "";

			if(service.direction !== service.finalStop) extra += `<br><i>${service.direction}</i>`;

			serviceList.innerHTML += `
				<li onclick="stepThreeShowService(
					'${btoa(service.JourneyDetailRef.ref)}',
					'${service.name}',
					'${service.time}',
					'${dateFormatted}',
					'${id}',
					'${service.direction}',
					'${service.finalStop}',
					${service.track}
				)" class="service">
					<span class="service-name">${service.name}</span>

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