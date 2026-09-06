# PDF ビルドのセットアップと落とし穴

Markdown → HTML → Chromium の print-to-PDF で A4 の PDF を作る。pandoc も LaTeX も Typst も要らない。

ここに書いてある不具合は**どれも黙って壊れる**タイプで、出力を見ただけでは原因が分からない。PDF を作る前に一読すること。

## 作業ディレクトリを決める

**ユーザーの既存リポジトリの中に断りなく作らない。** 個人情報を扱ううえ、既存の `.gitignore` を書き換えることになる。専用ディレクトリを作るか、どこに作るかを確認する。

## セットアップ

`$SKILL` はこのスキルのディレクトリ（`SKILL.md` がある場所）。読み込んだスキルのパスをそのまま使う。分からなければ `find ~ -name SKILL.md -path '*cv-writer*'` で探せる。

```sh
SKILL=/path/to/cv-writer          # SKILL.md があるディレクトリ
mkdir -p src scripts dist
cp "$SKILL"/scripts/build.mjs "$SKILL"/scripts/lint.mjs "$SKILL"/scripts/lint-dictionary.json scripts/
cp "$SKILL"/scripts/style.css src/
cp "$SKILL"/assets/template-ja.md src/shokumu-keirekisho.md   # 英文なら template-en.md → src/resume.md
npm init -y && npm pkg set type=module
npm install markdown-it playwright-core
npm pkg set scripts.build="node scripts/build.mjs" scripts.lint="node scripts/lint.mjs"
```

`lint-dictionary.json` も一緒にコピーすること。**応募先の職種に合わせて用語を追記する**のが前提の辞書なので、スキル側ではなく作業ディレクトリ側で育てる。

`.gitignore` を**最初のコミットより前に**作る。一度履歴に入った個人情報はファイルを消しても残るため、後から直せない。

```
node_modules/
dist/
*.local.md
```

`dist/` を無視するのは、PDF にビルド時の実名が焼き込まれるため。**Markdown を伏せ字にして PDF をコミットする**のが最悪の事故パターン。

## 実行

```sh
npm run build          # dist/ に PDF、ページ数を表示
npm run build -- --png # 確認用 PNG も出力
npm run lint           # 表記ゆれ・未入力箇所の検出

npm run build -- src/other.md          # ソースを明示（dist はそのソース側に出る）
npm run build -- --name "山田 太郎"     # 氏名を埋めて出力（ファイルには書き込まない）
```

`--name` はファイルを書き換えずに氏名を埋めた PDF を作る。**提出用だけ実名にして、リポジトリにはプレースホルダーを残す**運用ができる。

Chromium が見つからない場合:

```sh
npx playwright install chromium          # 自分で入れる
CHROMIUM_PATH=/path/to/chrome npm run build   # 既存のものを指定
```

`PLAYWRIGHT_BROWSERS_PATH` が設定済みの環境（Claude Code のリモート実行環境など）では `playwright install` を実行しない。`build.mjs` がその配下を自動で探す。依存は `playwright` ではなく **`playwright-core`** にする。ブラウザを同梱しないぶん、プリインストール版とのバージョン不一致を避けられる。

## 落とし穴 1: 日本語が中国語の字形で出る

**最も見つけにくい不具合。** 多くの Linux 環境には中国語フォント（WenQuanYi Zen Hei など）が同居している。`font-family` を `sans-serif` で終わらせると、日本語のグリフが**中国語字形**で描画されることがある。文字化けではないので、ぱっと見では気づかない。

対策は、日本語フォントで**打ち止めにして** `sans-serif` へ落とさないこと。

```css
body { font-family: "IPAPGothic", "IPAGothic"; }   /* sans-serif を付けない */
```

**判別用の文字は「直」「骨」「次」「今」「者」。** これらは日中で字形が明確に違う。PDF を PNG にして目視確認する。

利用できるフォントは `fc-list | grep -iE "noto.*(cjk|jp)|ipa|source.?han"` で確認する。Noto Sans JP があればそれを先頭に置くのが最良。IPAGothic しかない環境ではゴシック体だけになるが、職務経歴書としては許容範囲（Word のテンプレートでもゴシック運用は普通）。

