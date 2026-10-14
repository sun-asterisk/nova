// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=16593-8749
// source=src/components/avatar/Avatar.tsx
// component=Avatar
//
// Figma "Avatar" (COMPONENT_SET 16593:8749, Nova｜Master frame 16609:8640)。追加 2026-10-07。
// - Size → size (medium はコードの既定値なので省略。Figma の既定は XSmall)
// - Type = Image → src / alt (Figma に画像 URL・名前はないためプレースホルダ)、
//   Initial → initial (Initial テキスト)、Icon → icon (INSTANCE_SWAP を動的に解決)
// - Status (既定 OFF) → status。値はネストした "_Avatar / Status" の Color から読む
//   (XSmall はステータス非対応 — コード側も表示しない)
// - Ring (既定 OFF) → ring
// - Focus はフォーカス時の見た目のみ (Avatar 自体は操作を持たない) なので出力しない
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', {
  XSmall: 'xsmall',
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
  XLarge: 'xlarge',
});

const type = instance.getEnum('Type', {
  Image: 'image',
  Initial: 'initial',
  Icon: 'icon',
});

const initial = type === 'initial' ? instance.getString('Initial') : undefined;

let iconCode;
if (type === 'icon') {
  const icon = instance.getInstanceSwap('└ Icon Instance');
  if (icon && icon.type === 'INSTANCE') {
    iconCode = icon.executeTemplate().example;
  }
}

let status;
if (instance.getBoolean('Status')) {
  const statusInstance = instance.findInstance('Status');
  if (statusInstance && statusInstance.type === 'INSTANCE') {
    status = statusInstance.getEnum('Color', {
      Online: 'online',
      Away: 'away',
      Busy: 'busy',
      Offline: 'offline',
    });
  }
}

const ring = instance.getBoolean('Ring');

export default {
  example: figma.code`<Avatar${size && size !== 'medium' ? ` size="${size}"` : ''}${
    type === 'image' ? ' src="/path/to/photo.jpg" alt="ユーザー名"' : ''
  }${initial ? ` initial="${initial}"` : ''}${iconCode ? figma.code` icon={${iconCode}}` : ''}${
    status ? ` status="${status}"` : ''
  }${ring ? ' ring' : ''} />`,
  imports: ['import { Avatar } from "@sun-asterisk/nova"'],
  id: 'avatar',
  metadata: { nestable: true },
};
