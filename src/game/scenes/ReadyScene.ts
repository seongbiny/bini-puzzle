import { Container } from 'pixi.js';
import { GAME_CONFIG } from '../constants';
import { createButton } from '../ui/createButton';
import { createText } from '../ui/createText';

interface ReadySceneOptions {
  onStart: () => void;
}

export class ReadyScene {
  readonly container: Container;

  constructor({ onStart }: ReadySceneOptions) {
    this.container = new Container();
    this.build(onStart);
  }

  private build(onStart: () => void): void {
    const cx = GAME_CONFIG.CANVAS_WIDTH / 2;
    const cy = GAME_CONFIG.CANVAS_HEIGHT / 2;

    const title = createText({
      content: 'Bini Puzzle',
      fontSize: 48,
      color: GAME_CONFIG.COLORS.TITLE_TEXT,
      fontWeight: 'bold',
    });
    title.position.set(cx, cy - 120);

    const desc = createText({
      content: '숫자 타일을 움직여\n1부터 8까지 순서대로 맞춰보세요!',
      fontSize: 18,
      color: GAME_CONFIG.COLORS.BODY_TEXT,
    });
    desc.position.set(cx, cy - 30);

    const startBtn = createButton({ label: '시작하기', onClick: onStart });
    startBtn.position.set(cx, cy + 80);

    this.container.addChild(title, desc, startBtn);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
