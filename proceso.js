const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Ajustar tamaño al cambiar de orientación o pantalla
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Cargar imágenes
const xboxImg = new Image();
xboxImg.src = "xbox.png";

const playImg = new Image();
playImg.src = "play.png";

// Variables del juego
let playerX = canvas.width / 2 - 25;
let playerY = canvas.height - 100;
const playerWidth = 50;
const playerHeight = 50;
let speed = 5;

let keys = { left: false, right: false };

// Detección de teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

// Detección táctil
document.getElementById("btnLeft").addEventListener("touchstart", () => keys.left = true);
document.getElementById("btnLeft").addEventListener("touchend", () => keys.left = false);

document.getElementById("btnRight").addEventListener("touchstart", () => keys.right = true);
document.getElementById("btnRight").addEventListener("touchend", () => keys.right = false);

// Bucle del juego
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar jugador
  ctx.drawImage(xboxImg, playerX, playerY, playerWidth, playerHeight);

  // Movimiento
  if (keys.left && playerX > 0) playerX -= speed;
  if (keys.right && playerX < canvas.width - playerWidth) playerX += speed;

  requestAnimationFrame(draw);
}

draw();
