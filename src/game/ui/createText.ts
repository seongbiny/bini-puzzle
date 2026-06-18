import { Text, TextStyle } from 'pixi.js';
import type { TextStyleFontWeight } from 'pixi.js';
import { GAME_CONFIG } from '../constants';

interface TextOptions {
  content: string;
  fontSize?: number;
  color?: number;
  fontWeight?: TextStyleFontWeight;
  align?: 'left' | 'center' | 'right';
}

export function createText({
  content,
  fontSize = 20,
  color = GAME_CONFIG.COLORS.BODY_TEXT,
  fontWeight = 'normal',
  align = 'center',
}: TextOptions): Text {
  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize,
    fontWeight,
    fill: color,
    align,
  });

  const text = new Text({ text: content, style });
  text.anchor.set(0.5);
  return text;
}
