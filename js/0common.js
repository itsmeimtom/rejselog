const endpoint = "https://xmlopen.rejseplanen.dk/bin/rest.exe/";

let globalStation = {
	"name": undefined,
	"id": undefined,
	"date": undefined,
	"time": undefined
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
	"endStationIndex": undefined
};