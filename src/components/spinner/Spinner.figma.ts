// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=16945-9204
// source=src/components/spinner/Spinner.tsx
// component=Spinner
//
// Figma "Spinner" (COMPONENT_SET 16945:9204, Nova｜Master frame 17037:213)。追加 2026-10-07。
// - Size = Small / Medium / Large → size (small は既定値なので省略)
// - Inverse = True → inverse
// 読み上げテキスト (label) は Figma にないため既定値 'Loading' のまま出力しない。
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
  example: figma.code`<Spinner${size && size !== 'small' ? ` size="${size}"` : ''}${
    inverse ? ' inverse' : ''
  } />`,
  imports: ['import { Spinner } from "@sun-asterisk/nova"'],
  id: 'spinner',
  metadata: { nestable: true },
};
