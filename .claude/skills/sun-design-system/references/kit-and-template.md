# Kit & Template — Support ページの公式アセット

Sun Design System の Figma ファイルには、Support ページ (`152:2`) にドキュメント作成用の公式アセットが用意されている。**新規コンポーネントドキュメントを作るときは、スクラッチで Frame を積み上げず、ここから複製する。**

## なぜ Board Format / Kit を使うか

- 既存コンポーネントと一貫した構造・文字組・色が自動で担保される
- Header / Do-Don't / Redline / ContrastCheck 等を 1 から再発明しなくてよい
- 将来テンプレートが更新されたときに、全コンポーネントが追従しやすい
- スクラッチ構築で起きがちな「幅を間違える / padding を忘れる / アイコンが入らない」事故を回避できる

---

## Board Format (Template) — 主経路

**nodeId:** `1650:1714`
**既定サイズ:** 2000 × 5722 px
**位置:** Support ページ内 "Templatae" セクション (`3956:3219`) 配下

### 構造 (5 セクション固定)

```
Board Format (FRAME 2000px wide、VERTICAL auto-layout)
├─ Header  (INSTANCE of Kit Header 152:14, 2000×350)
│    - Title (TEXT prop)
│    - Description (TEXT prop)
├─ Master Component  (2000×902)
│    - Column headers (Medium / Small 等の Size 列)
│    - Row labels (Enabled / Focus / Hover / Active / Disabled の State 行)
│    - Wrapper  (1760×674) ← ここに COMPONENT_SET instance を配置
├─ Guideline  (2000×3314)
│    - 複数 Container 可。各 Container は「Description (左 500px) + Wrapper (右 1180px)」形式
│    - Wrapper は 4 type から選ぶ (次節参照)
├─ Section  (2000×732) — 追加セクション用の汎用枠
│    - Title frame + Wrapper (1760×460)
└─ Update Log  (2000×424)
     - Title + LogUnit repeating rows
```

### 幅は可変

`Board Format` の既定は 2000px だが、**コンポーネントに応じて outer FRAME をリサイズしてよい。** 大量 variant を横並び showcase したい場合は 2390px や 2800px に広げる。

```js
boardClone.resize(newWidth, boardClone.height);
// 内部の Wrapper 幅は auto-layout FILL により自動追従する (Master Component / Section / Guideline の Wrapper は FILL 前提)
// Update Log / Header は 2000 固定が多いので個別にリサイズが必要な場合は確認
```

### Guideline Container の Wrapper Type (4 種)

Board Format の Guideline セクションには、以下 4 タイプの Container プリセットが含まれる。ユースケースに応じて **どれを複製して使うか** を設計時に決める。

| Wrapper Type | nodeId | 用途 |
|---|---|---|
| **Wrapper Single** | `2182:1797` | 単一コンポーネント例 (profile card mockup 等) |
| **Wrapper Row** | `12669:13717` | 横並び比較 (variant / size の比較) |
| **Wrapper Column** | `12669:14023` | 縦積み (状態遷移、form field states 等) |
| **Wrapper Do/Don't** | `12669:14318` | Do / Don't 対。Kit の `Do` COMPONENT_SET を instance 化して配置 |

**使い方:** 必要な Container を複製して、不要なものは削除。例: 5 項目のガイドラインなら Wrapper Single × 2 + Wrapper Row × 1 + Wrapper Do/Don't × 1 + Wrapper Column × 1 のような組み合わせ。

---

## Kit — 再利用アセット (atomic)

**nodeId:** `1663:8983`
**配置:** Support ページ内 "Kit" セクション

Kit の各 COMPONENT / COMPONENT_SET は、Board Format の中でも使われているが、追加で individual に instance 化して overlay や annotation に使える。

### 文書構造系

| 名前 | ID | 型 | 用途 | 主要 Property |
|---|---|---|---|---|
| **Header** | `152:14` | COMPONENT | ページ先頭タイトル帯 (濃赤背景) | Title (TEXT), Description (TEXT) |
| Doc. | `8095:4359` | FRAME | Doc 枠のミニマル版 | — |

