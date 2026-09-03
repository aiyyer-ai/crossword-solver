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
var puzzleData;
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
                  if (UsedInfo) {
                        puzzleData = UsedInfo;
                        let puzzleDiv = document.getElementById("puzzle");
                        let svg = createSVGGrid({ parentElement: puzzleDiv });
                        addClues({ svg: svg });
                        addInputListeners();
                        addBottomInfo();
                        addTheTimer();
                  } else {
                        throw 'Error: Invalid JSON';
                  }

            } catch (e) {
                  let choice = document.getElementById("choice");
                  let wrong = document.getElementById("wrong");
                  choice.setAttribute("class", "box__file");
                  wrong.setAttribute("class", "wrong");
                  console.log(e);
            }
      })();
}

//Makes sure that the file has the proper configuration
function checkJSONContent(info, propArray) {
      var safeInfo = {};
      try {
            if (typeof info.kind[0] !== "string") {
                  return null;
            }
            if (info.kind[0] !== propArray.kind[0]) {
                  return null;
            }
            Object.keys(propArray).forEach(function (prop) {
                  if (info.hasOwnProperty(prop)) {
                        safeInfo[prop] = info[prop];
                  }
            });
            return safeInfo;
      } catch (e) {
            console.log(e);
            return null;
      }
}

let colors = {
      black: `#000000`,
      white: `#ffffff`,
      text: `#333333`,
      scrollBar: `#e5e5e5`,
      scrollButton: `#7e7e7e`,
      wrong: `#ff4d4d`,
      highlightPrimary: `#fae522`,
      highlightSecondary: `#bfe5ff`,
      correct: `#005c99`
}
let shiftDown = false;
let acrossDirection = true;
let paused = false;

let textInfo = {
      font: 'Arial',
      numSize: '12',
      charSize: '26'
}
let squareSize = 34;
let filledAnswers = {};
let checkedCorrect = {};

function clickOnCell(event) {
      selectCell({ cell: this });
}

function clickOnClue(event) {
      const cell = Array.from(document.querySelectorAll(`.cell`)).filter(cell => cell.character == this.clueNum)[0];
      if (this.direction == "A") {
            acrossDirection = true;
      } else {
            acrossDirection = false;
      }
      let textBox = cell.querySelector("#text");
      if(textBox.textContent == "") {
            selectCell({ cell: cell, fromClue: true });
      } else {
            let positionData = cell.id.split("/").map(Number);
            var directionalSearch = { left: true, right: true, up: true, down: true };
            let stillSearching = true;
            let iteration = 1;
            let neighbors = {
                  left: `${positionData[0] - 1}/${positionData[1]}`,
                  right: `${positionData[0] + 1}/${positionData[1]}`,
                  up: `${positionData[0]}/${positionData[1] - 1}`,
                  down: `${positionData[0]}/${positionData[1] + 1}`
            };
            while (stillSearching) {
                  stillSearching = Object.values(directionalSearch).includes(true);
                  let currentSquares = {
                        left: `${positionData[0] - iteration}/${positionData[1]}`,
                        right: `${positionData[0] + iteration}/${positionData[1]}`,
                        up: `${positionData[0]}/${positionData[1] - iteration}`,
                        down: `${positionData[0]}/${positionData[1] + iteration}`
                  };
                  for (searchDirection in currentSquares) {
                        if (directionalSearch[searchDirection]) {
                              let nextCell = document.getElementById(currentSquares[searchDirection]);
                              if (!nextCell || nextCell.character == "#") {
                                    neighbors[searchDirection] = null;
                                    directionalSearch[searchDirection] = false;
                                    continue;
                              } else {
                                    let textBox = nextCell.querySelector("#text");
                                    if (textBox.textContent != "") {
                                          continue;
                                    } else {
                                          neighbors[searchDirection] = currentSquares[searchDirection];
                                          directionalSearch[searchDirection] = false;
                                          continue;
                                    }
                              }
                        }
                  }
                  iteration++;
            }
            let primaryCell;
            if (!acrossDirection) {
                  primaryCell = document.getElementById(neighbors.down);
            } else {
                  primaryCell = document.getElementById(neighbors.right);
            }
            if(primaryCell) {
                  selectCell({ cell: primaryCell, fromClue: true });
            } else {
                  selectCell({ cell: cell, fromClue: true });
            }
      }
}

