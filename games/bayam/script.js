const canvas = document.getElementById('plantCanvas');
const ctx = canvas.getContext('2d');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const gameOverScreen = document.getElementById('game-over-screen');
const endMessage = document.getElementById('end-message');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let timeLeft = 30;
let growth = 0; // 0 to 100+
let gameRunning = true;
let timerId;
let clickPower = 1;
let leaves = []; // Store leaf positions

// Game Config
const MAX_HEIGHT = 800; // Pixels
const GROW_PER_CLICK = 2;

function init() {
    timeLeft = 30;
    growth = 0;
    gameRunning = true;
    leaves = [];
    clickPower = 1;

    timerEl.innerText = `Time: ${timeLeft}s`;
    statusEl.innerText = "Tap to Grow!";
    gameOverScreen.classList.add('hidden');

    // Initial leaves
    generateLeaves();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 1000);

    render();
}

function tick() {
    if (!gameRunning) return;
    timeLeft--;
    timerEl.innerText = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
        endGame();
    }
}

function generateLeaves() {
    // Determine leaves based on growth.
    // We add leaves as growth increases
    // But for simplicity, we'll generate new leaf properties on click if needed
}

function endGame() {
    gameRunning = false;
    clearInterval(timerId);

    let heightCm = Math.floor(growth * 0.5); // Arbitrary unit
    endMessage.innerText = "Time's Up!";
    finalScore.innerText = `You grew a ${heightCm}cm Bayam!`;

    if (growth > 200) {
        endMessage.innerText = "Amazing Harvest!";
    } else if (growth < 50) {
        endMessage.innerText = "Needs more water...";
    }

    gameOverScreen.classList.remove('hidden');
}

function drawPlant() {
    if (growth <= 0) {
        // Draw Seed
        ctx.fillStyle = "#5D4037"; // Seed color
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    // Stem
    let stemHeight = growth;
    if (stemHeight > MAX_HEIGHT) stemHeight = MAX_HEIGHT;

    ctx.lineWidth = 10 + (growth / 20); // Stem gets thicker
    if (ctx.lineWidth > 30) ctx.lineWidth = 30;

    ctx.lineCap = "round";
    ctx.strokeStyle = "#4CAF50"; // Green stem

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height);

    // Curve the stem slightly for realism
    let endX = canvas.width / 2 + Math.sin(growth * 0.05) * 10;
    let cp1x = canvas.width / 2 + Math.sin(growth * 0.02) * 20;
    let cp1y = canvas.height - (stemHeight / 2);

    ctx.quadraticCurveTo(cp1x, cp1y, endX, canvas.height - stemHeight);
    ctx.stroke();

    // Draw Leaves
    // Number of leaves depends on growth
    let leafCount = Math.floor(growth / 15);

    for (let i = 0; i < leafCount; i++) {
        // Deterministic pseudo-random positions based on index
        let h = (i + 1) * 15;
        if (h > stemHeight) break; // Don't float leaves

        let side = i % 2 === 0 ? 1 : -1;

        // Calculate position on the curved stem (approximate)
        let t = h / stemHeight; // 0 to 1
        let lx = canvas.width / 2 + (endX - canvas.width / 2) * t;
        let ly = canvas.height - h;

        drawLeaf(lx, ly, side, i);
    }

    // Flower/Top if really tall?
    if (growth > 150) {
        // Maybe some spinach tops (Bayam flowers are spiky)
        // Let's just draw big leaves at top
    }
}

function drawLeaf(x, y, side, index) {
    ctx.fillStyle = "#66BB6A"; // Leaf green
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 1;

    let size = 10 + Math.min(index * 2, 40); // Older leaves at bottom are smaller? No, usually bigger.
    // Let's make size depend on how long ago it grew. 
    // Actually, simple is fine.

    size = 20 + Math.sin(index * 99) * 5; // Random variation

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(side * (Math.PI / 4 + Math.sin(growth * 0.01 + index) * 0.1)); // Sway slightly

    ctx.beginPath();
    ctx.ellipse(side * size, 0, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlant();
    requestAnimationFrame(render);
}

// Interaction
function grow(e) {
    if (!gameRunning) return;

    // Visual feedback (particles or shake)

    growth += GROW_PER_CLICK;

    // Add logic for "critical click" or something?

    // Shake effect?
    canvas.style.transform = `scale(1.02)`;
    setTimeout(() => canvas.style.transform = `scale(1)`, 50);
}

// Event Listeners
document.body.addEventListener('mousedown', grow);
document.body.addEventListener('touchstart', (e) => { e.preventDefault(); grow(); }, { passive: false });
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') grow();
});

restartBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering grow
    init();
});

// Start
init();