## 落とし穴 2: 段落内の改行が PDF に半角アキを作る

Markdown は改行を半角スペースに変換して HTML に出す。日本語の文の途中で改行すると、**PDF 上に不自然な空白が入る。**

**1段落 = 1行で書く。** git の diff が読みにくくなるが、出力の正しさを優先する。長い文は改行ではなく箇条書きに分解する（結果的に diff も読みやすくなる）。

英文ではこの問題は起きない（もともと単語区切りが半角スペースのため）。

## 落とし穴 3: ページ番号が出ない

Chromium は `@page` のマージンボックス（`@bottom-center`）を実装していない。CSS でページ番号を入れようとしても無視される。

Playwright の `displayHeaderFooter` + `footerTemplate` を使う。`.pageNumber` と `.totalPages` クラスの要素が置換される。

```js
displayHeaderFooter: true,
headerTemplate: "<div></div>",
footerTemplate: '<div style="font-size:8pt;width:100%;text-align:center;">' +
  '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
```

**`margin.bottom` をフッタ分（18mm 以上）確保する。** 足りないとフッタが本文に重なる。

## 落とし穴 4: 余白の二重指定

`page.pdf({ margin })` と CSS の `@page { margin }` を両方書くと競合する。**`build.mjs` の `margin` オプション側だけで指定し、CSS には書かない。**

## 落とし穴 5: フォントが解決されない

`page.setContent()` や `data:` URL で読み込むと、ローカルフォントの解決に失敗することがある。**一時 HTML をファイルに書いて `file://` で開く。** `build.mjs` はそうしている。

## 落とし穴 6: 長音記号が行頭に送られる

表の狭いセルで「プロジェクトリーダー」が「プロジェクトリ / ーダー」のように割れることがある。CSS に `line-break: strict;` を指定すると、行頭に来てはいけない文字（ー、、。など）の禁則処理が効く。

それでも語中で割れる場合は、セルに `white-space: nowrap` を当てるか、列幅を調整する。ただし他の列を圧迫してページ数が増えることがあるので、ページ数を測りながら判断する。

## 分量の詰め方

`build.mjs` は毎回ページ数を表示する。溢れたときは、まず CSS で詰めてから内容を削る。内容を削るのは最後の手段。

CSS の調整幅の目安（この範囲なら読みやすさを損なわない）:

| 項目 | 標準 | 詰めたとき |
|---|---|---|
| 本文 font-size | 10.5pt | 9.5pt |
| line-height | 1.75 | 1.5 |
| 表の font-size | 9.5pt | 9pt |
| 見出し h2 の上マージン | 16pt | 8pt |
| セルの padding | 3pt 5pt | 2pt 4pt |

**9pt 未満、line-height 1.4 未満にはしない。** 読みにくい書類は内容以前に不利になる。

超過量を正確に知りたいときは、印刷幅で本文の高さを測る。A4・左右余白 15mm なら本文幅 180mm ＝ 680px、1ページの高さは（297 − 上余白 − 下余白）mm を px に直した値。`scrollHeight` をこれで割ればページ数が出る。

内容を削る順序は次のとおり。

1. 古い案件の記述
2. 担当業務の箇条書き（4〜6個 → 3個）
3. スキル表の低レベル行
4. 自己PRの2本目

## 構造化データに分けるか

**単一文書・単一言語なら分けない。** Markdown を唯一のソースにする。職務経歴書は「面接前日に読み返す」「一文だけ直す」使い方が支配的で、`.md` をそのまま読める価値のほうが、YAML スキーマを設計・保守するコストより大きい。

例外は次の2つ。

- **個人識別情報** — 公開リポジトリで扱うなら `private/profile.json`（gitignore）に分け、ビルド時に置換する。目的は「最も事故りやすい情報だけを構造的にコミット不能にする」こと。private リポジトリならこの分離すら不要。
- **日英の出し分け** — 同じ経歴から2言語を生成する明確な要求があるとき。ただし和文と英文は構成の思想が違うので、共通データから両方をきれいに出すのは思ったより難しい。まず別々に書くことを検討する。
