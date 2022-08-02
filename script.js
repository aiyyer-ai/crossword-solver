document.getElementById('file').addEventListener('change', (e) => {
	const file = document.getElementById('file').files[0];

	if (file) {
		processFile(file);
	}
});

function processFile(file) {
	(async () => {
		const fileContent = await file.text();
		const puzzleInfo = JSON.parse(fileContent)
		console.log(puzzleInfo);
	})();
	hideInput;
}

function hideInput(){

	var element = document.getElementById("input");
	var child=document.getElementById("file");
	element.removeChild(child);

}	