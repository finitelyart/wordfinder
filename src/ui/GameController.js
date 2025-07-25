import { getWordList } from '../core/word-provider.js';
import { createPuzzle } from '../core/generator.js';
import GameBoard from './GameBoard.js';
import WordList from './WordList.js';

const STORAGE_KEY = 'woordzoekerGameState';

const DIFFICULTY_SETTINGS = {
  easy: { rows: 10, cols: 10, allowBackwards: false, allowDiagonals: false, wordCount: 8, wordMinLength: 3, wordMaxLength: 6 },
  medium: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 12, wordMinLength: 4, wordMaxLength: 8 },
  hard: { rows: 20, cols: 20, allowBackwards: true, allowDiagonals: true, wordCount: 16, wordMinLength: 5, wordMaxLength: 10 },
};

function storageAvailable() {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

export default class GameController {
  constructor(rootElement) {
    this.rootElement = rootElement;

    // UI Components
    this.boardContainer = this.rootElement.querySelector('#game-board-container');
    this.wordListContainer = this.rootElement.querySelector('#word-list-container');
    this.gameBoard = new GameBoard(this.boardContainer);
    this.wordList = new WordList(this.wordListContainer);
    
    // UI Controls
    this.newGameBtn = this.rootElement.querySelector('#new-game');
    this.playAgainBtn = this.rootElement.querySelector('#play-again');
    this.difficultySelector = this.rootElement.querySelector('#difficulty');
    this.gameOverMessage = this.rootElement.querySelector('#game-over-message');

    this.state = null;
    this.hasStorage = storageAvailable();

    this.setupEventListeners();
    this.initGame();
  }

  setupEventListeners() {
    this.gameBoard.onWordSelect((start, end) => this.handleWordSelection(start, end));
    this.newGameBtn.addEventListener('click', () => this.startNewGame());
    this.playAgainBtn.addEventListener('click', () => this.startNewGame());
    this.difficultySelector.addEventListener('change', () => this.startNewGame());
  }

  initGame() {
    const savedState = this.loadState();
    if (savedState) {
      this.state = savedState;
      this.difficultySelector.value = this.state.difficulty;
      this.render();
    } else {
      this.startNewGame();
    }
  }

  async startNewGame() {
    if (this.hasStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.gameOverMessage.classList.add('hidden');
    this.rootElement.classList.remove('game-over');
    
    const difficulty = this.difficultySelector.value;
    const settings = DIFFICULTY_SETTINGS[difficulty];
    
    const allWords = await getWordList('en-US', { minLength: settings.wordMinLength, maxLength: settings.wordMaxLength });
    const wordsToPlace = this.selectRandomWords(allWords, settings.wordCount);
    
    const puzzle = createPuzzle(wordsToPlace, settings);

    this.state = {
      puzzle,
      foundWords: [],
      isGameOver: false,
      difficulty,
    };
    
    this.saveState();
    this.render();
  }
  
  selectRandomWords(words, count) {
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
  }

  handleWordSelection(start, end) {
    if (this.state.isGameOver) return;
    
    const wordForward = this.readWordFromGrid(start, end);
    if (!wordForward) return;
    
    const wordBackward = wordForward.split('').reverse().join('');

    const solutionEntry = this.state.puzzle.solution.find(s => 
      !this.state.foundWords.includes(s.word) && (s.word === wordForward || s.word === wordBackward)
    );

    if (solutionEntry) {
      this.state.foundWords.push(solutionEntry.word);
      this.saveState();
      this.render();
      this.checkGameOver();
    }
  }

  readWordFromGrid(start, end) {
    const { grid } = this.state.puzzle;
    let word = '';
    
    const dr = end.row - start.row;
    const dc = end.col - start.col;

    const isStraightLine = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!isStraightLine) return null;

    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return grid[start.row][start.col];

    const stepR = dr / steps;
    const stepC = dc / steps;

    for (let i = 0; i <= steps; i++) {
        const r = start.row + i * stepR;
        const c = start.col + i * stepC;
        word += grid[r][c];
    }
    return word;
  }
  
  checkGameOver() {
    if (this.state.foundWords.length === this.state.puzzle.solution.length) {
      this.state.isGameOver = true;
      this.gameOverMessage.classList.remove('hidden');
      this.rootElement.classList.add('game-over');
      this.saveState();
    }
  }

  render() {
    const { grid, solution } = this.state.puzzle;
    const { foundWords } = this.state;
    
    const foundWordPaths = solution.filter(s => foundWords.includes(s.word));
    
    this.gameBoard.render(grid, foundWordPaths);
    this.wordList.render(solution.map(s => s.word), foundWords);
  }

  saveState() {
    if (!this.hasStorage) return;
    try {
      if (this.state.isGameOver) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error("Could not save game state to localStorage", e);
    }
  }

  loadState() {
    if (!this.hasStorage) return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if(state && state.puzzle && state.foundWords && !state.isGameOver) {
            return state;
        }
      }
      return null;
    } catch (e) {
      console.error("Could not load game state from localStorage", e);
      return null;
    }
  }
}