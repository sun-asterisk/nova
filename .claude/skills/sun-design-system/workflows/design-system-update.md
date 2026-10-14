---
name: workflow-design-system-update
description: >
  デザインの専門家として Figma デザインシステムを更新するスキル。既存の Figma ファイルのトークン（カラー・角丸・スペーシング・タイポグラフィ）を分析し、ユーザーとの対話を通じてブランドの方向性を理解した上で、デザイン理論に基づいてシステムを更新する。不足しているコンポーネントやルールも提案する。
  このスキルは以下の場合に使うこと：ユーザーが「デザインシステムを更新して」「カラーを変えて」「フォントを変更して」「リブランドしたい」「ダークモード対応して」「デザインの改善点を教えて」「コンポーネントが足りない」等のデザインシステム関連の変更・分析を求めたとき。Figma ファイルが関わるデザイン面の要望であれば全般的に適用できる。
---

# Figma Design Expert

## 役割分担: シニア (Opus) とジュニア (Sonnet)

このスキルは **2つの役割** で構成される。あなた（メインのセッション）はシニアデザイナー/ディレクターとして振る舞い、Figma MCP の実操作はサブエージェント（ジュニア）に委任する。

```
┌─────────────────────────────────────────────┐
│ シニアデザイナー (あなた = Opus)                │
│                                             │
│ 担当:                                       │
│ - デザイン方針の策定（色/フォント/角丸/余白）   │
│ - コンポーネント選定・レイアウト設計            │
│ - スクリーンショットの確認・品質判定            │
│ - 修正指示の具体化                            │
│ - ユーザーとの対話                             │
│ - 最終承認                                   │
│                                             │
│ やること: 設計書を書く → ジュニアに渡す        │
│ やらないこと: use_figma を直接呼ばない         │
└─────────────┬───────────────────────────────┘
              │ 具体的な指示書（変数ID, 値, コード）
              ▼
┌─────────────────────────────────────────────┐
│ ジュニアデザイナー (サブエージェント = Sonnet)   │
│                                             │
│ 担当:                                       │
│ - use_figma の実行（トークン変更、ページ構築）  │
│ - コンポーネントインスタンスの配置              │
│ - テキストのオーバーライド                     │
│ - get_screenshot の撮影                       │
│ - 結果の報告                                 │
│                                             │
│ やること: 指示書の通りに実行 → 結果を返す      │
│ やらないこと: デザイン判断をしない              │
└─────────────────────────────────────────────┘
```

### サブエージェントの起動方法

```
Agent({
  subagent_type: "general-purpose",
  model: "sonnet",
  description: "Build [ページ名] page in Figma",
  prompt: "[指示書の内容]"
})
```

**重要ルール:**
- シニアは `use_figma` を直接呼ばない。全て Sonnet サブエージェントに委任する
- サブエージェントのプロンプトには、実行すべき JavaScript コードを含める
- サブエージェントの結果を受け取ったら、シニアが `get_screenshot` で品質確認する（これだけはシニアが呼ぶ）
- 品質に問題があれば、修正指示を具体的に書いてサブエージェントに再委任する

### サブエージェントへの指示テンプレート

```
You are a junior designer building a page in Figma.
File Key: [fileKey]
Always pass skillNames: "figma-use" when calling use_figma.

## Task
[具体的な作業内容]

## Component Instances to Use
[コンポーネントID と バリアント名の一覧]

## Code to Execute
[実行すべき JavaScript コード]

## Expected Result
[完成イメージの説明]

Report: what you created, node IDs, any issues.
```

## ワークフロー

### Phase 1-3: シニアが直接実行

Phase 1 (現状分析)、Phase 2 (デザインインタビュー)、Phase 3 (デザイン提案) はシニアが直接担当。ユーザーとの対話とデザイン判断はシニアの仕事。

Phase 1 の現状分析でも、Figma MCP 呼び出しはサブエージェントに委任する。ただし分析結果はシニアが解釈してユーザーに説明する。

デザイン提案では5つのレイヤーを設計:
1. **カラー** — セマンティック変数のエイリアス先と理由
2. **角丸** — Radius トークンの値と理由
3. **スペーシング** — Spacing トークンの値と理由
4. **タイポグラフィ** — フォント選定と理由
5. **色調** — Neutral のティントと理由

詳細なデザイン理論は [references/design-principles.md](../references/design-principles.md) を参照。

### Phase 4: トークン変更（Sonnet に委任）

シニアが設計書を作成し、変数 ID と値の完全なリストを Sonnet に渡す。

**Sonnet への指示に含めるもの:**
- セマンティック変数の変更マッピング（全変数IDとエイリアス先ID）
- Radius/Spacing の値
- フォント名（loadFontAsync のコード込み）
- Neutral のティント色（RGB値）