function selectCell({ cell, fromClue = false }) {
      let cellRect = cell.querySelector('rect');
      if (cellRect.classList.contains('highlightPrimary') && !fromClue) {
            acrossDirection = !acrossDirection;
      }
      cell.parentElement.querySelectorAll(".highlightPrimary").forEach(highlighted => {
            highlighted.classList.remove('highlightPrimary');
      });
      cell.parentElement.querySelectorAll(".highlightSecondary").forEach(highlighted => {
            highlighted.classList.remove('highlightSecondary');
      });
      cellRect.classList.add('highlightPrimary');
      let positionData = cell.id.split("/").map(Number);
      var directionalSearch = { left: true, right: true, up: true, down: true };
      let stillSearching = true;
      let iteration = 1;
      let clueNumAcross = cell.character;
      let clueNumDown = cell.character;
      while (stillSearching) {
            stillSearching = Object.values(directionalSearch).includes(true);
            let currentSquares = {
                  left: `${positionData[0] - iteration}/${positionData[1]}`,
                  right: `${positionData[0] + iteration}/${positionData[1]}`,
                  up: `${positionData[0]}/${positionData[1] - iteration}`,
                  down: `${positionData[0]}/${positionData[1] + iteration}`
            };
            for (searchDirection in currentSquares) {
                  if (directionalSearch[searchDirection]) {
                        let nextCell = document.getElementById(currentSquares[searchDirection]);
                        if (!nextCell || nextCell.character == "#") {
                              directionalSearch[searchDirection] = false;
                              continue;
                        } else {
                              let highlight = false;
                              if ((acrossDirection && (searchDirection == "right" || searchDirection == "left")) || (!acrossDirection && (searchDirection == "up" || searchDirection == "down"))) {
                                    highlight = true;
                              }
                              if (searchDirection == "left" && nextCell.character != "0") {
                                    clueNumAcross = nextCell.character;
                              } else if (searchDirection == "up" && nextCell.character != "0") {
                                    clueNumDown = nextCell.character;
                              }
                              if (highlight) {
                                    nextCell.querySelector('rect').classList.add('highlightSecondary');
                              }
                        }
                  }
            }
            iteration++;
      }

      highlightClues({ acrossNum: clueNumAcross, downNum: clueNumDown });

}

function highlightClues({ acrossNum, downNum }) {
      let clueDirection = acrossDirection ? "A" : "D";
      let clueOppositeDirection = acrossDirection ? "D" : "A";
      let clueNum = acrossDirection ? acrossNum : downNum;
      let clueOppositeNum = acrossDirection ? downNum : acrossNum;
      let clue = document.getElementById(`${clueNum}${clueDirection},div`);
      let clueOpposite = document.getElementById(`${clueOppositeNum}${clueOppositeDirection},div`);
      clue.parentElement.querySelectorAll(".highlightPrimaryClue").forEach(highlighted => {
            highlighted.classList.remove('highlightPrimaryClue');
      });
      clue.parentElement.querySelectorAll(".highlightSecondaryClue").forEach(highlighted => {
            highlighted.classList.remove('highlightSecondaryClue');
      });
      clueOpposite.parentElement.querySelectorAll(".highlightSecondaryClue").forEach(highlighted => {
            highlighted.classList.remove('highlightSecondaryClue');
      });
      clueOpposite.parentElement.querySelectorAll(".highlightPrimaryClue").forEach(highlighted => {
            highlighted.classList.remove('highlightPrimaryClue');
      });
      clue.classList.add('highlightPrimaryClue');
      clue.scrollIntoView();
      clueOpposite.classList.add('highlightSecondaryClue');
      clueOpposite.scrollIntoView();
}

