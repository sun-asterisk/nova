# Changelog

`@sun-asterisk/nova` の変更履歴です。各バージョンの詳しい内容は[ドキュメントの更新情報](https://nova.sun-asterisk.com/)も参照してください。

## 1.0.2

ライブラリのコードと API に変更はありません。

### 変更

- `design.md` を実装と Figma の変更履歴に合わせました（フォント変数名 `--font-family-sds-sans`、import 例、セマンティックカラー、数値の余白・角丸スケール、影のレベル、Tabs と Snackbar の見た目）。未提供のコンポーネント（Card・Popover・Select・Tag・Toast など）を明記しました。
- Code Connect ガイドに、必要な Figma のプラン・シート・トークンのスコープを追記しました。
- Radio と Dropdown Menu のガイドラインで、選択肢が多いときの案内を揃えました。
- 監査エージェントとスキルの小さな誤り（影のクラス名、ワークフロー数など）を直しました。
- npm の説明文を Nova の名称と実態（Tailwind CSS は任意）に合わせました。

## 1.0.1

ライブラリのコードと API に変更はありません。

### 変更

- リポジトリ内のコメントと、Claude Code スキル・Figma 同期スナップショットの Figma ファイル参照を整理しました。

## 1.0.0 — 初回公開

Nova の React コンポーネントライブラリを `@sun-asterisk/nova` として公開しました。

### 含まれるもの

- **コンポーネント:** Avatar, Badge, Button（Icon Button を含む）, Checkbox, DatePicker / Calendar, Divider, DropdownMenu, Input / TextField, Textarea / TextareaField, Link, Modal, ProgressBar, RadioGroup, Scrim, Scrollbar, Snackbar, Spinner, StatusIcon, Switch, Tabs, Tooltip
- **アイコン:** 61 種（`@sun-asterisk/nova/icons`）
- **テーマ:** ThemeProvider（ライト / ダーク / システム、領域ごとのテーマ）とデザイントークンの CSS 変数
- **Figma Code Connect:** Nova の Figma ライブラリの各コンポーネントから、実際の React コードを参照できます
