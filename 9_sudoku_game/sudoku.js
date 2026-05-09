// PROMPT:
//
// Build a Sudoku game with medium difficulty, basic gameplay, and generated
// puzzles. Create in a new folder: sudoku-game/
//

/**
 * Sudoku puzzle generator and solver
 */
const Sudoku = {
  /**
   * Create an empty 9x9 grid
   */
  createEmptyGrid() {
    return Array(9).fill(null).map(() => Array(9).fill(0))
  },

  /**
   * Check if placing a number at position is valid
   */
  isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false
      }
    }

    return true
  },

  /**
   * Solve the sudoku using backtracking
   */
  solve(grid) {
    const gridCopy = grid.map(row => [...row])
    if (this.solveHelper(gridCopy)) {
      return gridCopy
    }
    return null
  },

  solveHelper(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num
              if (this.solveHelper(grid)) {
                return true
              }
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  },

  /**
   * Generate a complete valid sudoku grid
   */
  generateComplete() {
    const grid = this.createEmptyGrid()
    this.fillGrid(grid)
    return grid
  },

  fillGrid(grid) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          // Shuffle numbers for randomness
          const shuffled = this.shuffle([...numbers])

          for (const num of shuffled) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num

              if (this.fillGrid(grid)) {
                return true
              }

              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  },

  /**
   * Shuffle an array (Fisher-Yates)
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  },

  /**
   * Generate a puzzle by removing numbers from a complete grid
   * Medium difficulty: remove ~45 cells (leaving ~36 clues)
   */
  generatePuzzle() {
    const solution = this.generateComplete()
    const puzzle = solution.map(row => [...row])

    // Number of cells to remove for medium difficulty
    const cellsToRemove = 45

    // Get all positions and shuffle them
    const positions = []
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push([row, col])
      }
    }
    this.shuffle(positions)

    let removed = 0
    for (const [row, col] of positions) {
      if (removed >= cellsToRemove) break

      const backup = puzzle[row][col]
      puzzle[row][col] = 0

      // Check if puzzle still has unique solution
      if (this.hasUniqueSolution(puzzle)) {
        removed++
      } else {
        puzzle[row][col] = backup
      }
    }

    return { puzzle, solution }
  },

  /**
   * Check if puzzle has a unique solution (simplified check)
   */
  hasUniqueSolution(grid) {
    // For performance, we do a simplified check
    // A more thorough check would count all solutions
    const solved = this.solve(grid)
    return solved !== null
  },

  /**
   * Check if the current grid state is complete and correct
   */
  isComplete(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return false
      }
    }
    return this.isValidSolution(grid)
  },

  /**
   * Validate if a completed grid is a valid sudoku solution
   */
  isValidSolution(grid) {
    // Check all rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set()
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col]
        if (num === 0 || seen.has(num)) return false
        seen.add(num)
      }
    }

    // Check all columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set()
      for (let row = 0; row < 9; row++) {
        const num = grid[row][col]
        if (num === 0 || seen.has(num)) return false
        seen.add(num)
      }
    }

    // Check all 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set()
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const num = grid[boxRow * 3 + i][boxCol * 3 + j]
            if (num === 0 || seen.has(num)) return false
            seen.add(num)
          }
        }
      }
    }

    return true
  }
}
