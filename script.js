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

let app = new PIXI.Application({ width: 360, height: 360});
function createBoard(info) {
	console.log(info);
	let boardWidth = info.dimensions.width;
	let boardHeight = info.dimensions.height;
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.autoResize = true;
    render.resize((boardWidth * 36) + 2, (boardHeight * 36) + 2);
    app.render();
    const inputField = document.getElementById("input");
	document.body.insertBefore(app.view, inputField);
	document.body.addEventListener("keydown", (event) => keyPress(event.key));
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
			crosswordSquare.name = `${squarePosition},${row}`;
			crosswordSquare.squareX = squareX;
			crosswordSquare.squareY = squareY;
			crosswordSquare.on('click', (event) => onClick(crosswordSquare));
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

function keyPress(key) {
	key = key[0];
	if(currentHighlight.object) {
		console.log(currentHighlight.object.children[0]);
		if(currentHighlight.object.children[0] ? (currentHighlight.object.children[0].name == 'guess') : currentHighlight.object.children[0])  {
			currentHighlight.object.children[0].destroy();
		}
		const letter = new PIXI.Text(key.toUpperCase(),{fontFamily : 'Arial', fontSize: 28, fill : 0x000000, align : 'center'});
		letter.x = currentHighlight.object.squareX + 7;
		letter.y = currentHighlight.object.squareY + 2;
		letter.name = 'guess';
		currentHighlight.object.addChild(letter);
	}
}

function onClick(object) {
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
		let search = true;
		let squareDistance = 1;
		let leftDone = false;
		let rightDone = false;
		while(search) {
			let leftSquare = app.stage.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) - squareDistance},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) - squareDistance}`));
			let rightSquare = app.stage.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) + squareDistance},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) + squareDistance}`));
			if (leftSquare && !leftDone) {
				currentHighlight.otherSquares.push(leftSquare);
				leftSquare.tint = 0xbfe5ff;
			} else {
				leftDone = true;
			}
			if (rightSquare && !rightDone) {
				currentHighlight.otherSquares.push(rightSquare);
				rightSquare.tint = 0xbfe5ff;
			} else {
				rightDone = true;
			}
			if(leftDone && rightDone) {
				search = false;
				break;
			}

			squareDistance++;
		}

}