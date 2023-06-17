let journeyIndex = undefined;
let operation = undefined;

let params = new URLSearchParams(document.location.search);

// what a mess...
// todo: clean up a lot

// uploading a journey
if (params.get("operation") == "upload") {
	operation = "upload";

	// if no journey index given then error
	if (!params.get("index")) alert("Missing journey index, cannot load the journey to upload");

	document.getElementById("title").innerHTML = "Taking you to the uploader";

	location.href = "rm.html?operation=upload&index=" + params.get("index");
}

// adding a journey
if(params.get("operation") == "add") {
	operation = "add";

	// if there's no journey given then error
	if (!params.get("journey")) alert("Missing journey, cannot load the journey to add");

	journey = JSON.parse(atob(decodeURIComponent(params.get("journey"))));

	// if there's no localStorage object then create one
	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	// show save button
	document.getElementById("save-button").style.display = "block";
}

// editing (modifying, deleting)
if (params.get("operation") == "edit") {
	operation = "edit";

	// if there's no localStorage object then error
	if (!localStorage.getItem("journeys")) alert("Missing localStorage object, cannot load any journeys to edit");

	const journeys = JSON.parse(localStorage.getItem("journeys"));

	// if there's no journeys in localStorage then error
	if (journeys.length === 0) alert("No journeys could be found in localStorage, cannot load any journeys to edit");


	// if we didn't give an index then error
	if (!params.get("index")) alert("Missing journey index, cannot load the journey to edit");
	// else set the index
	journeyIndex = parseInt(params.get("index"));

	// show edit button
	document.getElementById("edit-button").style.display = "block";

	if (journeys[journeyIndex]) {
		journey = journeys[journeyIndex];
	} else {
		alert("No journey could be found at index " + journeyIndex + ", cannot load the journey to edit");
	}

	// special cases for quickset and delete
	if (params.get("quickset") == "arr") {
		// special edit case one: quickset
		// automatically sets the arrival time to the current time
		loadJourney();
		setNow("arr");
		editExisting();

	} else if (params.get("quickset") == "dep") {
		// special edit case two: quickset
		// automatically sets the departure time to the current time
		loadJourney();
		setNow("dep");
		editExisting();
	} else if (params.get("delete") == "true") {
		// special edit case three: delete
		// deletes the journey
		deleteExisting();
	}
}

// this is the only time we ever use the "operation" variable, hah
let title = "";

switch (operation) {
	case "add":
		title = "Adding Journey";
		break;
	case "edit":
		title = `Editing Journey ${journeyIndex}`;
		break;
	case "upload":
		title = "Taking you to the uploader";
		break;
	default:
		title = "Not sure what you're doing here";
}

document.getElementById("title").innerText = title;

// journey is set above in the operation if statements (this is janky)
loadJourney(journey);

function loadJourney(inJourney) {
	if(inJourney) journey = inJourney;

	document.getElementById("details").innerHTML = "";
	if(journey["incomplete"] === true) document.getElementById("details").innerHTML += "<p>This journey has been marked as incomplete, and cannot be uploaded to RailMiles.</p>";
	if(journey["uploaded"] === true) document.getElementById("details").innerHTML += "<p>This journey has been uploaded to RailMiles. Please remember to edit this journey there too.</p>";

	document.getElementById("out-origin").value = journey.origin ? journey.origin : "";
	document.getElementById("out-destination").value = journey.destination ? journey.destination : "";

	document.getElementById("out-originPlatform").value = journey.originPlatform ? journey.originPlatform : "";
	document.getElementById("out-destinationPlatform").value = journey.destinationPlatform ? journey.destinationPlatform : "";

	document.getElementById("out-departureTimeActual").value = journey.departureTimeActual ? journey.departureTimeActual : "";
	document.getElementById("out-arrivalTimeActual").value = journey.arrivalTimeActual ? journey.arrivalTimeActual : "";

	document.getElementById("out-distanceKm").value = journey.distanceKm ? journey.distanceKm : "";
	document.getElementById("out-route").value = journey.route ? journey.route : "";

	document.getElementById("out-operatorName").value = journey.operatorName ? journey.operatorName : "";
	document.getElementById("out-identity").value = journey.identity ? journey.identity : "";
	document.getElementById("out-vehicleType").value = journey.vehicleType ? journey.vehicleType : "";
	document.getElementById("out-vehicles").value = journey.vehicles;

	document.getElementById("out-departureTimePlanned").value = journey.departureTimePlanned ? journey.departureTimePlanned : "";
	document.getElementById("out-arrivalTimePlanned").value = journey.arrivalTimePlanned ? journey.arrivalTimePlanned : "";

	document.getElementById("out-notes").value = journey.notes ? journey.notes : "";
	document.getElementById("out-incomplete").checked = journey.incomplete ? true : false;

	document.getElementById("out-uploaded").checked = journey.uploaded ? true : false;
}

