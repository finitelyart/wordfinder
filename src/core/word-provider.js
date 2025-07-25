const themes = {
  animals: {
    name: 'Animals',
    words: ['cat', 'dog', 'lion', 'tiger', 'bear', 'horse', 'zebra', 'monkey', 'elephant', 'giraffe', 'snake', 'hippo', 'shark', 'eagle', 'wolf'],
    options: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 10 },
  },
  fruits: {
    name: 'Fruits',
    words: ['apple', 'banana', 'orange', 'grape', 'mango', 'lemon', 'cherry', 'peach', 'melon', 'berry', 'kiwi', 'plum', 'lime', 'papaya', 'guava'],
    options: { rows: 12, cols: 12, allowBackwards: false, allowDiagonals: true, wordCount: 8 },
  },
  programming: {
    name: 'Programming',
    words: ['code', 'bugs', 'java', 'script', 'array', 'react', 'node', 'html', 'vite', 'const', 'agile', 'logic', 'class', 'style', 'build', 'query'],
    options: { rows: 18, cols: 18, allowBackwards: true, allowDiagonals: true, wordCount: 12 },
  },
  science: {
    name: 'Science',
    words: ['atom', 'cell', 'dna', 'energy', 'force', 'gravity', 'ion', 'lab', 'mass', 'neuron', 'orbit', 'phase', 'quark', 'react', 'space', 'tesla', 'volt'],
    options: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 12 },
  },
  space: {
    name: 'Space',
    words: ['comet', 'earth', 'galaxy', 'jupiter', 'luna', 'mars', 'nebula', 'orbit', 'pluto', 'rocket', 'saturn', 'star', 'sun', 'venus', 'void'],
    options: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 10 },
  },
  'eten-nl': {
    name: 'Eten (Dutch)',
    words: ['kaas', 'brood', 'boter', 'melk', 'appel', 'peer', 'druif', 'soep', 'vlees', 'vis', 'rijst', 'pasta', 'patat', 'zout', 'peper'],
    options: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 10 },
  },
  'dieren-nl': {
    name: 'Dieren (Dutch)',
    words: ['hond', 'kat', 'paard', 'vogel', 'vis', 'leeuw', 'aap', 'olifant', 'tijger', 'slang', 'beer', 'wolf', 'haai', 'koe', 'schaap'],
    options: { rows: 15, cols: 15, allowBackwards: true, allowDiagonals: true, wordCount: 10 },
  },
};

export function getThemes() {
  return Object.keys(themes).map(key => ({ id: key, name: themes[key].name }));
}

/**
 * Gets the theme data.
 * @param {string} themeId - The ID of the theme (e.g., 'animals').
 * @returns {{name: string, words: string[], options: object}|null} An object with theme data, or null if theme not found.
 */
export function getThemeData(themeId) {
  if (themes[themeId]) {
    // Return a copy to prevent mutation of original theme data
    return JSON.parse(JSON.stringify(themes[themeId]));
  }
  console.error(`Theme "${themeId}" not found.`);
  return null;
}