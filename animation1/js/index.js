const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const radius = 20; // Radijus krugova
let circles = []; // Niz plavih krugova
let redCircle = null; // Crveni krug koji korisnik pušta
let fadingCircles = []; // Niz krugova koji blede nakon što su pogodeni

// Pomoćna funkcija za crtanje kruga
function drawCircle(x, y, radius, color, alpha = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2); // Crtanje kruga
  ctx.fillStyle = `rgba(${color}, ${alpha})`; // Postavljanje boje i prozirnosti
  ctx.fill();
  ctx.closePath();
}

// Inicijalizacija plavih krugova na random pozicijama
function initializeCircles() {
  const maxCircles = Math.floor(
    (width * height) / 2 / (Math.PI * radius * radius) // Maksimalni broj krugova
  );

  let attempts = 0;
  const maxAttempts = 1000;

  // Generisanje krugova dokle god ima mesta i dok se ne dostigne maksimalan broj pokušaja
  while (circles.length < maxCircles && attempts < maxAttempts) {
    const x = Math.random() * (width - 2 * radius) + radius; // Random x pozicija unutar canvas-a
    const y = Math.random() * (height / 2 - 2 * radius) + radius; // Random y pozicija unutar gornje polovine canvas-a

    // Provera da li se krugovi preklapaju
    if (
      !circles.some(
        (circle) => Math.hypot(circle.x - x, circle.y - y) < 2 * radius
      )
    ) {
      circles.push({ x, y, color: "0, 0, 255", alpha: 1 }); // Dodavanje kruga u niz plavih krugova
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.log("Reached maximum attempts to place circles."); // Obaveštenje ako se dostigne maksimalan broj pokušaja
  }

  // Crtanje svih plavih krugova na canvas-u
  circles.forEach((circle) =>
    drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha)
  );
}

// Pozivanje funkcije za inicijalizaciju plavih krugova
initializeCircles();

// Dodavanje event listener-a za miša za početak i kraj vučenja crvenog kruga
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

// Funkcija koja se poziva kada korisnik pritisne miša unutar canvas-a
function handleMouseDown(event) {
  const { offsetX: x, offsetY: y } = event;

  // Crveni krug se može pustiti samo iz donje polovine canvas-a
  if (y > height / 2) {
    redCircle = { x, y, dx: 0, dy: 0, color: "255, 0, 0" }; // Inicijalizacija crvenog kruga
  }
}

// Funkcija koja se poziva kada korisnik pusti miša unutar canvas-a
function handleMouseUp(event) {
  if (redCircle) {
    const { offsetX: x, offsetY: y } = event;

    // Postavljanje brzine crvenog kruga na osnovu razmaka između početka i kraja vučenja
    redCircle.dx = (x - redCircle.x) / 10;
    redCircle.dy = (y - redCircle.y) / 10;
  }
}

// Glavna funkcija za animaciju
function animate() {
  ctx.clearRect(0, 0, width, height); // Brisanje prethodnog sadržaja canvas-a

  // Crtanje svih plavih krugova na njihovim trenutnim pozicijama
  circles.forEach((circle) =>
    drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha)
  );

  // Ako postoji crveni krug, izvršavamo njegovu animaciju
  if (redCircle) {
    redCircle.x += redCircle.dx; // Promena x pozicije crvenog kruga prema brzini
    redCircle.y += redCircle.dy; // Promena y pozicije crvenog kruga prema brzini

    // Detekcija sudara crvenog kruga sa ivicama canvas-a radi odbijanja
    if (redCircle.x + radius > width || redCircle.x - radius < 0) {
      redCircle.dx *= -1; // Odbijanje po x osi
    }
    if (redCircle.y + radius > height || redCircle.y - radius < 0) {
      redCircle.dy *= -1; // Odbijanje po y osi
    }

    // Detekcija sudara crvenog kruga sa plavim krugovima
    circles = circles.filter((circle) => {
      if (
        Math.hypot(circle.x - redCircle.x, circle.y - redCircle.y) <
        2 * radius
      ) {
        fadingCircles.push({ ...circle }); // Dodavanje pogođenog plavog kruga u niz za bleđenje
        return false; // Uklanjanje pogođenog plavog kruga iz niza plavih krugova
      }
      return true;
    });

    // Crtanje crvenog kruga na njegovoj trenutnoj poziciji
    drawCircle(redCircle.x, redCircle.y, radius, redCircle.color);
  }

  // Animacija bleđenja pogođenih plavih krugova
  fadingCircles.forEach((circle, index) => {
    circle.alpha -= 0.01; // Smanjenje prozirnosti pogođenih krugova
    if (circle.alpha <= 0) {
      fadingCircles.splice(index, 1); // Uklanjanje kruga iz niza za bleđenje kada postane potpuno proziran
    } else {
      drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha); // Crtanje pogođenog kruga sa smanjenom prozirnošću
    }
  });

  requestAnimationFrame(animate); // Ponovni poziv funkcije za sledeći frejm animacije
}

// Pokretanje glavne animacije
animate();

// Sprječavanje podrazumevanog ponašanja obrasca na stranici
document.addEventListener("submit", (event) => {
  event.preventDefault();
});
