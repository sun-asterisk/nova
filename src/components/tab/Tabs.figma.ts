// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=2185-1731
// source=src/components/tab/Tabs.tsx
// component=TabsTrigger
//
// Figma の "Tab / Primary" はタブ 1 個分。コード側の TabsTrigger に対応する。
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Text');

// Focus / Hover / Active は CSS 疑似クラスと選択状態で表現するため、渡すのは Disabled のみ。
const disabled = instance.getEnum('State', {
  Enabled: false,
  Focus: false,
  Hover: false,
  Active: false,
  Disabled: true,
});

// Icon (先頭) と Badge (末尾) は Boolean で表示を切り替える子インスタンス。どちらも
// Code Connect 済み (アイコンは src/components/icons/*.figma.ts、2026-10-06 / Badge は
// Badge.figma.ts) なので、レイヤー名を決め打ちせず (§5) Code Connect の id で探して
// executeTemplate() で実コードにする (<IconFolder /> / <Badge … />)。以前はアイコンを
// 「固定のサンプル」として出力せず、Badge はレイヤー名 'Badge' で探していた。
// 非表示レイヤーが結果に含まれても Boolean で出し分けるので影響しない。
const connected = (match: (id: string) => boolean) => {
  const found = instance.findConnectedInstances((node) => match(node.codeConnectId() ?? ''));
  const first = found[0];
  return first && first.type === 'INSTANCE' ? first.executeTemplate().example : undefined;
};
const iconCode = instance.getBoolean('Icon')
  ? connected((id) => id.startsWith('icon-'))
  : undefined;
const badgeCode = instance.getBoolean('Badge') ? connected((id) => id === 'badge') : undefined;

export default {
  example: figma.code`<TabsTrigger value="${label}"${disabled ? ' disabled' : ''}>${iconCode ? iconCode : ''}${label}${badgeCode ? badgeCode : ''}</TabsTrigger>`,
  imports: ['import { TabsTrigger } from "@sun-asterisk/nova"'],
  id: 'tabs-trigger',
  metadata: { nestable: true },
};
