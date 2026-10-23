import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { katex as markdownItKatex } from "@mdit/plugin-katex";
import {
  Bold,
  Code2,
  Copy,
  createIcons,
  Download,
  Eye,
  FilePlus2,
  GitFork,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Moon,
  MoreHorizontal,
  PencilLine,
  Quote,
  Sigma,
  SquareCode,
  Sun,
} from "lucide";
import MarkdownIt from "markdown-it";
import markdownItTaskLists from "markdown-it-task-lists";

import { lintMarkdown } from "./markdown-linter.js";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./style.css";

const codeLanguages = {
  bash,
  c,
  cpp,
  csharp,
  css,
  go,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  rust,
  sql,
  typescript,
  xml,
  yaml,
};

Object.entries(codeLanguages).forEach(([name, language]) => {
  hljs.registerLanguage(name, language);
});

hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
hljs.registerAliases(["cs"], { languageName: "csharp" });
hljs.registerAliases(["html", "svg"], { languageName: "xml" });
hljs.registerAliases(["js", "jsx"], { languageName: "javascript" });
hljs.registerAliases(["md"], { languageName: "markdown" });
hljs.registerAliases(["py"], { languageName: "python" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["yml"], { languageName: "yaml" });

const appIcons = {
  Bold,
  Code2,
  Copy,
  Download,
  Eye,
  FilePlus2,
  GitFork,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Moon,
  MoreHorizontal,
  PencilLine,
  Quote,
  Sigma,
  SquareCode,
  Sun,
};

const starterDocument = String.raw`# README

欢迎使用 **墨刻 Markdown**，一个专注、轻盈的在线写作空间。左侧书写，右侧的内容会实时排版。

## 开始写作

- [x] 支持标准 Markdown 语法
- [x] 支持行内公式与块级公式
- [x] 自动保存到浏览器本地
- [ ] 写下你的下一篇文章

> 好的工具应当退到内容之后，让思想留在纸面中央。

行内公式示例：质能方程是 $E = mc^2$，欧拉恒等式是 $e^{i\pi} + 1 = 0$。

## 一个 TypeScript 片段

\`\`\`ts
interface Note {
  title: string;
  updatedAt: Date;
}

const saveNote = (note: Note): void => {
  console.log(\`Saved: \${note.title}\`);
};
\`\`\`

## 块级公式

下面是高斯积分：

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## 示例图片

![墨刻 Markdown 示例图片](https://avatars.githubusercontent.com/u/178354211?s=200&v=4)

---

继续编辑左侧内容，试着加入一个 [链接](https://github.com)、表格或你自己的公式。
`
  .replaceAll("\\`", "`")
  .replaceAll("\\${", "${");

const storageKeys = {
  content: "moke-markdown-content",
  mode: "moke-markdown-mode",
  theme: "moke-markdown-theme",
  language: "moke-markdown-language",
};

const translations = {
  "zh-CN": {
    pageTitle: "墨刻 Markdown",
    viewMode: "视图模式",
    editOnly: "仅编辑",
    splitView: "分栏",
    previewOnly: "仅预览",
    newDocument: "新建文稿",
    language: "界面语言",
    switchTheme: "切换主题",
    switchToDark: "切换到深色主题",
    switchToLight: "切换到浅色主题",
    openGithub: "打开 GitHub 仓库",
    saved: "已自动保存",
    saving: "正在保存",
    editorArea: "Markdown 编辑区",
    editor: "编辑器",
    formatToolbar: "Markdown 格式工具栏",
    bold: "粗体",
    boldShortcut: "粗体 ⌘B",
    italic: "斜体",
    italicShortcut: "斜体 ⌘I",
    link: "链接",
    linkShortcut: "链接 ⌘K",
    inlineCode: "行内代码",
    codeBlock: "代码块",
    bulletList: "无序列表",
    orderedList: "有序列表",
    quote: "引用",
    quoteTooltip: "引用（Shift 点击增加层级）",
    formula: "公式",
    latexFormula: "LaTeX 公式",
    image: "图片",
    moreActions: "更多操作",
    more: "更多",
    copyMarkdown: "复制 Markdown",
    downloadMarkdown: "下载 .md",
    markdownEditor: "Markdown 文本编辑器",
    diagnosticResults: "格式检查结果",
    formatCheck: "格式检查",
    closeDiagnostics: "关闭格式检查面板",
    spaces: "空格：2",
    resizePanes: "拖动调整编辑区和预览区宽度",
    previewArea: "Markdown 预览区",
    preview: "预览",
    formatNormal: "格式正常",
    noFormatIssues: "没有发现格式问题",
    multilineCode: "多行代码请使用代码块",
    inlineNoMultiline: "行内格式不能跨越多行",
    nestedLinks: "链接不能嵌套",
    codeList: "代码块不能直接转换为列表",
    newDocumentConfirm: "新建文稿会清空当前内容，确定继续吗？",
    copySuccess: "Markdown 已复制",
    downloadSuccess: "文稿已下载",
    unnamedDocument: "未命名文稿",
    writeHere: "从这里开始书写……",
    boldPlaceholder: "粗体文字",
    italicPlaceholder: "斜体文字",
    linkPlaceholder: "链接文字",
    imagePlaceholder: "墨刻 Markdown 示例图片",
    textPlaceholder: "文字",
    listPlaceholder: "列表项",
    quotePlaceholder: "引用内容",
  },
  en: {
    pageTitle: "Moke Markdown",
    viewMode: "View mode",
    editOnly: "Editor",
    splitView: "Split",
    previewOnly: "Preview",
    newDocument: "New document",
    language: "Interface language",
    switchTheme: "Switch theme",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
    openGithub: "Open GitHub repository",
    saved: "Saved automatically",
    saving: "Saving",
    editorArea: "Markdown editor",
    editor: "Editor",
    formatToolbar: "Markdown formatting toolbar",
    bold: "Bold",
    boldShortcut: "Bold ⌘B",
    italic: "Italic",
    italicShortcut: "Italic ⌘I",
    link: "Link",
    linkShortcut: "Link ⌘K",
    inlineCode: "Inline code",
    codeBlock: "Code block",
    bulletList: "Bullet list",
    orderedList: "Ordered list",
    quote: "Quote",
    quoteTooltip: "Quote (Shift-click to add a level)",
    formula: "Formula",
    latexFormula: "LaTeX formula",
    image: "Image",
    moreActions: "More actions",
    more: "More",
    copyMarkdown: "Copy Markdown",
    downloadMarkdown: "Download .md",
    markdownEditor: "Markdown text editor",
    diagnosticResults: "Format check results",
    formatCheck: "Format check",
    closeDiagnostics: "Close format check panel",
    spaces: "Spaces: 2",
    resizePanes: "Resize editor and preview panes",
    previewArea: "Markdown preview",
    preview: "Preview",
    formatNormal: "No format issues",
    noFormatIssues: "No format issues found",
    multilineCode: "Use a code block for multiline code",
    inlineNoMultiline: "Inline formatting cannot span multiple lines",
    nestedLinks: "Links cannot be nested",
    codeList: "A code block cannot be converted directly into a list",
    newDocumentConfirm:
      "Creating a new document will clear the current content. Continue?",
    copySuccess: "Markdown copied",
    downloadSuccess: "Document downloaded",
    unnamedDocument: "Untitled document",
    writeHere: "Start writing here…",
    boldPlaceholder: "bold text",
    italicPlaceholder: "italic text",
    linkPlaceholder: "link text",
    imagePlaceholder: "Moke Markdown example image",
    textPlaceholder: "text",
    listPlaceholder: "list item",
    quotePlaceholder: "quote",
  },
};

const editor = document.querySelector("#editor");
const lineNumbersInner = document.querySelector("#line-numbers-inner");
const lineMeasurer = document.querySelector("#line-measurer");
const editorPane = document.querySelector(".editor-pane");
const diagnosticsOverlay = document.querySelector(
  "#editor-diagnostics-overlay",
);
const diagnosticsContent = document.querySelector(
  "#editor-diagnostics-content",
);
const preview = document.querySelector("#preview");
const workspace = document.querySelector("#workspace");
const saveState = document.querySelector("#save-state");
const cursorPosition = document.querySelector("#cursor-position");
const wordCount = document.querySelector("#word-count");
const readTime = document.querySelector("#read-time");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const themeButton = document.querySelector("#theme-button");
const newDocumentButton = document.querySelector("#new-document");
const resizer = document.querySelector("#resizer");
const moreButton = document.querySelector("#more-button");
const moreMenu = document.querySelector("#more-menu");
const githubLink = document.querySelector("#github-link");
const toast = document.querySelector("#toast");
const buttonTooltip = document.querySelector("#button-tooltip");
const diagnosticHoverCard = document.querySelector("#diagnostic-hover-card");
const diagnosticsPanel = document.querySelector("#diagnostics-panel");
const diagnosticsSummary = document.querySelector("#diagnostics-summary");
const diagnosticsList = document.querySelector("#diagnostics-list");
const diagnosticsClose = document.querySelector("#diagnostics-close");
const formatStatus = document.querySelector("#format-status");
const formatSummary = document.querySelector("#format-summary");
const languageButtons = [...document.querySelectorAll("[data-language]")];

let saveTimer;
let toastTimer;
let lineNumberResizeFrame;
let languageAnimationTimer;
let dragging = false;
let syncingScroll = false;
let currentDiagnostics = [];
let currentLanguage = "zh-CN";
let activePreviewSnapThreshold = 18;
let splitEditorWidth = "50%";

const paneSnapThreshold = 18;

document.body.append(moreMenu);

const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    const normalizedLanguage = language
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_+-]/g, "");

    if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
      return `<pre class="hljs" data-language="${normalizedLanguage}"><code>${
        hljs.highlight(code, {
          language: normalizedLanguage,
          ignoreIllegals: true,
        }).value
      }</code></pre>`;
    }

    const languageLabel = normalizedLanguage || "text";
    return `<pre class="hljs" data-language="${languageLabel}"><code>${md.utils.escapeHtml(code)}</code></pre>`;
  },
})
  .use(markdownItKatex, {
    throwOnError: false,
    errorColor: "#a64531",
  })
  .use(markdownItTaskLists, { enabled: true });

