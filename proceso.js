document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const width = 8;
    const squares = [];
    let score = 0;
    let gameOver = false; // Para detener el juego

    // Imágenes de consolas
    const consoleImages = [
        "img/ps5.png",
        "img/xbox.png",
        "img/switch.png",
        "img/psp.png",
        "img/gameboy.png",
        "img/dreamcast.png"
    ];

    // Crear el tablero
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("img");
            square.setAttribute("draggable", true);
            square.setAttribute("id", i);
            square.src = consoleImages[Math.floor(Math.random() * consoleImages.length)];
            grid.appendChild(square);
            squares.push(square);
        }
    }
    createBoard();

    // Intercambio de imágenes
    let colorBeingDragged;
    let colorBeingReplaced;
    let squareIdBeingDragged;
    let squareIdBeingReplaced;

    squares.forEach(square => square.addEventListener("dragstart", dragStart));
    squares.forEach(square => square.addEventListener("dragend", dragEnd));
    squares.forEach(square => square.addEventListener("dragover", dragOver));
    squares.forEach(square => square.addEventListener("dragenter", dragEnter));
    squares.forEach(square => square.addEventListener("dragleave", dragLeave));
    squares.forEach(square => square.addEventListener("drop", dragDrop));

    function dragStart() {
        if (gameOver) return;
        colorBeingDragged = this.src;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {}

    function dragDrop() {
        if (gameOver) return;
        colorBeingReplaced = this.src;
        squareIdBeingReplaced = parseInt(this.id);
        this.src = colorBeingDragged;
        squares[squareIdBeingDragged].src = colorBeingReplaced;
    }

    function dragEnd() {
        let validMoves = [
            squareIdBeingDragged - 1,
            squareIdBeingDragged - width,
            squareIdBeingDragged + 1,
            squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
            squares[squareIdBeingReplaced].src = colorBeingReplaced;
            squares[squareIdBeingDragged].src = colorBeingDragged;
        } else {
            squares[squareIdBeingDragged].src = colorBeingDragged;
        }
    }

    // Bajar imágenes
    function moveDown() {
        for (let i = 0; i < 55; i++) {
            if (squares[i + width].src.includes("blank")) {
                squares[i + width].src = squares[i].src;
                squares[i].src = "img/blank.png";
            }
        }
    }

    // Revisar filas de 3
    function checkRowForThree() {
        for (let i = 0; i < 61; i++) {
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = squares[i].src;
            const isBlank = decidedColor.includes("blank");

            if (rowOfThree.every(index => squares[index].src === decidedColor && !isBlank)) {
                score += 30;
                rowOfThree.forEach(index => squares[index].src = "img/blank.png");
            }
        }
    }

    // Revisar columnas de 3
    function checkColumnForThree() {
        for (let i = 0; i < 47; i++) {
            let columnOfThree = [i, i + width, i + width * 2];
            let decidedColor = squares[i].src;
            const isBlank = decidedColor.includes("blank");

            if (columnOfThree.every(index => squares[index].src === decidedColor && !isBlank)) {
                score += 30;
                columnOfThree.forEach(index => squares[index].src = "img/blank.png");
            }
        }
    }

    // Mostrar mensaje y detener juego
    function checkGameOver() {
        if (score >= 5000 && !gameOver) {
            gameOver = true;
            let message = document.createElement("div");
            message.classList.add("game-over");
            message.textContent = "🎉 ¡Has ganado! Alcanzaste 5000 puntos 🎮";
            document.body.appendChild(message);
        }
    }

    // Bucle del juego
    window.setInterval(function () {
        if (!gameOver) {
            checkRowForThree();
            checkColumnForThree();
            moveDown();
            scoreDisplay.textContent = score;
            checkGameOver();
        }
    }, 100);
});
