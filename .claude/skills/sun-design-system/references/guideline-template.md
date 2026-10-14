# Documentation Frame Template

> ⚠️ **このファイルはフォールバック/詳細仕様用。** 新規ドキュメント作成の **primary approach は Board Format (`1650:1714`) の clone** — 詳細は [kit-and-template.md](kit-and-template.md) を参照。
> 
> 本ファイルはタイポグラフィ数値・フォント制約・レイアウト仕様の原本として、Board Format が使えないケース (特殊幅・カスタム構造) や clone 後の微調整時に参照する。

Sun Design System の Figma Components ページにある、各コンポーネントのドキュメントフレームの完全仕様。新規コンポーネント追加時はこの仕様を**厳密に**守る。

## 外殻フレーム

```
Frame name: [Component Name]  (例: "Button", "Text Field")
Size: 2390px wide × variable height (ヘッダ + セクション合計)
layoutMode: VERTICAL
paddingTop/Bottom/Left/Right: 0
itemSpacing (gap): 0
fills: white (Surface/Base or 固定 #FFFFFF)  ★重要: 既存は白背景
Position: Components ページの既存フレーム右端 + 100px, y=3090 (既存と揃える)
```

この外殻の中に 5 つの Section を縦に並べる。各 Section が自分のパディング・背景・コンテンツを持つ。

---

## Section 1: Header

**目的:** コンポーネント名と 1-2 文の説明。**濃い赤色の背景** でブランドヘッダーとして視覚的に独立させる。

```
Frame: Header
Type: FRAME (または既存の共有 Header コンポーネントの INSTANCE でも可)
layoutMode: VERTICAL
padding: T=120, B=80, L=120, R=120
gap: 48
fills: Red/700 Variable (VariableID:155:589 時点) — ★必須。白背景にしない
  ※ Semantic の surface/emphasis (red-500) ではなく primitive Red/700 (#A5020A 相当) を使う
  ※ 既存 Button/Dropdown Menu 等もこの変数を使っている

Children:
  1. Title (TEXT)
     - content: "[Component Name]"  (英語、PascalCase spaced — 例: "Date Picker")
     - font: Eina 03 Bold
     - size: 64px
     - color: text/on-surface (白)  ★必須。text/primary ではない
  2. Description (TEXT)
     - content: 1-2 sentence description (日本語でもよい。本文は SF Pro を使うため Latin 中心)
     - font: SF Pro Regular
     - size: 24px
     - color: 白 (raw fill or text/on-surface)  ★必須。既存は raw 白
```

---

## Section 2: コンポーネント仕様

**目的:** 実際の COMPONENT_SET を埋め込み、バリアント軸の仕様を見せる。

```
Frame: Section — "コンポーネント仕様"
layoutMode: VERTICAL
padding: T=80, B=80, L=120, R=120
gap: 64

Children:
  1. Container > Wrapper (HORIZONTAL, gap=40)
     ├─ Heading Text (Eina 03 Bold 32px) — "[Component Name]"
     └─ Wrapper (VERTICAL, gap=32)
         ├─ Variant Panel (背景あり FRAME, padding T/B/L/R=80 or 80/80/180/180)
         │    └─ embed: COMPONENT_SET instance
         └─ Spec Row (HORIZONTAL, gap=16)
              Spec labels (Eina 03 SemiBold 18px)
              — 軸名と options を記載 (例: "Style: Primary / Secondary / Emphasis / Plain / Danger")
```

**Variant Panel の背景色:** `surface-base` (通常) または `background-container` (淡グレー)。フォームの場合は `background-container` 推奨。

---

## Section 3: ガイドライン

**目的:** コンポーネントの使い方・使い分け・Do's and Don'ts。

```
Frame: Section — "ガイドライン"
layoutMode: VERTICAL
padding: T=80, B=80, L=120, R=120
gap: 64

Children:
  1. Title Frame (HORIZONTAL, gap=16)
     ├─ Icon (INSTANCE of guideline icon)
     └─ Title Text: "ガイドライン" — SF Pro Bold 40px
  2-N. Container (複数)  — 各ガイドライン項目の単位
```

### Container (ガイドライン項目) の構造

