const fileInput = document.getElementById("file");
fileInput.addEventListener("change", handleFile, false);

function handleFile(event) {
	const reader = new FileReader();
	reader.onload = (function(evt) {
		console.log(evt);
		document.getElementById('fileContent').textContent = evt.target.result;
	})
	reader.readAsText(event.target.file);
}
