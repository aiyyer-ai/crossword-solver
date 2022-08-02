const fileInput = document.getElementById("file");
fileInput.addEventListener("change", handleFile, false);

function handleFile(event) {
	const reader = new FileReader();
	reader.onload = (function(evt) {
		evt.target.result;
	})
	const file = event.target.file;
	console.log(file);
}