// set up updating onchange - updates the journey object as you type or change things
for (const e of document.querySelectorAll("input")) {
	e.addEventListener("change", () => {
		console.log("changed", e.id);
		console.log("before journey", journey);

		if(e.type === "checkbox") {
			journey[e.id.replace("out-", "")] = e.checked;
		} else {
			journey[e.id.replace("out-", "")] = e.value;
		}

		console.log("after journey", journey);
	});
}

document.getElementById("out-notes").addEventListener("change", () => {
	console.log("changed notes");
	console.log("before journey", journey);
	journey.notes = document.getElementById("out-notes").value;
	console.log("after journey", journey);
});

document.getElementById("vehicle-fill").value = "default";
document.getElementById("vehicle-fill").addEventListener("change", () => {
	console.log("vehicle added");
	console.log("before journey", journey);

	let currentVehicles = document.getElementById("out-vehicles").value.split(",");
	let inputValue = document.getElementById("vehicle-fill").value;

	if(inputValue !== "default") {
		currentVehicles.push(getTrainDetails(inputValue));
		currentVehicles = currentVehicles.filter((s) => s !== "");

		document.getElementById("out-vehicles").value = currentVehicles.join(",");
		journey.vehicles = document.getElementById("vehicle-fill").value;
	}

	console.log("after journey", journey);	
});

document.getElementById("operator-fill").value = "default";
document.getElementById("operator-fill").addEventListener("change", () => {
	console.log("operator set");
	console.log("before journey", journey);

	if (document.getElementById("operator-fill").value !== "default") {
		let inputValue = document.getElementById("operator-fill").options[document.getElementById("operator-fill").selectedIndex].text;

		document.getElementById("out-operatorName").value = inputValue;
		journey.operatorName = inputValue;
	}

	console.log("after journey", journey);
});

if(journey.uploaded) {
	document.getElementById("uploaded").style.display = "block";
}

function startOverConf() {
	if (confirm("Are you sure you want to start over?")) {
		location.href = "index.html";
	} else {
		// do nothing
	}
}

function setActual(which) {
	if (which === "dep") journey.departureTimeActual = journey.departureTimePlanned;
	if (which === "arr") journey.arrivalTimeActual = journey.arrivalTimePlanned;

	loadJourney();
}

