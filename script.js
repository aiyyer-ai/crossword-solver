document.getElementById('file').addEventListener('change', (e) => {
	const file = document.getElementById('file').files[0];

	if (file) {
		processFile(file);
	}
});

function processFile(file) {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	console.log(file);
}
