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
	let app = new PIXI.Application({ width: (boardWidth * 36) + 2, height: (boardHeight * 36) + 2 });
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.autoResize = true;
    app.render();
    const inputField = document.getElementById("input");
	document.body.insertBefore(app.view, inputField);
	let crosswordSquares = new PIXI.Graphics();
	crosswordSquares.beginFill(0xffffff);
	for (let row in info.puzzle) {
		let squarePosition = 0;
		for (const [index, square] of Object.entries(info.puzzle[row])) {
			console.log(square);
			if (square == "#") {continue;}
			crosswordSquares.drawRect((row * 36) + 2, (squarePosition * 36) + 2, 34, 34);
			squarePosition++;
		}
	}
	app.stage.addChild(crosswordSquares);
}