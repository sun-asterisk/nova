// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=17520-11839
// source=src/components/scrollbar/Scrollbar.tsx
// component=Scrollbar
//
// Figma "Scrollbar / Vertical" (COMPONENT_SET 17520:11839, Nova｜Master frame 11377:7179)。
// 以前の node 12471-14086 は Nova に存在せず、Dev Mode にコードが出なかった (2026-10-07 修正)。
// 横は ScrollbarHorizontal.figma.ts (12508:14528)。
// State (Enabled / Hover) は Track の pointer 状態で実装しているため Props には対応しない。
// スクロール対象の中身は利用側が children として渡す。
import figma from 'figma';

export default {
  example: figma.code`
<Scrollbar showHorizontal={false}>
  {children}
</Scrollbar>`,
  imports: ['import { Scrollbar } from "@sun-asterisk/nova"'],
  id: 'scrollbar',
  metadata: { nestable: false },
};
