const stopList = document.getElementById("stop-list");

async function stepThreeShowService() {
	if (journey.type === "LET" && !journey.origin.toLowerCase().includes("letbane")) {
		if (confirm(
			`This is Letbane (light rail) service, but the station you have selected does not appear to be a Letbane stop.\nYou will likely run into problems.\n\nOK to continue anyway, cancel to start over and pick a new origin station.`
		)) {
			// continue
		} else {
			location.reload();
		}
	}

	if(journey.type === "M" && !journey.origin.toLowerCase().includes("metro")) {
		if (confirm(
			`This is Metro service, but the station you have selected does not appear to be a Metro stop.\nYou will likely run into problems.\n\nOK to continue anyway, cancel to start over and pick a new origin station.`
		)) {
			// continue
		} else {
			location.reload();
		}
	}

	if (!journey.journeyDetailUrl) {
		alert("API Error: No URL was provided. Please try again. If this error persists, please let me know.\n\nYou can start again or manually enter information in the next step.");
		return stepFourShowDetails(true);
	}

	// Replace the second ? with & (https://stackoverflow.com/a/44568739)
	// and swap the endpoint
	let t = 0;
	const fixedUrl = decodeURIComponent(atob(journey.journeyDetailUrl))
		.replace(/\?/g, match => ++t === 2 ? '&' : match) 
		.replace("http://webapp.rejseplanen.dk/bin//rest.exe/", endpoint); 

	if (!fixedUrl.startsWith(endpoint)) return alert(`Given URL (${atob(journey.journeyDetailUrl)}) does not start with ${endpoint}`);

	const url = fixedUrl + "&format=json";
	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if (data.JourneyDetail.error) {
		alert(`API Returned Error: \n\n${data.JourneyDetail.error}\n\nYou can start again or manually enter information in the next step.`);
		return stepFourShowDetails(true);
	}

	document.getElementById("service-name").innerHTML = journey.identity;
	document.getElementById("service-type").innerHTML = `${getEmoji(journey.type)} ${getServiceType(journey.type)}`;
	document.getElementById("service-time").innerHTML = journey.RJtime;
	document.getElementById("service-dest").innerHTML = journey.destination;
	document.getElementById("service-via").innerHTML = journey.route;
	document.getElementById("service-track").innerHTML = `Track ${journey.originPlatform ? journey.originPlatform : "?"}`;

	document.getElementById("step-3").style.display = "block";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "flex";

	stopList.innerHTML = "";


	if (data.JourneyDetail.Stop.length > 0) {

		let stopIndex = -1;

		for(const i in data.JourneyDetail.Stop) {
			const s = data.JourneyDetail.Stop[i];

			console.log(s.name, journey.origin);
			if (s.name.toLowerCase() === journey.origin.toLowerCase()) {
				console.log("MATCH");
				journey.startStationIndex = parseInt(i);
				break;
			} else {
				console.log("NO MATCH");
			}
		}

		data.JourneyDetail.Stop.forEach((stop) => {
			journey.stops.push(
				{
					name: stop.name,
					arrTime: stop.arrTime ? stop.arrTime : undefined,
					depTime: stop.arrTime ? stop.depTime : undefined,
					x: stop.x ? stop.x : undefined,
					y: stop.y ? stop.y : undefined
				}
			);
			
			stopIndex++;

			// if (!stop.arrTime) return;

			let onclick = `journey.endStationIndex = ${stopIndex}; stepFourShowDetails();`;
			let style = "";

			console.log(stopIndex, journey.startStationIndex);

			if (stopIndex <= journey.startStationIndex) {
				onclick = "alert('You have started after this stop!');";
				style = "style='opacity: 0.5; font-size: 0.8em; padding: 0 0.5em;'";
			}
				
			stopList.innerHTML += `
				<li onclick="${onclick}" ${style}>
					<b>${stop.name}</b>${stop.arrTime ? `, arr. ${stop.arrTime}` : ""}
				</li>
			`;
		});
	} else {
		stopList.innerHTML = "<li>No stops found</li>";
	}
}
