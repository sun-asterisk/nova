# Theme Verification (Light / Dark) — 定義と必須手順

> **このファイルが「dark/light verification」の唯一の定義。** workflow C (component-implement)・
> D (component-modify)・Figma 同期・A (design-system-update) のどれであっても、コンポーネントの見た目に
> 触れたら以下 4 層をすべて実行し、**結果を数値で報告する**。1 つでも省略したら「dark mode 未検証」と書く。
> Light だけ確認して PASS と書くのは禁止。

## なぜ 4 層なのか

light だけの検証では dark 固有の問題（色のハードコード、light 固定の assert、Figma の Dark 値とのずれ）を
見逃す。1 つの層だけでは他の層の欠陥を検知できない:

| 層 | 検知できる | 検知できない |
|---|---|---|
| 1. Figma ↔ トークン (Light/Dark 値) | `global.css` の dark 値が Figma とずれている | 実際にどのクラスが当たっているか |
| 2. 描画 (storybook-dark) | 色のハードコード、light 固定の assert、背景のない scoped 領域、dark でのコントラスト不足 (描画される状態のみ) | Figma の値そのものの誤り、hover/active など描画されない状態 |
| 3. トークン解決型の assert | 「このパーツは token X を使う」の回帰 (両テーマで) | Figma との値の一致 |
| 4. 全状態コントラスト | hover/active/error を含む全 variant のテキスト・コントラスト (両モード) | コード側の配線ミス |

## 層 1 — Figma ↔ トークン (Light / Dark)

```bash
pnpm figma:theme-check <fileKey> <nodeId>        # 例: <fileKey> 2002-1624
pnpm figma:theme-check <fileKey> <nodeId> --json # 機械可読
```

`scripts/figma/component-theme-check.mjs` (read-only、要 `FIGMA_ACCESS_TOKEN`):

- `<nodeId>` はドキュメントフレーム・コンポーネントセット・コンポーネントのどれでもよい。内部の
  **全 variant** に bind された色変数を集め、Figma の Light / Dark 値と `scripts/global.css` の
  light ブロック (`:root, [data-theme="light"]`) / dark ブロック (`[data-theme="dark"]`) を突き合わせる。
- `MISMATCH` / `MISSING` → **コード側を勝手に直さない。** `design-foundation.md` §6 (Report drift, don't
  silently correct) に従い、`pnpm run figma:pull` の要否を含めて報告・承認を取る。
- `UNVERIFIED (remote alias)` → 別ライブラリファイルの変数への alias で、このファイルの API からは解決
  できない。推測で値を埋めず、そのまま報告する。
- **CI ゲートではない** (Figma トークンが必要)。ローカルで実行し、出力を完了報告に貼る。

## 層 2 — 描画 (light と dark の両プロジェクト)

```bash
pnpm exec vitest run --project storybook      src/components/<dir>
pnpm exec vitest run --project storybook-dark src/components/<dir>   # 必須
```

`storybook-dark` (`.storybook/vitest.setup.dark.ts`) は全 story を `data-theme="dark"` で再実行し、
play() と axe (`a11y.test: 'error'`、color-contrast 含む) を通す。**両方 PASS でなければ PASS ではない。**
CI (`browser-tests` の dark ステップ) と `test:full` にも組み込み済み。

story の規則 (dark パスで強制される):
- story 内で色をハードコードしない (`#666`, `text-red-600`, `bg-[#…]`) — 必ず `-sds-` トークン。
- play() で色を固定値で assert しない — `tokenColor(element, '--color-sds-…')`
  (`.storybook/tokenColor.ts`) と比較する。要素自身のテーマ領域 / portal 内で解決される。
  **`waitFor()` の中で呼ばない** (probe 要素の追加が DOM 変更として waitFor を再実行させ、無限ループになる)。
- `ThemeProvider scoped` / `data-theme` 領域は背景を描かない — `bg-sds-background-base` 等を与える。
- 本質的に light 専用の assert だけ `tags: ['light-only']` + 理由コメントで除外 (最後の手段)。

## 層 3 — トークン解決型の回帰テスト

色・枠線・フォーカスリング・placeholder・hover など Figma 由来の見た目を変更/追加したら、
**light と dark の両方で** 計測するテストを置く:

```ts
describe.each(['light', 'dark'] as const)('… (%s)', (theme) => {
  // <div data-theme={theme}> の中で描画し、getComputedStyle(el).X === tokenColor(el, '--color-sds-…')
});
```

- unit プロジェクトで実寸・実色を測るときは `import '../../App.css'` が必要 (既定ではスタイル未読込)。
- hover は unit プロジェクトで計測可能 (`userEvent.hover` → `:hover` 成立)。`transition-*` がある要素は
  `await Promise.all(el.getAnimations().map((a) => a.finished))` で確定値を読む。
- `<input>` / `<textarea>` 等の void 要素でも `tokenColor` は親要素で解決する。
- CLAUDE.md §23 に従い、実装を壊して **light と dark の両方で** 失敗することを確認する。
- 参考実装: `src/components/input/Input.figma.test.tsx`, `src/components/textarea/Textarea.figma.test.tsx`,
  `Button.stories.tsx` の `InteractionDarkTheme`。

## 層 4 — 全状態コントラスト (Light / Dark)

層 1 のスクリプトの「2. Text contrast」が、全 variant の可視テキストをその最も近い祖先の塗りに対して
両モードで計算する (半透明の塗りは下地に合成)。axe は描画された状態しか見ないため、hover / active /
Figma 上の error 例などはここでしか検知できない。

- `FAIL` → **トークンを勝手に変えない。** Figma 側 (デザイナー判断) の問題として、値・variant 名・比率を
  コンポーネント spec の Known Limitations に記録して報告する。
- disabled variant は WCAG 1.4.3 で除外 (`EXEMPT`)。

## 完了報告に必ず書くこと

```text
Theme (light/dark):
  1. Figma↔token: <N>/<N> 変数 Light OK, Dark OK  (mismatch: …, unverified: …)
  2. storybook / storybook-dark: <a>/<a> / <b>/<b>
  3. token-resolved tests: <file> (light+dark), mutations: <n> caught
  4. contrast: <n> FAIL (列挙) / exempt <m>
```

## 既知の結果 (`pnpm figma:theme-check <fileKey> <node>`)

| コンポーネント | トークン | コントラスト FAIL (Figma の値の問題・未修正) |
|---|---|---|
| Button / Icon Button (`2002-1579`) | 23/23 OK | Emphasis Hover light 3.16、Emphasis Active dark 3.50、Secondary/Plain Active light 4.16 |
| Text Field (`2002-1624`) | 17/17 OK | Placeholder on Subtle Hover light 4.12 |
| Text Area (`3122-1746`) | 16/16 OK | Placeholder on Subtle Hover light 4.12 |
