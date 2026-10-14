// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=3700-7301
// source=src/components/button/Button.tsx
// component=Button
//
// Figma の "Icon Button" コンポーネントセット (3700:7301) を `<Button iconOnly>` に対応付ける。
// figma-sync.config.json の方針どおり、Icon Button は独立した React コンポーネントではなく
// Button の prop (`iconOnly`) で表現する (2026-10-05, /component Button Figma sync)。
// 対応付けるノードはコンポーネントセット本体。Button 本体は Button.figma.ts (2557:1779) が担当する。
//
// URL の fileKey は canonical ファイル固定。複製先への publish は
// figma.config.json の documentUrlSubstitutions が行うため、ここは書き換えない。
import figma from 'figma';

const instance = figma.selectedInstance;

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
// canonical ファイルには State=Focus がまだ存在する (FIGMA_FILE_KEY 側のファイルでは
// Focus は別の Boolean プロパティに移動済み) — どちらでも undefined にならないよう全値を列挙する。
// Focus Boolean (Focus Ring レイヤー) も :focus-visible で実装済みのためマッピングしない。
const disabled = instance.getEnum('State', {
  Enabled: false,
  Focus: false,
  Hover: false,
  Active: false,
  Disabled: true,
});

const icon = instance.getInstanceSwap('Icon');
let iconCode;
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example;
}

// Figma の Icon Button には表示テキストもラベル用プロパティもない。iconOnly は
// アクセシブルネームが必須 (accessibility.md §5.2) なので、置き換え前提の aria-label を出力する
// (空文字にすると名前のないボタンになるため、あえて説明的なプレースホルダーにしている)。
export default {
  example: figma.code`
<Button iconOnly variant="${variant}" size="${size}" aria-label="Describe the action"${disabled ? ' disabled' : ''}>
  ${iconCode ? iconCode : ''}
</Button>`,
  imports: ['import { Button } from "@sun-asterisk/nova"'],
  id: 'icon-button',
  metadata: { nestable: true },
};
