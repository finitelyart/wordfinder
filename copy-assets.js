const fs = require('fs-extra');
const path = require('path');

try {
  console.log('Locating wordlist-english package...');
  const wordlistPath = path.dirname(require.resolve('wordlist-english/package.json'));
  const publicPath = path.resolve(__dirname, 'public');

  console.log('Copying wordlists to public directory...');
  
  fs.ensureDirSync(publicPath);

  fs.copySync(path.join(wordlistPath, 'american-words.json'), path.join(publicPath, 'american-words.json'));
  fs.copySync(path.join(wordlistPath, 'british-words.json'), path.join(publicPath, 'british-words.json'));

  console.log('Wordlists copied successfully.');
} catch (error) {
  console.error('Error copying wordlist assets. Please ensure "wordlist-english" is installed.', error);
  // Exit with a non-zero code to indicate failure, but optional
  // process.exit(1);
}