```
Container
  layoutMode: VERTICAL
  gap: 24
  width: 2150px
  children:
    Wrapper (HORIZONTAL, gap=80)
      ├─ Left Module (width 500px, VERTICAL gap=24)
      │    ├─ SubHeading Text (SF Pro Bold 24px) — 項目タイトル
      │    ├─ Body Text (Noto Sans JP Regular 16px, line-height 1.6) — 説明文
      │    └─ [Optional] List items:
      │         Term (SF Pro Bold 16px) + Description (SF Pro Regular 16px)
      └─ Right Area (width 1570px)
           └─ Visual Example Frame (padding 80, 背景 bg-container)
                [COMPONENT_SET instance / 例示 UI / Do/Don't 対]
```

### 🚫 "Visual placeholder" 禁止ルール

**Right Area を `[Visual placeholder]` の文字入りダミー FRAME のままにしてはいけない。** ガイドラインの文章は、それに対応する視覚例がないと読者に意図が伝わらない。必ず **コンポーネント本体の instance を使った具体例** を作る。

- ✅ OK: 実際の Avatar instance を配置した「プロフィール行 (Avatar + 名前 + 役職)」の mockup
- ✅ OK: 4 サイズを並べた比較グリッド
- ✅ OK: desktop navbar 風の layout に Avatar を配置した mockup
- ✅ OK: Do パネルに「適切な instance」、Don't パネルに「違反例の instance」
- ❌ NG: `[Visual placeholder]` の TEXT だけの空 FRAME
- ❌ NG: コンポーネント instance を使わない抽象的な figma 図形

### 推奨 Container (項目) セットと視覚例の型

既存 Button を参考に、最低以下の 5 項目を含める:

| # | 項目 | Left (文章) | Right Area (具体的視覚例) |
|---|---|---|---|
| 1 | **設計の原則 (Design Principles)** | 何を解決するか・トーン | コンポーネントが他の要素と組み合わさった「実運用 context」の mockup (例: Avatar + 名前 + 役職の profile card) |
| 2 | **種類と使い分け (Types & Usage)** | variant ごとの使い分け説明 | 主要 variant を横並び比較。各 instance の下にラベルと補足テキスト |
| 3 | **バリエーション (Variations)** | size の用途ガイド | 全サイズを横並び。各 instance の下にサイズ名 (e.g. "Small 32px") |
| 4 | **配置 (Placement)** | desktop / mobile の配置指針 | 2 つの mockup を縦に:  (a) desktop (例: 1200px navbar に instance 配置)、(b) mobile (例: 400px list row に instance 配置)。各 mockup の下に文脈ラベル |
| 5 | **ラベルの付け方 / 使い方 (Labeling)** | 文言ルール | Do/Don't の 2 パネル。Do には適切な instance (例: "TY" の initials)、Don't には違反 instance (例: "TYI" 3 文字) + 理由の annotation |

### 視覚例作成時の具体的手順 (Sonnet に指示する内容)

1. `COMPONENT_SET.children.find(c => c.name === 'Type=X, Size=Y')` で variant を取得し `createInstance()` で instance 化する。手描きで avatar 風の circle を作らない。
2. instance の component properties (TEXT / INSTANCE_SWAP) は `instance.setProperties({ 'PropName#key': value })` で設定する。
3. 背景・ボーダーは必ず Variables (Surface/Base, Border/Weak 等) 経由で bind する。
4. mockup の他の要素 (ユーザー名テキスト、navbar タイトル、タイムスタンプ等) も Noto Sans JP で作る。
5. 各視覚例は Right Area (1570px) の中で自然に配置。大きすぎる場合は Right Area 内で center 寄せ、小さすぎる場合は padding を調整。

### Do/Don't モジュール構造

```
Do / Don't
  layoutMode: VERTICAL
  gap: 80
  width: 1400px
  children:
    2-column Wrapper (HORIZONTAL):
      ├─ Module (Do)
      │    ├─ Label "Do" — Eina 03 Bold 20px, color text-success (or text-primary)
      │    ├─ Sample (コンポーネント instance を含む実例 — 空 FRAME 禁止)
      │    └─ Support text — SF Pro Regular 16px (Do の理由)
      └─ Module (Don't)
           ├─ Label "Don't" — Eina 03 Bold 20px, color text-danger
           ├─ Sample (違反パターンの instance — 空 FRAME 禁止)
           └─ Support text — SF Pro Regular 16px (なぜダメか)
```

