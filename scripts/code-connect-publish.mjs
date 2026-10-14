/**
 * Code Connect publish wrapper.
 *
 * ホワイトラベル運用の要:
 *   各 `*.figma.ts` に書かれた Figma URL は canonical ファイルを指したまま固定する。
 *   Figma ファイルを複製しても node ID は保存されるため、publish 時に fileKey 部分だけを
 *   `.env` の FIGMA_FILE_KEY に差し替えれば、全コンポーネントのマッピングが
 *   そのプロダクトのファイルに移る。定義ファイルを編集する必要はない。
 *
 * このスクリプトは figma.config.json 内の `$FIGMA_FILE_KEY` を解決した一時 config を作り、
 * それを Figma CLI に渡す。
 *
 * 使い方:
 *   node scripts/code-connect-publish.mjs             # publish
 *   node scripts/code-connect-publish.mjs --dry-run   # 検証のみ (追加引数はそのまま CLI に渡る)
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// scripts/fetch-figma-tokens.mjs と同じく Node 組み込みの loadEnvFile を使う
// (dotenv 依存は追加しない)。
try {
  process.loadEnvFile('.env');
} catch {
  // .env が無い場合は既存の環境変数をそのまま使う。
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = resolve(ROOT, 'figma.config.json');
const RESOLVED_DIR = resolve(ROOT, 'node_modules/.cache/figma-code-connect');
const RESOLVED_PATH = resolve(RESOLVED_DIR, 'figma.config.resolved.json');

const FILE_KEY_PATTERN = /^[0-9a-zA-Z]{22,128}$/;

function fail(message) {
  console.error(`\n[code-connect] ${message}\n`);
  process.exit(1);
}

const fileKey = process.env.FIGMA_FILE_KEY?.trim();
if (!fileKey) {
  fail('FIGMA_FILE_KEY が未設定です。.env に対象 Figma ファイルのキーを設定してください。');
}
if (!FILE_KEY_PATTERN.test(fileKey)) {
  fail(
    `FIGMA_FILE_KEY の形式が不正です: "${fileKey}"\n` +
      'URL 全体ではなく fileKey 部分のみを設定してください。\n' +
      '例: https://figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/... → fSzxt8wKkXsn8fmxkPBUr2',
  );
}

const token = process.env.FIGMA_ACCESS_TOKEN?.trim();
const passthrough = process.argv.slice(2);
const isDryRun = passthrough.includes('--dry-run');
if (!token && !isDryRun) {
  fail(
    'FIGMA_ACCESS_TOKEN が未設定です。\n' +
      'Figma → Settings → Security → Personal access tokens で発行し .env に設定してください。',
  );
}

// figma.config.json の $FIGMA_FILE_KEY を解決する。
// `_comment_*` キーは説明用なので CLI に渡す前に取り除く。
const raw = readFileSync(CONFIG_PATH, 'utf8');
const config = JSON.parse(raw.replaceAll('$FIGMA_FILE_KEY', fileKey));
for (const key of Object.keys(config.codeConnect ?? {})) {
  if (key.startsWith('_comment')) delete config.codeConnect[key];
}

const substitutions = config.codeConnect?.documentUrlSubstitutions ?? {};
const [canonicalUrl] = Object.keys(substitutions);
const canonicalKey = canonicalUrl?.split('/').pop();

mkdirSync(RESOLVED_DIR, { recursive: true });
writeFileSync(RESOLVED_PATH, JSON.stringify(config, null, 2));

console.log('[code-connect] canonical file :', canonicalKey ?? '(未設定)');
console.log('[code-connect] publish 先 file:', fileKey);
if (canonicalKey === fileKey) {
  console.log('[code-connect] → canonical ファイル自身に publish します (URL 置換なし)');
} else {
  console.log('[code-connect] → 複製ファイルへ publish します (fileKey のみ置換)');
}
console.log();

const args = ['figma', 'connect', 'publish', '-c', RESOLVED_PATH, '--exit-on-unreadable-files'];
if (token) args.push('-t', token);
args.push(...passthrough);

const result = spawnSync('npx', args, { stdio: 'inherit', cwd: ROOT });
process.exit(result.status ?? 1);
