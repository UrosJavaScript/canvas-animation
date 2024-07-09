// Dobijanje canvas elementa i njegovog 2D konteksta
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Postavljanje dimenzija canvas-a
canvas.width = 600;
canvas.height = 600;

// Promenljive za rad sa krugom
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200; // Veći radius za centralni krug

// Promenljive za sektore u krugu
const sectorCount = 6;
const sectorAngle = (2 * Math.PI) / sectorCount;
let sectors = [];
let rotationSpeed = 0.005;
let rotationDirection = 1;
let rotationActive = false;
let clickSectorIndex = -1;

// Funkcija za crtanje sektora u krugu
function drawSector(startAngle, endAngle, color) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// Inicijalizacija sektora
function initializeSectors() {
  const colors = ["red", "yellow", "blue", "purple", "orange", "green"];
  let startAngle = -Math.PI / 2; // Početak sektora
  for (let i = 0; i < sectorCount; i++) {
    const endAngle = startAngle + sectorAngle;
    sectors.push({ startAngle, endAngle, color: colors[i], pulled: false });
    startAngle += sectorAngle;
  }
}

// Pozivanje funkcije za inicijalizaciju sektora
initializeSectors();

// Funkcija za crtanje centralnog kruga sa sektorima
function drawCentralCircle() {
  sectors.forEach((sector) => {
    if (clickSectorIndex === sectors.indexOf(sector) && sector.pulled) {
      // Ako je sektor izvučen, crta se beli sektor sa tekstom "KLIK"
      drawSector(sector.startAngle, sector.endAngle, "white");
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(
        "KLIK",
        centerX +
          (radius / 2) * Math.cos((sector.startAngle + sector.endAngle) / 2),
        centerY +
          (radius / 2) * Math.sin((sector.startAngle + sector.endAngle) / 2)
      );
    } else {
      // Inače se crta normalni sektor
      drawSector(sector.startAngle, sector.endAngle, sector.color);
    }
  });
}

// Animacija rotacije centralnog kruga
function animateCentralCircle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCentralCircle();

  if (rotationActive) {
    sectors.forEach((sector) => {
      sector.startAngle += rotationSpeed * rotationDirection;
      sector.endAngle += rotationSpeed * rotationDirection;
    });
  }

  requestAnimationFrame(animateCentralCircle);
}

// Pozivanje animacije rotacije centralnog kruga
animateCentralCircle();

// Dodavanje event listener-a za klik na canvas
canvas.addEventListener("click", handleClick);

// Funkcija za obradu klika na canvas
function handleClick(event) {
  const x = event.offsetX;
  const y = event.offsetY;

  // Provera da li je klik na centralni krug
  const distanceToCenter = Math.hypot(x - centerX, y - centerY);
  if (distanceToCenter <= radius) {
    // Ako je klik na centralni krug, rotacija se zaustavlja ili pokreće
    rotationActive = !rotationActive;
    if (!rotationActive) {
      // Ako se rotacija zaustavlja, izvlači se sektor na koji je kliknuto
      const clickAngle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
      sectors.forEach((sector, index) => {
        if (clickAngle >= sector.startAngle && clickAngle <= sector.endAngle) {
          pullSector(index);
          return;
        }
      });
    }
  } else {
    // Ako je klik van centralnog kruga, određuje se smer rotacije
    rotationDirection = x < centerX ? -1 : 1;
  }
}

// Funkcija za izvlačenje sektora iz centralnog kruga
function pullSector(index) {
  clickSectorIndex = index;
  sectors[index].pulled = true;
  animateSectorPull(index);
}

// Animacija izvlačenja sektora
function animateSectorPull(index) {
  let pullRadius = 0;
  const initialAngle = sectors[index].startAngle;
  const finalAngle = sectors[index].endAngle;
  let colorChange = true; // Promenljiva za promenu boje

  const animationInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCentralCircle();

    if (pullRadius >= radius) {
      clearInterval(animationInterval);
      resetSector(index);
    } else {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, pullRadius, initialAngle, finalAngle);
      ctx.fillStyle = colorChange ? "white" : sectors[index].color; // Promena boje iz osnovne u belu i nazad
      ctx.fill();
      ctx.closePath();
      pullRadius += 2;

      // Iscrtavanje teksta "KLIK" u sredini sektora
      if (pullRadius >= radius / 2) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(
          "KLIK",
          centerX + (radius / 2) * Math.cos((initialAngle + finalAngle) / 2),
          centerY + (radius / 2) * Math.sin((initialAngle + finalAngle) / 2)
        );
      }

      // Promena boje svakih 20 piksela radi efekta treperenja
      if (pullRadius % 20 === 0) {
        colorChange = !colorChange;
      }
    }
  }, 30);
}

// Resetovanje sektora nakon animacije izvlačenja
function resetSector(index) {
  setTimeout(() => {
    clickSectorIndex = -1;
    sectors[index].pulled = false;
    animateCentralCircle();
  }, 1000);
}

document.addEventListener("submit", (event) => {
  event.preventDefault();
});
