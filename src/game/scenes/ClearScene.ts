import { Container } from 'pixi.js';
import { GAME_CONFIG } from '../constants';
import { createButton } from '../ui/createButton';
import { createText } from '../ui/createText';

interface ClearSceneOptions {
  moves: number;
  onRestart: () => void;
}

export class ClearScene {
  readonly container: Container;

  constructor({ moves, onRestart }: ClearSceneOptions) {
    this.container = new Container();
    this.build(moves, onRestart);
  }

  private build(moves: number, onRestart: () => void): void {
    const cx = GAME_CONFIG.CANVAS_WIDTH / 2;
    const cy = GAME_CONFIG.CANVAS_HEIGHT / 2;

    const clearText = createText({
      content: 'Clear!',
      fontSize: 64,
      color: GAME_CONFIG.COLORS.TITLE_TEXT,
      fontWeight: 'bold',
    });
    clearText.position.set(cx, cy - 100);

    const movesText = createText({
      content: `Moves: ${moves}`,
      fontSize: 28,
      color: GAME_CONFIG.COLORS.BODY_TEXT,
    });
    movesText.position.set(cx, cy);

    const restartBtn = createButton({ label: '다시 시작', onClick: onRestart });
    restartBtn.position.set(cx, cy + 100);

    this.container.addChild(clearText, movesText, restartBtn);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
