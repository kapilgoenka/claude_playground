// PROMPT:
//
// Build a Sudoku game with medium difficulty, basic gameplay, and generated
// puzzles. Create in a new folder: sudoku-game/
//

/**
 * Sudoku Game Controller
 */
const Game = {
  board: null,
  puzzle: null,
  solution: null,
  currentGrid: null,
  selectedCell: null,

  init() {
    this.board = document.getElementById('board')
    this.message = document.getElementById('message')

    this.createBoard()
    this.setupEventListeners()
    this.newGame()
  },

  createBoard() {
    this.board.innerHTML = ''

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div')
        cell.className = 'cell'
        cell.dataset.row = row
        cell.dataset.col = col

        // Add border classes for 3x3 boxes
        if (col % 3 === 0 && col !== 0) cell.classList.add('border-left')
        if (row % 3 === 0 && row !== 0) cell.classList.add('border-top')

        this.board.appendChild(cell)
      }
    }
  },

  setupEventListeners() {
    // Cell selection
    this.board.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell')
      if (cell && !cell.classList.contains('fixed')) {
        this.selectCell(cell)
      }
    })

    // Number pad
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num)
        this.enterNumber(num)
      })
    })

    // Keyboard input
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '9') {
        this.enterNumber(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        this.enterNumber(0)
      } else if (e.key === 'ArrowUp') {
        this.moveSelection(-1, 0)
      } else if (e.key === 'ArrowDown') {
        this.moveSelection(1, 0)
      } else if (e.key === 'ArrowLeft') {
        this.moveSelection(0, -1)
      } else if (e.key === 'ArrowRight') {
        this.moveSelection(0, 1)
      }
    })

    // New game button
    document.getElementById('new-game').addEventListener('click', () => {
      this.newGame()
    })
  },

  newGame() {
    this.message.textContent = ''
    this.message.className = 'message'

    // Generate new puzzle
    const { puzzle, solution } = Sudoku.generatePuzzle()
    this.puzzle = puzzle
    this.solution = solution
    this.currentGrid = puzzle.map(row => [...row])

    // Update board display
    this.renderBoard()

    // Clear selection
    this.selectedCell = null
    this.clearSelection()
  },

  renderBoard() {
    const cells = this.board.querySelectorAll('.cell')

    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row)
      const col = parseInt(cell.dataset.col)
      const value = this.currentGrid[row][col]

      cell.textContent = value || ''
      cell.classList.remove('fixed', 'selected', 'error', 'highlight')

      // Mark original puzzle cells as fixed
      if (this.puzzle[row][col] !== 0) {
        cell.classList.add('fixed')
      }
    })
  },

  selectCell(cell) {
    // Clear previous selection
    this.clearSelection()

    // Select new cell
    cell.classList.add('selected')
    this.selectedCell = cell

    // Highlight related cells
    const row = parseInt(cell.dataset.row)
    const col = parseInt(cell.dataset.col)
    this.highlightRelated(row, col)
  },

  clearSelection() {
    this.board.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('selected', 'highlight', 'same-number')
    })
  },

  highlightRelated(row, col) {
    const cells = this.board.querySelectorAll('.cell')
    const currentValue = this.currentGrid[row][col]

    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row)
      const c = parseInt(cell.dataset.col)

      // Highlight same row, column, or box
      const sameRow = r === row
      const sameCol = c === col
      const sameBox = Math.floor(r / 3) === Math.floor(row / 3) &&
                      Math.floor(c / 3) === Math.floor(col / 3)

      if ((sameRow || sameCol || sameBox) && !(r === row && c === col)) {
        cell.classList.add('highlight')
      }

      // Highlight same numbers
      if (currentValue !== 0 && this.currentGrid[r][c] === currentValue) {
        cell.classList.add('same-number')
      }
    })
  },

  moveSelection(rowDelta, colDelta) {
    if (!this.selectedCell) {
      // Select first cell if none selected
      const firstCell = this.board.querySelector('.cell')
      this.selectCell(firstCell)
      return
    }

    let row = parseInt(this.selectedCell.dataset.row) + rowDelta
    let col = parseInt(this.selectedCell.dataset.col) + colDelta

    // Wrap around
    if (row < 0) row = 8
    if (row > 8) row = 0
    if (col < 0) col = 8
    if (col > 8) col = 0

    const newCell = this.board.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    this.selectCell(newCell)
  },

  enterNumber(num) {
    if (!this.selectedCell) return
    if (this.selectedCell.classList.contains('fixed')) return

    const row = parseInt(this.selectedCell.dataset.row)
    const col = parseInt(this.selectedCell.dataset.col)

    // Update grid
    this.currentGrid[row][col] = num

    // Update display
    this.selectedCell.textContent = num || ''

    // Check if the number is correct against the solution
    if (num !== 0 && num !== this.solution[row][col]) {
      this.selectedCell.classList.add('error')
    } else {
      this.selectedCell.classList.remove('error')
    }

    // Re-highlight to update same-number highlighting
    this.clearSelection()
    this.selectCell(this.selectedCell)

    // Check for completion
    if (Sudoku.isComplete(this.currentGrid)) {
      this.showWin()
    }
  },

  showWin() {
    this.message.textContent = 'Congratulations! You solved the puzzle!'
    this.message.className = 'message success'
    this.clearSelection()
    this.selectedCell = null
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Game.init()
})
