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
let allSquares = null;
let across = null;
let down = null;
let acrossClueContainer = null;
let scrollbuttonAcross = null;
let downClueContainer = null;
let scrollbuttonDown = null;
let clueStartHeight = 0;
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
	let scrollbarWidth = 15;
	let clueWidth = 250 + scrollbarWidth;
	app = new PIXI.Application({ width: (boardWidth * 36) + 2, height: (boardHeight * 36) + 2, resolution: 4, antialias: true });
	across = new PIXI.Application({ width: clueWidth, height: (boardHeight * 36) + 2, resolution: 4, antialias: true });
	down = new PIXI.Application({ width: clueWidth, height: (boardHeight * 36) + 2, resolution: 4, antialias: true });
	let render = app.renderer;
	render.backgroundColor = 0x000000;
    render.view.style.position = "absolute";
    render.view.style.display = "block";
    render.view.style.width = `${(boardWidth * 36) + 2}px`;
    render.view.style.height = `${(boardHeight * 36) + 2}px`;
    render.autoResize = true;
    app.render();
		let acrossRender = across.renderer;
		acrossRender.backgroundColor = 0xff00ff;
	    acrossRender.view.style.position = "absolute";
	    acrossRender.view.style.display = "block";
	    acrossRender.view.style.width = `${clueWidth}px`;
	    acrossRender.autoResize = true;
	    across.render();
			let downRender = down.renderer;
			downRender.backgroundColor = 0x00ffff;
		    downRender.view.style.position = "absolute";
		    downRender.view.style.display = "block";
		    downRender.view.style.width = `${clueWidth}px`;
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

	allSquares = new PIXI.Container();
	app.stage.addChild(allSquares);
	for (let row in info.puzzle) {
		let squarePosition = 0;
		for (let [index, square] of Object.entries(info.puzzle[row])) {
			if (square == "#") {
				squarePosition++;
				continue;
			}
			let squareContainer = new PIXI.Container();
			allSquares.addChild(squareContainer);
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
			if (square.style) {
				crosswordSquare.lineStyle(1, 0x000000, 1);
				crosswordSquare.drawCircle(squareSize/2, squareSize/2, (squareSize/2));
				square = square.cell;
			}
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
				clueNumber = square;
				text.x = 1;
				text.y = -1;
				text.name = String(square);
				crosswordSquare.addChild(text);
			}
		}
	}

	generateSquareNumbers();

	//acrossClues
	let acrossContainer = new PIXI.Container();
	acrossClueContainer = new PIXI.Container();
	across.stage.addChild(acrossContainer);
	acrossContainer.addChild(acrossClueContainer);
	let acrossText = new PIXI.Text(` ACROSS `,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left',  fontWeight : 'bold' });
	let acrossTextRect = acrossText.getLocalBounds();
	clueStartHeight = acrossTextRect.height;
	acrossClueContainer.distanceDown = clueStartHeight;
	let acrossBacking = new PIXI.Graphics();
	acrossBacking.beginFill(0xffffff);
	acrossBacking.drawRect(0, 0, 250, acrossTextRect.height);
	acrossBacking.zIndex = 2;
	acrossContainer.addChild(acrossBacking);
	let acrossLine = new PIXI.Graphics();
	acrossLine.beginFill(0xe5e5e5);
	acrossLine.drawRect(0, 0, 245, 1);
	acrossText.zIndex = 3;
	acrossLine.zIndex = 3;
	acrossContainer.addChild(acrossLine);
	acrossLine.y = clueStartHeight;
	acrossContainer.addChild(acrossText);
	acrossClueContainer.zIndex = 1;

	for (const [index, acrossClue] of Object.entries(info.clues.Across)) {
		const clueNum = new PIXI.Text(` ${String(acrossClue[0])}  `,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left',  fontWeight : 'bold' });
		let clueNumRect = clueNum.getLocalBounds();
		const clue = new PIXI.Text(`${String(acrossClue[1])}`,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left', wordWrap : true, wordWrapWidth: (245 - clueNumRect.width)});
		let clueRect = clue.getLocalBounds();
		let clueContainer = new PIXI.Container();
		let clueSpotHeight = clueRect.height + 16;
		acrossClueContainer.addChild(clueContainer);
		clueContainer.y = acrossClueContainer.distanceDown;
		acrossClueContainer.distanceDown += clueSpotHeight;
		clueContainer.height = clueSpotHeight;
		clueContainer.width = 250;
		clueContainer.name = `${acrossClue[0]}`;
		let clueInfo = new PIXI.Graphics();
		clueInfo.beginFill(0xffffff);
		clueInfo.drawRect(0, 0, 250, clueSpotHeight);
		clueInfo.interactive = true;
		clueInfo.name = `${acrossClue[0]}`;
		clueInfo.dir = `up`;
		clueInfo.on('click', (event) => onClueClick(clueInfo));
		clueContainer.addChild(clueInfo);
		clue.anchor.set(0, 0.5);
		clue.y = (clueSpotHeight) / 2;
		clue.x = clueNumRect.width;
		clueNum.y = 8;
		clue.name = `${acrossClue[0]}`;
		clueInfo.addChild(clueNum);
		clueInfo.addChild(clue);
	}

	//lets create a scrollbar here
	let scrollbarContainerAcross = new PIXI.Container();
	across.stage.addChild(scrollbarContainerAcross);
	scrollbarContainerAcross.x = 250;
	scrollbarContainerAcross.width = scrollbarWidth;
	scrollbarContainerAcross.height = (boardHeight * 36) + 2;
	scrollbarContainerAcross.name = `scrollbarContainerAcross`;
	let scrollbarAcross = new PIXI.Graphics();
	scrollbarAcross.beginFill(0xe5e5e5);
	scrollbarAcross.drawRect(0, 0, scrollbarWidth, (boardHeight * 36) + 2);
	scrollbarAcross.interactive = true;
	scrollbarAcross.on('click', (event) => onScrollbarClick(scrollbuttonAcross, event, acrossClueContainer));
	scrollbarContainerAcross.addChild(scrollbarAcross);
	scrollbuttonAcross = new PIXI.Graphics();
	let scrollbuttonSizeAcross = (((boardHeight * 36) + 2) / acrossClueContainer.distanceDown) * ((boardHeight * 36) + 2);
	scrollbuttonAcross.beginFill(0x7e7e7e);
	scrollbuttonAcross.drawRect(0, 0, scrollbarWidth, scrollbuttonSizeAcross);
	scrollbuttonAcross.interactive = true;
	scrollbuttonAcross.name = `scrollbuttonAcross`;
	//acrossClueContainer.on('pointerover', (event) => onOver(scrollbuttonAcross, event, acrossClueContainer, across));
	scrollbuttonAcross.on('pointerover', (event) => onScrollOver(scrollbuttonAcross));
	scrollbuttonAcross.on('pointerdown', (event) => onScrollClick(scrollbuttonAcross, event, across));
	scrollbuttonAcross.on('pointermove', (event) => onScrollDrag(scrollbuttonAcross, event, acrossClueContainer));
	scrollbuttonAcross.on('pointerout', (event) => offScrollOver(scrollbuttonAcross));
	scrollbarContainerAcross.addChild(scrollbuttonAcross);



	//downClues
	let downContainer = new PIXI.Container();
	downClueContainer = new PIXI.Container();
	down.stage.addChild(downContainer);
	downContainer.addChild(downClueContainer);
	let downText = new PIXI.Text(` DOWN `,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left',  fontWeight : 'bold' });
	let downTextRect = downText.getLocalBounds();
	downClueContainer.distanceDown = clueStartHeight;
	let downBacking = new PIXI.Graphics();
	downBacking.beginFill(0xffffff);
	downBacking.drawRect(0, 0, 250, clueStartHeight);
	downBacking.zIndex = 2;
	downContainer.addChild(downBacking);
	let downLine = new PIXI.Graphics();
	downLine.beginFill(0xe5e5e5);
	downLine.drawRect(0, 0, 245, 1);
	downText.zIndex = 3;
	downLine.zIndex = 3;
	downContainer.addChild(downLine);
	downLine.y = clueStartHeight;
	downContainer.addChild(downText);
	downClueContainer.zIndex = 1;

	//adds clues to the mix
	for (const [index, downClue] of Object.entries(info.clues.Down)) {
		const clueNum = new PIXI.Text(` ${String(downClue[0])}  `,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left',  fontWeight : 'bold' });
		let clueNumRect = clueNum.getLocalBounds();
		const clue = new PIXI.Text(`${String(downClue[1])}`,{fontFamily: squareFont, fontSize: 18, fill : 0x333333, align : 'left', wordWrap : true, wordWrapWidth: (245 - clueNumRect.width)});
		let clueRect = clue.getLocalBounds();
		let clueContainer = new PIXI.Container();
		let clueSpotHeight = clueRect.height + 16;
		downClueContainer.addChild(clueContainer);
		clueContainer.y = downClueContainer.distanceDown;
		downClueContainer.distanceDown += clueSpotHeight;
		clueContainer.height = clueSpotHeight;
		clueContainer.width = 250;
		clueContainer.name = `${downClue[0]}`;
		let clueInfo = new PIXI.Graphics();
		clueInfo.beginFill(0xffffff);
		clueInfo.drawRect(0, 0, 250, clueSpotHeight);
		clueInfo.interactive = true;
		clueInfo.name = `${downClue[0]}`;
		clueInfo.dir = `down`;
		clueInfo.on('click', (event) => onClueClick(clueInfo));
		clueContainer.addChild(clueInfo);
		clue.anchor.set(0, 0.5);
		clue.y = (clueSpotHeight) / 2;
		clue.x = clueNumRect.width;
		clueNum.y = 8;
		clue.name = `${downClue[0]}`;
		clueInfo.addChild(clueNum);
		clueInfo.addChild(clue);
	}

	//lets create a scrollbar here
	let scrollbarContainerDown = new PIXI.Container();
	down.stage.addChild(scrollbarContainerDown);
	scrollbarContainerDown.x = 250;
	scrollbarContainerDown.width = scrollbarWidth;
	scrollbarContainerDown.height = (boardHeight * 36) + 2;
	scrollbarContainerDown.name = `scrollbarContainerDown`;
	let scrollbarDown = new PIXI.Graphics();
	scrollbarDown.beginFill(0xe5e5e5);
	scrollbarDown.drawRect(0, 0, scrollbarWidth, (boardHeight * 36) + 2);
	scrollbarDown.interactive = true;
	scrollbarDown.on('click', (event) => onScrollbarClick(scrollbuttonDown, event, downClueContainer));
	scrollbarContainerDown.addChild(scrollbarDown);
	scrollbuttonDown = new PIXI.Graphics();
	let scrollbuttonSizeDown = (((boardHeight * 36) + 2) / downClueContainer.distanceDown) * ((boardHeight * 36) + 2);
	scrollbuttonDown.beginFill(0x7e7e7e);
	scrollbuttonDown.drawRect(0, 0, scrollbarWidth, scrollbuttonSizeDown);
	scrollbuttonDown.interactive = true;
	scrollbuttonDown.name = `scrollbuttonDown`;
	//downClueContainer.on('pointerover', (event) => onOver(scrollbuttonDown, event, downClueContainer, down));
	scrollbuttonDown.on('pointerover', (event) => onScrollOver(scrollbuttonDown));
	scrollbuttonDown.on('pointerdown', (event) => onScrollClick(scrollbuttonDown, event, down));
	scrollbuttonDown.on('pointermove', (event) => onScrollDrag(scrollbuttonDown, event, downClueContainer));
	scrollbuttonDown.on('pointerout', (event) => offScrollOver(scrollbuttonDown));
	scrollbarContainerDown.addChild(scrollbuttonDown);

	document.body.onpointerup = (event) => offScrollClick(scrollbuttonAcross, scrollbuttonDown, event);

	//end
}

//scrollbar Functions

function onScrollbarClick(scrollbutton, event, clueContainer) {
	let scrollbuttonRect = scrollbutton.getLocalBounds();
	let halfwayScrollbutton = Math.floor(scrollbuttonRect.height/2);
	if((event.data.global.y + halfwayScrollbutton) > ((boardHeight * 36) + 2)) {
		scrollbutton.y = ((boardHeight * 36) + 2) - scrollbuttonRect.height;
		adjustCluePosition(scrollbutton, clueContainer);
	} else if((event.data.global.y - halfwayScrollbutton) < 0) {
		scrollbutton.y = 0;
		adjustCluePosition(scrollbutton, clueContainer);
	} else {
		scrollbutton.y = event.data.global.y - halfwayScrollbutton;
		adjustCluePosition(scrollbutton, clueContainer);
	}
}

function onScrollClick(scrollbutton, event, clueApp) {
	scrollbutton.tint = 0x616161;
	scrollbutton.heightDifference = scrollbutton.y - event.data.global.y;
	clueApp.view.setPointerCapture(event.data.originalEvent.pointerId);
	scrollbutton.dragging = true;
}

function onScrollDrag(scrollbutton, event, clueContainer) {
	if(scrollbutton.dragging) {
		let scrollbuttonRect = scrollbutton.getLocalBounds();
		if((event.data.global.y + scrollbutton.heightDifference) > 0 && (event.data.global.y + scrollbutton.heightDifference + scrollbuttonRect.height) < ((boardHeight * 36) + 2)) {
			scrollbutton.y = event.data.global.y + scrollbutton.heightDifference;
			adjustCluePosition(scrollbutton, clueContainer);
		} else {
			scrollbutton.y = ((event.data.global.y + scrollbutton.heightDifference) <= 0) ? 0 : (((boardHeight * 36) + 2) - scrollbuttonRect.height);
			adjustCluePosition(scrollbutton, clueContainer);
		}
	}
}

function offScrollClick(scrollbuttonAcross, scrollbuttonDown, event) {
	if(scrollbuttonAcross.dragging) {
		scrollbuttonAcross.tint = 0xffffff;
		scrollbuttonAcross.heightDifference = 0;
		across.view.releasePointerCapture(event.pointerId);
		scrollbuttonAcross.dragging = false;
	}

	if(scrollbuttonDown.dragging) {
		scrollbuttonDown.tint = 0xffffff;
		scrollbuttonDown.heightDifference = 0;
		down.view.releasePointerCapture(event.pointerId);
		scrollbuttonDown.dragging = false;
	}
}

function onScrollOver(scrollbutton) {
	scrollbutton.tint = 0xaeaeae;
}

function offScrollOver(scrollbutton) {
	scrollbutton.tint = 0xffffff;
}

function adjustCluePosition(scrollbutton, clueContainer) {
	let scrolledToY = Math.floor(scrollbutton.y/((boardHeight * 36) + 2) * clueContainer.distanceDown);
	clueContainer.y = -scrolledToY;
}

function adjustScrollBar(desiredY, scrollbutton, clueContainer) {
	if((event.data.global.y + scrollbutton.heightDifference) > 0 && (event.data.global.y + scrollbutton.heightDifference + scrollbuttonRect.height) < ((boardHeight * 36) + 2)) {
		scrollbutton.y = (desiredY/clueContainer.distanceDown) * ((boardHeight * 36) + 2);
		adjustCluePosition(scrollbutton, clueContainer);
	} else {
		scrollbutton.y = ((event.data.global.y + scrollbutton.heightDifference) <= 0) ? 0 : (((boardHeight * 36) + 2) - scrollbuttonRect.height);
		adjustCluePosition(scrollbutton, clueContainer);
	}
}

//Clue Functions

function onOver(scrollbutton, event, clueContainer, clueApp) {
	clueApp.view.onwheel = (e) => {
		scrollbutton.y += e.DeltaY;
		adjustCluePosition(scrollbutton, clueContainer);
	};

}


//on Start Function

function generateSquareNumbers() {
	allSquares.children.forEach( (childSquare) => {
		let squarePos = childSquare.name.split(",");
		childSquare.clues = {across:null, down:null};
		childSquare.clues.across = findClueNum(squarePos, 'left');
		childSquare.clues.down = findClueNum(squarePos, 'up');
	})
}

function findClueNum(position, dir) {
	let newSpot = null;
	let spotCheck = [parseInt(position[0]), parseInt(position[1])];
	while (!newSpot) {
		newSpot = allSquares.getChildByName(`${spotCheck[0]},${spotCheck[1]}`);
		if(dir == `up`) {
			spotAbove = allSquares.getChildByName(`${spotCheck[0]},${spotCheck[1] - 1}`);
			if(spotAbove) {
				newSpot = null;
				spotCheck[1] = spotCheck[1] - 1;
			}
		} else {
			spotBehind = allSquares.getChildByName(`${spotCheck[0] - 1},${spotCheck[1]}`);
			if(spotBehind) {
				newSpot = null;
				spotCheck[0] = spotCheck[0] - 1;
			}
		}
	}	
	return newSpot.children[0].children[0].name;
}


//Crossword Functions

function findWordStart(position) {
	let newSpot = null;
	let spotCheck = [parseInt(position[0]) + 1, parseInt(position[1])];
	while (!newSpot) {
		newSpot = allSquares.getChildByName(`${spotCheck[0]},${spotCheck[1]}`);
		if(!currentHighlight.across) {
			spotAbove = allSquares.getChildByName(`${spotCheck[0]},${spotCheck[1] - 1}`);
			if(spotAbove) {
				newSpot = null;
			}
		} else {
			spotBehind = allSquares.getChildByName(`${spotCheck[0] - 1},${spotCheck[1]}`);
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

function findNextAvailableSpot(position, dir) {
	let newSpot = null;
	let spotCheck = [parseInt(position[0]), parseInt(position[1])];
	while (!newSpot) {
		switch(dir) {
		  case `up`:
		    spotCheck = [spotCheck[0], spotCheck[1] - 1];
		    break;
		  case `down`:
		    spotCheck = [spotCheck[0], spotCheck[1] + 1];
		    break;
		  case `left`:
		    spotCheck = [spotCheck[0] - 1, spotCheck[1]];
		    break;
		  case `right`:
		    spotCheck = [spotCheck[0] + 1, spotCheck[1]];
		    break;
		  default:
		  	spotCheck = [spotCheck[0], spotCheck[1]];
		}
		if(spotCheck[0] < 0 || spotCheck[0] > boardWidth) {
			spotCheck = [parseInt(position[0]), parseInt(position[1])];
		}
		if(spotCheck[1] < 0 || spotCheck[1] > boardHeight) {
			spotCheck = [parseInt(position[0]), parseInt(position[1])];
		}
		newSpot = allSquares.getChildByName(`${spotCheck[0]},${spotCheck[1]}`);
	}	
	return newSpot.children[0];
}

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
			let newSpot = allSquares.getChildByName(`${parseInt(clickedPos[0]) - 1},${clickedPos[1]}`);
			if(newSpot) {
				currentHighlight.across = true;
				return setHighlight(newSpot.children[0]);
			} else {
				let newSpot = findNextAvailableSpot(clickedPos, `left`);
				return setHighlight(newSpot);
			}
		}
		if(key == "ArrowRight") {
			if(!currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = allSquares.getChildByName(`${parseInt(clickedPos[0]) + 1},${clickedPos[1]}`);
			if(newSpot) {
				currentHighlight.across = true;
				return setHighlight(newSpot.children[0]);
			} else {
				let newSpot = findNextAvailableSpot(clickedPos, `right`);
				return setHighlight(newSpot);
			}
		}
		if(key == "ArrowDown") {
			if(currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = allSquares.getChildByName(`${clickedPos[0]},${parseInt(clickedPos[1]) + 1}`);
			if(newSpot) {
				currentHighlight.across = false;
				return setHighlight(newSpot.children[0]);
			} else {
				let newSpot = findNextAvailableSpot(clickedPos, `down`);
				return setHighlight(newSpot);
			}
		}
		if(key == "ArrowUp") {
			if(currentHighlight.across) {
				return setHighlight(currentHighlight.object);
			}
			let newSpot = allSquares.getChildByName(`${clickedPos[0]},${parseInt(clickedPos[1]) - 1}`);
			if(newSpot) {
				currentHighlight.across = false;
				return setHighlight(newSpot.children[0]);
			} else {
				let newSpot = findNextAvailableSpot(clickedPos, `up`);
				return setHighlight(newSpot);
			}
		}
		if(key == "Delete" || key == "Backspace") {
			if(currentHighlight.object.children[0] ? (currentHighlight.object.children[currentHighlight.object.children.length - 1].name == 'guess') : currentHighlight.object.children[0])  {
				currentHighlight.object.children[currentHighlight.object.children.length - 1].destroy();
			}
			let newSpot = allSquares.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) - 1},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) - 1}`));
			if(newSpot) {
				return setHighlight(newSpot.children[0]);
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
				let newSpot = allSquares.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) + 1},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) + 1}`));
				if(newSpot) {
					return setHighlight(newSpot.children[0]);
				}
		}
	}
}

