const BOARD_ID = "game-board";            // id del contenedor en index.html
const SCORE_ID = "score";                // id del span donde mostrar puntuación
const WIDTH = 8;                         // ancho/alto del tablero (8x8)
const TARGET_SCORE = 1000;               // puntaje para ganar
const POINTS_PER_TILE = 10;              // puntos por ficha eliminada

// Rutas a tus imágenes locales (asegúrate que existan)
const IMAGES = [
  "imagenes/nintendo.png",
  "imagenes/play.png",
  "imagenes/xbox.png"
];

// ---------- Estado del juego ----------
const boardEl = document.getElementById(BOARD_ID);
const scoreEl = document.getElementById(SCORE_ID);
let grid = new Array(WIDTH * WIDTH).fill(null); // almacena rutas de imagen o null
let tiles = [];                                  // elementos <img> del DOM (orden por índice)
let score = 0;

// Variables para arrastrar / touch
let draggedIndex = null;
let targetIndex = null;

// ---------- Helpers ----------
function idx(row, col) { return row * WIDTH + col; }
function pos(index) { return { row: Math.floor(index / WIDTH), col: index % WIDTH }; }
function randomImage() { return IMAGES[Math.floor(Math.random() * IMAGES.length)]; }
function updateScoreDisplay() { scoreEl.textContent = score; }

// Mostrar modal de victoria
function showWinModal() {
  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="panel">
      <h2>🎉 ¡Felicidades, has ganado! 🎉</h2>
      <p>Puntuación: ${score}</p>
      <button id="closeWinBtn">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("closeWinBtn").addEventListener("click", () => {
    modal.classList.remove("show");
    document.body.removeChild(modal);
  });
}

// ---------- Crear tablero en DOM ----------
function createBoard() {
  boardEl.innerHTML = "";
  tiles = [];
  grid = new Array(WIDTH * WIDTH);

  for (let i = 0; i < WIDTH * WIDTH; i++) {
    const img = document.createElement("img");
    img.draggable = true;
    img.className = "cell-img";
    img.dataset.id = i;
    // listeners mouse
    img.addEventListener("dragstart", onDragStart);
    img.addEventListener("dragover", onDragOver);
    img.addEventListener("drop", onDrop);
    img.addEventListener("dragend", onDragEnd);
    // listeners touch
    img.addEventListener("touchstart", onTouchStart, { passive: false });
    img.addEventListener("touchmove", onTouchMove, { passive: false });
    img.addEventListener("touchend", onTouchEnd);

    boardEl.appendChild(img);
    tiles.push(img);
  }

  // Llenar con imágenes aleatorias
  for (let i = 0; i < WIDTH * WIDTH; i++) {
    grid[i] = randomImage();
    tiles[i].src = grid[i];
  }

  // Asegurar que no haya matches iniciales (evitar puntuaciones "solas")
  resolveAllInitialMatches(() => {
    updateScoreDisplay();
  });
}

// ---------- Evitar matches iniciales (repetir hasta que no existan) ----------
function resolveAllInitialMatches(callback) {
  let found = findMatches();
  if (found.size === 0) {
    if (callback) callback();
    return;
  }
  // eliminar temporalmente y rellenar, repetir
  removeMatches(found, () => {
    // después de rellenar volvemos a comprobar
    resolveAllInitialMatches(callback);
  }, false /* no sumar puntos durante limpieza inicial */);
}

// ---------- Drag & Drop (mouse) ----------
function onDragStart(e) {
  draggedIndex = Number(e.target.dataset.id);
  // visual
  e.target.classList.add("dragging");
  e.dataTransfer.setData("text/plain", "drag");
}
function onDragOver(e) {
  e.preventDefault(); // necesario para permitir drop
}
function onDrop(e) {
  e.preventDefault();
  const id = e.target.dataset && Number(e.target.dataset.id);
  if (typeof id === "number") targetIndex = id;
}
function onDragEnd(e) {
  e.target.classList.remove("dragging");
  handleSwapFromDrag();
}

// ---------- Touch handlers ----------
let ongoingTouchTarget = null;
function onTouchStart(e) {
  e.preventDefault();
  const id = Number(e.target.dataset.id);
  draggedIndex = id;
  ongoingTouchTarget = e.target;
  e.target.classList.add("dragging");
}
function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!el) return;
  if (el.dataset && el.dataset.id) {
    targetIndex = Number(el.dataset.id);
  }
}
function onTouchEnd(e) {
  e.preventDefault();
  if (ongoingTouchTarget) ongoingTouchTarget.classList.remove("dragging");
  handleSwapFromDrag();
  ongoingTouchTarget = null;
}

