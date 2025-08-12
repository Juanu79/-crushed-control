const tablero = document.getElementById("tablero");
const scoreDisplay = document.getElementById("score");
const ancho = 8;
let score = 0;

const imagenes = [
  "imagenes/nintendo.png",
  "imagenes/play.png",
  "imagenes/xbox.png"
];

let celdas = [];

// Crear tablero
function crearTablero() {
  for (let i = 0; i < ancho * ancho; i++) {
    const celda = document.createElement("div");
    celda.classList.add("celda");
    celda.setAttribute("draggable", true);
    celda.setAttribute("id", i);
    let imagen = imagenes[Math.floor(Math.random() * imagenes.length)];
    celda.style.backgroundImage = `url(${imagen})`;
    tablero.appendChild(celda);
    celdas.push(celda);
  }
}
crearTablero();

// Drag & drop
let celdaArrastrada, celdaReemplazo, idArrastrada, idReemplazo;

celdas.forEach(celda => {
  celda.addEventListener("dragstart", arrastrar);
  celda.addEventListener("dragover", e => e.preventDefault());
  celda.addEventListener("drop", soltar);
  celda.addEventListener("dragend", finArrastre);
});

function arrastrar() {
  celdaArrastrada = this.style.backgroundImage;
  idArrastrada = parseInt(this.id);
}

function soltar() {
  celdaReemplazo = this.style.backgroundImage;
  idReemplazo = parseInt(this.id);
}

function finArrastre() {
  let movimientosValidos = [
    idArrastrada - 1, idArrastrada + 1,
    idArrastrada - ancho, idArrastrada + ancho
  ];

  if (movimientosValidos.includes(idReemplazo)) {
    celdas[idReemplazo].style.backgroundImage = celdaArrastrada;
    celdas[idArrastrada].style.backgroundImage = celdaReemplazo;

    let valido = verificarMatches();
    if (!valido) {
      // revertir si no hay match
      celdas[idReemplazo].style.backgroundImage = celdaReemplazo;
      celdas[idArrastrada].style.backgroundImage = celdaArrastrada;
    }
  }
}

// Verificar coincidencias
function verificarMatches() {
  let match = false;

  // Horizontal
  for (let i = 0; i < ancho * ancho; i++) {
    let fila = i % ancho;
    if (fila < 6) {
      let filaBloque = [i, i+1, i+2];
      let img = celdas[i].style.backgroundImage;
      if (img && filaBloque.every(id => celdas[id].style.backgroundImage === img)) {
        match = true;
        score += 10;
        filaBloque.forEach(id => celdas[id].style.backgroundImage = "");
      }
    }
  }

  // Vertical
  for (let i = 0; i < ancho * (ancho - 2); i++) {
    let colBloque = [i, i+ancho, i+ancho*2];
    let img = celdas[i].style.backgroundImage;
    if (img && colBloque.every(id => celdas[id].style.backgroundImage === img)) {
      match = true;
      score += 10;
      colBloque.forEach(id => celdas[id].style.backgroundImage = "");
    }
  }

  scoreDisplay.textContent = score;
  return match;
}

// Caída de fichas y relleno
function caerFichas() {
  for (let i = 0; i < ancho * ancho - ancho; i++) {
    if (celdas[i + ancho].style.backgroundImage === "") {
      celdas[i + ancho].style.backgroundImage = celdas[i].style.backgroundImage;
      celdas[i].style.backgroundImage = "";
    }
  }

  // Primera fila rellena
  for (let i = 0; i < ancho; i++) {
    if (celdas[i].style.backgroundImage === "") {
      let img = imagenes[Math.floor(Math.random() * imagenes.length)];
      celdas[i].style.backgroundImage = `url(${img})`;
    }
  }
}

// Bucle del juego
window.setInterval(function () {
  verificarMatches();
  caerFichas();
}, 100);
