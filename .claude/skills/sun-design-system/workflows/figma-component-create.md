---
name: workflow-figma-component-create
description: >
  Sun Design System の Figma ファイルに **新しい最上位レイヤーのコンポーネントを 1 つ追加** するスキル。既存コンポーネント (Button, TextField, Modal 等) と同じパターンに厳密に従って、コンポーネントセット (Variants) + 5 セクションからなるガイドライン/仕様ドキュメントフレームを作成する。`figma-sync.config.json` の componentMap も更新する。
  このスキルは以下の場合に使うこと：ユーザーが「Figma にコンポーネントを追加して」「新しいコンポーネントセットを作って」「Figma 側に ◯◯ コンポーネントがないから追加して」「Design System にコンポーネントを追加して」等の、**Figma 側の単一コンポーネント追加** を求めたとき。React 実装は含まない (component-implement workflow に引き継ぐ)。デザインシステム全体の更新 (リブランド、カラー変更等) は design-system-update workflow。
---

# Figma Component Creator

Sun Design System の Figma Components ページ (最上位レイヤー) に、既存パターンに沿った新規コンポーネント 1 つを追加する。

## スコープ

**やること:**
- Figma Components ページ (nodeId `1:3`) の最上位レイヤーにコンポーネントセット (COMPONENT_SET) を追加
- バリアント軸 (例: Style × Size × State) を定義
- Component Properties (INSTANCE_SWAP / TEXT / BOOLEAN) を設定
- デザイントークン (色・余白・角丸・タイポ) を各バリアントに適用
- 5 セクションのドキュメントフレーム (Header / コンポーネント仕様 / ガイドライン / デザイン仕様 / 更新履歴) を作成
- `figma-sync.config.json` の `componentMap` に追加

**やらないこと:**
- React 実装 (→ component-implement workflow)
- デザインシステム全体の更新 (→ design-system-update workflow)
- 既存コンポーネントの修正 (別スキル / 別タスク)

## 役割分担: Opus (Senior) / Sonnet (Junior)

`design-system-update` workflow と同じ Opus/Sonnet 分離パターン。

```
┌───────────────────────────────────────────┐
│ Senior (Opus = あなた)                     │
│ - コンポーネント仕様の設計                   │
│ - バリアント・プロパティ・トークンの決定      │
│ - ガイドライン文章の執筆                    │
│ - ユーザー対話・承認                        │
│ - 完成物のスクリーンショット確認             │
│ やらない: use_figma を直接呼ばない          │
└─────────────┬─────────────────────────────┘
              │ 設計書 (実行コード含む)
              ▼
┌───────────────────────────────────────────┐
│ Junior (Sonnet サブエージェント)             │
│ - use_figma で COMPONENT_SET 構築          │
│ - ドキュメントフレーム構築                   │
│ - get_screenshot で撮影                    │
│ やらない: 設計判断                          │
└───────────────────────────────────────────┘
```

**サブエージェント起動例:**

```
Agent({
  subagent_type: "general-purpose",
  model: "sonnet",
  description: "Build [ComponentName] in Figma",
  prompt: "[設計書]"
})
```

**重要:** サブエージェントのプロンプトには `use_figma` のたびに `skillNames: "figma-use"` を渡すよう明記する。

## 最優先ルール (Prime Directives)

1. **Board Format (Template) を複製して作る。スクラッチで Frame を積み上げない。** Support ページ (`152:2`) の `Board Format` (`1650:1714`) を clone し、中の Header / Master Component / Guideline / Update Log の中身だけ swap/埋める。詳細は [references/kit-and-template.md](../references/kit-and-template.md) 参照。
2. **外殻幅は可変。** Board Format 既定は 2000px。コンポーネントの variant 数やレイアウトに応じて必要なら resize してよい (例: 2390px)。内部 Wrapper は auto-layout で追従する。
3. **既存パターンから逸脱しない。** Button / TextField / Modal と同じ位置行 (y=3090)・同じタイポグラフィ・同じ余白。独自判断で変えない。
4. **デザイントークンの CSS 変数名と一致する Figma Variables を使う。** Hex ハードコード禁止。トークン未定義の値が必要になったら、作業を止めてユーザーに相談する。
5. **最上位レイヤーとして配置する。** `Components` ページ (nodeId `1:3`) の直接の子として追加。ネストしない。
6. **Sonnet の成果物は必ず Opus がスクリーンショットで確認する。** チェックリストを全部 OK と判定してから完了報告。
7. **破壊的操作を行わない。** 既存コンポーネント / Kit / Template を上書き・削除・移動しない。clone のみ。

