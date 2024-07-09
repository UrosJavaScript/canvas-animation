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
function drawSector(startAngle, endAngle, color, text) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();

  // Dodavanje teksta u sredinu sektora ako je zadat
  if (text) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      text,
      centerX + (radius / 2) * Math.cos((startAngle + endAngle) / 2),
      centerY + (radius / 2) * Math.sin((startAngle + endAngle) / 2)
    );
  }
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

// Funkcija za crtanje centralnog kruga sa sektorima
function drawCentralCircle() {
  sectors.forEach((sector) => {
    // Crtanje belog sektora sa tekstom "KLIK" ako je sektor izvučen
    if (clickSectorIndex === sectors.indexOf(sector) && sector.pulled) {
      drawSector(sector.startAngle, sector.endAngle, "white", "KLIK");
    } else {
      // Inače se crta normalni sektor u svojoj boji
      drawSector(sector.startAngle, sector.endAngle, sector.color);
    }
  });
}

// Animacija rotacije centralnog kruga
function animateCentralCircle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCentralCircle();

  // Rotacija sektora ako je aktivna
  if (rotationActive) {
    sectors.forEach((sector) => {
      sector.startAngle += rotationSpeed * rotationDirection;
      sector.endAngle += rotationSpeed * rotationDirection;
    });
  }

  // Pozivanje animacije na sledećem frejmu
  requestAnimationFrame(animateCentralCircle);
}

// Inicijalizacija sektora pri pokretanju aplikacije
initializeSectors();

// Pokretanje animacije rotacije centralnog kruga
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
    // Ako je klik na centralni krug, zaustavlja se ili pokreće rotacija
    rotationActive = !rotationActive;
    if (!rotationActive) {
      // Ako se rotacija zaustavlja, izvlači se sektor na koji je kliknuto
      const clickAngle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
      sectors.forEach((sector, index) => {
        if (
          clickAngle >= sector.startAngle &&
          clickAngle <= sector.endAngle &&
          !sector.pulled
        ) {
          pullSector(index);
          return;
        }
      });
    }
  } else {
    // Ako je klik van centralnog kruga, određuje se smer rotacije
    rotationDirection = x < centerX ? -1 : 1;

    // Pronalaženje indeksa sektora na koji je kliknuto za animaciju
    sectors.forEach((sector, index) => {
      const clickAngle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
      if (
        clickAngle >= sector.startAngle &&
        clickAngle <= sector.endAngle &&
        sector.pulled
      ) {
        animateTriangleClick(index);
        return;
      }
    });
  }
}

// Funkcija za animaciju klika na sektor
function animateTriangleClick(index) {
  sectors[index].clicked = true;
  const originalColor = sectors[index].color;
  let colorChange = true;

  // Intervalna funkcija za animaciju kliknutog sektora
  const animationInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCentralCircle();

    // Prekid animacije ako se klik završi
    if (!sectors[index].clicked) {
      clearInterval(animationInterval);
      resetSector(index);
    } else {
      // Animacija promene boje sektora
      drawSector(
        sectors[index].startAngle,
        sectors[index].endAngle,
        colorChange ? "white" : originalColor,
        "KLIK"
      );
      colorChange = !colorChange;
    }
  }, 100); // Brzina animacije
}

// Funkcija za izvlačenje sektora iz centralnog kruga
function pullSector(index) {
  // Resetovanje prethodno kliknutog sektora ako postoji
  if (clickSectorIndex !== -1) {
    sectors[clickSectorIndex].pulled = false;
  }
  clickSectorIndex = index;
  sectors[index].pulled = true;
  animateSectorPull(index); // Pokretanje animacije izvlačenja sektora
}

// Animacija izvlačenja sektora iz centralnog kruga
function animateSectorPull(index) {
  let pullRadius = 0;
  const initialAngle = sectors[index].startAngle;
  const finalAngle = sectors[index].endAngle;
  let colorChange = true;

  // Intervalna funkcija za animaciju izvlačenja sektora
  const animationInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCentralCircle();

    // Prekid animacije kada sektor bude potpuno izvučen
    if (pullRadius >= radius) {
      clearInterval(animationInterval);
      resetSector(index); // Resetovanje sektora nakon izvlačenja
    } else {
      // Crtanje sektora uvećanog radi izvlačenja
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, pullRadius, initialAngle, finalAngle);
      ctx.fillStyle = colorChange ? "white" : sectors[index].color;
      ctx.fill();
      ctx.closePath();
      pullRadius += 2; // Brzina izvlačenja

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
  }, 30); // Brzina animacije
}

// Resetovanje sektora nakon animacije izvlačenja
function resetSector(index) {
  setTimeout(() => {
    clickSectorIndex = -1;
    sectors[index].pulled = false;
    sectors[index].clicked = false;
    animateCentralCircle(); // Ponovno pokretanje animacije centralnog kruga
  }, 1000); // Vreme čekanja pre resetovanja (ms)
}