Sonnet が完了したら、シニアが `get_screenshot` で Components ページを確認。

### Phase 4.5: コンポーネント検証（Sonnet 構築 → シニア確認）

**Sonnet に委任:** NekoTest ページに "Component Check" フレームを作成し、以下のインスタンスを配置:
- Button (Primary/Secondary/Emphasis/Plain/Danger) + Icon Button
- TextField (Enabled/Error) + TextArea
- Checkbox (Checked/Unchecked) + Radio (Selected/Unselected) + Switch (On/Off)
- Badge (Count/Label/Dot) + Tab (Active/Enabled) + Tooltip + Divider
- Modal + Snackbar

**シニアが確認:** `get_screenshot` で全コンポーネントのトークン反映を目視チェック。問題があれば修正指示を出す。

### Phase 5: ギャップ分析（シニア）

シニアがデザインシステムの不足を分析・報告。

**React 化対象の判定ルール:**
- Figma の Components ページで **最上位レイヤーに存在するコンポーネントセットのみ** が React 側のメインコンポーネント候補になる。
- 親コンポーネント配下にネストされたサブコンポーネント (例: Button 配下の "Icon Button"、TextField 配下の "Input" 等) は、**親コンポーネントの props/children で表現する前提** で扱い、独立した React コンポーネントとしてギャップ分析に含めない。
- `figma-sync.config.json` の `componentMap` エントリと一致する最上位レイヤーが正規の対象。マッピングがないネスト要素を「未実装」として挙げない。

### Phase 6: サンプルページ一括作成（バッチモード）

#### ページ数ルール: 最低5ページ

**5ページは必須。省略不可。**

```
必須ページ構成（7フレーム）:
1. Component Check — Phase 4.5 で作成済み
2. メインページ — ブランドの第一印象
3. 詳細/フォームページ — 情報設計 + フォーム要素
4. 一覧/データページ — 情報密度 + フィルタリング
5. 設定/アカウントページ — Switch, Radio, Checkbox の集中検証
6. 追加ページ — 業種固有（検索結果、マイページ、通知等）
7. Design Notes — デザイン判断の記録
```

#### バッチモードの進め方（3ステップで完了）

1ページずつ往復するのではなく、**全ページの設計書を一括で作り、1つの Sonnet エージェントに全て委任する。**

```
Step 1: シニアが全ページの設計書を一括作成
  - 5ページ分のレイアウト、使うコンポーネント、テキスト内容、コード
  - Design Notes のコンテンツ
  - 全てを1つのプロンプトにまとめる

Step 2: Sonnet が全ページを一括構築
  - 5ページ + Design Notes を順番に構築
  - 各ページ完成後に get_screenshot を撮影
  - 全ページの nodeId とスクリーンショット結果を報告

Step 3: シニアが一括レビュー
  - 全ページのスクリーンショットを確認
  - 問題があれば修正指示を Sonnet に出す（修正のみ）
  - 問題なければ完了
```

**これにより、5ページの作成が Opus 3ターン（設計→確認→修正指示）で完了する。**

#### なぜサブエージェント（Sonnet）に委任するのか

1ファイルでの作業では並行処理のメリットはない。それでも Opus/Sonnet 分離の価値がある理由:

| メリット | 説明 |
|---|---|
| **Opus のトークン節約** | use_figma の呼び出しは大きなコードブロックを送信するため、トークンコストが高い。Sonnet に任せることで Opus のレート制限を温存できる |
| **設計と実装の分離** | Opus がデザイン判断に集中し、実装の細部（座標計算、API呼び出し）を気にしなくてよい |
| **品質ゲートの独立** | 作った人と確認する人が異なるため、客観的な品質評価ができる |
| **再試行の容易さ** | Sonnet が失敗しても、同じ指示書で再委任するだけ。Opus のコンテキストは汚れない |

**1ファイル前提のフロー:**
```
Opus: 全5ページの設計書を一括作成
  → Sonnet: 1つのエージェントが全5ページを直列に構築（同じファイル内）
  → Opus: get_screenshot で一括レビュー
  → (修正があれば) Sonnet: 修正のみ実行
```

#### Sonnet へのバッチ指示テンプレート

