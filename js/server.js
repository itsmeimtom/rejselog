let server = undefined;

if (!localStorage.getItem("serverURL")) {
	document.getElementById("server-url").innerText = "server not set";
} else {
	document.getElementById("server-url").innerText = localStorage.getItem("serverURL");
	server = localStorage.getItem("serverURL");
}

function serverURL() {
	let given = prompt("Please enter the URL of the server you want to use. Please include the trailing backslash.", "http://example.com/path/");

	if (!given) return alert("No URL given! Nothing has changed.");

	if(!given.endsWith("/")) {
		alert("Whoops, the URL you gave does not end with a backslash!\nDon't worry, I'm going to add it for you!"); 
		given += "/";
	}


	localStorage.setItem("serverURL", given);
	server = given;

	alert("Server URL set! Refreshing the page for you :)");

	location.reload();
}

async function saveToServer() {
	if(!server) return alert("You have not set a server URL to save to!");
	if (!confirm("Are you sure you want to save to the server? This will remove all journeys on the server and replace them with the ones listed on this page!\n\nOK to continue, cancel to abort")) return;

	const req = await fetch(`${server}set.php`, {
		method: "POST",
		credentials: "include",
		body: btoa((JSON.stringify(journeys)))
	});

	const json = await req.json();

	console.log(req, json);
	
	if(json.error === true) {
		alert(`There was an error!\n\n${json.message}`);
		return false;
	}

	alert(`Saving seems to have gone well!\n\nMessage from server:\n${json.message}`);
}

async function loadFromServer() {
	if (!server) return alert("You have not set a server URL to load from!");
	if (!confirm("Are you sure you want to load from the server? This will overwrite any journeys that are only saved locally!\n\nOK to continue, cancel to abort")) return;

	const req = await fetch(`${server}fetch.php`, {
		method: "GET",
		credentials: "include",
	});

	const json = await req.json();
	
	console.log(req, json);
	
	if(json.error === true) {
		alert(`There was an error!\n\nMessage from server:\n${json.message}`);
		return false;
	}

	if(!json.data) {
		alert("There was no data to load!");
		return false;
	}
	
	if (!localStorage.getItem("journeys")) {
		localStorage.setItem("journeys", JSON.stringify([]));
	}

	console.log("before load", localStorage.journeys);

	localStorage.journeys = JSON.parse(atob(json.data));
	
	alert(`Loaded from server! Refreshing the page for you :)\n\nMessage from server:\n${json.message}`);

	console.log("after load", localStorage.journeys);

	location.reload();
}
