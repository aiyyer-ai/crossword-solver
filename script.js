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
		createBoard(puzzleInfo);
	})();
}

function createBoard(info) {
	let app = new PIXI.Application({ width: 640, height: 360 });
	let render = app.renderer;
	render.backgroundColor = 0x152238;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.autoResize = true;
    app.render();
    const inputField = document.getElementById("input");
	document.body.insertBefore(app.view, inputField);
}