function createSVGGrid({ parentElement }) {
      const SVG_NS = "http://www.w3.org/2000/svg";
      const cellSize = 36;
      const height = cellSize * puzzleData.dimensions.height;
      const width = cellSize * puzzleData.dimensions.width;
      const borderWidth = 2;

      box.setAttribute("class", "input uploaded");

      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("width", width + borderWidth * 2);
      svg.setAttribute("height", height + borderWidth * 2);
      svg.setAttribute("viewBox", `0 0 ${width + borderWidth * 2} ${height + borderWidth * 2}`);
      svg.classList.add('svgGrid');
      parentElement.insertBefore(svg, box);

      const cellGroup = document.createElementNS(SVG_NS, "g");
      cellGroup.classList.add('gridCells');

      let blockChar = puzzleData.block;
      let emptyChar = puzzleData.empty;

      rowID = 0;
      columnID = 0;
      positionID = 0;
      puzzleData.puzzle.flat().forEach(character => {
            character = String(character);
            const cell = document.createElementNS(SVG_NS, "g");
            cell.classList.add('cell');

            const rect = document.createElementNS(SVG_NS, "rect");
            rect.classList.add("cellFill");
            rect.id = positionID;
            rect.setAttribute("width", cellSize - 1);
            rect.setAttribute("height", cellSize - 1);
            cell.appendChild(rect);
            cell.id = `${columnID}/${rowID}`;
            cell.onclick = clickOnCell;
            switch (character) {
                  case emptyChar:
                        cell.character = "0";
                        rect.classList.add("default");
                        break;
                  case blockChar:
                        cell.character = "#";
                        rect.classList.add("block");
                        cell.onclick = null;
                        break;
                  default:
                        cell.character = character;
                        rect.classList.add("default");
                        const clueNum = document.createElementNS(SVG_NS, "text");
                        clueNum.setAttribute("x", "2");
                        clueNum.setAttribute("y", "3");
                        clueNum.setAttribute("text-anchor", "start");
                        clueNum.setAttribute("dominant-baseline", "hanging");
                        clueNum.setAttribute("fill", colors.text);
                        clueNum.setAttribute("font-size", textInfo.numSize);
                        clueNum.setAttribute("font-family", textInfo.font);
                        clueNum.textContent = character;
                        cell.appendChild(clueNum);
            }
            if (character != blockChar) {
                  const textData = document.createElementNS(SVG_NS, "text");
                  textData.setAttribute("x", cellSize / 2);
                  textData.setAttribute("y", cellSize / 2 + 7);
                  textData.setAttribute("text-anchor", "middle");
                  textData.setAttribute("dominant-baseline", "middle");
                  textData.setAttribute("fill", colors.text);
                  textData.setAttribute("font-size", textInfo.charSize);
                  textData.setAttribute("font-family", textInfo.font);
                  textData.textContent = "";
                  textData.id = "text";
                  cell.solution = puzzleData.solution.flat()[positionID];
                  cell.appendChild(textData);

                  const wrongSlash = document.createElementNS(SVG_NS, "line");
                  wrongSlash.setAttribute("x1", 2);
                  wrongSlash.setAttribute("y1", cellSize - 2);
                  wrongSlash.setAttribute("x2", cellSize - 2);
                  wrongSlash.setAttribute("y2", 2);
                  wrongSlash.setAttribute("stroke", colors.wrong);
                  wrongSlash.setAttribute("stroke-width", 2);
                  wrongSlash.id = "wrong";
                  wrongSlash.style.visibility = "hidden";
                  cell.editable = true;
                  cell.appendChild(wrongSlash);
            }

            cell.setAttribute("transform", `translate(${(borderWidth + 0.5) + cellSize * columnID} ${(borderWidth + 0.5) + cellSize * rowID})`);
            cellGroup.appendChild(cell);

            columnID++;
            positionID++;
            if (columnID >= puzzleData.dimensions.width) {
                  rowID++;
                  columnID = 0;
            }
      });
      svg.appendChild(cellGroup);

      const gridLine = document.createElementNS(SVG_NS, "path");
      let pathData = "";

      for (let i = 1; i < puzzleData.dimensions.height; i++) {
            const y = borderWidth + cellSize * i;
            pathData += `M${borderWidth},${y} l${width},0 `;
      }

      for (let i = 1; i < puzzleData.dimensions.width; i++) {
            const x = borderWidth + cellSize * i;
            pathData += `M${x},${borderWidth} l0,${height} `;
      }

      gridLine.classList.add('gridLine');
      gridLine.setAttribute("d", pathData);
      svg.appendChild(gridLine);

      const rectBorder = document.createElementNS(SVG_NS, "rect");
      rectBorder.setAttribute("x", borderWidth);
      rectBorder.setAttribute("y", borderWidth);
      rectBorder.setAttribute("width", width);
      rectBorder.setAttribute("height", height);
      rectBorder.classList.add('gridBorder');
      svg.appendChild(rectBorder);

      return svg;
}