const defaultLinkRenderer =
  md.renderer.rules.link_open ||
  ((tokens, index, options, environment, renderer) =>
    renderer.renderToken(tokens, index, options));

md.renderer.rules.link_open = (
  tokens,
  index,
  options,
  environment,
  renderer,
) => {
  tokens[index].attrSet("target", "_blank");
  tokens[index].attrSet("rel", "noreferrer noopener");
  return defaultLinkRenderer(tokens, index, options, environment, renderer);
};

function t(key) {
  return (
    translations[currentLanguage][key] || translations["zh-CN"][key] || key
  );
}

function reserveLocalizedWidths() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const values = Object.values(translations)
      .map((language) => language[key])
      .filter(Boolean);
    if (!values.length) return;

    const computedStyle = getComputedStyle(element);
    const measure = document.createElement("span");
    measure.style.position = "fixed";
    measure.style.visibility = "hidden";
    measure.style.width = "max-content";
    measure.style.whiteSpace = "nowrap";
    measure.style.font = computedStyle.font;
    measure.style.letterSpacing = computedStyle.letterSpacing;
    measure.style.textTransform = computedStyle.textTransform;
    document.body.append(measure);

    const textWidth = Math.max(
      ...values.map((value) => {
        measure.textContent = value;
        return measure.getBoundingClientRect().width;
      }),
    );
    measure.remove();

    const isButton = element.matches("button");
    const horizontalChrome = isButton
      ? Number.parseFloat(computedStyle.paddingLeft) +
        Number.parseFloat(computedStyle.paddingRight) +
        Number.parseFloat(computedStyle.borderLeftWidth) +
        Number.parseFloat(computedStyle.borderRightWidth)
      : 0;
    const width = Math.max(
      element.getBoundingClientRect().width,
      textWidth + horizontalChrome,
    );

    element.style.setProperty("--localized-width", `${Math.ceil(width)}px`);
    element.classList.add("has-reserved-i18n-width");
  });
}

function localizeDiagnostic(diagnostic) {
  if (currentLanguage === "zh-CN") return diagnostic.message;

  const messages = {
    "unclosed-inline-code": "Inline code is missing a closing backtick",
    "empty-formula": "Formula content is empty",
    "unclosed-inline-formula": "Inline formula is missing a closing $",
    "unclosed-link": "Link or image is missing a closing )",
    "empty-destination": "Link or image destination is empty",
    "empty-image-alt": "Image is missing alternative text",
    "heading-space": "Add a space after the heading marker",
    "raw-html-disabled": "Raw HTML is not enabled in this editor",
    "fullwidth-heading-marker": "Use half-width # instead of full-width ＃",
    "fullwidth-quote-marker": "Use half-width > instead of full-width ＞",
    "fullwidth-code-fence": "Use half-width ``` instead of full-width ｀",
    "fullwidth-list-marker": "Use half-width -, +, or * as the list marker",
    "fullwidth-link-delimiter": "Use half-width []() for links and images",
    "fullwidth-inline-code-marker": "Use half-width ` for inline code",
    "fullwidth-formula-delimiter": "Use half-width $ for formulas",
    "fullwidth-table-pipe": "Use half-width | as the table column separator",
    "fullwidth-emphasis-marker": "Use half-width * for emphasis",
    "fullwidth-task-checkbox":
      "Use half-width [ ] for task lists instead of 【】 or ［］",
    "task-list-spacing": "Task-list markers must be followed by a space",
    "unclosed-task-checkbox": "Task-list checkbox is missing a closing ]",
    "invalid-task-state": "Task state must be a space, x, or X",
    "list-marker-spacing": "Add a space after the bullet-list marker",
    "ordered-list-marker-spacing": "Add a space after the ordered-list marker",
    "too-many-blank-lines": "Too many consecutive blank lines; keep at most 2",
    "invalid-table-separator":
      "Each table separator cell needs at least 3 - characters; : sets alignment",
    "table-column-count":
      "The header and separator rows have different column counts",
    "invalid-fence-info":
      "A backtick fence info string cannot contain backticks",
    "unclosed-code-fence": "Code block is missing a closing fence",
    "unclosed-block-formula": "Block formula is missing a closing $$",
  };

  if (diagnostic.code === "invalid-formula") {
    return diagnostic.message.replace(/^LaTeX：/, "LaTeX: ");
  }
  if (diagnostic.code === "unknown-code-language") {
    return `Unknown code language: ${diagnostic.message.split("：").at(-1)}`;
  }
  if (diagnostic.code === "heading-level-skip") {
    const levels = diagnostic.message.match(/H(\d).*H(\d)/);
    return levels
      ? `Heading level jumps from H${levels[1]} to H${levels[2]}`
      : "Heading level is skipped";
  }
  return messages[diagnostic.code] || diagnostic.message;
}