```
You are a junior designer building 5 sample pages + 1 Design Notes page in Figma.
File Key: [fileKey]
Always pass skillNames: "figma-use" when calling use_figma.
The tool name is mcp__plugin_figma_figma__use_figma.

## Overview
Build these pages in order, positioned side by side (each page x = previous page x + 1540).
After EACH page, take a get_screenshot of that specific page by its nodeId (NOT the whole NekoTest page) and include the screenshot result in your report.
Use component instances (not hand-drawn frames) for all buttons, inputs, badges, dividers.

## Critical Layout Rules (must follow for every page)
- Every page wrapper: resize(1440, 100), layoutSizingHorizontal="FIXED", layoutSizingVertical="HUG"
- Content padding: paddingLeft=48, paddingRight=48 minimum (64 for generous layouts)
- Header: always 1440px wide with FILL, height 56-64px FIXED
- Card grids: use HORIZONTAL auto-layout with itemSpacing=16-24, each card layoutSizingHorizontal="FILL"
- Never set a page wrapper width less than 1440px
- All text must use the correct loaded font (await figma.loadFontAsync before any text creation)
- If font loading fails for component text override, report it as an issue rather than silently skipping

## Component Instance Patterns
const mkS = (id, f) => figma.getNodeById(id).children.find(c => c.type === 'COMPONENT' && c.name.includes(f)).createInstance();
const mkC = (id) => figma.getNodeById(id).createInstance();

Button Primary Large: mkS('2557:1779', 'Primary, Size=Large, State=Enabled')
Button Secondary Med: mkS('2557:1779', 'Secondary, Size=Medium, State=Enabled')
Badge Label: mkS('1065:507', 'Label')
TextField Enabled: mkS('610:2971', 'State=Enabled')
Divider: mkC('977:1950')
Tab Active: mkS('2185:1731', 'State=Active')
Switch On: mkS('8248:329', 'Active=True, Size=Medium, State=Enabled')
Checkbox Checked: mkS('2787:2560', 'Type=Checked, State=Enabled')
Modal Small: mkS('11017:20474', 'Basic, Size=Small')
Tooltip Top: mkS('9639:4097', 'Top')
Snackbar: mkC('7837:3652')

## Pages to Build

### Page 1: [ページ名]
[レイアウト仕様、使うコンポーネント、テキスト内容、背景色]

### Page 2: [ページ名]
[同上]

... Page 5 まで

### Design Notes
[カラーパレット、タイポグラフィ、角丸/スペーシング、方向性サマリーの内容]

## Report Format
For each page report:
- Page name and nodeId
- Components used (types and count)
- Screenshot taken: yes/no
- Any issues encountered
```

#### コンポーネント使用ルール

**8種類以上のコンポーネントをサンプルページ全体で使用すること。**

使用可能なコンポーネント一覧（Components ページの ID）:
- Button: `2557:1779` — Style=Primary/Secondary/Emphasis/Plain/Danger, Size=Large/Medium/Small
- Icon Button: `3700:7301`
- TextField: `610:2971` — State=Enabled/Error/Disabled
- TextArea: `598:2713`
- Checkbox: `2787:2560` — Type=Checked/Unchecked, State=Enabled
- RadioGroup: `985:1697` — State=Enabled, Selected=True/False
- Switch: `8248:329` — Active=True/False, Size=Medium/Large, State=Enabled
- Badge: `1065:507` — Style=Count/Dot/Label/Error
- Divider: `977:1950`
- Tab: `2185:1731` — State=Active/Enabled
- Tooltip: `9639:4097`
- Modal: `11017:20474`
- Snackbar: `7837:3652`

**手描きフレームで作ってはいけないもの:** ボタン、入力欄、トグル、バッジ、区切り線
**手描きフレームで作ってよいもの:** レイアウトコンテナ、ヘッダー、プレースホルダー画像、テキスト

#### 業種別のページ設計

[references/design-principles.md](../references/design-principles.md) の「業界別デザインパターン」と「コンポーネントのギャップ分析チェックリスト」を参照。

#### Design Notes ページ（必須）

デザイン判断の記録ページ。含めるセクション:
1. **カラーパレット** — 色見本 + hex + 変更理由 + 競合差別化
2. **タイポグラフィ** — フォントサンプル + 選定理由
3. **角丸・スペーシング** — 値一覧 + 見本 + 理由
4. **デザイン方向性サマリー** — トーン + ターゲット + ページ構成

#### プロフェッショナル感のディテール

- カードには DROP_SHADOW (y=2-4, blur=8-16, opacity=0.06-0.10)
- テキスト階層: 見出し(24-40px Bold) → 小見出し(16-20px SemiBold) → 本文(14-16px) → 補足(12-13px gray)
- アクセントカラーは全体の10-15%に抑える
- 背景色を交互に変えてセクションを区切る
- ダークテーマでは純黒を避けブランドティントを加える

### Phase 7: 一括レビュー（シニアが実行）

**このフェーズはシニアの最重要任務。** Sonnet が構築した全ページを一括で品質保証する。

#### レビューの鉄則

