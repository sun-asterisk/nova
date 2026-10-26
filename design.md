# Sun* Design System Nova — DESIGN.md

Sun* Design System Nova の React コンポーネントライブラリ (`@sun-asterisk/nova`) のデザインシステム仕様。AI コーディングエージェント (Claude Code / Cursor / Copilot 等) がこのファイルを読めば、追加のプロンプトなしで一貫した UI を生成できることを目的とする。

- **技術スタック**: React 18/19, TypeScript 5.8, Tailwind CSS v4, tailwind-variants, Radix UI
- **トークン駆動**: すべての色・間隔・角丸は CSS 変数 (`--color-*`, `--spacing-*`, `--radius-*`) 経由で参照する。16 進値をハードコードしない。
- **対応言語**: 日本語 / 英語 (CJK + Latin 混植対応)

---

## 1. Visual Theme & Atmosphere

**キーワード**: Calm / Precise / Neutral-first

Sun Design System は「業務アプリケーションのためのニュートラルな土台」を提供する。派手な色彩や装飾ではなく、情報の優先順位とコンテンツそのものを主役にするために、ベースは低彩度のニュートラル、アクセントとしてブランドカラー (Sun Red) を差し込む構成を取る。

- **Primary 表面** は赤ではなく **ダークニュートラル (Neutral 700)** を使用する。「業務用途で長時間見続けても疲れない」「赤を多用すると警告に見える」ためのトレードオフ。
- **強調の赤 (`red-500` = #dd2305)** は `surface-emphasis` / `text-emphasis` / `border-emphasis` としてのみ登場する。CTA の強調、重要ステータスに限定。ブランドの Sun Red (`brand-sun-red` = #ff2200) は UI の色ではなくブランド識別用 (§2.1)。
- **角丸は控えめ** (基本 `rounded-sds-200` = 8px)。カジュアルすぎず、鋭角すぎない中間値を選択。
- **影は最小限**。フローティング要素 (Modal, Snackbar, DropdownMenu, DatePicker) のみ使用する。
- **情報密度は中〜高**。モバイル/デスクトップ両対応で、業務データを詰め込めるように余白を取りすぎない。

---

## 2. Color Palette & Roles

### 2.1 Brand Colors (Primitive)

| Name | Hex | 用途 |
|---|---|---|
| `brand-sun-red` | `#ff2200` | ブランド識別 (ロゴ、ランディング) |
| `brand-sun-dark-red` | `#ad0c00` | 濃い赤が必要な特殊ケース |
| `brand-sun-yellow` | `#fdba05` | ハイライト、マーク |
| `brand-sun-gold` | `#b69256` | 特別表記 |
| `brand-sun-gray` | `#f7f7f7` | 背景ライトグレー |
| `brand-sun-white` | `#ffffff` | 基本背景 |

### 2.2 Semantic Color Tokens

UI 実装では **必ず Semantic トークンを使う**。Primitive (`--color-red-500` 等) の直接参照は禁止。

| Token | Value | 用途 |
|---|---|---|
| `surface-base` | white | ページ背景 |
| `surface-primary` | neutral-700 (#434343) | Primary ボタン・Primary 表面 |
| `surface-primary-hover` | neutral-600 | Primary hover |
| `surface-primary-active` | neutral-900 | Primary active |
| `surface-secondary` | gray-300 | Secondary 表面 |
| `surface-secondary-hover` | gray-100 | Secondary hover |
| `surface-emphasis` | red-500 (#dd2305) | CTA 強調 |
| `surface-emphasis-hover` | red-400 | Emphasis hover |
| `surface-emphasis-active` | red-600 | Emphasis active |
| `surface-danger` | red-500 | 破壊的操作の塗り |
| `surface-success` | green-500 | 成功状態の塗り |
| `surface-info` | blue-500 | 情報状態の塗り |
| `surface-caution` | yellow-600 | 注意状態の塗り |
| `surface-disabled` | neutral-50 | 無効要素の塗り |
| `background-base` | white | ページ背景 |
| `background-container` | neutral-25 (#fafafa) | セクション・カード背景 |
| `background-container-inverse` | neutral-800 | ダークモード用コンテナ |
| `background-emphasis` | red-50 | 強調背景 (淡) |
| `background-danger` | red-100 | 危険背景 (淡) |
| `background-success` | green-50 | 成功背景 (淡) |
| `background-info` | blue-50 | 情報背景 (淡) |
| `background-caution` | yellow-50 | 注意背景 (淡) |
| `background-scrim` | black-alpha-600 | Modal オーバーレイ |
| `text-primary` | neutral-800 (#333333) | 本文メイン |
| `text-secondary` | neutral-600 (#5a5a5a) | 補助テキスト |
| `text-emphasis` | red-500 | 強調テキスト・リンクホバー |
| `text-link` | blue-600 | リンク |
| `text-placeholder` | neutral-500 | プレースホルダー |
| `text-disable` | neutral-400 | 無効テキスト |
| `text-danger` / `text-success` / `text-info` / `text-caution` | red-600 / green-700 / blue-700 / yellow-700 | ステータステキスト |
| `text-on-surface` | white | Primary/Emphasis surface 上のテキスト |
| `border-basic` | neutral-300 | 基本ボーダー |
| `border-weak` | neutral-100 | 弱いボーダー |
| `border-disable` | neutral-100 | 無効要素のボーダー |
| `border-strong` | neutral-800 | Secondary ボタン用の強いボーダー |
| `border-focus` | blue-600 | フォーカスリング |
| `border-emphasis` / `border-danger` / `border-success` / `border-info` / `border-caution` | 各ステータス色 | ステータスボーダー |
| `icon-primary` | neutral-800 | 主要アイコン |
| `icon-secondary` | neutral-600 | 補助アイコン |
| `icon-disable` | neutral-400 | 無効アイコン |

`text-tertiary` は廃止済み（2026.7.27）。補助テキストには `text-secondary` を使う。

### 2.3 Status Role Mapping

| Role | Surface | Text | Border | 用途 |
|---|---|---|---|---|
| Default | `surface-base` | `text-primary` | `border-basic` | 通常状態 |
| Emphasis | `surface-emphasis` | `text-on-surface` | `border-emphasis` | CTA, 強調 |
| Danger | `background-danger` | `text-danger` | `border-danger` | エラー, 削除 |
| Success | `background-success` | `text-success` | `border-success` | 成功, 完了 |
| Info | `background-info` | `text-info` | `border-info` | 案内, ヒント |
| Caution | `background-caution` | `text-caution` | `border-caution` | 警告, 注意 |

---

## 3. Typography Rules

### 3.1 Font Families

Figma の Typography フレーム自体に「フォントは原則としてシステムフォントを適用する。実装時は総称フォント `system-ui` を指定する」という指示があるため、デフォルトは特定の Web フォントではなく **OS ネイティブのシステムフォントスタック**。Figma 上で見える `Noto Sans JP` はプレビュー用の表示であり、そのままバンドルすべきフォント名ではない。Nova は Inter を使わない（欧文・数字も含めて Noto Sans JP に統一）。

```css
--font-family-sds-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

全 `typo-*` ユーティリティはこの1つの変数だけを参照する（日本語/英語で別々のフォント変数を持たない — 言語別の書体切り替えは廃止）。フォントファイルの読み込みが一切不要になり、FOUT/追加ネットワークリクエストが発生しない。

**ブランドフォント（Noto Sans JP）を使いたい場合**は、コンポーネントライブラリの追加 CSS を1行 import するだけでよい:

```ts
import '@sun-asterisk/nova/styles';
import '@sun-asterisk/nova/branded-fonts.css'; // optional
```

`branded-fonts.css`（`src/branded-fonts.css`）が Google Fonts から Noto Sans JP を読み込み（欧文・和文の両方に使う）、`--font-family-sds-sans` を上書きする — 手動での `<link>` タグや `@font-face` 記述は不要。Noto Sans JP は SIL Open Font License (OFL) 1.1 で商用利用無料。

**Figma との既知の差分（2026-10-13 時点）**: Figma 側には Inter がまだ残っている — Typography フレームの Typeface 欄（「欧文・数字: Inter」）と、Label/En 系のテキストスタイル（変数 `Font family/English` = Inter。Badge・DatePicker・Tab・DropdownMenu が使用）。**実装では Inter を使わない**（既定は `system-ui`、ブランドフォントは欧文・和文とも Noto Sans JP）。Dev Mode の CSS 欄に `font-family: Inter` と表示されても、コードに書き写さないこと。Figma 側は今後のライブラリ更新で Noto Sans JP に統一する予定で、更新したら Figma の更新履歴（Overview のスライド 7）とドキュメントサイトの更新情報に載せ、この注記を削除する。

### 3.2 Type Scale

タイポグラフィは **(role) × (size)** の 2 軸で定義される Utility クラス (`typo-*`) として提供される。EN/JA は統一済み（`-eg-`/`-ja-` セグメントは廃止）。Heading のみ Desktop/Mobile の区別が残る。

**Role**: `heading` (ページ見出し) / `title` (セクション見出し) / `label` (UI ラベル・ボタン) / `body` (本文)

| Utility クラス | Size | Line-height | Weight | 用途 |
|---|---|---|---|---|
| `typo-heading-desktop-h1` | 36px | 50.4px (1.4) | 700 | ページタイトル |
| `typo-heading-desktop-h2` | 32px | 44.8px (1.4) | 700 | セクション大見出し |
| `typo-heading-desktop-h3` | 24px | 33.6px (1.4) | 700 | セクション見出し |
| `typo-heading-mobile-h1` | 28px | 39.2px (1.4) | 700 | ページタイトル (モバイル) |
| `typo-heading-mobile-h2` | 24px | 33.6px (1.4) | 700 | セクション大見出し (モバイル) |
| `typo-heading-mobile-h3` | 20px | 28px (1.4) | 700 | セクション見出し (モバイル) |
| `typo-title-l` | 24px | 36px (1.5) | 700 | ヒーロータイトル |
| `typo-title-m` | 20px | 30px (1.5) | 700 | 大きなカードタイトル |
| `typo-title-s` | 18px | 28.8px (1.6) | 700 | カードタイトル |
| `typo-label-l-bold` / `typo-label-l-regular` | 16px | 16px (1.0) | 700 / 400 | 大ボタン・フォームラベル |
| `typo-label-m-bold` / `typo-label-m-regular` | 14px | 14px (1.0) | 700 / 400 | 標準ボタン |
| `typo-label-s-bold` / `typo-label-s-regular` | 12px | 12px (1.0) | 700 / 400 | キャプション・小ボタン |
| `typo-body-l` | 16px | 25.6px (1.6) | 400 | 本文 (大) |
| `typo-body-m` | 14px | 22.4px (1.6) | 400 | 本文 (標準) |
| `typo-body-s` | 12px | 21px (1.75) | 400 | 本文 (小)・ヘルパーテキスト |

一次ソース: `scripts/figma-variables.json` の `"typography - roles"`（Figma Foundations の Typography フレーム）。`pnpm run tokens:sync` を実行すれば、Figma 側の変更（新サイズ追加、Weight 変更等）がこのテーブルへ自動反映される — 手動でこのテーブルを編集する必要はない。

#### 3.2.1 旧スキーム（廃止済み）

以前の **(device) × (language) × (role) × (size)** の 4 軸スキーム（`typo-desktop-ja-heading-h1` 等）は廃止され、`scripts/design-tokens.tokens.json`・`global.css` から削除済み。`typo-{device}-{lang}-{role}-{size}` 形式のクラスはもう生成されないので使わないこと。

### 3.3 CJK Typography Rules

- **Line-height**: 日本語は 1.4〜1.75 (行長に応じて)。Latin 専用の 1.2〜1.4 より広めを標準とする。
- **Letter-spacing**: 日本語本文は `tracking-normal` (0)。ラベル・見出しは `tracking-tight` (-0.01em) を許容。Latin-only 大見出しは `tracking-tight` 推奨。
- **禁則処理 (Kinsoku Shori)**: CSS で `line-break: strict; word-break: normal; overflow-wrap: anywhere;` を推奨。句読点ぶら下げが必要な場面では `hanging-punctuation: allow-end;` を検討。
- **OpenType**: 日本語本文では `font-feature-settings: 'palt' off;` を基本 (等幅でレイアウト破綻を防ぐ)。長文見出しで詰めたい場合のみ `'palt' on`。

---

## 4. Component Stylings

すべてのコンポーネントは `tailwind-variants` (`tv()`) で定義され、`@/utils` の `cn()` で合成する。Radix UI が使われるコンポーネントは必ず Radix の primitive をラップする。

### 4.1 Button (`src/components/button/`)

**Variants** (5): `primary` | `secondary` | `emphasis` | `plain` | `danger`
**Sizes** (3): `small` (h=32px) | `medium` (h=40px) | `large` (h=48px)

| Variant | Enabled | Hover | Active | Disabled |
|---|---|---|---|---|
| primary | bg neutral-700 / text white | bg neutral-600 | bg neutral-900 | bg neutral-50 / text neutral-400 |
| secondary | border neutral-800 / bg white / text neutral-800 | bg black-alpha-50 | bg white | bg neutral-50 |
| emphasis | bg red-500 / text white | bg red-400 | bg red-600 | bg neutral-50 |
| plain | transparent / text neutral-800 | bg black-alpha-50 | bg black-alpha-50 | text neutral-400 |
| danger | border red-600 / bg white / text red-600 | bg red-100 | bg red-100 | bg neutral-50 |

- Radius: `rounded-sds-200` (8px) ※全サイズ共通
- Gap (icon + text): small/medium=4px, large=8px
- Padding: small=8px, medium=12px, large=16px
- Focus: `outline-2 outline-sds-border-focus` (blue-600)

### 4.2 Input / TextField / Textarea / TextareaField

- **Input** (`textField/TextField.tsx` 内で使用): 単体のテキスト入力
- **TextField**: Input + Label + HelperText + ErrorMessage のフォームフィールド
- **Textarea** / **TextareaField**: 複数行版
- Border: 通常 `border-basic`、focus 時 `border-focus` + outline 2px
- Disabled: `bg-sds-surface-disabled`, `text-sds-text-disable`

### 4.3 Form Controls

- **Checkbox** (Radix Checkbox): 未チェック white / チェック時 `surface-primary`
- **RadioGroup** (Radix RadioGroup): 同上、形状は円
- **Switch** (Radix Switch): OFF `surface-secondary` / ON `surface-primary`, thumb は white

### 4.4 Feedback & Overlay

- **Tooltip** (Radix Tooltip): bg `background-container-inverse` (neutral-800), text white, radius `rounded-sds-100`, shadow `level-3` (Figma の Tooltip に適用されている effect style は "Elevation/Lv.3")
- **Snackbar**: 背景は状態によらず `background-container-inverse` の1色、shadow `level-4`。状態 (`variant`: info / success / warning / error / loading) はアイコンで示す。表示位置は `showSnackbar()` の `position` (既定 `bottom-right`)
- **Modal** (Radix Dialog): `background-scrim` オーバーレイ + 中央白カード (radius `rounded-sds-400` = 16px, shadow `level-5`)
- **DropdownMenu** (Radix DropdownMenu): white bg, radius `rounded-sds-200`, shadow `level-2` (Figma "Elevation Lv.2"), item 間 4px, 各 item は hover で `surface-subtle-hover`（Danger も同じ。赤い背景は使わない）（Active は §7.2 の通り `surface-subtle`）。`surface-button-secondary-hover` という名前のトークンは存在しない（使うと hover/focus の背景色が描画されない）

### 4.5 Navigation & Structure

- **Tabs** (Radix Tabs): 選択タブは `text-primary` + 下線 `border-strong` (2px)、非選択は `text-secondary`
- **Divider**: `border-weak` の horizontal/vertical ライン
- **Badge**: status 別の小ラベル (pill または rounded)
- **Scrollbar** (`Scrollbar` / `ScrollBarArea`): Radix ScrollArea ベースのスクロール領域 (縦/横)
- **DatePicker**: 月送りカレンダー。Selected は `surface-primary`、Today は `text-emphasis` + bold

### 4.6 Interactive State Ordering

すべてのインタラクティブ要素は以下の優先順で状態を持つ:

```
disabled > active > focus-visible > hover > default
```

Tailwind では後方のセレクタが優先されるため、クラス順序はこの並びを守る。

---

## 5. Layout Principles

### 5.1 Spacing Scale

すべての余白は以下の数値スケールのみを使用する（Tailwind では `p-sds-200`、`gap-sds-150` のように書く）。中間値 (`p-[18px]` 等) は禁止。文字キー (`xxs`/`xs`/`s`/`m`/`l`/`xl` 等) は 2026.04.10 に廃止済みで、CSS は生成されない。

| Token | px (1rem=16px) | 用途 |
|---|---|---|
| `sds-25` | 2 | 極小の隙間 |
| `sds-50` | 4 | アイコンとテキストの隙間 |
| `sds-100` | 8 | ボタン内パディング / 小コンポーネント間 |
| `sds-150` | 12 | フォーム要素間 |
| `sds-200` | 16 | カード内パディング / 中コンポーネント間 |
| `sds-300` | 24 | セクション内余白 |
| `sds-400` | 32 | セクション間 |
| `sds-500` | 40 | 大きなセクション間 |
| `sds-600` | 48 | ページ上下余白 |
| `sds-800` | 64 | ヒーローセクション |
| `sds-1000` | 80 | ランディング余白 |

### 5.2 Radius Scale

Tailwind では `rounded-sds-200` のように書く。文字キー (`radius-xs`/`s`/`m`/`l`/`xl`) は 2026.04.10 に廃止済み。

| Token | Value | 用途 |
|---|---|---|
| `sds-0` | 0 | 明示的に角なし |
| `sds-50` | 2px | 極小要素 |
| `sds-100` | 4px | Tooltip |
| `sds-200` | 8px | **既定**。Button, Input, DropdownMenu |
| `sds-300` | 12px | 中間 |
| `sds-400` | 16px | Modal |
| `sds-600` | 24px | 特殊パネル |
| `sds-full` | 9999px | 円形, pill |

### 5.3 Grid & Container

- **Max page width**: デスクトップは 1440px コンテナを基本とする。
- **Page padding**: desktop 24px / mobile 16px (左右)。
- **Content width**: ダッシュボード系は flex/grid で 12-col、記事系は max-width 720px センター寄せ。
- **Stack gap**: コンテンツブロック間は `gap-sds-300` (24px) または `gap-sds-400` (32px)。
- **Card internal padding**: `p-sds-200` (16px) または `p-sds-300` (24px)。

### 5.4 Whitespace Strategy

情報密度は **中〜高** を想定。業務アプリ前提のため、ホワイトスペースを積極的に使うランディングページ的余白は避ける。見出しとコンテンツの関係性は `margin-bottom: var(--spacing-sds-200)` 程度でタイトに保つ。

---

## 6. Depth & Elevation

### 6.1 Shadow Tokens

| Token | 用途 |
|---|---|
| `shadow-sds-level-1` | Switch のつまみ |
| `shadow-sds-level-2` | DatePicker, DropdownMenu (どちらも Figma で "Elevation Lv.2") |
| `shadow-sds-level-3` | Tooltip |
| `shadow-sds-level-4` | Snackbar |
| `shadow-sds-level-5` | Modal |

Card・Popover・Select・Tag・Toast・Sticky Header は Nova のコンポーネントとして**未提供**。アプリ側で同等の浮いた要素を作る場合は、上の表の近い役割のレベルを使う（例: 小さな浮きパネルは level-2）。

### 6.2 Surface Hierarchy

z-axis に沿って以下の順で重なる:

```
Page background (surface-base, z=0)
  └─ Container (background-container, z=0, shadow=none)
       └─ Card (surface-base, z=1, shadow=level-1 optional)
            └─ DropdownMenu / DatePicker (z=100, shadow=level-2) / Tooltip (z=100, shadow=level-3)
                 └─ Modal overlay (scrim + card, z=200, shadow=level-5)
                      └─ Snackbar (z=300, shadow=level-4)
```

**Rule**: 影は「浮いている要素」にのみ使用する。ページ内の静的カードは基本 `border-weak` で境界を示し、影は使わない (影の濫用は UI が重く見える原因)。

---

## 7. Interaction States

Figma Foundations の "Interaction" セクションの内容。

### 7.1 Focus Display（フォーカス表示）

キーボード操作で要素に移動したとき、どこに焦点があるかを示す。マウスを使わない利用者にとって唯一の手がかりであるため、すべての操作要素に必須。

| 項目 | 値 | 補足 |
|---|---|---|
| 太さ | 2px | すべてのコンポーネントで共通 |
| 色 | `border-focus` | 背景とのコントラスト 3:1 以上を満たす |
| 配置 | 外側（OUTSIDE） | 要素の寸法に影響しない |
| オフセット | 塗り面 2px / テキスト 3px | テキストは字面から離す |
| 角丸 | 対象要素と同じ | 要素の角丸を引き継ぐ |
| プロパティ | Focus（BOOLEAN） | 他の状態と同時に成立するため、バリアントにしない |

```css
outline: 2px solid var(--color-sds-border-focus);
outline-offset: 2px; /* テキスト要素は 3px */
border-radius: inherit; /* 対象要素の角丸を引き継ぐ */
```

### 7.2 Press / Active Representation（押下表現）

要素を押している間の見た目。クリック・タップが受け付けられたことを、指を離す前に伝える。

| 対象 | State | 表現 |
|---|---|---|
| ボタン系 | Active | `surface-*-active` トークンに切り替える |
| メニュー項目 | Active | `surface-subtle` を敷く |
| スクロールバー | Active | ドラッグ中の Thumb を示す（詳細未定義） |
| フォームコントロール（Checkbox / Switch 等） | なし | 値の変化そのものが結果になるため、押下表現を持たない |

### 7.3 State Coexistence & Priority（状態の共存と優先順位）

複数の状態が同時に成立することがある。

| 組み合わせ | 結果 |
|---|---|
| Hover + Focus | 両方表示する |
| Active + Focus | 両方表示する |
| Disabled + Hover | Disabled のみ。ホバーに反応しない |
| Disabled + Focus | Disabled のみ。フォーカスを受け取らない |
| Error + Hover / Focus | 両方表示する。Error は独立した Status 軸のため |

**Rule**: Disabled が最優先 — 操作できない要素に Hover/Focus の反応があると、操作できるように見えてしまうため。

---

## 8. Do's and Don'ts

### ✅ Do's

- **Do** すべての色を Semantic トークン (`bg-sds-surface-primary`, `text-sds-text-primary` 等) で指定する。
- **Do** Tailwind Utility (`p-sds-200`, `gap-sds-150`, `rounded-sds-200` 等) を使い、任意値 (`p-[14px]`) は避ける。
- **Do** `cn()` ユーティリティでクラスをマージする (`twMerge` により競合解消)。
- **Do** インタラクティブ要素にはすべて `focus:outline-2 focus:outline-sds-border-focus` を付ける。
- **Do** Radix UI が提供する primitive があるコンポーネントでは必ず Radix をベースにする (Dialog, DropdownMenu, Tooltip, Tabs, Switch, Checkbox, RadioGroup)。
- **Do** font-family は `--font-family-sds-sans`（デフォルト `system-ui` スタック）を使う。ブランドフォント（Noto Sans JP）が必要な場合は `branded-fonts.css` を import する（§3.1 参照）— コンポーネント内で font-family を直接指定しない。
- **Do** アイコンのみの要素 (children が icon のみの Button 等) には `aria-label` を必ず付与する。
- **Do** ユーザーに見える文字列 (「クリア」「今日」、曜日名、月名 等) は props として外部から注入できるようにする。日本語デフォルト値を持ってよいが、必ず override 可能にする (i18n-ready)。

### ❌ Don'ts

- **Don't** hex 値や rgb をコンポーネント内に書かない (`bg-[#ff2200]` 禁止)。Primitive token (`red-500`) の直接参照も避け、Semantic を使う。
- **Don't** Sun Red (`surface-emphasis`) を Primary のように多用しない。Emphasis は画面内で 1〜2 箇所まで。
- **Don't** 影を静的カードに使わない (`shadow-*` はフローティング要素のみ)。
- **Don't** 生の `shadow-[0_4px_...]` を書かない。必ず `shadow-sds-level-1〜5` のトークンを使う。
- **Don't** `rounded-sds-100` (4px) を Button や Card に使わない (既定は `rounded-sds-200` = 8px)。
- **Don't** 中間サイズの余白 (`p-[10px]`, `mt-[18px]`) を使わない。スケール外の値が必要ならデザイナーに確認。
- **Don't** `size-[40px]` などの任意サイズ値を使わない。Tailwind scale (`size-10`) または spacing token で表現する。トークンで表現できない固定寸法の場合のみ任意値を許容し、理由コメントを付ける。
- **Don't** ロケール依存文字列 (日本語の曜日名、ボタンラベル等) をコンポーネント内で `const WEEKDAYS = [...]` のように定義しない。必ず props 化する。
- **Don't** `font-family` を直接 CSS で指定しない (Tailwind 側で管理)。
- **Don't** ネイティブ `<button>` をそのままスタイルして Button の代替にしない。必ず `Button` コンポーネントを使う。
- **Don't** 絵文字をアイコンの代替に使わない (デザインに含める場合を除く)。

---

## 9. Responsive Behavior

### 9.1 Breakpoints

Tailwind のデフォルトブレークポイントを使用:

| Prefix | min-width | 用途 |
|---|---|---|
| (none) | 0 | Mobile (〜639px) |
| `sm:` | 640px | 大きめモバイル / 小タブレット |
| `md:` | 768px | タブレット |
| `lg:` | 1024px | 小デスクトップ |
| `xl:` | 1280px | デスクトップ |
| `2xl:` | 1536px | 大デスクトップ |

### 9.2 Typography Switching

Heading は Mobile (〜`md`) で `typo-heading-mobile-*`、Desktop (`md:` 以上) で `typo-heading-desktop-*` を使用（Title/Label/Body は device 区別なし、`typo-title-*`/`typo-label-*-{bold,regular}`/`typo-body-*` をそのまま使う）。

```html
<h1 class="typo-heading-mobile-h1 md:typo-heading-desktop-h1">
  タイトル
</h1>
```

### 9.3 Touch Targets

- **Minimum tap target**: 40 × 40 px (Button `medium` 相当)。44 × 44 px を推奨。
- **Mobile では Button `small` を避ける** (32px 高は押しにくい)。アイコン近接の場合は間隔 `sds-100` (8px) 以上を空ける。

### 9.4 Responsive Collapsing Strategy

- **Grid → Stack**: `md:` 未満では multi-column grid を `flex flex-col gap-sds-200` に切り替える。
- **Sidebar → Drawer**: `lg:` 未満ではサイドバーを DropdownMenu / Modal (Drawer) に置き換える。
- **Horizontal Nav → Tab**: ヘッダー内ナビゲーションは mobile で水平スクロール可能な Tab に降格。
- **Table → Card list**: 幅広テーブルは mobile で行単位のカードに組み替える (重要列のみ表示)。
- **Modal width**: モバイルでは全幅 (`w-full`)、デスクトップでは `max-w-[560px]` 等で中央表示。

---

## 10. Agent Prompt Guide

### 10.1 Quick Color Reference (コピペ用)

```
Primary ボタン: bg-sds-surface-primary text-sds-text-on-surface hover:bg-sds-surface-primary-hover
Emphasis CTA:  bg-sds-surface-emphasis text-sds-text-on-surface hover:bg-sds-surface-emphasis-hover
Secondary:     border border-sds-border-strong bg-white text-sds-text-primary
Danger:        border border-sds-border-danger bg-sds-surface-base text-sds-text-danger
Body text:     text-sds-text-primary (main) / text-sds-text-secondary (sub)
Link:          text-sds-text-link (blue-600)
Card:          bg-sds-surface-base border border-sds-border-weak rounded-sds-200 p-sds-200
Section BG:    bg-sds-background-container
```

### 10.2 Ready-to-Use Prompts

新しい画面を作るときは以下のテンプレートをベースに:

```
Sun Design System (design.md 参照) を使って <画面名> を作成して。制約:
- 全ての色は semantic token 経由 (bg-sds-surface-*, text-sds-text-*, border-sds-border-*)
- Radius は rounded-sds-200 を既定 (数値スケール: 100/200/400 等。文字キーの xs/s/m/l は廃止済み)
- 余白は数値スペーシングスケールのみ (spacing-25/50/100/200/400 等。文字キーの xs/s/m/l/xl は廃止済み)
- Button, Input, Modal 等は既存コンポーネント (src/components/*) を import
- Typography は統一テーブル `typo-{role}-{size}` (例: typo-body-m, typo-heading-desktop-h1) を使用。旧 device×language 4軸スキームは廃止済み
- フォントは既定で system-ui (OS ネイティブ)。ブランドフォント（Noto Sans JP）は opt-in の branded-fonts.css を明示 import した場合のみ
- 新規ハードコード色・サイズは禁止
```

### 10.3 Component Import Reference

```ts
import {
  Button,
  Input, TextField, Textarea, TextareaField,
  Checkbox, RadioGroup, RadioGroupItem, Switch,
  Badge, Divider,
  TooltipProvider, Tooltip,
  Tabs, TabsList, TabsTrigger, TabsContent,
  SnackbarContainer, showSnackbar,
  Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  Scrollbar, ScrollBarArea,
  DatePicker,
} from '@sun-asterisk/nova';

// Tooltip を使う場合は、アプリのルート付近に TooltipProvider を1つ置く
<TooltipProvider>{/* app */}</TooltipProvider>
```

### 10.4 File-level Checklist (生成時)

エージェントがコードを書き終える前に以下を自己確認:

- [ ] hex 値 (`#xxxxxx`) を書いていない
- [ ] `bg-[...]` / `text-[...]` のような任意値色を使っていない
- [ ] Button は `<Button variant=... size=...>` で書き、`<button>` を直接スタイルしていない
- [ ] 角丸は `rounded-sds-200` (既定) or Modal/大カードなら `rounded-sds-400` (数値スケールのみ、文字キー不可)
- [ ] 余白が数値スペーシングスケール内 (`spacing-25/50/100/150/200/...`、文字キー `xxs/xs/s/m/l/xl` は不可)
- [ ] Typography は `typo-{role}-{size}` utility を使用 (旧 `typo-<device>-<lang>-<role>-<size>` スキームは廃止済みで一切 CSS を生成しない)
- [ ] icon-only 要素に `aria-label`
- [ ] focus outline が付いている
- [ ] Dialog/Menu/Tooltip は Radix ベースのプロジェクト内コンポーネントを使用

### 10.5 Reference Files

| ファイル | 内容 |
|---|---|
| `scripts/global.css` | すべての CSS 変数 (色・余白・Radius・Shadow・Typography) |
| `scripts/design-tokens.tokens.json` | `pnpm tokens:sync` が Figma の変数から生成する中間ファイル (Style Dictionary ソース)。手で編集しない |
| `src/components/index.ts` | 全公開コンポーネントのエクスポート一覧 |
| `src/components/<name>/<Name>.styles.ts` | 各コンポーネントの variant 定義 (tv()) |
| `.claude/skills/sun-design-system/` | Design System 統合スキル (Figma 更新 / Figma コンポーネント追加 / React 実装 / 既存コンポーネント変更の 4 workflow) |
| `figma-sync.config.json` | Figma ↔ Code 同期設定 |