function applyLanguage(language, animate = false) {
  currentLanguage = translations[language] ? language : "zh-CN";
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-tooltip]").forEach((element) => {
    element.dataset.tooltip = t(element.dataset.i18nTooltip);
  });
  languageButtons.forEach((button) => {
    const active = button.dataset.language === currentLanguage;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  applyTheme(document.documentElement.dataset.theme);
  updateDocumentStats(editor.value);
  updateCursorPosition();
  updateDiagnostics(editor.value);
  localStorage.setItem(storageKeys.language, currentLanguage);

  if (animate) {
    document.documentElement.classList.remove("is-switching-language");
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add("is-switching-language");
    window.clearTimeout(languageAnimationTimer);
    languageAnimationTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("is-switching-language");
    }, 340);
  }
}

function render() {
  const value = editor.value;
  preview.innerHTML = md.render(value);
  updateDocumentStats(value);
  updateLineNumbers();
  updateDiagnostics(value);
}

function updateLineNumbers() {
  const lines = editor.value.split("\n");
  const measureFragment = document.createDocumentFragment();

  // Match the textarea's usable width exactly, including space lost to its scrollbar.
  lineMeasurer.style.width = `${editor.clientWidth}px`;

  lines.forEach((line) => {
    const measure = document.createElement("span");
    measure.className = "line-measure";
    measure.textContent = line || "\u200b";
    measureFragment.append(measure);
  });
  lineMeasurer.replaceChildren(measureFragment);

  const fragment = document.createDocumentFragment();

  [...lineMeasurer.children].forEach((measure, index) => {
    const lineNumber = document.createElement("span");
    lineNumber.textContent = String(index + 1);
    lineNumber.style.height = `${Math.max(
      Number.parseFloat(getComputedStyle(editor).lineHeight),
      measure.getBoundingClientRect().height,
    )}px`;
    fragment.append(lineNumber);
  });

  lineNumbersInner.replaceChildren(fragment);
  syncLineNumbers();
}

function scheduleLineNumberUpdate() {
  window.cancelAnimationFrame(lineNumberResizeFrame);
  lineNumberResizeFrame = window.requestAnimationFrame(() => {
    updateLineNumbers();
    lineNumberResizeFrame = undefined;
  });
}

function syncLineNumbers() {
  lineNumbersInner.style.transform = `translate3d(0, ${-editor.scrollTop}px, 0)`;
  syncDiagnosticOverlay();
}

function syncDiagnosticOverlay() {
  diagnosticsOverlay.style.width = `${editor.clientWidth}px`;
  diagnosticsContent.style.transform = `translate3d(${-editor.scrollLeft}px, ${-editor.scrollTop}px, 0)`;
}

function appendDiagnosticRun(fragment, text, severity) {
  if (!severity) {
    fragment.append(document.createTextNode(text));
    return;
  }

  const marker = document.createElement("span");
  marker.className = `diagnostic-squiggle is-${severity}`;
  marker.textContent = text;
  fragment.append(marker);
}

function renderDiagnosticLine(fragment, line, diagnostics) {
  const severity = diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  )
    ? "error"
    : diagnostics[0]?.severity;

  if (!line.length) {
    if (severity) appendDiagnosticRun(fragment, "\u200b", severity);
    return;
  }

  appendDiagnosticRun(fragment, line, severity);
}

function renderDiagnosticOverlay(value) {
  diagnosticsOverlay.hidden = currentDiagnostics.length === 0;
  if (!currentDiagnostics.length) {
    diagnosticsContent.replaceChildren();
    return;
  }

  const diagnosticsByLine = new Map();
  for (const diagnostic of currentDiagnostics) {
    const lineDiagnostics = diagnosticsByLine.get(diagnostic.line) || [];
    lineDiagnostics.push(diagnostic);
    diagnosticsByLine.set(diagnostic.line, lineDiagnostics);
  }

  const fragment = document.createDocumentFragment();
  const lines = value.split("\n");
  lines.forEach((line, index) => {
    renderDiagnosticLine(
      fragment,
      line,
      diagnosticsByLine.get(index + 1) || [],
    );
    if (index < lines.length - 1)
      fragment.append(document.createTextNode("\n"));
  });
  diagnosticsContent.replaceChildren(fragment);
  syncDiagnosticOverlay();
}

function updateLineNumberDiagnostics() {
  const lineNumbers = [...lineNumbersInner.children];
  const diagnosticsByLine = new Map();

  for (const diagnostic of currentDiagnostics) {
    const lineDiagnostics = diagnosticsByLine.get(diagnostic.line) || [];
    lineDiagnostics.push(diagnostic);
    diagnosticsByLine.set(diagnostic.line, lineDiagnostics);
  }

  lineNumbers.forEach((lineNumber, index) => {
    const lineDiagnostics = diagnosticsByLine.get(index + 1) || [];
    const hasError = lineDiagnostics.some(
      (diagnostic) => diagnostic.severity === "error",
    );
    lineNumber.classList.toggle("has-error", hasError);
    lineNumber.classList.toggle(
      "has-warning",
      !hasError && lineDiagnostics.length > 0,
    );
    lineNumber.title = lineDiagnostics
      .map((diagnostic) => diagnostic.message)
      .join("\n");
  });
}

function setDiagnosticsPanel(open) {
  const shouldOpen = open && currentDiagnostics.length > 0;
  diagnosticsPanel.hidden = !shouldOpen;
  editorPane.classList.toggle("has-diagnostics", shouldOpen);
  formatStatus.setAttribute("aria-expanded", String(shouldOpen));
}

function getDiagnosticSummary(diagnostics) {
  const errorCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  ).length;
  const warningCount = diagnostics.length - errorCount;

  if (!diagnostics.length) {
    return { errorCount, warningCount, text: t("formatNormal") };
  }

  const parts = [];
  if (errorCount)
    parts.push(
      currentLanguage === "en"
        ? `${errorCount} ${errorCount === 1 ? "error" : "errors"}`
        : `${errorCount} 个错误`,
    );
  if (warningCount)
    parts.push(
      currentLanguage === "en"
        ? `${warningCount} ${warningCount === 1 ? "warning" : "warnings"}`
        : `${warningCount} 个警告`,
    );
  return {
    errorCount,
    warningCount,
    text: parts.join(currentLanguage === "en" ? ", " : "，"),
  };
}

