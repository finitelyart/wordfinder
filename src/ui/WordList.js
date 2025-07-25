import { createElement } from '/src/utils/dom.js';

export default class WordList {
  /**
   * @param {HTMLElement} rootElement The element to render the word list into.
   */
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.rootElement.innerHTML = `
      <h2>Words to Find</h2>
      <ul id="word-list"></ul>
    `;
    this.listElement = this.rootElement.querySelector('#word-list');
  }

  /**
   * Renders the list of words.
   * @param {string[]} wordsToFind The words to display in the list.
   * @param {string[]} foundWords The words that have been found.
   */
  render(wordsToFind, foundWords) {
    this.listElement.innerHTML = '';
    const sortedWords = [...wordsToFind].sort();
    
    for (const word of sortedWords) {
      const li = createElement('li', '');
      li.textContent = word;
      li.dataset.word = word;

      if (foundWords.includes(word)) {
        li.classList.add('found');
      }
      this.listElement.appendChild(li);
    }
  }
}