const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('#score');
const timeLeftBoard = document.querySelector('#time-left');
const droids = document.querySelectorAll('.droid');
const startBtn = document.querySelector('#start-btn');

let lastHole;
let timeUp = false;
let score = 0;
let timeLeft = 30;
let timerId;

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole(holes);
    }
    lastHole = hole;
    return hole;
}

function peep() {
    const time = randomTime(500, 1000);
    const hole = randomHole(holes);
    hole.classList.add('up');

    setTimeout(() => {
        hole.classList.remove('up');
        if (!timeUp) peep();
    }, time);
}

function startGame() {
    scoreBoard.textContent = 0;
    timeLeftBoard.textContent = 30;
    timeUp = false;
    score = 0;
    timeLeft = 30;
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;

    peep();

    timerId = setInterval(() => {
        timeLeft--;
        timeLeftBoard.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timeUp = true;
            startBtn.disabled = false;
            startBtn.style.opacity = 1;
            startBtn.textContent = "Play Again";
        }
    }, 1000);
}

function bonk(e) {
    if (!e.isTrusted) return; // Cheater detection
    score++;
    this.parentNode.classList.remove('up');
    scoreBoard.textContent = score;

    // Visual feedback
    const originalColor = this.style.background;
    this.style.background = "#2ecc71"; // Green hit
    // Antenna shake?

    setTimeout(() => {
        this.style.background = ""; // Reset to CSS default
    }, 200);
}

droids.forEach(droid => droid.addEventListener('click', bonk));
startBtn.addEventListener('click', startGame);
