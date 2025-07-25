// This structure maps language codes to functions that return a dynamic import.
// This is inspired by multilingual JSON formats and the file structure of the wordlist-english package.
const dictionaries = {
  'en-US': () => import('wordlist-english/american-words.json'),
  'en-GB': () => import('wordlist-english/british-words.json'),
  // Future language additions would go here, e.g.:
  // 'nl-NL': () => import('path/to/dutch-words.json'),
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
    // Dynamically import the JSON module for the selected language.
    const wordListModule = await dictionaries[language]();
    const words = wordListModule.default;

    // Filter the words based on the provided length constraints.
    return words.filter(word => word.length >= options.minLength && word.length <= options.maxLength);
  } catch (error) {
    console.error(`Failed to load dictionary for language "${language}":`, error);
    return [];
  }
}