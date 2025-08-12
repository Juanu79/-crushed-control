const BOARD_ID = "game-board";
const SCORE_ID = "score";
const WIDTH = 8;
const TARGET_SCORE = 5000;  // ahora gana con 5000 puntos
const POINTS_PER_TILE = 10;

const IMAGES = [
  "imagenes/nintendo.png",
  "imagenes/play.png",
  "imagenes/xbox.png"
];

// ---------- Estado ----------
const boardEl = document.getElementById(BOARD_ID);
const scoreEl = document.getElementById(SCORE_ID);
let grid = new Array(WIDTH * WIDTH).fill(null);
let tiles = [];
let score = 0;
let gameOver = false; // para detener el juego

let draggedIndex = null;
let targetIndex = null;

// ---------- Helpers ----------
function idx(row, col) { return row * WIDTH + col; }
function pos(index) { return { row: Math.floor(index / WIDTH), col: index % WIDTH }; }
function randomImage() { return IMAGES[Math.floor(Math.random() * IMAGES.length)]; }
function updateScoreDisplay() { scoreEl.textContent = score; }

function showWinModal() {
  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="panel">
      <h2>🏆 ¡Has alcanzado ${TARGET_SCORE} puntos! 🏆</h2>
      <p>¡Juego terminado! Puntuación final: ${score}</p>
      <button id="reloadBtn">Reiniciar</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("reloadBtn").addEventListener("click", () => {
    location.reload();
  });
}

// ---------- Crear tablero ----------
function createBoard() {
  boardEl.innerHTML = "";
  tiles = [];
  grid = new Array(WIDTH * WIDTH);

  for (let i = 0; i < WIDTH * WIDTH; i++) {
    const img = document.createElement("img");
    img.draggable = true;
    img.className = "cell-img";
    img.dataset.id = i;

    img.addEventListener("dragstart", onDragStart);
    img.addEventListener("dragover", onDragOver);
    img.addEventListener("drop", onDrop);
    img.addEventListener("dragend", onDragEnd);

    img.addEventListener("touchstart", onTouchStart, { passive: false });
    img.addEventListener("touchmove", onTouchMove, { passive: false });
    img.addEventListener("touchend", onTouchEnd);

    boardEl.appendChild(img);
    tiles.push(img);
  }

  for (let i = 0; i < WIDTH * WIDTH; i++) {
    grid[i] = randomImage();
    tiles[i].src = grid[i];
  }

  resolveAllInitialMatches(() => {
    updateScoreDisplay();
  });
}

function resolveAllInitialMatches(callback) {
  let found = findMatches();
  if (found.size === 0) {
    if (callback) callback();
    return;
  }
  removeMatches(found, () => {
    resolveAllInitialMatches(callback);
  }, false);
}

// ---------- Eventos drag ----------
function onDragStart(e) {
  if (gameOver) return;
  draggedIndex = Number(e.target.dataset.id);
  e.target.classList.add("dragging");
  e.dataTransfer.setData("text/plain", "drag");
}
function onDragOver(e) { e.preventDefault(); }
function onDrop(e) {
  if (gameOver) return;
  e.preventDefault();
  const id = e.target.dataset && Number(e.target.dataset.id);
  if (typeof id === "number") targetIndex = id;
}
function onDragEnd(e) {
  if (gameOver) return;
  e.target.classList.remove("dragging");
  handleSwapFromDrag();
}

// ---------- Eventos touch ----------
let ongoingTouchTarget = null;
function onTouchStart(e) {
  if (gameOver) return;
  e.preventDefault();
  draggedIndex = Number(e.target.dataset.id);
  ongoingTouchTarget = e.target;
  e.target.classList.add("dragging");
}
function onTouchMove(e) {
  if (gameOver) return;
  e.preventDefault();
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!el) return;
  if (el.dataset && el.dataset.id) {
    targetIndex = Number(el.dataset.id);
  }
}
function onTouchEnd(e) {
  if (gameOver) return;
  e.preventDefault();
  if (ongoingTouchTarget) ongoingTouchTarget.classList.remove("dragging");
  handleSwapFromDrag();
  ongoingTouchTarget = null;
}

// ---------- Intercambio ----------
function handleSwapFromDrag() {
  if (draggedIndex === null || targetIndex === null) {
    draggedIndex = null; targetIndex = null;
    return;
  }
  if (draggedIndex === targetIndex) {
    draggedIndex = null; targetIndex = null;
    return;
  }
  const p1 = pos(draggedIndex);
  const p2 = pos(targetIndex);
  if (Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col) !== 1) {
    draggedIndex = null; targetIndex = null;
    return;
  }

  swapIndices(draggedIndex, targetIndex);

  const matches = findMatches();
  if (matches.size > 0) {
    removeMatches(matches, () => {
      chainResolveMatches();
    }, true);
  } else {
    swapIndices(draggedIndex, targetIndex);
  }

  draggedIndex = null;
  targetIndex = null;
}

