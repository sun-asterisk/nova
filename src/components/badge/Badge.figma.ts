// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=1065-507
// source=src/components/badge/Badge.tsx
// component=Badge
//
// node 1065:507 は正式ファイル "Nova｜Master" (fSzxt8wKkXsn8fmxkPBUr2) にも存在する Badge
// component set (Style = Count / Dot / Label / Error, Text)。2026-10-07 に再確認済み。
import figma from 'figma';

const instance = figma.selectedInstance;

const variant = instance.getEnum('Style', {
  Count: 'count',
  Dot: 'dot',
  Label: 'label',
  Error: 'error',
});

// 表示テキスト: Figma の `Text` プロパティは Count のテキストレイヤーにしか
// バインドされていない。Label のテキストはレイヤー "New" に直接書かれており
// (プロパティ参照なし — 2026-10-07 に Figma で確認)、デザイナーはこのレイヤーを
// 直接上書きする。以前は Label でも `Text` (既定値 "99") を読んでいたため、"New" と
// 表示された Label バッジが `label="99"` を出力していた。Label はレイヤーの実際の
// 文字列を読む。
const labelLayer = variant === 'label' ? instance.findText('New') : undefined;
const text =
  variant === 'label'
    ? labelLayer && labelLayer.type === 'TEXT'
      ? labelLayer.textContent
      : undefined
    : variant === 'count'
      ? instance.getString('Text')
      : undefined;

// Dot は表示テキストを持たないため、アクセシブルネームは aria-label だけが頼り
// (名前のない Dot は Badge.tsx が console.warn する a11y ギャップ)。Figma にはその情報が
// ないので、IconButton.figma.ts と同じく置き換え前提の説明的なプレースホルダーを出す
// (空にするとスクリーンリーダーが何も読まないバッジになる)。Error は組み込みの名前を持つ。
export default {
  example: figma.code`<Badge variant="${variant}"${text ? figma.code` label="${text}"` : ''}${
    variant === 'dot' ? ' aria-label="Describe the status"' : ''
  } />`,
  imports: ['import { Badge } from "@sun-asterisk/nova"'],
  id: 'badge',
  metadata: { nestable: true },
};
