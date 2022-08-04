document.getElementById('file').addEventListener('change', (e) => {
	const file = document.getElementById('file').files[0];

	if (file) {
		processFile(file);
	}
});

function processFile(file) {
	(async () => {
		const fileContent = await file.text();
		const puzzleInfo = JSON.parse(fileContent);
		createBoard(puzzleInfo);
	})();
}

let app = null;
let squareSize = 34;
let squareFont = 'Arial';
let boardWidth;
let boardHeight;
PIXI.settings.FILTER_RESOLUTION = 4;
function createBoard(info) {
	console.log(info);
	boardWidth = info.dimensions.width;
	boardHeight = info.dimensions.height;
	app = new PIXI.Application({ width: (boardWidth * 36) + 2, height: (boardHeight * 36) + 2, resolution: 4, antialias: true })
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.view.style.width = `${(boardWidth * 36) + 2}px`;
    render.view.style.height = `${(boardHeight * 36) + 2}px`;
    render.autoResize = true;
    app.render();
    console.log(document.childNodes);
    const inputField = document.childNodes.row.getElementById("input");
	document.body.insertBefore(app.view, inputField);
	document.body.addEventListener("keydown", (event) => keyPress(event.key));
	for (let row in info.puzzle) {
		let squarePosition = 0;
		for (const [index, square] of Object.entries(info.puzzle[row])) {
			if (square == "#") {
				squarePosition++;
				continue;
			}
			let squareContainer = new PIXI.Container();
			app.stage.addChild(squareContainer);
			let squareX = (squarePosition * (squareSize + 2)) + 2;
			let squareY = (row * (squareSize + 2)) + 2;
			squareContainer.x = squareX;
			squareContainer.y = squareY;
			squareContainer.height = squareSize;
			squareContainer.width = squareSize;
			squareContainer.name = `${squarePosition},${row}`;
			let crosswordSquare = new PIXI.Graphics();
			crosswordSquare.beginFill(0xffffff);
			crosswordSquare.drawRect(0, 0, squareSize, squareSize);
			crosswordSquare.interactive = true;
			crosswordSquare.sizeX = squareSize;
			crosswordSquare.sizeY = squareSize;
			crosswordSquare.squareX = squareX;
			crosswordSquare.squareY = squareY;
			crosswordSquare.name = `${squarePosition},${row}`;
			crosswordSquare.on('click', (event) => onClick(crosswordSquare));
			squarePosition++;
			squareContainer.addChild(crosswordSquare);
			if(square != 0 && typeof square == 'number') {
				const text = new PIXI.Text(String(square),{fontFamily: squareFont, fontSize: 12, fill : 0x000000, align : 'left'});
				text.x = 1;
				text.y = -1;
				text.name = `numberedSquare`;
				crosswordSquare.addChild(text);
			}
		}
	}
 //    let clueContainer = new PIXI.Container();
 //    app.stage.addChild(clueContainer);
 //    clueContainer.x = (boardWidth * 36) + 2;
 //    clueContainer.y = 2;
 //    clueContainer.height = (boardHeight * 36) + 2;
	// clueContainer.width = 500;
	// let clueArea = new PIXI.Graphics();
	// clueArea.beginFill(0xffffff);
	// clueArea.drawRect(0, 0, 500, (boardHeight * 36) - 2);
	// clueArea.beginFill(0x333333);
	// clueArea.drawRect(249, 0, 2, (boardHeight * 36) - 2);
	// clueContainer.addChild(clueArea);
}

function findWordStart(position) {
	let newSpot = null;
	let spotCheck = [parseInt(position[0]) + 1, parseInt(position[1])];
	while (!newSpot) {
		newSpot = app.stage.getChildByName(`${spotCheck[0]},${spotCheck[1]}`);
		if(!currentHighlight.across) {
			spotAbove = app.stage.getChildByName(`${spotCheck[0]},${spotCheck[1] - 1}`);
			if(spotAbove) {
				newSpot = null;
			}
		} else {
			spotBehind = app.stage.getChildByName(`${spotCheck[0] - 1},${spotCheck[1]}`);
			if(spotBehind) {
				newSpot = null;
			}
		}
		if(spotCheck[1] >= boardHeight && spotCheck[0] >= boardWidth) {
			currentHighlight.across = !currentHighlight.across
			spotCheck = [0, 0];
		} else if(!newSpot && spotCheck[0] > boardWidth) {
			spotCheck[0] = 0;
			spotCheck[1]++;
		} else if(!newSpot) {
			spotCheck[0]++;
		}
	}	
	return newSpot.children[0];
}