function updateDiagnostics(value) {
  currentDiagnostics = lintMarkdown(value, {
    isKnownLanguage: (language) => Boolean(hljs.getLanguage(language)),
  });

  const { errorCount, warningCount, text } =
    getDiagnosticSummary(currentDiagnostics);
  formatSummary.textContent = text;
  diagnosticsSummary.textContent = text;
  formatStatus.classList.toggle("has-error", errorCount > 0);
  formatStatus.classList.toggle(
    "has-warning",
    errorCount === 0 && warningCount > 0,
  );

  const fragment = document.createDocumentFragment();
  currentDiagnostics.forEach((diagnostic) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const location = document.createElement("span");
    const message = document.createElement("span");

    button.type = "button";
    button.className = `diagnostic-item is-${diagnostic.severity}`;
    button.dataset.line = String(diagnostic.line);
    button.dataset.column = String(diagnostic.column);
    location.className = "diagnostic-location";
    location.textContent = `Ln ${diagnostic.line}:${diagnostic.column}`;
    message.className = "diagnostic-message";
    message.textContent = localizeDiagnostic(diagnostic);
    button.append(location, message);
    item.append(button);
    fragment.append(item);
  });
  diagnosticsList.replaceChildren(fragment);
  updateLineNumberDiagnostics();
  renderDiagnosticOverlay(value);

  if (!currentDiagnostics.length) setDiagnosticsPanel(false);
}

function hideDiagnosticHover() {
  diagnosticHoverCard.hidden = true;
  diagnosticHoverCard.setAttribute("aria-hidden", "true");
}

function getSourceLineAtViewportY(viewportY) {
  const sourceLines = lineNumbersInner.children;
  let start = 0;
  let end = sourceLines.length - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const bounds = sourceLines[middle].getBoundingClientRect();

    if (viewportY < bounds.top) {
      end = middle - 1;
    } else if (viewportY >= bounds.bottom) {
      start = middle + 1;
    } else {
      return middle + 1;
    }
  }

  return undefined;
}

function updateDiagnosticHover(event) {
  if (!currentDiagnostics.length) return hideDiagnosticHover();

  const line = getSourceLineAtViewportY(event.clientY);
  const diagnostics = currentDiagnostics.filter(
    (diagnostic) => diagnostic.line === line,
  );

  if (!diagnostics.length) return hideDiagnosticHover();

  diagnosticHoverCard.textContent = diagnostics
    .map((diagnostic) => localizeDiagnostic(diagnostic))
    .join("\n");
  diagnosticHoverCard.hidden = false;
  diagnosticHoverCard.setAttribute("aria-hidden", "false");

  const margin = 14;
  const maxLeft = window.innerWidth - diagnosticHoverCard.offsetWidth - margin;
  const maxTop = window.innerHeight - diagnosticHoverCard.offsetHeight - margin;
  diagnosticHoverCard.style.left = `${Math.max(
    margin,
    Math.min(event.clientX + 16, maxLeft),
  )}px`;
  diagnosticHoverCard.style.top = `${Math.max(
    margin,
    Math.min(event.clientY + 18, maxTop),
  )}px`;
}

function jumpToDiagnostic(line, column) {
  const lines = editor.value.split("\n");
  const safeLine = Math.min(Math.max(1, line), lines.length);
  const lineStart = lines
    .slice(0, safeLine - 1)
    .reduce((length, value) => length + value.length + 1, 0);
  const offset = Math.min(
    lineStart + Math.max(0, column - 1),
    lineStart + lines[safeLine - 1].length,
  );
  const lineHeight = Number.parseFloat(getComputedStyle(editor).lineHeight);

  editor.focus();
  editor.setSelectionRange(offset, Math.min(offset + 1, editor.value.length));
  editor.scrollTop = Math.max(0, (safeLine - 1) * lineHeight - 80);
  syncLineNumbers();
  updateCursorPosition();
}

function updateDocumentStats(value) {
  const latinWords = value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || [];
  const cjkCharacters = value.match(/[\u3400-\u9fff]/g) || [];
  const count = latinWords.length + cjkCharacters.length;
  const minutes = Math.max(1, Math.ceil(count / 300));

  wordCount.textContent =
    currentLanguage === "en"
      ? `${count.toLocaleString()} ${count === 1 ? "word" : "words"}`
      : `${count.toLocaleString()} 字`;
  readTime.textContent =
    currentLanguage === "en"
      ? `~${minutes} min read`
      : `约 ${minutes} 分钟阅读`;
}

function updateCursorPosition() {
  const beforeCursor = editor.value.slice(0, editor.selectionStart);
  const lines = beforeCursor.split("\n");
  cursorPosition.textContent =
    currentLanguage === "en"
      ? `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`
      : `行 ${lines.length}，列 ${lines.at(-1).length + 1}`;
}

function queueSave() {
  saveState.classList.add("is-saving");
  saveState.querySelector("span:last-child").textContent = t("saving");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(storageKeys.content, editor.value);
    saveState.classList.remove("is-saving");
    saveState.querySelector("span:last-child").textContent = t("saved");
  }, 420);
}

function countAdjacentCharacters(value, index, direction, character) {
  let count = 0;
  let cursor = direction < 0 ? index - 1 : index;

  while (cursor >= 0 && cursor < value.length && value[cursor] === character) {
    count += 1;
    cursor += direction;
  }

  return count;
}

function getInlineFormat(action) {
  const placeholders = {
    bold: t("boldPlaceholder"),
    italic: t("italicPlaceholder"),
    link: t("linkPlaceholder"),
    code: "code",
    formula: "E = mc^2",
    image: t("imagePlaceholder"),
  };
  return { placeholder: placeholders[action] };
}

const composableInlineFormats = new Set(["bold", "italic", "link"]);
const exclusiveInlineFormats = new Set(["code", "formula", "image"]);
const defaultLinkDestination = "https://example.com";
const defaultImageDestination =
  "https://avatars.githubusercontent.com/u/178354211?s=200&v=4";

