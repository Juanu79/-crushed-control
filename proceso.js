const tablero = document.getElementById("tablero");
const puntuacionElemento = document.getElementById("puntuacion");

const filas = 8;
const columnas = 8;
let puntos = 0;

const simbolos = [
  "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo_switch_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/4/4e/Xbox_one_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/0/05/PlayStation_logo.svg"
];

let tableroDatos = [];

// Crear tablero inicial
function crearTablero() {
  tablero.innerHTML = "";
  tableroDatos = [];

  for (let fila = 0; fila < filas; fila++) {
    let filaDatos = [];
    for (let col = 0; col < columnas; col++) {
      const celda = document.createElement("div");
      celda.classList.add("celda");

      const img = document.createElement("img");
      const simbolo = simbolos[Math.floor(Math.random() * simbolos.length)];
      img.src = simbolo;
      celda.appendChild(img);

      filaDatos.push(simbolo);
      tablero.appendChild(celda);
    }
    tableroDatos.push(filaDatos);
  }
}

function verificarMatches() {
  let eliminados = new Set();

  // Filas
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas - 2; col++) {
      const s = tableroDatos[fila][col];
      if (s && s === tableroDatos[fila][col + 1] && s === tableroDatos[fila][col + 2]) {
        eliminados.add(`${fila}-${col}`);
        eliminados.add(`${fila}-${col + 1}`);
        eliminados.add(`${fila}-${col + 2}`);
      }
    }
  }

  // Columnas
  for (let col = 0; col < columnas; col++) {
    for (let fila = 0; fila < filas - 2; fila++) {
      const s = tableroDatos[fila][col];
      if (s && s === tableroDatos[fila + 1][col] && s === tableroDatos[fila + 2][col]) {
        eliminados.add(`${fila}-${col}`);
        eliminados.add(`${fila + 1}-${col}`);
        eliminados.add(`${fila + 2}-${col}`);
      }
    }
  }

  // Sumar puntos
  if (eliminados.size > 0) {
    puntos += eliminados.size * 10;
    puntuacionElemento.textContent = `Puntos: ${puntos}`;
    eliminados.forEach(pos => {
      const [f, c] = pos.split("-").map(Number);
      tableroDatos[f][c] = null;
    });
    actualizarTablero();
  }
}

function actualizarTablero() {
  // Bajar símbolos
  for (let col = 0; col < columnas; col++) {
    for (let fila = filas - 1; fila >= 0; fila--) {
      if (!tableroDatos[fila][col]) {
        for (let k = fila - 1; k >= 0; k--) {
          if (tableroDatos[k][col]) {
            tableroDatos[fila][col] = tableroDatos[k][col];
            tableroDatos[k][col] = null;
            break;
          }
        }
      }
    }
  }

  // Rellenar huecos
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      if (!tableroDatos[fila][col]) {
        tableroDatos[fila][col] = simbolos[Math.floor(Math.random() * simbolos.length)];
      }
    }
  }

  renderizarTablero();
}

function renderizarTablero() {
  const celdas = tablero.querySelectorAll(".celda");
  let i = 0;
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const img = celdas[i].querySelector("img");
      img.src = tableroDatos[fila][col];
      i++;
    }
  }
}

crearTablero();
setInterval(verificarMatches, 500);
