// PROMPT:
//
// Create a tic-tac-toe game using JavaScript. Use the attached screenshot as a
// reference for how the resulting page should look.
//

const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

let currentPlayer = 'x';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (gameBoard[index] !== '' || !gameActive) {
        return;
    }

    gameBoard[index] = currentPlayer;
    cell.classList.add(currentPlayer);

    if (checkWinner()) {
        status.textContent = `Player ${currentPlayer.toUpperCase()} wins!`;
        status.classList.add('winner');
        gameActive = false;
        return;
    }

    if (checkTie()) {
        status.textContent = "It's a tie!";
        status.classList.add('tie');
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    status.textContent = `Player ${currentPlayer.toUpperCase()}'s turn`;
}

function checkWinner() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

function checkTie() {
    return gameBoard.every(cell => cell !== '');
}

function resetGame() {
    currentPlayer = 'x';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    status.textContent = "Player X's turn";
    status.classList.remove('winner', 'tie');
    cells.forEach(cell => {
        cell.classList.remove('x', 'o');
    });
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetBtn.addEventListener('click', resetGame);
