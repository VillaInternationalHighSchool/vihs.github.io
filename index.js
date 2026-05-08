const gridElement = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');

let cells = [];
let firstClick = true;
let timerInterval;
let seconds = 0;
let sizeX, sizeY, totalMines;

function startGame() {
    sizeX = parseInt(document.getElementById('input-width').value) || 10;
    sizeY = parseInt(document.getElementById('input-height').value) || 10;

    // 1. Get % from input and convert to actual mine count
    let minePercent = parseInt(document.getElementById('input-mines').value) || 15;

    // Safety: Cap mines at 90% so the game is always playable
    if (minePercent > 90) minePercent = 90;
    totalMines = Math.floor((sizeX * sizeY) * (minePercent / 100));

    clearInterval(timerInterval);
    seconds = 0;
    timerDisplay.innerText = "0";
    firstClick = true;
    cells = [];
    gridElement.innerHTML = '';

    gridElement.style.gridTemplateColumns = `repeat(${sizeX}, 30px)`;

    for (let i = 0; i < sizeX * sizeY; i++) {
        const element = document.createElement('div');
        element.classList.add('cell');
        gridElement.appendChild(element);

        cells.push({ element, mine: false, revealed: false, count: 0 });

        element.addEventListener('click', () => handleManualClick(i));
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (cells[i].revealed) return;
            element.innerText = element.innerText === "🚩" ? "" : "🚩";
        });
    }
}

function handleManualClick(index) {
    if (firstClick) {
        // Start timer on first move
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.innerText = seconds;
        }, 1000);

        plantMines(index);
        firstClick = false;
    }
    revealCell(index);
}

function plantMines(safeIndex) {
    let planted = 0;
    // The "Stall" Fix: The loop will now stop if it runs out of space
    while (planted < totalMines && planted < (cells.length - 1)) {
        let index = Math.floor(Math.random() * (sizeX * sizeY));
        if (index !== safeIndex && !cells[index].mine) {
            cells[index].mine = true;
            planted++;
        }
    }
    calculateNumbers();
}

function calculateNumbers() {
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].mine) continue;
        const neighbors = getNeighbors(i);
        cells[i].count = neighbors.filter(nIdx => cells[nIdx].mine).length;
    }
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / sizeX);
    const col = index % sizeX;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue;
            const nRow = row + x;
            const nCol = col + y;
            if (nRow >= 0 && nRow < sizeY && nCol >= 0 && nCol < sizeX) {
                neighbors.push(nRow * sizeX + nCol);
            }
        }
    }
    return neighbors;
}

function revealCell(index) {
    let c = cells[index];
    if (c.revealed || c.element.innerText === "🚩") return;

    c.revealed = true;
    c.element.classList.add('revealed');

    if (c.mine) {
        clearInterval(timerInterval);
        c.element.innerText = "💣";
        c.element.classList.add('mine');
        setTimeout(() => {
            alert("KABOOM! Game Over.");
            startGame(); // Restart the game instead of reloading page
        }, 10);
    } else {
        if (c.count > 0) {
            c.element.innerText = c.count;
            c.element.style.color = getNumberColor(c.count);
        } else {
            getNeighbors(index).forEach(nIdx => revealCell(nIdx));
        }
        checkForWin();
    }
}

function checkForWin() {
    const win = cells.every(c => c.mine || c.revealed);
    if (win) {
        clearInterval(timerInterval);
        setTimeout(() => alert(`Victory! Time: ${seconds}s`), 100);
    }
}

function getNumberColor(num) {
    const colors = ["", "#3498db", "#2ecc71", "#e74c3c", "#9b59b6", "#f1c40f", "#1abc9c", "#ecf0f1", "#95a5a6"];
    return colors[num];
}

// Start the first game automatically
startGame();