function setNow(which) {
	let now = new Intl.DateTimeFormat('da-DK', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Copenhagen' }).format(new Date())
        now = now.split("").reverse().join("").replace(".",":").split("").reverse().join("");
	
	if(which === "dep") {
		journey.departureTimeActual = now;
	} else {
		// if anything other than "dep" then set arrival time (in case I missed something somewhere that calls this)
		journey.arrivalTimeActual = now;
	}

	loadJourney();
}

async function setNearest(which) {
	const key = (which === "dep") ? "origin" : "destination";
	const element = document.getElementById(`out-${key}`);

	const beforeName = element.value;
	let afterName = "";

	element.setAttribute("readonly", "readonly");
	element.value = "About to use your location!";

	let nearest = await getNearestStations(element);

	element.removeAttribute("readonly");

	console.log(nearest);

	if(typeof(nearest) === "string") {
		// if it's a string, it's an error message
		
		alert(nearest);
		element.value = beforeName;
		return;
	} else if(nearest === false) {
		// if it's false, it's an error we've already alerted the user about
		element.value = beforeName;
		return;
	} else {
		// hopefully it's an API response

		let elements = nearest.elements ? nearest.elements : undefined;

		if(!elements) {
			alert(`Could not find any nearby stations (within 250m).`);
			element.value = beforeName;
			return false;
		}

		if(elements.length === 0) {
			alert(`Could not find any nearby stations (within 250m).`);
			element.value = beforeName;
			return false;
		}

		for(const stop of elements) {
			if(stop.tags.name) {
				afterName = stop.tags.name;
				break;
			}
		}

		element.value = afterName;
		journey[key] = afterName;
	}

	loadJourney();
}

function validate() {
	let problems = [];

	// check for required fields, but only if the journey is marked as complete - dates are checked later
	if(!journey.incomplete) {
		for (const id of ["origin", "destination", "operatorName", "vehicleType"]) {

			if(!(id in journey)) {
				problems.push(`Please set ${id}. This is a required field.`);
				continue;
			}

			if(journey[id] == "") {
				problems.push(`Please set ${id}. This is a required field, and cannot be blank.`);
				continue;
			}
		}
	}

	

	// check dates, but only if the journey is marked as complete
	if(!journey.incomplete) {
		for (const id of ["departureTimeActual", "arrivalTimeActual", "departureTimePlanned", "arrivalTimePlanned"]) {
			// permit blank planned times
			if (id === "departureTimePlanned" && !(id in journey)) continue;
			if (id === "arrivalTimePlanned" && !(id in journey)) continue;
			
			// if the actual times are blank then they must be set
			if(!(id in journey)) {
				problems.push(`Please set the ${id} date. This is a required field.`);
				continue;
			}


			// this date exists but does it match the regex (holy crap copilot generated this regex without any prompting)
			if (!journey[id].match(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)) problems.push(`Please check the ${id} date format. It should be DD.MM.YYYY HH:MM`);
		}
	}

	// remove duplicate problems
	// https://stackoverflow.com/a/9229821
	problems = [...new Set(problems)]; 

	let problemString = "";
	for(const problem of problems) {
		problemString += `- ${problem}\n`
	}
	if (problems.length > 0) alert(`There are some problems with your journey:\n${problemString}\nPlease fix them before saving. To ignore, you can mark this journey as incomplete and update it later.`);

	// if there are no problems, return true
	return (problems.length === 0) ? true : false;
}

function addNew() {
	if(!validate()) return;

	let journeys = JSON.parse(localStorage.getItem("journeys"));

	// generate a unique enough UID for the journey
	// todo: check whether it's actually unique (but it's unlikely to be a problem, especially when saving will self-hosted)
	const uniqueEnough = parseInt(Date.now());
	journey.snowflake = uniqueEnough;

	journeys.push(journey);
	localStorage.setItem("journeys", JSON.stringify(journeys));

	done();
}

function editExisting() {
	if (!validate()) return;

	if (typeof(journeyIndex) !== "number") return alert("Not your fault, but no journey index was set!");

	let journeys = JSON.parse(localStorage.getItem("journeys"));
	journeys[journeyIndex] = journey;
	localStorage.setItem("journeys", JSON.stringify(journeys));

	done();
}

function deleteExisting() {
	if (typeof(journeyIndex) !== "number") return alert("Not your fault, but no journey index was set!");

	if (!confirm(`Are you sure you want to delete journey ${journeyIndex} (${journey.origin} to ${journey.destination})?`)) return location.href = "localstorage.html";

	let journeys = JSON.parse(localStorage.getItem("journeys"));
	journeys.splice(journeyIndex, 1);
	localStorage.setItem("journeys", JSON.stringify(journeys));

	done();
}

function done() {
	alert("Saved, hopefully! Taking you to the list of journeys...");
	location.href = "localstorage.html";
}
