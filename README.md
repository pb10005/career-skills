# career-skills

転職活動で使う Claude Code / Claude.ai 向けのスキル2つ。

| スキル | できること |
|---|---|
| [`cv-writer`](skills/cv-writer/) | 職務経歴書・英文レジュメを対話で作成し、Markdown から A4 の PDF まで生成する |
| [`career-strategy`](skills/career-strategy/) | 転職するかどうか・どの方向に進むかを決めるための戦略メモを作成する |

**業界・職種を問わず使えるように作ってあります。** ソフトウェア開発、営業、企画、研究、バックオフィスなど、職種によって変わるのは「何を数値で語るか」と「職務経歴を何で区切るか」だけで、進め方の骨格は共通です。

## なぜ作ったか

応募書類で落ちる原因の多くは、経歴が乏しいことではなく書き方にあります。とりわけ次の4つは本人には見えにくく、放っておくとほぼ必ず起きます。

1. **担当業務の羅列で終わり、成果がない** —「〜を担当」が10行並ぶ書類は差別化の材料がゼロになる
2. **主語が「チーム」で、本人の貢献が特定できない** — 採用側が知りたいのは個人に何ができるか
3. **規模が書かれていない** —「システムを開発」だけでは仕事の重さが伝わらない
4. **数値はあるが再現性が伝わらない** — 営業で起きやすい。「達成率130%」だけでは実力か市況か区別できない

`cv-writer` の中心は、これらを**ヒアリングの設計で構造的に潰す**ことです。フォーマットを整えるのは副次的な仕事にすぎません。

とりわけ効くのが**定量化プローブ**です。「成果を数値で教えてください」と聞くとほぼ確実に「特に数値はないです」で終わるので、代わりに Before/After と規模に分解して聞きます。

## インストール

```sh
git clone https://github.com/pb10005/career-skills.git
cp -r career-skills/skills/* ~/.claude/skills/
```

特定のプロジェクトだけで使うなら `~/.claude/skills/` の代わりに `<プロジェクト>/.claude/skills/` に置いてください。

インストール後、次のような相談をすると自動で読み込まれます。

- 「転職しようと思っていて職務経歴書を作りたい」
- 「今の会社に7年いるんですが、転職した方がいいでしょうか」
- 「オファーを2つもらっていて迷っています」

## PDF を作る

`cv-writer` には Markdown を A4 の PDF にするスクリプトが入っています。pandoc も LaTeX も要りません。Chromium の print-to-PDF だけで完結します。

```sh
SKILL=~/.claude/skills/cv-writer
mkdir -p src scripts && cd "$_/.."
cp "$SKILL"/scripts/{build.mjs,lint.mjs,lint-dictionary.json} scripts/
cp "$SKILL"/scripts/style.css src/
cp "$SKILL"/assets/template-ja.md src/shokumu-keirekisho.md
npm init -y && npm pkg set type=module
npm install markdown-it playwright-core
node scripts/build.mjs --png    # dist/ に PDF と確認用 PNG、ページ数を出力
node scripts/lint.mjs           # 表記ゆれ・全角英数字・未入力箇所を検出
```

セットアップの詳細と**既知の落とし穴**は [`skills/cv-writer/references/build-setup.md`](skills/cv-writer/references/build-setup.md) にあります。次のような、出力を見ただけでは原因が分からない不具合を扱っています。

- **日本語が中国語の字形でレンダリングされる** — 多くの Linux 環境に中国語フォントが同居しているため、`font-family` を `sans-serif` で終わらせると起きる。文字化けではないので気づきにくい
- **段落内の改行が PDF に半角アキを作る** — Markdown が改行を半角スペースに変換するため
- **ページ番号が出ない** — Chromium が `@page` のマージンボックスを実装していないため

## 中身

```
skills/
├── cv-writer/
│   ├── SKILL.md                     段階ヒアリング / 定量化プローブ / 分量予算 / 職種別の重点
│   ├── references/
│   │   ├── japanese-resume.md        日本の職務経歴書の構成と慣行、履歴書との関係
│   │   ├── english-resume.md         英文レジュメ（和文との思想の違い、ATS対策）
│   │   └── build-setup.md            PDF化の手順と落とし穴
│   ├── scripts/                      build.mjs / lint.mjs / lint-dictionary.json / style.css
│   └── assets/                       和文・英文の空テンプレート
└── career-strategy/
    ├── SKILL.md                     現状分析→選択肢→推奨→アクション→前提の5部構成
    └── references/frameworks.md      不満の切り分け、選択肢を広げる問い、情報の確度

examples/
└── sample-sales-ja.md               記入例（架空の人物・営業職）
```

[記入例](examples/sample-sales-ja.md)は営業職にしてあります。技術職以外でも機能することを示すためで、職務経歴の区切りが「案件」ではなく「担当領域と役割の変遷」になっている点、スキル表に「経験年数」列が無い点に注目してください（営業では全項目が同じ年数になり、情報量がゼロになります）。

## 設計上の判断

- **経歴を創作しない。** 埋まっていない項目はプレースホルダーのまま残し、本人に確認します。書類の数字は面接で必ず掘られるため、盛った瞬間に破綻します
- **実務経験のない技術をスキル表に書かない。** 資格だけ持っている領域は資格欄に書きます
- **年収相場や企業の内情を、確かめずに断定しない。** 生活の判断材料になるため、推定なら推定と明示します
- **転職ありきにしない。** `career-strategy` は「現職に留まる」案を必ず選択肢に含めます。相談してきた時点で本人は動く方向に傾いていることが多く、その傾きをそのまま増幅するのは助言になりません
- **分量を制約として扱う。** 先に予算を決めると、詳述する件数と1件あたりの字数が機械的に決まって迷いが消えます

## ライセンス

MIT
