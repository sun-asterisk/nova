// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=8248-329
// source=src/components/switch/Switch.tsx
// component=Switch
//
// node 8248:329 は正式ファイル "Nova｜Master" (fSzxt8wKkXsn8fmxkPBUr2) にも存在する Switch
// component set (2026-10-07 確認): Value = True/False, Size = Large/Medium,
// State = Enabled/Disabled/Hover, Focus (boolean)。
import figma from 'figma';

const instance = figma.selectedInstance;

// オン/オフのプロパティ名は正式ファイルでは `Value`。以前のマッピングは `Active` を読んでいたため
// 正式ファイルでは常に undefined になり、`checked={undefined}` を出力していた (2026-10-07 修正)。
// 旧ファイルの `Active` も念のため列挙し、どちらも無い場合は false にする (決して undefined にしない)。
const value = instance.getEnum('Value', { True: 'true', False: 'false' });
const active = instance.getEnum('Active', { True: 'true', False: 'false' });
const checked = value ?? active ?? 'false';

const size = instance.getEnum('Size', {
  Large: 'large',
  Medium: 'medium',
});

// Hover / Focus は CSS 疑似クラスで実装しているため、コードに渡すのは Disabled のみ。
const disabled = instance.getEnum('State', {
  Enabled: false,
  Disabled: true,
  Hover: false,
});

// Switch は表示テキストを持たないが、何を切り替えるかのアクセシブルネームが必須
// (Figma のガイドライン「必ずラベルを付けます」)。Figma にはラベル文字列のプロパティがないため、
// IconButton.figma.ts と同じく置き換え前提の説明的なプレースホルダーを出す。
export default {
  example: figma.code`<Switch size="${size}" checked={${checked}} aria-label="Describe the setting"${disabled ? ' disabled' : ''} />`,
  imports: ['import { Switch } from "@sun-asterisk/nova"'],
  id: 'switch',
  metadata: { nestable: true },
};