**全体スクリーンショットだけで合格判定してはならない。** 縮小された全体画像では、レイアウト崩れ、テキスト切れ、コンポーネントの不具合が見えない。必ず各ページの nodeId を指定して個別スクリーンショットを撮り、拡大状態で確認すること。

**「良さそうに見える」で合格にしてはならない。** チェックリストの全項目を1つずつ確認し、1つでも NG があれば不合格。不合格のページは修正指示を出す。

#### 確認フロー（この順序を厳守）

```
Step 1: Sonnet の報告から全ページの nodeId を取得

Step 2: 各ページの個別スクリーンショットを撮影（get_screenshot で nodeId 指定）
  - 全体ではなく、各ページフレームの nodeId を指定する
  - 5ページ + Design Notes = 最低6枚のスクリーンショットを撮る

Step 3: 各スクリーンショットをチェックリストで評価
  - 1枚ずつ、チェックリストの全項目を確認
  - NG があれば問題リストに追加
  - 「多分大丈夫」は NG。明確に OK と判断できない項目は NG 扱い

Step 4: 問題リストが空なら合格。1つでもあれば:
  - 問題の具体的な内容（何が、どのページで、どう壊れているか）を記述
  - 修正指示書を作成して Sonnet に委任
  - 修正後に Step 2 から再確認

Step 5: 全ページ合格後、全体スクリーンショットで一貫性の最終確認
```

#### チェックリスト（各ページで全項目を確認）

**レイアウト（最重要 — ここが崩れると全体が台無し）:**
- [ ] ページ幅が 1440px あるか（狭く見えないか）
- [ ] ヘッダーがページ全幅に伸びているか（途切れていないか）
- [ ] コンテンツがページの左右に適切な余白を持っているか
- [ ] カードグリッドが均等に並んでいるか（1列になっていないか）
- [ ] テキストやコンポーネントが重なっていないか

**コンポーネント:**
- [ ] コンポーネントインスタンスを使っているか（手描きボタンがないか）
- [ ] デフォルトテキスト（「ラベル」「テキストを入力」）が残っていないか
- [ ] ブランドカラーが正しく反映されているか

**品質:**
- [ ] テキスト階層が明確か（見出しと本文のサイズ差がはっきりしているか）
- [ ] セクション間の余白が均等か
- [ ] 全体的にプロフェッショナルか（「これをクライアントに見せられるか？」）

#### 全体チェック（個別ページの合格後に実施）
- [ ] ページ数 ≥ 5（Component Check + 5サンプル + Design Notes = 7フレーム）
- [ ] コンポーネント種類 ≥ 8
- [ ] ヘッダーデザインが全ページで統一されているか
- [ ] Design Notes にデザイン判断が記録されているか

### Phase 8: 完了報告（シニア）

1. **ページ一覧** (ページ名、ページ数 ≥ 5、各ページの概要、使用コンポーネント)
2. **コンポーネント使用状況** (種類数 ≥ 8、各ページの内訳)
3. **デザイン判断サマリー** (カラー/フォント/角丸の理由)
4. **確認済みスクリーンショット**
5. **既知の制限事項**

## やってはいけないこと

- シニアが use_figma を直接呼ぶ（サブエージェントに委任する）
- ユーザーに聞かずに Danger/Error 系の色を変える
- 基本単位 (XXS: 4px, XS: 8px) や Radius/Full を変える
- スクリーンショットで確認せずに次に進む
- **サンプルページを5ページ未満で完了報告する**
- **コンポーネントインスタンスを使わずにページを作る**
- **サブエージェントの成果物をスクリーンショットで確認せずに承認する**
- **全体スクリーンショット（縮小画像）だけで合格判定する** — 縮小画像ではレイアウト崩れ、テキスト切れ、幅の問題が見えない。必ず各ページの nodeId を指定して個別スクリーンショットを撮ること
- **「多分大丈夫」「良さそう」で合格にする** — チェックリストの全項目を明示的に OK/NG 判定すること。判断に迷ったら NG 扱い
- **Sonnet への設計書でページ幅（1440px）やパディングを省略する** — レイアウト崩れの最大の原因は幅とパディングの指定不足

## 参考

デザイン原則とフォント・カラーの組み合わせガイドは [references/design-principles.md](../references/design-principles.md) を参照。

## Light / Dark 検証 (トークンを変更したら必須)

カラートークンを変更・追加したら、影響するコンポーネントそれぞれに `pnpm figma:theme-check <fileKey> <nodeId>` を実行し (Figma の Light/Dark 値 ↔ 再生成後の `scripts/global.css`、全状態コントラスト)、`pnpm test:storybook` と `pnpm test:storybook:dark` の両方を通す。定義: [`references/theme-verification.md`](../references/theme-verification.md)。
