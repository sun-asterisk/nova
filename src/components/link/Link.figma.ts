// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=16337-8408
// source=src/components/link/Link.tsx
// component=Link
//
// Figma "Link" (COMPONENT_SET 16337:8408, Nova｜Master frame 16399:10751)。追加 2026-10-07。
// - Size = Large / Medium / Small → size (large は既定値なので省略)
// - State: Hover は CSS (下線の太さ) で表現するため Props にしない。Disabled → disabled
// - Prefix / Suffix Icon (既定 OFF) → startAdornment / endAdornment。アイコンは INSTANCE_SWAP
//   なので動的に解決する (決め打ちしない)
// - href は Figma に存在しないため、利用側が補う前提でプレースホルダ "#" を出力する
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', {
  Large: 'large',
  Medium: 'medium',
  Small: 'small',
});

const disabled = instance.getEnum('State', {
  Enabled: false,
  Hover: false,
  Disabled: true,
});

const label = instance.getString('Label');

const prefixIcon = instance.getBoolean('Prefix Icon')
  ? instance.getInstanceSwap('└ Prefix Icon Instance')
  : null;
let prefixIconCode;
if (prefixIcon && prefixIcon.type === 'INSTANCE') {
  prefixIconCode = prefixIcon.executeTemplate().example;
}

const suffixIcon = instance.getBoolean('Suffix Icon')
  ? instance.getInstanceSwap('└ Suffix Icon Instance')
  : null;
let suffixIconCode;
if (suffixIcon && suffixIcon.type === 'INSTANCE') {
  suffixIconCode = suffixIcon.executeTemplate().example;
}

export default {
  example: figma.code`<Link href="#"${size && size !== 'large' ? ` size="${size}"` : ''}${
    disabled ? ' disabled' : ''
  }${prefixIconCode ? figma.code` startAdornment={${prefixIconCode}}` : ''}${
    suffixIconCode ? figma.code` endAdornment={${suffixIconCode}}` : ''
  }>${label}</Link>`,
  imports: ['import { Link } from "@sun-asterisk/nova"'],
  id: 'link',
  metadata: { nestable: true },
};
