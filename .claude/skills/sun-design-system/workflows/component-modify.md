---
name: workflow-component-modify
description: >
  既存の Sun Design System React コンポーネントを、Figma の変更が起点ではない理由 (新しい capability の追加、バグ修正、規約への追従、部分的なリファクタ) で変更するワークフロー。Figma 側の変更への追従 (ドリフト修正、`/component` の Classification F) も、Phase 1 の token drift / visual drift として扱う。
  このスキルは以下の場合に使うこと：ユーザーが「既存コンポーネントに ◯◯ を追加して」「Button に asChild を足して」「DropdownMenu の compound API を完成させて」等、Figma の更新を伴わない既存コンポーネントの API/挙動変更を求めたとき。/component <Name> --modify、または /component の分類結果が B (exists but incomplete) のときに使う。
---

# Component Modification Expert (Workflow D)

既存コンポーネントを、Figma 変更が起点ではない理由で変更するためのワークフロー。`component-implement.md` (Workflow C, 新規実装) と対になる、既存コンポーネント向けの姉妹ワークフロー。`docs/architecture/remediation-matrix.md` に記録されている作業パターン ── `Button` への `asChild` 追加、`DropdownMenu` の compound API 完成、`Switch` のステート修正など ── を、繰り返し可能な手順として明文化したもの。

## 最優先ルール (Prime Directives)

1. **コンポーネントをゼロから書き直さない。** 変更が必要な箇所だけを特定し、それ以外は触らない (`docs/architecture/remediation-matrix.md` の Wave 2-4 が模範例)。
2. **公開 API・挙動・exports を変える変更は、必ず承認を取ってから実装する。** `CLAUDE.md` §38 の Stop Conditions に従う — 黙って決めない。
3. **`docs/components/<name>.md` が存在すれば必ず読む。** 存在しない場合は、この変更を機に新規作成する (バックフィルとして全コンポーネント分を一括作成するのは対象外 — 触ったものだけ)。
4. **`docs/architecture/component-api-conventions.md` の該当ルール番号を必ず引用する。** 「なんとなく良さそう」ではなく、既存の明文化されたルールに沿っているかを確認する。
5. **`/test <Name>` を実際に実行してから完了報告する。** 実行せずに「たぶん通る」と書かない。

## ワークフロー (Phase 1-5)

### Phase 1: 差分分類 (必須)

対象コンポーネントの現在の実装を読み、要求されている変更を以下のいずれかに分類する:

- **token drift** — 使用しているトークンが古い/違う
- **visual drift** — 見た目が Figma と乖離
- **API gap** — 必要な prop/compound part が欠けている
- **missing state** — 必要な state (loading/error/indeterminate 等) が実装されていない
- **accessibility gap** — a11y 要件の未達
- **logic bug** — 実際に壊れている挙動
- **missing composition** — 合成可能であるべき箇所が硬直している
- **documentation gap** — 挙動はあっているが spec/docs が古い
- **test gap** — 挙動は正しいが regression test がない

証拠 (file:line) を伴わない分類は書かない。複数該当する場合はすべて列挙する。

### Phase 2: 既存 Spec の確認

`docs/components/<name>.md` が存在すれば読み、現在の Status / Quality Score / State Matrix / API セクションを把握する。存在しなければ、Phase 4 で新規作成することを明記して先に進む。

`docs/architecture/component-capability-matrix.md` にこのコンポーネントの既知の finding があれば確認し、今回の変更がそれと関係するか (例: 既知の finding を今回まとめて解消するのか、無関係の新規変更か) を明記する。

### Phase 3: 変更提案 (必須 — 承認を取ってから Phase 4 へ)

`component-implement.md` の Phase 3 と同じ構造の spec 宣言を、**今回変更する範囲だけ** に絞って書く:

