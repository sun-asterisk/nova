# デザイン原則リファレンス

## カラー理論

### 色温度とブランド性格

| 色温度 | 印象 | 適するサービス |
|---|---|---|
| 暖色 (Red, Orange, Yellow) | エネルギー、親しみ、食欲 | 音楽、フード、SNS、エンタメ |
| 寒色 (Blue, Cyan, Teal) | 信頼、冷静、知性 | 金融、医療、ビジネスツール |
| 中性色 (Green, Purple) | 自然/成長、創造/高級 | 環境、教育、ラグジュアリー |
| 無彩色 (Gray, Black) | 洗練、ミニマル | ファッション、フォト、アート |

### ダークテーマのカラー設計

- 純粋な黒 (#000000) は避ける → ブランドカラーの暗い色 (#1a1614 等) を使う
- 背景にブランドカラーの微妙なティントを加えると統一感が出る
- テキストは純白 (#ffffff) より少し落としたオフホワイトが目に優しい
- アクセントカラーはライトテーマより彩度を落とすと映える

### コントラスト比の目安

| 用途 | 最低比率 | 推奨比率 |
|---|---|---|
| 本文テキスト | 4.5:1 (WCAG AA) | 7:1 (WCAG AAA) |
| 大きいテキスト (18px+) | 3:1 | 4.5:1 |
| 非テキスト要素 (アイコン等) | 3:1 | 4.5:1 |

### セマンティックカラーの慣例

- **Danger/Error** → Red 系（これは変えてはいけない。ユーザーの安全に関わる）
- **Success** → Green 系
- **Warning/Caution** → Yellow/Amber 系
- **Info** → Blue 系
- **Primary** → ブランドカラー
- **Emphasis** → ブランドカラーの濃い/薄いバリエーション

## 角丸 (Border Radius)

### ブランド性格と角丸の関係

| 角丸の大きさ | 印象 | 例 |
|---|---|---|
| 0-2px | シャープ、プロフェッショナル | Bloomberg, 日経 |
| 4-8px | バランス、スタンダード | GitHub, Notion |
| 12-16px | ソフト、フレンドリー | Spotify, Apple Music |
| 20px+ | 遊び心、カジュアル | Duolingo, LINE |
| Full (999px) | ピル型ボタン、モダン | iOS, Material You |

### 角丸の一貫性ルール

- 入れ子の要素の内側は外側より小さい角丸にする
  - カード (12px) の中のボタン (8px) の中のアイコン (4px)
- 同じ階層の要素は同じ角丸を使う
- フォーム要素 (Input, Textarea, Select) は同じ角丸にする

## スペーシング

### 8px グリッドシステム

基本単位を 8px とし、その倍数でスペーシングを定義する:
4, 8, 12, 16, 24, 32, 40, 48, 64, 80

### スペーシングとブランド性格

| 特徴 | 印象 | 適するサービス |
|---|---|---|
| タイト (標準の 90-95%) | 効率的、情報密度が高い | ダッシュボード、管理画面 |
| 標準 | ニュートラル | 汎用 |
| ゆったり (標準の 110-120%) | プレミアム、余裕 | 音楽、メディア、ラグジュアリー |
| 非常にゆったり (150%+) | アート、インパクト | ポートフォリオ、ランディングページ |

### 余白のヒエラルキー

```
コンポーネント内パディング < 要素間ギャップ < セクション間マージン
例: 8px < 16px < 32px (1:2:4 の比率)
```

## タイポグラフィ

### フォントペアリングの原則

**対比の法則:** 2つのフォントは十分に違うか、完全に同じかのどちらか。中途半端な類似は避ける。

| 組み合わせパターン | 例 | 適するケース |
|---|---|---|
| ジオメトリック + ジオメトリック | DM Sans + M PLUS 1p | 統一感重視、モダン |
| ヒューマニスト + ヒューマニスト | Inter + Noto Sans JP | 読みやすさ重視 |
| セリフ見出し + サンセリフ本文 | Playfair + Inter | エレガント、伝統 |
| モノスペース + サンセリフ | JetBrains Mono + Inter | テック、開発者向け |

### 日本語フォントの特徴

| フォント | 特徴 | 相性の良い英語フォント |
|---|---|---|
| Noto Sans JP | 端正、万能、やや硬い | Inter, IBM Plex Sans |
| M PLUS 1p | 丸みがある、柔らかい | DM Sans, Poppins, Quicksand |
| Zen Kaku Gothic New | モダン、個性的 | Manrope, Outfit |
| BIZ UDGothic | ユニバーサルデザイン、読みやすい | Inter, Figtree |
| IBM Plex Sans JP | テクニカル、信頼感 | IBM Plex Sans |

### ダーク背景でのタイポグラフィ

- フォントサイズを 1-2px 大きくする（暗い背景は文字が小さく見える錯覚）
- ウェイトを1段階落とす検討（Bold → Medium にすると光って見えにくい問題を回避）
- 行間 (line-height) をやや広めに (1.6-1.8)

## 業界別デザインパターン

### 音楽ストリーミング

- ダークテーマが標準（没入感）
- 角丸は大きめ (12-16px)
- スペーシングはゆったり（プレミアム感）
- フォントはジオメトリック系（モダン）
- アルバムアートが映えるよう、背景は低彩度

### SaaS / ビジネスツール

- ライトテーマが標準（長時間作業）
- 角丸は中程度 (4-8px)
- スペーシングは標準（情報密度のバランス）
- フォントはヒューマニスト系（読みやすさ）
- 青系のブランドカラーが多い（信頼感）

### EC / マーケットプレイス

- ライトテーマ（商品写真が映える）
- 角丸は中〜大 (8-12px)
- スペーシングはやや広め
- フォントは可読性重視
- アクセントカラーで CTA を目立たせる

### ソーシャル / コミュニティ

- ライト/ダーク両対応が期待される
- 角丸は大きめ (12-20px、親しみやすさ)
- スペーシングはゆったり
- フォントは丸みのある系統（フレンドリー）
- 鮮やかなアクセントカラー

## コンポーネントのギャップ分析チェックリスト

### 基本コンポーネント（ほぼ必須）

- [ ] Button（Primary, Secondary, Danger, Ghost/Plain）
- [ ] Input / TextField
- [ ] Textarea / TextareaField
- [ ] Checkbox
- [ ] Radio Group
- [ ] Switch / Toggle
- [ ] Select / Dropdown
- [ ] Badge / Tag
- [ ] Divider
- [ ] Tooltip
- [ ] Modal / Dialog
- [ ] Tabs
- [ ] Snackbar / Toast

### 拡張コンポーネント（用途に応じて）

- [ ] Icon Button
- [ ] Avatar
- [ ] Card
- [ ] Accordion
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Date Picker
- [ ] Slider / Range
- [ ] Progress Bar
- [ ] Skeleton / Loading
- [ ] Empty State
- [ ] Alert / Banner
- [ ] Navigation Bar
- [ ] Sidebar
- [ ] Table
- [ ] Dropdown Menu

### 業界特化コンポーネント

- 音楽: Player, Waveform, Playlist Card, Album Grid
- EC: Product Card, Cart, Price Tag, Rating Stars
- SaaS: Data Table, Chart, Dashboard Widget, Stat Card
- SNS: Post Card, Comment, Reaction, Story Ring
