# Bini Puzzle MVP Spec

## 1. 기술 스택

Bini Puzzle은 독립형 웹 미니게임으로 개발한다.

사용 기술:

* Vite
* TypeScript
* Pixi.js
* ESLint
* Prettier

초기 MVP에서는 React를 사용하지 않는다.

Pixi.js는 아래 역할을 담당한다.

```txt
Pixi.js
- 퍼즐 보드 렌더링
- 숫자 타일 렌더링
- 빈 칸 표시
- 이동 횟수 텍스트 표시
- 시작 버튼, 다시 시작 버튼 표시
- 클리어 화면 표시
```

## 2. 프로젝트 구조

추천 구조는 아래와 같다.

```txt
bini-puzzle/
├─ public/
├─ src/
│  ├─ main.ts
│  ├─ style.css
│  ├─ game/
│  │  ├─ BiniPuzzleGame.ts
│  │  ├─ constants.ts
│  │  ├─ types.ts
│  │  ├─ board/
│  │  │  ├─ boardUtils.ts
│  │  │  └─ shuffleBoard.ts
│  │  ├─ scenes/
│  │  │  ├─ ReadyScene.ts
│  │  │  ├─ PlayingScene.ts
│  │  │  └─ ClearScene.ts
│  │  └─ ui/
│  │     ├─ createButton.ts
│  │     └─ createText.ts
│  └─ shared/
│     └─ utils/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ prd.md
├─ spec.md
├─ CLAUDE.md
└─ README.md
```

## 3. 실행 방식

`main.ts`에서는 `#app` DOM 요소를 찾고, `BiniPuzzleGame`을 생성해 실행한다.

```ts
const container = document.querySelector<HTMLDivElement>('#app');

if (!container) {
  throw new Error('App container not found');
}

const game = new BiniPuzzleGame();

await game.init(container);
game.start();
```

## 4. 게임 생명주기

게임 클래스는 아래 생명주기를 가진다.

```ts
export interface GameInstance {
  init: (container: HTMLElement) => Promise<void>;
  start: () => void;
  restart: () => void;
  destroy: () => void;
}
```

`BiniPuzzleGame`은 전체 게임 흐름을 관리한다.

주요 책임:

* Pixi Application 생성
* 게임 상태 관리
* Scene 전환 관리
* 퍼즐 보드 상태 관리
* 이동 횟수 관리
* 타일 클릭 처리
* 클리어 판정
* 다시 시작 처리
* Pixi 리소스 정리

## 5. 게임 상태

게임 상태는 MVP 기준으로 3개만 사용한다.

```ts
export type GameStatus = 'ready' | 'playing' | 'clear';
```

상태 설명:

```txt
ready       시작 전
playing     퍼즐 진행 중
clear       퍼즐 완성
```

상태 전환:

```txt
ready
  └─ start
      → playing

playing
  ├─ puzzle completed
  │   → clear
  └─ restart
      → playing

clear
  └─ restart
      → playing
```

## 6. 게임 설정값

게임 설정값은 `constants.ts`에 둔다.

```ts
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  BOARD_SIZE: 3,
  TILE_SIZE: 120,
  TILE_GAP: 8,

  SHUFFLE_MOVE_COUNT: 30,

  EMPTY_TILE_VALUE: 0,
};
```

값은 구현하면서 화면 크기와 플레이 감각에 맞게 조정할 수 있다.

## 7. 타입 정의

`types.ts`에 공통 타입을 정의한다.

```ts
export type GameStatus = 'ready' | 'playing' | 'clear';

export type TileValue = number;

export type Board = TileValue[];

export interface TilePosition {
  row: number;
  col: number;
}
```

보드 데이터는 1차원 배열로 관리한다.

```ts
const solvedBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
```

`0`은 빈 칸을 의미한다.

## 8. Board 설계

퍼즐 보드는 3×3이지만 내부 데이터는 1차원 배열로 관리한다.

예시:

```txt
1  2  3
4  5  6
7  8  빈칸
```

내부 데이터:

```ts
[1, 2, 3, 4, 5, 6, 7, 8, 0]
```

행과 열 계산:

```ts
const row = Math.floor(index / GAME_CONFIG.BOARD_SIZE);
const col = index % GAME_CONFIG.BOARD_SIZE;
```

인덱스 계산:

```ts
const index = row * GAME_CONFIG.BOARD_SIZE + col;
```

## 9. 이동 가능 여부

타일은 빈 칸과 상하좌우로 인접한 경우에만 이동할 수 있다.

이동 가능 조건:

```ts
const rowDiff = Math.abs(tilePosition.row - emptyPosition.row);
const colDiff = Math.abs(tilePosition.col - emptyPosition.col);

const canMove = rowDiff + colDiff === 1;
```

이동 가능한 경우에는 클릭한 타일과 빈 칸의 위치를 교환한다.

```ts
[board[tileIndex], board[emptyIndex]] = [
  board[emptyIndex],
  board[tileIndex],
];
```

## 10. 퍼즐 섞기 규칙

MVP에서는 반드시 풀 수 있는 퍼즐만 생성해야 한다.

가장 단순한 방식은 정답 상태에서 시작해 빈 칸 기준으로 이동 가능한 타일을 여러 번 랜덤 이동하는 것이다.

흐름:

