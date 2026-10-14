// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=11864-19567
// source=src/components/datePicker/DatePicker.tsx
// component=DatePicker
//
// Figma "Date Picker" (COMPONENT_SET 11864:19567, Nova｜Master frame 11864:19561) はカレンダー
// パネルそのもの。ガイドライン上はテキストフィールドの直下に出るポップオーバーなので
// <DatePicker> にマッピングする (常時表示のパネルとして使う場合は同じ Props で <Calendar>。
// ただし Calendar に Apply はない)。追加 2026-10-07。
//
// - Style = Single / Range → mode (single は既定値なので省略)
// - Date Picker Actions (既定 ON) → OFF のとき actions={false}
// - -> Today Button / -> Clear Button (既定 ON) → OFF のものだけ actions={{ today: false }} 等。
//   適用 (Apply) ボタンは Figma に表示切替がなく常に表示されるので出力しない
//   (.claude/rules/figma-code-connect.md §3「boolean shorthand は既定値が false のときだけ」)
// - Backward / Forward (月送りボタンの表示) は個別に隠す Props がないので出力しない
//   (react-day-picker の hideNavigation は両方まとめて隠すだけで、片側だけの表現にならない)
import figma from 'figma';

const instance = figma.selectedInstance;

const mode = instance.getEnum('Style', {
  Single: 'single',
  Range: 'range',
});

const showActions = instance.getBoolean('Date Picker Actions');
const showToday = instance.getBoolean('-> Today Button');
const showClear = instance.getBoolean('-> Clear Button');

const hiddenActions = [!showToday ? 'today: false' : '', !showClear ? 'clear: false' : '']
  .filter(Boolean)
  .join(', ');

const actionsProp = !showActions
  ? ' actions={false}'
  : hiddenActions
    ? ` actions={{ ${hiddenActions} }}`
    : '';

export default {
  example: figma.code`<DatePicker${mode === 'range' ? ' mode="range"' : ''}${actionsProp} />`,
  imports: ['import { DatePicker } from "@sun-asterisk/nova"'],
  id: 'date-picker',
  metadata: { nestable: false },
};
