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
let across = null;
let down = null;
let squareSize = 34;
let squareFont = 'Arial';
let boardWidth;
let boardHeight;
PIXI.settings.FILTER_RESOLUTION = 4;
function createBoard(info) {
	console.log(info);
	boardWidth = info.dimensions.width;
	boardHeight = info.dimensions.height;
	let acrossClueHeight = info.clues.Across.length;
	let downClueHeight = info.clues.Down.length;
	app = new PIXI.Application({ width: (boardWidth * 36) + 2, height: (boardHeight * 36) + 2, resolution: 4, antialias: true });
	across = new PIXI.Application({ width: 250, height: (acrossClueHeight * 36), resolution: 4, antialias: true });
	down = new PIXI.Application({ width: 250, height: (downClueHeight * 36), resolution: 4, antialias: true });
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.view.style.width = `${(boardWidth * 36) + 2}px`;
    render.view.style.height = `${(boardHeight * 36) + 2}px`;
    render.autoResize = true;
    app.render();
		let acrossRender = across.renderer;
		acrossRender.backgroundColor = 0x00ff00;
	    acrossRender.view.style.position = "absolute";
	    acrossRender.view.style.display = "block";
	    acrossRender.view.style.width = `250px`;
	    acrossRender.autoResize = true;
	    across.render();
			let downRender = down.renderer;
			downRender.backgroundColor = 0x0000ff;
		    downRender.view.style.position = "absolute";
		    downRender.view.style.display = "block";
		    downRender.view.style.width = `250px`;
		    downRender.autoResize = true;
		    down.render();

    const inputField = document.getElementById("row").querySelectorAll(".puzzle")[0].querySelectorAll(".input")[0];
	document.getElementById("row").querySelectorAll(".puzzle")[0].insertBefore(app.view, inputField);
	document.getElementById("row").querySelectorAll(".puzzle")[0].style.width = `${(boardWidth * 36) + 2}px`;
	document.getElementById("row").querySelectorAll(".puzzle")[0].style.height = `${(boardHeight * 36) + 2}px`;

	const acrossField = document.getElementById("row").querySelectorAll(".clues")[0].querySelectorAll(".across")[0];
	document.getElementById("row").querySelectorAll(".clues")[0].insertBefore(across.view, acrossField);
	document.getElementById("row").querySelectorAll(".clues")[0].style.height = `${(boardHeight * 36) + 2}px`;

	const downField = document.getElementById("row").querySelectorAll(".clues")[1].querySelectorAll(".down")[0];
	document.getElementById("row").querySelectorAll(".clues")[1].insertBefore(down.view, downField);
	document.getElementById("row").querySelectorAll(".clues")[1].style.height = `${(boardHeight * 36) + 2}px`;

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
			crosswordSquare.on('click', (event) => onSquareClick(crosswordSquare));
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
	let distanceDown = 0;
	for (const [index, acrossClue] of Object.entries(info.clues.Across)) {
		const clue = new PIXI.Text(`${String(acrossClue[0])}: ${String(acrossClue[1])}`,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left', wordWrap : true, wordWrapWidth: 250});
		let clueRect = clue.getLocalBounds();
		console.log(clueRect);
		let clueContainer = new PIXI.Container();
		let clueSpotHeight = clueRect.height + 15;
		across.stage.addChild(clueContainer);
		clueContainer.y = distanceDown;
		distanceDown += clueSpotHeight;
		clueContainer.height = clueSpotHeight;
		clueContainer.width = 250;
		clueContainer.name = `${acrossClue[0]}`;
		let clueInfo = new PIXI.Graphics();
		clueInfo.beginFill(0xffffff);
		clueInfo.drawRect(0, 0, 250, clueSpotHeight);
		clueInfo.interactive = true;
		clueInfo.name = `${acrossClue[0]}`;
		clueInfo.on('click', (event) => onClueClick(clueInfo));
		clueContainer.addChild(clueInfo);
		clue.anchor.set(0, 0.5);
		clue.y = (clueSpotHeight) / 2;
		clue.name = `${acrossClue[0]}`;
		clueInfo.addChild(clue);
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

let currentClue = null;
function onClueClick(object) {
	if(currentClue) {
		currentClue.tint = 0xffffff;
	}
	object.tint = 0xbfe5ff;
	currentClue = object;
}

function onSquareClick(object) {
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