function addClues({ svg }) {
      //adds in the across 
      let allAcrossClues = document.getElementById("acrosscluesholder");
      allAcrossClues.style.width = `270px`;
      let acrossClueHolder = document.getElementById("acrossclue");
      let acrossClueTopper = document.getElementById("acrosstopper");
      acrossClueHolder.style.height = `${(svg.clientHeight) - 37}px`;
      acrossClueTopper.style.height = `33px`;
      acrossClueTopper.innerHTML = `<b>ACROSS</b><br><hr>`;
      var lastDivMade = document.getElementById("insertacross");
      for (const [index, acrossClue] of Object.entries(puzzleData.clues.Across)) {
            let clueWrapper = document.createElement("div");
            let clueNumber = document.createElement("span");
            let clueText = document.createElement("span");
            clueWrapper.id = `${String(acrossClue[0])}A,div`;
            clueWrapper.clueNum = String(acrossClue[0]);
            clueWrapper.direction = "A";
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
            clueWrapper.onclick = clickOnClue;
            acrossClueHolder.insertBefore(clueWrapper, lastDivMade);
            //lastDivMade = document.getElementById(`${String(acrossClue[0])}A`);
      }

      //adds in the down clues
      let allDownClues = document.getElementById("downcluesholder");
      allDownClues.style.width = `270px`;
      let downClueHolder = document.getElementById("downclue");
      let downClueTopper = document.getElementById("downtopper");
      downClueHolder.style.height = `${(svg.clientHeight) - 37}px`;
      downClueTopper.style.height = `33px`;
      downClueTopper.innerHTML = `<b>DOWN</b><br><hr>`;
      var lastDivMade = document.getElementById("insertdown");
      for (const [index, downClue] of Object.entries(puzzleData.clues.Down)) {
            let clueWrapper = document.createElement("div");
            let clueNumber = document.createElement("span");
            let clueText = document.createElement("span");
            clueWrapper.id = `${String(downClue[0])}D,div`;
            clueWrapper.clueNum = String(downClue[0]);
            clueWrapper.direction = "D";
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
            clueWrapper.onclick = clickOnClue;
            downClueHolder.insertBefore(clueWrapper, lastDivMade);
            //lastDivMade = document.getElementById(`${String(acrossClue[0])}A`);
      }

      const cell = Array.from(document.querySelectorAll(`.cell`)).filter(cell => cell.character == "1");
      selectCell({ cell: cell[0], fromClue: true });
}

