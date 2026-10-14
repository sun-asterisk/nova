// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=16062-1651
//
// Figma "Icon / Empty" (Icon Master, Nova｜Master) is a blank 24x24 placeholder
// rectangle — "no icon" — not a real icon, so there is no IconEmpty component
// in code. When a designer swaps it into an icon slot (Button prefix/suffix,
// Icon Button, TextField adornment), the nested template renders nothing, so
// the generated code has no icon instead of a fake placeholder (decided
// 2026-10-06). Hand-written; scripts/figma/generate-icon-code-connect.mjs
// skips this placeholder.
import figma from 'figma';

export default {
  example: figma.code``,
  imports: [],
  id: 'icon-empty',
  metadata: { nestable: true },
};
