export const GAME_CONFIG = {
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 560,

  BOARD_SIZE: 3,
  TILE_SIZE: 110,
  TILE_GAP: 10,

  SHUFFLE_MOVE_COUNT: 30,

  EMPTY_TILE_VALUE: 0,

  COLORS: {
    BACKGROUND: 0x1a1a2e,
    TILE: 0x16213e,
    TILE_HOVER: 0x0f3460,
    TILE_TEXT: 0xe94560,
    EMPTY_CELL: 0x0d0d1a,
    BUTTON: 0xe94560,
    BUTTON_HOVER: 0xc73652,
    BUTTON_TEXT: 0xffffff,
    TITLE_TEXT: 0xe94560,
    BODY_TEXT: 0xaaaacc,
    BOARD_BG: 0x0d0d1a,
  },
} as const;

export const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];