// function findWordEnd(position) {
// 	let newSpot = null;
// 	let spotCheck = [parseInt(position[0]) - 1, parseInt(position[1])];
// 	while (!newSpot) {
// 		newSpot = app.stage.getChildByName(`${spotCheck[0]},${spotCheck[1]}`);
// 		if(spotCheck[1] < 0 && spotCheck[0] < 0) {
// 			currentHighlight.across = !currentHighlight.across
// 			spotCheck = [boardWidth, boardHeight];
// 		} else if(!newSpot && spotCheck[0] < 0) {
// 			spotCheck[0] = boardWidth;
// 			spotCheck[1]--;
// 		} else if(!newSpot) {
// 			spotCheck[0]--;
// 		}
// 	}	
// 	return newSpot.children[0];
// }

function keyPress(key) {
	if(currentHighlight.object) {
		let clickedPos = currentHighlight.object.name.split(",");
		//Arrow Movement
		if(key == "Enter") {
			let newSpot = findWordStart(clickedPos);
			return setHighlight(newSpot);
		}
		if(key == "ArrowLeft") {
			if(!currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = app.stage.getChildByName(`${parseInt(clickedPos[0]) - 1},${clickedPos[1]}`);
			if(newSpot) {
				currentHighlight.across = true;
				return setHighlight(newSpot.children[0]);
			}
		}
		if(key == "ArrowRight") {
			if(!currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = app.stage.getChildByName(`${parseInt(clickedPos[0]) + 1},${clickedPos[1]}`);
			if(newSpot) {
				currentHighlight.across = true;
				return setHighlight(newSpot.children[0]);
			}
		}
		if(key == "ArrowDown") {
			if(currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = app.stage.getChildByName(`${clickedPos[0]},${parseInt(clickedPos[1]) + 1}`);
			if(newSpot) {
				currentHighlight.across = false;
				return setHighlight(newSpot.children[0]);
			}
		}
		if(key == "ArrowUp") {
			if(currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = app.stage.getChildByName(`${clickedPos[0]},${parseInt(clickedPos[1]) - 1}`);
			if(newSpot) {
				currentHighlight.across = false;
				return setHighlight(newSpot.children[0]);
			}
		}
		if(key == "Delete" || key == "Backspace") {
			if(currentHighlight.object.children[0] ? (currentHighlight.object.children[currentHighlight.object.children.length - 1].name == 'guess') : currentHighlight.object.children[0])  {
				currentHighlight.object.children[currentHighlight.object.children.length - 1].destroy();
			}
			let newSpot = app.stage.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) - 1},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) - 1}`));
			if(newSpot) {
				return setHighlight(newSpot.children[0]);
			} else {
				// newSpot = findWordEnd(clickedPos);
				// setHighlight(newSpot);
			}
		}
		if (key.length == 1) {
				if(currentHighlight.object.children[0] ? (currentHighlight.object.children[currentHighlight.object.children.length - 1].name == 'guess') : currentHighlight.object.children[0])  {
					currentHighlight.object.children[currentHighlight.object.children.length - 1].destroy();
				}
				const letter = new PIXI.Text(key.toUpperCase(),{fontFamily : squareFont, fontSize: 26, fill : 0x000000, align : 'left'});
				letter.anchor.set(0.5);
				letter.x = currentHighlight.object.sizeX/2;
				letter.y = (currentHighlight.object.sizeY/8) * 5;
				letter.name = 'guess';
				currentHighlight.object.addChild(letter);
				let newSpot = app.stage.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) + 1},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) + 1}`));
				if(newSpot) {
					return setHighlight(newSpot.children[0]);
				}
		}
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
				let leftData = leftSquare.children[0];
				currentHighlight.otherSquares.push(leftData);
				leftData.tint = 0xbfe5ff;
			} else {
				leftDone = true;
			}
			if (rightSquare && !rightDone) {
				let rightData = rightSquare.children[0];
				currentHighlight.otherSquares.push(rightData);
				rightData.tint = 0xbfe5ff;
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