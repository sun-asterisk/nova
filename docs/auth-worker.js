// docs サイト全体に Basic 認証をかける Worker。
// 認証情報は Worker Secrets (BASIC_USER / BASIC_PASS) に保存 — リポジトリには置かない。
// 変更方法: npx wrangler secret put BASIC_PASS --config docs/wrangler.jsonc
import { WorkerEntrypoint } from 'cloudflare:workers';

// 認証なしの公開入口。Service binding 経由でのみ呼べる (named entrypoint には公開 URL が
// ない) — Pages プロジェクト nova-landing が nova.sun-asterisk.com のドキュメント系パスを
// ここへ転送する。workers.dev へのアクセスは従来どおり下の export default (Basic 認証) に入る。
// 経緯・転送するパス一覧: sun-design-system-web 側の handoff-public-docs-on-nova-domain.md
export class PublicDocs extends WorkerEntrypoint {
  async fetch(request) {
    return this.env.ASSETS.fetch(request);
  }
}

export default {
  async fetch(request, env) {
    const auth = request.headers.get('Authorization') ?? '';
    const expected = 'Basic ' + btoa(`${env.BASIC_USER}:${env.BASIC_PASS}`);

    if (!timingSafeEqual(auth, expected)) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Sun Design System", charset="UTF-8"',
          'Cache-Control': 'no-store',
        },
      });
    }
    // 認証 OK → 静的アセットへ
    return env.ASSETS.fetch(request);
  },
};

// 長さの違いも含めタイミング差を作らない比較
function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // 長さが違っても同じ計算量で比較してから false を返す
    let diff = 1;
    for (let i = 0; i < ab.length; i++) diff |= ab[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
