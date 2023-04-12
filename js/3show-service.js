const stopList = document.getElementById("stop-list");

async function stepThreeShowService() {
	if (globalTrain.type === "LET" && !globalStation.name.toLowerCase().includes("letbane")) {
		if (confirm(
			`This is Letbane (light rail) service, but the station you have selected does not appear to be a Letbane stop.\nYou will likely run into problems.\n\nOK to continue anyway, cancel to start over and pick a new origin station.`
		)) {
			// continue
		} else {
			location.reload();
		}
	}

	if(globalTrain.type === "M" && !globalStation.name.toLowerCase().includes("metro")) {
		if (confirm(
			`This is Metro service, but the station you have selected does not appear to be a Metro stop.\nYou will likely run into problems.\n\nOK to continue anyway, cancel to start over and pick a new origin station.`
		)) {
			// continue
		} else {
			location.reload();
		}
	}

	if (!globalTrain.journeyDetailUrl) return alert("API Error: No URL was provided. Please try again. If this error persists, please let me know.");

	// Replace the second ? with & (https://stackoverflow.com/a/44568739)
	// and swap the endpoint
	let t = 0;
	const fixedUrl = decodeURIComponent(atob(globalTrain.journeyDetailUrl))
		.replace(/\?/g, match => ++t === 2 ? '&' : match) 
		.replace("http://webapp.rejseplanen.dk/bin//rest.exe/", endpoint); 

	if (!fixedUrl.startsWith(endpoint)) return alert(`Given URL (${atob(globalTrain.journeyDetailUrl)}) does not start with ${endpoint}`);

	const url = fixedUrl + "&format=json";
	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if (data.JourneyDetail.error) return alert(`API Returned Error: \n\n${data.JourneyDetail.error}`); 

	document.getElementById("service-name").innerHTML = globalTrain.name;
	document.getElementById("service-type").innerHTML = `${getEmoji(globalTrain.type)} ${getServiceType(globalTrain.type)}`;
	document.getElementById("service-time").innerHTML = globalTrain.time;
	document.getElementById("service-dest").innerHTML = globalTrain.finalStop;
	document.getElementById("service-via").innerHTML = globalTrain.direction;
	document.getElementById("service-track").innerHTML = `Track ${globalTrain.track?globalTrain.track:"?"}`;

	document.getElementById("step-3").style.display = "block";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "flex";

	stopList.innerHTML = "";


	if (data.JourneyDetail.Stop.length > 0) {

		let stopIndex = -1;

		for(const i in data.JourneyDetail.Stop) {
			const s = data.JourneyDetail.Stop[i];

			console.log(s.name, globalStation.name);
			if (s.name === globalStation.name) {
				console.log("MATCH");
				globalTrain.startStationIndex = parseInt(i);
				break;
			} else {
				console.log("NO MATCH");
			}
		}

		data.JourneyDetail.Stop.forEach((stop) => {
			globalTrain.stops.push(
				{
					name: stop.name,
					arrTime: stop.arrTime ? stop.arrTime : undefined,
					depTime: stop.depTime ? stop.depTime : undefined,
					x: stop.x ? stop.x : undefined,
					y: stop.y ? stop.y : undefined
				}
			);
			
			stopIndex++;

			// if (!stop.arrTime) return;

			let onclick = `globalTrain.endStationIndex = ${stopIndex}; stepFourShowDetails();`;
			let style = "";

			console.log(stopIndex, globalTrain.startStationIndex);

			if(stopIndex <= globalTrain.startStationIndex) {
				onclick = "alert('You have started after this stop!');";
				style = "style='opacity: 0.5; font-size: 0.8em; padding: 0 0.5em;'";
			}
				
			stopList.innerHTML += `
				<li onclick="${onclick}" ${style}>
					<b>${stop.name}</b>, arriving ${stop.arrTime ? stop.arrTime : "?"}
				</li>
			`;
		});
	} else {
		stopList.innerHTML = "<li>No stops found</li>";
	}
}