## ワークフロー (Phase 0-8)

### Phase 0: Intake

ユーザーから以下を聞く (ヒアリング):
- 追加したいコンポーネント名 (例: "Progress Bar", "Avatar", "Stepper")
- 主な用途 / いつ使うか
- 参考にする既存コンポーネント (「Button みたいな感じ」等)
- バリアント軸の希望 (Style / Size / State / その他)

すでにユーザーが情報を与えている場合はスキップして Phase 1 へ。

### Phase 1: 既存パターン読み込み (Pre-flight)

コードを書く前に以下を読む:

- [ ] `design.md` (プロジェクトルート) — トークン体系・Don'ts
- [ ] `scripts/global.css` — 利用可能な CSS 変数
- [ ] `figma-sync.config.json` — `componentMap` で既存マッピングを確認。新コンポーネント名が重複しないか確認
- [ ] `.figma-sync/snapshots/latest.json` — 既存全コンポーネントのバリアント構造を参考にする
- [ ] **[references/kit-and-template.md](../references/kit-and-template.md) — Board Format (複製元) + Kit アセット (Header / Do / Redline / icons 等) の完全インベントリ。最優先で読む**
- [ ] [references/component-spec-patterns.md](../references/component-spec-patterns.md) — バリアント軸・プロパティ命名・状態定義のパターン集
- [ ] [references/guideline-template.md](../references/guideline-template.md) — タイポグラフィ・数値・フォールバック用の詳細仕様 (Board Format が使えない場合のみ)

類似する既存コンポーネントを 1 つ決めて「これを真似る」と宣言する。例: 新 "Progress Bar" なら Tab か Badge を参考にする。

### Phase 2: Senior が設計書を書く

以下をすべて埋めた設計書を作る:

```
Component: <Name>  (Figma 名。半角スペース許容。例: "Progress Bar")
Code Name: <camelCase>  (componentMap のコード側名前。例: "progressBar")

## 外殻幅
- 既定: 2000px (Board Format クローン後のままでよい)
- 特殊サイズが必要な場合のみ記入 (例: 2390px / 2800px — 理由: variant 数が多く横並び showcase に必要)

## 用途 (Purpose)
- 何をするコンポーネントか (1-2 文)
- いつ使うか (シナリオ 2-3 個)
- いつ使わないか / 代替コンポーネント

## Anatomy (構造)
- 構成要素のリスト (例: Container, Label, Icon, Fill Track, Indicator)

## Variants (バリアント軸)
- 軸 1: <名前> — options: [...]
- 軸 2: <名前> — options: [...]
- 軸 3: State — options: [Enabled, Hover, Active, Disabled, Focus] (必要なら)

## Component Properties
- <Name>: <TYPE>  — default: <value>  — 説明
  ex: "Label": TEXT, default "ラベル"
  ex: "Icon": INSTANCE_SWAP, default null
  ex: "Show Icon": BOOLEAN, default false

## Design Tokens (各バリアントの適用トークン)
| Variant | Background | Text | Border | Radius | Padding | Gap | Typography |
|---|---|---|---|---|---|---|---|
| <variant>=<value> | surface-* | text-* | border-* | radius-m | ... | ... | typo-* |

## Dimensions
- デフォルトサイズ: w × h (px)
- サイズごとの min-width / height

## Accessibility
- キーボード操作
- ARIA 属性
- aria-label 必須ならその旨

## Guidelines (ガイドライン文章 + 視覚例設計)

各項目は **Left (文章)** と **Right (視覚例の設計)** を必ず両方書く。
Right は `[Visual placeholder]` 禁止。コンポーネント instance を使った具体例を設計する。

### 1. 設計の原則
- Left: [1-2 段落の本文]
- Right: [何の mockup を作るか — 例: profile card = Avatar Medium + name text + role text]

### 2. 種類と使い分け
- Left: [variant ごとの使い分け説明]
- Right: [主要 variant を横並び比較。各 instance の下にラベル]

### 3. バリエーション
- Left: [主要なバリエーションの説明]
- Right: [全サイズ or 全 variant を横並び、各 instance の下にサイズ/variant 名]

### 4. 配置 (Placement)
- Left: デスクトップでの配置例 + モバイルでの配置例
- Right: [2 つの mockup を縦に。例: desktop=navbar 1200x56 + mobile=list row 400x56]

### 5. ラベルの付け方 / 使い方
- Left: [具体的な例]
- Right: Do 側 = 適切な instance (例: "TY" 2 文字) / Don't 側 = 違反 instance (例: "TYI" 3 文字) + Text/Danger で理由注釈

## Design Spec 説明文
[サイズ・余白・角丸の設計思想を 1-2 段落]

## 初回 Update Log エントリ
YYYY-MM-DD
- コンポーネント追加
```

