const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const titleEl = document.getElementById('title');

let animationId;
let score = 0;
let gameRunning = false;

// Player Ship
const ship = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    dx: 0
};

// Meteors
let meteors = [];
const meteorSpeed = 3;
const meteorSpawnRate = 1000; // ms
let lastSpawn = 0;

// Stars for background
let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawStars() {
    ctx.fillStyle = "#FFF";
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });
}

function drawShip() {
    ctx.fillStyle = "#47a0ff";
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x + ship.width / 2, ship.y + ship.height);
    ctx.lineTo(ship.x - ship.width / 2, ship.y + ship.height);
    ctx.closePath();
    ctx.fill();

    // Thruster
    if (Math.random() > 0.5) {
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.moveTo(ship.x - 5, ship.y + ship.height);
        ctx.lineTo(ship.x + 5, ship.y + ship.height);
        ctx.lineTo(ship.x, ship.y + ship.height + 15);
        ctx.closePath();
        ctx.fill();
    }
}

function drawMeteors() {
    meteors.forEach(m => {
        ctx.fillStyle = "#888";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();

        // Crater details
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(m.x - m.radius * 0.3, m.y - m.radius * 0.3, m.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateMeteors(dt) {
    if (Date.now() - lastSpawn > Math.max(200, meteorSpawnRate - (score * 10))) { // Increase difficulty
        meteors.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: -20,
            radius: Math.random() * 15 + 10,
            speed: meteorSpeed + (score * 0.1)
        });
        lastSpawn = Date.now();
    }

    meteors.forEach((m, index) => {
        m.y += m.speed;

        // Collision simple rect/circle approx
        // Ship is triangle, let's treat it as a small circle in the center or just rect
        // Rect collision for simplicity
        if (
            m.y + m.radius > ship.y &&
            m.y - m.radius < ship.y + ship.height &&
            m.x + m.radius > ship.x - ship.width / 2 &&
            m.x - m.radius < ship.x + ship.width / 2
        ) {
            endGame();
        }

        // Remove off screen
        if (m.y > canvas.height + 50) {
            score++;
            scoreEl.innerText = "Score: " + score;
            meteors.splice(index, 1);
        }
    });
}

function updateShip() {
    ship.x += ship.dx;

    // Boundaries
    if (ship.x < ship.width / 2) ship.x = ship.width / 2;
    if (ship.x > canvas.width - ship.width / 2) ship.x = canvas.width - ship.width / 2;
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawShip();
    updateShip();
    updateMeteors();
    drawMeteors();

    animationId = requestAnimationFrame(loop);
}

function startGame() {
    meteors = [];
    score = 0;
    scoreEl.innerText = "Score: 0";
    gameRunning = true;
    startBtn.style.display = 'none';
    titleEl.style.display = 'none';
    gameOverEl.classList.add('hidden');
    lastSpawn = Date.now();
    loop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverEl.classList.remove('hidden');
    // Don't show start button again, we use space to restart
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') ship.dx = -ship.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') ship.dx = ship.speed;
    if (e.key === ' ' && !gameRunning && !gameOverEl.classList.contains('hidden')) {
        startGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') {
        ship.dx = 0;
    }
});

startBtn.addEventListener('click', startGame);

// Initial draw
drawStars();
