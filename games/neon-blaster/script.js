const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const healthEl = document.getElementById('health');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let timeLeft = 60;
let hp = 100;
let gameRunning = true;
let frames = 0;

// Inputs
const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: 0, y: 0, down: false };

// Game settings
const GRAVITY = 0.5;
const FRICTION = 0.8;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -15;

// Arrays
let platforms = [];
let bullets = [];
let enemies = [];
let particles = [];

// Objects
const player = {
    x: 100,
    y: 100,
    w: 30,
    h: 30,
    dx: 0,
    dy: 0,
    jumping: false,
    color: '#00f3ff',
    facingLeft: false
};

// Platforms
platforms.push({ x: 0, y: 550, w: 800, h: 50 }); // Ground
platforms.push({ x: 200, y: 400, w: 100, h: 20 });
platforms.push({ x: 500, y: 350, w: 100, h: 20 });
platforms.push({ x: 300, y: 200, w: 200, h: 20 });
platforms.push({ x: 50, y: 250, w: 100, h: 20 });
platforms.push({ x: 650, y: 150, w: 100, h: 20 });

function resetGame() {
    score = 0;
    timeLeft = 60;
    hp = 100;

    player.x = 100;
    player.y = 100;
    player.dx = 0;
    player.dy = 0;
    player.jumping = false;

    bullets = [];
    enemies = [];
    particles = [];
    gameRunning = true;

    gameOverScreen.classList.add('hidden');
    updateHud();
}

function updateHud() {
    scoreEl.innerText = `Score: ${score}`;
    timerEl.innerText = `Time: ${Math.ceil(timeLeft)}`;
    healthEl.innerText = `HP: ${hp}%`;
    healthEl.style.color = hp > 30 ? '#00ff66' : '#ff0055';
}

function spawnEnemy() {
    // Simple enemy spawning
    let x = Math.random() > 0.5 ? 0 : canvas.width;
    let y = Math.random() * (canvas.height - 100);
    enemies.push({
        x: x,
        y: y,
        w: 25,
        h: 25,
        dx: (Math.random() * 2 + 1) * (x === 0 ? 1 : -1),
        dy: 0,
        type: 'flyer',
        hp: 1
    });
}

function createParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 5,
            dy: (Math.random() - 0.5) * 5,
            color: color,
            life: 30
        });
    }
}

// Controls
window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'w': keys.w = true; break;
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'd': keys.d = true; break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'w': keys.w = false; break;
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'd': keys.d = false; break;
    }
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Mouse Down/Up tracking
canvas.addEventListener('mousedown', () => {
    mouse.down = true;
});

canvas.addEventListener('mouseup', () => {
    mouse.down = false;
});

// Cooldown
let fireDelay = 0;
const FIRE_RATE = 10; // Frames between shots

function shoot() {
    if (fireDelay > 0) return;

    // Shoot
    let angle = Math.atan2(mouse.y - (player.y + player.h / 2), mouse.x - (player.x + player.w / 2));
    bullets.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,
        life: 50
    });

    fireDelay = FIRE_RATE;
}

function update() {
    if (!gameRunning) return;

    // Shooting
    if (fireDelay > 0) fireDelay--;
    if (mouse.down) shoot();

    // Timer
    timeLeft -= 1 / 60;
    if (timeLeft <= 0) {
        timeLeft = 0;
        gameOver();
    }

    if (hp <= 0) gameOver();

    // Spawning
    frames++;
    if (frames % 60 === 0) spawnEnemy();

    // Player Physics
    if (keys.a) { player.dx = -PLAYER_SPEED; player.facingLeft = true; }
    else if (keys.d) { player.dx = PLAYER_SPEED; player.facingLeft = false; }
    else { player.dx *= FRICTION; }

    if (keys.w && !player.jumping) {
        player.dy = JUMP_FORCE;
        player.jumping = true;
    }

    player.dy += GRAVITY;
    player.x += player.dx;
    player.y += player.dy;

    // Boundary
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    if (player.y > canvas.height) hp = 0; // Fall death

    // Platform Collisions
    player.jumping = true; // Assume jumping until proven grounded

    platforms.forEach(p => {
        // Simple AABB
        if (player.x < p.x + p.w &&
            player.x + player.w > p.x &&
            player.y + player.h < p.y + p.h &&
            player.y + player.h > p.y) {
            // Colliding. Check if coming from above
            if (player.dy > 0 && player.y + player.h - player.dy <= p.y) {
                player.jumping = false;
                player.dy = 0;
                player.y = p.y - player.h;
            }
        }
    });

    // Bullets
    bullets.forEach((b, i) => {
        b.x += b.dx;
        b.y += b.dy;
        b.life--;
        // Collision with platforms
        platforms.forEach(p => {
            if (b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + p.h) b.life = 0;
        });
        if (b.life <= 0) bullets.splice(i, 1);
    });

    // Enemies
    enemies.forEach((e, i) => {
        e.x += e.dx;
        e.y += e.dy;

        // Follow player slowly
        let angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.dx = Math.cos(angle) * 2;
        e.dy = Math.sin(angle) * 2;

        // Player Hit
        if (e.x < player.x + player.w && e.x + e.w > player.x &&
            e.y < player.y + player.h && e.y + e.h > player.y) {
            hp -= 10;
            createParticles(e.x + e.w / 2, e.y + e.h / 2, '#ff0055', 10);
            enemies.splice(i, 1);
        }

        // Bullet Hit Enemy
        bullets.forEach((b, bi) => {
            if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
                // Hit
                score += 10;
                createParticles(e.x + e.w / 2, e.y + e.h / 2, '#ffe600', 15);
                enemies.splice(i, 1);
                bullets.splice(bi, 1);
            }
        });
    });

    // Particles
    particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    });

    updateHud();
}

function draw() {
    // Clear
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid effect
    ctx.strokeStyle = "#111122";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // Platforms
    ctx.fillStyle = "#1a1a2e";
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    // Player
    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    // Rotating Gun
    let angle = Math.atan2(mouse.y - (player.y + player.h / 2), mouse.x - (player.x + player.w / 2));

    // Draw Body
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);

    // Draw Gun
    ctx.rotate(angle);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, -5, 25, 10);
    ctx.restore();

    // Enemies
    enemies.forEach(e => {
        ctx.fillStyle = "#ff0055";
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y);
        ctx.lineTo(e.x + e.w, e.y + e.h / 2);
        ctx.lineTo(e.x + e.w / 2, e.y + e.h);
        ctx.lineTo(e.x, e.y + e.h / 2);
        ctx.fill();
    });

    // Bullets
    ctx.fillStyle = "#ffe600";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Crosshair
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mouse.x - 15, mouse.y); ctx.lineTo(mouse.x + 15, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 15); ctx.lineTo(mouse.x, mouse.y + 15);
    ctx.stroke();
}

function gameOver() {
    gameRunning = false;
    finalScoreEl.innerText = `Final Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

restartBtn.addEventListener('click', resetGame);

// Start
loop();
