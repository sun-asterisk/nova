// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=11017-20474
// source=src/components/modal/Modal.tsx
// component=Modal
//
// Modal は複合コンポーネント。Figma の 1 ノードが
// Modal / ModalContent / ModalHeader / ModalTitle / ModalBody / ModalFooter の組に対応する。
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', {
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
});

// Figma Style = Basic / + Status Icon / + Scrolling / + Status & Scrolling.
// "+ Scrolling" is just long content (the body scrolls by itself). The status
// variants carry a nested Status Icon (component set 8867:2716, all 5 values
// enumerated) → ModalContent `status` (2026-10-07).
const hasStatus = instance.getEnum('Style', {
  Basic: false,
  '+ Status Icon': true,
  '+ Scrolling': false,
  '+ Status & Scrolling': true,
});
const statusIcon = hasStatus ? instance.findInstance('Status Icon') : undefined;
const status =
  statusIcon && statusIcon.type === 'INSTANCE'
    ? statusIcon.getEnum('Status', {
        Info: 'info',
        Caution: 'caution',
        Danger: 'danger',
        Loading: 'loading',
        Success: 'success',
      })
    : undefined;

const title = instance.getString('Title Label');
// ModalHeader の showCloseButton は既定値 true (Modal.tsx)。Figma で Close Button を
// OFF にしたときは明示的に {false} を出力しないと、生成コードでは閉じるボタンが表示されてしまう
// (.claude/rules/figma-code-connect.md §3「boolean shorthand」)。ON のときは既定値どおりなので省略する。
const showCloseButton = instance.getBoolean('Close Button');

// Message は component property で characters を公開していないため、レイヤーから直接読む。
let message;
if (instance.getBoolean('├ Message')) {
  const messageText = instance.findText('Message');
  if (messageText && messageText.type === 'TEXT') {
    message = messageText.textContent;
  }
}

// フッターのボタンは Code Connect 済みの Button インスタンスなので動的に解決する。
// (ラベルや variant を決め打ちしない)
const actionButtons = instance.getBoolean('Action')
  ? instance.findConnectedInstances((node) => node.name === 'Button')
  : [];
// 存在しないボタンは undefined になるため、テンプレートでは必ず三項演算子でガードする
// (.claude/rules/figma-code-connect.md §3「undefined を裸で補間しない」)。
const firstButton = actionButtons[0]?.executeTemplate().example;
const secondButton = actionButtons[1]?.executeTemplate().example;
const thirdButton = actionButtons[2]?.executeTemplate().example;

// Figma の Style (+ Status Icon / + Scrolling) はコード側に対応する Props がないため
// マッピングしない。スクロールやステータスアイコンは利用側の Body 内容で表現する。

export default {
  example: figma.code`
<Modal>
  <ModalContent${size && size !== 'medium' ? ` size="${size}"` : ''}${status ? ` status="${status}"` : ''}>
    <ModalHeader${showCloseButton ? '' : ' showCloseButton={false}'}>
      <ModalTitle>${title}</ModalTitle>
    </ModalHeader>${
      message
        ? figma.code`
    <ModalBody>${message}</ModalBody>`
        : ''
    }${
      firstButton
        ? figma.code`
    <ModalFooter>${firstButton}${secondButton ? secondButton : ''}${thirdButton ? thirdButton : ''}</ModalFooter>`
        : ''
    }
  </ModalContent>
</Modal>`,
  imports: [
    'import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@sun-asterisk/nova"',
  ],
  id: 'modal',
  metadata: { nestable: false },
};
