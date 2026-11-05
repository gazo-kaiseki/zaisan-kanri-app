/**
 * 設定のひな形。
 *
 * GitHub Pages へのデプロイでは、このファイルは使われません。
 * Actions がリポジトリの Secrets（GAS_URL / CLIENT_ID）から config.js を生成します。
 *
 * ローカルや他のホスティングで試すときは、これを config.js にコピーして
 * 値を埋めてください。config.js は .gitignore されています。
 */
window.CONFIG = {
  /* GASウェブアプリのデプロイURL。末尾が /exec であること（/dev はデプロイ版ではない）。 */
  GAS_URL: '',

  /* Google Identity Services の OAuth クライアントID。
     GASの _設定 シートの「クライアントID」と同じ値にすること。 */
  CLIENT_ID: '',

  /* 任意。読み取りのバッファ設定。 */
  FLUSH_MS:         2000,  // この時間まとめてから送る
  FLUSH_COUNT:      3,     // この件数たまったら即送る
  SCAN_DEBOUNCE_MS: 2500,  // 同じコードを連続で拾ったとき無視する時間
  DECODE_FPS:       20,    // デコード試行の上限。上げると発熱とバッテリー消費が増える

  /* 保管場所が未登録の財産を読んだとき、その場で場所の入力を促すか。
     現物を見ている瞬間が最も確実なので既定で有効。false で無効化できる。
     確認そのものは先に記録されるので、「あとで」を押しても取りこぼさない。 */
  FORCE_PLACE_WHEN_EMPTY: true,
};
