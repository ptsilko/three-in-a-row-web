// Game State
const GRID_SIZE = 8;
let gameState = {
    mode: 'moves', // 'moves' or 'endless'
    difficulty: 'easy',
    colors: 3,
    maxMoves: 40,
    targetScore: 500,
    currentMoves: 0,
    score: 0,
    combo: 1,
    grid: [],
    selectedCircle: null,
    isAnimating: false,
    isPaused: false,
    lastMoveTime: Date.now(),
    hintTimeout: null
};

// Configuration
const config = {
    easy: { colors: 3, moves: 40, target: 500 },
    medium: { colors: 4, moves: 30, target: 600 },
    hard: { colors: 5, moves: 25, target: 750 }
};

const SCORES = {
    match3: 10,
    match4: 25,
    match5: 50,
    powerup: 20
};

const HINT_DELAY = 6000; // 6 seconds of inactivity

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showMenu() {
    showScreen('menu-screen');
}

function showModeSelection() {
    showScreen('mode-screen');
}

function showInstructions() {
    showScreen('instructions-screen');
}

function selectMode(mode) {
    gameState.mode = mode;
    showScreen('difficulty-screen');

    // Update difficulty cards based on mode
    const cards = document.querySelectorAll('.difficulty-card');
    if (mode === 'endless') {
        cards[0].querySelector('.difficulty-details').textContent = '3 colors • No move limit';
        cards[1].querySelector('.difficulty-details').textContent = '4 colors • No move limit';
        cards[2].querySelector('.difficulty-details').textContent = '5 colors • No move limit';
    } else {
        cards[0].querySelector('.difficulty-details').textContent = '40 moves • Target: 500';
        cards[1].querySelector('.difficulty-details').textContent = '30 moves • Target: 600';
        cards[2].querySelector('.difficulty-details').textContent = '25 moves • Target: 750';
    }
}

function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.colors = config[difficulty].colors;
    gameState.maxMoves = config[difficulty].moves;
    gameState.targetScore = config[difficulty].target;
    gameState.currentMoves = 0;
    gameState.score = 0;
    gameState.combo = 1;
    gameState.isPaused = false;

    // Update UI
    updateScoreDisplay();

    // Show/hide moves and target based on mode
    if (gameState.mode === 'endless') {
        document.getElementById('moves-stat').style.display = 'none';
        document.getElementById('target-stat').style.display = 'none';
    } else {
        document.getElementById('moves-stat').style.display = 'flex';
        document.getElementById('target-stat').style.display = 'flex';
        document.getElementById('moves').textContent = gameState.maxMoves;
        document.getElementById('target').textContent = gameState.targetScore;
    }

    initializeGrid();
    showScreen('game-screen');
    startHintTimer();
}

// Grid Management
function initializeGrid() {
    gameState.grid = [];
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // Create grid ensuring no initial matches
    for (let row = 0; row < GRID_SIZE; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            let color;
            do {
                color = Math.floor(Math.random() * gameState.colors);
            } while (wouldCreateMatch(row, col, color));

            gameState.grid[row][col] = {
                color: color,
                powerup: null
            };

            createCircleElement(row, col);
        }
    }
}

function wouldCreateMatch(row, col, color) {
    // Check horizontal
    let count = 1;
    if (col >= 1 && gameState.grid[row][col - 1]?.color === color) count++;
    if (col >= 2 && gameState.grid[row][col - 2]?.color === color) count++;
    if (count >= 3) return true;

    // Check vertical
    count = 1;
    if (row >= 1 && gameState.grid[row - 1][col]?.color === color) count++;
    if (row >= 2 && gameState.grid[row - 2][col]?.color === color) count++;
    if (count >= 3) return true;

    return false;
}

function createCircleElement(row, col) {
    const board = document.getElementById('game-board');
    const circle = document.createElement('div');
    const cell = gameState.grid[row][col];

    circle.className = `circle color-${cell.color}`;
    if (cell.powerup) {
        circle.classList.add(`powerup-${cell.powerup}`);
    }
    circle.dataset.row = row;
    circle.dataset.col = col;

    circle.addEventListener('click', () => handleCircleClick(row, col));
    circle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCircleClick(row, col);
    }, { passive: false });

    board.appendChild(circle);
}

