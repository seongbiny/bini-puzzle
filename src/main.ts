import { BiniPuzzleGame } from './game/BiniPuzzleGame';

const container = document.querySelector<HTMLDivElement>('#app');

if (!container) {
  throw new Error('App container not found');
}

const game = new BiniPuzzleGame();
await game.init(container);
