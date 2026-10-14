// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=11846-2269
// source=src/components/dropdownMenu/DropdownMenu.tsx
// component=DropdownMenuLabel
//
// Figma の "Group Header" (COMPONENT 11846:2269) は区切り線とグループ見出しを 1 つに束ねた部品。
// コード側は DropdownMenuSeparator と DropdownMenuLabel を並べて表す (DropdownMenu.tsx の
// DropdownMenuLabel の JSDoc)。追加 2026-10-07。
// Divider / Group Label (既定 ON) が OFF のものは出力しない。見出しの文字列は Component Property
// ではないため、レイヤー "Label" から読む。
import figma from 'figma';

const instance = figma.selectedInstance;

const showDivider = instance.getBoolean('Divider');
const showLabel = instance.getBoolean('Group Label');

let label;
if (showLabel) {
  const labelText = instance.findText('Label');
  if (labelText && labelText.type === 'TEXT') {
    label = labelText.textContent;
  }
}

export default {
  example: figma.code`${showDivider ? figma.code`<DropdownMenuSeparator />` : ''}${
    showDivider && label ? '\n' : ''
  }${label ? figma.code`<DropdownMenuLabel>${label}</DropdownMenuLabel>` : ''}`,
  imports: ['import { DropdownMenuSeparator, DropdownMenuLabel } from "@sun-asterisk/nova"'],
  id: 'dropdown-menu-group-header',
  metadata: { nestable: true },
};
