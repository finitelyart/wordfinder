import { getThemes, getThemeData } from '../core/word-provider.js';
import { createPuzzle } from '../core/generator.js';
import { playSound } from '../utils/audio.js';
import GameBoard from './GameBoard.js';
import WordList from './WordList.js';

const STORAGE_KEY = 'woordzoekerGameState';

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
    this.themeSelector = this.rootElement.querySelector('#theme');
    this.gameOverMessage = this.rootElement.querySelector('#game-over-message');

    this.state = null;
    this.hasStorage = storageAvailable();

    this.populateThemeSelector();
    this.setupEventListeners();
    this.initGame();
  }

  setupEventListeners() {
    this.gameBoard.onWordSelect((start, end) => this.handleWordSelection(start, end));
    this.newGameBtn.addEventListener('click', () => this.startNewGame());
    this.playAgainBtn.addEventListener('click', () => this.startNewGame());
    this.themeSelector.addEventListener('change', () => this.startNewGame());
  }

  initGame() {
    const savedState = this.loadState();
    if (savedState) {
      this.state = savedState;
      this.themeSelector.value = this.state.theme;
      this.render();
    } else {
      this.startNewGame();
    }
  }

  populateThemeSelector() {
    const themes = getThemes();
    this.themeSelector.innerHTML = '';
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      this.themeSelector.appendChild(option);
    });
  }

  startNewGame() {
    if (this.hasStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.gameOverMessage.classList.add('hidden');
    this.rootElement.classList.remove('game-over');

    const themeId = this.themeSelector.value;
    const themeData = getThemeData(themeId);
    if (!themeData) {
        console.error(`Could not start new game: theme "${themeId}" not found.`);
        return;
    }

    const { words, options } = themeData;
    const wordsToPlace = this.selectRandomWords(words, options.wordCount);
    
    const puzzle = createPuzzle(wordsToPlace, options);

    this.state = {
      puzzle,
      foundWords: [],
      isGameOver: false,
      theme: themeId,
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
      this.render(); // Re-render first to apply 'found' styles
      playSound('found');
      this.gameBoard.animateFoundWord(solutionEntry);
      this.saveState();
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
      playSound('win');
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
        // Basic validation of the saved state
        if(state && state.puzzle && state.foundWords && state.theme && !state.isGameOver) {
            // Check if theme still exists
            if (getThemeData(state.theme)) {
              return state;
            }
        }
      }
      return null;
    } catch (e) {
      console.error("Could not load game state from localStorage", e);
      return null;
    }
  }
}