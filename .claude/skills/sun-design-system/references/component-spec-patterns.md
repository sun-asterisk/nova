# Component Spec Patterns

既存コンポーネントから抽出した、バリアント軸・プロパティ命名・状態定義の典型パターン。新規コンポーネント設計時に参考にする。

## バリアント軸 (Variant Axes) のパターン

### Style (見た目の方向性) — actionable components 向け

Button / Icon Button が採用:
```
options: ["Primary", "Secondary", "Emphasis", "Plain", "Danger"]
```

- **Primary**: 主要アクション (`surface-primary` = neutral-700)
- **Secondary**: 代替アクション (outline, white bg)
- **Emphasis**: ブランドカラー強調 (`surface-emphasis` = red-500)
- **Plain**: 装飾なし (transparent)
- **Danger**: 破壊的操作 (red border, red text)

### Size

```
options: ["Large", "Medium", "Small"]
```

height 目安: Large=48px / Medium=40px / Small=32px。全部実装しなくてもよい (Switch は Large/Medium のみ)。

### State — interactive components 向け

**標準 (Button, Icon Button, Tab):**
```
options: ["Enabled", "Focus", "Hover", "Active", "Disabled"]
```

**Form fields (TextField, TextArea):**
```
options: ["Enabled", "Focus", "Filled", "Disabled", "Error"]
```

**注意:** Checkbox に `"Desabled"` (typo) が残っている。新規では必ず `"Disabled"` を使う。

**Switch:** `"Enabled", "Disabled", "Hover"` のみ (Focus/Active なし)。新規は 5 状態揃えるのが望ましい。

### Type / Selected / Active — 状態を持つ control 向け

- **Checkbox**: `Type` = `["Checked", "Unchecked", "Indeterminate"]`
- **Radio Button**: `Selected` = `["True", "False"]`
- **Switch**: `Active` = `["True", "False"]`

### Placement — positional components 向け

**Tooltip:** `["Top", "Bottom", "Right", "Left"]`

### Style — visual variation 向け

**Badge:** `["Count", "Dot", "Label", "Error"]` — content type 切り替え

---

## Component Properties (プロパティ) のパターン

### 型と用途

| 型 | 用途 | 例 |
|---|---|---|
| `TEXT` | 文字列を差し替えるプロパティ | Label / Title Label / Support Text Label |
| `BOOLEAN` | 表示/非表示、有効/無効のトグル | Prefix Icon / Suffix Icon / Badge / Tag / Support Text |
| `INSTANCE_SWAP` | 子インスタンスを差し替える (主にアイコン) | Icon / インスタンス |
| `VARIANT` | バリアント軸そのもの | Style / Size / State |

### 命名の慣例 (観察された事実と推奨)

**英語で統一が基本:**
- Button: "Label", "Prefix Icon", "Suffix Icon", "Style", "Size", "State"
- TextField: "Title Label", "Placeholder Text Label", "Support Text Label", "Support Text", "Tag", "Prefix Icon", "Suffix Icon", "State"
- Tab: "Text", "Icon", "Badge", "State"

**日本語を許容する例外:**
- Icon Button: `"インスタンス"` (INSTANCE_SWAP の名前) — 既存の慣例に従う場合はあり

**新規では英語で統一を推奨。** 既存で日本語が使われている箇所に合わせる場合は例外。

### デフォルト値の慣例

- TEXT デフォルト: 日本語 (`"ラベル"`, `"テキストを入力"`, `"サポートテキストが入ります"`) または英語 (`"Label"`)
- BOOLEAN デフォルト: Icon 系は `false` (無い状態が多い)、必須要素 (Support Text, Label 等) は `true`
- INSTANCE_SWAP デフォルト: 汎用アイコン (矢印、+、検索等) の component を指定

---

## 寸法・トークン適用の典型値

### Button (variant 数 5×3×5=75)

Medium size, Enabled state:
- w=auto (min 66), h=40
- padding: L=12, R=12, T=0, B=0
- gap: 4 (icon と text 間)
- radius: 8 (rounded-m)
- text: Noto Sans JP Bold 14px

| Style | Fill | Stroke | Text color |
|---|---|---|---|
| Primary | `#434343` (neutral-700) | none | white |
| Secondary | white | `#333333` (neutral-800) 1px | `#333333` |
| Emphasis | `#e62305` (red-500) | none | white |
| Plain | transparent | none | `#333333` |
| Danger | white | `#c50e03` (red-700) 1px | `#c50e03` |

### Text Field / Text Area

