# Nova — Sun\* Design System

Nova は、1,000 以上のプロダクト開発で培ったノウハウをもとにした Sun\* のデザインシステムです。Figma ライブラリと、それを実装した React コンポーネントライブラリで構成されています。

> **English:** Nova is the design system by Sun\*. This repository contains the React component library (`@sun-asterisk/nova`), its Storybook, and the documentation site. Components are built on Radix UI and ship with a compiled stylesheet and CSS-variable design tokens, so Tailwind CSS is not required. The documentation is currently available in Japanese.

[ドキュメント](https://nova.sun-asterisk.com) ・ [コンポーネント一覧](https://nova.sun-asterisk.com/components/) ・ [Storybook](https://nova.sun-asterisk.com/storybook-view/) ・ [npm](https://www.npmjs.com/package/@sun-asterisk/nova)

## 特長

- **Figma と同じ仕様** — Figma ライブラリ（Nova）のバリエーション・状態・トークンに合わせて実装しています。Figma の Dev Mode では、[Code Connect](https://nova.sun-asterisk.com/guide/10-code-connect/) により実際のコードが表示されます
- **アクセシビリティ** — Radix UI をベースに、キーボード操作・フォーカス表示・ARIA 属性を WCAG 2.1 AA を目安に整えています
- **Tailwind 不要** — コンパイル済みのスタイルシートと CSS 変数のデザイントークンで動きます。Tailwind CSS v4 を使っている場合は、トークンをユーティリティとしても使えます
- **ライト / ダークテーマ** — `data-theme` 属性と CSS 変数だけで切り替わります。サーバーレンダリングでも、テーマのちらつきを防げます
- **Next.js App Router 対応** — パッケージのルートもすべてのサブパスも、Server Component から import できます
- **TypeScript** — 型定義を同梱しています

## コンポーネント

| カテゴリ       | コンポーネント                                                                                |
| -------------- | --------------------------------------------------------------------------------------------- |
| アクション     | Button, Link, DropdownMenu                                                                    |
| フォーム       | Input, TextField, Textarea, TextareaField, Checkbox, RadioGroup, Switch, DatePicker, Calendar |
| 表示           | Avatar, Badge, Divider, StatusIcon, Tabs, Scrollbar, Icon                                     |
| フィードバック | Modal, Scrim, Snackbar, Tooltip, Spinner, ProgressBar                                         |
| テーマ         | ThemeProvider                                                                                 |

各コンポーネントの使い方は[コンポーネント一覧](https://nova.sun-asterisk.com/components/)、Props と動作は [Storybook](https://nova.sun-asterisk.com/storybook-view/) で確認できます。

## 動作要件

| 項目              | 要件                                          |
| ----------------- | --------------------------------------------- |
| React / React DOM | 18 または 19                                  |
| TypeScript        | 5 以上を推奨                                  |
| Tailwind CSS      | 任意（v4 以上）。コンポーネントの表示には不要 |

## インストール

```bash
pnpm add @sun-asterisk/nova
# または
npm install @sun-asterisk/nova
# または
yarn add @sun-asterisk/nova
```

## クイックスタート

アプリのエントリーポイント（Vite なら `main.tsx`、Next.js ならルートの `app/layout.tsx`）で、スタイルシートを **1 回だけ** 読み込みます。CSS は自動では注入されないため、この import を忘れるとコンポーネントがスタイルなしで表示されます。

```ts
import '@sun-asterisk/nova/styles';
```

あとはコンポーネントを import して使います。

```tsx
import { Button, TextField } from '@sun-asterisk/nova';

export function App() {
  return (
    <form>
      <TextField label="メールアドレス" placeholder="name@example.com" />
      <Button variant="primary" type="submit">
        保存する
      </Button>
    </form>
  );
}
```

パッケージのルートからも、コンポーネントごとのサブパス（`@sun-asterisk/nova/button` など）からも import できます。どちらも tree-shaking されます。

## テーマ

`ThemeProvider` でライト / ダーク / システム設定を切り替えます。

```tsx
import type { ReactNode } from 'react';
import { ThemeProvider } from '@sun-asterisk/nova/theme-provider';

export function Root({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultMode="system">{children}</ThemeProvider>;
}
```

サーバーレンダリング時のちらつき防止（`getThemeScript`）、画面の一部だけのテーマ、ブランドカラーの上書きは[テーマのガイド](https://nova.sun-asterisk.com/guide/09-theming/)を参照してください。

## ドキュメント

| ガイド                                                                             | 内容                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [インストールと基本の使い方](https://nova.sun-asterisk.com/guide/08-installation/) | サブパスの一覧、Next.js App Router、ルーターのリンク、TypeScript、Tailwind との併用 |
| [テーマとカスタマイズ](https://nova.sun-asterisk.com/guide/09-theming/)            | ライト / ダーク、テーマ領域、ブランドカラー、デザイントークン                       |
| [Figma Code Connect](https://nova.sun-asterisk.com/guide/10-code-connect/)         | Figma の Dev Mode に表示されるコードと、対応しているコンポーネント                  |
| [フォームとの組み合わせ](https://nova.sun-asterisk.com/guide/11-forms/)            | React Hook Form などとの組み合わせ方、エラー表示                                    |

## リポジトリの構成

```
src/          React コンポーネントライブラリ（npm パッケージの中身）
.storybook/   Storybook の設定
test/         公開 API の型テストと、単体テストの設定
docs/         ドキュメントサイト（Astro Starlight）と、コンポーネントの仕様書（docs/components/）
scripts/      デザイントークンの生成、品質チェックのスクリプト
.claude/      Claude Code のスキル・コマンド・ルール
CLAUDE.md     設計と開発のルール
design.md     デザイントークンと見た目のルール
```

## 開発

Node.js 22 以上と pnpm が必要です。pnpm のバージョンは `package.json` の `packageManager` に従います（`corepack enable` で揃えられます）。

```bash
pnpm install
pnpm storybook      # Storybook（http://localhost:6006）
pnpm build          # ライブラリのビルド（dist/）
pnpm typecheck      # 型チェック
pnpm test:api       # 公開 API の型テスト
pnpm test:package   # パッケージの検証（exports・型・tree-shaking。pnpm build の後に実行）
pnpm docs:dev       # ドキュメントサイトの開発サーバー（Storybook の埋め込みは空）
pnpm build:all      # Storybook を含むドキュメントサイトのビルド
```

ビルドしたドキュメントサイトは `pnpm -C docs preview` で確認できます。

### Claude Code で開発する場合

このリポジトリには、Nova のルールに沿ってコンポーネントを作る・直すための [Claude Code](https://claude.com/claude-code) のスキルとコマンドが入っています。

- `/component <Name>` — 既存コンポーネントとの重複、Figma、API、アクセシビリティを確認してから、新規作成や修正を進めます
- `/test <Name>` — 単体テスト、Storybook、API、パッケージなどの品質チェックをまとめて実行します

ルールは `CLAUDE.md` と `.claude/rules/` にあります。

## バージョンとリリース

[セマンティック バージョニング](https://semver.org/lang/ja/)に従います。互換性のない変更はメジャーバージョンで行います。

このリポジトリは、Sun\* 社内で開発している Nova をリリースごとに公開しているものです。各コミットが 1 つのリリースに対応し、タグ（`vX.Y.Z`）はパッケージのバージョンと一致します。

## Pull Request について

**Pull Request は受け付けていません。** このリポジトリの内容はリリースのたびに書き出し直されるため、直接の変更は上書きされます。

## License

[MIT](./LICENSE) © Sun Asterisk