### Do/Don't モジュール構造

```
Do / Don't
  layoutMode: VERTICAL
  gap: 80
  width: 1400px
  children:
    2-column Wrapper (HORIZONTAL):
      ├─ Module (Do)
      │    ├─ Label "Do" — Eina 03 Bold 20px, color text-success (or text-primary)
      │    ├─ Sample (visual frame)
      │    └─ Support text — SF Pro Regular 16px
      └─ Module (Don't)
           ├─ Label "Don't" — Eina 03 Bold 20px, color text-danger
           ├─ Sample
           └─ Support text — SF Pro Regular 16px
```

---

## Section 4: デザイン仕様

**目的:** サイズ・余白・角丸の redline。設計思想も説明。

```
Frame: Section — "デザイン仕様"
layoutMode: VERTICAL
padding: T=80, B=80, L=120, R=120
gap: 64

Children:
  1. Title Frame (HORIZONTAL, gap=16)
     ├─ Icon (ruler icon INSTANCE)
     └─ Title Text: "デザイン仕様" — SF Pro Bold 40px
  2. Container
     └─ Wrapper (HORIZONTAL, gap=80)
          ├─ Left Module (width 500, VERTICAL gap=24):
          │    ├─ SubHeading (SF Pro Bold 24px) — 例: "サイズと余白"
          │    └─ Body (Noto Sans JP Regular 16px)
          └─ Right "2 row" Frame (width 1570, VERTICAL gap=80)
               ├─ Redline frame 1 (トークン注釈付き visual)
               └─ Redline frame 2
```

### Redline Frame の作り方 (空 frame 禁止)

**Design Spec の右側 2 行も具体的視覚にする。** 「Visual placeholder」の空 FRAME は禁止。

- **Row 1 (サイズ比較)**: 全サイズの instance を横並び + 各 instance 下に dimension ラベル (`"32px"`, `"40px"` 等) — Noto Sans JP Regular 12px, Text/Secondary
- **Row 2 (Token 注釈)**: 代表サイズの instance + その横に token annotation 凡例 (色スウォッチ + トークン名)
  - 例: 「Background: Surface/Secondary」「Text: Text/Primary + Noto Sans JP SemiBold」「Radius: radius/full」
  - 凡例は HORIZONTAL (swatch 16×16 + TEXT Noto Sans JP Regular 14px)

細かい redline (dimension 線とトークンチップ annotation 重ね) は手間がかかるため、v1 では上記の「instance + 凡例」形式を推奨。より詳細な redline が欲しい場合は Figma UI で後工程で追加する。

---

## Section 5: 更新履歴

**目的:** 変更履歴。初版リリース時は必ず最初のエントリを入れる。

```
Frame: Update Log
layoutMode: VERTICAL
padding: T=80, B=80, L=120, R=120
gap: 40

Children:
  1. Title Frame (HORIZONTAL, gap=16)
     ├─ Icon (history icon INSTANCE)
     └─ Title Text: "更新履歴" — SF Pro Bold 40px
  2. LogUnit (VERTICAL, gap=8) — 1 LogUnit = 1 日付分
     ├─ Date (SF Pro Bold 20px) — "YYYY-MM-DD"
     └─ List (VERTICAL, gap 4):
          各行 (HORIZONTAL, gap 8):
            ├─ Bullet (INSTANCE of bullet component)
            └─ Change Text (SF Pro Regular 16px)
```

### 初版の LogUnit

```
YYYY-MM-DD
・コンポーネント追加
```

---

## タイポグラフィ早見表 (必ずこれに従う)

| Role | Font | Size | Weight |
|---|---|---|---|
| Component title (Header) | Eina 03 | 64px | Bold |
| Section heading (Component Spec) | Eina 03 | 32px | Bold |
| Section heading (Guidelines / Spec / Log) | SF Pro | 40px | Bold |
| Sub-heading (項目タイトル) | SF Pro | 24px | Bold |
| Sub-sub-heading (Desktop/Mobile 等) | SF Pro | 20px | Bold / Semibold |
| Variant spec labels | Eina 03 | 18px | SemiBold |
| Do/Don't labels | Eina 03 | 20px | Bold |
| Body paragraph (日本語) | Noto Sans JP | 16px | Regular |
| Term / label in list | SF Pro | 16px | Bold |
| Description in list | SF Pro | 16px | Regular |
| Header description | SF Pro | 24px | Regular |
| Token chip | Roboto Mono | 12px | Medium |
| Changelog date | SF Pro | 20px | Bold |
| Changelog entry | SF Pro | 16px | Regular |

