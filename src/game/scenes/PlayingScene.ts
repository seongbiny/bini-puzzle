import { Container, Graphics, Text, TextStyle } from 'pixi.js';
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
}

export class PlayingScene {
  readonly container: Container;
  private movesText: Text;
  private boardContainer: Container;
  private onTileClick: (tileIndex: number) => void;

  constructor({ board, moves, onTileClick, onRestart }: PlayingSceneOptions) {
    this.container = new Container();
    this.onTileClick = onTileClick;

    const cx = GAME_CONFIG.CANVAS_WIDTH / 2;

    // 이동 횟수 텍스트
    this.movesText = createText({
      content: `Moves: ${moves}`,
      fontSize: 22,
      color: GAME_CONFIG.COLORS.BODY_TEXT,
    });
    this.movesText.position.set(cx, 50);

    // 보드 컨테이너
    this.boardContainer = new Container();
    this.container.addChild(this.movesText, this.boardContainer);

    this.renderBoard(board);

    // 다시 시작 버튼
    const restartBtn = createButton({ label: '다시 시작', width: 160, onClick: onRestart });
    restartBtn.position.set(cx, GAME_CONFIG.CANVAS_HEIGHT - 55);
    this.container.addChild(restartBtn);
  }

  private renderBoard(board: Board): void {
    this.boardContainer.removeChildren();

    const { TILE_SIZE, TILE_GAP, BOARD_SIZE, CANVAS_WIDTH, COLORS } = GAME_CONFIG;
    const boardPixelSize = BOARD_SIZE * TILE_SIZE + (BOARD_SIZE - 1) * TILE_GAP;
    const boardStartX = (CANVAS_WIDTH - boardPixelSize) / 2;
    const boardStartY = 90;

    // 보드 배경
    const boardBg = new Graphics();
    boardBg.roundRect(boardStartX - 12, boardStartY - 12, boardPixelSize + 24, boardPixelSize + 24, 12);
    boardBg.fill({ color: COLORS.BOARD_BG });
    this.boardContainer.addChild(boardBg);

    const emptyIndex = findEmptyIndex(board);

    board.forEach((value, index) => {
      if (value === GAME_CONFIG.EMPTY_TILE_VALUE) return;

      const { row, col } = indexToPosition(index);
      const x = boardStartX + col * (TILE_SIZE + TILE_GAP);
      const y = boardStartY + row * (TILE_SIZE + TILE_GAP);

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
