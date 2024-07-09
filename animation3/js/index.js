// Dobijanje canvas elementa i njegovog 2D konteksta
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Postavljanje dimenzija canvas-a
canvas.width = 600;
canvas.height = 600;

// Promenljive za pravougaonike
const rectangleCount = 3; // Broj pravougaonika
const rectangleWidth = 100; // Širina svakog pravougaonika
const rectangleHeight = 50; // Visina svakog pravougaonika
let rectangles = []; // Niz pravougaonika koji će se animirati
const colors = ["red", "yellow", "blue", "purple", "orange", "green"]; // Niz boja koje će se koristiti za pravougaonike

// Funkcija za mešanje elemenata niza (Fisher-Yates shuffle algoritam)
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Zamena elemenata na slučajnim pozicijama
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// Funkcija za nasumično postavljanje pravougaonika na početne pozicije
function initializeRectangles() {
  for (let i = 0; i < rectangleCount; i++) {
    // Nasumične pozicije i boje pravougaonika
    const y = Math.random() * (canvas.height - rectangleHeight);
    const x = Math.random() * (canvas.width - rectangleWidth);
    const colorIndexes = shuffle([0, 1, 2, 3, 4, 5]);
    const rectangleColors = colorIndexes.map((index) => colors[index]);
    const direction = Math.random() < 0.5 ? -1 : 1; // Nasumično određivanje smera kretanja

    rectangles.push({ x, y, colors: rectangleColors, direction });
  }
}

// Funkcija za crtanje pojedinačnog pravougaonika
function drawRectangle(rectangle) {
  const fieldWidth = rectangleWidth / 6; // Širina jednog polja boje unutar pravougaonika

  // Crtanje svih polja boja unutar pravougaonika
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = rectangle.colors[i];
    ctx.fillRect(
      rectangle.x + i * fieldWidth, // X pozicija polja boje
      rectangle.y, // Y pozicija pravougaonika
      fieldWidth, // Širina polja boje
      rectangleHeight // Visina pravougaonika
    );
  }
}

// Funkcija za crtanje svih pravougaonika na canvas-u
function drawRectangles() {
  rectangles.forEach(drawRectangle);
}

// Funkcija za ažuriranje pozicija pravougaonika tokom animacije
function updateRectangles() {
  rectangles.forEach((rectangle) => {
    if (rectangle.direction !== 0) {
      rectangle.x += rectangle.direction; // Ažuriranje X pozicije u skladu sa smerom kretanja

      // Provera da li je pravougaonik izašao izvan granica canvas-a
      if (rectangle.x > canvas.width) {
        rectangle.x = -rectangleWidth; // Vraćanje pravougaonika na početak sa leve strane
      } else if (rectangle.x + rectangleWidth < 0) {
        rectangle.x = canvas.width; // Vraćanje pravougaonika na početak sa desne strane
      }
    }
  });
}

// Funkcija za animiranje pravougaonika na canvas-u
function animateRectangles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Brisanje prethodnog stanja canvas-a
  drawRectangles(); // Crtanje svih pravougaonika
  updateRectangles(); // Ažuriranje pozicija pravougaonika
  requestAnimationFrame(animateRectangles); // Ponovno pozivanje funkcije za animaciju
}

// Pozivanje funkcije za inicijalizaciju pravougaonika pri pokretanju aplikacije
initializeRectangles();

// Pokretanje animacije pravougaonika
animateRectangles();

// Funkcija za obradu klika na canvas
function handleCanvasClick(event) {
  const x = event.offsetX; // X pozicija klika u odnosu na canvas
  const y = event.offsetY; // Y pozicija klika u odnosu na canvas
  let clickedOnRectangle = false;

  rectangles.forEach((rectangle, index) => {
    const fieldWidth = rectangleWidth / 6;

    // Provera da li je kliknuto na neki od polja boja unutar pravougaonika
    for (let i = 0; i < 6; i++) {
      const fieldX = rectangle.x + i * fieldWidth;
      if (
        x >= fieldX &&
        x <= fieldX + fieldWidth &&
        y >= rectangle.y &&
        y <= rectangle.y + rectangleHeight
      ) {
        rectangle.direction = 0; // Zaustavljanje kretanja pravougaonika
        clickedOnRectangle = true;
        return;
      }
    }
  });

  if (!clickedOnRectangle) {
    // Ako nije kliknuto na pravougaonik, ponovno pokrenuti kretanje pravougaonika
    rectangles.forEach((rectangle) => {
      if (rectangle.direction === 0) {
        rectangle.direction = Math.random() < 0.5 ? -1 : 1; // Nasumično određivanje smera kretanja
      }
    });
  }
}

// Dodavanje event listener-a za klik na canvas
canvas.addEventListener("click", handleCanvasClick);
