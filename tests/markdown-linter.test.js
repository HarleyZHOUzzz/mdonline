import assert from "node:assert/strict";
import test from "node:test";

import { lintMarkdown } from "../markdown-linter.js";

const knownLanguages = new Set(["js", "javascript", "python", "text"]);
const lint = (source) =>
  lintMarkdown(source, {
    isKnownLanguage: (language) => knownLanguages.has(language),
  });

test("accepts valid Markdown structures", () => {
  const diagnostics = lint(
    "# Title\n\nInline $E = mc^2$.\n\n```js\nconsole.log('ok');\n```",
  );

  assert.deepEqual(diagnostics, []);
});

test("reports unclosed fences and unknown languages", () => {
  const diagnostics = lint("```javscript\nconst value = 1;");

  assert.ok(diagnostics.some((item) => item.code === "unknown-code-language"));
  assert.ok(diagnostics.some((item) => item.code === "unclosed-code-fence"));
});

test("reports invalid and unclosed formulas", () => {
  const diagnostics = lint("Invalid: $\\frac{$\n\n$$\nx + 1");

  assert.ok(diagnostics.some((item) => item.code === "invalid-formula"));
  assert.ok(diagnostics.some((item) => item.code === "unclosed-block-formula"));
});

test("reports malformed links and inline code", () => {
  const diagnostics = lint("[link](https://example.com\n\n`missing");

  assert.ok(diagnostics.some((item) => item.code === "unclosed-link"));
  assert.ok(diagnostics.some((item) => item.code === "unclosed-inline-code"));
});

test("reports format warnings", () => {
  const diagnostics = lint('#Title\n\n<img src="test.png">\n\n![](image.png)');

  assert.ok(diagnostics.some((item) => item.code === "heading-space"));
  assert.ok(diagnostics.some((item) => item.code === "raw-html-disabled"));
  assert.ok(diagnostics.some((item) => item.code === "empty-image-alt"));
});

test("accepts formulas in image text and Markdown autolinks", () => {
  const diagnostics = lint(
    "> ![$image$](https://example.com/image.jpg)\n\n<https://example.com>",
  );

  assert.deepEqual(diagnostics, []);
});

test("reports the absolute column inside nested quotes", () => {
  const diagnostics = lint("> > Formula: $\\frac{$");
  const formula = diagnostics.find((item) => item.code === "invalid-formula");

  assert.equal(formula.column, 14);
  assert.ok(formula.length > 1);
});

test("reports malformed task lists and list marker spacing", () => {
  const diagnostics = lint(
    "-[x] missing space\n- [y] invalid state\n- [x incomplete\n1.item",
  );
  const codes = diagnostics.map((item) => item.code);

  assert.ok(codes.includes("task-list-spacing"));
  assert.ok(codes.includes("invalid-task-state"));
  assert.ok(codes.includes("unclosed-task-checkbox"));
  assert.ok(codes.includes("ordered-list-marker-spacing"));
});

test("accepts correctly formatted task lists and tables", () => {
  const diagnostics = lint(
    "- [ ] 待办事项\n- [x] 已完成事项\n\n| 名称 | 值 |\n| :--- | ---: |\n| A | 1 |",
  );

  assert.deepEqual(diagnostics, []);
});

test("reports full-width Markdown syntax but not ordinary Chinese punctuation", () => {
  const diagnostics = lint(
    "＃ 标题\n＞ 引用\n！［图片］（https://example.com/image.png）\n｀code｀\n＄x^2＄\n｜名称｜值｜\n＊强调＊\n\n你好，世界！（这是正常中文标点。）",
  );
  const codes = diagnostics.map((item) => item.code);

  assert.ok(codes.includes("fullwidth-heading-marker"));
  assert.ok(codes.includes("fullwidth-quote-marker"));
  assert.ok(codes.includes("fullwidth-link-delimiter"));
  assert.ok(codes.includes("fullwidth-inline-code-marker"));
  assert.ok(codes.includes("fullwidth-formula-delimiter"));
  assert.ok(codes.includes("fullwidth-table-pipe"));
  assert.ok(codes.includes("fullwidth-emphasis-marker"));
  assert.ok(!diagnostics.some((item) => item.line === 9));
});

test("reports heading skips and malformed table separators", () => {
  const diagnostics = lint("# H1\n### H3\n\n| A | B |\n| -- | --- | --- |");
  const codes = diagnostics.map((item) => item.code);

  assert.ok(codes.includes("heading-level-skip"));
  assert.ok(codes.includes("invalid-table-separator"));
  assert.ok(codes.includes("table-column-count"));
});

test("reports excessive blank lines and full-width task checkboxes", () => {
  const diagnostics = lint("-【】错误任务项\n\n\n\n下一段");
  const codes = diagnostics.map((item) => item.code);

  assert.ok(codes.includes("fullwidth-task-checkbox"));
  assert.ok(codes.includes("too-many-blank-lines"));
});
