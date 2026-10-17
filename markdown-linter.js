import katex from "katex";

function createDiagnostic(line, column, severity, code, message, length = 1) {
  return { line, column, severity, code, message, length };
}

function isEscaped(value, index) {
  let slashCount = 0;
  for (
    let cursor = index - 1;
    cursor >= 0 && value[cursor] === "\\";
    cursor -= 1
  ) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function stripContainerPrefix(line) {
  const indent = line.match(/^ {0,3}/)?.[0] || "";
  let content = line.slice(indent.length);
  let quoteDepth = 0;
  let quote = content.match(/^>[ \t]?/);

  while (quote) {
    quoteDepth += 1;
    content = content.slice(quote[0].length);
    quote = content.match(/^>[ \t]?/);
  }

  return { content, offset: line.length - content.length, quoteDepth };
}

function findClosingRun(value, start, marker, length) {
  let cursor = start;
  while (cursor < value.length) {
    if (value[cursor] !== marker || isEscaped(value, cursor)) {
      cursor += 1;
      continue;
    }

    let runLength = 1;
    while (value[cursor + runLength] === marker) runLength += 1;
    if (runLength === length) return cursor;
    cursor += runLength;
  }
  return -1;
}

function maskInlineCode(line, lineNumber, diagnostics, columnOffset) {
  const characters = [...line];
  let cursor = 0;

  while (cursor < line.length) {
    if (line[cursor] !== "`" || isEscaped(line, cursor)) {
      cursor += 1;
      continue;
    }

    let runLength = 1;
    while (line[cursor + runLength] === "`") runLength += 1;
    const closing = findClosingRun(line, cursor + runLength, "`", runLength);

    if (closing < 0) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          cursor + columnOffset + 1,
          "warning",
          "unclosed-inline-code",
          "行内代码缺少闭合反引号",
          runLength,
        ),
      );
      break;
    }

    for (let index = cursor; index < closing + runLength; index += 1) {
      characters[index] = " ";
    }
    cursor = closing + runLength;
  }

  return characters.join("");
}

function formatKatexError(error) {
  return String(error?.message || "公式语法错误")
    .replace(/^KaTeX parse error:\s*/i, "")
    .replace(/\s+at position\s+\d+:?[\s\S]*$/i, "")
    .trim();
}

function validateFormula(expression, line, column, displayMode, diagnostics) {
  const delimiterLength = displayMode ? 4 : 2;
  const diagnosticLength = Math.max(1, expression.length + delimiterLength);
  if (!expression.trim()) {
    diagnostics.push(
      createDiagnostic(
        line,
        column,
        "warning",
        "empty-formula",
        "公式内容为空",
        diagnosticLength,
      ),
    );
    return;
  }

  try {
    katex.renderToString(expression, {
      displayMode,
      strict: "ignore",
      throwOnError: true,
      trust: false,
    });
  } catch (error) {
    diagnostics.push(
      createDiagnostic(
        line,
        column,
        "error",
        "invalid-formula",
        `LaTeX：${formatKatexError(error)}`,
        diagnosticLength,
      ),
    );
  }
}

function maskInlineMath(line, lineNumber, diagnostics, columnOffset) {
  const characters = [...line];
  let cursor = 0;

  while (cursor < line.length) {
    if (
      line[cursor] !== "$" ||
      isEscaped(line, cursor) ||
      line[cursor + 1] === "$" ||
      line[cursor - 1] === "$"
    ) {
      cursor += 1;
      continue;
    }

    const closing = findClosingRun(line, cursor + 1, "$", 1);
    if (closing < 0) {
      const looksLikeCurrency = /\d/.test(line[cursor + 1] || "");
      if (!looksLikeCurrency) {
        diagnostics.push(
          createDiagnostic(
            lineNumber,
            cursor + columnOffset + 1,
            "warning",
            "unclosed-inline-formula",
            "行内公式缺少闭合的 $",
            Math.max(1, line.length - cursor),
          ),
        );
      }
      break;
    }

    validateFormula(
      line.slice(cursor + 1, closing),
      lineNumber,
      cursor + columnOffset + 1,
      false,
      diagnostics,
    );
    for (let index = cursor; index <= closing; index += 1) {
      characters[index] = " ";
    }
    cursor = closing + 1;
  }

  return characters.join("");
}

function findClosingParenthesis(value, start) {
  let depth = 1;
  let angleDestination = false;

  for (let cursor = start; cursor < value.length; cursor += 1) {
    if (isEscaped(value, cursor)) continue;
    if (value[cursor] === "<" && depth === 1) angleDestination = true;
    if (value[cursor] === ">" && angleDestination) angleDestination = false;
    if (angleDestination) continue;
    if (value[cursor] === "(") depth += 1;
    if (value[cursor] === ")") depth -= 1;
    if (depth === 0) return cursor;
  }
  return -1;
}

