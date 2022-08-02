const fileInput = document.getElementById("file");
fileInput.addEventListener("change", handleFile, false);

function handleFile(event) {
	const reader = new FileReader();
	reader.onload = (function(evt) {
		const fileTest = evt.target.result;
		console.log(fileTest);
	})
	const file = event.target.file;
	console.log(file);
}
