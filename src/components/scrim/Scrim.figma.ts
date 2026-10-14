// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=10930-5994
// source=src/components/scrim/Scrim.tsx
// component=Scrim
//
// Figma "Scrim" (component 10930:5994, frame 10930:5489 in the official file
// Nova｜Master) — a property-less full-viewport backdrop. Mapped to the public
// `Scrim` (2026-10-07). Inside a Modal you do not render it yourself:
// ModalContent renders the same scrim (ModalOverlay) automatically.
import figma from 'figma';

export default {
  example: figma.code`<Scrim onClick={() => {}} />`,
  imports: ['import { Scrim } from "@sun-asterisk/nova"'],
  id: 'scrim',
  metadata: { nestable: false },
};