### アイコン (Section title 用)

| 名前 | ID | 用途 |
|---|---|---|
| `Icon / Components` | `3584:1884` | Master Component セクションタイトル先頭 (32×32) |
| `Icon / Guideline` | `3202:2206` | Guideline セクションタイトル先頭 |
| `Icon / Ruler` | `3202:2205` | Design Spec / Redline セクションタイトル先頭 |
| (History icon) | — | Update Log セクション用 (Board Format 内に既配置) |

### 色・トークンラベル

| 名前 | ID | 型 | Property | 用途 |
|---|---|---|---|---|
| **Color block** | `154:3` | COMPONENT_SET | Size=Large/Small; TEXT: Opacity, Code, Name, Red, Green, Blue | カラーパレット swatch |
| **StyleTag** | `1676:9226` | COMPONENT | TEXT: Text (default "Token Name") | トークン名ラベル (135×27) |
| **ColorCode** | `1663:8940` | COMPONENT | — | インライン hex chip (86×30) |
| **DesignTokens** | `3160:2289` | COMPONENT | — | トークン参照ラベル (111×25) |
| **Code** | `13505:8632` | COMPONENT | — | インラインコード chip (46×22) |

### Guideline 補助

| 名前 | ID | 型 | Property | 用途 |
|---|---|---|---|---|
| **Do** | `3232:1270` | COMPONENT_SET | Variant=Do/Don't | **Wrapper Do/Don't 内で使う標準の Do/Don't フレーム** |
| **ContrastCheck** | `3193:1001` | COMPONENT_SET | Raito=4.5:1/3:1 × Mode=Light/Dark | アクセシビリティ検証ウィジェット |

### Redline / 注釈

Design Spec セクションで redline 注釈を付けたいとき:

| 名前 | ID | 型 | Property | 用途 |
|---|---|---|---|---|
| **Measure** | `3137:1860` | COMPONENT_SET | Color=Red/Green/Blue; Position=←↑↓→; Value (TEXT) | 単一寸法矢印 |
| **Area** | `3174:2300` | COMPONENT_SET | Color=Red/Green/Blue/Gray; Outline=Solid/Dashed/Dotted/None; Fill (BOOL) | 領域ハイライト矩形 |
| **Line** | `3182:2537` | COMPONENT_SET | Line=Arrows/Lines/Dotted | 連結線 |
| **Range** | `3184:1011` | COMPONENT_SET | Color=Red/Green/Blue; Position=←↑↓→; Value (TEXT) | 範囲 (両端矢印) 注釈 |
| **Style** | `9272:4553` | COMPONENT_SET | Label (TEXT, default "Token"); Position=←↑↓→ | トークン名引き出し線ラベル |

### プリミティブ

