#!/usr/bin/env node
/*
 * 職務経歴書 / レジュメの Markdown を A4 の PDF に変換する。
 *
 *   node scripts/build.mjs [source.md] [--png] [--name "氏名"]
 *
 * pandoc も LaTeX も使わず、Chromium の print-to-PDF だけで完結する。
 * 既知の落とし穴は references/build-setup.md にまとめてある。特に
 * フォントのフォールバック（日本語が中国語字形で出る）は黙って壊れるので、
 * 出力を PNG にして目視確認すること。
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import MarkdownIt from "markdown-it";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const wantPng = args.includes("--png");

const nameFlag = args.indexOf("--name");
const nameOverride = nameFlag !== -1 ? args[nameFlag + 1] : null;

/* ソースは引数優先。無ければ慣例的な置き場所を順に探す。 */
const CANDIDATES = [
  "src/shokumu-keirekisho.md",
  "src/resume.md",
  "src/cv.md",
  "shokumu-keirekisho.md",
  "resume.md",
];
const explicit = args.find((a) => a.endsWith(".md"));
const srcMd = explicit
  ? path.resolve(explicit)
  : path.join(root, CANDIDATES.find((c) => existsSync(path.join(root, c))) ?? CANDIDATES[0]);

if (!existsSync(srcMd)) {
  console.error(`ソースが見つかりません: ${srcMd}`);
  console.error(`引数で渡すか、${CANDIDATES.join(" / ")} のいずれかに置いてください。`);
  process.exit(1);
}

const srcCss = path.join(path.dirname(srcMd), "style.css");
/*
 * dist はソースが属するプロジェクト側に出す。scripts/.. に固定すると、
 * 別ディレクトリの .md を引数で渡したときに出力先が離れて混乱する。
 */
const srcDir = path.dirname(srcMd);
const projectRoot = path.basename(srcDir) === "src" ? path.dirname(srcDir) : srcDir;
const distDir = path.join(projectRoot, "dist");

/*
 * playwright-core はブラウザを同梱しないので実行ファイルを自力で探す。
 * PLAYWRIGHT_BROWSERS_PATH が設定された環境では playwright install を実行しない。
 */
async function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

  try {
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch {
    // 登録済みリビジョンが無いと throw する。下の探索に進む。
  }

  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && existsSync(base)) {
    for (const d of (await readdir(base)).filter((x) => x.startsWith("chromium-"))) {
      for (const rel of ["chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
        const p = path.join(base, d, rel);
        if (existsSync(p)) return p;
      }
    }
  }

  for (const p of [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ]) {
    if (existsSync(p)) return p;
  }

  throw new Error(
    "Chromium が見つかりません。CHROMIUM_PATH を指定するか、" +
      "`npx playwright install chromium` を実行してください。",
  );
}

/*
 * 未入力の {{...}} は消さずに残し、色を付けて PDF 上で見えるようにする。
 * 提出前に埋め忘れへ気づけることのほうが、体裁が整うことより価値が高い。
 */
function fillPlaceholders(md) {
  const now = new Date();
  const values = {
    作成日: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
    DATE: now.toISOString().slice(0, 10),
  };
  if (nameOverride) {
    values["氏名"] = nameOverride;
    values["NAME"] = nameOverride;
  }
  return md.replace(/\{\{([^}]+)\}\}/g, (whole, key) => {
    const v = values[key.trim()];
    return v ?? `<span class="placeholder">${whole}</span>`;
  });
}

/* Chromium が出す PDF の Pages ノードから総ページ数を読む。読めなければ null。 */
function pdfPageCount(buf) {
  const m = [...buf.toString("latin1").matchAll(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/g)];
  return m.length ? Math.max(...m.map((x) => Number(x[1]))) : null;
}

const rawMd = await readFile(srcMd, "utf8");
const css = existsSync(srcCss)
  ? await readFile(srcCss, "utf8")
  : await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "style.css"), "utf8");

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });
const body = md.render(fillPlaceholders(rawMd));

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><title>職務経歴書</title>
<style>${css}</style></head><body>${body}</body></html>`;

await mkdir(distDir, { recursive: true });

/*
 * setContent や data: URL だとローカルフォントの解決に失敗することがあるため、
 * 一時 HTML をファイルに書いて file:// で開く。
 */
const tmpHtml = path.join(distDir, ".build.html");
await writeFile(tmpHtml, html, "utf8");

const browser = await chromium.launch({ executablePath: await findChromium() });
const page = await browser.newPage();
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });

/* 氏名が埋まっていればファイル名に使う。採用担当は添付を人手で振り分ける。 */
/* 「山田 太郎」のように姓名の間に空白が入るため、行末かタグまで拾って詰める。 */
const rawName = nameOverride ?? rawMd.match(/氏名[：:]\s*([^<{\n]+)/)?.[1] ?? null;
const nameMatch = rawName ? rawName.trim().replace(/[\s\u3000]+/g, "") : null;
const stamp = new Date().toISOString().slice(0, 7).replace("-", "");
const isJa = /職務経歴書|氏名/.test(rawMd);
const base = isJa ? "職務経歴書" : "Resume";
const pdfName = nameMatch ? `${base}_${nameMatch}_${stamp}.pdf` : `${base}_${stamp}.pdf`;
const pdfPath = path.join(distDir, pdfName);

/*
 * Chromium は @page のマージンボックス (@bottom-center) を実装していないため、
 * ページ番号は footerTemplate で入れる。margin.bottom はフッタ分を確保すること。
 */
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "15mm", right: "15mm", bottom: "18mm", left: "15mm" },
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate:
    '<div style="font-size:8pt;width:100%;text-align:center;color:#555;">' +
    '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});

if (wantPng) {
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: 794, height: 1123 }); // A4 @96dpi
  await page.screenshot({ path: path.join(distDir, "preview.png"), fullPage: true });
}

await browser.close();

const pages = pdfPageCount(await readFile(pdfPath));
console.log(`生成: ${path.relative(process.cwd(), pdfPath)}`);
if (pages !== null) {
  /*
   * 和文の職務経歴書は2枚が標準、3枚が実質的な上限、4枚以上は「まとめる力がない」と
   * 読まれる。3枚を一律に警告すると、経験の長い人が無理に削ることになるので分けている。
   * 英文レジュメは1枚が原則で、2枚は10年超のみ。
   */
  let note = "";
  if (isJa) {
    if (pages >= 4) note = "  ← 4枚以上は長すぎます。3枚以内に収めてください";
    else if (pages === 3) note = "  （2枚が標準、3枚が上限。経験が長ければ許容範囲）";
  } else {
    if (pages >= 3) note = "  ← Resumes should be 1 page (2 only for 10+ years)";
    else if (pages === 2) note = "  (1 page preferred unless you have 10+ years)";
  }
  console.log(`ページ数: ${pages}${note}`);
}
if (wantPng) console.log(`確認用: ${path.relative(process.cwd(), path.join(distDir, "preview.png"))}`);
