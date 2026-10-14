// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=11853-12967
// source=src/components/dropdownMenu/DropdownMenu.tsx
// component=DropdownMenuItem
//
// Figma の "Menu Item" (COMPONENT_SET 11853:12967, Nova｜Master frame 12669:14631) はメニュー
// 項目 1 個分。メニュー全体 (パネル) は Figma 側でもコンポーネント化されていない (ガイドライン:
// 「Auto Layout フレーム内に Menu Item を配置して構築」) ため、項目単位でマッピングする。
// 区切り線 / グループ見出しは DropdownMenuGroupHeader.figma.ts (11846:2269)。
//
// 2026-10-07 Figma 同期で Props を作り直し (旧版は State = Enable/Active/Destructive という
// 存在しない値を参照していた):
// - Style = Action → <DropdownMenuItem>、Danger → destructive、
//   Option → <DropdownMenuCheckboxItem checked>（Checked を反映。Option ではアイコンを持たない —
//   ガイドライン「アイコンとオプションコントロールは互いに排他的」）
// - State は Disabled のみ Props (disabled)。Hover / Active は CSS で表現する
import figma from 'figma';

const instance = figma.selectedInstance;

const style = instance.getEnum('Style', {
  Action: 'action',
  Option: 'option',
  Danger: 'danger',
});

const disabled = instance.getEnum('State', {
  Enabled: false,
  Hover: false,
  Active: false,
  Disabled: true,
});

const label = instance.getString('Label');
const checked = instance.getBoolean('Checked');

// Figma の Support Text は description prop に対応する (DropdownMenu.tsx の JSDoc 準拠)。
let description;
if (instance.getBoolean('Support Text')) {
  const supportText = instance.findText('SupportText');
  if (supportText && supportText.type === 'TEXT') {
    description = supportText.textContent;
  }
}

// アイコンは INSTANCE_SWAP なので動的に解決する (決め打ちしない)。Option には Prefix アイコンがない。
const prefixIcon =
  style !== 'option' && instance.getBoolean('Prefix Icon')
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

// ショートカットキーは専用の DropdownMenuShortcut で表示する。
let shortcut;
if (instance.getBoolean('Shortcut Key')) {
  const shortcutText = instance.findText('⌘A');
  if (shortcutText && shortcutText.type === 'TEXT') {
    shortcut = shortcutText.textContent;
  }
}

const tag = style === 'option' ? 'DropdownMenuCheckboxItem' : 'DropdownMenuItem';
const attrs = `${style === 'option' ? ` checked={${checked ? 'true' : 'false'}}` : ''}${
  style === 'danger' ? ' destructive' : ''
}${disabled ? ' disabled' : ''}`;

// description を渡す場合、children にアイコンや Shortcut を混ぜると
// ラベル+説明のカラムに巻き込まれる (DropdownMenu.tsx の JSDoc)。
// そのため description ありのときは children をラベルのみに限定する。
const example = description
  ? figma.code`<${tag}${attrs} description="${description}">${label}</${tag}>`
  : figma.code`<${tag}${attrs}>${prefixIconCode ? prefixIconCode : ''}${label}${suffixIconCode ? suffixIconCode : ''}${shortcut ? figma.code`<DropdownMenuShortcut>${shortcut}</DropdownMenuShortcut>` : ''}</${tag}>`;

export default {
  example,
  imports: [
    'import { DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuShortcut } from "@sun-asterisk/nova"',
  ],
  id: 'dropdown-menu-item',
  metadata: { nestable: true },
};