function createInlineLayer(action, content, existingLayer) {
  if (action === "bold") {
    return { action, before: "**", after: "**" };
  }

  if (action === "italic") {
    return { action, before: "*", after: "*" };
  }

  if (action === "link") {
    return {
      action,
      before: "[",
      after: existingLayer?.after || `](${defaultLinkDestination})`,
    };
  }

  if (action === "formula") {
    return { action, before: "$", after: "$" };
  }

  if (action === "image") {
    return {
      action,
      before: "![",
      after: existingLayer?.after || `](${defaultImageDestination})`,
    };
  }

  const longestBacktickRun = Math.max(
    0,
    ...(content.match(/`+/g) || []).map((run) => run.length),
  );
  const delimiter = "`".repeat(longestBacktickRun + 1);
  const needsPadding =
    /\S/.test(content) && (/^[` ]/.test(content) || /[` ]$/.test(content));
  const padding = needsPadding ? " " : "";

  return {
    action: "code",
    before: `${delimiter}${padding}`,
    after: `${padding}${delimiter}`,
  };
}

function findLinkSuffix(value, end) {
  if (value.slice(end, end + 2) !== "](") return null;

  let depth = 1;

  for (let index = end + 2; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] !== ")") continue;

    depth -= 1;
    if (depth === 0) return value.slice(end, index + 1);
  }

  return null;
}

function matchInlineLayer(value, start, end) {
  let labelStart = start;
  let labelEnd = end;

  while (labelStart > 0 && /[ \t]/.test(value[labelStart - 1])) {
    labelStart -= 1;
  }

  while (labelEnd < value.length && /[ \t]/.test(value[labelEnd])) {
    labelEnd += 1;
  }

  const linkSuffix = findLinkSuffix(value, labelEnd);

  if (linkSuffix && value.slice(labelStart - 2, labelStart) === "![") {
    return {
      beforeLength: start - labelStart + 2,
      afterLength: labelEnd - end + linkSuffix.length,
      layers: [
        {
          action: "image",
          before: value.slice(labelStart - 2, start),
          after: value.slice(end, labelEnd) + linkSuffix,
        },
      ],
    };
  }

  if (linkSuffix && value[labelStart - 1] === "[") {
    return {
      beforeLength: start - labelStart + 1,
      afterLength: labelEnd - end + linkSuffix.length,
      layers: [
        {
          action: "link",
          before: value.slice(labelStart - 1, start),
          after: value.slice(end, labelEnd) + linkSuffix,
        },
      ],
    };
  }

  const openingBackticks = countAdjacentCharacters(value, start, -1, "`");
  const closingBackticks = countAdjacentCharacters(value, end, 1, "`");
  const directBackticks =
    openingBackticks === closingBackticks ? openingBackticks : 0;

  if (directBackticks > 0) {
    const delimiter = "`".repeat(directBackticks);
    return {
      beforeLength: directBackticks,
      afterLength: directBackticks,
      layers: [{ action: "code", before: delimiter, after: delimiter }],
    };
  }

  const hasCodePadding = value[start - 1] === " " && value[end] === " ";
  const openingPaddedBackticks = hasCodePadding
    ? countAdjacentCharacters(value, start - 1, -1, "`")
    : 0;
  const closingPaddedBackticks = hasCodePadding
    ? countAdjacentCharacters(value, end + 1, 1, "`")
    : 0;
  const paddedBackticks =
    openingPaddedBackticks === closingPaddedBackticks
      ? openingPaddedBackticks
      : 0;

  if (paddedBackticks > 0) {
    const delimiter = "`".repeat(paddedBackticks);
    return {
      beforeLength: paddedBackticks + 1,
      afterLength: paddedBackticks + 1,
      layers: [
        {
          action: "code",
          before: `${delimiter} `,
          after: ` ${delimiter}`,
        },
      ],
    };
  }

  if (value[start - 1] === "$" && value[end] === "$") {
    return {
      beforeLength: 1,
      afterLength: 1,
      layers: [{ action: "formula", before: "$", after: "$" }],
    };
  }

  const starCount = Math.min(
    countAdjacentCharacters(value, start, -1, "*"),
    countAdjacentCharacters(value, end, 1, "*"),
  );

  if (starCount >= 3) {
    return {
      beforeLength: 3,
      afterLength: 3,
      layers: [
        { action: "bold", before: "**", after: "**" },
        { action: "italic", before: "*", after: "*" },
      ],
    };
  }

  if (starCount === 2) {
    return {
      beforeLength: 2,
      afterLength: 2,
      layers: [{ action: "bold", before: "**", after: "**" }],
    };
  }

  if (starCount === 1) {
    return {
      beforeLength: 1,
      afterLength: 1,
      layers: [{ action: "italic", before: "*", after: "*" }],
    };
  }

  return null;
}

function findClosingBracket(value, start) {
  let depth = 1;

  for (let index = start; index < value.length; index += 1) {
    if (value[index] === "\\") {
      index += 1;
      continue;
    }

    if (value[index] === "[") depth += 1;
    if (value[index] !== "]") continue;

    depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function matchContainedInlineLayer(value) {
  const isImage = value.startsWith("![");
  const isLink = !isImage && value.startsWith("[");

  if (isImage || isLink) {
    const contentStart = isImage ? 2 : 1;
    const closingBracket = findClosingBracket(value, contentStart);
    const suffix =
      closingBracket >= 0 ? findLinkSuffix(value, closingBracket) : null;

    if (suffix && closingBracket + suffix.length === value.length) {
      return {
        beforeLength: contentStart,
        afterLength: suffix.length,
        layers: [
          {
            action: isImage ? "image" : "link",
            before: value.slice(0, contentStart),
            after: suffix,
          },
        ],
      };
    }
  }

  const openingBackticks = value.match(/^`+/)?.[0] || "";
  const closingBackticks = value.match(/`+$/)?.[0] || "";

  if (
    openingBackticks &&
    openingBackticks.length === closingBackticks.length &&
    value.length > openingBackticks.length + closingBackticks.length
  ) {
    const inner = value.slice(
      openingBackticks.length,
      value.length - closingBackticks.length,
    );
    const hasPadding =
      inner.startsWith(" ") && inner.endsWith(" ") && /\S/.test(inner);
    return {
      beforeLength: openingBackticks.length + (hasPadding ? 1 : 0),
      afterLength: closingBackticks.length + (hasPadding ? 1 : 0),
      layers: [
        {
          action: "code",
          before: openingBackticks + (hasPadding ? " " : ""),
          after: (hasPadding ? " " : "") + closingBackticks,
        },
      ],
    };
  }

  if (value.length > 2 && value.startsWith("$") && value.endsWith("$")) {
    return {
      beforeLength: 1,
      afterLength: 1,
      layers: [{ action: "formula", before: "$", after: "$" }],
    };
  }

  const starCount = Math.min(
    value.match(/^\*+/)?.[0].length || 0,
    value.match(/\*+$/)?.[0].length || 0,
  );

  if (starCount >= 3) {
    return {
      beforeLength: 3,
      afterLength: 3,
      layers: [
        { action: "bold", before: "**", after: "**" },
        { action: "italic", before: "*", after: "*" },
      ],
    };
  }

  if (starCount === 2) {
    return {
      beforeLength: 2,
      afterLength: 2,
      layers: [{ action: "bold", before: "**", after: "**" }],
    };
  }

  if (starCount === 1) {
    return {
      beforeLength: 1,
      afterLength: 1,
      layers: [{ action: "italic", before: "*", after: "*" }],
    };
  }

  return null;
}

function collectContainedInlineLayers(value) {
  const layers = [];
  let content = value;
  let match = matchContainedInlineLayer(content);

  while (match) {
    layers.push(...match.layers);
    content = content.slice(
      match.beforeLength,
      content.length - match.afterLength,
    );
    match = matchContainedInlineLayer(content);
  }

  return { content, layers };
}

function collectInlineLayers(value, start, end) {
  const layers = [];
  let outerStart = start;
  let outerEnd = end;
  let match = matchInlineLayer(value, outerStart, outerEnd);

  while (match) {
    layers.push(...match.layers);
    outerStart -= match.beforeLength;
    outerEnd += match.afterLength;
    match = matchInlineLayer(value, outerStart, outerEnd);
  }

  return { layers, outerStart, outerEnd };
}

function containsInlineLink(value) {
  const inlineToken = md.parseInline(value)[0];
  return inlineToken?.children?.some((token) => token.type === "link_open");
}

function buildInlineReplacement(content, actions, existingLayers) {
  const exclusiveAction = [...exclusiveInlineFormats].find((action) =>
    actions.has(action),
  );
  const layers = [];

  if (exclusiveAction) {
    layers.push(
      createInlineLayer(
        exclusiveAction,
        content,
        existingLayers.get(exclusiveAction),
      ),
    );
  } else {
    for (const action of ["bold", "italic", "link"]) {
      if (actions.has(action)) {
        layers.push(
          createInlineLayer(action, content, existingLayers.get(action)),
        );
      }
    }
  }

  let replacement = content;

  for (const layer of layers) {
    replacement = `${layer.before}${replacement}${layer.after}`;
  }

  return {
    replacement,
    selectionOffset: layers.reduce(
      (length, layer) => length + layer.before.length,
      0,
    ),
  };
}

function toggleInlineFormat(action) {
  const format = getInlineFormat(action);
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const hasSelection = end > start;

  if (hasSelection && editor.value.slice(start, end).includes("\n")) {
    showToast(action === "code" ? t("multilineCode") : t("inlineNoMultiline"));
    return;
  }

  if (!hasSelection) {
    const selected = format.placeholder;
    const { replacement, selectionOffset } = buildInlineReplacement(
      selected,
      new Set([action]),
      new Map(),
    );
    editor.setRangeText(replacement, start, end, "end");
    editor.focus();
    editor.setSelectionRange(
      start + selectionOffset,
      start + selectionOffset + selected.length,
    );
    render();
    updateCursorPosition();
    queueSave();
    return;
  }

  let contentStart = start;
  let contentEnd = end;

  if (composableInlineFormats.has(action)) {
    while (contentStart < contentEnd && /\s/.test(editor.value[contentStart])) {
      contentStart += 1;
    }

    while (
      contentEnd > contentStart &&
      /\s/.test(editor.value[contentEnd - 1])
    ) {
      contentEnd -= 1;
    }
  }

  if (contentStart === contentEnd) return;

  const selectedSource = editor.value.slice(contentStart, contentEnd);
  const { content: selected, layers: containedLayers } =
    collectContainedInlineLayers(selectedSource);
  const {
    layers: outerLayers,
    outerStart,
    outerEnd,
  } = collectInlineLayers(editor.value, contentStart, contentEnd);
  const allLayers = [...containedLayers, ...outerLayers];
  const existingLayers = new Map();

  for (const layer of allLayers) {
    if (!existingLayers.has(layer.action)) {
      existingLayers.set(layer.action, layer);
    }
  }

  const activeActions = new Set(existingLayers.keys());
  const isActive = activeActions.has(action);

  if (isActive) {
    activeActions.delete(action);
  } else if (exclusiveInlineFormats.has(action)) {
    activeActions.clear();
    activeActions.add(action);
  } else {
    for (const exclusiveAction of exclusiveInlineFormats) {
      activeActions.delete(exclusiveAction);
    }

    if (action === "link" && containsInlineLink(selected)) {
      showToast(t("nestedLinks"));
      return;
    }

    activeActions.add(action);
  }

  const { replacement, selectionOffset } = buildInlineReplacement(
    selected,
    activeActions,
    existingLayers,
  );

  editor.setRangeText(replacement, outerStart, outerEnd, "end");
  editor.focus();
  const selectionStart = outerStart + selectionOffset;
  editor.setSelectionRange(selectionStart, selectionStart + selected.length);
  render();
  updateCursorPosition();
  queueSave();
}

function insertMarkdown(
  before,
  after = "",
  placeholder = t("textPlaceholder"),
) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const hasSelection = end > start;
  const selected = hasSelection ? editor.value.slice(start, end) : placeholder;

  const replacement = `${before}${selected}${after}`;
  editor.setRangeText(replacement, start, end, "end");
  editor.focus();

  if (hasSelection) {
    editor.setSelectionRange(
      start + before.length,
      start + before.length + selected.length,
    );
  } else {
    const insertionEnd = start + replacement.length;
    editor.setSelectionRange(insertionEnd, insertionEnd);
  }

  render();
  updateCursorPosition();
  queueSave();
}

function parseLinePrefixes(line) {
  const indent = line.match(/^ {0,3}/)?.[0] || "";
  const layers = [];
  let content = line.slice(indent.length);
  let match;

  do {
    match = content.match(/^(>[ \t]?|[-*+][ \t]+|\d{1,9}[.)][ \t]+)/);
    if (!match) continue;

    const marker = match[0];
    const action = marker.startsWith(">")
      ? "quote"
      : /^\d/.test(marker)
        ? "ordered"
        : "bullet";
    layers.push({ action, marker });
    content = content.slice(marker.length);
  } while (match);

  return { indent, layers, content };
}

function getSelectedLineRange() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  const selectionEndsAtLineStart =
    end > start && editor.value[end - 1] === "\n";
  const lastSelectedCharacter = selectionEndsAtLineStart ? end - 1 : end;
  const nextLineBreak = editor.value.indexOf("\n", lastSelectedCharacter);
  const lineEnd = selectionEndsAtLineStart
    ? lastSelectedCharacter
    : nextLineBreak === -1
      ? editor.value.length
      : nextLineBreak;

  return {
    lineStart,
    lineEnd,
    source: editor.value.slice(lineStart, lineEnd),
  };
}

