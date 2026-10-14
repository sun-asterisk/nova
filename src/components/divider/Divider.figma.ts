// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=977-1950
// source=src/components/divider/Divider.tsx
// component=Divider
import figma from 'figma';

// Figma の Divider はプロパティを持たない単一 COMPONENT。
// orientation / flexItem は利用側のレイアウトで決まるため、既定値のまま出力する。

export default {
  example: figma.code`<Divider />`,
  imports: ['import { Divider } from "@sun-asterisk/nova"'],
  id: 'divider',
  metadata: { nestable: true },
};
