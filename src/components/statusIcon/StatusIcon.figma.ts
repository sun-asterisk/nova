// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=8867-2716
// source=src/components/statusIcon/StatusIcon.tsx
// component=StatusIcon
//
// Figma "Status Icon" (COMPONENT_SET 8867:2716, Nova｜Master frame 17234:11801)。追加 2026-10-07。
// - Status = Info / Caution / Danger / Loading / Success → status (必須 Prop なので常に出力)
// - Inverse = True → inverse
// 文字と並べる前提で装飾扱い (aria-hidden) が既定のため aria-label は出力しない。
import figma from 'figma';

const instance = figma.selectedInstance;

const status = instance.getEnum('Status', {
  Info: 'info',
  Caution: 'caution',
  Danger: 'danger',
  Loading: 'loading',
  Success: 'success',
});

const inverse = instance.getEnum('Inverse', {
  True: true,
  False: false,
});

export default {
  example: figma.code`<StatusIcon status="${status}"${inverse ? ' inverse' : ''} />`,
  imports: ['import { StatusIcon } from "@sun-asterisk/nova"'],
  id: 'status-icon',
  metadata: { nestable: true },
};