// Game Logic
function handleCircleClick(row, col) {
    if (gameState.isAnimating || gameState.isPaused) return;

    resetHintTimer();
    clearHints();

    const clickedCircle = { row, col };

    if (!gameState.selectedCircle) {
        // Select first circle
        gameState.selectedCircle = clickedCircle;
        highlightCircle(row, col, true);
    } else {
        // Try to swap with selected circle
        const selected = gameState.selectedCircle;

        if (selected.row === row && selected.col === col) {
            // Deselect if clicking same circle
            highlightCircle(row, col, false);
            gameState.selectedCircle = null;
        } else if (isAdjacent(selected, clickedCircle)) {
            // Swap adjacent circles
            highlightCircle(selected.row, selected.col, false);
            swapCircles(selected, clickedCircle);
        } else {
            // Select different circle
            highlightCircle(selected.row, selected.col, false);
            gameState.selectedCircle = clickedCircle;
            highlightCircle(row, col, true);
        }
    }
}

function isAdjacent(pos1, pos2) {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function highlightCircle(row, col, highlight) {
    const circles = document.querySelectorAll('.circle');
    const index = row * GRID_SIZE + col;
    if (circles[index]) {
        if (highlight) {
            circles[index].classList.add('selected');
        } else {
            circles[index].classList.remove('selected');
        }
    }
}

async function swapCircles(pos1, pos2) {
    gameState.isAnimating = true;

    // Swap in grid
    const temp = gameState.grid[pos1.row][pos1.col];
    gameState.grid[pos1.row][pos1.col] = gameState.grid[pos2.row][pos2.col];
    gameState.grid[pos2.row][pos2.col] = temp;

    // Update visual
    updateBoard();
    await sleep(300);

    // Check for matches
    const matches1 = findMatches(pos1.row, pos1.col);
    const matches2 = findMatches(pos2.row, pos2.col);
    const allMatches = [...matches1, ...matches2];

    if (allMatches.length > 0) {
        // Valid move
        if (gameState.mode === 'moves') {
            gameState.currentMoves++;
            document.getElementById('moves').textContent = gameState.maxMoves - gameState.currentMoves;
        }

        await processMatches();

        // Check win/lose conditions
        if (gameState.mode === 'moves') {
            if (gameState.score >= gameState.targetScore) {
                gameOver(true);
            } else if (gameState.currentMoves >= gameState.maxMoves) {
                gameOver(false);
            }
        }
    } else {
        // Invalid move - swap back
        const temp = gameState.grid[pos1.row][pos1.col];
        gameState.grid[pos1.row][pos1.col] = gameState.grid[pos2.row][pos2.col];
        gameState.grid[pos2.row][pos2.col] = temp;
        updateBoard();
    }

    gameState.selectedCircle = null;
    gameState.isAnimating = false;
}

function findMatches(row, col) {
    const color = gameState.grid[row][col].color;
    const matches = new Set();
    matches.add(`${row},${col}`);

    // Check horizontal
    let left = col - 1;
    while (left >= 0 && gameState.grid[row][left].color === color) {
        matches.add(`${row},${left}`);
        left--;
    }

    let right = col + 1;
    while (right < GRID_SIZE && gameState.grid[row][right].color === color) {
        matches.add(`${row},${right}`);
        right++;
    }

    const horizontalMatches = matches.size >= 3 ? Array.from(matches) : [];

    // Check vertical
    matches.clear();
    matches.add(`${row},${col}`);

    let up = row - 1;
    while (up >= 0 && gameState.grid[up][col].color === color) {
        matches.add(`${up},${col}`);
        up--;
    }

    let down = row + 1;
    while (down < GRID_SIZE && gameState.grid[down][col].color === color) {
        matches.add(`${down},${col}`);
        down++;
    }

    const verticalMatches = matches.size >= 3 ? Array.from(matches) : [];

    // Combine unique matches
    const allMatches = new Set([...horizontalMatches, ...verticalMatches]);
    return Array.from(allMatches).map(pos => {
        const [r, c] = pos.split(',').map(Number);
        return { row: r, col: c };
    });
}

async function processMatches() {
    let hasMatches = true;

    while (hasMatches) {
        const allMatches = findAllMatches();

        if (allMatches.length === 0) {
            hasMatches = false;
            gameState.combo = 1;
        } else {
            // Calculate score
            const matchScore = calculateScore(allMatches);
            gameState.score += matchScore;
            updateScoreDisplay();

            // Check for power-ups
            checkForPowerUps(allMatches);

            // Animate and remove matches
            await animateMatches(allMatches);
            removeMatches(allMatches);

            // Apply gravity and refill
            await applyGravity();
            refillGrid();
            updateBoard();

            await sleep(300);
            gameState.combo++;
        }
    }
}

function findAllMatches() {
    const matched = new Set();

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const matches = findMatches(row, col);
            matches.forEach(m => matched.add(`${m.row},${m.col}`));
        }
    }

    return Array.from(matched).map(pos => {
        const [r, c] = pos.split(',').map(Number);
        return { row: r, col: c };
    });
}

