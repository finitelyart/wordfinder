import '/src/assets/style.css';
import GameController from '/src/ui/GameController.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#app');
  if (app) {
    new GameController(app);
  } else {
    console.error('Root app element not found!');
  }
});