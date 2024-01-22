//Start of File Handling
	//Checks for File Change event
document.getElementById('file').addEventListener('change', (e) => {
	const file = document.getElementById('file').files[0];

	if (file) {
		processFile(file);
	}
});

	//Proper ipuz file setup, rejects files not set up in this way
const properArray = {
  "solution": [],
  "kind": ["http://ipuz.org/crossword#1"],
  "author": "",
  "puzzle": [],
  "origin": "CrossFire encoder v1",
  "block": "#",
  "title": "",
  "version": "http://ipuz.org/v2",
  "empty": "0",
  "dimensions": {
    "width": 0,
    "height": 0
  },
  "clues": {
    "Down": [],
    "Across": []
  }
};

	//checks for all events related to files
const box = document.getElementById("input");
document.body.ondragover = (event) => dragOverHandler(event);
document.body.ondragenter = (event) => dragOverHandler(event);
document.body.ondrop = (event) => drop(event);
document.body.ondragend = (event) => dragEnd(event);
document.body.ondragleave = (event) => dragEnd(event);

	//says what to do on end of drag event
function dragEnd(event) {
	event.stopPropagation();
	event.preventDefault();
	box.setAttribute("class", "input");
}

	//says what to do on drag over event
function dragOverHandler(event) {
	event.stopPropagation();
	event.preventDefault();
	box.setAttribute("class", "input dragover");
}

	//says what to do on drop event
function drop(event) {
	event.stopPropagation();
	event.preventDefault();
	if (event.dataTransfer.files[0]) {
		const file = event.dataTransfer.files[0];
		if (file) {
			processFile(file);
		}
	}
}

	//Processes the file
function processFile(file) {
	(async () => {
		const fileContent = await file.text();
		try {
			const puzzleInfo = JSON.parse(fileContent);
			let UsedInfo = checkJSONContent(puzzleInfo, properArray);
			if(UsedInfo) {
				createBoard(UsedInfo);
			} else {
				throw 'Error: Invalid JSON';
			}

		} catch(e) {
			let choice = document.getElementById("choice");
			let wrong = document.getElementById("wrong");
			choice.setAttribute("class", "box__file");
			wrong.setAttribute("class", "wrong");
		}
	})();
}

	//Makes sure that the file has the proper configuration
function checkJSONContent(info, propArray) {
	var safeInfo = {};
	try {
		if(typeof info.kind[0] !== "string") {
			return null;
		}
		if(info.kind[0] !== propArray.kind[0]) {
			return null;
		}
        Object.keys(propArray).forEach(function(prop) {
            if (info.hasOwnProperty(prop)) {
                safeInfo[prop] = info[prop];
            }
        });
        return safeInfo;
	} catch(e) {
		console.log(e);
		return null;
	}
}

//Start game code
let gridCanvas, drawOnGrid, fileDropArea, acrossCanvas, drawAcrosses, titleField, drawTitle;

let crosswordBlack = `#000000`;
let crosswordWhite = `#ffffff`;
let crosswordText = `#333333`;
let crosswordScrollBar = `#e5e5e5`;
let crosswordScrollButton = `#7e7e7e`;
let crosswordWrongRed = `#ff4d4d`;
let crosswordHighlightPrimary = `#fae522`;
let crosswordHighlightSecondary = `#bfe5ff`;
let crosswordCorrect = `#005c99`;
let shiftDown = false;

let squareSize = 34;
let squareFont = 'Arial';
let filledAnswers = {};
let checkedCorrect = {};