function addInputListeners() {
      document.body.addEventListener('keypress', function (event) {
            if (paused) {
                  return;
            }
            switch (event.key.toUpperCase()) {
                  case "ENTER":
                        let moveForward = true;
                        if (shiftDown) {
                              moveForward = false;
                        }
                        let currentClue = document.querySelector(".highlightPrimaryClue");
                        if (moveForward) {
                              nextClueSpot = false;
                              while (!nextClueSpot) {
                                    currentClue = currentClue.nextElementSibling;
                                    if (currentClue && /^\d/.test(currentClue.id)) {
                                          if (!currentClue.classList.contains("finishedClue")) {
                                                nextClueSpot = true;
                                                currentClue.click();
                                          } else {
                                                continue;
                                          }

                                    } else {
                                          let alternateClue = document.querySelector(".highlightSecondaryClue");
                                          currentClue = alternateClue.parentElement.firstElementChild;
                                          if (currentClue && /^\d/.test(currentClue.id)) {
                                                if (!currentClue.classList.contains("finishedClue")) {
                                                      nextClueSpot = true;
                                                      currentClue.click();
                                                } else {
                                                      continue;
                                                }
                                          }
                                    }
                              }
                        } else {
                              lastClueSpot = false;
                              while (!lastClueSpot) {
                                    currentClue = currentClue.previousElementSibling;
                                    if (currentClue && /^\d/.test(currentClue.id)) {
                                          if (!currentClue.classList.contains("finishedClue")) {
                                                lastClueSpot = true;
                                                currentClue.click();
                                          } else {
                                                continue;
                                          }
                                    } else {
                                          let alternateClue = document.querySelector(".highlightSecondaryClue");
                                          currentClue = alternateClue.parentElement.lastElementChild;
                                          if (currentClue && /^\d/.test(currentClue.id)) {
                                                if (!currentClue.classList.contains("finishedClue")) {
                                                      lastClueSpot = true;
                                                      currentClue.click();
                                                } else {
                                                      continue;
                                                }
                                          }
                                    }
                              }
                        }
                        break;
                  default:
                        if (event.key.length === 1) {
                              let character = event.key.toUpperCase();
                              let currentSquare = document.querySelector(".highlightPrimary").parentElement;
                              let positionData = currentSquare.id.split("/").map(Number);
                              let neighbors = {
                                    left: `${positionData[0] - 1}/${positionData[1]}`,
                                    right: `${positionData[0] + 1}/${positionData[1]}`,
                                    up: `${positionData[0]}/${positionData[1] - 1}`,
                                    down: `${positionData[0]}/${positionData[1] + 1}`
                              };
                              if (currentSquare.editable) {
                                    let textBox = currentSquare.querySelector("#text");
                                    textBox.textContent = character;
                                    let wrongSlash = currentSquare.querySelector("#wrong");
                                    wrongSlash.style.visibility = "hidden";

                                    var directionalSearch = { left: true, right: true, up: true, down: true };
                                    var completeInDirection = { left: false, right: false, up: false, down: false };
                                    let stillSearching = true;
                                    let iteration = 1;
                                    while (stillSearching) {
                                          stillSearching = Object.values(directionalSearch).includes(true);
                                          let currentSquares = {
                                                left: `${positionData[0] - iteration}/${positionData[1]}`,
                                                right: `${positionData[0] + iteration}/${positionData[1]}`,
                                                up: `${positionData[0]}/${positionData[1] - iteration}`,
                                                down: `${positionData[0]}/${positionData[1] + iteration}`
                                          };
                                          for (searchDirection in currentSquares) {
                                                if (directionalSearch[searchDirection]) {
                                                      let nextCell = document.getElementById(currentSquares[searchDirection]);
                                                      if (!nextCell || nextCell.character == "#") {
                                                            completeInDirection[searchDirection] = true;
                                                            neighbors[searchDirection] = null;
                                                            directionalSearch[searchDirection] = false;
                                                            continue;
                                                      } else {
                                                            let textBox = nextCell.querySelector("#text");
                                                            if (textBox.textContent == "") {
                                                                  neighbors[searchDirection] = currentSquares[searchDirection];
                                                                  directionalSearch[searchDirection] = false;
                                                            } else {
                                                                  continue;
                                                            }
                                                      }
                                                }
                                          }
                                          iteration++;
                                    }

                                    let activeAcross;
                                    if (acrossDirection) {
                                          activeAcross = document.querySelector(".highlightPrimaryClue");
                                    } else {
                                          activeAcross = document.querySelector(".highlightSecondaryClue");
                                    }
                                    if (completeInDirection.left && completeInDirection.right) {
                                          activeAcross.classList.add("finishedClue");
                                    } else {
                                          activeAcross.classList.remove("finishedClue");
                                    }

                                    let activeDown;
                                    if (acrossDirection) {
                                          activeDown = document.querySelector(".highlightSecondaryClue");
                                    } else {
                                          activeDown = document.querySelector(".highlightPrimaryClue");
                                    }
                                    if (completeInDirection.up && completeInDirection.down) {
                                          activeDown.classList.add("finishedClue");
                                    } else {
                                          activeDown.classList.remove("finishedClue");
                                    }

                                    checkIfCorrect({ typed: true });
                              }

                              let nextCellID;
                              if (acrossDirection) {
                                    nextCellID = neighbors.right;
                              } else {
                                    nextCellID = neighbors.down;
                              }
                              let cell = document.getElementById(nextCellID);
                              if (cell && cell.character != "#") {
                                    selectCell({ cell: cell });
                              }
                        }
            }
      });

      document.body.addEventListener('keyup', function (event) {
            switch (event.key.toUpperCase()) {
                  case "SHIFT":
                        shiftDown = false;
                        break;
                  default:
            }
      });

      document.body.addEventListener('keydown', function (event) {
            if (paused) {
                  return;
            }
            let currentSquare = document.querySelector(".highlightPrimary").parentElement;
            let positionData = currentSquare.id.split("/").map(Number);
            let neighbors = {
                  left: `${positionData[0] - 1}/${positionData[1]}`,
                  right: `${positionData[0] + 1}/${positionData[1]}`,
                  up: `${positionData[0]}/${positionData[1] - 1}`,
                  down: `${positionData[0]}/${positionData[1] + 1}`
            };
            switch (event.key.toUpperCase()) {
                  case "ARROWUP":
                  case "ARROWDOWN":
                  case "ARROWLEFT":
                  case "ARROWRIGHT":
                        var directionalSearch = { left: true, right: true, up: true, down: true };
                        let stillSearching = true;
                        let iteration = 1;
                        while (stillSearching) {
                              stillSearching = Object.values(directionalSearch).includes(true);
                              let currentSquares = {
                                    left: `${positionData[0] - iteration}/${positionData[1]}`,
                                    right: `${positionData[0] + iteration}/${positionData[1]}`,
                                    up: `${positionData[0]}/${positionData[1] - iteration}`,
                                    down: `${positionData[0]}/${positionData[1] + iteration}`
                              };
                              for (searchDirection in currentSquares) {
                                    if (directionalSearch[searchDirection]) {
                                          let nextCell = document.getElementById(currentSquares[searchDirection]);
                                          if (!nextCell) {
                                                neighbors[searchDirection] = null;
                                                directionalSearch[searchDirection] = false;
                                                continue;
                                          } else {
                                                if (nextCell.character == "#") {
                                                      continue;
                                                } else {
                                                      neighbors[searchDirection] = currentSquares[searchDirection]
                                                      directionalSearch[searchDirection] = false;
                                                      continue;
                                                }
                                          }
                                    }
                              }
                              iteration++;
                        }
                        break;
                  default:
            }
            switch (event.key.toUpperCase()) {
                  case "SHIFT":
                        shiftDown = true;
                        break;
                  case "ARROWUP":
                        if (!acrossDirection) {
                              let cell = document.getElementById(neighbors.up);
                              if (cell) {
                                    selectCell({ cell: cell });
                              }
                        } else {
                              selectCell({ cell: currentSquare });
                        }
                        break;
                  case "ARROWDOWN":
                        if (!acrossDirection) {
                              let cell = document.getElementById(neighbors.down);
                              if (cell) {
                                    selectCell({ cell: cell });
                              }
                        } else {
                              selectCell({ cell: currentSquare });
                        }
                        break;
                  case "ARROWLEFT":
                        if (acrossDirection) {
                              let cell = document.getElementById(neighbors.left);
                              if (cell) {
                                    selectCell({ cell: cell });
                              }
                        } else {
                              selectCell({ cell: currentSquare });
                        }
                        break;
                  case "ARROWRIGHT":
                        if (acrossDirection) {
                              let cell = document.getElementById(neighbors.right);
                              if (cell) {
                                    selectCell({ cell: cell });
                              }
                        } else {
                              selectCell({ cell: currentSquare });
                        }
                        break;
                  case "DELETE":
                  case "BACKSPACE":
                        let textBox = currentSquare.querySelector("#text");
                        if (textBox.textContent != "" && currentSquare.editable) {
                              textBox.textContent = "";
                              let wrongSlash = currentSquare.querySelector("#wrong");
                              wrongSlash.style.visibility = "hidden";
                              let activeAcross;
                              if (acrossDirection) {
                                    activeAcross = document.querySelector(".highlightPrimaryClue");
                              } else {
                                    activeAcross = document.querySelector(".highlightSecondaryClue");
                              }
                              let activeDown;
                              if (acrossDirection) {
                                    activeDown = document.querySelector(".highlightSecondaryClue");
                              } else {
                                    activeDown = document.querySelector(".highlightPrimaryClue");
                              }
                              activeAcross.classList.remove("finishedClue");
                              activeDown.classList.remove("finishedClue");
                        } else {
                              let positionData = currentSquare.id.split("/").map(Number);
                              let neighbors = {
                                    left: `${positionData[0] - 1}/${positionData[1]}`,
                                    right: `${positionData[0] + 1}/${positionData[1]}`,
                                    up: `${positionData[0]}/${positionData[1] - 1}`,
                                    down: `${positionData[0]}/${positionData[1] + 1}`
                              };
                              let nextCellID;
                              if (acrossDirection) {
                                    nextCellID = neighbors.left;
                              } else {
                                    nextCellID = neighbors.up;
                              }
                              let cell = document.getElementById(nextCellID);
                              if (cell && cell.character != "#") {
                                    let lastTextBox = cell.querySelector("#text");
                                    if (cell.editable) {
                                          lastTextBox.textContent = "";
                                    }
                                    let wrongSlash = cell.querySelector("#wrong");
                                    wrongSlash.style.visibility = "hidden";
                                    selectCell({ cell: cell });
                                    let activeAcross;
                                    if (acrossDirection) {
                                          activeAcross = document.querySelector(".highlightPrimaryClue");
                                    } else {
                                          activeAcross = document.querySelector(".highlightSecondaryClue");
                                    }
                                    let activeDown;
                                    if (acrossDirection) {
                                          activeDown = document.querySelector(".highlightSecondaryClue");
                                    } else {
                                          activeDown = document.querySelector(".highlightPrimaryClue");
                                    }
                                    activeAcross.classList.remove("finishedClue");
                                    activeDown.classList.remove("finishedClue");
                              }
                        }

                        break;
                  default:
            }
      });
}