// ---------- Intercambio y validación ----------
function handleSwapFromDrag() {
  if (draggedIndex === null || targetIndex === null) {
    draggedIndex = null; targetIndex = null;
    return;
  }
  if (draggedIndex === targetIndex) {
    draggedIndex = null; targetIndex = null;
    return;
  }
  // Solo adyacentes (manhattan distance = 1)
  const p1 = pos(draggedIndex);
  const p2 = pos(targetIndex);
  if (Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col) !== 1) {
    draggedIndex = null; targetIndex = null;
    return;
  }

  // hacer swap visual y en grid
  swapIndices(draggedIndex, targetIndex);

  // comprobar si genera matches
  const matches = findMatches();
  if (matches.size > 0) {
    // Si hay matches, procesarlos (esto también hará caer y rellenar en cadena)
    removeMatches(matches, () => {
      // after remove & refill, check recursively until no more matches
      chainResolveMatches();
    }, true);
  } else {
    // revertir swap si no genera match
    swapIndices(draggedIndex, targetIndex); // volver atrás
  }

  draggedIndex = null;
  targetIndex = null;
}

// swap en el grid y actualiza DOM
function swapIndices(i1, i2) {
  const tmp = grid[i1];
  grid[i1] = grid[i2];
  grid[i2] = tmp;

  tiles[i1].src = grid[i1] || "";
  tiles[i2].src = grid[i2] || "";
}

// ---------- Encontrar matches (devuelve Set de índices únicos) ----------
function findMatches() {
  const toRemove = new Set();

  // horizontal
  for (let r = 0; r < WIDTH; r++) {
    let runStart = 0;
    for (let c = 0; c <= WIDTH; c++) {
      const i = idx(r, c);
      const prevI = idx(r, c - 1);
      const prevVal = c - 1 >= 0 ? grid[prevI] : null;
      const curVal = c < WIDTH ? grid[i] : null;

      if (c === 0) continue; // no hay prev al inicio
      // si curVal equals prevVal continue the run, else close run
      if (c < WIDTH && curVal && prevVal && curVal === prevVal) {
        // continuing run
      } else {
        // run ended at c-1, runStart .. c-1
        const runLength = (c - 1) - runStart + 1;
        if (runLength >= 3) {
          for (let cc = runStart; cc <= c - 1; cc++) {
            toRemove.add(idx(r, cc));
          }
        }
        runStart = c;
      }
    }
  }

  // vertical
  for (let c = 0; c < WIDTH; c++) {
    let runStart = 0;
    for (let r = 0; r <= WIDTH; r++) {
      const i = idx(r, c);
      const prevI = idx(r - 1, c);
      const prevVal = r - 1 >= 0 ? grid[prevI] : null;
      const curVal = r < WIDTH ? grid[i] : null;

      if (r === 0) continue;
      if (r < WIDTH && curVal && prevVal && curVal === prevVal) {
        // continuing run
      } else {
        const runLength = (r - 1) - runStart + 1;
        if (runLength >= 3) {
          for (let rr = runStart; rr <= r - 1; rr++) {
            toRemove.add(idx(rr, c));
          }
        }
        runStart = r;
      }
    }
  }

  return toRemove;
}

// ---------- Remove matches and refill ----------
// matches: Set of indices to remove
// cb: callback when finished
// addPoints: whether to add points (false when cleaning initial board)
function removeMatches(matches, cb, addPoints = true) {
  if (!matches || matches.size === 0) {
    if (cb) cb();
    return;
  }

  // sumar puntos solo si addPoints === true
  if (addPoints) {
    score += matches.size * POINTS_PER_TILE;
    updateScoreDisplay();
    if (score >= TARGET_SCORE) {
      // small delay to let last animation settle
      setTimeout(showWinModal, 300);
    }
  }

  // marcar como null y limpiar src en DOM
  matches.forEach(i => {
    grid[i] = null;
    tiles[i].src = ""; // vacía visualmente
  });

  // esperar un pelín para que el usuario vea desaparición
  setTimeout(() => {
    gravityAndRefill();
    if (cb) cb();
  }, 200);
}

// Hace caer las fichas (gravity) y rellena vacíos
function gravityAndRefill() {
  // por cada columna, mover valores hacia abajo
  for (let c = 0; c < WIDTH; c++) {
    // construir una columna temporal con valores no null
    const colVals = [];
    for (let r = WIDTH - 1; r >= 0; r--) {
      const i = idx(r, c);
      if (grid[i]) colVals.push(grid[i]);
    }
    // rellenar la columna desde abajo
    let r = WIDTH - 1;
    let k = 0;
    while (r >= 0) {
      const i = idx(r, c);
      if (k < colVals.length) {
        grid[i] = colVals[k++];
      } else {
        grid[i] = randomImage();
      }
      r--;
    }
  }

  // actualizar DOM con nuevos valores
  for (let i = 0; i < grid.length; i++) {
    tiles[i].src = grid[i];
  }
}

// Resuelve matches encadenados hasta que no queden
function chainResolveMatches() {
  setTimeout(() => {
    const matches = findMatches();
    if (matches.size > 0) {
      removeMatches(matches, () => {
        chainResolveMatches();
      }, true);
    }
  }, 250);
}

// ---------- Iniciar juego ----------
createBoard();