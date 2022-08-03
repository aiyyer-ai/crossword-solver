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
	console.log(info);
	let boardWidth = info.dimensions.width;
	let boardHeight = info.dimensions.height;
	let app = new PIXI.Application({ width: boardWidth * 36, height: boardHeight * 36 });
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.autoResize = true;
    app.render();
    const inputField = document.getElementById("input");
	document.body.insertBefore(app.view, inputField);
	let crosswordSquares = new PIXI.Graphics();
	crosswordSquares.beginFill(0xff0000);
	for (let row in info.puzzle) {
		for (let square in info.puzzle[row]) {
			console.log(square);
			console.log(info.puzzle[row]);
			console.log(info.puzzle[row].findIndex(square));
			crosswordSquares.drawRect((row * 36) + 1, (info.puzzle[row].findIndex(square) * 36) + 1, 34, 34);
		}
	}
	app.stage.addChild(crosswordSquares);
}