// Dobijanje canvas elementa i njegovog 2D konteksta
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Postavljanje dimenzija canvas-a
canvas.width = 600;
canvas.height = 600;

// Promenljive za pravougaonike
const rectangleCount = 3;
const rectangleWidth = 100;
const rectangleHeight = 50;
let rectangles = [];
const colors = ["red", "yellow", "blue", "purple", "orange", "green"];

// Funkcija za mešanje elemenata niza (Fisher-Yates shuffle algoritam)
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// Funkcija za nasumično postavljanje pravougaonika
function initializeRectangles() {
  for (let i = 0; i < rectangleCount; i++) {
    const y = Math.random() * (canvas.height - rectangleHeight);
    const x = Math.random() * (canvas.width - rectangleWidth);
    const colorIndexes = shuffle([0, 1, 2, 3, 4, 5]);
    const rectangleColors = colorIndexes.map((index) => colors[index]);
    const direction = Math.random() < 0.5 ? -1 : 1; // Nasumično određivanje smera
    rectangles.push({ x, y, colors: rectangleColors, direction });
  }
}

// Funkcija za crtanje pravougaonika
function drawRectangle(rectangle) {
  const fieldWidth = rectangleWidth / 6;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = rectangle.colors[i];
    ctx.fillRect(
      rectangle.x + i * fieldWidth,
      rectangle.y,
      fieldWidth,
      rectangleHeight
    );
  }
}

// Funkcija za crtanje svih pravougaonika
function drawRectangles() {
  rectangles.forEach(drawRectangle);
}

// Funkcija za ažuriranje pozicija pravougaonika
function updateRectangles() {
  rectangles.forEach((rectangle) => {
    if (rectangle.direction !== 0) {
      rectangle.x += rectangle.direction;
      if (rectangle.x > canvas.width) {
        rectangle.x = -rectangleWidth;
      } else if (rectangle.x + rectangleWidth < 0) {
        rectangle.x = canvas.width;
      }
    }
  });
}

// Funkcija za animaciju pravougaonika
function animateRectangles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRectangles();
  updateRectangles();
  requestAnimationFrame(animateRectangles);
}

// Pozivanje funkcije za inicijalizaciju pravougaonika
initializeRectangles();

// Pokretanje animacije pravougaonika
animateRectangles();

// Funkcija za obradu klika na canvas
function handleCanvasClick(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  let clickedOnRectangle = false;

  rectangles.forEach((rectangle, index) => {
    const fieldWidth = rectangleWidth / 6;
    for (let i = 0; i < 6; i++) {
      const fieldX = rectangle.x + i * fieldWidth;
      if (
        x >= fieldX &&
        x <= fieldX + fieldWidth &&
        y >= rectangle.y &&
        y <= rectangle.y + rectangleHeight
      ) {
        rectangle.direction = 0;
        clickedOnRectangle = true;
        return;
      }
    }
  });

  if (!clickedOnRectangle) {
    rectangles.forEach((rectangle) => {
      if (rectangle.direction === 0) {
        rectangle.direction = Math.random() < 0.5 ? -1 : 1;
      }
    });
  }
}

// Dodavanje event listener-a za klik na canvas
canvas.addEventListener("click", handleCanvasClick);