**フォントロード:** Sonnet は text 作成前に以下をすべて `loadFontAsync` する。

```js
await Promise.all([
  figma.loadFontAsync({ family: 'Eina 03', style: 'Bold' }),
  figma.loadFontAsync({ family: 'Eina 03', style: 'SemiBold' }),
  figma.loadFontAsync({ family: 'SF Pro', style: 'Bold' }),
  figma.loadFontAsync({ family: 'SF Pro', style: 'Semibold' }),
  figma.loadFontAsync({ family: 'SF Pro', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Noto Sans JP', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Roboto Mono', style: 'Medium' }),
]);
```

※ フォント名のスペースに注意。`Semi Bold` ではなく `Semibold` / `SemiBold` を実ファイルの指定に従って使い分ける。
ロードに失敗したら silently skip せず、**エラーとして報告** してシニアの判断を仰ぐ。

### ⚠️ 実運用上の制約: Eina 03 / SF Pro はプラグイン API でロード不可

**検証結果:**
- `Eina 03` と `SF Pro` は Figma ファイル内で使われているが、プラグイン API の `loadFontAsync` では **ロードできない** (private / cloud-hosted フォント)。
- `listAvailableFontsAsync()` が返す 7,700+ フォントに含まれず、プラグインから新規テキストに適用できない。
- 既存のテキストノードはエディタ UI (デスクトップアプリ) から適用されており、プラグイン経由では継承できない。

**運用上の選択肢:**

| 選択肢 | 方法 |
|---|---|
| A (推奨) | プラグインでは Noto Sans JP で構築する。Nova のタイポグラフィは欧文・和文とも Noto Sans JP なので、そのまま残してよい |
| B | Eina 03 / SF Pro が必要な見出しだけ、**Figma デスクトップアプリで手動置換** (後工程) |

**フォント代替マッピング:**
- `Eina 03 Bold` → `Noto Sans JP Bold`
- `Eina 03 SemiBold` → `Noto Sans JP SemiBold`
- `SF Pro Bold` → `Noto Sans JP Bold`
- `SF Pro Semibold` → `Noto Sans JP SemiBold`
- `SF Pro Regular` → `Noto Sans JP Regular`
- `Noto Sans JP Regular` → そのまま (ロード可)
- `Roboto Mono Medium` → そのまま (ロード可)
- Inter は使わない（Nova は Inter を採用していない）

**Sonnet への指示時:** 上記マッピングで代替フォントを指定し、「Eina 03 / SF Pro はプラグイン API でロード不可。Noto Sans JP を代替として使う（Inter は使わない）」と明記する。

---

## レイアウト数値まとめ

| 項目 | 値 |
|---|---|
| 外殻 Frame 幅 | 2390px |
| Section 共通 padding | T=80 B=80 L=120 R=120 (Header のみ T=120) |
| Section 間 gap | 外殻 gap=0 (各 Section 自前 padding で間隔作る) |
| Section 内 gap | 64 |
| Guideline Container 幅 | 2150px |
| Guideline Container gap | 24 |
| Left Module 幅 | 500px |
| Right Area 幅 | 1570px |
| Left↔Right gap | 80 |
| Visual Example 内部 padding | 80 (または 80/80/180/180) |
| Do/Don't Frame 幅 | 1400px |
| Do/Don't 内部 gap | 80 |
| Update Log LogUnit gap | 8 |
| Y 座標 (全コンポーネント共通) | 3090 |

---

## 色トークン (Figma Variables 経由で参照)

