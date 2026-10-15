import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
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
  Sun,
} from "lucide";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import markdownItTaskLists from "markdown-it-task-lists";

import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "./style.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);

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

---

继续编辑左侧内容，试着加入一个 [链接](https://github.com)、表格或你自己的公式。
`
  .replaceAll("\\`", "`")
  .replaceAll("\\${", "${");

const storageKeys = {
  content: "moke-markdown-content",
  mode: "moke-markdown-mode",
  theme: "moke-markdown-theme",
};

const editor = document.querySelector("#editor");
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

let saveTimer;
let toastTimer;
let dragging = false;
let syncingScroll = false;

const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${
        hljs.highlight(code, {
          language,
          ignoreIllegals: true,
        }).value
      }</code></pre>`;
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`;
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

function render() {
  const value = editor.value;
  preview.innerHTML = md.render(value);
  updateDocumentStats(value);
}

function updateDocumentStats(value) {
  const latinWords = value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || [];
  const cjkCharacters = value.match(/[\u3400-\u9fff]/g) || [];
  const count = latinWords.length + cjkCharacters.length;
  const minutes = Math.max(1, Math.ceil(count / 300));

  wordCount.textContent = `${count.toLocaleString()} 字`;
  readTime.textContent = `约 ${minutes} 分钟阅读`;
}

function updateCursorPosition() {
  const beforeCursor = editor.value.slice(0, editor.selectionStart);
  const lines = beforeCursor.split("\n");
  cursorPosition.textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`;
}

function queueSave() {
  saveState.classList.add("is-saving");
  saveState.querySelector("span:last-child").textContent = "正在保存";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(storageKeys.content, editor.value);
    saveState.classList.remove("is-saving");
    saveState.querySelector("span:last-child").textContent = "已自动保存";
  }, 420);
}

function insertMarkdown(before, after = "", placeholder = "文字") {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const replacement = `${before}${selected}${after}`;
  editor.setRangeText(replacement, start, end, "end");
  editor.focus();
  editor.setSelectionRange(
    start + before.length,
    start + before.length + selected.length,
  );
  render();
  updateCursorPosition();
  queueSave();
}

function insertLinePrefix(prefix, placeholder = "列表项") {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  const selection = editor.value.slice(lineStart, end) || placeholder;
  const replacement = selection
    .split("\n")
    .map(
      (line, index) =>
        `${typeof prefix === "function" ? prefix(index) : prefix}${line}`,
    )
    .join("\n");

  editor.setRangeText(replacement, lineStart, end, "end");
  editor.focus();
  render();
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

function setMode(mode) {
  const validMode = ["split", "edit", "preview"].includes(mode)
    ? mode
    : "split";
  workspace.dataset.mode = validMode;
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
    resolvedTheme === "dark" ? "切换到浅色主题" : "切换到深色主题",
  );
  themeButton.innerHTML = `<i data-lucide="${resolvedTheme === "dark" ? "sun" : "moon"}" aria-hidden="true"></i>`;
  localStorage.setItem(storageKeys.theme, resolvedTheme);
  createIcons({ icons: appIcons });
}

function resolveGithubRepository() {
  const hostParts = window.location.hostname.split(".");
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (hostParts[1] === "github" && hostParts[2] === "io") {
    const repository = pathParts[0] || `${hostParts[0]}.github.io`;
    githubLink.href = `https://github.com/${hostParts[0]}/${repository}`;
  }
}

document.querySelector("#toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const actions = {
    bold: () => insertMarkdown("**", "**", "粗体文字"),
    italic: () => insertMarkdown("*", "*", "斜体文字"),
    link: () => insertMarkdown("[", "](https://example.com)", "链接文字"),
    code: () => insertMarkdown("`", "`", "code"),
    bullet: () => insertLinePrefix("- "),
    ordered: () => insertLinePrefix((index) => `${index + 1}. `),
    quote: () => insertLinePrefix("> ", "引用内容"),
    formula: () => insertMarkdown("$", "$", "E = mc^2"),
    image: () =>
      insertMarkdown("![", "](https://example.com/image.jpg)", "图片描述"),
  };

  actions[button.dataset.action]?.();
  flashToolbarButton(button);
});

editor.addEventListener("input", () => {
  render();
  updateCursorPosition();
  queueSave();
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
    b: () => insertMarkdown("**", "**", "粗体文字"),
    i: () => insertMarkdown("*", "*", "斜体文字"),
    k: () => insertMarkdown("[", "](https://example.com)", "链接文字"),
  };

  const action = shortcuts[event.key.toLowerCase()];
  if (action) {
    event.preventDefault();
    action();
  }
});

editor.addEventListener("scroll", () => {
  if (syncingScroll || workspace.dataset.mode !== "split") return;
  syncingScroll = true;
  const editorRange = editor.scrollHeight - editor.clientHeight;
  const previewRange = preview.scrollHeight - preview.clientHeight;
  preview.scrollTop =
    editorRange > 0 ? (editor.scrollTop / editorRange) * previewRange : 0;
  window.requestAnimationFrame(() => {
    syncingScroll = false;
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

themeButton.addEventListener("click", () => {
  applyTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );
});

newDocumentButton.addEventListener("click", () => {
  const hasContent = editor.value.trim() && editor.value !== starterDocument;
  if (hasContent && !window.confirm("新建文稿会清空当前内容，确定继续吗？"))
    return;

  editor.value = "# 未命名文稿\n\n从这里开始书写……\n";
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
});

document.addEventListener("click", () => {
  moreMenu.hidden = true;
  moreButton.setAttribute("aria-expanded", "false");
});

document.querySelector("#copy-markdown").addEventListener("click", async () => {
  await navigator.clipboard.writeText(editor.value);
  showToast("Markdown 已复制");
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
  showToast("文稿已下载");
});

resizer.addEventListener("pointerdown", (event) => {
  if (workspace.dataset.mode !== "split") return;
  dragging = true;
  resizer.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing");
});

resizer.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const bounds = workspace.getBoundingClientRect();
  const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
  workspace.style.setProperty(
    "--editor-width",
    `${Math.min(72, Math.max(28, percentage))}%`,
  );
});

resizer.addEventListener("pointerup", (event) => {
  dragging = false;
  resizer.releasePointerCapture(event.pointerId);
  document.body.classList.remove("is-resizing");
});

const storedTheme = localStorage.getItem(storageKeys.theme);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

editor.value = localStorage.getItem(storageKeys.content) || starterDocument;
setMode(localStorage.getItem(storageKeys.mode) || "split");
applyTheme(storedTheme || preferredTheme);
resolveGithubRepository();
render();
updateCursorPosition();
createIcons({ icons: appIcons });