function createBoard(info) {
	box.setAttribute("class", "input uploaded");
	boardWidth = info.dimensions.width;
	boardHeight = info.dimensions.height;
	let acrossClueHeight = info.clues.Across.length;
	let downClueHeight = info.clues.Down.length;
	let scrollbarWidth = 15;
	let clueWidth = 250 + scrollbarWidth;

	//removes drop area blank space
	fileDropArea = document.getElementById('input');
	fileDropArea.style.width = "0px";
	fileDropArea.style.height = "0px";

	//creates the grid Region
	gridCanvas = createCanvas((boardWidth * 36) + 2, (boardHeight * 36) + 2, 'gridCanvas');
  drawOnGrid = gridCanvas.getContext('2d');
  drawOnGrid.beginPath();
  drawOnGrid.fillRect(0, 0, drawOnGrid.canvas.width, drawOnGrid.canvas.height);

  //creates overlay for numbers
  numberCanvas = createCanvas((boardWidth * 36) + 2, (boardHeight * 36) + 2, 'numberCanvas');
  numbersOnGrid = numberCanvas.getContext('2d');

  //creates overlay for text later
  textCanvas = createCanvas((boardWidth * 36) + 2, (boardHeight * 36) + 2, 'textCanvas');
  textOnGrid = textCanvas.getContext('2d');

  //This is a jank solution
  fakeCanvas = createCanvas((boardWidth * 36) + 2, (boardHeight * 36) + 2, 'fakeCanvas');
  fakeOnGrid = fakeCanvas.getContext('2d');

	titleCard = document.getElementById('flexy');
	titleCard.style.width = `${(boardWidth * 36) + 2}px`;
	titleCard.style.height = `${(boardHeight * 36) + 2}px`;

  //creates the timer/title region
  //titleCanvas = document.getElementById("timer");
  //drawTitle = titleCanvas.getContext('2d');
	//drawTitle.font = "30px Arial";
	//drawTitle.fillText("Hello World", 10, 50); 

	//adds the squares to the grid
	var gridSquares = {};
	var downNumbers = [];
	var acrossNumbers = [];
	var downObject = {};
	var acrossObject = {};
	for (let clueData of info.clues.Across) {
		acrossNumbers.push(clueData[0]);
	}
	for (let clueData of info.clues.Down) {
		downNumbers.push(clueData[0]);
	}
	for (let row in info.puzzle) {
	let squarePosition = 0;
		for (let [index, square] of Object.entries(info.puzzle[row])) {
			//skips black squares
			if (square == "#") {
				squarePosition++;
				continue;
			}

			//sets X and Y values
			let squareX = (squarePosition * (squareSize + 2)) + 2;
			let squareY = (row * (squareSize + 2)) + 2;

			//draws the white squares
			drawOnGrid.beginPath();
			drawOnGrid.fillStyle = crosswordWhite;
			drawOnGrid.fillRect(squareX, squareY, squareSize, squareSize);
			gridSquares[`${squareX},${squareY}`] = info.solution[row][squarePosition];

			//checks if a circle exists in a spot and draws it
			if (square.style) {
				numbersOnGrid.beginPath();
				numbersOnGrid.arc(squareX + (squareSize/2), squareY + (squareSize/2), squareSize/2, 0, 2 * Math.PI);
				numbersOnGrid.stroke();
				square = square.cell;
			}

			//draws in the text for numbered squares on an overlay
			if(square != 0 && typeof square == 'number') {
				if(acrossNumbers.includes(square)) {
					acrossObject[acrossNumbers[acrossNumbers.indexOf(square)]] = `${squareX},${squareY}`;
				}
				if(downNumbers.includes(square)) {
					downObject[downNumbers[downNumbers.indexOf(square)]] = `${squareX},${squareY}`;
				}
				numbersOnGrid.beginPath();
				numbersOnGrid.fillStyle = "black";
				numbersOnGrid.font = `12px ${squareFont}`;
				numbersOnGrid.fillText(String(square), squareX + 1, squareY + 11); 
				
			}
			squarePosition++;
		}
	}

	//adds in the across clues
	let acrossClueHolder = document.getElementById("acrossclue");
	let acrossClueTopper = document.getElementById("acrosstopper");
	acrossClueHolder.style.height = `${(boardHeight * 36) - 33}px`;
	acrossClueTopper.style.height = `33px`;
	acrossClueTopper.innerHTML = `<b>ACROSS</b><br><hr>`;
	var lastDivMade = document.getElementById("insertacross");
	for (const [index, acrossClue] of Object.entries(info.clues.Across)) {
		let clueWrapper = document.createElement("div");
		let clueNumber = document.createElement("span");
		let clueText = document.createElement("span");
		clueWrapper.id = `${String(acrossClue[0])}A,div`;
		clueNumber.id = `${String(acrossClue[0])}A,Number`;
		clueText.id = `${String(acrossClue[0])}A,Text`;
		let clueNumberContent = document.createTextNode(`${String(acrossClue[0])}`);
		let clueTextContent = document.createTextNode(`${acrossClue[1]}`);
		clueNumber.appendChild(clueNumberContent);
		clueText.appendChild(clueTextContent);
		clueWrapper.style.fontSize = `0px`;
		clueWrapper.style.paddingTop = `12px`;
		clueWrapper.style.paddingBottom = `12px`;
		clueNumber.style.width = `18px`;
		clueNumber.style.fontSize = `18px`;
		clueNumber.style.fontWeight = `bold`;
		clueNumber.style.marginRight = `10px`;
		clueNumber.style.paddingLeft = `5px`;
		//This line isnt working and also I need to add an indent or something
		//clueNumber.style.textAlign = `right`;
		clueText.style.fontSize = `18px`;
		clueWrapper.appendChild(clueNumber);
		clueWrapper.appendChild(clueText);
		clueWrapper.style.cursor = "pointer";
		acrossClueHolder.insertBefore(clueWrapper, lastDivMade);
		//lastDivMade = document.getElementById(`${String(acrossClue[0])}A`);
	}

	//adds in the down clues
	let downClueHolder = document.getElementById("downclue");
	let downClueTopper = document.getElementById("downtopper");
	downClueHolder.style.height = `${(boardHeight * 36) - 33}px`;
	downClueTopper.style.height = `33px`;
	downClueTopper.innerHTML = `<b>DOWN</b><br><hr>`;
	var lastDivMade = document.getElementById("insertdown");
	for (const [index, downClue] of Object.entries(info.clues.Down)) {
		let clueWrapper = document.createElement("div");
		let clueNumber = document.createElement("span");
		let clueText = document.createElement("span");
		clueWrapper.id = `${String(downClue[0])}D,div`;
		clueNumber.id = `${String(downClue[0])}D,Number`;
		clueText.id = `${String(downClue[0])}D,Text`;
		let clueNumberContent = document.createTextNode(`${String(downClue[0])}`);
		let clueTextContent = document.createTextNode(`${downClue[1]}`);
		clueNumber.appendChild(clueNumberContent);
		clueText.appendChild(clueTextContent);
		clueWrapper.style.fontSize = `0px`;
		clueWrapper.style.paddingTop = `12px`;
		clueWrapper.style.paddingBottom = `12px`;
		clueNumber.style.width = `18px`;
		clueNumber.style.fontSize = `18px`;
		clueNumber.style.fontWeight = `bold`;
		clueNumber.style.marginRight = `10px`;
		clueNumber.style.paddingLeft = `5px`;
		//This line isnt working and also I need to add an indent or something
		//clueNumber.style.textAlign = `right`;
		clueText.style.fontSize = `18px`;
		clueWrapper.appendChild(clueNumber);
		clueWrapper.appendChild(clueText);
		clueWrapper.style.cursor = "pointer";
		downClueHolder.insertBefore(clueWrapper, lastDivMade);
		//lastDivMade = document.getElementById(`${String(acrossClue[0])}A`);
	}

	var prevClick = [];
	var clueLast = [];
	var gridOppNext = [];
	var gridOppLast = [];
	var acrossDirection = true;
	var leftOffset = -gridCanvas.offsetParent.offsetLeft + gridCanvas.clientLeft;
	var topOffset = -gridCanvas.offsetParent.offsetTop + gridCanvas.clientTop;
	//On Click event handling
	document.body.addEventListener('click', selectSquare, false);

	//on input event handling
	var inputlist = [];
	document.body.addEventListener('keypress', function(event) {

		let keyPress = event.key.toUpperCase();

		//handles pressing enter
		if(keyPress == 'BACKSPACE') {
			return;
		}
		if(keyPress == 'ENTER') {
			let moveDirection = 1;
			if(shiftDown) {
				moveDirection = -1;
			}

	    //finds the clue
	    let clueDirection = acrossDirection ? "A" : "D";
	    let clueObjectKeys = acrossDirection ? Object.keys(acrossObject) : Object.keys(downObject);
	    let clueObject = acrossDirection ? acrossObject : downObject;
	    let clueCoordsClicked = gridLast[gridLast.length - 1] ? gridLast[gridLast.length - 1] : prevClick.join(",");
	    let clueNumberClicked = clueObjectKeys.find(key => clueObject[key] === clueCoordsClicked);
	    let firstFind = false;
	    let iteration = 1;
	    let directionChange = false;
	    let clueSearching = true;
	    let clueTest;
	    while (clueSearching) {
		    clueTest = `${parseInt(clueNumberClicked) + iteration*moveDirection}${clueDirection}`;
		    let clueTo = document.getElementById(`${clueTest},div`);
		    if(iteration < 100) {
		    	if(clueTo) {
		    		if(!firstFind) {
		    			firstFind = clueTest;
		    		}
				    if(!(clueTo.style.color == `rgb(126, 126, 126)`)) {
				    	clueSearching = false;
				    }
		    	}
			    iteration++;			    	
		    } else {
		    	if(!directionChange) {
		    		acrossDirection = !acrossDirection;
		    		iteration = 0;
		    		clueNumberClicked = 1;
		    		clueDirection = acrossDirection ? "A" : "D";
		    		directionChange = true;
		    	} else {
		    		clueTest = firstFind;
		    		clueSearching = false;
		    	}
		    }
	    }

    	//gets X and Y locations on the board
    	let moverData = {};
    	let cluePosition;
    	if(clueTest.slice(-1) == "A") {
    		cluePosition = acrossObject[clueTest.slice(0, -1)].split(",");
    		acrossDirection = true;
    	} else {
    		cluePosition = downObject[clueTest.slice(0, -1)].split(",");
    		acrossDirection = false;
    	}

    	//highlights boxes on the board
    	moverData["pageX"] = parseInt(cluePosition[0]) - leftOffset;
			moverData["pageY"] = parseInt(cluePosition[1]) - topOffset;
			return selectSquare(moverData);


			// let moverData = {};
			// let squareOne = gridLast[gridLast.length - 1] ? gridLast[gridLast.length - 1] : prevClick.join(",");
			// let moveDirection = 1;
			// let directionValues;
			// let notDirectionValues;
			// if(shiftDown) {
			// 	moveDirection = -1;
			// }
			// if(acrossDirection) {
			// 	directionValues = Object.values(acrossObject);
			// 	notDirectionValues = Object.values(downObject);
			// } else {
			// 	directionValues = Object.values(downObject);
			// 	notDirectionValues = Object.values(acrossObject);
			// }
			// let findLocation = typeof directionValues[directionValues.indexOf(squareOne) + moveDirection] === "undefined" ? -1 : directionValues.indexOf(squareOne);
			// let nextSquareInGrid;
			// if(findLocation == -1) {
			// 	if(moveDirection == -1) {
			// 		findLocation = notDirectionValues.length;
			// 		nextSquareInGrid = notDirectionValues[findLocation + moveDirection].split(",").map(Number);
			// 	}
			// 	acrossDirection = !acrossDirection
			// }
			// if(!nextSquareInGrid) {
			// 	 nextSquareInGrid = directionValues[findLocation + moveDirection].split(",").map(Number);
			// }
			// moverData["pageX"] = (nextSquareInGrid[0] - leftOffset);
			// moverData["pageY"] = (nextSquareInGrid[1] - topOffset);

			// selectSquare(moverData);
			// return;
		}

		//takes all other printable keys
		//KEEPS TRACK OF CORRECT LETTERS
		if(keyPress == gridSquares[prevClick.join(",")]) {
			filledAnswers[prevClick.join(",")] = true;
		} else {
			filledAnswers[prevClick.join(",")] = keyPress;
		}

		let otherSquaresInWord = [];
		if(acrossDirection) {
			otherSquaresInWord[0] = directionalGridNext['right'].concat(directionalGridNext['left']);
			otherSquaresInWord[1] = directionalGridNext['up'].concat(directionalGridNext['down']);
		} else {
			otherSquaresInWord[1] = directionalGridNext['right'].concat(directionalGridNext['left']);
			otherSquaresInWord[0] = directionalGridNext['up'].concat(directionalGridNext['down']);					
		}
		if(otherSquaresInWord[0].some(gridSquare => (!!filledAnswers[gridSquare]) == false)) {
			clueLast[0].style.color = "black";
		} else {
			clueLast[0].style.color = crosswordScrollButton;
		}
		if(otherSquaresInWord[1].some(gridSquare => (!!filledAnswers[gridSquare]) == false)) {
			clueLast[1].style.color = "black";
		} else {
			clueLast[1].style.color = crosswordScrollButton;
		}

		textOnGrid.clearRect(prevClick[0], prevClick[1], squareSize + 2, squareSize + 2);
		textOnGrid.beginPath();
		textOnGrid.fillStyle = "black";
		textOnGrid.font = `26px ${squareFont}`;
		textOnGrid.textAlign = "center";
		textOnGrid.fillText(String(keyPress), prevClick[0] + squareSize/2, prevClick[1] + (squareSize * (7/8) + 1));

		if(Object.values(filledAnswers).filter((value) => value == true).length == Object.keys(gridSquares).length) {
			openTheForm();
		}

		let moverData = {};
		if(acrossDirection) {		
			moverData["pageX"] = (prevClick[0] + squareSize + 10 - leftOffset);
			moverData["pageY"] = (prevClick[1] + 5 - topOffset);
		} else {
			moverData["pageX"] = (prevClick[0] + 5 - leftOffset);
			moverData["pageY"] = (prevClick[1] + squareSize + 10 - topOffset);
		}
		selectSquare(moverData);


	}, false);

	document.body.addEventListener('keyup', function(event) {
		switch (event.which) {
			case 16:
				shiftDown = false;
				break;
			default:
		}
	});

	//on keydown event handling, used for arrow keys and backspace
	document.body.addEventListener('keydown', function(event) {
		let moverData = {};
		switch (event.which) {
		//backspace
			case 46:
			case 8:
				if(filledAnswers[prevClick.join(",")]) {
					textOnGrid.clearRect(prevClick[0], prevClick[1], squareSize + 2, squareSize + 2);
					filledAnswers[prevClick.join(",")] = false;
					clueLast[0].style.color = "black";
					clueLast[1].style.color = "black";
				} else {
					if(!gridLast[0]) {break;}
					if(acrossDirection) {		
						let alteredBox = [prevClick[0] - (squareSize + 2), prevClick[1]];
						textOnGrid.clearRect(alteredBox[0], alteredBox[1], squareSize + 2, squareSize + 2);
						filledAnswers[alteredBox.join(",")] = false;
						moverData["pageX"] = (alteredBox[0] + 10 - leftOffset);
						moverData["pageY"] = (alteredBox[1] + 5 - topOffset);
					} else {
						let alteredBox = [prevClick[0], prevClick[1] - (squareSize + 2)];
						textOnGrid.clearRect(alteredBox[0], alteredBox[1], squareSize + 2, squareSize + 2);
						filledAnswers[alteredBox.join(",")] = false;
						moverData["pageX"] = (alteredBox[0] + 5 - leftOffset);
						moverData["pageY"] = (alteredBox[1] + 10 - topOffset);
					}
					selectSquare(moverData);	
				}
				break;
			case 16:
				shiftDown = true;
				break;
		//left
			case 37:
				if(!acrossDirection) {
					moverData["pageX"] = (prevClick[0] + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);
				} else {
					moverData["pageX"] = (prevClick[0] - squareSize + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);					
				}
				selectSquare(moverData, true, -1, 0);
				break;
		//up
			case 38:
				if(acrossDirection) {
					moverData["pageX"] = (prevClick[0] + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);
				} else {
					moverData["pageX"] = (prevClick[0] + 5 - leftOffset);
					moverData["pageY"] = (prevClick[1] - squareSize + 10 - topOffset);				
				}
				selectSquare(moverData, true, 0, -1);
				break;
		//right
			case 39:
				if(!acrossDirection) {
					moverData["pageX"] = (prevClick[0] + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);
				} else {
					moverData["pageX"] = (prevClick[0] + squareSize + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);			
				}
				selectSquare(moverData, true, 1, 0);
				break;
		//down
			case 40:
				if(acrossDirection) {
					moverData["pageX"] = (prevClick[0] + 10 - leftOffset);
					moverData["pageY"] = (prevClick[1] + 5 - topOffset);
				} else {
					moverData["pageX"] = (prevClick[0] + 5 - leftOffset);
					moverData["pageY"] = (prevClick[1] + squareSize + 10 - topOffset);			
				}
				selectSquare(moverData, true, 0, 1);
				break;
		//ignore rest
			default:
				break;
		}

	}, false);
	function selectSquare(event, notFromClue = true, arrowkeyX = false, arrowkeyY = false) {
		var clickX = event.pageX + leftOffset,
        clickY = event.pageY + topOffset;
    //find spot on grid to place
    var gridX = (Math.floor(clickX / (squareSize + 2)) * (squareSize + 2)) + 2,
    		gridY = (Math.floor(clickY / (squareSize + 2)) * (squareSize + 2)) + 2;
    //Checks if you clicked a clue
    let clueTest = 'A';
    if(event.target) {
    	clueTest = event.target.id.split(",")[0];
    }
    if(clueTest.match(/^\d/)) {
    	//gets X and Y locations on the board
    	let moverData = {};
    	let cluePosition;
    	if(clueTest.slice(-1) == "A") {
    		cluePosition = acrossObject[clueTest.slice(0, -1)].split(",");
    		acrossDirection = true;
    	} else {
    		cluePosition = downObject[clueTest.slice(0, -1)].split(",");
    		acrossDirection = false;
    	}

    	//highlights boxes on the board
    	moverData["pageX"] = parseInt(cluePosition[0]) - leftOffset;
			moverData["pageY"] = parseInt(cluePosition[1]) - topOffset;
			return selectSquare(moverData, false);
    }
    if(!arrowkeyX && !arrowkeyY) {
    	if(!Object.keys(gridSquares).includes(`${gridX},${gridY}`)) {
    		return false; 
    	} 
    	if(filledAnswers[`${gridX},${gridY}`]) {
    		if(!event.type) {
	    		moverData["pageX"] = event.pageX + (Number(acrossDirection) * (squareSize + 2));
	    		moverData["pageY"] = event.pageY + (Number(!acrossDirection) * (squareSize + 2));
	    		return selectSquare(moverData);
    		}
    	}
    } else {
    	if(!Object.keys(gridSquares).includes(`${gridX},${gridY}`)) {
    		if(gridX < gridCanvas.clientWidth && gridY < gridCanvas.clientHeight && gridX > 0 && gridY > 0) {
	    		let moverData = {};
	    		moverData["pageX"] = event.pageX + arrowkeyX * (squareSize);
	    		moverData["pageY"] = event.pageY + arrowkeyY * (squareSize);
	    		selectSquare(moverData, true, arrowkeyX, arrowkeyY);
    		}
    		return false; 
    	}
    }

    if(clueLast[0]) {
    	clueLast[0].style.backgroundColor = "";
    	clueLast[1].style.backgroundColor = "";
    }
    if(prevClick[0]) {
    	drawOnGrid.beginPath();
			drawOnGrid.fillStyle = crosswordWhite;
			drawOnGrid.fillRect(prevClick[0], prevClick[1], squareSize, squareSize);
			let blueSquares;
			blueSquares = directionalGridNext['right'].concat(directionalGridNext['left'].concat(directionalGridNext['up'].concat(directionalGridNext['down'])));
			for (square of blueSquares) {
				let blueSquareArray = square.split(",");
	    	drawOnGrid.beginPath();
				drawOnGrid.fillStyle = crosswordWhite;
				drawOnGrid.fillRect(blueSquareArray[0], blueSquareArray[1], squareSize, squareSize);				
			}
    }
    if(prevClick[0] == gridX && prevClick[1] == gridY && notFromClue) {
    	acrossDirection = !acrossDirection;
    }

    prevClick = [gridX, gridY];
  	drawOnGrid.beginPath();
		drawOnGrid.fillStyle = crosswordHighlightPrimary;
		drawOnGrid.fillRect(gridX, gridY, squareSize, squareSize);
		colorClueSquares(gridX, gridY);
		//colorNextSquares(gridX, gridY);
		//colorLastSquares(gridX, gridY);


    //highlights the clues
    let clueDirection = acrossDirection ? "A" : "D";
    let clueOppositeDirection = acrossDirection ? "D" : "A";
    let clueObjectKeys = acrossDirection ? Object.keys(acrossObject) : Object.keys(downObject);
    let clueOppositeObjectKeys = acrossDirection ? Object.keys(downObject) : Object.keys(acrossObject);
    let clueObject = acrossDirection ? acrossObject : downObject;
    let clueOppositeObject = acrossDirection ? downObject : acrossObject;
		let clueOppositeObjectValues = acrossDirection ? Object.values(downObject) : Object.values(acrossObject);
    let clueCoordsClicked = gridLast[gridLast.length - 1] ? gridLast[gridLast.length - 1] : `${gridX},${gridY}`;
    let clueNumberClicked = clueObjectKeys.find(key => clueObject[key] === clueCoordsClicked);
    let cluePosition = [gridX, gridY];
    let clueThis = document.getElementById(`${clueNumberClicked}${clueDirection},div`);
    let clueOppositeCoords = clueOppositeObjectValues.filter((coordPair) => {
    		let result;
    		if(acrossDirection) {
    			result = coordPair.split(",")[0] == cluePosition[0];
    		} else {
    			result = coordPair.split(",")[1] == cluePosition[1];
    		}
    		return result;
			}).reduce((coordPairA, coordPairB) => {
				let compareToB;
				let compareToA;
				if(acrossDirection) {
					compareToB = (cluePosition[1] - coordPairB.split(",")[1]) < 0 ? 10000 : (cluePosition[1] - coordPairB.split(",")[1]);
					compareToA = (cluePosition[1] - coordPairA.split(",")[1]) < 0 ? 10000 : (cluePosition[1] - coordPairA.split(",")[1]);					
				} else {
					compareToB = (cluePosition[0] - coordPairB.split(",")[0]) < 0 ? 10000 : (cluePosition[0] - coordPairB.split(",")[0]);
					compareToA = (cluePosition[0] - coordPairA.split(",")[0]) < 0 ? 10000 : (cluePosition[0] - coordPairA.split(",")[0]);							
				}
				return compareToB < compareToA ? coordPairB : coordPairA;
		}); 
		let clueOppositeNumberClicked = clueOppositeObjectKeys.find(key => clueOppositeObject[key] === clueOppositeCoords);
    let clueOpposite = document.getElementById(`${clueOppositeNumberClicked}${clueOppositeDirection},div`);
  	clueThis.style.backgroundColor = crosswordHighlightSecondary;
  	clueOpposite.style.backgroundColor = crosswordScrollBar;
  	clueThis.scrollIntoView({behavior: "smooth"});
  	clueOpposite.scrollIntoView({behavior: "smooth"});
  	clueLast[0] = clueThis;
  	clueLast[1] = clueOpposite;    


	}

	//let checkDirections = {left:true, right:true, up:true, down:true};
	var directionalSearch = {left:true, right:true, up:true, down:true};
	var directionalGridNext = {left: [], right: [], up: [], down: []};
	let moverData = {"pageX": 10 - leftOffset, "pageY": 5 - topOffset};
	selectSquare(moverData, true, 1, 0);
	function colorClueSquares(gridX, gridY) {
		directionalGridNext = {left: [], right: [], up: [], down: []}
		let iteration = 1;
		directionalSearch = {left:true, right:true, up:true, down:true};
		let stillSearching = true;
		while(stillSearching) {
			stillSearching = Object.values(directionalSearch).includes(true);
			let currentSquares = {left: `${gridX - iteration*(squareSize + 2)},${gridY}`, right: `${gridX + iteration*(squareSize + 2)},${gridY}`, up: `${gridX},${gridY - iteration*(squareSize + 2)}`, down: `${gridX},${gridY + iteration*(squareSize + 2)}`};
			for (searchDirection in currentSquares) {
				if(directionalSearch[searchDirection]) {
					if(!Object.keys(gridSquares).includes(currentSquares[searchDirection])) {
						directionalSearch[searchDirection] = false;
						continue;
					}
					directionalGridNext[searchDirection].push(currentSquares[searchDirection]);
				}
			}
			iteration++;			
		}
		if(acrossDirection) {
			for(gridLocation of directionalGridNext['right']) {
				let gridSpots = gridLocation.split(",");
				drawOnGrid.beginPath();
				drawOnGrid.fillStyle = crosswordHighlightSecondary;
				drawOnGrid.fillRect(gridSpots[0], gridSpots[1], squareSize, squareSize);
			}
			for(gridLocation of directionalGridNext['left']) {
				let gridSpots = gridLocation.split(",");
				drawOnGrid.beginPath();
				drawOnGrid.fillStyle = crosswordHighlightSecondary;
				drawOnGrid.fillRect(gridSpots[0], gridSpots[1], squareSize, squareSize);
			}
			gridLast = directionalGridNext['left'];
		} else {
			for(gridLocation of directionalGridNext['down']) {
				let gridSpots = gridLocation.split(",");
				drawOnGrid.beginPath();
				drawOnGrid.fillStyle = crosswordHighlightSecondary;
				drawOnGrid.fillRect(gridSpots[0], gridSpots[1], squareSize, squareSize);
			}
			for(gridLocation of directionalGridNext['up']) {
				let gridSpots = gridLocation.split(",");
				drawOnGrid.beginPath();
				drawOnGrid.fillStyle = crosswordHighlightSecondary;
				drawOnGrid.fillRect(gridSpots[0], gridSpots[1], squareSize, squareSize);
			}
			gridLast = directionalGridNext['up'];
		}

	}


//DEPRECIATED CODE
	// function colorNextSquares(gridX, gridY, changeFromStart = false) {
	// 	//forwarda
	// 	//need to create something here to track if its ever stopped before
	// 	// if(!changeFromStart) {
	// 	// 	changeFromStart = 0;
	// 	// }
	// 	// changeFromStart += (squareSize + 2);
	// 	// if((Object.values(checkDirections).filter((value) => value == false)).length == Object.values(checkDirections).length) {
	// 	// 	checkDirections = {left:true, right:true, up:true, down:true}
	// 	//  return;
	// 	//  }
	// 	if(acrossDirection) {
	// 		if(!Object.keys(gridSquares).includes(`${gridX + (squareSize + 2)},${gridY}`)) { return; }
	// 		gridNext.push(`${gridX + (squareSize + 2)},${gridY}`);
	// 		drawOnGrid.beginPath();
	// 		drawOnGrid.fillStyle = crosswordHighlightSecondary;
	// 		drawOnGrid.fillRect(gridX + (squareSize + 2), gridY, squareSize, squareSize);
	// 		colorNextSquares(gridX + (squareSize + 2), gridY);
	// 	} else {
	// 		if(!Object.keys(gridSquares).includes(`${gridX},${gridY + (squareSize + 2)}`)) { return; }
	// 		gridNext.push(`${gridX},${gridY + (squareSize + 2)}`);
	// 		drawOnGrid.beginPath();
	// 		drawOnGrid.fillStyle = crosswordHighlightSecondary;
	// 		drawOnGrid.fillRect(gridX, gridY + (squareSize + 2), squareSize, squareSize);
	// 		colorNextSquares(gridX, gridY + (squareSize + 2));
	// 	}
	// }

	// function colorLastSquares(gridX, gridY) {
	// 	//backward
	// 	if(acrossDirection) {
	// 		if(!Object.keys(gridSquares).includes(`${gridX - (squareSize + 2)},${gridY}`)) { return; }
	// 		gridLast.push(`${gridX - (squareSize + 2)},${gridY}`);
	// 		drawOnGrid.beginPath();
	// 		drawOnGrid.fillStyle = crosswordHighlightSecondary;
	// 		drawOnGrid.fillRect(gridX - (squareSize + 2), gridY, squareSize, squareSize);
	// 		colorLastSquares(gridX - (squareSize + 2), gridY);
	// 	} else {
	// 		if(!Object.keys(gridSquares).includes(`${gridX},${gridY - (squareSize + 2)}`)) { return; }
	// 		gridLast.push(`${gridX},${gridY - (squareSize + 2)}`);
	// 		drawOnGrid.beginPath();
	// 		drawOnGrid.fillStyle = crosswordHighlightSecondary;
	// 		drawOnGrid.fillRect(gridX, gridY - (squareSize + 2), squareSize, squareSize);
	// 		colorLastSquares(gridX, gridY - (squareSize + 2));
	// 	}
	// }

	function createCanvas(width, height, canvasName, set2dTransform = true) {
	  const ratio = Math.ceil(window.devicePixelRatio) + 3;
	  const canvas = document.getElementById(`${canvasName}`);
	  canvas.width = width * ratio;
	  canvas.height = height * ratio;
	  canvas.style.width = `${width}px`;
	  canvas.style.height = `${height}px`;
	  if (set2dTransform) {
	    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
	  }
	  return canvas;
	}

	let flexy = document.getElementById('flexy');
	let timerButton = document.getElementById('update');
	timerButton.style.cursor = "pointer";

	let checkDiv = document.createElement("div");
	checkDiv.id = "checking";
	let checkButton = document.createElement("button");
	checkButton.innerHTML = "Check";
	checkButton.id = "button";
	checkButton.onclick = function(){
		checkGrid();
		return;
	}
	checkDiv.appendChild(checkButton);
	if(info.author || info.title) {
		let infoDiv = document.createElement("div");
		let titleDiv = document.createElement("div");
		let authorDiv = document.createElement("div");
		infoDiv.id = "infoDiv";
		titleDiv.id = "titleDiv";
		authorDiv.id = "authorDiv";
		titleDiv.innerHTML = `${info.title ? info.title : `The Crossword`}`;
		authorDiv.innerHTML = `by ${info.author ? info.author : `Unknown`}`;
		infoDiv.appendChild(titleDiv);
		infoDiv.appendChild(authorDiv);
		flexy.insertBefore(infoDiv, timerButton);
	}
	flexy.insertBefore(checkDiv, timerButton.nextSibling);
	flexy.style.height = `100px`;

	function checkGrid() {
		for(answerLocation in filledAnswers) {
			if(filledAnswers[answerLocation] !== true && filledAnswers[answerLocation] !== false) {
				textOnGrid.beginPath();
				textOnGrid.lineWidth = 2;
				textOnGrid.strokeStyle = crosswordWrongRed;
				let splitLocation = answerLocation.split(",");
				textOnGrid.moveTo(splitLocation[0], splitLocation[1]);
				textOnGrid.lineTo(parseInt(splitLocation[0]) + squareSize, parseInt(splitLocation[1]) + squareSize);
				textOnGrid.stroke();
			} else {
				//this is where I would make blue and unable to interact IF I HAD ONE.
			}
		}
		return;
	}

	function openTheForm() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    prevTime = null;
		timerButton.removeEventListener('click', changeTimer);
		timerButton.innerHTML = `${timerButton.innerHTML.replace(`◼`, ``)}`;
		let finishPopup = document.createElement("div");
		finishPopup.id = "popup";
		finishPopup.style.display = "block";
		finishPopup.style.height = `${430/1.3}px`;
		finishPopup.style.width = `430px`;
		finishPopup.style.backgroundColor = crosswordWhite;
		finishPopup.style.position = `fixed`;
		finishPopup.style.zIndex = `10`;
		finishPopup.style.textAlign = `center`;
		finishPopup.style.top = `100px`;
		finishPopup.style.left = `50%`;
		finishPopup.style.fontSize = `45px`;
		finishPopup.style.translate = (`-50%`, `-50%`);
		finishPopup.style.boxShadow = `10px 10px 30px ${crosswordScrollButton}`;
		let finish = document.createElement("span");
		let timerFin = document.createElement("span");
		let closeButton = document.createElement("button");
		let popupContent = document.createTextNode(`APPLAUSE.WAV`);
		let timeSections = timerButton.innerHTML.split(":");
		let popupContent2 = document.createElement("div");
		popupContent2.innerHTML = `You solved ${info.title ? info.title : `The Crossword`} in <br>${timeSections.length == 3 ? (parseInt(timeSections[0]) + " hours <br>" + parseInt(timeSections[1]) + " minutes and <br>" + parseInt(timeSections[2]) + " seconds") : (parseInt(timeSections[0]) + " minutes and <br>" + parseInt(timeSections[1]) + " seconds")}.`;
		finish.appendChild(popupContent);
		timerFin.appendChild(popupContent2);
		finish.style.display = `table`;
		timerFin.style.display = `block`;
		finish.style.margin = `auto`;
		finish.style.marginTop = `25px`;
		finish.style.fontWeight = `bold`;
		timerFin.style.fontSize = `35px`;
		timerFin.style.textAlign = `center`;
		timerFin.style.marginTop = `15px`;
		timerFin.style.paddingLeft = `10px`;
		timerFin.style.paddingRight = `10px`;
		timerFin.style.fontFamily = `Arial`;
		finish.style.fontFamily = `Arial`;
		closeButton.addEventListener("click", closeTheForm);
		closeButton.id = `button2`;
		closeButton.innerHTML = 'Close';
		finishPopup.appendChild(finish);
		finishPopup.appendChild(timerFin);
		finishPopup.appendChild(closeButton);
		//finishPopup.style.top = `${((boardHeight * 36) + 2)/2 - 250 - topOffset}px`;
		//finishPopup.style.left = `${((boardWidth * 36) + 2)/2 - (500/1.618)/2 - leftOffset}px`;
		let overlay = document.getElementById("overlay");
		overlay.style.display = "block";
		document.body.insertBefore(finishPopup, overlay);
	}

	function closeTheForm() {
	  document.getElementById("popup").style.display = "none";
	  document.getElementById("overlay").style.display = "none";
	}

  

	var prevTime, stopwatchInterval, elapsedTime = 0;

	changeTimer();
	  
	timerButton.addEventListener('click', changeTimer);

	function changeTimer() {
	  if (!stopwatchInterval) {
	    stopwatchInterval = setInterval(function () {
	      if (!prevTime) {
	        prevTime = Date.now();
	      }
	      
	      elapsedTime += Date.now() - prevTime;
	      prevTime = Date.now();
	      
	      updateTime();
	    }, 100);
	  } else {
	  	timerButton.innerHTML = `${timerButton.innerHTML.replace(`◼`, `▶`)}`;
	    clearInterval(stopwatchInterval);
	    stopwatchInterval = null;
	    prevTime = null;
	  }
	}
  
	  
	var updateTime = function () {
	  var tempTime = elapsedTime;
	  tempTime = Math.floor(tempTime / 1000);
	  var seconds = tempTime % 60;
	  tempTime = Math.floor(tempTime / 60);
	  var minutes = tempTime % 60;
	  tempTime = Math.floor(tempTime / 60);
	  var hours = tempTime % 60;
	  
	  var time = `${(hours < 10) ? ((hours == 0) ? "" : ("0" + hours) + `:`) : hours + `:`}${(minutes < 10) ? ("0" + minutes) : minutes}:${(seconds < 10) ? ("0" + seconds) : seconds}`;
	  
	  timerButton.innerHTML = `${time} ◼`;
	};

}