```
Component: <Name> (modification)
File: src/components/<name>/

Classification: <Phase 1 の分類>

Change:
  - Before: <現状>
  - After: <変更後>
  - Reason: <なぜ>

API impact:
  - Public API changed? [yes/no] — yes の場合は破壊的変更かどうか明記
  - component-api-conventions.md の該当ルール: §<N> <ルール名>

Composition/Customization (該当する場合):
  - compound API か classNames か: <理由>
  - asChild が必要か: <理由 or 「不要」>

State Matrix diff (該当する場合):
  - 追加/変更される state と、その実装機構

Market benchmark (該当する場合):
  - market-benchmark.md の関連 capability 行と、今回の変更がそれにどう対応するか

Token Resolution (該当する場合):
  - component-implement.md Phase 2 と同じ形式の表

Breaking change? [yes/no]
  - yes の場合: Stop-Condition 扱い (`CLAUDE.md` §38)。承認なしに実装しない。
```

**公開 API・挙動を変えない変更 (バグ修正、内部リファクタ、test 追加) は、ユーザーが明示的に承認省略を許可した場合を除き、それでも spec を提示してから進める** — 「小さい修正のつもりが実は挙動を変えていた」ことを防ぐため、レビューなしの実装を許可しない。

### Phase 4: 実装

- 変更は最小限に留める。無関係なリファクタを混ぜない (`CLAUDE.md` の "Do not perform large-scale refactoring without explicit approval" を厳守)。
- `component-implement.md` の実装テンプレート・既存パターン踏襲ルールをそのまま適用する。
- `docs/components/<name>.md` を更新 (なければ `docs/components/_template.md` から新規作成) — 変更内容を Phase 3 の spec 差分から反映する。

### Phase 5: 検証と完了報告 (必須)

- `pnpm typecheck` / scoped `eslint` を実行し、結果を報告する (「たぶん通る」ではなく実行結果)。
- **Light / Dark 検証 (必須)** — [`references/theme-verification.md`](../references/theme-verification.md) の 4 層をすべて実行する: `pnpm figma:theme-check <fileKey> <nodeId>` (Figma の Light/Dark 値 ↔ `global.css`、全状態コントラスト)、`storybook` と `storybook-dark` の両プロジェクト、見た目を変えた箇所の light/dark 両テーマでのトークン解決型テスト (+ mutation)。結果を同ファイル末尾の形式で報告する。
- **`/test <Name>` を実行する。** 既存の regression test が今回の変更を正しく検知できるか (failure injection) を確認する — 可能なら、変更前の状態に一時的に戻して該当テストが real に失敗することを確認してから元に戻す (`CLAUDE.md` §23 の Mutation Testing Principle)。
- **`src/components/<name>/<Name>.figma.ts` が存在するか確認する。** 存在し、かつ今回の変更が public props/variants に影響する場合、`.claude/rules/figma-code-connect.md` §9 に従いマッピングを見直す — CI (`pnpm run code-connect:build`) は parse/typecheck エラーしか検知せず、値のズレ (§3 のバグ類) は検知しない。
- 完了報告は `component-implement.md` Phase 6 と同じ形式 + Quality Score/Status (`docs/architecture/component-development-system.md` 参照)。

## やってはいけないこと

- **要求されていない部分までリファクタする。**
- **公開 API/挙動の変更を、承認なしに「小さい修正」として紛れ込ませる。**
- **`docs/components/<name>.md` を確認せずに変更を始める。**
- **`/test <Name>` を実行せずに「Verified」「Certified」と報告する。**
- **Stop-Condition Log にある既存の deferred 項目を、今回のついでとして黙って解消する** (`docs/architecture/remediation-matrix.md` の Stop-Condition Log を必ず確認し、該当する場合は改めて承認を取る)。

## 参考

- 姉妹ワークフロー (新規実装): [component-implement.md](component-implement.md)
- API 規約: `docs/architecture/component-api-conventions.md`
- 過去の finding: `docs/architecture/component-capability-matrix.md`, `docs/architecture/market-benchmark.md`
- Stop-Condition の先例: `docs/architecture/remediation-matrix.md` の Stop-Condition Log
- 実装パターン集: [../references/react-patterns.md](../references/react-patterns.md)
- Quality システム: `.claude/commands/test.md`, `docs/architecture/component-development-system.md`
