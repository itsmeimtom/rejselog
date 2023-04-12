const endpoint = "https://xmlopen.rejseplanen.dk/bin/rest.exe/";

let globalStation = {
	"name": undefined,
	"id": undefined,
	"date": undefined,
	"time": undefined,
	"x": undefined,
	"y": undefined
};

let globalTrain = {
	"name": undefined,
	"type": undefined,
	"time": undefined,
	"date": undefined,
	"direction": undefined,
	"finalStop": undefined,
	"track": undefined,
	"journeyDetailUrl": undefined,
	"stops": [],
	"startStationIndex": undefined,
	"endStationIndex": undefined,
	"distMiles": undefined,
	"distChains": undefined,
	"distKm": undefined
};

function getEmoji(code) {
	switch (code.toUpperCase()) {
		case "IC": return emojiIconString("🚅");
		case "LYN": return emojiIconString("⚡");
		case "REG": return emojiIconString("🚆");
		case "S": return emojiIconString("🚇");
		case "M": return emojiIconString("Ⓜ️");
		case "LET": return emojiIconString("🚃");
		case "TOG": return emojiIconString("🚆");
		case "EN": return emojiIconString("🌙");
	}
}

function emojiIconString(emoji) {
	return `<span class="emoji-icon">${emoji}</span>`;
}


function getServiceType(code) {
	switch (code.toUpperCase()) {
		case "IC": return "Intercity";
		case "LYN": return "IntercityLyn";
		case "REG": return "Regionaltog";
		case "S": return "S-tog";
		case "M": return "Københavns Metro";
		case "LET": return "Letbane";
		case "EN": return "EuroNight";
		case "TOG": return "Other Train";
		
	}

	return "Unknown";
}

function getServiceVehicle(code) {
	code = code.toUpperCase();
	if (
		code === "IC"
		|| code === "LYN"
		|| code === "REG"
		|| code === "S"
		|| code === "TOG"
		|| code === "EN"
	) return "Train";

	if (code === "M" || code === "LET") return "Metro";

	return "Unknown";
}

function getServiceOperator(code) {
	code = code.toUpperCase();

	switch (code) {
		case "M": return "Københavns Metro";
		case "S": return "DSB S-tog";
		case "LYN": return "DSB";
	}

	return "Could be: DSB, Arriva, SJ or Oresundstag";
}

// function getServiceTrainType(code) {
// 	code = code.toUpperCase();

// 	switch(code) {
// 		case "M": return "Metro";
// 	}

// 	return "Unknown";
// }