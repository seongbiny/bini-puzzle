import { Application } from 'pixi.js';
import type { GameStatus, Board } from './types';
import { GAME_CONFIG } from './constants';
import { shuffleBoard } from './board/shuffleBoard';
import { findEmptyIndex, canMoveTile, moveTile, isSolved } from './board/boardUtils';
import { ReadyScene } from './scenes/ReadyScene';
import { PlayingScene } from './scenes/PlayingScene';
import { ClearScene } from './scenes/ClearScene';

export class BiniPuzzleGame {
  private app!: Application;
  private status: GameStatus = 'ready';
  private board: Board = [];
  private moves = 0;

  private readyScene: ReadyScene | null = null;
  private playingScene: PlayingScene | null = null;
  private clearScene: ClearScene | null = null;

  async init(container: HTMLElement): Promise<void> {
    this.app = new Application();
    await this.app.init({
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      background: GAME_CONFIG.COLORS.BACKGROUND,
      antialias: true,
    });
    container.appendChild(this.app.canvas);
    this.showReady();
  }

  restart(): void {
    this.beginGame();
  }

  destroy(): void {
    this.clearAllScenes();
    this.app?.destroy(true);
  }

  private showReady(): void {
    this.status = 'ready';
    this.clearAllScenes();

    this.readyScene = new ReadyScene({ onStart: () => this.beginGame() });
    this.app.stage.addChild(this.readyScene.container);
  }

  private beginGame(): void {
    this.status = 'playing';
    this.board = shuffleBoard();
    this.moves = 0;
    this.clearAllScenes();

    this.playingScene = new PlayingScene({
      board: this.board,
      moves: this.moves,
      onTileClick: (index) => this.handleTileClick(index),
      onRestart: () => this.restart(),
      ticker: this.app.ticker,
    });
    this.app.stage.addChild(this.playingScene.container);
  }

  private handleTileClick(tileIndex: number): void {
    if (this.status !== 'playing') return;
    if (this.playingScene?.isAnimating) return;

    const emptyIndex = findEmptyIndex(this.board);
    if (!canMoveTile(tileIndex, emptyIndex)) return;

    // 애니메이션 완료 후 보드 상태 업데이트
    this.playingScene?.animateTileMove(tileIndex, emptyIndex, () => {
      this.board = moveTile(this.board, tileIndex, emptyIndex);
      this.moves += 1;

      if (isSolved(this.board)) {
        this.showClear();
        return;
      }

      this.playingScene?.update(this.board, this.moves);
    });
  }

  private showClear(): void {
    this.status = 'clear';
    this.clearAllScenes();

    this.clearScene = new ClearScene({
      moves: this.moves,
      onRestart: () => this.restart(),
    });
    this.app.stage.addChild(this.clearScene.container);
  }

  private clearAllScenes(): void {
    if (this.readyScene) {
      this.readyScene.destroy();
      this.readyScene = null;
    }
    if (this.playingScene) {
      this.playingScene.destroy();
      this.playingScene = null;
    }
    if (this.clearScene) {
      this.clearScene.destroy();
      this.clearScene = null;
    }
  }
}