| 用途 | トークン |
|---|---|
| 本文テキスト | `text/primary` |
| 補助テキスト | `text/secondary` |
| ヒエラルキー強調 | `text/emphasis` (赤) |
| Do ラベル色 | `text/success` (or text/primary) |
| Don't ラベル色 | `text/danger` |
| Section 背景 | 無色 (外殻と同じ) |
| Variant panel 背景 | `surface/base` or `background/container` |
| Token chip 背景 | `surface/subtle` |
| Container 境界線 | 基本なし。必要時 `border/weak` |

**Hex 直書き禁止。** 必ず `fills` に bound variable を設定する:

```js
node.fills = [{
  type: 'SOLID',
  color: { r: 1, g: 1, b: 1 },  // fallback
  boundVariables: { color: { type: 'VARIABLE_ALIAS', id: '<variableId>' } }
}];
```

Variable ID は事前に `figma.variables.getLocalVariablesAsync()` で列挙して取得する。

---

## セクションタイトルアイコンの入手方法

Section 3 (ガイドライン)・Section 4 (デザイン仕様)・Section 5 (更新履歴) のタイトル行の先頭には、小さなアイコンを 40×40 で配置する。既存コンポーネントに同じものがあるので **clone で入手** する。

**取得方法 (Sonnet に指示):**

```js
// 既存 Button ドキュメントフレーム (nodeId 2002:1579) を inspect
const buttonDoc = await figma.getNodeByIdAsync('2002:1579');
// Section 3 (ガイドライン) > Title > 先頭子 = guideline icon
// Section 4 (デザイン仕様) > Title > 先頭子 = ruler icon
// Section 5 (更新履歴) > Title > 先頭子 = history icon

// icon は INSTANCE または FRAME なので clone:
const iconClone = originalIcon.clone();
targetTitleFrame.insertChild(0, iconClone);
// size を 40×40 に強制:
iconClone.resize(40, 40);
```

**注意:** 
- Guideline / Ruler アイコンは INSTANCE。`importComponentByKeyAsync` は private component のため失敗する。clone で入手する。
- History アイコンは local FRAME (複数 VECTOR 子) なので clone で入手。
- clone 直後に resize() を 40×40 に明示する (元サイズが大きい場合がある)。

---

## コンポーネント仕様 (Section 2) の背景

Section 2 の Variant Panel (COMPONENT_SET を埋め込む frame) は `Background/Container` (または同等の淡いグレー) で塗る。白背景の外殻の中で、COMPONENT_SET を視覚的に浮かせる効果がある。

padding は 80 前後 (大きめ — `80/80/180/180` の非対称パディングもあり)。

---

## 品質ゲート

以下をすべて満たさない限り「完成」としない:

- [ ] 外殻 Frame 幅 = 2390px
- [ ] 外殻 Frame fill が白 (Surface/Base or raw white)
- [ ] 5 Section がすべて存在 (Header / Spec / Guidelines / Design Spec / Update Log)
- [ ] **Header の背景が Red/700 Variable bind (濃い赤背景)**
- [ ] **Header Title の文字色が 白 (text/on-surface)**
- [ ] **Header Description の文字色が 白**
- [ ] Header の Title が Eina 03 Bold 64px (※プラグイン代替: Noto Sans JP Bold 64px)
- [ ] 各 Section の padding / gap が上記数値表と一致
- [ ] **Section 3/4/5 のタイトル行先頭に 40×40 アイコン INSTANCE が clone されている (guideline / ruler / history)**
- [ ] Section 2 の Variant Panel が Background/Container で塗られている
- [ ] ガイドラインが最低 3 項目、推奨 5 項目 (設計原則・種類・バリエーション・配置・ラベル)
- [ ] **各 Container の Right Area が空 FRAME / `[Visual placeholder]` TEXT ではなく、コンポーネント instance を使った具体例になっている**
- [ ] **Design Spec の右側 2 行も空 FRAME ではなく、instance を使った比較/注釈ビジュアルになっている**
- [ ] Do/Don't 対が最低 1 組存在
- [ ] **Do/Don't のサンプルパネルに instance (または実例) が入っている (空ではない)**
- [ ] 初回 Update Log エントリが入っている
- [ ] 全色が Figma Variables 経由 (boundVariables あり)
- [ ] 全フォントが正しいファミリ・サイズ・ウェイト (※ Eina 03 / SF Pro は Noto Sans JP で代替)
- [ ] 既存 Button / TextField のドキュメントフレームと横並びで違和感がない
