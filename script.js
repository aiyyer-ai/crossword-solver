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
let canvas, ctx
function createBoard(info) {
	box.setAttribute("class", "input uploaded");
	boardWidth = info.dimensions.width;
	boardHeight = info.dimensions.height;
	let acrossClueHeight = info.clues.Across.length;
	let downClueHeight = info.clues.Down.length;
	let scrollbarWidth = 15;
	let clueWidth = 250 + scrollbarWidth;
	canvas = document.getElementById('gridCanvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width = (boardWidth * 36) + 2;
  ctx.canvas.height = (boardHeight * 36) + 2;

  ctx.beginPath();
  ctx.strokeRect(50, 35, 50, 50);

  // filled square X: 125, Y: 35, width/height 50
  ctx.beginPath();
  ctx.fillRect(125, 35, 50, 50);

  ctx.beginPath();
  ctx.strokeRect(0, 0, (boardWidth * 36), (boardHeight * 36));

}