function checkIfCorrect({ typed = true }) {
      let allWrong = Array.from(document.querySelectorAll("#text")).filter(textBox => {
            let cell = textBox.parentElement;
            if (textBox.textContent == cell.solution && !typed) {
                  cell.editable = false;
                  textBox.setAttribute("fill", colors.correct);
            }
            return textBox.textContent != cell.solution;
      });
      if (allWrong.length == 0 && typed) {
            openCloseForm();
      }
      return allWrong;
}

function checkGrid() {
      let allWrong = checkIfCorrect({ typed: false });
      for (wrongData of allWrong) {
            let cell = wrongData.parentElement;
            let textData = cell.querySelector("#text");
            if (textData.textContent == "") {
                  continue;
            }
            let wrongSlash = cell.querySelector("#wrong");
            wrongSlash.style.visibility = "visible";
      }
}

function openForm() {
      let middleFlex = document.getElementById("update");
      middleFlex.style.transform = `translate(0%, 0%)`;
      let blurrer = document.getElementById("blurrer");
      let timerButton = document.getElementById('update');
      timerButton.innerHTML = ``;
      blurrer.style.display = "block";
      let popupTitle = document.getElementById("popupTitle");
      popupTitle.innerHTML = `${puzzleData.title ? puzzleData.title : `The Crossword`}`;
      let popupContent = document.getElementById("popupContent");
      let popupContent2 = document.getElementById("popupContent2");
      popupContent2.innerHTML = `• by ${puzzleData.author ? puzzleData.author : `Unknown`} •`;
      let closeButton = document.getElementById("button2");

      closeButton.addEventListener("click", closeOpenForm);
      let overlay = document.getElementById("overlay");
      overlay.style.display = "block";
}