### Phase 3: ユーザー承認

設計書を見せて承認を取る。バリアント・ガイドライン文章・使うトークンを明確に提示。

承認されなければ Phase 2 に戻って修正。

### Phase 4: Component Set 構築 (Sonnet に委任)

Sonnet に設計書の該当部分 + 実行コードを渡す。

**Sonnet へ渡す内容:**
- File Key (`.env` の `FIGMA_FILE_KEY`。Nova｜Master は `fSzxt8wKkXsn8fmxkPBUr2`)
- Components ページ nodeId (`1:3`)
- コンポーネントセットの JS 構築コード (variants の createComponent ループ、トークン適用、property 定義)
- 配置座標 (既存の右端より x+100 程度。`design-system-update` workflow と同じ方式)

**Sonnet への指示テンプレート:**

```
You are a junior Figma designer. Build a new COMPONENT_SET on the Components page.
File Key: [fileKey]
Components page nodeId: 1:3
Always pass skillNames: "figma-use" when calling use_figma.

## Component: [Name]
[Variants / Properties / Tokens を記載]

## Position
Place at x=<existing rightmost + 100>, y=3090 (align with existing docs top)

## Execution code
[JS コード: variants array → forEach で createComponent → fills/strokes/radius/padding/textStyles 設定 → combineAsVariants]

## After creation
- Take a screenshot by the new COMPONENT_SET nodeId
- Report the nodeId + screenshot result
```

Sonnet が完了したら、Opus が `mcp__plugin_figma_figma__get_screenshot` で確認。問題があれば Sonnet に修正指示。

### Phase 5: ドキュメントフレーム構築 (Sonnet に委任、Board Format 複製方式)

**原則: スクラッチで Frame を積み上げない。Board Format (`1650:1714`) を clone する。**

詳細手順は [references/kit-and-template.md](../references/kit-and-template.md) を参照。

**Sonnet への指示ハイライト:**

1. **Board Format を clone** してメインセッションに配置:
   ```js
   const boardFormat = await figma.getNodeByIdAsync('1650:1714');
   const newDoc = boardFormat.clone();
   const componentsPage = await figma.getNodeByIdAsync('1:3');
   componentsPage.appendChild(newDoc);
   // 既存の右端 + 100 に配置、y=3090
   newDoc.name = '<Component Name>';
   // 設計書で外殻幅を 2000px 以外に指定している場合は resize
   if (targetWidth !== 2000) newDoc.resize(targetWidth, newDoc.height);
   ```

2. **Header INSTANCE のプロパティ swap**:
   - clone 内の Header INSTANCE (Kit `152:14` 由来) を `findOne` で取得
   - `setProperties` で Title と Description を swap。property key は実行時に `instance.componentProperties` を introspect してから使う (フル名が `"Title（Style Name or Component Name）"` の可能性あり)

3. **Master Component セクションの Wrapper に COMPONENT_SET 配置**:
   - `newDoc.findOne(n => n.name === 'Master Component')` → その中の `Wrapper` child
   - Phase 4 で作った COMPONENT_SET を `wrapper.appendChild(componentSet)` で移動

4. **Guideline Container を整える**:
   - Board Format には Wrapper Single / Row / Column / Do-Don't の 4 種 Container がプリセットで入っている
   - 設計書の Guideline 項目数と用途に応じて、**不要 Container を削除 / 必要 Container を duplicate**
   - 各 Container 内の Description (左 500px) を設計書の本文で更新
   - 各 Container 内の Wrapper (右 1180px) に **具体的視覚例 (コンポーネント instance を使用)** を配置。絶対に `[Visual placeholder]` のまま放置しない
   - Do/Don't が必要な項目は Kit `Do` COMPONENT_SET (`3232:1270`) の Variant=Do / Don't instance を Wrapper Do/Don't 内に配置

