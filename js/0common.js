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
	"endStationIndex": undefined
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

	}
}

function emojiIconString(emoji) {
	return `<span class="emoji-icon">${emoji}</span>`;
}