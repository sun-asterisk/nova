// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=9639-4097
// source=src/components/tooltip/Tooltip.tsx
// component=TooltipContent
//
// Figma の "Tooltip" は吹き出し本体のみ (トリガーを含まない) なので、
// 対応するのは TooltipContent。トリガーは利用側が <Tooltip> / <TooltipTrigger> で囲む。
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');

const side = instance.getEnum('Placement', {
  Top: 'top',
  Bottom: 'bottom',
  Right: 'right',
  Left: 'left',
});

export default {
  example: figma.code`<TooltipContent side="${side}">${label}</TooltipContent>`,
  imports: ['import { TooltipContent } from "@sun-asterisk/nova"'],
  id: 'tooltip-content',
  metadata: { nestable: true },
};