function closeOpenForm() {
      document.getElementById("popupContent").style.marginTop = "15px";
      let closeButton = document.getElementById("button2");
      closeButton.style.marginTop = "10px";
      closeButton.removeEventListener("click", closeOpenForm);
      document.getElementById("overlay").style.display = "none";
      document.getElementById("popupContent2").style.display = "none";
      document.getElementById("blurrer").style.display = "none";
      paused = false;
      changeTimer();
}

function openCloseForm() {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      prevTime = null;
      let timerButton = document.getElementById('update');
      timerButton.removeEventListener('click', changeTimer);
      timerButton.innerHTML = `${timerButton.innerHTML.replace(`◼`, ``)}`;
      let timeSections = timerButton.innerHTML.split(":");
      let popupTitle = document.getElementById("popupTitle");
      popupTitle.innerHTML = "APPLAUSE.WAV";
      let popupContent = document.getElementById("popupContent");
      popupContent.innerHTML = `You solved ${puzzleData.title ? puzzleData.title : `The Crossword`} in <br>${timeSections.length == 3 ? (parseInt(timeSections[0]) + " hours <br>" + parseInt(timeSections[1]) + " minutes and <br>" + parseInt(timeSections[2]) + " seconds") : (parseInt(timeSections[0]) + " minutes and <br>" + parseInt(timeSections[1]) + " seconds")}.`;
      let closeButton = document.getElementById("button2");
      closeButton.addEventListener("click", closeTheForm);
      let overlay = document.getElementById("overlay");
      overlay.style.display = "block";
}

