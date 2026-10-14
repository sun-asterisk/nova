// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=2557-1779
// source=src/components/button/Button.tsx
// component=Button
//
// URL の fileKey は canonical ファイル固定。複製先への publish は
// figma.config.json の documentUrlSubstitutions が行うため、ここは書き換えない。
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Label');

const variant = instance.getEnum('Style', {
  Primary: 'primary',
  Secondary: 'secondary',
  Emphasis: 'emphasis',
  Plain: 'plain',
  Danger: 'danger',
});

const size = instance.getEnum('Size', {
  Large: 'large',
  Medium: 'medium',
  Small: 'small',
});

// Figma の State は CSS 疑似クラスで実装しているため、コードに渡すのは Disabled のみ。
// 他の値も漏らさず列挙する (未マッピングの値は undefined になる)。
const disabled = instance.getEnum('State', {
  Enabled: false,
  Focus: false,
  Hover: false,
  Active: false,
  Disabled: true,
});

// アイコンは children として前後に差し込む (Button.tsx の JSDoc 準拠)。
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
  example: figma.code`
<Button variant="${variant}" size="${size}"${disabled ? ' disabled' : ''}>
  ${prefixIconCode ? prefixIconCode : ''}${label}${suffixIconCode ? suffixIconCode : ''}
</Button>`,
  imports: ['import { Button } from "@sun-asterisk/nova"'],
  id: 'button',
  metadata: { nestable: true },
};