function lintLinks(line, lineNumber, diagnostics, columnOffset) {
  const linkPattern = /(!?)\[([^\]]*)\]\(/g;
  let match = linkPattern.exec(line);

  while (match) {
    const destinationStart = match.index + match[0].length;
    const closing = findClosingParenthesis(line, destinationStart);
    if (closing < 0) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          match.index + columnOffset + 1,
          "error",
          "unclosed-link",
          `${match[1] ? "图片" : "链接"}缺少闭合的 )`,
          Math.max(1, line.length - match.index),
        ),
      );
      break;
    }

    const destination = line.slice(destinationStart, closing).trim();
    if (!destination) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          destinationStart + columnOffset + 1,
          "warning",
          "empty-destination",
          `${match[1] ? "图片" : "链接"}地址为空`,
          2,
        ),
      );
    }
    if (match[1] && !match[2].trim()) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          match.index + columnOffset + 1,
          "warning",
          "empty-image-alt",
          "图片缺少替代文字",
          Math.max(2, match[0].length),
        ),
      );
    }

    linkPattern.lastIndex = closing + 1;
    match = linkPattern.exec(line);
  }
}

function lintVisibleLine(line, lineNumber, diagnostics, columnOffset) {
  const heading = line.match(/^ {0,3}(#{1,6})[^#\s]/);
  if (heading) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        line.indexOf("#") + columnOffset + 1,
        "warning",
        "heading-space",
        "标题标记后应添加空格",
        heading[1].length + 1,
      ),
    );
  }

  const htmlTag = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*|\/?)>/.exec(line);
  if (htmlTag) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        htmlTag.index + columnOffset + 1,
        "warning",
        "raw-html-disabled",
        "当前编辑器未启用原始 HTML",
        htmlTag[0].length,
      ),
    );
  }
}

function lintFullWidthMarkdownSyntax(
  line,
  lineNumber,
  diagnostics,
  columnOffset,
) {
  const add = (match, code, message) => {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        match.index + columnOffset + 1,
        "error",
        code,
        message,
        match[0].length,
      ),
    );
  };

  const heading = /^ {0,3}＃{1,6}/.exec(line);
  if (heading) {
    add(
      heading,
      "fullwidth-heading-marker",
      "标题应使用半角 #，不要使用全角 ＃",
    );
  }

  const quote = /^ {0,3}＞/.exec(line);
  if (quote) {
    add(quote, "fullwidth-quote-marker", "引用应使用半角 >，不要使用全角 ＞");
  }

  const fence = /^ {0,3}｀{3,}/.exec(line);
  if (fence) {
    add(
      fence,
      "fullwidth-code-fence",
      "代码围栏应使用半角反引号 ```，不要使用全角 ｀",
    );
    return;
  }

  const fullWidthList = /^ {0,3}[－＋＊](?=\s|［|\[)/.exec(line);
  if (fullWidthList) {
    add(
      fullWidthList,
      "fullwidth-list-marker",
      "列表标记应使用半角 -、+ 或 *，不要使用全角符号",
    );
  }

  const fullWidthLink =
    /(?:！|!)?(?:［[^］]*］(?:（[^）]*）|\([^)]*\))|\[[^\]]*\]（[^）]*）)/g;
  let link = fullWidthLink.exec(line);
  while (link) {
    add(
      link,
      "fullwidth-link-delimiter",
      "链接或图片应使用半角 []()，不要使用全角括号或方括号",
    );
    link = fullWidthLink.exec(line);
  }

  const inlineCode = /｀[^｀\n]+｀/g;
  let code = inlineCode.exec(line);
  while (code) {
    add(
      code,
      "fullwidth-inline-code-marker",
      "行内代码应使用半角反引号 `，不要使用全角 ｀",
    );
    code = inlineCode.exec(line);
  }

  const formula = /＄[^＄\n]+＄/g;
  let math = formula.exec(line);
  while (math) {
    add(
      math,
      "fullwidth-formula-delimiter",
      "公式应使用半角 $，不要使用全角 ＄",
    );
    math = formula.exec(line);
  }

  const tablePipe = /｜/.exec(line);
  if (
    tablePipe &&
    (line.trimStart().startsWith("｜") || line.trimEnd().endsWith("｜"))
  ) {
    add(
      tablePipe,
      "fullwidth-table-pipe",
      "表格列分隔符应使用半角 |，不要使用全角 ｜",
    );
  }

  const emphasis = /＊{1,3}[^＊\n]+＊{1,3}/g;
  let emphasisMatch = emphasis.exec(line);
  while (emphasisMatch) {
    add(
      emphasisMatch,
      "fullwidth-emphasis-marker",
      "强调语法应使用半角 *，不要使用全角 ＊",
    );
    emphasisMatch = emphasis.exec(line);
  }
}