function toggleLinePrefix(
  action,
  placeholder = t("listPlaceholder"),
  options = {},
) {
  const { lineStart, lineEnd, source } = getSelectedLineRange();

  if (
    (action === "bullet" || action === "ordered") &&
    containsCodeFence(source)
  ) {
    showToast(t("codeList"));
    return;
  }

  const selection = source || placeholder;
  const parsedLines = selection.split("\n").map(parseLinePrefixes);
  const nonemptyLines = parsedLines.filter(
    ({ content, layers }) => content || layers.length,
  );
  const isActive =
    nonemptyLines.length > 0 &&
    nonemptyLines.every(({ layers }) =>
      layers.some((layer) => layer.action === action),
    );
  let orderedIndex = 1;
  const replacement = parsedLines
    .map(({ indent, layers: collectedLayers, content }) => {
      let quoteDepth = collectedLayers.filter(
        (layer) => layer.action === "quote",
      ).length;
      const activeActions = new Set(
        collectedLayers
          .filter((layer) => layer.action !== "quote")
          .map((layer) => layer.action),
      );

      if (action === "quote") {
        if (options.addQuoteLevel || !isActive) {
          quoteDepth += 1;
        } else {
          quoteDepth = Math.max(0, quoteDepth - 1);
        }
      } else if (isActive) {
        activeActions.delete(action);
      } else if (action === "bullet" || action === "ordered") {
        activeActions.delete("bullet");
        activeActions.delete("ordered");
        activeActions.add(action);
      } else {
        activeActions.add(action);
      }

      const quoteMarker = "> ".repeat(quoteDepth);
      let listMarker = "";

      if (activeActions.has("bullet")) {
        listMarker = "- ";
      } else if (activeActions.has("ordered")) {
        listMarker = `${orderedIndex}. `;
        orderedIndex += 1;
      }

      return `${indent}${quoteMarker}${listMarker}${content}`;
    })
    .join("\n");

  editor.setRangeText(replacement, lineStart, lineEnd, "select");
  editor.focus();
  render();
  updateCursorPosition();
  queueSave();
}

function parseBlockQuotePrefix(line) {
  const indent = line.match(/^ {0,3}/)?.[0] || "";
  let content = line.slice(indent.length);
  let quoteDepth = 0;
  let match = content.match(/^>[ \t]?/);

  while (match) {
    quoteDepth += 1;
    content = content.slice(match[0].length);
    match = content.match(/^>[ \t]?/);
  }

  return {
    content,
    indent,
    prefix: `${indent}${"> ".repeat(quoteDepth)}`,
    quoteDepth,
  };
}

