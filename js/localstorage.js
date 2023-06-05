// covers loading and saving to localStorage

const out = document.getElementById("out");

if (!localStorage.getItem("journeys")) alert("You have never saved a journey before! There is nothing to load! (missing localStorage object)");

const journeys = JSON.parse(localStorage.getItem("journeys"));

if (journeys.length === 0) alert("I couldn't find any journeys in localStorage! There is nothing to load! (journeys array is empty)");

console.log(journeys.length);

let outputHTML = "";

for (const i in journeys) {
	const j = journeys[i];
	
	// thank you, chatgpt:
	// "edit this piece of javascript so that all of the
	// "included ${} bits are 'Unset' if the variable doesnt exist"
	outputHTML += `
			<li class="${j.incomplete ? 'incomplete' : ''} ${j.uploaded ? 'uploaded' : ''}">
				<p><span>${j.incomplete ? 'INCOMPLETE' : ''}${j.uploaded ? 'ON RAILMILES' : ''}</span><span class="id">${j.identity ? j.identity : "Identity Missing"}</span> from <b>${j.origin}</b> to <b>${j.destination}</b> (${j.route})</p>
				<p><span>${j.departureTimeActual}</span> - <span>${j.arrivalTimeActual}</span></p>

				<button onclick="location.href = 'addedit.html?operation=edit&index=${i}'"><span class="emoji-icon">✏️</span> Edit this Journey</button>
				<button onclick="location.href = 'addedit.html?operation=edit&index=${i}&quickset=dep'"><span class="emoji-icon">⌚</span> Quick Set Departure to Now</button>
				<button onclick="location.href = 'addedit.html?operation=edit&index=${i}&quickset=arr'"><span class="emoji-icon">⌚</span> Quick Set Arrival to Now</button>
				${j.uploaded ? "<!--" : ""}<button onclick="location.href = 'addedit.html?operation=upload&index=${i}'"><span class="emoji-icon">☁️</span> Upload to RailMiles</button>${j.uploaded ? "-->" : ""}
				<button onclick="location.href = 'addedit.html?operation=edit&index=${i}&delete=true'"><span class="emoji-icon">❌</span> Delete this Journey</button>
			</li>
			`;
}
out.innerHTML = outputHTML;

function clearLocalStorage() {
	if (!confirm("Are you sure you want to clear everything?")) return;

	localStorage.clear();
	alert("localStorage cleared");
	location.reload();
}

// thanks again, copilot
function exportJSON() {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journeys));
	const dlAnchorElem = document.createElement('a');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", `rjl-journeys-${Date.now()}.json`);
	dlAnchorElem.click();
}

function exportCSV() {
	return alert("Not implemented yet. Sorry!");
}

function importJSON() {
	return alert("Not implemented yet. Sorry!");
}

// for RailMiles cookie prompt
let RMcookie = undefined;

if (!localStorage.getItem("cookie")) {
	document.getElementById("rm-cookie").innerText = "Set";
} else {
	document.getElementById("rm-cookie").innerText = "Change";
	RMcookie = localStorage.getItem("cookie");
}

function railmilesCookie() {
	let given = prompt("Please enter your RailMiles session cookie. Do not include anything other than the cookie's content. Do not give this out to anyone.\n\nThis will only be stored in your browser storage. To clear, set to nothing.", `${RMcookie ? RMcookie : "abcdefghijklmnopqrstuvwxyz123456"}`);

	if (!given) RMcookie = "";

	localStorage.setItem("cookie", given);
	RMcookie = given;

	document.getElementById("rm-cookie").innerText = "Change";
}
