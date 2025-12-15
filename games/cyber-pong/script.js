const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElem = document.getElementById('player-score');
const computerScoreElem = document.getElementById('computer-score');
const restartBtn = document.getElementById('restartBtn');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: "#fff"
};

const user = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 15,
    height: 100,
    color: "#00ffcc",
    score: 0
};

const player2 = {
    x: canvas.width - 15,
    y: (canvas.height - 100) / 2,
    width: 15,
    height: 100,
    color: "#ff00cc",
    score: 0
};

// Net
const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "#333"
};

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    // Serve to the person who scored usually, or random
    // here we just flip X velocity
    ball.velocityX = -ball.velocityX;
    ball.velocityY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

function update() {
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Player 2 Movement (Keys)
    const paddleSpeed = 8;
    if (keys.a) player2.y -= paddleSpeed;
    if (keys.d) player2.y += paddleSpeed;

    // Keep paddles in bounds
    if (user.y < 0) user.y = 0;
    if (user.y + user.height > canvas.height) user.y = canvas.height - user.height;
    if (player2.y < 0) player2.y = 0;
    if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Check Player or Player2
    let player = (ball.x + ball.radius < canvas.width / 2) ? user : player2;

    if (collision(ball, player)) {
        // Find where ball hit the player
        let collidePoint = (ball.y - (player.y + player.height / 2));
        collidePoint = collidePoint / (player.height / 2);

        // Calc angle (Max 45 deg)
        let angleRad = (Math.PI / 4) * collidePoint;

        // Dir
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Increase speed
        ball.speed += 0.2;
    }

    // Score update
    if (ball.x - ball.radius < 0) {
        player2.score++;
        computerScoreElem.innerText = player2.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        playerScoreElem.innerText = user.score;
        resetBall();
    }
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    drawNet();

    // Paddles
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);

    // Ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
    update();
    render();
}

// Mouse movement
canvas.addEventListener("mousemove", (evt) => {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
});

// Player 2 Controls (Keyboard)
const keys = {
    a: false,
    d: false
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
});


// Start
const framePerSecond = 60;
let loop = setInterval(gameLoop, 1000 / framePerSecond);

restartBtn.addEventListener('click', () => {
    user.score = 0;
    player2.score = 0;
    playerScoreElem.innerText = 0;
    computerScoreElem.innerText = 0;
    resetBall();
});
