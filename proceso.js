const board = document.getElementById("game-board");
const scoreElement = document.getElementById("score");

const rows = 8;
const cols = 8;
const items = ["play.png", "xbox.png", "nintendo.png"];
let score = 0;

function createBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            const img = document.createElement("img");
            img.src = `imagenes/${items[Math.floor(Math.random() * items.length)]}`;
            cell.appendChild(img);
            board.appendChild(cell);
        }
    }
}

function swapCells(cell1, cell2) {
    const temp = cell1.firstChild.src;
    cell1.firstChild.src = cell2.firstChild.src;
    cell2.firstChild.src = temp;
}

function checkMatches() {
    let matched = false;

    // Check filas
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            const cell1 = document.querySelector(`[data-row='${r}'][data-col='${c}'] img`);
            const cell2 = document.querySelector(`[data-row='${r}'][data-col='${c + 1}'] img`);
            const cell3 = document.querySelector(`[data-row='${r}'][data-col='${c + 2}'] img`);

            if (cell1.src === cell2.src && cell1.src === cell3.src) {
                matched = true;
                cell1.parentElement.removeChild(cell1);
                cell2.parentElement.removeChild(cell2);
                cell3.parentElement.removeChild(cell3);
                score += 10;
            }
        }
    }

    // Check columnas
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            const cell1 = document.querySelector(`[data-row='${r}'][data-col='${c}'] img`);
            const cell2 = document.querySelector(`[data-row='${r + 1}'][data-col='${c}'] img`);
            const cell3 = document.querySelector(`[data-row='${r + 2}'][data-col='${c}'] img`);

            if (cell1 && cell2 && cell3 && cell1.src === cell2.src && cell1.src === cell3.src) {
                matched = true;
                cell1.parentElement.removeChild(cell1);
                cell2.parentElement.removeChild(cell2);
                cell3.parentElement.removeChild(cell3);
                score += 10;
            }
        }
    }

    scoreElement.textContent = score;
    return matched;
}

function dropItems() {
    for (let c = 0; c < cols; c++) {
        for (let r = rows - 1; r >= 0; r--) {
            const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (!cell.firstChild) {
                for (let rr = r - 1; rr >= 0; rr--) {
                    const aboveCell = document.querySelector(`[data-row='${rr}'][data-col='${c}']`);
                    if (aboveCell.firstChild) {
                        cell.appendChild(aboveCell.firstChild);
                        break;
                    }
                }
            }
        }
    }
}

function refillBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (!cell.firstChild) {
                const img = document.createElement("img");
                img.src = `imagenes/${items[Math.floor(Math.random() * items.length)]}`;
                cell.appendChild(img);
            }
        }
    }
}

// Variables para seleccionar celda
let firstCell = null;

function startSelect(e) {
    e.preventDefault();
    const cell = e.target.closest(".cell");
    if (cell) {
        firstCell = cell;
    }
}

function endSelect(e) {
    e.preventDefault();
    const cell = e.target.closest(".cell");
    if (cell && firstCell && cell !== firstCell) {
        swapCells(firstCell, cell);
        if (!checkMatches()) {
            swapCells(firstCell, cell);
        } else {
            dropItems();
            refillBoard();
        }
    }
    firstCell = null;
}

createBoard();

// Soporte PC + Móvil
const cells = document.querySelectorAll(".cell");
cells.forEach(cell => {
    cell.addEventListener("mousedown", startSelect);
    cell.addEventListener("mouseup", endSelect);
    cell.addEventListener("touchstart", startSelect, { passive: false });
    cell.addEventListener("touchend", endSelect, { passive: false });
});