function containsCodeFence(value) {
  return value
    .split("\n")
    .some((line) => /^(`{3,}|~{3,})/.test(parseBlockQuotePrefix(line).content));
}

function toggleCodeBlock() {
  const { lineStart, lineEnd, source } = getSelectedLineRange();
  const selection = source || "code";
  const lines = selection.split("\n");
  const firstLine = parseBlockQuotePrefix(lines[0]);
  const lastLine = parseBlockQuotePrefix(lines.at(-1));
  const openingFence = firstLine.content.match(/^(`{3,}|~{3,})(.*)$/);
  const closingFence = lastLine.content.match(/^(`{3,}|~{3,})[ \t]*$/);
  const isFenced =
    lines.length >= 2 &&
    openingFence &&
    closingFence &&
    firstLine.prefix === lastLine.prefix &&
    openingFence[1][0] === closingFence[1][0] &&
    closingFence[1].length >= openingFence[1].length;

  if (isFenced) {
    const replacement = lines.slice(1, -1).join("\n");
    editor.setRangeText(replacement, lineStart, lineEnd, "select");
    editor.focus();
    render();
    updateCursorPosition();
    queueSave();
    return;
  }

  const parsedLines = lines.map(parseBlockQuotePrefix);
  const commonQuoteDepth = Math.min(
    ...parsedLines.map(({ quoteDepth }) => quoteDepth),
  );
  const commonIndent = parsedLines.every(
    ({ indent }) => indent === parsedLines[0].indent,
  )
    ? parsedLines[0].indent
    : "";
  const prefix = `${commonIndent}${"> ".repeat(commonQuoteDepth)}`;
  const longestBacktickRun = Math.max(
    0,
    ...(selection.match(/`+/g) || []).map((run) => run.length),
  );
  const fence = "`".repeat(Math.max(3, longestBacktickRun + 1));
  const replacement = `${prefix}${fence}\n${selection}\n${prefix}${fence}`;

  editor.setRangeText(replacement, lineStart, lineEnd, "select");
  editor.focus();
  render();
  updateCursorPosition();
  queueSave();
}

function flashToolbarButton(button) {
  button.classList.add("is-active");
  window.setTimeout(() => button.classList.remove("is-active"), 180);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    1800,
  );
}

function hideButtonTooltip() {
  buttonTooltip.hidden = true;
  buttonTooltip.setAttribute("aria-hidden", "true");
}

function showButtonTooltip(button) {
  const label = button.dataset.tooltip;
  if (!label) return hideButtonTooltip();

  buttonTooltip.textContent = label;
  buttonTooltip.hidden = false;
  buttonTooltip.setAttribute("aria-hidden", "false");

  const bounds = button.getBoundingClientRect();
  const margin = 12;
  const tooltipWidth = buttonTooltip.offsetWidth;
  const tooltipHeight = buttonTooltip.offsetHeight;
  const maxLeft = window.innerWidth - tooltipWidth - margin;
  const maxTop = window.innerHeight - tooltipHeight - margin;
  const left = Math.max(
    margin,
    Math.min(bounds.left + bounds.width / 2 - tooltipWidth / 2, maxLeft),
  );
  const preferredTop = bounds.bottom + 8;
  const top =
    preferredTop <= maxTop
      ? preferredTop
      : Math.max(margin, bounds.top - tooltipHeight - 8);

  buttonTooltip.style.left = `${left}px`;
  buttonTooltip.style.top = `${top}px`;
}

function positionMoreMenu() {
  const bounds = moreButton.getBoundingClientRect();
  const margin = 12;
  const menuWidth = moreMenu.offsetWidth;
  const menuHeight = moreMenu.offsetHeight;
  const maxLeft = window.innerWidth - menuWidth - margin;
  const maxTop = window.innerHeight - menuHeight - margin;
  const left = Math.max(margin, Math.min(bounds.right - menuWidth, maxLeft));
  const preferredTop = bounds.bottom + 8;
  const top =
    preferredTop <= maxTop
      ? preferredTop
      : Math.max(margin, bounds.top - menuHeight - 8);

  moreMenu.style.left = `${left}px`;
  moreMenu.style.top = `${top}px`;
}

function setMode(mode, options = {}) {
  const validMode = ["split", "edit", "preview"].includes(mode)
    ? mode
    : "split";

  if (validMode === "split") {
    const nextWidth = options.editorWidth || splitEditorWidth;
    splitEditorWidth = nextWidth;
    workspace.style.setProperty("--editor-width", nextWidth);
    workspace.style.setProperty("--resizer-width", "8px");
  } else {
    if (options.editorWidth) splitEditorWidth = options.editorWidth;
    workspace.style.setProperty(
      "--editor-width",
      validMode === "edit" ? "100%" : "0%",
    );
    workspace.style.setProperty("--resizer-width", "0px");
  }

  workspace.dataset.mode = validMode;
  editorPane.classList.toggle("is-title-collapsed", validMode === "preview");
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === validMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  localStorage.setItem(storageKeys.mode, validMode);
}

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = resolvedTheme;
  themeButton.setAttribute(
    "aria-label",
    resolvedTheme === "dark" ? t("switchToLight") : t("switchToDark"),
  );
  themeButton.innerHTML = `<i data-lucide="${resolvedTheme === "dark" ? "sun" : "moon"}" aria-hidden="true"></i>`;
  localStorage.setItem(storageKeys.theme, resolvedTheme);
  createIcons({ icons: appIcons });
}

function setGithubRepositoryLink() {
  githubLink.href = "https://github.com/HarleyZHOUzzz/mdonline";
}

document.querySelector("#toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const actions = {
    bold: () => toggleInlineFormat("bold"),
    italic: () => toggleInlineFormat("italic"),
    link: () => toggleInlineFormat("link"),
    code: () => toggleInlineFormat("code"),
    codeblock: () => toggleCodeBlock(),
    bullet: () => toggleLinePrefix("bullet"),
    ordered: () => toggleLinePrefix("ordered"),
    quote: () =>
      toggleLinePrefix("quote", t("quotePlaceholder"), {
        addQuoteLevel: event.shiftKey,
      }),
    formula: () => toggleInlineFormat("formula"),
    image: () => toggleInlineFormat("image"),
  };

  actions[button.dataset.action]?.();
  flashToolbarButton(button);
});

editor.addEventListener("input", () => {
  render();
  updateCursorPosition();
  queueSave();
});

formatStatus.addEventListener("click", () => {
  if (!currentDiagnostics.length) {
    showToast(t("noFormatIssues"));
    return;
  }

  setDiagnosticsPanel(diagnosticsPanel.hidden);
});

diagnosticsClose.addEventListener("click", () => {
  setDiagnosticsPanel(false);
});

diagnosticsList.addEventListener("click", (event) => {
  const item = event.target.closest("button[data-line]");
  if (!item) return;
  jumpToDiagnostic(Number(item.dataset.line), Number(item.dataset.column));
});

["click", "keyup", "select"].forEach((eventName) => {
  editor.addEventListener(eventName, updateCursorPosition);
});

