const fileInput = document.getElementById("file");
fileInput.addEventListener("change", handleFile, false);

function handleFile(event) {
	const reader = new FileReader();
	reader.onload = (function(evt) {
		document.getElementById('fileContent').textContent = evt.target.result;
	})
	const puzzleData = reader.readAsText(event.target.file);
	console.log(puzzleData);
}


