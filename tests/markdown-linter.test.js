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
