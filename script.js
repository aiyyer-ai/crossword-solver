const fileInput = document.getElementById("file");
fileInput.addEventListener("change", handleFile, false);

function handleFile(event) {
	const reader = new FileReader();
	reader.onload = (function(evt) {
		console.log(evt);
		document.getElementById('fileContent').textContent = evt.target.result;
	})
	console.log(event.target);
	reader.readAsText(event.target.file);
}


