const stopList = document.getElementById("stop-list");

async function stepThreeShowService(APIurl, name, time, date, id, direction, finalStop, track) {
	if (!APIurl) return alert("No URL provided");

	// Replace the second ? with & (https://stackoverflow.com/a/44568739)
	// and swap the endpoint
	let t = 0;
	const fixedUrl = decodeURIComponent(atob(APIurl))
		.replace(/\?/g, match => ++t === 2 ? '&' : match) 
		.replace("http://webapp.rejseplanen.dk/bin//rest.exe/", endpoint); 

	if (!fixedUrl.startsWith(endpoint)) return alert(`Given URL (${fixedUrl}) does not start with ${endpoint}`);

	const url = fixedUrl + "&format=json";
	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if (data.JourneyDetail.error) return alert(`Something went wrong. Is this a rail (not metro!) service?\n\n${data.JourneyDetail.error}`); 

	document.getElementById("service-name").innerHTML = name;
	document.getElementById("service-time").innerHTML = time;
	document.getElementById("service-dest").innerHTML = finalStop;
	document.getElementById("service-via").innerHTML = direction;
	if(track) document.getElementById("service-track").innerHTML = `Track ${track?track:"?"}`;

	document.getElementById("step-3").style.display = "block";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "flex";

	stopList.innerHTML = "";

	if (data.JourneyDetail.Stop.length > 0) {
		data.JourneyDetail.Stop.forEach((stop) => {
			if(!stop.arrTime) return;

			stopList.innerHTML += `
				<li onclick="alert('not implemented yet')">
					<b>${stop.name}</b>, arriving ${stop.arrTime}
				</li>
			`;
		});
	} else {
		stopList.innerHTML = "<li>No stops found</li>";
	}
}
