# Implementation Patterns

Sun Design System の React コンポーネント実装で繰り返し使うパターン集。新規コンポーネント実装時、まずここを参照する。

## 1. ディレクトリ構成

```
src/components/<name>/           # kebab-case でない。camelCase
├── <Name>.tsx                   # PascalCase
├── <Name>.styles.ts
├── <Name>.stories.tsx
└── index.ts
```

`index.ts` はエクスポート専用:

```ts
export { <Name> } from './<Name>';
// 複数コンポーネント (DropdownMenu 等) の場合:
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  // ...
} from './DropdownMenu';
```

公開後、`src/components/index.ts` に追加:
```ts
export * from './<name>';
```

## 2. Styles (tailwind-variants)

### 2.1 単一要素コンポーネント (Button 型)

variant × size の組み合わせ。`base` + `variants` + `defaultVariants`。

```ts
import { tv } from 'tailwind-variants';

export const <name>Styles = tv({
  base: `
    cursor-pointer inline-flex items-center justify-center
    focus:outline focus:outline-2 focus:outline-border-focus
  `,
  variants: {
    variant: {
      primary: `bg-surface-primary text-text-on-surface hover:bg-surface-primary-hover`,
      secondary: `border border-border-strong bg-white text-text-primary`,
    },
    size: {
      small: `p-xs gap-xxs rounded-m h-8 typo-mobile-eg-label-s`,
      medium: `p-s gap-xxs rounded-m h-10 typo-mobile-eg-label-m`,
      large: `p-m gap-xs rounded-m h-12 typo-mobile-eg-label-l`,
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'small',
  },
});
```

### 2.2 複合コンポーネント (DatePicker, DropdownMenu 型)

`slots` で子要素のスタイルを分離。

```ts
import { tv } from 'tailwind-variants';

export const <name>Styles = tv({
  slots: {
    container: `
      w-[312px] rounded-l bg-surface-base p-m
      shadow-level-5
    `,
    header: 'flex items-center justify-between mb-m',
    daySelected: `
      size-10 rounded-m text-center typo-mobile-eg-body-m
      bg-surface-primary text-text-on-surface cursor-pointer
    `,
  },
});
```

**使用側:**
```tsx
const styles = <name>Styles();

<div className={cn(styles.container(), className)}>
  <div className={styles.header()}>...</div>
  <button className={styles.daySelected()}>1</button>
</div>
```

### 2.3 任意値 `[...]` のルール

**原則:** トークンで表現できないときのみ。使うときは必ず理由コメント。

```ts
// OK: トークンがない固定寸法 (DatePicker の幅)
container: `w-[312px] /* fixed calendar width, no matching token */`,

// NG: トークンがあるのに任意値
shadow: `shadow-[0_4px_6px_...]`,  // → shadow-level-5
size: `size-[40px]`,                 // → size-10
```

## 3. Component Body

### 3.1 Radix ラッパーパターン

Dialog / DropdownMenu / Tooltip / Tabs / Switch / Checkbox / RadioGroup は **必ず Radix を使う**。

```tsx
import { cn } from '@/utils';
import * as Primitive from '@radix-ui/react-dropdown-menu';
import { type ComponentProps, forwardRef } from 'react';
import { <name>Styles } from './<Name>.styles';

const styles = <name>Styles();

const <Name>Root = Primitive.Root;
const <Name>Trigger = Primitive.Trigger;

const <Name>Content = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Primitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(styles.content(), className)}
      {...props}
    />
  </Primitive.Portal>
));
<Name>Content.displayName = '<Name>Content';

export { <Name>Root, <Name>Trigger, <Name>Content };
```

### 3.2 独自実装パターン (ステートフル)

Radix にない場合のみ (DatePicker, カスタム ScrollArea 等)。

