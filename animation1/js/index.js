const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const radius = 20;
let circles = [];
let redCircle = null;
let fadingCircles = [];

// Pomoćna funkcija za crtanje kruga
function drawCircle(x, y, radius, color, alpha = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  ctx.fill();
  ctx.closePath();
}

// Inicijalizacija krugova
function initializeCircles() {
  const maxCircles = Math.floor(
    (width * height) / 2 / (Math.PI * radius * radius)
  );

  let attempts = 0;
  const maxAttempts = 1000;

  while (circles.length < maxCircles && attempts < maxAttempts) {
    const x = Math.random() * (width - 2 * radius) + radius;
    const y = Math.random() * (height / 2 - 2 * radius) + radius;

    // Provera da li se krugovi preklapaju
    if (
      !circles.some(
        (circle) => Math.hypot(circle.x - x, circle.y - y) < 2 * radius
      )
    ) {
      circles.push({ x, y, color: "0, 0, 255", alpha: 1 });
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.log("Reached maximum attempts to place circles.");
  }

  // Crtanje svih krugova
  circles.forEach((circle) =>
    drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha)
  );
}

// Pozivanje funkcije za inicijalizaciju krugova
initializeCircles();

// Dodavanje event listener-a za miša
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

function handleMouseDown(event) {
  const { offsetX: x, offsetY: y } = event;

  // Crveni krug se pušta samo sa donje polovine canvas-a
  if (y > height / 2) {
    redCircle = { x, y, dx: 0, dy: 0, color: "255, 0, 0" };
  }
}

function handleMouseUp(event) {
  if (redCircle) {
    const { offsetX: x, offsetY: y } = event;

    // Postavljanje brzine crvenog kruga na osnovu razmaka između pritiska i puštanja miša
    redCircle.dx = (x - redCircle.x) / 10;
    redCircle.dy = (y - redCircle.y) / 10;
  }
}

// Animacija
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Crtanje svih plavih krugova
  circles.forEach((circle) =>
    drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha)
  );

  // Ako postoji crveni krug, izvršavamo njegovu animaciju
  if (redCircle) {
    redCircle.x += redCircle.dx;
    redCircle.y += redCircle.dy;

    // Detekcija sudara crvenog kruga sa ivicama canvas-a radi odbijanja
    if (redCircle.x + radius > width || redCircle.x - radius < 0) {
      redCircle.dx *= -1;
    }
    if (redCircle.y + radius > height || redCircle.y - radius < 0) {
      redCircle.dy *= -1;
    }

    // Detekcija sudara crvenog kruga sa plavim krugovima
    circles = circles.filter((circle) => {
      if (
        Math.hypot(circle.x - redCircle.x, circle.y - redCircle.y) <
        2 * radius
      ) {
        fadingCircles.push({ ...circle });
        return false;
      }
      return true;
    });

    // Crtanje crvenog kruga
    drawCircle(redCircle.x, redCircle.y, radius, redCircle.color);
  }

  // Animacija bleđenja pogođenih plavih krugova
  fadingCircles.forEach((circle, index) => {
    circle.alpha -= 0.01;
    if (circle.alpha <= 0) {
      fadingCircles.splice(index, 1);
    } else {
      drawCircle(circle.x, circle.y, radius, circle.color, circle.alpha);
    }
  });

  requestAnimationFrame(animate);
}

// Pozivanje animacije
animate();

document.addEventListener("submit", (event) => {
  event.preventDefault();
});
