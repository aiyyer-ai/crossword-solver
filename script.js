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
			crosswordSquare.name = `${squarePosition},${row}`
			crosswordSquare.on('pointerdown', (event) => onClick(crosswordSquare));
			squarePosition++;
			app.stage.addChild(crosswordSquare);
			if(square != 0 && typeof square == 'number') {
				const text = new PIXI.Text(String(square),{fontFamily : 'Arial', fontSize: 12, fill : 0x000000, align : 'left'});
				text.x = squareX;
				text.y = squareY;
				text.name = `numberedSquare`;
				crosswordSquare.addChild(text);
			}
		}
	}
}

function onClick(object) {
	console.log(object.name);
	setHighlight(object);
}

let currentHighlight = {across:true, object:null, otherSquares:[]};
function setHighlight(clickee) {
	//checks if its a double click, if so, swap across value
	if(clickee == currentHighlight.object) {
		currentHighlight.across = !currentHighlight.across;
	}
	//untints the previously clicked squares
	if(currentHighlight.object) {
		currentHighlight.object.tint = 0xffffff;
		for (const blueLight of currentHighlight.otherSquares) {
			blueLight.tint = 0xffffff;
		}
	}
	currentHighlight.object = clickee;
	clickee.tint = 0xfae522;
	//tints the line of squares around
	let clickedPos = clickee.name.split(",");
	//clickedPos[0] = x // clickedPos[1] = y //
	if(currentHighlight.across) {
		let goLeft = true;
		let currentLeft = parseInt(clickedPos[0]) - 1;
		while(goLeft) {
			let leftSquare = app.stage.getChildByName(`${currentLeft},${clickedPos[1]}`)
			if (!leftSquare) {goLeft = false;}
			currentHighlight.otherSquares.push(leftSquare);
			leftSquare.tint = 0xbfe5ff;
			if(leftSquare.getChildByName(`numberedSquare`)) {goLeft = false;}
			currentLeft = currentLeft--;
		}
		let goRight = true;
		let currentRight = parseInt(clickedPos[0]) + 1;
		while(goRight) {
			let rightSquare = app.stage.getChildByName(`${currentRight},${clickedPos[1]}`)
			if (!rightSquare) {goRight = false;}
			currentHighlight.otherSquares.push(rightSquare);
			rightSquare.tint = 0xbfe5ff;
			if(rightSquare.getChildByName(`numberedSquare`)) {goRight = false;}
			currentRight = currentRight++;
		}
	} else {

	}
}