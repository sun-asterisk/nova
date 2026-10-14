// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=16982-11702
// source=src/components/progressBar/ProgressBar.tsx
// component=ProgressBar
//
// Figma "Progress Bar" (COMPONENT_SET 16982:11702, Nova｜Master frame 17121:11722)。追加 2026-10-07。
// - Size = Small / Medium / Large → size (small は既定値なので省略)
// - Inverse = True → inverse
// 進捗量は Figma 側ではインスタンスの右パディングで表現され、Component Property ではないため
// value は既定コンポーネントの見た目 (240px 中 144px = 60%) に合わせたプレースホルダを出力する。
// aria-label は ProgressBar に必須 (何が進んでいるかの名前) なのでプレースホルダを出力する。
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', {
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
});

const inverse = instance.getEnum('Inverse', {
  False: false,
  True: true,
});

export default {
  example: figma.code`<ProgressBar value={60} aria-label="処理の進捗"${
    size && size !== 'small' ? ` size="${size}"` : ''
  }${inverse ? ' inverse' : ''} />`,
  imports: ['import { ProgressBar } from "@sun-asterisk/nova"'],
  id: 'progress-bar',
  metadata: { nestable: true },
};
