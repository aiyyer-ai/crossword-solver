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
			let squareX = (squarePosition * 36) + 2;
			let squareY = (row * 36) + 2;
			crosswordSquare.beginFill(0xffffff);
			crosswordSquare.drawRect(squareX, squareY, 34, 34);
			crosswordSquare.interactive = true;
			crosswordSquare.on('pointerdown', (event) => onClick(crosswordSquare));
			squarePosition++;
			app.stage.addChild(crosswordSquare);
			if(square != 0 && typeof square == 'number') {
				const text = new PIXI.Text(String(square),{fontFamily : 'Arial', fontSize: 12, fill : 0x000000, align : 'left'});
				text.x = squareX;
				text.y = squareY;
				crosswordSquare.addChild(text);
			}
		}
	}
}

function onClick(object) {
	setHighlight(object);
}

let currentHighlight = {across:true, object:null};
function setHighlight(object) {
	if(object == currentHighlight.object) {
		currentHighlight.across = !currentHighlight.across;
	}
	currentHighlight.object.tint = 0x000000;
	currentHighlight.object = object;
	object.tint = 0xfae522;
	//object.tint = 0xbfe5ff;
}