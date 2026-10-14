// url=https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/SunDesignSystem?node-id=7837-3652
// source=src/components/snackbar/useSnackbar.tsx
// component=showSnackbar
//
// Snackbar は JSX ではなく showSnackbar() で命令的に表示する API (Snackbar 本体は非公開)。
// そのため example も関数呼び出しを出力する。
import figma from 'figma';

const instance = figma.selectedInstance;

// Variant — the nested Status Icon instance (component set 8867:2716,
// Status = Info / Caution / Danger / Loading / Success, all enumerated). The
// mapping used to ignore it, so every snackbar was generated as `info`
// (2026-10-07). Caution → warning, Danger → error (Snackbar's names).
const statusIcon = instance.getBoolean('Status Icon')
  ? instance.findInstance('Status Icon')
  : undefined;
const variant =
  statusIcon && statusIcon.type === 'INSTANCE'
    ? statusIcon.getEnum('Status', {
        Info: 'info',
        Caution: 'warning',
        Danger: 'error',
        Loading: 'loading',
        Success: 'success',
      })
    : undefined;

const title = instance.getBoolean('Title') ? instance.getString('Title Label') : undefined;
const message = instance.getString('Description');
const closable = instance.getBoolean('Close Button');

// Progress Bar = task progress (Figma uses it only with the Loading status,
// e.g. "1件のファイルをアップロード中…"); it is NOT an auto-dismiss countdown —
// the old mapping turned "Progress Bar OFF" into `duration: false`, which made
// every regular Figma snackbar never auto-dismiss. The template cannot read
// the bar's fill width, so it emits the starting value `progress: 0` for the
// consumer to update.
const showProgress = instance.getBoolean('Progress Bar');

// Figma の Action 1 / Action 2 は onClick ハンドラを持てないため actions には
// マッピングしない (SnackbarActionConfig は onClick が必須で、出力するとコンパイルできない)。
// 必要な場合は利用側で actions を追加すること。

// 条件付きで存在する値は必ずガードしてから埋め込む (.claude/rules/figma-code-connect.md §3)。
// - variant: 'info' (code default) のときは省略
// - title: Title トグル OFF なら省略 (2026-10-07 から title は省略可能。Figma のほとんどの
//   Snackbar はメッセージのみ)
// - closable: コード側の既定値は `true`。OFF のときだけ `closable: false` を出力する
export default {
  example: figma.code`
showSnackbar({${
    variant && variant !== 'info'
      ? figma.code`
  variant: '${variant}',`
      : ''
  }${
    title
      ? figma.code`
  title: '${title}',`
      : ''
  }${
    message
      ? figma.code`
  message: '${message}',`
      : ''
  }${
    showProgress
      ? figma.code`
  progress: 0,`
      : ''
  }${
    closable
      ? ''
      : figma.code`
  closable: false,`
  }
})`,
  imports: ['import { showSnackbar } from "@sun-asterisk/nova"'],
  id: 'snackbar',
  metadata: { nestable: false },
};
