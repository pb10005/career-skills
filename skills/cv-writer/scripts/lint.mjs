#!/usr/bin/env node
/*
 * 提出前チェック。専門職の書類では固有名詞の誤記がそのまま能力の疑義に
 * つながるため、表記ゆれを機械で潰しておく。辞書は lint-dictionary.json。
 *
 *   npm run lint
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = [
  "src/shokumu-keirekisho.md",
  "src/resume.md",
  "src/cv.md",
  "shokumu-keirekisho.md",
  "resume.md",
];
const explicit = process.argv.slice(2).find((a) => a.endsWith(".md"));
const srcMd = explicit
  ? path.resolve(explicit)
  : path.join(root, CANDIDATES.find((c) => existsSync(path.join(root, c))) ?? CANDIDATES[0]);

/*
 * 誤記 -> 正しい表記の辞書は lint-dictionary.json に外出ししてある。
 * 職種ごとに用語を追記できるようにするためで、営業なら Salesforce、
 * 研究職なら MATLAB のように、その職種で日常的に使う固有名詞ほど入れる価値がある。
 * 辞書はカテゴリ別のオブジェクトで、値がキーと同じ項目は「正しい表記の確認用」
 * として無視する。
 */
const dictPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "lint-dictionary.json");
const SPELLINGS = [];
if (existsSync(dictPath)) {
  const dict = JSON.parse(await readFile(dictPath, "utf8"));
  for (const [category, entries] of Object.entries(dict)) {
    if (category.startsWith("_")) continue;
    for (const [wrong, right] of Object.entries(entries)) {
      if (wrong !== right) SPELLINGS.push([wrong, right]);
    }
  }
}

const raw = await readFile(srcMd, "utf8");

/* HTML コメントは指示書きなので検査対象から外す */
const body = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
const lines = body.split("\n");

const problems = [];
const note = (line, message) => problems.push({ line, message });

lines.forEach((text, i) => {
  const lineNo = i + 1;

  for (const [wrong, right] of SPELLINGS) {
    const re = new RegExp(`(?<![A-Za-z0-9])${wrong.replace(/\./g, "\\.")}(?![A-Za-z0-9])`, "g");
    if (re.test(text)) note(lineNo, `表記ゆれ: 「${wrong}」→「${right}」`);
  }

  if (/[，．]/.test(text)) note(lineNo, "句読点は「、」「。」に統一してください");
  if (/[０-９Ａ-Ｚａ-ｚ]/.test(text)) note(lineNo, "全角の英数字が含まれています（半角に統一）");
  if (/(である|であった|だった|であります)。\s*$/.test(text) && !text.startsWith("|")) {
    note(lineNo, "「である」調が混ざっています（「です・ます」に統一）");
  }
});

/* 作成日は build.mjs がビルド時に埋めるため、未入力としては数えない。 */
const AUTO_FILLED = new Set(["作成日"]);
const placeholders = [...body.matchAll(/\{\{([^}]+)\}\}/g)]
  .map((m) => m[1].trim())
  .filter((k) => !AUTO_FILLED.has(k));
const todos = (raw.match(/<!--\s*TODO:/g) ?? []).length;

let exitCode = 0;

if (problems.length > 0) {
  console.log("表記の指摘:");
  for (const p of problems) console.log(`  ${path.relative(process.cwd(), srcMd)}:${p.line}  ${p.message}`);
  exitCode = 1;
}

if (placeholders.length > 0) {
  const uniq = [...new Set(placeholders)];
  console.log(`\n未入力のプレースホルダー ${placeholders.length} 件 (${uniq.length} 種類):`);
  console.log(`  ${uniq.join(", ")}`);
  exitCode = 1;
}

if (todos > 0) {
  console.log(`\n未処理の TODO コメント ${todos} 件。仕上げ時に削除してください。`);
}

if (exitCode === 0 && todos === 0) console.log("問題なし。提出できる状態です。");

process.exit(exitCode);
