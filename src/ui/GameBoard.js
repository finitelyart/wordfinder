import { createElement } from '/src/utils/dom.js';
import { initAudio } from '/src/utils/audio.js';

export default class GameBoard {
  /**
   * @param {HTMLElement} rootElement The element to render the board into.
   */
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.grid = [];
    this.selection = {
      start: null,
      end: null,
      isSelecting: false,
    };
    this._onWordSelect = () => {}; // Callback for when a word is selected

    this.table = createElement('table', 'word-search-grid');
    this.rootElement.appendChild(this.table);

    this.setupEventListeners();
    window.addEventListener('resize', () => this.fitGridToContainer());
  }
  
  /**
   * Sets up mouse and touch event listeners for word selection.
   */
  setupEventListeners() {
    this.table.addEventListener('mousedown', this.handleInteractionStart.bind(this));
    this.table.addEventListener('mouseover', this.handleInteractionMove.bind(this));
    document.addEventListener('mouseup', this.handleInteractionEnd.bind(this));

    this.table.addEventListener('touchstart', this.handleInteractionStart.bind(this), { passive: false });
    this.table.addEventListener('touchmove', this.handleInteractionMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleInteractionEnd.bind(this));
  }

  /**
   * @param {(start: {row: number, col: number}, end: {row: number, col: number}) => void} callback
   */
  onWordSelect(callback) {
    this._onWordSelect = callback;
  }

  /**
   * Renders the game board.
   * @param {string[][]} grid The 2D array of letters.
   * @param {{word: string, start: {row:number, col:number}, direction:string}[]} foundWordPaths The paths of found words.
   */
  render(grid, foundWordPaths) {
    this.grid = grid;
    this.table.innerHTML = '';
    const tbody = document.createElement('tbody');

    grid.forEach((row, r) => {
      const tr = document.createElement('tr');
      row.forEach((cell, c) => {
        const td = createElement('td', '', cell);
        td.dataset.row = r;
        td.dataset.col = c;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    this.table.appendChild(tbody);
    this.highlightFoundWords(foundWordPaths);
    // Use a small timeout to ensure the browser has rendered the table before we measure it
    setTimeout(() => this.fitGridToContainer(), 0);
  }

  fitGridToContainer() {
    const container = this.rootElement;
    const table = this.table;

    if (!container.clientWidth || !table.rows.length) {
      return;
    }

    // Set a large font size to start with, then scale down.
    let fontSize = 32; // max font size in px
    table.style.fontSize = `${fontSize}px`;

    // Iteratively shrink font size until the table fits within the container.
    // We add a 5% margin for padding.
    const targetWidth = container.clientWidth * 0.95;
    const targetHeight = container.clientHeight * 0.95;

    while ((table.scrollWidth > targetWidth || table.scrollHeight > targetHeight) && fontSize > 6) {
      fontSize -= 1;
      table.style.fontSize = `${fontSize}px`;
    }
  }

  getCellFromEvent(event) {
    const target = (event.touches) ? document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) : event.target;
    if (target && target.tagName === 'TD') {
      const row = parseInt(target.dataset.row, 10);
      const col = parseInt(target.dataset.col, 10);
      return { row, col, element: target };
    }
    return null;
  }

  handleInteractionStart(event) {
    initAudio(); // Initialize audio on first user interaction
    event.preventDefault();
    const cell = this.getCellFromEvent(event);
    if (cell) {
      this.selection.isSelecting = true;
      this.selection.start = { row: cell.row, col: cell.col };
      this.selection.end = { row: cell.row, col: cell.col };
      this.updateHighlight();
    }
  }
  
  handleInteractionMove(event) {
    if (!this.selection.isSelecting) return;
    event.preventDefault();
    const cell = this.getCellFromEvent(event);
    if (cell && (cell.row !== this.selection.end.row || cell.col !== this.selection.end.col)) {
      this.selection.end = { row: cell.row, col: cell.col };
      this.updateHighlight();
    }
  }

  handleInteractionEnd() {
    if (!this.selection.isSelecting) return;
    this.selection.isSelecting = false;
    
    if (this.selection.start && this.selection.end) {
        this._onWordSelect(this.selection.start, this.selection.end);
    }
    
    this.clearActiveHighlight();
    this.selection.start = null;
    this.selection.end = null;
  }

  clearActiveHighlight() {
    this.table.querySelectorAll('.highlight-active').forEach(cell => {
      cell.classList.remove('highlight-active');
    });
  }

  updateHighlight() {
    this.clearActiveHighlight();
    if (!this.selection.start || !this.selection.end) return;

    const cellsToHighlight = this.getCellsInSelection(this.selection.start, this.selection.end);
    cellsToHighlight.forEach(({row, col}) => {
      const cell = this.table.rows[row]?.cells[col];
      if (cell) {
        cell.classList.add('highlight-active');
      }
    });
  }

  getCellsInSelection(start, end) {
    const cells = [];
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    
    const isStraightLine = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!isStraightLine) return [];
    
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [{row: start.row, col: start.col}];

    const stepR = dr / steps;
    const stepC = dc / steps;
    
    for (let i = 0; i <= steps; i++) {
        cells.push({ row: start.row + i * stepR, col: start.col + i * stepC });
    }
    return cells;
  }

  animateFoundWord(wordPath) {
    const directionVectors = this.getDirectionVectors();
    const { word, start, direction } = wordPath;
    const vec = directionVectors[direction];
    if (!vec) return;

    const cells = [];
    for (let i = 0; i < word.length; i++) {
        const r = start.row + i * vec.row;
        const c = start.col + i * vec.col;
        const cell = this.table.rows[r]?.cells[c];
        if (cell) {
            cells.push(cell);
        }
    }
    
    cells.forEach(cell => cell.classList.add('newly-found'));
    setTimeout(() => {
        cells.forEach(cell => cell.classList.remove('newly-found'));
    }, 300); // Corresponds to animation duration
  }

  getDirectionVectors() {
    return {
        'E':  { row: 0, col: 1 },  'W':  { row: 0, col: -1 },
        'S':  { row: 1, col: 0 },  'N':  { row: -1, col: 0 },
        'SE': { row: 1, col: 1 },  'SW': { row: 1, col: -1 },
        'NE': { row: -1, col: 1}, 'NW': { row: -1, col: -1 }
    };
  }

  highlightFoundWords(foundWordPaths) {
    const directionVectors = this.getDirectionVectors();
      
    foundWordPaths.forEach(({ word, start, direction }) => {
        const vec = directionVectors[direction];
        if (!vec) return;

        for (let i = 0; i < word.length; i++) {
            const r = start.row + i * vec.row;
            const c = start.col + i * vec.col;
            const cell = this.table.rows[r]?.cells[c];
            if (cell) {
                cell.classList.add('highlight-found');
            }
        }
    });
  }
}