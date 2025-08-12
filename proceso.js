// 🎯 Configuración inicial
const boardSize = 8;
const symbols = [
    { name: "xbox", img: "https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox_one_logo.svg" },
    { name: "play", img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/PlayStation_logo.svg" },
    { name: "nintendo", img: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" }
];

let board = [];
let score = 0;
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

// 🧩 Generar tablero inicial
function createBoard() {
    board = [];
    for (let row = 0; row < boardSize; row++) {
        let rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            rowArray.push(getRandomSymbol());
        }
        board.push(rowArray);
    }
    renderBoard();
}

// 🎨 Mostrar tablero en pantalla
function renderBoard() {
    gameBoard.innerHTML = "";
    board.forEach((row, rIndex) => {
        row.forEach((cell, cIndex) => {
            const div = document.createElement("div");
            div.classList.add("cell", cell.name);
            div.dataset.row = rIndex;
            div.dataset.col = cIndex;

            const img = document.createElement("img");
            img.src = cell.img;
            div.appendChild(img);

            div.addEventListener("click", () => handleCellClick(rIndex, cIndex));
            gameBoard.appendChild(div);
        });
    });
}

// 🎲 Obtener símbolo aleatorio
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// 🖱 Manejo de clics
let selectedCell = null;

function handleCellClick(row, col) {
    if (!selectedCell) {
        selectedCell = { row, col };
    } else {
        swapCells(selectedCell, { row, col });
        selectedCell = null;
    }
}

// 🔄 Intercambiar dos celdas
function swapCells(cell1, cell2) {
    const temp = board[cell1.row][cell1.col];
    board[cell1.row][cell1.col] = board[cell2.row][cell2.col];
    board[cell2.row][cell2.col] = temp;

    checkMatches();
}

// ✅ Verificar coincidencias
function checkMatches() {
    let matches = [];

    // Horizontales
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize - 2; c++) {
            if (board[r][c].name === board[r][c + 1].name && board[r][c].name === board[r][c + 2].name) {
                matches.push({ row: r, col: c }, { row: r, col: c + 1 }, { row: r, col: c + 2 });
            }
        }
    }

    // Verticales
    for (let c = 0; c < boardSize; c++) {
        for (let r = 0; r < boardSize - 2; r++) {
            if (board[r][c].name === board[r + 1][c].name && board[r][c].name === board[r + 2][c].name) {
                matches.push({ row: r, col: c }, { row: r + 1, col: c }, { row: r + 2, col: c });
            }
        }
    }

    if (matches.length > 0) {
        removeMatches(matches);
    } else {
        renderBoard();
    }
}

// 🗑 Eliminar coincidencias y rellenar
function removeMatches(matches) {
    matches.forEach(match => {
        board[match.row][match.col] = null;
    });

    score += matches.length * 10;
    scoreDisplay.textContent = score;

    if (score >= 1000) {
        setTimeout(() => alert("🎉 Felicidades, has ganado!"), 200);
    }

    // Bajar fichas
    for (let c = 0; c < boardSize; c++) {
        for (let r = boardSize - 1; r >= 0; r--) {
            if (board[r][c] === null) {
                for (let k = r; k >= 0; k--) {
                    if (board[k][c] !== null) {
                        board[r][c] = board[k][c];
                        board[k][c] = null;
                        break;
                    }
                }
            }
        }
    }

    // Llenar espacios vacíos
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === null) {
                board[r][c] = getRandomSymbol();
            }
        }
    }

    setTimeout(checkMatches, 200);
}

// 🚀 Iniciar juego
createBoard();
