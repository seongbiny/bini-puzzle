export type GameStatus = 'ready' | 'playing' | 'clear';

export type TileValue = number;

export type Board = TileValue[];

export interface TilePosition {
  row: number;
  col: number;
}
