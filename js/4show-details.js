function stepFourShowDetails() {
	document.getElementById("details-output").innerHTML = `
	
	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Origin</h2>
			<p><b>${globalStation.name}</b>, Track ${globalTrain.track?globalTrain.track:'?'}</p>
			<p>${globalTrain.date}, ${globalTrain.stops[0].depTime}</p>
		</div>

		<div>
			<h2>Destination</h2>
			<p><b>${globalTrain.stops[globalTrain.endStationIndex].name}</b></p>
			<p>${globalTrain.date}, ${globalTrain.stops[globalTrain.endStationIndex].arrTime}</p>
		</div>
	</div>

	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Route &amp; Distance</h2>
			<p>${globalTrain.direction}</p>
			<p>X miles Y chains</p>
		</div>

		<div>
			<h2>Operator &amp; Running Info</h2>
			<p>DSB, Arriva, SJ, Oresundstag</p>
			<p>Identity <b>${globalTrain.type} ${globalTrain.name}</b></p>
			<p>Train, Metro</p>
		</div>
	</div>

	<h2>Traction</h2>
	<p>todo</p>


	<div style="display: flex; justify-content: space-between; align-items: flex-start;">
		<div>
			<h2>Planned Dep</h2>
			<p>todo</p>
		</div>

		<div>
			<h2>Planned Arr</h2>
			<p>todo</p>
		</div>
	</div>

	<h2>Notes</h2>
	<p>Distances are approx, calcualted as-the-crow-flies between stations. Info may not be compelte or accurate.</p>
 	`;

	document.getElementById("step-1").style.display = "none";
	document.getElementById("step-1-strip").style.display = "none";
	document.getElementById("step-2").style.display = "none";
	document.getElementById("step-2-strip").style.display = "none";
	document.getElementById("step-3").style.display = "none";
	document.getElementById("step-4").style.display = "block";
	
}