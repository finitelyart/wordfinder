// This structure maps language codes to functions that return a promise resolving to the word list.
// It fetches the JSON files that have been copied to the /public directory.
const dictionaries = {
  'en-US': () => fetch('/american-words.json').then(res => res.json()),
  'en-GB': () => fetch('/british-words.json').then(res => res.json()),
  // Future language additions would go here, e.g.:
  // 'nl-NL': () => fetch('/dutch-words.json').then(res => res.json()),
};

/**
 * Asynchronously fetches and filters a word list for a given language.
 * @param {string} language - The language code (e.g., 'en-US').
 * @param {object} options - Filtering options for the words.
 * @param {number} options.minLength - The minimum length of words to include.
 * @param {number} options.maxLength - The maximum length of words to include.
 * @returns {Promise<string[]>} A promise that resolves to an array of words.
 */
export async function getWordList(language = 'en-US', options = { minLength: 3, maxLength: 10 }) {
  if (!dictionaries[language]) {
    console.error(`Dictionary for language "${language}" not found.`);
    return [];
  }

  try {
    // Fetch the JSON for the selected language.
    const words = await dictionaries[language]();

    // Filter the words based on the provided length constraints.
    return words.filter(word => word.length >= options.minLength && word.length <= options.maxLength);
  } catch (error) {
    console.error(`Failed to load dictionary for language "${language}":`, error);
    return [];
  }
}