// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=17503-9619
// source=src/components/checkbox/Checkbox.tsx
// component=Checkbox
import figma from 'figma';

const instance = figma.selectedInstance;

// node-id は正式ファイル "Nova｜Master" (fSzxt8wKkXsn8fmxkPBUr2 = .env の FIGMA_FILE_KEY) の
// Checkbox component set 17503:9619 を指す (2026-10-06, ユーザー確認済み)。旧 node 2787-2560 は
// canonical ファイルにしか存在せず、正式ファイルでは node not found だった。fileKey 部分は
// documentUrlSubstitutions が publish 時に差し替える。
//
// Figma には 2 つのスキーマが存在する (2026-10-06 確認):
// - canonical ファイル (fSzxt8wKkXsn8fmxkPBUr2): Type = Checked/Unchecked/Indeterminate,
//   State = Enabled/Focus/Desabled/Error ("Desabled" は Figma 側の誤記。完全一致が必要なのでそのまま)
// - FIGMA_FILE_KEY ファイル ("Nova｜Master", fSzxt8wKkXsn8fmxkPBUr2, component set 17503:9619):
//   State = Enabled/Hover/Disabled, Status = Default/Error, Value = True/False,
//   Indeterminate = False/True, Focus (boolean), Label (boolean) + Label text
// 旧マッピングは前者だけを想定しており、後者では State=Hover が undefined になり、
// Error / Indeterminate / Value も検出されなかった。両スキーマの値を全て列挙して吸収する。
// Hover / Focus は CSS 疑似クラスで表現するため prop にしない (figma-code-connect.md §4)。

// --- checked ---
const type = instance.getEnum('Type', {
  Checked: 'true',
  Unchecked: 'false',
  Indeterminate: "'indeterminate'",
});
const value = instance.getEnum('Value', { True: true, False: false });
const indeterminate = instance.getEnum('Indeterminate', { True: true, False: false });
const checked = type ?? (indeterminate ? "'indeterminate'" : value ? 'true' : 'false');

// --- variant / disabled ---
// Disabled + Error は Figma 上 Disabled と同じ見た目。コードも disabled が error を
// 上書きするので、variant="error" と disabled を両方出しても描画は一致する。
const state = instance.getEnum('State', {
  Enabled: 'enabled',
  Focus: 'enabled',
  Hover: 'enabled',
  Desabled: 'disabled',
  Disabled: 'disabled',
  Error: 'error',
});
const status = instance.getEnum('Status', { Default: 'default', Error: 'error' });
const isError = state === 'error' || status === 'error';
const disabled = state === 'disabled';

// --- label (新スキーマのみ) ---
// Checkbox には label prop がない (RadioGroup / Switch と同じく、ラベルは兄弟要素)。
// prop を発明せず、Figma の見た目 (gap 8px, Body M, Text/Primary・無効時 Text/Disable) を
// <label> で包む合成として出力する。<label> で包むと Radix の <button role="checkbox"> に
// アクセシブルネームが付き、ラベルのクリックでも切り替わる (Checkbox.figma.test.tsx で検証)。
const label = instance.getBoolean('Label') ? instance.getString('Label text') : undefined;
const labelColor = disabled ? 'text-sds-text-disable' : 'text-sds-text-primary';

const checkbox = `<Checkbox${isError ? ' variant="error"' : ''} checked={${checked}}${disabled ? ' disabled' : ''} />`;

export default {
  example: label
    ? figma.code`<label className="flex items-center gap-sds-100 typo-body-m ${labelColor}">
  ${checkbox}
  ${label}
</label>`
    : figma.code`${checkbox}`,
  imports: ['import { Checkbox } from "@sun-asterisk/nova"'],
  id: 'checkbox',
  metadata: { nestable: true },
};