editor.addEventListener("keydown", (event) => {
  const modifier = event.metaKey || event.ctrlKey;

  if (event.key === "Tab") {
    event.preventDefault();
    insertMarkdown("  ", "", "");
  }

  if (!modifier) return;

  const shortcuts = {
    b: () => toggleInlineFormat("bold"),
    i: () => toggleInlineFormat("italic"),
    k: () => toggleInlineFormat("link"),
  };

  const action = shortcuts[event.key.toLowerCase()];
  if (action) {
    event.preventDefault();
    action();
  }
});

editor.addEventListener("scroll", () => {
  hideDiagnosticHover();
  syncLineNumbers();
  if (syncingScroll || workspace.dataset.mode !== "split") return;

  syncingScroll = true;
  const editorRange = Math.max(0, editor.scrollHeight - editor.clientHeight);
  const previewRange = Math.max(0, preview.scrollHeight - preview.clientHeight);
  preview.scrollTop =
    editorRange > 0 ? (editor.scrollTop / editorRange) * previewRange : 0;

  window.requestAnimationFrame(() => {
    syncingScroll = false;
  });
});

editor.addEventListener("pointermove", updateDiagnosticHover);
editor.addEventListener("pointerleave", hideDiagnosticHover);

preview.addEventListener("scroll", () => {
  if (syncingScroll || workspace.dataset.mode !== "split") return;

  syncingScroll = true;
  const previewRange = Math.max(0, preview.scrollHeight - preview.clientHeight);
  const editorRange = Math.max(0, editor.scrollHeight - editor.clientHeight);
  editor.scrollTop =
    previewRange > 0 ? (preview.scrollTop / previewRange) * editorRange : 0;
  syncLineNumbers();

  window.requestAnimationFrame(() => {
    syncingScroll = false;
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () =>
    applyLanguage(button.dataset.language, true),
  );
});

themeButton.addEventListener("click", () => {
  applyTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );
});

newDocumentButton.addEventListener("click", () => {
  const hasContent = editor.value.trim() && editor.value !== starterDocument;
  if (hasContent && !window.confirm(t("newDocumentConfirm"))) return;

  editor.value = `# ${t("unnamedDocument")}\n\n${t("writeHere")}\n`;
  render();
  queueSave();
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
});

moreButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = !moreMenu.hidden;
  moreMenu.hidden = isOpen;
  moreButton.setAttribute("aria-expanded", String(!isOpen));
  hideButtonTooltip();
  if (!isOpen) positionMoreMenu();
});

document.addEventListener("click", () => {
  moreMenu.hidden = true;
  moreButton.setAttribute("aria-expanded", "false");
});

document.querySelectorAll("[data-tooltip]").forEach((button) => {
  button.addEventListener("pointerenter", () => showButtonTooltip(button));
  button.addEventListener("pointerleave", hideButtonTooltip);
  button.addEventListener("focus", () => showButtonTooltip(button));
  button.addEventListener("blur", hideButtonTooltip);
});

window.addEventListener("resize", () => {
  hideButtonTooltip();
  if (!moreMenu.hidden) positionMoreMenu();
  scheduleLineNumberUpdate();
});

window.visualViewport?.addEventListener("resize", scheduleLineNumberUpdate);

document.querySelector("#copy-markdown").addEventListener("click", async () => {
  await navigator.clipboard.writeText(editor.value);
  showToast(t("copySuccess"));
});

document.querySelector("#download-markdown").addEventListener("click", () => {
  const blob = new Blob([editor.value], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "document.md";
  link.click();
  URL.revokeObjectURL(url);
  showToast(t("downloadSuccess"));
});

resizer.addEventListener("pointerdown", (event) => {
  if (workspace.dataset.mode !== "split") return;
  const workspaceBounds = workspace.getBoundingClientRect();
  const editorHeader = editorPane.querySelector(".pane-header");
  const editorTitle = editorPane.querySelector(".pane-title");
  const toolbar = editorPane.querySelector(".toolbar");
  const headerStyle = getComputedStyle(editorHeader);
  const requiredWidth =
    editorTitle.getBoundingClientRect().width +
    toolbar.getBoundingClientRect().width +
    Number.parseFloat(headerStyle.paddingLeft) +
    Number.parseFloat(headerStyle.paddingRight) +
    Number.parseFloat(headerStyle.gap);
  activePreviewSnapThreshold = Math.min(
    82,
    Math.max(12, (requiredWidth / workspaceBounds.width) * 100),
  );
  dragging = true;
  resizer.setPointerCapture(event.pointerId);
  workspace.classList.add("is-dragging");
  document.body.classList.add("is-resizing");
});

resizer.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const bounds = workspace.getBoundingClientRect();
  const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
  const targetMode =
    percentage <= activePreviewSnapThreshold
      ? "preview"
      : percentage >= 100 - paneSnapThreshold
        ? "edit"
        : "split";
  const modeChanged = workspace.dataset.mode !== targetMode;

  if (modeChanged) {
    workspace.classList.add("is-snapping");
    if (targetMode === "preview") {
      splitEditorWidth = `${activePreviewSnapThreshold}%`;
    } else if (targetMode === "edit") {
      splitEditorWidth = `${100 - paneSnapThreshold}%`;
    }
    setMode(targetMode, { editorWidth: splitEditorWidth });
  }

  editorPane.classList.toggle(
    "is-title-collapsed",
    targetMode === "preview" || percentage <= activePreviewSnapThreshold + 5,
  );

  if (targetMode === "split") {
    splitEditorWidth = `${Math.min(82, Math.max(18, percentage))}%`;
    workspace.style.setProperty("--editor-width", splitEditorWidth);
    workspace.style.setProperty("--resizer-width", "8px");
  }
});

resizer.addEventListener("pointerup", (event) => {
  dragging = false;
  resizer.releasePointerCapture(event.pointerId);
  workspace.classList.remove("is-dragging", "is-snapping");
  document.body.classList.remove("is-resizing");
  if (workspace.dataset.mode === "split") {
    editorPane.classList.remove("is-title-collapsed");
  }
  updateLineNumbers();
});

resizer.addEventListener("lostpointercapture", () => {
  dragging = false;
  workspace.classList.remove("is-dragging", "is-snapping");
  document.body.classList.remove("is-resizing");
  if (workspace.dataset.mode === "split") {
    editorPane.classList.remove("is-title-collapsed");
  }
});

workspace.addEventListener("transitionend", (event) => {
  if (event.propertyName !== "--editor-width") return;
  syncDiagnosticOverlay();
  updateLineNumbers();
});

const editorResizeObserver = new ResizeObserver(() => {
  syncDiagnosticOverlay();
  scheduleLineNumberUpdate();
});
editorResizeObserver.observe(editor);

const storedTheme = localStorage.getItem(storageKeys.theme);
const storedLanguage = localStorage.getItem(storageKeys.language);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

editor.value = localStorage.getItem(storageKeys.content) || starterDocument;
setMode(localStorage.getItem(storageKeys.mode) || "split");
applyLanguage(storedLanguage || "zh-CN");
applyTheme(storedTheme || preferredTheme);
reserveLocalizedWidths();
document.fonts?.ready.then(reserveLocalizedWidths);
setGithubRepositoryLink();
render();
updateCursorPosition();
createIcons({ icons: appIcons });
