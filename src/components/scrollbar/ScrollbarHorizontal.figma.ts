// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=12508-14528
// source=src/components/scrollbar/Scrollbar.tsx
// component=Scrollbar
//
// Figma "Scrollbar / Horizontal" (COMPONENT_SET 12508:14528, Nova｜Master frame 11377:7179)。
// 以前は縦 (Scrollbar.figma.ts) のみで、横のスクロールバーを選択しても Dev Mode に
// コードが出なかった (2026-10-07)。State (Enabled / Hover) は Props に対応しない。
import figma from 'figma';

export default {
  example: figma.code`
<Scrollbar showVertical={false}>
  {children}
</Scrollbar>`,
  imports: ['import { Scrollbar } from "@sun-asterisk/nova"'],
  id: 'scrollbar-horizontal',
  metadata: { nestable: false },
};
