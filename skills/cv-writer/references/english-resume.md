# 英文レジュメ（Resume / CV）

## 和文の職務経歴書との違い

翻訳ではなく別の文書として作る。思想が違う。

| | 日本の職務経歴書 | 英文レジュメ |
|---|---|---|
| 長さ | A4 2枚が標準 | **1枚**（10年超でも2枚まで） |
| 会社情報 | 事業内容・従業員数を書く | 原則書かない（無名企業なら1行の説明を添える） |
| 個人情報 | 氏名・作成日 | 氏名・連絡先・LinkedIn。**写真・年齢・性別・国籍は書かない**（差別禁止法制のため、書くと逆に扱いに困られる） |
| 文体 | です・ます調の文 | 主語を省いた動詞始まりの箇条書き。ピリオドの有無は統一すれば可 |
| 自己PR | 末尾に300〜500字 | 存在しない。冒頭の Summary が兼ねる |
| 成果 | 担当業務と分けて書く | **箇条書き1つの中に行動と結果を同居させる** |

「CV」は語の指す対象が地域で異なる。米国では学術職向けの長い業績書、英国・欧州・豪州では一般の応募書類（＝米国の resume）を指す。**どちらの意味かを Stage 0 で確認する。**

## 構成

```
NAME
City, Country | email | phone | linkedin.com/in/xxx | github.com/xxx

SUMMARY            3〜4行。任意だが、職種転換や経歴に説明が要る場合は必須
EXPERIENCE         逆編年。本体
SKILLS             カテゴリ別に列挙
EDUCATION          経験が浅いうちは上に、経験が増えたら下に
CERTIFICATIONS     該当があれば
```

日本の職務経歴書と違い、**Skills を Experience の後ろに置くか前に置くかは職種次第**。技術職で応募先がキーワード検索をかける前提なら前に出してよい。

## Experience の書き方

```
Job Title | Company Name | City, Country                      Mon YYYY – Mon YYYY
One line describing the company if it is not internationally known.
- Action verb + what you did + quantified result
- Led a team of 5 engineers to rebuild the billing pipeline, cutting month-end close from 5 days to 8 hours
- Reduced infrastructure spend 30% ($43k/year) by rightsizing compute and introducing autoscaling
```

**核心は「行動と結果を1つの箇条書きに同居させる」こと。** 日本式のように担当業務と成果を分けると、英文では冗長で弱く見える。

- **動詞で始める。** Led, Built, Reduced, Launched, Negotiated, Owned...
- **"Responsible for" を使わない。** 責任範囲ではなく実際にやったことを書く形式なので、この語は情報量を落とす。
- **数値を入れる。** 割合と絶対値の両方があれば両方書く（30% と $43k/year）。
- **1社あたり3〜6個。** 直近の職務を厚く、古いものは2〜3個に絞る。
- **現職は現在形、過去の職は過去形。** 混ぜない。

### 動詞の選び方

役割の階層が動詞に出る。過小な動詞を選ぶと実力より低く読まれる。

| 階層 | 動詞の例 |
|---|---|
| 主導・意思決定 | Led, Owned, Drove, Spearheaded, Founded, Defined |
| 構築・実行 | Built, Designed, Implemented, Developed, Launched, Automated |
| 改善 | Reduced, Increased, Accelerated, Streamlined, Optimized, Consolidated |
| 対人・折衝 | Negotiated, Partnered, Coordinated, Mentored, Trained, Advised |
| 分析 | Analyzed, Identified, Forecasted, Modeled, Evaluated |

## 日本の経歴を英文にするときの注意

- **職位の直訳は通じない。** 「主任」「係長」「課長代理」は英語圏の階層と対応しない。Team Lead / Engineering Manager / Senior xxx など、**実際の責任範囲に対応する語**を選ぶ。人数と予算を併記すると誤解が減る。
- **会社の規模と業種を1行で補う。** 日本国内では有名でも海外では無名なことが多い。`Acme Corp — Japanese IT consulting and system integration firm, 17,000 employees` のように、業種・国・規模を1行で添える。**社の規模や順位を書くなら本人に確認する。推測で「largest」などと書かない。**
- **新卒一括採用・年功の文脈は説明しない。** 説明しても伝わらず、行数を食うだけ。役割と成果だけ書く。
- **「調整」を Coordinated だけで済ませない。** 日本の職務では調整が実質的な意思決定を含むことが多い。決めたのなら Decided / Defined / Resolved を使う。
- **謙譲表現を持ち込まない。** 「〜させていただきました」的な語感を英語に持ち込むと、貢献が無かったように読まれる。

## Summary

3〜4行。次を入れる。

1. 何年の、何の専門家か
2. 直近の役割と扱っている規模
3. 代表的な成果（数値付き）
4. 何を探しているか（任意）

例:

> Supply chain analyst with 6 years in retail logistics. Currently lead demand planning for a 900-store grocery chain, owning a forecasting process that covers 40,000 SKUs. Cut out-of-stock incidents 34% and reduced excess inventory by ¥180M annually by rebuilding the replenishment model and retraining 25 regional planners.

## Skills

カテゴリ別に列挙する。英文では**レベル表記（A/B/C や「上級」）を使わない**のが普通で、書くと自己申告として割り引かれる。年数を添えるか、単に列挙する。

```
Analysis       SQL, Python (pandas), R
Tools          Tableau, Looker, SAP IBP, Excel (modeling)
Domain         Demand forecasting, S&OP, inventory optimization
Practices      Stakeholder facilitation, team training, process design
```

技術職なら Languages / Frameworks / Data / Practices のような分け方になる。**カテゴリ名は職種に合わせて作る。**

**実務経験のないものを書かない。** 資格だけ持っている領域は Certifications に書く。

## ATS（応募者追跡システム）対策

多くの企業が機械で一次スクリーニングをかける。次を守ると通過率が上がる。

- **単段組みにする。** 2段組み、テキストボックス、ヘッダー/フッター内の本文は読み取られないことがある
- **求人票の語をそのまま使う。** 求人が "Kubernetes" と書いているなら "K8s" ではなく "Kubernetes" と書く
- **図表・アイコン・スキルのバーグラフを使わない。** 機械が読めず、人間にも情報量がない
- **PDF で提出する。** ただし画像化された PDF は不可

## 添えるもの

- **Cover letter** — 欧州では求められることが多い。米テック系ではほぼ不要。応募先の慣行に合わせる
- **就労資格** — 海外応募では書く。`Eligible to work in the EU` / `Requires visa sponsorship`。伏せると選考後半で問題になる