function swapIndices(i1, i2) {
  const tmp = grid[i1];
  grid[i1] = grid[i2];
  grid[i2] = tmp;
  tiles[i1].src = grid[i1] || "";
  tiles[i2].src = grid[i2] || "";
}

// ---------- Buscar combinaciones ----------
function findMatches() {
  const toRemove = new Set();
  for (let r = 0; r < WIDTH; r++) {
    let runStart = 0;
    for (let c = 0; c <= WIDTH; c++) {
      const prevVal = c - 1 >= 0 ? grid[idx(r, c - 1)] : null;
      const curVal = c < WIDTH ? grid[idx(r, c)] : null;
      if (c && (!curVal || curVal !== prevVal)) {
        if (c - runStart >= 3) {
          for (let cc = runStart; cc < c; cc++) toRemove.add(idx(r, cc));
        }
        runStart = c;
      }
    }
  }
  for (let c = 0; c < WIDTH; c++) {
    let runStart = 0;
    for (let r = 0; r <= WIDTH; r++) {
      const prevVal = r - 1 >= 0 ? grid[idx(r - 1, c)] : null;
      const curVal = r < WIDTH ? grid[idx(r, c)] : null;
      if (r && (!curVal || curVal !== prevVal)) {
        if (r - runStart >= 3) {
          for (let rr = runStart; rr < r; rr++) toRemove.add(idx(rr, c));
        }
        runStart = r;
      }
    }
  }
  return toRemove;
}

// ---------- Eliminar y rellenar ----------
function removeMatches(matches, cb, addPoints = true) {
  if (!matches || matches.size === 0) {
    if (cb) cb();
    return;
  }
  if (addPoints) {
    score += matches.size * POINTS_PER_TILE;
    updateScoreDisplay();
    if (score >= TARGET_SCORE && !gameOver) {
      gameOver = true;
      setTimeout(showWinModal, 300);
      return;
    }
  }
  matches.forEach(i => {
    grid[i] = null;
    tiles[i].src = "";
  });
  setTimeout(() => {
    gravityAndRefill();
    if (cb) cb();
  }, 200);
}

function gravityAndRefill() {
  for (let c = 0; c < WIDTH; c++) {
    const colVals = [];
    for (let r = WIDTH - 1; r >= 0; r--) {
      if (grid[idx(r, c)]) colVals.push(grid[idx(r, c)]);
    }
    let r = WIDTH - 1;
    let k = 0;
    while (r >= 0) {
      grid[idx(r, c)] = (k < colVals.length) ? colVals[k++] : randomImage();
      r--;
    }
  }
  for (let i = 0; i < grid.length; i++) {
    tiles[i].src = grid[i];
  }
}

function chainResolveMatches() {
  setTimeout(() => {
    const matches = findMatches();
    if (matches.size > 0 && !gameOver) {
      removeMatches(matches, () => {
        chainResolveMatches();
      }, true);
    }
  }, 250);
}

// ---------- Iniciar ----------
createBoard();

function getTileFromTouch(touch) {
  let el = document.elementFromPoint(touch.clientX, touch.clientY);
  while (el && !el.dataset?.id && el !== document.body) {
    el = el.parentElement;
  }
  return el;
}

function onTouchStart(e) {
  if (gameOver) return;
  e.preventDefault();
  const tile = e.target;
  if (tile.dataset && tile.dataset.id) {
    draggedIndex = Number(tile.dataset.id);
    ongoingTouchTarget = tile;
    tile.classList.add("dragging");
  }
}

function onTouchMove(e) {
  if (gameOver) return;
  e.preventDefault();
  const touch = e.touches[0];
  const el = getTileFromTouch(touch);
  if (el && el.dataset?.id) {
    targetIndex = Number(el.dataset.id);
  }
}

function onTouchEnd(e) {
  if (gameOver) return;
  e.preventDefault();
  const touch = e.changedTouches[0];
  const el = getTileFromTouch(touch);
  if (el && el.dataset?.id) {
    targetIndex = Number(el.dataset.id);
  }
  if (ongoingTouchTarget) ongoingTouchTarget.classList.remove("dragging");
  handleSwapFromDrag();
  ongoingTouchTarget = null;
}
