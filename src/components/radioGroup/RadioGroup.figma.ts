// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=17503-9702
// source=src/components/radioGroup/RadioGroup.tsx
// component=RadioGroupItem
//
// Figma の "Radio" はラジオ 1 個分。コード側の RadioGroupItem に対応する
// (選択状態は親の RadioGroup が value で制御するため、Value=True/False は Item の Props にはならない)。
//
// node-id は正式ファイル "Nova｜Master" (fSzxt8wKkXsn8fmxkPBUr2 = .env の FIGMA_FILE_KEY) の
// Radio component set 17503:9702 を指す (2026-10-06)。旧 node 985-1697 は canonical ファイルにしか
// 存在せず、正式ファイルでは node not found だった。fileKey 部分は documentUrlSubstitutions が
// publish 時に差し替える。構成は Checkbox.figma.ts と揃えている。
//
// Figma には 2 つのスキーマが存在する (2026-10-06 確認):
// - canonical ファイル (fSzxt8wKkXsn8fmxkPBUr2): State = Enabled/Focus/Disabled/Error, Label text
// - FIGMA_FILE_KEY ファイル ("Nova｜Master"): State = Enabled/Hover/Disabled,
//   Status = Default/Error, Value = True/False, Focus (boolean), Label (boolean) + Label text
// 旧マッピングは前者だけを想定しており、後者では State=Hover が undefined になり
// Error も検出されなかった。両スキーマの値を全て列挙して吸収する。
// Hover / Focus は CSS 疑似クラスで表現するため prop にしない (figma-code-connect.md §4)。
import figma from 'figma';

const instance = figma.selectedInstance;

// --- variant / disabled ---
// Disabled + Error は Figma 上 Disabled と同じ見た目。コードも disabled が error を
// 上書きするので、variant="error" と disabled を両方出しても描画は一致する。
const state = instance.getEnum('State', {
  Enabled: 'enabled',
  Focus: 'enabled',
  Hover: 'enabled',
  Disabled: 'disabled',
  Error: 'error',
});
const status = instance.getEnum('Status', { Default: 'default', Error: 'error' });
const isError = state === 'error' || status === 'error';
const disabled = state === 'disabled';

// --- value ---
// Radix の Item は value が必須で、同じ RadioGroup 内で一意でなければならない
// (重複するとキーボード操作・選択状態が壊れる)。以前は Show Label が OFF のとき undefined を
// 補間して value="undefined" を出力していた (.claude/rules/figma-code-connect.md §3)。
// Label text は TEXT プロパティなのでラベルの表示 ON/OFF に関係なく値を持つ — 常にそれを使い、
// 空文字のときだけ汎用のプレースホルダ 'option' にフォールバックする (決して undefined にしない)。
// 兄弟インスタンスの index は Code Connect のテンプレート API から取得できないため、
// グループ内での一意性は最終的に利用側で保証すること。
const labelText = instance.getString('Label text');
const value = labelText && labelText.trim() !== '' ? labelText : 'option';

// --- label (新スキーマのみ。Checkbox.figma.ts と同じく正式ファイルの Label を読む) ---
// RadioGroupItem には label prop がない (Checkbox / Switch と同じく、ラベルは兄弟要素)。
// prop を発明せず、Figma の見た目 (gap 8px, Body M, Text/Primary・無効時 Text/Disable) を
// <label> で包む合成として出力する。<label> で包むと Radix の <button role="radio"> に
// アクセシブルネームが付き、ラベルのクリックでも選択される (RadioGroup.figma.test.tsx で検証)。
const label = instance.getBoolean('Label') ? labelText : undefined;
const labelColor = disabled ? 'text-sds-text-disable' : 'text-sds-text-primary';

const item = `<RadioGroupItem${isError ? ' variant="error"' : ''} value="${value}"${disabled ? ' disabled' : ''} />`;

export default {
  example: label
    ? figma.code`<label className="flex items-center gap-sds-100 typo-body-m ${labelColor}">
  ${item}
  ${label}
</label>`
    : figma.code`${item}`,
  imports: ['import { RadioGroupItem } from "@sun-asterisk/nova"'],
  id: 'radio-group-item',
  metadata: { nestable: true },
};