function closeTheForm() {
      document.getElementById("overlay").style.display = "none";
      document.getElementById("button2").removeEventListener("click", closeTheForm);
}

function addBottomInfo() {
      let flexy = document.getElementById('flexy');
      let timerButton = document.getElementById('update');
      timerButton.style.cursor = "pointer";

      let checkDiv = document.createElement("div");
      checkDiv.id = "checking";
      let checkButton = document.createElement("button");
      checkButton.innerHTML = "Check";
      checkButton.id = "button";
      checkButton.onclick = function () {
            checkGrid();
            return;
      }
      checkDiv.appendChild(checkButton);
      if (puzzleData.author || puzzleData.title) {
            let infoDiv = document.createElement("div");
            let titleDiv = document.createElement("div");
            let authorDiv = document.createElement("div");
            infoDiv.id = "infoDiv";
            titleDiv.id = "titleDiv";
            authorDiv.id = "authorDiv";
            titleDiv.innerHTML = `${puzzleData.title ? puzzleData.title : `The Crossword`}`;
            authorDiv.innerHTML = `by ${puzzleData.author ? puzzleData.author : `Unknown`}`;
            infoDiv.appendChild(titleDiv);
            infoDiv.appendChild(authorDiv);
            flexy.insertBefore(infoDiv, timerButton);
      }
      flexy.insertBefore(checkDiv, timerButton.nextSibling);
      flexy.style.height = `20px`;
      openForm();
}

function addTheTimer() {
      let timerButton = document.getElementById('update');
      timerButton.addEventListener('click', changeTimer);
}

var prevTime, stopwatchInterval, elapsedTime = 0;

function changeTimer() {
      let timerButton = document.getElementById('update');
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
            let popupContent = document.getElementById("popupContent");
            popupContent.innerHTML = `Game Paused`;
            paused = true;
            openForm();
            timerButton.innerHTML = `${timerButton.innerHTML.replace(`◼`, `▶`)}`;
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
            prevTime = null;
      }
}

var updateTime = function () {
      let timerButton = document.getElementById('update');
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