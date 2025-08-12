// Selecciona el canvas y su contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustar el tamaño del canvas al tamaño de la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Variables del juego
let player = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    color: "red",
    velocityY: 0,
    jumpForce: 15,
    gravity: 0.8,
    isJumping: false
};

// Función de salto
function jump() {
    if (!player.isJumping) {
        player.velocityY = -player.jumpForce;
        player.isJumping = true;
    }
}

// Detectar clic o toque en pantalla
canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    jump();
}, { passive: false });

// Bucle del juego
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar gravedad
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Evitar que se caiga
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.isJumping = false;
    }

    // Dibujar jugador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
}

update();
