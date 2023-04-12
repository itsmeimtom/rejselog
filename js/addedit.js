let journeyIndex = undefined;
let operation = undefined;

let params = new URLSearchParams(document.location.search);

// what a mess...
// todo: clean up a lot
if(params.get("operation") == "add") {
	operation = "add";

	if(!params.get("journey")) alert("Missing journey, cannot load the journey to add");

	journey = JSON.parse(atob(decodeURIComponent(params.get("journey"))));
} else if (params.get("operation") == "edit") {
	operation = "edit";

	if (!params.get("index")) alert("Missing journey index, cannot load the journey to edit");

	journeyIndex = parseInt(params.get("index"));
}

if(operation == "edit") {
	if (!localStorage.getItem("journeys")) alert("Missing localStorage object, cannot load any journeys to edit");

	const journeys = JSON.parse(localStorage.getItem("journeys"));

	if (journeys.length === 0) alert("No journeys could be found in localStorage, cannot load any journeys to edit");

	document.getElementById("edit-button").style.display = "block";

	if (journeys[journeyIndex]) {
		journey = journeys[journeyIndex];
	} else {
		alert("No journey could be found at index " + journeyIndex + ", cannot load the journey to edit");
	}

	if(params.get("quickset") == "true") {
		loadJourney();
		setNow();
		editExisting();
	} else if (params.get("delete") == "true") {
		deleteExisting();
	}

} else if (operation == "add") {
	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	document.getElementById("save-button").style.display = "block";
} else {
	alert("Unknown operation! How did you get here?");
}


document.getElementById("title").innerHTML = operation == "add" ? "Adding Journey" : `Edditing Journey ${journeyIndex}`;

loadJourney(journey);

function loadJourney(inJourney) {
	if(inJourney) journey = inJourney;

	document.getElementById("out-origin").value = journey.origin ? journey.origin : "SET ME!";
	document.getElementById("out-destination").value = journey.destination ? journey.destination : "SET ME!";

	document.getElementById("out-originPlatform").value = journey.originPlatform ? journey.originPlatform : "";
	document.getElementById("out-destinationPlatform").value = journey.destinationPlatform ? journey.destinationPlatform : "";

	document.getElementById("out-departureTimeActual").value = journey.departureTimeActual ? journey.departureTimeActual : "SET ME!";
	document.getElementById("out-arrivalTimeActual").value = journey.arrivalTimeActual ? journey.arrivalTimeActual : "SET ME!";

	document.getElementById("out-distanceKm").value = journey.distanceKm ? journey.distanceKm : "SET ME!";
	document.getElementById("out-route").value = journey.route ? journey.route : "SET ME!";

	document.getElementById("out-operatorName").value = journey.operatorName ? journey.operatorName : "SET ME!";
	document.getElementById("out-identity").value = journey.identity ? journey.identity : "SET ME!";
	document.getElementById("out-vehicleType").value = journey.vehicleType ? journey.vehicleType : "SET ME!";
	document.getElementById("out-vehicles").value = journey.vehicles;

	document.getElementById("out-departureTimePlanned").value = journey.departureTimePlanned ? journey.departureTimePlanned : "SET ME!";
	document.getElementById("out-arrivalTimePlanned").value = journey.arrivalTimePlanned ? journey.arrivalTimePlanned : "SET ME!";

	document.getElementById("out-notes").value = journey.notes ? journey.notes : "";
}

// set up updating onchange
for (const e of document.querySelectorAll("input")) {
	e.addEventListener("change", () => {
		console.log("changed", e.id);
		console.log("before journey", journey);
		journey[e.id.replace("out-", "")] = e.value;
		console.log("after journey", journey);
	});
}

document.getElementById("out-notes").addEventListener("change", () => {
	console.log("changed", e.id);
	console.log("before journey", journey);
	journey.notes = document.getElementById("out-notes").value;
	console.log("after journey", journey);
});

function startOverConf() {
	if (confirm("Are you sure you want to start over?")) {
		location.href = "index.html";
	} else {
		// do nothing
	}
}

function setActual(which) {
	switch (which) {
		case "dep":
			journey.departureTimeActual = journey.departureTimePlanned;
			break;
		case "arr":
			journey.arrivalTimeActual = journey.arrivalTimePlanned;
			break;
		default:
			alert("How did you get here?");
	}

	loadJourney();
}

function setNow() {
	const now = new Date();

	let date = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
	let time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

	journey.arrivalTimeActual = `${date} ${time}`;

	loadJourney();
}

function validate() {
	let problems = [];

	if (!journey.departureTimeActual) problems.push("Please set the actual departure time.");
	if (!journey.arrivalTimeActual) problems.push("Please set the actual arrival time.");
	if (!journey.operatorName || journey.operatorName == "SET ME!") problems.push("Please set the operator name.");

	for (const e of document.querySelectorAll("input")) {
		if (e.value == "SET ME!") problems.push("Please set all the fields marked 'SET ME!'");
		if (e.value.includes("undefined")) problems.push("Please check all the fields, there are some undefined values.");
	}

	// check dates
	for (const id of ["departureTimeActual", "arrivalTimeActual", "departureTimePlanned", "arrivalTimePlanned"]) {
		// if doesnt match the regex (holy crap copilot generated this regex without any prompting)

		if (journey[id].length === 0) continue;

		if (!journey[id].match(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)) problems.push(`Please check the ${id} date format. It should be DD.MM.YYYY HH:MM`);
	}

	let problemString = "";
	for(const problem of problems) {
		problemString += `- ${problem}\n`
	}
	if (problems.length > 0) alert(`There are some problems with your journey:\n${problemString}\nPlease fix them before saving.`);

	return (problems.length === 0) ? true : false;
}

function addNew() {
	if(!validate()) return;

	let journeys = JSON.parse(localStorage.getItem("journeys"));

	journeys.push(journey);
	localStorage.setItem("journeys", JSON.stringify(journeys));

	done();
}

function editExisting() {
	if (!validate()) return;

	if (typeof(journeyIndex) !== "number") return alert("No journey index set!");

	let journeys = JSON.parse(localStorage.getItem("journeys"));
	journeys[journeyIndex] = journey;
	localStorage.setItem("journeys", JSON.stringify(journeys));

	done();
}

function deleteExisting() {
	if (typeof(journeyIndex) !== "number") return alert("No journey index set!");

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