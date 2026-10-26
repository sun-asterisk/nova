---
name: sun-design-system
description: >
  Sun* Design System Nova (`@sun-asterisk/nova`) を扱う統合スキル。Figma と React の両側にまたがる 4 つの workflow を内包する: (A) デザインシステム全体の更新 (リブランド、カラー / フォント変更等)、(B) Figma 側の最上位レイヤーコンポーネント追加、(C) React 側の新規コンポーネント実装、(D) Figma の変更を伴わない既存 React コンポーネントの変更。
  このスキルは以下の場合に使うこと: ユーザーが「デザインシステム関連の更新」「Figma にコンポーネント追加」「Figma 側を変更」「リブランド」「ダークモード対応」「コンポーネントを実装」「React 化」「未実装コンポーネントを作って」「新しいコンポーネントを追加して」「既存コンポーネントに◯◯を追加して」等、Sun Design System に関わる作業を求めたとき。Phase 0 で 4 workflow から適切なものを判別する (`/component <Name>` コマンドはこの判別を自動化する)。
---

# Sun Design System

Sun* Design System Nova (`@sun-asterisk/nova`) の Figma と React 側の作業を扱う統合スキル。4 つの workflow を内包し、ユーザーの要求から適切な workflow を選んで実行する。

---

## Phase 0: Workflow 選択 (必須最初のステップ)

ユーザーの要求を以下の表に照らし、**どの workflow を実行するか判別する**。

| ユーザー要求の例 | Workflow | 詳細ファイル |
|---|---|---|
| 「カラーを変えて」「リブランドして」「フォントを変更」「ダークモード対応」「コンポーネントが足りない」(全体分析) | **A. design-system-update** | [workflows/design-system-update.md](workflows/design-system-update.md) |
| 「Figma にコンポーネント追加して」「新しいコンポーネントセットを Figma に作って」「Figma 側に ◯◯ がない」 | **B. figma-component-create** | [workflows/figma-component-create.md](workflows/figma-component-create.md) |
| 「コンポーネントを実装して」「React 化して」「未実装コンポーネントを作って」(Figma にあるが React にないものを実装) | **C. component-implement** | [workflows/component-implement.md](workflows/component-implement.md) |
| 「既存コンポーネントに ◯◯ を追加して」「Button に asChild を足して」「DropdownMenu の compound API を完成させて」(Figma の変更を伴わない、既存 React コンポーネントの API/挙動変更) | **D. component-modify** | [workflows/component-modify.md](workflows/component-modify.md) |

**`/component <Name>` コマンド (`.claude/commands/component.md`) は、この Phase 0 判別を自動化するルーティング層。** ユーザーの言い回しに頼らず、`src/components/*` と `figma-sync.config.json` の `componentMap` を実際に検索して A-G (`/component` の Classification) に分類してから workflow へ振り分ける。曖昧な場合や `/component` を経由しない場合は、以下の判別ヒントを使う。

### 判別のヒント

- **Figma に何かを書き込む / 変更する** → A または B
- **React コード (`src/components/*`) を書く** → C または D
- **個別コンポーネント 1 つを扱う** → B、C、または D
- **デザインシステム全体 (トークン・テーマ・複数コンポーネントに影響)** → A
- **Figma → Code への片方向移行 (新規)** → C (B で完成した Figma を C で React 化が典型フロー)
- **Figma の変更を伴わない既存コンポーネントの変更** → D
- **Figma 側が変更され、既存コンポーネントをそれに追従させる (ドリフト修正)** → D (`/component <Name>` の Classification F = Figma/code drift。component-modify で Figma に追従させる)

不明な場合はユーザーに「以下のどれですか?」と確認する:
1. デザインシステム全体の更新 (リブランド等)
2. Figma に新しいコンポーネントを追加
3. React 側に新規コンポーネントを実装
4. 既存の React コンポーネントを変更 (Figma の変更が起点ではない)

---

