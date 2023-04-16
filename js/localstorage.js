// covers loading and saving to localStorage

const out = document.getElementById("out");

if (!localStorage.getItem("journeys")) alert("You have never saved a journey before! There is nothing to load! (missing localStorage object)");

const journeys = JSON.parse(localStorage.getItem("journeys"));

if (journeys.length === 0) alert("I couldn't find any journeys in localStorage! There is nothing to load! (journeys array is empty)");

console.log(journeys.length);

let index = 0;
let outputHTML = "";

for (const j of journeys) {
	// thank you, chatgpt:
	// "edit this piece of javascript so that all of the
	// "included ${} bits are 'Unset' if the variable doesnt exist"
	outputHTML += `
			<li class="${j.incomplete ? 'incomplete' : ''} ${j.uploaded ? 'uploaded' : ''}">
				<p>${j.incomplete ? 'INCOMPLETE: ' : ''}${j.uploaded ? 'UPLOADED: ' : ''}${j.type ? j.type : "Type Missing"} <span>${j.identity ? j.identity : "Identity Missing"}</span> from <b>${j.origin}</b> to <b>${j.destination}</b> (${j.route})</p>
				<p>${j.departureTimeActual} - ${j.arrivalTimeActual}</p>

				<button onclick="location.href = 'addedit.html?operation=edit&index=${index}'"><span class="emoji-icon">✏️</span> Edit this Journey</button>
				<button onclick="location.href = 'addedit.html?operation=edit&index=${index}&quickset=true'"><span class="emoji-icon">⌚</span> Quick Set Arrival to Now</button>
				${j.uploaded ? "<!--" : ""}<button onclick="location.href = 'addedit.html?operation=upload&index=${index}'"><span class="emoji-icon">☁️</span> Upload to RailMiles</button>${j.uploaded ? "-->" : ""}
				<button onclick="location.href = 'addedit.html?operation=edit&index=${index}&delete=true'"><span class="emoji-icon">❌</span> Delete this Journey</button>
			</li>
			`;

	index++;
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