function calculateScore(matches) {
    const count = matches.length;
    let baseScore = 0;

    if (count === 3) baseScore = SCORES.match3;
    else if (count === 4) baseScore = SCORES.match4;
    else if (count >= 5) baseScore = SCORES.match5;
    else baseScore = count * 5;

    return baseScore * gameState.combo;
}

function checkForPowerUps(matches) {
    if (matches.length >= 4) {
        // Create power-up at first match position
        const pos = matches[0];
        let powerupType;

        if (matches.length >= 5) {
            powerupType = 'mega';
        } else {
            // Determine if matches are in a row or column
            const rows = new Set(matches.map(m => m.row));
            powerupType = rows.size === 1 ? 'row' : 'column';
        }

        // Store power-up for after clearing
        setTimeout(() => {
            if (gameState.grid[pos.row] && gameState.grid[pos.row][pos.col]) {
                gameState.grid[pos.row][pos.col].powerup = powerupType;
                updateBoard();
            }
        }, 400);
    }
}

async function animateMatches(matches) {
    const circles = document.querySelectorAll('.circle');

    matches.forEach(match => {
        const index = match.row * GRID_SIZE + match.col;
        if (circles[index]) {
            circles[index].classList.add('matching');
            createParticles(circles[index], gameState.grid[match.row][match.col].color);
        }
    });

    await sleep(400);
}

function createParticles(element, color) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = `particle color-${color}`;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50 + Math.random() * 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 800);
    }
}

function removeMatches(matches) {
    matches.forEach(match => {
        gameState.grid[match.row][match.col] = null;
    });
}

async function applyGravity() {
    let moved = true;

    while (moved) {
        moved = false;

        for (let row = GRID_SIZE - 2; row >= 0; row--) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (gameState.grid[row][col] !== null && gameState.grid[row + 1][col] === null) {
                    gameState.grid[row + 1][col] = gameState.grid[row][col];
                    gameState.grid[row][col] = null;
                    moved = true;
                }
            }
        }

        if (moved) {
            updateBoard();
            await sleep(100);
        }
    }
}

function refillGrid() {
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE; row++) {
            if (gameState.grid[row][col] === null) {
                gameState.grid[row][col] = {
                    color: Math.floor(Math.random() * gameState.colors),
                    powerup: null
                };
            }
        }
    }
}

function updateBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameState.grid[row][col] !== null) {
                createCircleElement(row, col);
            }
        }
    }
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('combo').textContent = gameState.combo + 'x';
}

// Hint System
function startHintTimer() {
    clearHintTimer();
    gameState.hintTimeout = setTimeout(showHint, HINT_DELAY);
}

function resetHintTimer() {
    gameState.lastMoveTime = Date.now();
    clearHintTimer();
    startHintTimer();
}

function clearHintTimer() {
    if (gameState.hintTimeout) {
        clearTimeout(gameState.hintTimeout);
        gameState.hintTimeout = null;
    }
}