```tsx
import { cn } from '@/utils';
import { type ComponentProps, forwardRef, useCallback, useMemo, useState } from 'react';
import { <name>Styles } from './<Name>.styles';

type <Name>Props = ComponentProps<'div'> & {
  // Domain props
  value?: Date;
  onChange?: (value: Date) => void;

  // i18n props — 必須パターン
  weekdays?: string[];
  clearLabel?: string;
  todayLabel?: string;
};

const DEFAULT_WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const styles = <name>Styles();

export const <Name> = forwardRef<HTMLDivElement, <Name>Props>(
  (
    {
      value,
      onChange,
      weekdays = DEFAULT_WEEKDAYS,
      clearLabel = 'クリア',
      todayLabel = '今日',
      className,
      ...rest
    },
    ref,
  ) => {
    // state / memo / callbacks ...
    return (
      <div ref={ref} className={cn(styles.container(), className)} {...rest}>
        {weekdays.map((w) => <th key={w}>{w}</th>)}
        <button>{clearLabel}</button>
      </div>
    );
  },
);
<Name>.displayName = '<Name>';
```

### 3.3 必須パターン

- **`forwardRef`** で ref を受け取る
- **`ComponentProps<'div'>` や `ComponentProps<typeof Primitive.Content>`** で HTML/Primitive 属性を継承
- **`cn(styles.xxx(), className)`** で外部 className をマージ
- **`displayName`** を必ず設定
- **`...rest` or `...props`** で残り属性を渡す

## 4. i18n ハードコード回避の判定

コンポーネント内に文字列リテラルを書く前に、以下を自問:

| 文字列の種類 | 扱い |
|---|---|
| ユーザーに見える日本語 (「クリア」「今日」「検索」「OK」等) | props 化必須 |
| 曜日名・月名・日付フォーマット | props 化必須 |
| aria-label のデフォルト (「閉じる」「前の月」等) | props 化推奨 |
| エラーメッセージのデフォルト | props 化必須 |
| 内部的な data attribute (`data-state="open"` 等) | ハードコード OK |
| CSS クラス名 | ハードコード OK |

**props 名の慣例:**
- 単一ラベル: `<domain>Label` (例: `clearLabel`, `todayLabel`, `closeLabel`)
- 配列: `<domain>s` (例: `weekdays`, `monthNames`)
- aria: `<action>AriaLabel` (例: `prevMonthAriaLabel`)

デフォルト値はモジュールトップの `const DEFAULT_*` で定義し、props の default assignment で使う。

## 5. Accessibility チェック

| コンポーネント種別 | 必須 a11y |
|---|---|
| Button (text あり) | focus outline, disabled 対応 |
| icon-only Button (children が icon のみ) | `aria-label` 必須 |
| Modal | Radix Dialog が自動対応。Escape close, focus trap |
| DropdownMenu | Radix DropdownMenu が自動対応。矢印キー |
| Form 系 | `<label htmlFor>` または aria-labelledby |
| カスタム widget (DatePicker 等) | 矢印キー操作、`role="grid"` 等の ARIA |

## 6. Storybook テンプレート

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { <Name> } from './<Name>';

const meta: Meta<typeof <Name>> = {
  title: 'Components/<Name>',
  component: <Name>,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof <Name>>;

export const Default: Story = {
  args: { /* ... */ },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-m">
      <<Name> variant="primary" />
      <<Name> variant="secondary" />
    </div>
  ),
};

export const CustomLocale: Story = {
  args: {
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    clearLabel: 'Clear',
    todayLabel: 'Today',
  },
};
```

## 7. よくある間違いと対処

| 間違い | 正しい書き方 |
|---|---|
| `shadow-[0_4px_6px_...]` | `shadow-level-5` |
| `size-[40px]` | `size-10` |
| `bg-[#ff2200]` | `bg-surface-emphasis` |
| `text-[14px]` | `typo-mobile-ja-body-m` (utility) |
| `rounded-[4px]` | `rounded-s` |
| `const WEEKDAYS = ['日',...]` モジュール内 | `weekdays?: string[]` props |
| `<button>クリア</button>` | `<button>{clearLabel}</button>` + default prop |
| Radix がある機能を独自実装 | Radix をラップ |
| `className` を受け取らない | `cn(styles.root(), className)` |
| `displayName` 設定し忘れ | `<Name>.displayName = '<Name>';` |
