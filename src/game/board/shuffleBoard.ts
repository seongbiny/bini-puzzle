import type { Board } from '../types';
import { GAME_CONFIG, SOLVED_BOARD } from '../constants';
import { findEmptyIndex, getAdjacentIndices, moveTile } from './boardUtils';

export function shuffleBoard(): Board {
  let board: Board = [...SOLVED_BOARD];

  for (let i = 0; i < GAME_CONFIG.SHUFFLE_MOVE_COUNT; i++) {
    const emptyIndex = findEmptyIndex(board);
    const adjacent = getAdjacentIndices(emptyIndex);
    const randomIndex = adjacent[Math.floor(Math.random() * adjacent.length)];
    board = moveTile(board, randomIndex, emptyIndex);
  }

  return board;
}
