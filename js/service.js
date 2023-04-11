async function fetchService() {
	const urlParams = new URLSearchParams(window.location.search);

	let givenUrl = urlParams.get("url");
	if (!givenUrl) return alert("No URL given");

	givenUrl = atob(givenUrl);


	// Replace the second ? with & (https://stackoverflow.com/a/44568739)
	// and swap the endpoint

	let t = 0;
	givenUrl = decodeURIComponent(givenUrl)
		.replace(/\?/g, match => ++t === 2 ? '&' : match) 
		.replace("http://webapp.rejseplanen.dk/bin//rest.exe/", endpoint); 

	if(!givenUrl.startsWith(endpoint)) return alert(`Given URL (${givenUrl}) does not start with ${endpoint}`);

	const url = givenUrl + "&format=json";
	const response = await fetch(url);
	const data = await response.json();

	console.log(data);

	if (data.JourneyDetail.error) return alert(`Something went wrong. Is this a rail (not metro!) service?\n\n${data.JourneyDetail.error}`); 

	document.getElementById("title").innerText = data.JourneyDetail.JourneyName.name;
	output.innerHTML = "";

	if (data.JourneyDetail.Stop.length > 0) {
		data.JourneyDetail.Stop.forEach((stop) => {
			if(!stop.arrTime) return;

			output.innerHTML += `
				<li>
					<b>${stop.name}</b>, arriving ${stop.arrTime}
				</li>
			`;
		});
	}


	
}

window.onload = fetchService;