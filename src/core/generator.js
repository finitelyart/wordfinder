const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getDirections(options) {
  let directions = [
    { name: 'E', vec: { row: 0, col: 1 } },
    { name: 'S', vec: { row: 1, col: 0 } },
  ];
  if (options.allowDiagonals) {
    directions.push({ name: 'SE', vec: { row: 1, col: 1 } });
  }

  if (options.allowBackwards) {
    directions.push({ name: 'W', vec: { row: 0, col: -1 } });
    directions.push({ name: 'N', vec: { row: -1, col: 0 } });
    if (options.allowDiagonals) {
      directions.push({ name: 'NW', vec: { row: -1, col: -1 } });
      directions.push({ name: 'SW', vec: { row: 1, col: -1 } });
      directions.push({ name: 'NE', vec: { row: -1, col: 1 } });
    }
  }
  return directions;
}

function canPlaceWordAt(word, grid, row, col, directionVec) {
  const { rows, cols } = { rows: grid.length, cols: grid[0].length };
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * directionVec.row;
    const newCol = col + i * directionVec.col;

    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
      return false; // Out of bounds
    }
    const cell = grid[newRow][newCol];
    if (cell && cell !== word[i]) {
      return false; // Collision with a different letter
    }
  }
  return true;
}

function placeWordAt(word, grid, row, col, directionVec, directionName) {
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * directionVec.row;
    const newCol = col + i * directionVec.col;
    grid[newRow][newCol] = word[i];
  }
  return {
    word,
    start: { row, col },
    direction: directionName,
  };
}

/**
 * Creates a word search puzzle.
 * @param {string[]} wordList - A list of words to place in the grid.
 * @param {object} options - Configuration for the puzzle generation.
 * @param {number} options.rows - The number of rows in the grid.
 * @param {number} options.cols - The number of columns in the grid.
 * @param {boolean} options.allowBackwards - Whether words can be placed in reverse.
 * @param {boolean} options.allowDiagonals - Whether words can be placed diagonally.
 * @returns {{grid: string[][], solution: object[], wordsNotPlaced: string[]}}
 */
export function createPuzzle(wordList, options) {
  const { rows, cols } = options;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const solution = [];
  const wordsNotPlaced = [];

  const sortedWords = [...wordList].map(w => w.toLowerCase()).sort((a, b) => b.length - a.length);

  const directions = getDirections(options);
  const startCoordinates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      startCoordinates.push({ row: r, col: c });
    }
  }

  for (const word of sortedWords) {
    let placed = false;
    const shuffledDirections = shuffle([...directions]);
    const shuffledCoords = shuffle([...startCoordinates]);

    for (const { row, col } of shuffledCoords) {
      for (const direction of shuffledDirections) {
        if (canPlaceWordAt(word, grid, row, col, direction.vec)) {
          const placement = placeWordAt(word, grid, row, col, direction.vec, direction.name);
          solution.push(placement);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      wordsNotPlaced.push(word);
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, solution, wordsNotPlaced };
}