let currentClue = {across:null, down:null};
function onClueClick(object) {
	if(object.dir == `down`) {
		if(currentClue.down && object != currentClue.down) {
			currentClue.down.tint = 0xffffff;
		}
		object.tint = 0xbfe5ff;
		currentClue.down = object;
	} else {
		if(currentClue.across && object != currentClue.across) {
			currentClue.across.tint = 0xffffff;
		}
		object.tint = 0xbfe5ff;
		currentClue.across = object;		
	}

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
	let clueAcross = acrossClueContainer.getChildByName(clickee.parent.clues.across);
	let clueDown = downClueContainer.getChildByName(clickee.parent.clues.down);
	clueAcross.children[0].tint = 0xbfe5ff;
	clueDown.children[0].tint = 0xbfe5ff;
	currentHighlight.otherSquares.push(clueAcross.children[0]);
	currentHighlight.otherSquares.push(clueDown.children[0]);
	let scrollAbutton = across.stage.getChildByName(`scrollbarContainerAcross`).getChildByName(`scrollbuttonAcross`);
	let scrollBbutton = down.stage.getChildByName(`scrollbarContainerDown`).getChildByName(`scrollbuttonDown`);
	adjustScrollBar(clueAcross.y - clueStartHeight, scrollAbutton, acrossClueContainer);
	adjustScrollBar(clueDown.y - clueStartHeight, scrollBbutton, downClueContainer);
	//tints the line of squares around
	let clickedPos = clickee.name.split(",");
	//clickedPos[0] = x // clickedPos[1] = y //
		let search = true;
		let squareDistance = 1;
		let leftDone = false;
		let rightDone = false;
		while(search) {
			let leftSquare = allSquares.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) - squareDistance},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) - squareDistance}`));
			let rightSquare = allSquares.getChildByName((currentHighlight.across ? `${parseInt(clickedPos[0]) + squareDistance},${clickedPos[1]}` : `${clickedPos[0]},${parseInt(clickedPos[1]) + squareDistance}`));
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