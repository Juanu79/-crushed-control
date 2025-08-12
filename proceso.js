const grid = document.querySelector('#grid');
const icons = ['imagenes/nintendo.png', 'imagenes/play.png', 'imagenes/xbox.png'];
const size = 6;
let cells = [];
let selected = null;

// Crear el tablero
function createBoard() {
    grid.innerHTML = '';
    cells = [];
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('img');
        cell.src = icons[Math.floor(Math.random() * icons.length)];
        cell.dataset.index = i;
        cell.classList.add('cell');

        // Eventos para PC
        cell.addEventListener('mousedown', handleSelect);
        cell.addEventListener('mouseup', handleSwap);

        // Eventos para móviles
        cell.addEventListener('touchstart', handleSelect);
        cell.addEventListener('touchend', handleSwap);

        grid.appendChild(cell);
        cells.push(cell);
    }
}

// Seleccionar una celda
function handleSelect(e) {
    e.preventDefault();
    let target = e.target;
    if (target.tagName !== 'IMG') return;
    selected = target;
}

// Intercambiar con otra celda
function handleSwap(e) {
    e.preventDefault();
    let target = e.target;
    if (!selected || target === selected) return;

    // Intercambiar imágenes
    let temp = selected.src;
    selected.src = target.src;
    target.src = temp;

    selected = null;
    checkMatches();
}

// Detectar combinaciones
function checkMatches() {
    for (let i = 0; i < cells.length; i++) {
        let row = Math.floor(i / size);
        let col = i % size;

        // Horizontal
        if (col < size - 2) {
            if (cells[i].src === cells[i + 1].src && cells[i].src === cells[i + 2].src) {
                cells[i].src = icons[Math.floor(Math.random() * icons.length)];
                cells[i + 1].src = icons[Math.floor(Math.random() * icons.length)];
                cells[i + 2].src = icons[Math.floor(Math.random() * icons.length)];
            }
        }

        // Vertical
        if (row < size - 2) {
            if (cells[i].src === cells[i + size].src && cells[i].src === cells[i + size * 2].src) {
                cells[i].src = icons[Math.floor(Math.random() * icons.length)];
                cells[i + size].src = icons[Math.floor(Math.random() * icons.length)];
                cells[i + size * 2].src = icons[Math.floor(Math.random() * icons.length)];
            }
        }
    }
}

createBoard();