function clearHints() {
    document.querySelectorAll('.circle.hint').forEach(circle => {
        circle.classList.remove('hint');
    });
    document.getElementById('hint-message').classList.remove('show');
}

function showHint() {
    if (gameState.isAnimating || gameState.isPaused) return;

    const possibleMove = findPossibleMove();

    if (possibleMove) {
        const circles = document.querySelectorAll('.circle');
        const index1 = possibleMove.pos1.row * GRID_SIZE + possibleMove.pos1.col;
        const index2 = possibleMove.pos2.row * GRID_SIZE + possibleMove.pos2.col;

        if (circles[index1]) circles[index1].classList.add('hint');
        if (circles[index2]) circles[index2].classList.add('hint');

        const hintMsg = document.getElementById('hint-message');
        hintMsg.classList.add('show');

        setTimeout(() => {
            clearHints();
        }, 3000);
    }
}

function findPossibleMove() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            // Try swapping with right neighbor
            if (col < GRID_SIZE - 1) {
                const pos1 = { row, col };
                const pos2 = { row, col: col + 1 };
                if (wouldCreateMatchAfterSwap(pos1, pos2)) {
                    return { pos1, pos2 };
                }
            }

            // Try swapping with bottom neighbor
            if (row < GRID_SIZE - 1) {
                const pos1 = { row, col };
                const pos2 = { row: row + 1, col };
                if (wouldCreateMatchAfterSwap(pos1, pos2)) {
                    return { pos1, pos2 };
                }
            }
        }
    }

    return null;
}

function wouldCreateMatchAfterSwap(pos1, pos2) {
    // Temporarily swap
    const temp = gameState.grid[pos1.row][pos1.col];
    gameState.grid[pos1.row][pos1.col] = gameState.grid[pos2.row][pos2.col];
    gameState.grid[pos2.row][pos2.col] = temp;

    // Check for matches
    const matches1 = findMatches(pos1.row, pos1.col);
    const matches2 = findMatches(pos2.row, pos2.col);

    // Swap back
    gameState.grid[pos2.row][pos2.col] = gameState.grid[pos1.row][pos1.col];
    gameState.grid[pos1.row][pos1.col] = temp;

    return matches1.length > 0 || matches2.length > 0;
}

// Game Control
function pauseGame() {
    gameState.isPaused = true;
    clearHintTimer();
    document.getElementById('pause-menu').classList.add('active');
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-menu').classList.remove('active');
    startHintTimer();
}

function restartGame() {
    document.getElementById('pause-menu').classList.remove('active');
    document.getElementById('gameover-screen').classList.remove('active');
    startGame(gameState.difficulty);
}

function quitToMenu() {
    document.getElementById('pause-menu').classList.remove('active');
    document.getElementById('gameover-screen').classList.remove('active');
    clearHintTimer();
    showMenu();
}

function gameOver(won) {
    clearHintTimer();

    const title = document.getElementById('gameover-title');
    const finalScore = document.getElementById('final-score');
    const highScoreMsg = document.getElementById('high-score-msg');

    finalScore.textContent = gameState.score;

    if (won) {
        title.textContent = '🎉 Victory!';
        title.style.color = '#4ecdc4';
    } else {
        title.textContent = '😞 Game Over';
        title.style.color = '#f5576c';
    }

    // Check high score
    const highScoreKey = `highscore_${gameState.mode}_${gameState.difficulty}`;
    const currentHighScore = localStorage.getItem(highScoreKey) || 0;

    if (gameState.score > currentHighScore) {
        localStorage.setItem(highScoreKey, gameState.score);
        highScoreMsg.textContent = '🏆 New High Score!';
    } else {
        highScoreMsg.textContent = `High Score: ${currentHighScore}`;
    }

    document.getElementById('gameover-screen').classList.add('active');
}

// Utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', function(e) {
    if (e.target.closest('.game-board')) {
        e.preventDefault();
    }
}, { passive: false });

// Initialize
console.log('Three in a Row - Game Ready!');
