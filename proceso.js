// Referencias al tablero y marcador de puntaje
const grid = document.querySelector(".grid");
const scoreDisplay = document.querySelector(".score");

// Lista de tipos de fichas (cada una con nombre y símbolo)
const types = [
  { name: "xbox", symbol: "X" },
  { name: "ps", symbol: "☐" },
  { name: "nin", symbol: "A" },
  { name: "dpad", symbol: "+" },
  { name: "shoulder", symbol: "L" },
  { name: "start", symbol: "⏯" }
];

// Tamaño del tablero
const cols = 8; // columnas
const rows = 8; // filas

// Variables globales
let tiles = [];       // Almacenará todas las fichas
let score = 0;        // Puntaje
let draggedTile = null; // Ficha que se está arrastrando

// Genera un tipo aleatorio de ficha
function randomType() {
  return types[Math.floor(Math.random() * types.length)];
}

// Crea el tablero inicial
function createBoard() {
  tiles = [];          // Vacía el array de fichas
  grid.innerHTML = ""; // Limpia el HTML del tablero
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = createTile(r, c); // Crea ficha en (fila, columna)
      grid.appendChild(t.el);     // Añade la ficha al DOM
      tiles.push(t);              // La guarda en el array
    }
  }
}

// Crea una ficha individual con eventos
function createTile(row, col) {
  const type = randomType(); // Asigna tipo aleatorio
  const el = document.createElement("div");
  el.className = `tile type-${type.name}`; // Clase CSS para color/estilo
  el.textContent = type.symbol;            // Texto/símbolo
  el.setAttribute("draggable", true);      // Hacerla arrastrable
  el.dataset.row = row;                    // Guardar posición (fila)
  el.dataset.col = col;                    // Guardar posición (columna)

  // Eventos de arrastrar y soltar
  el.addEventListener("dragstart", dragStart);
  el.addEventListener("dragover", e => e.preventDefault()); // Permitir soltar
  el.addEventListener("drop", drop);
  el.addEventListener("dragend", dragEnd);

  return { el, type, row, col }; // Objeto ficha
}

// Cuando comienza a arrastrar una ficha
function dragStart(e) {
  draggedTile = e.target; // Guardamos cuál se está moviendo
}

// Cuando suelta la ficha sobre otra
function drop(e) {
  const target = e.target;
  if (!draggedTile || target === draggedTile) return; // No hacer nada si es la misma

  // Coordenadas de la ficha arrastrada
  const dr = parseInt(draggedTile.dataset.row);
  const dc = parseInt(draggedTile.dataset.col);

  // Coordenadas de la ficha destino
  const tr = parseInt(target.dataset.row);
  const tc = parseInt(target.dataset.col);

  // Solo permitir movimiento a una casilla adyacente
  if (Math.abs(dr - tr) + Math.abs(dc - tc) === 1) {
    swapTiles(dr, dc, tr, tc); // Intercambiar fichas
    if (!checkMatches()) {
      swapTiles(dr, dc, tr, tc); // Si no hay match, revertir
    } else {
      resolveMatches(); // Si hay match, procesar eliminación
    }
  }
}

// Cuando termina de arrastrar
function dragEnd() {
  draggedTile = null; // Reseteamos
}

// Intercambia dos fichas en posiciones dadas
function swapTiles(r1, c1, r2, c2) {
  const idx1 = r1 * cols + c1;
  const idx2 = r2 * cols + c2;

  // Intercambia en el array
  [tiles[idx1], tiles[idx2]] = [tiles[idx2], tiles[idx1]];

  // Intercambia posiciones en el DOM
  const el1 = tiles[idx1].el;
  const el2 = tiles[idx2].el;
  grid.insertBefore(el2, el1);
  grid.insertBefore(el1, grid.children[idx2]);

  // Actualiza coordenadas en datos
  tiles[idx1].row = r1; tiles[idx1].col = c1;
  el1.dataset.row = r1; el1.dataset.col = c1;
  tiles[idx2].row = r2; tiles[idx2].col = c2;
  el2.dataset.row = r2; el2.dataset.col = c2;
}

// Verifica si hay combinaciones de 3 o más fichas iguales
function checkMatches() {
  let found = false;

  // Revisar horizontalmente
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const t1 = tiles[r * cols + c];
      const t2 = tiles[r * cols + c + 1];
      const t3 = tiles[r * cols + c + 2];
      if (t1.type.name === t2.type.name && t1.type.name === t3.type.name) {
        t1.el.classList.add("removing");
        t2.el.classList.add("removing");
        t3.el.classList.add("removing");
        found = true;
      }
    }
  }

  // Revisar verticalmente
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const t1 = tiles[r * cols + c];
      const t2 = tiles[(r + 1) * cols + c];
      const t3 = tiles[(r + 2) * cols + c];
      if (t1.type.name === t2.type.name && t1.type.name === t3.type.name) {
        t1.el.classList.add("removing");
        t2.el.classList.add("removing");
        t3.el.classList.add("removing");
        found = true;
      }
    }
  }

  return found; // Devuelve si se encontró alguna coincidencia
}

// Procesa las fichas que se van a eliminar
function resolveMatches() {
  // Seleccionar todas las fichas marcadas como "removing"
  const toRemove = Array.from(document.querySelectorAll(".tile.removing"));

  // Sumar puntaje (10 por ficha eliminada)
  score += toRemove.length * 10;
  scoreDisplay.textContent = score;

  setTimeout(() => {
    // Eliminar fichas del array y del DOM
    toRemove.forEach(tileEl => {
      const idx = tiles.findIndex(t => t.el === tileEl);
      if (idx > -1) {
        tiles[idx] = null;
        grid.removeChild(tileEl);
      }
    });

    // Hacer caer las fichas
    for (let c = 0; c < cols; c++) {
      let empty = 0; // Contador de huecos
      for (let r = rows - 1; r >= 0; r--) {
        const idx = r * cols + c;
        if (!tiles[idx]) {
          empty++;
        } else if (empty > 0) {
          // Mover ficha hacia abajo
          const targetIdx = (r + empty) * cols + c;
          tiles[targetIdx] = tiles[idx];
          tiles[idx] = null;
          tiles[targetIdx].row = r + empty;
          tiles[targetIdx].el.dataset.row = r + empty;
        }
      }
      // Crear nuevas fichas en la parte superior
      for (let e = 0; e < empty; e++) {
        const newTile = createTile(e, c);
        tiles[e * cols + c] = newTile;
      }
    }

    // Renderizar nuevamente el tablero
    grid.innerHTML = "";
    tiles.forEach(t => grid.appendChild(t.el));

    // Si aún hay más coincidencias, repetir proceso
    if (checkMatches()) {
      resolveMatches();
    }
  }, 300); // Espera antes de borrar para que se vea la animación
}

// Inicializa el tablero al cargar
createBoard();
