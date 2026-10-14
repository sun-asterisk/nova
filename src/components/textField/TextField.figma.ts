// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=610-2971
// source=src/components/textField/TextField.tsx
// component=TextField
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Title Label');
const placeholder = instance.getString('Placeholder Text Label');

// Figma には 2 つのスキーマが存在する (2026-10-05 確認):
// - canonical ファイル (fSzxt8wKkXsn8fmxkPBUr2): State = Enabled/Focus/Filled/Disabled/Error (5 variant)
// - FIGMA_FILE_KEY ファイル ("Nova｜Master", fSzxt8wKkXsn8fmxkPBUr2):
//   Status = Default/Error, State = Enabled/Hover/Disabled, Filled = False/True (12 variant)
// 旧マッピングは前者だけを想定しており、後者では State=Hover が undefined になり
// (`variant="undefined"`)、Error も検出されなかった。両スキーマの値を全て列挙して吸収する。
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
const disabled = state === 'disabled';
const required = instance.getBoolean('Tag');

const supportTextLabel = instance.getBoolean('Support Text')
  ? instance.getString('Support Text Label')
  : undefined;

// 新スキーマ (Status あり): Error 状態でもサポートテキストは表示されたまま、その下に
// 独立した Error Message (ErrorText レイヤー、プロパティではない) が出る。コードも
// 2026-10-05 から同じ挙動 (supportText と error を両方描画)。
// 旧スキーマ: Error 状態ではサポートテキスト行そのものがエラーメッセージを表していたので、
// その値を `error` に渡す (§3「同名ではなく同じ描画挙動の prop に」)。
const errorTextLayer = isError && status !== undefined ? instance.findText('ErrorText') : undefined;
const newSchemaError =
  errorTextLayer && errorTextLayer.type === 'TEXT' ? errorTextLayer.textContent : undefined;
const errorMessage = !isError
  ? undefined
  : status !== undefined
    ? newSchemaError
    : supportTextLabel;
const supportText = isError && status === undefined ? undefined : supportTextLabel;

// Prefix Icon / Suffix Icon (Boolean) は "TextField" フレーム内のアイコンインスタンスの
// 表示切り替え。INSTANCE_SWAP プロパティはないが、デザイナーがインスタンスを差し替えれば
// 別のアイコンになる。アイコンは src/components/icons/*.figma.ts で Code Connect 済み
// (2026-10-06) なので、レイヤー名を決め打ちせず (§5) Code Connect 済みのアイコンインスタンスを
// 探して executeTemplate() で実コード (<IconMail /> 等) にする。
// 非表示レイヤーが検索結果に含まれるかどうかに依存しないよう、prefix は先頭・suffix は末尾を取る。
const isIcon = (node: { codeConnectId(): string | null }) =>
  (node.codeConnectId() ?? '').startsWith('icon-');
const fieldIcons = instance.findConnectedInstances(isIcon, { path: ['TextField'] });
const iconCode = (index: number) => {
  const icon = fieldIcons[index];
  return icon && icon.type === 'INSTANCE' ? icon.executeTemplate().example : undefined;
};
const startIcon = instance.getBoolean('Prefix Icon') ? iconCode(0) : undefined;
const endIcon = instance.getBoolean('Suffix Icon') ? iconCode(fieldIcons.length - 1) : undefined;

export default {
  example: figma.code`
<TextField
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
    startIcon
      ? figma.code`
  startAdornment={${startIcon}}`
      : ''
  }${
    endIcon
      ? figma.code`
  endAdornment={${endIcon}}`
      : ''
  }${
    disabled
      ? figma.code`
  disabled`
      : ''
  }
/>`,
  imports: ['import { TextField } from "@sun-asterisk/nova"'],
  id: 'text-field',
  metadata: { nestable: true },
};
