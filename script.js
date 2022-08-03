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
	for (let row in info.puzzle) {
		let squarePosition = 0;
		for (const [index, square] of Object.entries(info.puzzle[row])) {
			if (square == "#") {
				squarePosition++;
				continue;
			}
			let crosswordSquare = new PIXI.Graphics();
			crosswordSquare.beginFill(0xffffff);
			crosswordSquare.drawRect((squarePosition * 36) + 2, (row * 36) + 2, 34, 34);
			squarePosition++;
			app.stage.addChild(crosswordSquare);
			if(square != 0) {
				const text = new PIXI.Text(String(square),{fontFamily : 'Arial', fontSize: 8, fill : 0x000000, align : 'left'});
				crosswordSquare.addChild(text);
			}
		}
	}
}