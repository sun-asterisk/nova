// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=598-2713
// source=src/components/textareaField/TextareaField.tsx
// component=TextareaField
//
// Figma の "Text Area" はラベル・サポートテキスト・文字数カウンタを含む複合コンポーネントで、
// コード側では TextareaField が 1:1 で対応する (素の Textarea は内側の入力要素のみ)。
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Title Label');
const placeholder = instance.getString('Placeholder Text Label');

// Figma には 2 つのスキーマが存在する (2026-10-05 確認):
// - canonical ファイル (fSzxt8wKkXsn8fmxkPBUr2): State = Enabled/Focus/Filled/Disabled/Error
// - FIGMA_FILE_KEY ファイル ("Nova｜Master"): Status = Default/Error,
//   State = Enabled/Hover/Disabled, Filled = False/True (12 variant)
// 旧マッピングは前者だけを想定しており、後者では State=Hover が undefined
// (`variant="undefined"`) になり Error も検出されなかった。両スキーマの値を全て列挙する。
// Hover / Focus / Filled は CSS 疑似クラスと入力値で表現するため prop にしない (§4)。
const status = instance.getEnum('Status', { Default: 'default', Error: 'error' });
const state = instance.getEnum('State', {
  Enabled: 'enabled',
  Focus: 'enabled',
  Filled: 'enabled',
  Hover: 'enabled',
  Disabled: 'disabled',
  Error: 'error',
});

const isError = status === 'error' || state === 'error';
const variant = isError ? 'error' : 'default';
// 新スキーマでは Error と Disabled が同時に成立し得る (Status=Error, State=Disabled)。
const disabled = state === 'disabled';
const required = instance.getBoolean('Tag');

const supportTextLabel = instance.getBoolean('Support Text')
  ? instance.getString('Support Text Label')
  : undefined;

// Error 状態ではサポートテキストは表示されず、エラーメッセージだけが出る (両スキーマ共通。
// TextareaField も同じ挙動)。新スキーマのエラー文言は ErrorText レイヤー (プロパティではない)、
// 旧スキーマではサポートテキスト行そのものがエラーメッセージを表す (§3)。
const errorTextLayer = isError && status !== undefined ? instance.findText('ErrorText') : undefined;
const newSchemaError =
  errorTextLayer && errorTextLayer.type === 'TEXT' ? errorTextLayer.textContent : undefined;
const errorMessage = !isError
  ? undefined
  : status !== undefined
    ? newSchemaError
    : supportTextLabel;
const supportText = isError ? undefined : supportTextLabel;

// 文字数カウンタは maxLength が指定されたときだけ表示される。Figma の Letter Counter が
// 持つ Max の実値を読み取る (決め打ちの数値を出力しない)。レイヤー名は
// `_Text Area / Letter Counter` — 以前の `'Letter Counter'` 検索は一致せず、maxLength が
// 一度も出力されていなかった (2026-10-05)。旧名も念のため試す。
let maxLength;
if (instance.getBoolean('Letter Count')) {
  for (const layerName of ['_Text Area / Letter Counter', 'Letter Counter']) {
    const counter = instance.findInstance(layerName);
    if (counter && counter.type === 'INSTANCE') {
      const maxText = counter.findText('Max');
      if (maxText && maxText.type === 'TEXT') {
        maxLength = maxText.textContent;
        break;
      }
    }
  }
}

export default {
  example: figma.code`
<TextareaField
  variant="${variant}"
  label="${label}"
  placeholder="${placeholder}"${
    required
      ? figma.code`
  required`
      : ''
  }${
    supportText
      ? figma.code`
  supportText="${supportText}"`
      : ''
  }${
    errorMessage
      ? figma.code`
  error="${errorMessage}"`
      : ''
  }${
    maxLength
      ? figma.code`
  maxLength={${maxLength}}`
      : ''
  }${
    disabled
      ? figma.code`
  disabled`
      : ''
  }
/>`,
  imports: ['import { TextareaField } from "@sun-asterisk/nova"'],
  id: 'textarea-field',
  metadata: { nestable: true },
};