5. **Update Log に初回エントリ追加**

6. **不要な汎用 "Section" を削除** (Board Format に含まれているが使わない場合)

7. **各 Container 内の placeholder を audit (必須)** — Board Format の Wrapper は汎用テンプレートとして placeholder frame を複数持つ。中身を入れた後、**未使用 placeholder を `.remove()` で削除**、Container の `layoutSizingVertical = 'HUG'` にして高さを content に fit させる。詳細は [references/kit-and-template.md](../references/kit-and-template.md) の "Step 8: Container 内 placeholder の audit" 参照。

8. **全テキストノードの font を Noto Sans JP に swap** — Eina 03 / SF Pro は Plugin API ロード不可で placeholder text が render される。doc frame 内の全 TEXT を walk して `fontName.family` が "Eina 03" or "SF Pro" のものを Noto Sans JP の同等 weight に swap する（Nova は Inter を使わない）。

**Sonnet に禁止事項として明記:**
- Header / Master Component / Guideline / Update Log セクションをスクラッチで作らない
- Do/Don't 用に独自 FRAME を作らない (Kit `Do` を使う)
- Section タイトルアイコンを個別に作らない (Board Format に既配置)
- **未使用 placeholder frame を Wrapper 内に残したままにする** (空の箱が見える原因)
- **Container 高さを FIXED のまま大きく残す** (content より大きい余白が残る原因)

**フォント制約:** Eina 03 / SF Pro は Plugin API ロード不可。Noto Sans JP で作る（Nova のタイポグラフィは欧文・和文とも Noto Sans JP）。データ上は正しい characters でも font が Eina 03 / SF Pro のままだと placeholder が render される。詳細は [references/guideline-template.md](../references/guideline-template.md) のフォント節参照。

### Phase 6: figma-sync.config.json 更新 (Opus が直接)

`componentMap` に新コンポーネントを追加:

```json
"componentMap": {
  ...
  "<Figma 名>": "<codeName>"
}
```

例: `"Progress Bar": "progressBar"`

### Phase 7: レビュー (Opus が実行)

Sonnet の成果物を個別スクリーンショットで確認。**構造チェックだけでなく「視覚的に美しいか」の QA を必ず行う。**

```
Step 1: 新 COMPONENT_SET 単体の screenshot
Step 2: ドキュメントフレーム全体の screenshot
Step 3: 既存 Button/Avatar ドキュメントフレームと並べた screenshot (一貫性確認)
Step 4: Master Component area ズーム screenshot (label 重なりチェック)
Step 5: 各 Guideline Container 単位の screenshot (空白/重なりチェック)
```

**構造チェックリスト:**

- [ ] COMPONENT_SET が Components ページの最上位レイヤー (Board Format clone 内) に配置されている
- [ ] バリアント軸が設計書通り
- [ ] 各バリアントの色・余白・角丸がデザイントークン経由 (Hex ハードコードなし)
- [ ] Header の Title / Description が正しく置き換わっている (placeholder テキストでない)
- [ ] 各 Section の padding / gap が Board Format 既定値 (リサイズしていない)
- [ ] Do/Don't パネルに具体的視覚例が入っている
- [ ] 本文が Noto Sans JP Regular 16px で可読
- [ ] Update Log の初回エントリが日付付きで入っている
- [ ] `figma-sync.config.json` に新エントリが追加されている
- [ ] 既存の他コンポーネントを破壊していない

**視覚 QA チェックリスト (重要):**

- [ ] **COMPONENT_SET が Master Component Wrapper 内に収まっているか** (外にはみ出していない)
  - もしはみ出していたら、外側 axis labels (Column/Row headers) を削除するか、Wrapper/outer を widen する
- [ ] **Master Component の外側 axis labels (Density / Selectable 等) が COMPONENT_SET の cell と重なっていないか**
  - Board Format は Button 前提のデフォルト position。大きな COMPONENT_SET だと label が重なる。その場合は label を削除 (内蔵 variant 名で十分)