- w=320, h=95 (TextField) / 153 (TextArea)
- padding 0 (内部要素が自前で padding を持つ)
- gap 8 (ラベル/入力/補助テキスト間)
- text: Noto Sans JP Bold 14px (TextField) / Eina 03 Bold 14px (TextArea — 不一致ポイント)

**新規 form 系は Noto Sans JP に統一推奨。**

### Switch

- Large: 52×32, Medium: 40×24
- padding 2 (track inset)
- radius: 999 (full)
- Active=True fill: `#434343` (neutral-700)
- Active=False fill: `#b3bed0` (gray-300)

### Tooltip

- padding: L=8 R=8 T=4 B=4
- radius: 4 (rounded-s)
- fill: `#333333` (neutral-800)
- text: Noto Sans JP Regular 12px / white

### Badge

- 24px 高さ (Count/Dot/Error は正方形、Label は横長)
- radius: 見本で 0 だが実際の運用は pill (full) もあり
- text: Eina 03 12px (Regular or SemiBold)

---

## 状態別のスタイル差 (State Cascade)

1 つの Style × 1 つの Size に対して、State ごとに以下を変える:

| State | 変化する要素 |
|---|---|
| Enabled | 基準 |
| Hover | background を 1 段暗く / 明るく (`surface-primary-hover` 等) |
| Active | background をもう 1 段暗く (`surface-primary-active`) |
| Focus | `border-focus` (blue-600) 2px outline (元の border の上に重ねる) |
| Disabled | `surface-disabled` + `text-disable` + cursor 非インタラクティブ |
| Filled | Form 系: ユーザー入力が埋まっている状態。text を `text-primary` へ |
| Error | Form 系: border を `border-danger`, support text を `text-danger` へ |

---

## Figma Variables の bind 方法

色・余白・角丸は Figma Variables を使う。Hex 直書き禁止。

```js
// Variable 取得
const vars = await figma.variables.getLocalVariablesAsync('COLOR');
const primaryVar = vars.find((v) => v.name === 'surface/primary');

// fills に bind
frame.fills = [{
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0 },  // fallback
  boundVariables: {
    color: { type: 'VARIABLE_ALIAS', id: primaryVar.id },
  },
}];

// cornerRadius に bind
frame.setBoundVariable('cornerRadius', radiusMVar);

// padding に bind
frame.setBoundVariable('paddingLeft', spacingMVar);
```

**必要な Variable が存在しなければ:** 作業を止めてシニア (Opus) に報告。勝手に Hex で代替しない。

---

## バリアント展開の組み合わせ爆発

3 軸 (Style × Size × State) で 5×3×5 = 75 variant になる。**全展開が必要か** は設計書で判断:

- Button: 75 (全展開)
- Icon Button: 75 (全展開)
- Tab: 5 (State のみ展開、Size/Style はプロパティで分岐)
- Tooltip: 4 (Placement のみ)

**推奨ポリシー:**
- Interactive な主要コンポーネント (Button 系) は全展開
- 補助コンポーネントは最小軸のみ (例: State だけ、または 1 つの visual variant)
- 全展開しないと意味が薄い軸は variant に、プロパティで切り替えられる軸は BOOLEAN/INSTANCE_SWAP へ

---

## 破壊的変更を避けるルール

新規追加時に既存を破壊しないため:

1. **既存コンポーネントの figmaId を変更しない** (`.figma-sync/snapshots/latest.json` 参照)
2. **既存 Variable の削除・リネームをしない**
3. **既存バリアント options から選択肢を削除しない**
4. **既存コンポーネントの位置を動かさない**

違反しそうになったら、別タスク (Variable 設計見直し / 既存コンポーネント更新) として切り出して、本スキルの対象外にする。

---

## 典型的な落とし穴

- **フォントロード漏れ**: 使う全 style を `loadFontAsync` しないと text 作成が silently fail する。"Semi Bold" vs "Semibold" vs "SemiBold" のスペルが実ファイルごとに違うので注意
- **INSTANCE_SWAP の default 未設定**: 空だと Figma エディタで表示されない
- **radius=0 なのに rounded に見える**: fills や effects の blur がラウンドして見えるだけの場合あり。意図通りか確認
- **auto-layout の "HUG" と "FILL"**: `layoutSizingHorizontal` / `layoutSizingVertical` の設定忘れで思ったより縦/横に膨らむ
- **combineAsVariants 後の Property 名が自動生成になる**: 命名ルール (`Style=Primary`) と frame 名が一致するよう事前に調整
- **Variable が他ページ/他コレクションにある**: `getLocalVariablesAsync` だけでは拾えないケースがある。必要なら `getVariablesByCollectionAsync` を使う
