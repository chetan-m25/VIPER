const board = document.querySelector(".board");
const startModal = document.querySelector("#start-modal");
const pauseModal = document.querySelector("#pause-modal");
const gameoverModal = document.querySelector("#gameover-modal");
const rulesModal = document.querySelector("#rules-modal");

const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");
const resumeButton = document.querySelector(".btn-resume");
const rulesBtn = document.querySelector("#rules-btn");
const closeRulesBtn = document.querySelector(".btn-close-rules");
const pauseBtn = document.querySelector("#pause-btn");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");
const finalScoreElement = document.querySelector("#final-score");

// Mobile controls
const btnUp = document.querySelector("#btn-up");
const btnDown = document.querySelector("#btn-down");
const btnLeft = document.querySelector("#btn-left");
const btnRight = document.querySelector("#btn-right");

// Game State
let blockHeight = 50;
let blockWidth = 50;

// Detect if mobile
const isMobile = window.innerWidth <= 768;

// Adjust block size for mobile
if (isMobile) {
  if (window.innerWidth <= 480) {
    blockHeight = 30;
    blockWidth = 30;
  } else {
    blockHeight = 35;
    blockWidth = 35;
  }
}

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = 0;
let isPaused = false;
let isGameRunning = false;
let gameStarted = false;
let lastSpeedIncreaseScore = 0;

// Speed settings
const startingSpeed = 400; // Very slow starting speed
const speedDecrement = 30; // Smooth speed increase
const minSpeed = 100; // Maximum speed (fastest)
const pointsPerSpeedIncrease = 30; // Increase speed every 30 points

let currentSpeed = startingSpeed;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerIntervalId = null;
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

const blocks = {};
let snake = [{ x: 1, y: 3 }];
let direction = "down";
let nextDirection = "down";

// Create board blocks
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

// Format time display
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}-${secs}`;
}

function render() {
  if (isPaused) return;

  direction = nextDirection;
  blocks[`${food.x}-${food.y}`].classList.add("food");

  let head = null;
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // Check wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    gameOver();
    return;
  }

  // Check self collision
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  // Food consumption
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");

    // Generate new food position
    let validPosition = false;
    while (!validPosition) {
      food = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      };

      validPosition = true;
      for (let segment of snake) {
        if (food.x === segment.x && food.y === segment.y) {
          validPosition = false;
          break;
        }
      }
    }

    blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.unshift(head);

    // Update score
    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.innerText = highScore;
      localStorage.setItem("highScore", highScore.toString());
    }

    // Increase speed every 30 points
    if (
      score - lastSpeedIncreaseScore >= pointsPerSpeedIncrease &&
      currentSpeed > minSpeed
    ) {
      lastSpeedIncreaseScore = score;
      currentSpeed = Math.max(minSpeed, currentSpeed - speedDecrement);
      clearInterval(intervalId);
      intervalId = setInterval(render, currentSpeed);
    }
  } else {
    // Remove snake from current positions
    snake.forEach((segment) => {
      blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });

    snake.unshift(head);
    snake.pop();
  }

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  isGameRunning = false;
  gameStarted = false;

  finalScoreElement.innerText = score;
  gameoverModal.style.display = "flex";
  pauseBtn.style.display = "none";
}

function startGame() {
  startModal.style.display = "none";
  pauseBtn.style.display = "block";
  isGameRunning = true;
  gameStarted = true;
  isPaused = false;
  pauseBtn.innerText = "Pause";
  currentSpeed = startingSpeed;
  lastSpeedIncreaseScore = 0;

  intervalId = setInterval(render, currentSpeed);

  timerIntervalId = setInterval(() => {
    if (!isPaused) {
      time++;
      timeElement.innerText = formatTime(time);
    }
  }, 1000);
}

function restartGame() {
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  score = 0;
  time = 0;
  lastSpeedIncreaseScore = 0;

  scoreElement.innerText = score;
  timeElement.innerText = "0-0";
  highScoreElement.innerText = highScore;

  gameoverModal.style.display = "none";
  direction = "down";
  nextDirection = "down";
  snake = [{ x: 1, y: 3 }];

  // Generate initial food
  let validPosition = false;
  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };

    validPosition = true;
    for (let segment of snake) {
      if (food.x === segment.x && food.y === segment.y) {
        validPosition = false;
        break;
      }
    }
  }

  startGame();
}

// Pause/Resume
function togglePause() {
  if (!isGameRunning) return;

  if (isPaused) {
    // Resume
    isPaused = false;
    pauseBtn.innerText = "Pause";
    pauseModal.style.display = "none";
  } else {
    // Pause
    isPaused = true;
    pauseBtn.innerText = "Resume";
    pauseModal.style.display = "flex";
  }
}

// preventing backward movement
function changeDirection(newDirection) {
  if (!isGameRunning) {
    // Start game on first arrow key press
    if (!gameStarted) {
      startGame();
    }
    return;
  }

  if (isPaused) {
    // Resume on arrow key
    togglePause();
  }

  if (newDirection === "up" && direction !== "down") {
    nextDirection = "up";
  } else if (newDirection === "down" && direction !== "up") {
    nextDirection = "down";
  } else if (newDirection === "left" && direction !== "right") {
    nextDirection = "left";
  } else if (newDirection === "right" && direction !== "left") {
    nextDirection = "right";
  }
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
resumeButton.addEventListener("click", togglePause);
pauseBtn.addEventListener("click", togglePause);

rulesBtn.addEventListener("click", () => {
  if (isGameRunning && !isPaused) {
    togglePause();
  }
  rulesModal.style.display = "flex";
});

closeRulesBtn.addEventListener("click", () => {
  rulesModal.style.display = "none";
});

document.addEventListener("keydown", (event) => {
  // SPACE key pause
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    if (!isMobile && isGameRunning) {
      togglePause();
    }
    return;
  }

  // Arrow key controls
  if (event.key === "ArrowUp") {
    event.preventDefault();
    changeDirection("up");
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    changeDirection("down");
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeDirection("left");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    changeDirection("right");
  }
});

// Mobile controls
btnUp.addEventListener("click", () => changeDirection("up"));
btnDown.addEventListener("click", () => changeDirection("down"));
btnLeft.addEventListener("click", () => changeDirection("left"));
btnRight.addEventListener("click", () => changeDirection("right"));

[btnUp, btnDown, btnLeft, btnRight].forEach((btn) => {
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    btn.click();
  });
});
