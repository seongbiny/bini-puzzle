import type { Board, TilePosition } from '../types';
import { GAME_CONFIG, SOLVED_BOARD } from '../constants';

export function indexToPosition(index: number): TilePosition {
  return {
    row: Math.floor(index / GAME_CONFIG.BOARD_SIZE),
    col: index % GAME_CONFIG.BOARD_SIZE,
  };
}

export function positionToIndex(position: TilePosition): number {
  return position.row * GAME_CONFIG.BOARD_SIZE + position.col;
}

export function canMoveTile(tileIndex: number, emptyIndex: number): boolean {
  const tilePos = indexToPosition(tileIndex);
  const emptyPos = indexToPosition(emptyIndex);
  const rowDiff = Math.abs(tilePos.row - emptyPos.row);
  const colDiff = Math.abs(tilePos.col - emptyPos.col);
  return rowDiff + colDiff === 1;
}

export function moveTile(board: Board, tileIndex: number, emptyIndex: number): Board {
  const next = [...board];
  [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
  return next;
}

export function isSolved(board: Board): boolean {
  return board.every((value, index) => value === SOLVED_BOARD[index]);
}

export function findEmptyIndex(board: Board): number {
  return board.indexOf(GAME_CONFIG.EMPTY_TILE_VALUE);
}

export function getAdjacentIndices(index: number): number[] {
  const { row, col } = indexToPosition(index);
  const size = GAME_CONFIG.BOARD_SIZE;
  const adjacent: number[] = [];

  if (row > 0) adjacent.push(positionToIndex({ row: row - 1, col }));
  if (row < size - 1) adjacent.push(positionToIndex({ row: row + 1, col }));
  if (col > 0) adjacent.push(positionToIndex({ row, col: col - 1 }));
  if (col < size - 1) adjacent.push(positionToIndex({ row, col: col + 1 }));

  return adjacent;
}
