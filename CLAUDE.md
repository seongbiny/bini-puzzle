# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Bini Puzzle — 3×3 숫자 슬라이딩 퍼즐 웹 미니게임.  
React 없이 **Vite + TypeScript + Pixi.js**만 사용한다.

## 명령어

```bash
pnpm dev       # 개발 서버 실행
pnpm build     # 빌드
pnpm preview   # 빌드 결과 미리보기
pnpm lint      # ESLint 실행
```

## 프로젝트 구조

```
src/
├── main.ts                  # 진입점 — #app 컨테이너에 BiniPuzzleGame 마운트
├── game/
│   ├── BiniPuzzleGame.ts    # 전체 게임 흐름 총괄 (상태, Scene 전환, 타일 클릭, 클리어 판정)
│   ├── constants.ts         # GAME_CONFIG (캔버스 크기, 타일 크기, 셔플 횟수 등)
│   ├── types.ts             # GameStatus, TileValue, Board, TilePosition
│   ├── board/
│   │   ├── boardUtils.ts    # 인접 여부 확인, 클리어 판정 순수 함수
│   │   └── shuffleBoard.ts  # 정답 상태에서 랜덤 이동 30회 → 항상 풀 수 있는 퍼즐
│   ├── scenes/
│   │   ├── ReadyScene.ts    # 시작 화면 (제목, 설명, 시작 버튼)
│   │   ├── PlayingScene.ts  # 게임 화면 (보드, 이동 횟수, 다시 시작 버튼)
│   │   └── ClearScene.ts   # 클리어 화면 (최종 이동 횟수, 다시 시작 버튼)
│   └── ui/
│       ├── createButton.ts  # Pixi Graphics + Text 버튼 팩토리
│       └── createText.ts    # Pixi Text 팩토리
└── shared/utils/
```

## 핵심 아키텍처

### 보드 데이터

보드는 1차원 배열 `Board = number[]`로 관리한다.  
`0`이 빈 칸이며, 정답 상태는 `[1, 2, 3, 4, 5, 6, 7, 8, 0]`.

```ts
// 인덱스 ↔ 행/열 변환
const row = Math.floor(index / BOARD_SIZE);
const col = index % BOARD_SIZE;
const index = row * BOARD_SIZE + col;
```

### 이동 가능 조건

```ts
const canMove = Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol) === 1;
```

### 게임 상태 전환

```
ready → (시작 버튼) → playing → (클리어) → clear
                  ↑_______ (다시 시작) _______↑
```

### Pixi.js 렌더링

이미지 에셋 없이 `Pixi.Graphics`(사각형)와 `Pixi.Text`(숫자·버튼)만 사용한다.  
타일 클릭 이벤트:

```ts
container.eventMode = 'static';
container.cursor = 'pointer';
```

Scene 전환 시 이전 Scene container를 반드시 `destroy()`한다.  
이벤트 리스너 중복 등록에 주의한다.

### BiniPuzzleGame 생명주기

```ts
await game.init(container);  // Pixi Application 생성, ReadyScene 표시
game.start();                // playing 상태로 전환
game.restart();              // 보드 초기화 + 셔플 + playing 전환
game.destroy();              // Pixi Application 및 이벤트 정리
```

## 주요 설계 제약

- React 사용 금지 (MVP 범위 외)
- 퍼즐 섞기는 반드시 정답 상태에서 시작해 랜덤 이동 방식으로만 생성 (항상 풀 수 있어야 함)
- `any` 타입 사용 금지
