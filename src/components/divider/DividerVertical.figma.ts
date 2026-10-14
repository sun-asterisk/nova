// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=2692-1756
// source=src/components/divider/Divider.tsx
// component=Divider
//
// Figma には Divider が 2 つの独立した COMPONENT として存在する (Nova｜Master, frame 2006:1755):
// "Divider / Horizontal" (977:1950 — Divider.figma.ts) と "Divider / Vertical" (2692:1756 — この
// ファイル)。以前は横のみマッピングしており、縦の Divider を選択しても Dev Mode にコードが
// 出なかった (2026-10-07)。どちらもプロパティを持たない。縦は Divider の orientation prop で表す。
// flexItem (flex レイアウトで高さいっぱいに伸ばす) は利用側のレイアウト次第なので出力しない。
import figma from 'figma';

export default {
  example: figma.code`<Divider orientation="vertical" />`,
  imports: ['import { Divider } from "@sun-asterisk/nova"'],
  id: 'divider-vertical',
  metadata: { nestable: true },
};