- [ ] **各 Container の Right Area 視覚例が Container 枠からはみ出していないか**
- [ ] **視覚例 instance が Container の幅 (通常 1180px) に収まっているか**
  - 収まらない場合: Wrapper Column に切り替えて縦積み、または visual を縮小
- [ ] **Header 赤背景の下に不自然な空白がないか**
- [ ] **Do/Don't パネルの幅がバランス取れているか** (片方だけ大きく/小さくなっていない)
- [ ] **全体が既存 Avatar / Button ドキュメントと横並び比較で違和感ないか**
- [ ] **縮小表示時に読める情報密度か** (細かすぎ/粗すぎ)

**問題があれば:**
1. 具体的にどこで何が崩れているか記述 (例: "Master Component の 'Density' label が変種 1 行目の cell と重なっている")
2. Sonnet に修正指示を出す (例: "外側 axis labels を delete してください")
3. 修正後に再度スクリーンショットで確認

**「多分 OK」「大体合ってる」で合格にしない。** 1 つでも NG なら修正を要求する。

### Phase 8: 完了報告

```
## 完了: [Component Name]

**Figma:**
- COMPONENT_SET nodeId: <id>
- ドキュメントフレーム nodeId: <id>
- Components ページ内位置: x=<>, y=3090

**追加したバリアント:**
- <軸 1>: <options>
- <軸 2>: <options>
- <軸 3>: <options>

**使用トークン:**
- colors: ...
- spacing: ...
- radius: ...
- typography: ...

**ガイドライン内訳:**
- 設計の原則: [概要]
- 種類と使い分け: [概要]
- (他)

**figma-sync.config.json:** componentMap に追加済み

**次のステップ:**
React 実装には component-implement workflowを起動してください。
(Figma スナップショットを再生成するには `.figma-sync` の更新プロセスを実行)
```

## やってはいけないこと

- Senior が `use_figma` を直接呼ぶ (Sonnet に委任)
- **Board Format (`1650:1714`) を clone せず、ドキュメントフレームをスクラッチで組む** — 必ず Template 複製方式で作る
- **Kit にある Header / Do / Redline / Section icons を使わず、独自で同種要素を作る** — 重複構造の温床になる
- Board Format や Kit の原本を編集・移動・削除する (clone のみ)
- 既存コンポーネントの配置・トークンを変更する
- Hex を直書きする (必ず Figma Variables 経由)
- Update Log を省略する
- **ガイドライン Container / Design Spec 右側 / Do/Don't パネルを `[Visual placeholder]` の空 FRAME のまま放置する** — 必ずコンポーネント instance を使った具体例を作る
- Sonnet の成果物をスクリーンショットで確認せず承認する (特に Visual placeholder が残っていないかチェック)
- バリアント名・プロパティ名で半角/全角を混ぜる (既存コンポーネントの命名規則に従う)
- 「大体 Button と同じ」で曖昧に進める — 数値・フォント・色トークンは明示的に設計書に書く
- `figma-sync.config.json` の `componentMap` 更新を忘れる
- React 実装に踏み込む (本スキルの責務外)

## 参考

- **[references/kit-and-template.md](../references/kit-and-template.md) — Board Format (Template) + Kit アセットの完全インベントリ。最優先で読む**
- [references/component-spec-patterns.md](../references/component-spec-patterns.md) — バリアント軸・プロパティ命名・状態の典型パターン集
- [references/guideline-template.md](../references/guideline-template.md) — フォント制約・タイポグラフィ数値・フォールバックの詳細仕様
- 既存のスナップショット: `.figma-sync/snapshots/latest.json`
- Components ページ (Figma): nodeId `1:3`
- Support ページ (Figma): nodeId `152:2` (Kit `1663:8983` / Templatae `3956:3219`)
- Board Format: nodeId `1650:1714`
- File key は `.env` の `FIGMA_FILE_KEY`

## Light / Dark (必須)

Figma 側でコンポーネントを作成・変更したら、色はすべて `Colors - Semantic` の変数 (Light / Dark モードを持つ) に bind する — 生の色やプリミティブ変数を直接使わない。作成後に `pnpm figma:theme-check <fileKey> <nodeId>` を実行し、全変数が `scripts/global.css` の Light/Dark 値と一致すること、全状態のテキストコントラストを確認して報告する (定義: [`references/theme-verification.md`](../references/theme-verification.md))。
