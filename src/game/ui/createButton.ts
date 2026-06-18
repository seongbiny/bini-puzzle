import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_CONFIG } from '../constants';

interface ButtonOptions {
  label: string;
  width?: number;
  height?: number;
  onClick: () => void;
}

export function createButton({ label, width = 200, height = 52, onClick }: ButtonOptions): Container {
  const container = new Container();

  const bg = new Graphics();

  const drawNormal = () => {
    bg.clear();
    bg.roundRect(-width / 2, -height / 2, width, height, 10);
    bg.fill({ color: GAME_CONFIG.COLORS.BUTTON });
  };

  const drawHover = () => {
    bg.clear();
    bg.roundRect(-width / 2, -height / 2, width, height, 10);
    bg.fill({ color: GAME_CONFIG.COLORS.BUTTON_HOVER });
  };

  drawNormal();

  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: 'bold',
    fill: GAME_CONFIG.COLORS.BUTTON_TEXT,
  });

  const text = new Text({ text: label, style });
  text.anchor.set(0.5);

  container.addChild(bg, text);
  container.eventMode = 'static';
  container.cursor = 'pointer';

  container.on('pointerover', drawHover);
  container.on('pointerout', drawNormal);
  container.on('pointertap', onClick);

  return container;
}
