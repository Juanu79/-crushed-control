const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

const width = 8;
let score = 0;

// Imágenes del juego
const consoles = [
    "imagenes/nintendo.png",
    "imagenes/play.png",
    "imagenes/xbox.png"
];

// Crear el tablero
let squares = [];

function createBoard() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement("img");
        let randomConsole = Math.floor(Math.random() * consoles.length);
        square.setAttribute("src", consoles[randomConsole]);
        square.setAttribute("data-id", i);
        board.appendChild(square);
        squares.push(square);
    }
}

createBoard();

// Aquí iría la lógica para arrastrar, soltar y verificar combinaciones
// Puedes seguir adaptando tu lógica original aquí