function lintListSyntax(line, lineNumber, diagnostics, columnOffset) {
  const task = /^ {0,3}([-+*]|\d{1,9}[.)])(\s*)\[([^\]\n]*)(\])?/.exec(line);
  if (task) {
    const marker = task[1];
    const space = task[2];
    const state = task[3];
    const closed = task[4] === "]";
    const taskColumn = task.index + marker.length + columnOffset + 1;

    if (!space) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          task.index + columnOffset + 1,
          "error",
          "task-list-spacing",
          `任务列表应写为 "${marker} [x]"，列表标记后需要一个空格`,
          marker.length + 1,
        ),
      );
    }
    if (!closed) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          taskColumn,
          "error",
          "unclosed-task-checkbox",
          "任务列表复选框缺少闭合的 ]",
          Math.max(1, line.length - task.index - marker.length - space.length),
        ),
      );
    } else if (state !== " " && state.toLowerCase() !== "x") {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          taskColumn + 1,
          "error",
          "invalid-task-state",
          "任务状态只能是空格、x 或 X",
          Math.max(1, state.length),
        ),
      );
    }
    return;
  }

  const unordered = /^ {0,3}([-+*])(?=[^\s])/u.exec(line);
  if (unordered && !/^ {0,3}(?:---|\*\*\*)/.test(line)) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        unordered.index + columnOffset + 1,
        "warning",
        "list-marker-spacing",
        "无序列表标记后应添加一个空格",
        2,
      ),
    );
  }

  const ordered = /^ {0,3}\d{1,9}[.)](?=[^\s])/.exec(line);
  if (ordered) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        ordered.index + columnOffset + 1,
        "warning",
        "ordered-list-marker-spacing",
        "有序列表标记后应添加一个空格",
        ordered[0].length + 1,
      ),
    );
  }
}

function lintHeadingStructure(lines, fencedLines, diagnostics) {
  let previousLevel = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (fencedLines.has(lineNumber)) return;
    const { content, offset } = stripContainerPrefix(line);
    const heading = /^ {0,3}(#{1,6})(?:\s|$)/.exec(content);
    if (!heading) return;

    const level = heading[1].length;
    if (previousLevel && level > previousLevel + 1) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          heading.index + offset + 1,
          "warning",
          "heading-level-skip",
          `标题层级从 H${previousLevel} 跳到了 H${level}`,
          level,
        ),
      );
    }
    previousLevel = level;
  });
}

function tableCells(line) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function lintTables(lines, fencedLines, diagnostics) {
  for (let index = 0; index < lines.length - 1; index += 1) {
    const lineNumber = index + 1;
    if (fencedLines.has(lineNumber) || fencedLines.has(lineNumber + 1))
      continue;
    const header = stripContainerPrefix(lines[index]);
    const separator = stripContainerPrefix(lines[index + 1]);
    if (!header.content.includes("|") || !separator.content.includes("|"))
      continue;

    const separatorCells = tableCells(separator.content);
    if (!separatorCells.some((cell) => /[-:]/.test(cell))) continue;
    const headerCells = tableCells(header.content);
    const invalidCell = separatorCells.find(
      (cell) => !/^:?-{3,}:?$/.test(cell),
    );

    if (invalidCell !== undefined) {
      diagnostics.push(
        createDiagnostic(
          lineNumber + 1,
          separator.offset + 1,
          "error",
          "invalid-table-separator",
          "表格分隔行的每一列应为至少 3 个 -，可在两侧使用 : 对齐",
          Math.max(1, separator.content.length),
        ),
      );
    }
    if (headerCells.length !== separatorCells.length) {
      diagnostics.push(
        createDiagnostic(
          lineNumber + 1,
          separator.offset + 1,
          "error",
          "table-column-count",
          "表头与分隔行的列数不一致",
          Math.max(1, separator.content.length),
        ),
      );
    }
  }
}

function lintMarkdownSyntax(lines, fencedLines, diagnostics) {
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (fencedLines.has(lineNumber)) return;
    const { content, offset } = stripContainerPrefix(line);
    lintFullWidthMarkdownSyntax(content, lineNumber, diagnostics, offset);
    lintListSyntax(content, lineNumber, diagnostics, offset);
  });
}