## 共通の前提 (4 workflow すべてで実行)

### 必ず読み込むファイル

- `design.md` (プロジェクトルート) — Sun Design System の仕様書全体 (color / typography / spacing / radius / shadow / Interaction / Don'ts 等)
- `.claude/rules/design-foundation.md` — Color / Typography / Spacing / Radius / Elevation / Interaction の **使用ルール** (P0/P1/P2)。`accessibility.md` と同じ形式。トークンの値そのものではなく「どう使うべきか」を定義する
- `.claude/rules/figma-code-connect.md` — `*.figma.ts` (Code Connect マッピング) の **正しさのルール** (P0/P1/P2)。同じ形式。新規/変更コンポーネントに Code Connect 定義を書く・直すときは必ず読む
- `scripts/global.css` — Figma から生成された CSS Variables の実値
- `figma-sync.config.json` — Figma ↔ Code のマッピング (`componentMap`、トップレベル限定ルール)

### Light / Dark 検証は必須

コンポーネントの見た目に触れる作業 (workflow C・D、Figma 同期、トークン変更を伴う A) では、
**[references/theme-verification.md](references/theme-verification.md) の 4 層 (Figma↔トークンの Light/Dark 値、
`storybook` + `storybook-dark` の描画、トークン解決型の light/dark テスト、全状態コントラスト) を必ず実行し、
数値で報告する。** Light だけの確認で PASS と書かない。Figma 側の値は `pnpm figma:theme-check <fileKey> <nodeId>` で取得する。

### Figma の値が古い/矛盾していると感じたら

`scripts/design-tokens.tokens.json` は手動エクスポートの古いスナップショット。値が現状と合わない・おかしいと思ったら、まず `pnpm run figma:pull` を再実行するか `scripts/figma-variables.json` の `$changelog` を確認する — 各 Foundation フレームの更新履歴が全件入っている。憶測で「バグ」と判断して直接修正しない。`figma:pull` は Figma REST API で Variables を読み (`.env` の `FIGMA_ACCESS_TOKEN` / `FIGMA_FILE_KEY` が必要)、`scripts/figma-variables.json` に書き出すだけで、`design-tokens.tokens.json` は変更しない。

### Figma 操作の鉄則

- Figma MCP (`use_figma`) を呼ぶときは **必ず `skillNames: "figma-use"` を渡す**
- Senior (Opus) は `use_figma` を直接呼ばない。**Sonnet サブエージェント** に委任する (workflow A, B 共通)
- すべての色・余白・角丸は **Figma Variables (デザイントークン) 経由**。Hex ハードコード禁止
- 既存のコンポーネント・Kit・Template の原本を **編集・削除・移動しない** (clone / instance のみ)

### 最上位レイヤールール (workflow B, C で適用)

Figma の Components ページ (nodeId `1:3`) の **最上位レイヤーに存在するコンポーネントセット** のみが React 側のメインコンポーネント (`src/components/<name>/`) の対象。ネストされたサブコンポーネント (例: Button 配下の "Icon Button"、TextField 配下の "Input") は **親コンポーネントの props/children** で表現する。

`figma-sync.config.json` の `componentMap` エントリ = 正規の対象一覧。

### フォント制約 (workflow B で必須認識)

- **Eina 03 / SF Pro は Figma プラグイン API でロード不可** (private / cloud-hosted)
- 代替: **Noto Sans JP** を使う (`Eina 03 Bold` → `Noto Sans JP Bold`, `SF Pro Regular` → `Noto Sans JP Regular` 等)。Nova は Inter を使わない
- データ上の characters が正しくても、font が Eina 03 / SF Pro のままだと placeholder が render される
- 詳細は [references/guideline-template.md](references/guideline-template.md) のフォント節参照

---

## 3 つの Workflow

### A. design-system-update (Figma 全体更新)

**何をするか:** デザインシステム全体のトークン (色・余白・角丸・タイポ) を更新する。リブランド、カラー変更、フォント差し替え、ダークモード対応など。

**Opus/Sonnet 分離:** Senior (Opus) がデザイン方針を策定し、Sonnet が Figma で実行。サンプルページ作成、Component Check も含む。

**詳細:** [workflows/design-system-update.md](workflows/design-system-update.md)

### B. figma-component-create (Figma 単一コンポーネント追加)

**何をするか:** Figma の Components ページ最上位レイヤーに、**新しいコンポーネントセット 1 つ** を追加する。Board Format (Template) を clone し、Kit アセットを使ってドキュメントフレームも構築。`figma-sync.config.json` の componentMap も更新。

**Opus/Sonnet 分離:** Senior が設計書を書き、Sonnet が Board Format clone + COMPONENT_SET 構築 + ドキュメント populate を実行。

**詳細:** [workflows/figma-component-create.md](workflows/figma-component-create.md)

### C. component-implement (React 実装)

**何をするか:** Figma にある既存のコンポーネントを React + TypeScript + Tailwind v4 + tailwind-variants で実装する。`design.md` と既存コンポーネントのパターンに厳密に従う。

**ガードレール:** 任意値 (`shadow-[...]`, `size-[40px]`) 禁止、ロケール依存文字列の props 化、Radix Primitive がある場合は必ず使用、Self-review チェックリスト全項目チェック。

**詳細:** [workflows/component-implement.md](workflows/component-implement.md)

---

### D. component-modify (既存コンポーネントの変更)

**何をするか:** Figma の変更が起点ではない理由 (新しい capability の追加、バグ修正、規約への追従) で既存の React コンポーネントを変更する。C の姉妹ワークフロー — ゼロから書き直さず、変更が必要な箇所だけを特定する。

**ガードレール:** 公開 API/挙動を変える変更は必ず承認を取ってから実装 (`CLAUDE.md` §38 の Stop Conditions に従う)、`docs/components/<name>.md` を必ず確認・更新、`/test <Name>` を実行してから完了報告。

**詳細:** [workflows/component-modify.md](workflows/component-modify.md)

---

## 参考資料

### 共通

- **[references/design-principles.md](references/design-principles.md)** — カラー理論、フォント、コンポーネントのギャップ分析等のデザイン原則 (workflow A で主に使用)
- **[references/theme-verification.md](references/theme-verification.md)** — Light / Dark 検証の定義と必須 4 層 (workflow A, C, D と Figma 同期すべてで使用)
- **[references/component-spec-patterns.md](references/component-spec-patterns.md)** — バリアント軸・プロパティ命名・状態定義のパターン集 (workflow B, C 両方で使用)

### Figma 専用 (workflow B)

- **[references/kit-and-template.md](references/kit-and-template.md)** — Board Format + Kit アセットの完全インベントリ。最優先で読む
- **[references/guideline-template.md](references/guideline-template.md)** — ドキュメントフレーム 5 セクションの詳細仕様 (タイポ・サイズ・色・フォント制約)

### React 専用 (workflow C)

- **[references/react-patterns.md](references/react-patterns.md)** — tv() slots、Radix ラッパー、forwardRef、i18n props 等の実装パターン集

---

## 関連ファイル

- `design.md` — Sun Design System の単一仕様ファイル
- `figma-sync.config.json` — Figma ↔ Code 同期設定
- `.figma-sync/snapshots/latest.json` — 既存全コンポーネントのバリアント構造
- `scripts/global.css` — Figma トークン → CSS 変数
- `src/components/` — React コンポーネント実装
- `.env` の `FIGMA_FILE_KEY` — Figma ファイルキー (現在: `fSzxt8wKkXsn8fmxkPBUr2`)

## Figma 内の主要 nodeId (参考)

- Components ページ: `1:3`
- Support ページ: `152:2`
  - Kit セクション: `1663:8983`
  - Templatae セクション: `3956:3219`
  - Board Format: `1650:1714`
- Foundations ページ: `1:2`