| 名前 | ID | 用途 |
|---|---|---|
| `Bullet` | `1663:8949` | 8×8 bullet dot (Update Log 等の箇条書き) |
| Number bubble ×4 | `3174:2142–2156` | 番号付き callout |
| `Squircle` | `13505:10326` | 64×64 スクイークル |
| Cursor/* ×5 | `9863:1069–1073` | カーソル状態アイコン |

---

## クローンの具体的手順 (Sonnet への指示)

### Step 1: Board Format を複製

```js
// Board Format を取得
const boardFormat = await figma.getNodeByIdAsync('1650:1714');
const componentsPage = await figma.getNodeByIdAsync('1:3');

// 複製 (clone) して Components ページに移動
const newDoc = boardFormat.clone();
componentsPage.appendChild(newDoc);

// 配置位置 (既存の右端 + 100)
let rightmost = 0;
for (const c of componentsPage.children) {
  const right = c.x + c.width;
  if (right > rightmost) rightmost = right;
}
newDoc.x = rightmost + 100;
newDoc.y = 3090;
newDoc.name = '<Component Name>';  // 例: "Progress Bar"

// 必要に応じてリサイズ (コンポーネントの variant 数に応じて)
if (needsWiderCanvas) {
  newDoc.resize(targetWidth, newDoc.height);
}
```

### Step 2: Header INSTANCE のプロパティを swap

複製された Board Format の中に Kit Header の INSTANCE が既にある。Title / Description を swap する。

```js
const headerInstance = newDoc.findOne(n => n.type === 'INSTANCE' && n.mainComponent.id === '152:14');
headerInstance.setProperties({
  'Title': '<Component Name>',
  'Description': '<1-2 文の説明>',
});
```

※ Header の property 名は実際には `"Title（Style Name or Component Name）"` のようなフル文字列の可能性。実行時に `headerInstance.componentProperties` を introspect してから setProperties する。

### Step 3: Master Component セクションの Wrapper に COMPONENT_SET を配置

```js
const masterSection = newDoc.findOne(n => n.name === 'Master Component');
const masterWrapper = masterSection.findOne(n => n.name === 'Wrapper');
// 既に作成済みの Avatar 等の COMPONENT_SET を移動
masterWrapper.appendChild(componentSet);
```

### Step 4: Guideline Container をユースケースに応じて複製・調整

Board Format の Guideline セクションに最初から入っている 4 Container (Wrapper Single / Row / Column / Do-Don't) のうち、使うものを残して他を削除。または必要な数だけ duplicate。

```js
const guidelineSection = newDoc.findOne(n => n.name === 'Guideline');
const allContainers = guidelineSection.children.filter(c => c.type === 'FRAME');
// 例: Wrapper Do/Don't (12669:14318 由来) だけ複製して使う
```

各 Container 内の:
- Description (左 500px) → サブ見出しと本文 TEXT を書き換え
- Wrapper (右 1180px) → コンポーネント instance を配置 (絶対 `[Visual placeholder]` のまま放置しない)

### Step 5: Wrapper Do/Don't 内に Do COMPONENT_SET instance を配置

```js
const doSet = await figma.getNodeByIdAsync('3232:1270');  // Kit Do
const doInstance = doSet.defaultVariant.createInstance();
doInstance.setProperties({ 'Variant': 'Do' });
// Don't 版も同様
const dontInstance = doSet.defaultVariant.createInstance();
dontInstance.setProperties({ 'Variant': "Don't" });
```

### Step 6: Update Log に初回エントリ追加

Board Format の Update Log セクションには LogUnit が空で入っている。日付と変更内容を書き込む。

### Step 7: 不要セクションの削除

Board Format に含まれている汎用 "Section" (2000×732) は、追加で使わないなら削除してよい。

### Step 7.5: COMPONENT_SET と Wrapper のサイズ衝突チェック

Master Component Wrapper は Board Format のデフォルトで **1760px 幅**。COMPONENT_SET がこれより大きい場合、Wrapper からはみ出す。

```js
const tableSet = await figma.getNodeByIdAsync(componentSetId);
const wrapper = masterSection.findOne(n => n.name === 'Wrapper');
if (tableSet.width > wrapper.width) {
  // オプション 1: Master Component 外側ラベル (Column/Row headers) を削除
  //                 — 元々 Button-style 前提の axis labels。COMPONENT_SET の内蔵 variant name で十分
  // オプション 2: 外殻 FRAME と Master Component を widen (2200px 等)
  // オプション 3: COMPONENT_SET の variant 配置を縦積みに再構成 (通常非推奨)
}
```

**推奨:** オプション 1 (外側ラベル削除)。

COMPONENT_SET は Figma エディタ側で各 variant に「Density=Comfortable, Selectable=False」のような variant 名を自動表示するので、外側の "Density" "Selectable" テキストラベルは冗長。削除した方がクリーンに見える。

### Step 8: Container 内 placeholder の audit (必須)

**Board Format の Wrapper は汎用テンプレートとして、複数の placeholder frame / stub を持つことが多い。** そのまま使うと中身を入れた部分の下に空の箱が残る。必ず audit する。

#### audit 手順 (各 Container で)

```js
// Container 内の Wrapper (Right area) 子要素を調べる
const wrapper = container.findOne(n => n.name === 'Wrapper' /* または相当する名前 */);
const placeholders = wrapper.children;  // 複数ある可能性
placeholders.forEach(p => {
  console.log(p.id, p.name, p.width, p.height, p.children.length);
});
```

#### 対応ルール

コンポーネントの複雑度と用途に応じて判断:

1. **placeholder 数 > 必要な視覚例数** → 余分な placeholder frame を `.remove()` で削除
2. **placeholder 数 < 必要な視覚例数** → 既存 placeholder を `.clone()` して slot を増やす
3. **placeholder が必要なサイズより大きい** → `.resize(w, h)` で調整するか、親 Container の `layoutSizingVertical = 'HUG'` にして content に fit させる

#### Container 高さの HUG 化

Board Format の Container が FIXED 高さになっている場合、content を入れても空白が残る。auto-layout でのみ HUG 化可能:

```js
if (container.layoutMode !== 'NONE') {
  container.layoutSizingVertical = 'HUG';  // content に fit
}
// Wrapper (Right area) も同様
if (wrapper.layoutMode !== 'NONE') {
  wrapper.layoutSizingVertical = 'HUG';
}
```

#### 視覚例の必要数の目安

| 用途 | 視覚例数の目安 |
|---|---|
| 設計の原則 | 1 (context mockup) |
| 種類と使い分け | 1 (全 Type を 1 つの視覚内で横並び) |
| バリエーション | 1 (全 Size を 1 つの視覚内で横並び) |
| 配置 | 2 (desktop + mobile) — Wrapper Column を使うのが適切 |
| ラベルの付け方 (Do/Don't) | 2 (Do + Don't) — Wrapper Do/Don't を使うのが適切 |
| 状態 (State) の説明 | Interactive コンポーネントの場合のみ。5 state 展開 |
| アクセシビリティ | ContrastCheck widget 1 つ (必要に応じて) |

**複雑なコンポーネント (Modal / Form 等)** は追加の視覚例が必要になるので、Container を複製して各視点 (構造 / 配置 / 状態 / 入れ子パターン 等) を示す。

**シンプルなコンポーネント (Divider / Badge / Avatar 等)** は 1 Container 1 視覚例で十分。Board Format が 2 placeholder を持っていたら 1 つ削除。

---

## フォールバック: Board Format が使えないケース

以下のような特殊要件がある場合のみ、スクラッチ構築に切り替える:

- Board Format の 5 セクション構造に収まらない特殊レイアウト (例: インタラクティブ prototype が多い)
- 幅を 2000px から大きく外した独自レイアウトが必要 (2390px+ など)

その場合は [`guideline-template.md`](guideline-template.md) の仕様 (典型的な数値・タイポグラフィ・Variables bind 方法) を参考にスクラッチ構築する。ただし **既存コンポーネントとの一貫性が落ちる** ので、選択は慎重に。

---

## 品質ゲート (Kit/Template 使用時)

- [ ] Board Format (`1650:1714`) から clone で基盤を作った (スクラッチ構築ではない)
- [ ] Header の Title / Description を setProperties で swap 済み
- [ ] Master Component の Wrapper に COMPONENT_SET instance が配置されている
- [ ] Guideline の各 Container の Wrapper に具体的視覚例が配置されている (`[Visual placeholder]` 禁止)
- [ ] **各 Container 内の未使用 placeholder frame が削除されている (空の箱が残っていない)**
- [ ] **各 Container の高さが content に fit している (余分な空白が残っていない)**
- [ ] Do/Don't が必要な項目は Kit `Do` (`3232:1270`) の Variant=Do / Don't instance で構成されている
- [ ] Section icons (Components/Guideline/Ruler) が正しく配置されている
- [ ] Update Log に初回エントリが入っている
- [ ] 不要な汎用 Section が削除されている
- [ ] 外殻 FRAME のサイズがコンポーネントに適切 (2000px 基準 + 必要に応じてリサイズ)
- [ ] **全テキストノードが Noto Sans JP を使用している (Inter は使わない。Eina 03 / SF Pro は loadFontAsync で失敗し placeholder が render されるため)**
