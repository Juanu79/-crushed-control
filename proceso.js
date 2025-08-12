// proceso.js — versión robusta para móvil/desktop
document.addEventListener("DOMContentLoaded", () => {
  const DEBUG = true; // ponlo a false cuando ya esté OK

  const BOARD_ID = "game-board";
  const SCORE_ID = "score";
  const WIDTH = 8;
  const TARGET_SCORE = 5000;
  const POINTS_PER_TILE = 10;

  // Rutas relativas (asegúrate que ./imagenes/ sea la ruta correcta desde tu index.html)
  const IMAGES = [
    "./imagenes/nintendo.png",
    "./imagenes/play.png",
    "./imagenes/xbox.png"
  ];

  const boardEl = document.getElementById(BOARD_ID);
  const scoreEl = document.getElementById(SCORE_ID);
  if (!boardEl) {
    console.error("No se encontró el elemento del tablero (id=" + BOARD_ID + ").");
    return;
  }

  let grid = new Array(WIDTH * WIDTH).fill(null);
  let tiles = [];
  let score = 0;
  let gameOver = false;

  let draggedIndex = null;   // usado por drag/pointer
  let targetIndex = null;
  let selectedIndex = null;  // usado por tap-to-select
  let pointerActive = false;

  // --- Helpers ---
  function idx(row, col) { return row * WIDTH + col; }
  function pos(index) { return { row: Math.floor(index / WIDTH), col: index % WIDTH }; }
  function randomImage() { return IMAGES[Math.floor(Math.random() * IMAGES.length)]; }
  function updateScoreDisplay() { if (scoreEl) scoreEl.textContent = score; }

  function showWinModal() {
    const modal = document.createElement("div");
    modal.className = "modal show";
    modal.innerHTML = 
      <div class="panel">
        <h2>🏆 ¡Has alcanzado ${TARGET_SCORE} puntos! 🏆</h2>
        <p>¡Juego terminado! Puntuación final: ${score}</p>
        <button id="reloadBtn">Reiniciar</button>
      </div>
    ;
    document.body.appendChild(modal);
    document.getElementById("reloadBtn").addEventListener("click", () => location.reload());
  }

  // --- Index desde coordenadas (robusto frente a escalado) ---
  function getIndexFromPoint(clientX, clientY) {
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const cellW = rect.width / WIDTH;
    const cellH = rect.height / WIDTH;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    if (row < 0 || row >= WIDTH || col < 0 || col >= WIDTH) return null;
    return idx(row, col);
  }

  // --- Crear tablero ---
  function createBoard() {
    boardEl.innerHTML = "";
    tiles = [];
    grid = new Array(WIDTH * WIDTH);

    for (let i = 0; i < WIDTH * WIDTH; i++) {
      const img = document.createElement("img");
      img.draggable = true;
      img.className = "cell-img";
      img.dataset.id = i;
      img.alt = "tile-" + i;
      // placeholder hasta asignar src
      img.src = "";
      // handler si falla la carga (debug)
      img.onerror = function() {
        if (DEBUG) console.warn("Fallo carga imagen en tile", i, "ruta probada:", img.src);
        // evita imagen rota — asigna una alternativa si quieres
      };
      // click/tap (tap-to-select)
      img.addEventListener("click", (e) => {
        e.preventDefault();
        handleTileTap(Number(e.currentTarget.dataset.id));
      });

      boardEl.appendChild(img);
      tiles.push(img);
    }

    // llenar grid y asignar src
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      grid[i] = randomImage();
      tiles[i].src = grid[i];
    }

    resolveAllInitialMatches(() => {
      updateScoreDisplay();
      if (DEBUG) console.log("Tablero creado.");
    });
  }

  function resolveAllInitialMatches(callback) {
    let found = findMatches();
    if (found.size === 0) {
      if (callback) callback();
      return;
    }
    removeMatches(found, () => resolveAllInitialMatches(callback), false);
  }

  // --- Eventos pointer (recomendado) ---
  function onPointerDown(e) {
    if (gameOver) return;
    // solo botón primario o touch
    pointerActive = true;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const i = getIndexFromPoint(e.clientX, e.clientY);
    if (i !== null) {
      draggedIndex = i;
      if (tiles[i]) tiles[i].classList.add("dragging");
      if (DEBUG) console.log("pointerdown index=", i);
      // opcional: capture
      try { boardEl.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }

  function onPointerMove(e) {
    if (!pointerActive || gameOver) return;
    const i = getIndexFromPoint(e.clientX, e.clientY);
    if (i !== null) {
      targetIndex = i;
    }
  }

  function onPointerUp(e) {
    if (gameOver) return;
    pointerActive = false;
    const i = getIndexFromPoint(e.clientX, e.clientY);
    if (i !== null) targetIndex = i;
    // limpiar clases
    tiles.forEach(t => t.classList.remove("dragging"));
    try { boardEl.releasePointerCapture && boardEl.releasePointerCapture(e.pointerId); } catch (_) {}
    if (DEBUG) console.log("pointerup dragged=", draggedIndex, "target=", targetIndex);
    handleSwapFromDrag();
  }

  function onPointerCancel(e) {
    pointerActive = false;
    draggedIndex = null;
    targetIndex = null;
    tiles.forEach(t => t.classList.remove("dragging"));
  }

  // --- Fallback touch (si pointer no existe) ---
  function onTouchStart(e) {
    if (gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const i = getIndexFromPoint(touch.clientX, touch.clientY);
    if (i !== null) {
      draggedIndex = i;
      ongoingTouch = tiles[i];
      tiles[i].classList.add("dragging");
      if (DEBUG) console.log("touchstart index=", i);
    }
  }
  function onTouchMove(e) {
    if (gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const i = getIndexFromPoint(touch.clientX, touch.clientY);
    if (i !== null) targetIndex = i;
  }
  function onTouchEnd(e) {
    if (gameOver) return;
    e.preventDefault();
    const touch = (e.changedTouches && e.changedTouches[0]) || null;
    if (touch) {
      const i = getIndexFromPoint(touch.clientX, touch.clientY);
      if (i !== null) targetIndex = i;
    }
    tiles.forEach(t => t.classList.remove("dragging"));
    if (DEBUG) console.log("touchend dragged=", draggedIndex, "target=", targetIndex);
    handleSwapFromDrag();
  }

  // --- Tap-to-select (útil en móviles donde drag falla) ---
  function handleTileTap(index) {
    if (gameOver) return;
    if (selectedIndex === null) {
      selectedIndex = index;
      tiles[index].classList.add("selected");
      if (DEBUG) console.log("selected", index);
      return;
    }
    if (selectedIndex === index) {
      tiles[selectedIndex].classList.remove("selected");
      selectedIndex = null;
      return;
    }
    targetIndex = index;
    tiles[selectedIndex].classList.remove("selected");
    if (DEBUG) console.log("tap swap", selectedIndex, "->", targetIndex);
    handleSwapFromTap(selectedIndex, targetIndex);
    selectedIndex = null;
    targetIndex = null;
  }

  function handleSwapFromTap(i1, i2) {
    // solo adyacentes
    const p1 = pos(i1);
    const p2 = pos(i2);
    if (Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col) !== 1) {
      if (DEBUG) console.log("no adyacente; no swap");
      return;
    }
    swapIndices(i1, i2);
    const matches = findMatches();
    if (matches.size > 0) {
      removeMatches(matches, () => chainResolveMatches(), true);
    } else {
      swapIndices(i1, i2); // revertir
    }
  }

  // --- Intercambio (usado por pointer/touch) ---
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
      removeMatches(matches, () => chainResolveMatches(), true);
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

  // --- Buscar combinaciones (igual que tu versión) ---
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

  // --- Eliminar, añadir puntos y rellenar (igual que tu versión) ---
  function removeMatches(matches, cb, addPoints = true) {
    if (!matches || matches.size === 0) {
      if (cb) cb && cb();
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
    for (let i = 0; i < grid.length; i++) tiles[i].src = grid[i];
  }

  function chainResolveMatches() {
    setTimeout(() => {
      const matches = findMatches();
      if (matches.size > 0 && !gameOver) {
        removeMatches(matches, () => chainResolveMatches(), true);
      }
    }, 250);
  }

  // --- Listeners globales sobre el board (pointer preferido) ---
  if (window.PointerEvent) {
    boardEl.addEventListener("pointerdown", onPointerDown);
    boardEl.addEventListener("pointermove", onPointerMove);
    boardEl.addEventListener("pointerup", onPointerUp);
    boardEl.addEventListener("pointercancel", onPointerCancel);
    if (DEBUG) console.log("Usando Pointer Events");
  } else {
    // fallback touch
    boardEl.addEventListener("touchstart", onTouchStart, { passive: false });
    boardEl.addEventListener("touchmove", onTouchMove, { passive: false });
    boardEl.addEventListener("touchend", onTouchEnd, { passive: false });
    // keep drag events for desktop mouse as well
    boardEl.addEventListener("mousedown", (e) => {
      const i = getIndexFromPoint(e.clientX, e.clientY);
      if (i !== null) draggedIndex = i;
    });
    boardEl.addEventListener("mouseup", (e) => {
      const i = getIndexFromPoint(e.clientX, e.clientY);
      if (i !== null) { targetIndex = i; handleSwapFromDrag(); }
    });
    if (DEBUG) console.log("Pointer no soportado, usando touch/mouse fallback");
  }

  // --- Iniciar ---
  createBoard();

  if (DEBUG) {
    console.log("proceso.js iniciado");
    console.log("Asegúrate que las imágenes están en: ./imagenes/ (ejemplo: ./imagenes/nintendo.png)");
  }
});