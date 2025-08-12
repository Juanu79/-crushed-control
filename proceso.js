// Configuración inicial del juego
const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const width = 8;
let score = 0;

// Tipos de piezas: Xbox, PlayStation, Nintendo
const icons = ["xbox", "play", "nintendo"];

// Crear un arreglo que represente el tablero
let squares = [];

/**
 * Crea el tablero con piezas aleatorias.
 */
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const tile = document.createElement("div");
    let randomIcon = icons[Math.floor(Math.random() * icons.length)];
    tile.classList.add("tile", randomIcon);
    tile.setAttribute("draggable", true);
    tile.setAttribute("id", i);
    board.appendChild(tile);
    squares.push(tile);
  }
}
createBoard();

/**
 * Funciones para arrastrar y soltar (mover piezas).
 */
let draggedTile, replacedTile;

squares.forEach(tile => {
  tile.addEventListener("dragstart", dragStart);
  tile.addEventListener("dragover", dragOver);
  tile.addEventListener("drop", dragDrop);
  tile.addEventListener("dragend", dragEnd);
});

function dragStart() {
  draggedTile = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dragDrop() {
  replacedTile = this;
}

function dragEnd() {
  const draggedId = parseInt(draggedTile.id);
  const replacedId = parseInt(replacedTile.id);

  const validMoves = [
    draggedId - 1,
    draggedId + 1,
    draggedId - width,
    draggedId + width,
  ];

  const validMove = validMoves.includes(replacedId);

  if (validMove) {
    let draggedClass = draggedTile.classList[1];
    let replacedClass = replacedTile.classList[1];

    draggedTile.classList.replace(draggedClass, replacedClass);
    replacedTile.classList.replace(replacedClass, draggedClass);

    checkMatches();
  }
}

/**
 * Revisa si hay combinaciones de 3 o más.
 */
function checkMatches() {
  for (let i = 0; i < squares.length; i++) {
    let rowOfThree = [i, i + 1, i + 2];
    let colOfThree = [i, i + width, i + width * 2];

    let chosenClass = squares[i].classList[1];

    if (rowOfThree.every(index => squares[index]?.classList[1] === chosenClass)) {
      rowOfThree.forEach(index => {
        squares[index].className = "tile";
      });
      score += 3;
    }

    if (colOfThree.every(index => squares[index]?.classList[1] === chosenClass)) {
      colOfThree.forEach(index => {
        squares[index].className = "tile";
      });
      score += 3;
    }
  }
  scoreDisplay.textContent = "Puntuación: " + score;
}