```txt
1. 정답 배열에서 시작한다.
2. 빈 칸 위치를 찾는다.
3. 빈 칸과 인접한 타일 목록을 구한다.
4. 그중 하나를 랜덤으로 선택한다.
5. 빈 칸과 선택한 타일을 교환한다.
6. 이 과정을 30회 반복한다.
```

이 방식으로 섞으면 항상 풀 수 있는 퍼즐이 된다.

## 11. 클리어 판정

아래 배열과 같으면 클리어로 판단한다.

```ts
const solvedBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
```

판정 방식:

```ts
const isSolved = board.every((value, index) => value === solvedBoard[index]);
```

클리어 상태가 되면 `clear` 상태로 전환한다.

## 12. Scene 설계

### 12.1 ReadyScene

역할:

* 게임 제목 표시
* 간단한 설명 표시
* 시작 버튼 표시

이벤트:

* 시작 버튼 클릭 시 `onStart` 호출

### 12.2 PlayingScene

역할:

* 3×3 퍼즐 보드 표시
* 숫자 타일 표시
* 빈 칸 표시
* 이동 횟수 표시
* 다시 시작 버튼 표시

이벤트:

* 타일 클릭 시 `onTileClick(tileIndex)` 호출
* 다시 시작 버튼 클릭 시 `onRestart` 호출

### 12.3 ClearScene

역할:

* 클리어 문구 표시
* 최종 이동 횟수 표시
* 다시 시작 버튼 표시

이벤트:

* 다시 시작 버튼 클릭 시 `onRestart` 호출

## 13. Pixi.js 렌더링 규칙

MVP에서는 이미지 에셋을 사용하지 않고 Pixi Graphics와 Text만 사용한다.

렌더링 기준:

```txt
Board       = 사각형 영역
Tile        = Pixi Graphics 사각형 + Pixi Text 숫자
Empty Cell  = 비어 있는 사각형 영역
Moves       = Pixi Text
Button      = Pixi Graphics + Pixi Text
```

타일 위치 계산:

```ts
const x = boardStartX + col * (TILE_SIZE + TILE_GAP);
const y = boardStartY + row * (TILE_SIZE + TILE_GAP);
```

타일 클릭을 위해 `eventMode`와 `cursor`를 설정한다.

```ts
tileContainer.eventMode = 'static';
tileContainer.cursor = 'pointer';
```

## 14. 타일 클릭 처리

타일 클릭 시 아래 순서로 처리한다.

```txt
1. 클릭한 타일 index를 확인한다.
2. 클릭한 타일이 빈 칸이면 무시한다.
3. 빈 칸 index를 찾는다.
4. 클릭한 타일과 빈 칸이 인접한지 확인한다.
5. 인접하지 않으면 무시한다.
6. 인접하면 타일과 빈 칸을 교환한다.
7. 이동 횟수를 1 증가시킨다.
8. 보드를 다시 렌더링한다.
9. 클리어 여부를 확인한다.
```

## 15. 다시 시작 처리

다시 시작 시 아래 작업을 수행한다.

```txt
1. 보드를 정답 상태로 초기화한다.
2. 보드를 랜덤 이동 방식으로 섞는다.
3. 이동 횟수를 0으로 초기화한다.
4. 상태를 playing으로 변경한다.
5. 게임 화면을 다시 렌더링한다.
```

## 16. 정리 규칙

`destroy()`에서는 아래 작업을 수행한다.

```txt
1. Pixi stage children 제거
2. 버튼과 타일 이벤트 리스너 정리
3. Pixi Application destroy
4. 내부 상태 초기화
```

주의사항:

* Scene 전환 시 이전 Scene container를 제거하거나 destroy한다.
* 이벤트 리스너가 중복 등록되지 않도록 한다.
* destroy는 여러 번 호출되어도 치명적인 에러가 나지 않게 작성한다.

## 17. 개발 우선순위

구현은 아래 순서로 진행한다.

```txt
1. Vite + TypeScript 프로젝트 생성
2. Pixi.js 화면 띄우기
3. BiniPuzzleGame 클래스 생성
4. ready / playing / clear 상태 추가
5. 정답 보드 데이터 생성
6. 3×3 보드 렌더링
7. 타일 클릭 이벤트 연결
8. 인접 타일 이동 로직 구현
9. 이동 횟수 표시
10. 클리어 판정 구현
11. 퍼즐 섞기 구현
12. 다시 시작 구현
13. Pixi 리소스 정리 확인
```

## 18. MVP 테스트 체크리스트

```txt
[ ] pnpm dev로 게임이 실행된다.
[ ] 시작 화면이 표시된다.
[ ] 시작 버튼으로 게임을 시작할 수 있다.
[ ] 3×3 퍼즐 보드가 표시된다.
[ ] 숫자 타일 1~8이 표시된다.
[ ] 빈 칸 1개가 표시된다.
[ ] 빈 칸과 인접한 타일을 클릭하면 이동한다.
[ ] 빈 칸과 인접하지 않은 타일을 클릭하면 이동하지 않는다.
[ ] 타일 이동 시 이동 횟수가 1 증가한다.
[ ] 퍼즐이 정답 상태가 되면 클리어 화면이 표시된다.
[ ] 클리어 화면에 최종 이동 횟수가 표시된다.
[ ] 다시 시작 버튼으로 새 퍼즐을 시작할 수 있다.
[ ] 재시작 후 이동 횟수가 0으로 초기화된다.
[ ] 콘솔에 치명적인 에러가 없다.
```
