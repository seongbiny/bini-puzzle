import { Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import type { Board } from '../types';
import { GAME_CONFIG } from '../constants';
import { indexToPosition, findEmptyIndex, canMoveTile } from '../board/boardUtils';
import { createButton } from '../ui/createButton';
import { createText } from '../ui/createText';

interface PlayingSceneOptions {
  board: Board;
  moves: number;
  onTileClick: (tileIndex: number) => void;
  onRestart: () => void;
  ticker: Ticker;
}

const ANIM_DURATION = 0.12; // 초

// ease-out cubic
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class PlayingScene {
  readonly container: Container;
  private movesText: Text;
  private boardContainer: Container;
  private onTileClick: (tileIndex: number) => void;
  private tileContainers: Map<number, Container> = new Map();
  private ticker: Ticker;
  isAnimating = false;

  private readonly boardStartX: number;
  private readonly boardStartY = 90;

  constructor({ board, moves, onTileClick, onRestart, ticker }: PlayingSceneOptions) {
    this.container = new Container();
    this.onTileClick = onTileClick;
    this.ticker = ticker;

    const { TILE_SIZE, TILE_GAP, BOARD_SIZE, CANVAS_WIDTH } = GAME_CONFIG;
    const boardPixelSize = BOARD_SIZE * TILE_SIZE + (BOARD_SIZE - 1) * TILE_GAP;
    this.boardStartX = (CANVAS_WIDTH - boardPixelSize) / 2;

    const cx = CANVAS_WIDTH / 2;

    this.movesText = createText({
      content: `Moves: ${moves}`,
      fontSize: 22,
      color: GAME_CONFIG.COLORS.BODY_TEXT,
    });
    this.movesText.position.set(cx, 50);

    this.boardContainer = new Container();
    this.container.addChild(this.movesText, this.boardContainer);

    this.renderBoard(board);

    const restartBtn = createButton({ label: '다시 시작', width: 160, onClick: onRestart });
    restartBtn.position.set(cx, GAME_CONFIG.CANVAS_HEIGHT - 55);
    this.container.addChild(restartBtn);
  }

  private getTilePixelPos(index: number): { x: number; y: number } {
    const { TILE_SIZE, TILE_GAP } = GAME_CONFIG;
    const { row, col } = indexToPosition(index);
    return {
      x: this.boardStartX + col * (TILE_SIZE + TILE_GAP),
      y: this.boardStartY + row * (TILE_SIZE + TILE_GAP),
    };
  }

  animateTileMove(fromIndex: number, toIndex: number, onComplete: () => void): void {
    if (this.isAnimating) return;

    const tile = this.tileContainers.get(fromIndex);
    if (!tile) {
      onComplete();
      return;
    }

    this.isAnimating = true;

    const startPos = this.getTilePixelPos(fromIndex);
    const endPos = this.getTilePixelPos(toIndex);
    let elapsed = 0;

    const onTick = (ticker: Ticker) => {
      elapsed += ticker.deltaMS / 1000;
      const t = Math.min(elapsed / ANIM_DURATION, 1);
      const eased = easeOut(t);

      tile.x = startPos.x + (endPos.x - startPos.x) * eased;
      tile.y = startPos.y + (endPos.y - startPos.y) * eased;

      if (t >= 1) {
        this.ticker.remove(onTick);
        this.isAnimating = false;
        onComplete();
      }
    };

    this.ticker.add(onTick);
  }

  private renderBoard(board: Board): void {
    this.boardContainer.removeChildren();
    this.tileContainers.clear();

    const { TILE_SIZE, TILE_GAP, BOARD_SIZE, CANVAS_WIDTH, COLORS } = GAME_CONFIG;
    const boardPixelSize = BOARD_SIZE * TILE_SIZE + (BOARD_SIZE - 1) * TILE_GAP;
    const boardStartX = (CANVAS_WIDTH - boardPixelSize) / 2;

    const boardBg = new Graphics();
    boardBg.roundRect(boardStartX - 12, this.boardStartY - 12, boardPixelSize + 24, boardPixelSize + 24, 12);
    boardBg.fill({ color: COLORS.BOARD_BG });
    this.boardContainer.addChild(boardBg);

    const emptyIndex = findEmptyIndex(board);

    board.forEach((value, index) => {
      if (value === GAME_CONFIG.EMPTY_TILE_VALUE) return;

      const { x, y } = this.getTilePixelPos(index);
      const tileContainer = new Container();
      tileContainer.position.set(x, y);

      const isMovable = canMoveTile(index, emptyIndex);

      const bg = new Graphics();
      bg.roundRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
      bg.fill({ color: COLORS.TILE });

      const textStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: COLORS.TILE_TEXT,
      });
      const tileText = new Text({ text: String(value), style: textStyle });
      tileText.anchor.set(0.5);
      tileText.position.set(TILE_SIZE / 2, TILE_SIZE / 2);

      tileContainer.addChild(bg, tileText);

      if (isMovable) {
        tileContainer.eventMode = 'static';
        tileContainer.cursor = 'pointer';

        tileContainer.on('pointerover', () => {
          bg.clear();
          bg.roundRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
          bg.fill({ color: COLORS.TILE_HOVER });
        });

        tileContainer.on('pointerout', () => {
          bg.clear();
          bg.roundRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
          bg.fill({ color: COLORS.TILE });
        });

        tileContainer.on('pointertap', () => this.onTileClick(index));
      }

      this.boardContainer.addChild(tileContainer);
      this.tileContainers.set(index, tileContainer);
    });
  }

  update(board: Board, moves: number): void {
    this.movesText.text = `Moves: ${moves}`;
    this.renderBoard(board);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