function collectFenceLines(lines, diagnostics, isKnownLanguage) {
  const fencedLines = new Set();
  let fence = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const { content, quoteDepth } = stripContainerPrefix(line);
    const markerMatch = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

    if (!fence && markerMatch) {
      const marker = markerMatch[1];
      const info = markerMatch[2].trim();
      const language = info.split(/\s+/)[0].toLowerCase();
      fence = {
        character: marker[0],
        length: marker.length,
        line: lineNumber,
        column: line.indexOf(marker) + 1,
        quoteDepth,
      };
      fencedLines.add(lineNumber);

      if (marker[0] === "`" && info.includes("`")) {
        diagnostics.push(
          createDiagnostic(
            lineNumber,
            fence.column,
            "error",
            "invalid-fence-info",
            "反引号代码围栏的语言标记中不能包含反引号",
            marker.length + info.length,
          ),
        );
      } else if (language && !isKnownLanguage(language)) {
        diagnostics.push(
          createDiagnostic(
            lineNumber,
            fence.column + marker.length,
            "warning",
            "unknown-code-language",
            `未知的代码类型：${language}`,
            language.length,
          ),
        );
      }
      return;
    }

    if (!fence) return;
    fencedLines.add(lineNumber);
    if (!markerMatch || markerMatch[2].trim()) return;

    const marker = markerMatch[1];
    if (
      marker[0] === fence.character &&
      marker.length >= fence.length &&
      quoteDepth === fence.quoteDepth
    ) {
      fence = null;
    }
  });

  if (fence) {
    diagnostics.push(
      createDiagnostic(
        fence.line,
        fence.column,
        "error",
        "unclosed-code-fence",
        "代码块缺少闭合围栏",
        fence.length,
      ),
    );
  }

  return fencedLines;
}

function lintMath(lines, fencedLines, diagnostics) {
  let block = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (fencedLines.has(lineNumber)) return;

    const { content, offset } = stripContainerPrefix(line);
    const inlineCodeMasked = maskInlineCode(
      content,
      lineNumber,
      diagnostics,
      offset,
    );

    if (block) {
      const closing = inlineCodeMasked.indexOf("$$");
      if (closing >= 0 && !isEscaped(inlineCodeMasked, closing)) {
        block.content.push(inlineCodeMasked.slice(0, closing));
        validateFormula(
          block.content.join("\n"),
          block.line,
          block.column,
          true,
          diagnostics,
        );
        block = null;
      } else {
        block.content.push(inlineCodeMasked);
      }
      return;
    }

    const blockOpening = inlineCodeMasked.match(/^\s{0,3}\$\$(.*)$/);
    if (blockOpening) {
      const column = inlineCodeMasked.indexOf("$$") + offset + 1;
      const remainder = blockOpening[1];
      const closing = remainder.indexOf("$$");
      if (closing >= 0 && !isEscaped(remainder, closing)) {
        validateFormula(
          remainder.slice(0, closing),
          lineNumber,
          column,
          true,
          diagnostics,
        );
      } else {
        block = { line: lineNumber, column, content: [remainder] };
      }
      return;
    }

    lintLinks(inlineCodeMasked, lineNumber, diagnostics, offset);
    const mathMasked = maskInlineMath(
      inlineCodeMasked,
      lineNumber,
      diagnostics,
      offset,
    );
    lintVisibleLine(mathMasked, lineNumber, diagnostics, offset);
  });

  if (block) {
    diagnostics.push(
      createDiagnostic(
        block.line,
        block.column,
        "error",
        "unclosed-block-formula",
        "块级公式缺少闭合的 $$",
        2,
      ),
    );
  }
}

export function lintMarkdown(source, options = {}) {
  const diagnostics = [];
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const isKnownLanguage = options.isKnownLanguage || (() => true);
  const fencedLines = collectFenceLines(lines, diagnostics, isKnownLanguage);

  lintMath(lines, fencedLines, diagnostics);
  lintMarkdownSyntax(lines, fencedLines, diagnostics);
  lintHeadingStructure(lines, fencedLines, diagnostics);
  lintTables(lines, fencedLines, diagnostics);

  return diagnostics
    .filter(
      (diagnostic, index, all) =>
        all.findIndex(
          (item) =>
            item.line === diagnostic.line &&
            item.column === diagnostic.column &&
            item.code === diagnostic.code,
        ) === index,
    )
    .sort(
      (left, right) =>
        left.line - right.line ||
        left.column - right.column ||
        (left.severity === "error" ? -1 : 1),
    );
}
