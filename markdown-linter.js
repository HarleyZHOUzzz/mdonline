import katex from "katex";

function createDiagnostic(line, column, severity, code, message) {
  return { line, column, severity, code, message };
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

  return { content, quoteDepth };
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

function maskInlineCode(line, lineNumber, diagnostics) {
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
          cursor + 1,
          "warning",
          "unclosed-inline-code",
          "行内代码缺少闭合反引号",
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
  if (!expression.trim()) {
    diagnostics.push(
      createDiagnostic(
        line,
        column,
        "warning",
        "empty-formula",
        "公式内容为空",
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
      ),
    );
  }
}

function maskInlineMath(line, lineNumber, diagnostics) {
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
            cursor + 1,
            "warning",
            "unclosed-inline-formula",
            "行内公式缺少闭合的 $",
          ),
        );
      }
      break;
    }

    validateFormula(
      line.slice(cursor + 1, closing),
      lineNumber,
      cursor + 1,
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

function lintLinks(line, lineNumber, diagnostics) {
  const linkPattern = /(!?)\[([^\]]*)\]\(/g;
  let match = linkPattern.exec(line);

  while (match) {
    const destinationStart = match.index + match[0].length;
    const closing = findClosingParenthesis(line, destinationStart);
    if (closing < 0) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          match.index + 1,
          "error",
          "unclosed-link",
          `${match[1] ? "图片" : "链接"}缺少闭合的 )`,
        ),
      );
      break;
    }

    const destination = line.slice(destinationStart, closing).trim();
    if (!destination) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          destinationStart + 1,
          "warning",
          "empty-destination",
          `${match[1] ? "图片" : "链接"}地址为空`,
        ),
      );
    }
    if (match[1] && !match[2].trim()) {
      diagnostics.push(
        createDiagnostic(
          lineNumber,
          match.index + 1,
          "warning",
          "empty-image-alt",
          "图片缺少替代文字",
        ),
      );
    }

    linkPattern.lastIndex = closing + 1;
    match = linkPattern.exec(line);
  }
}

function lintVisibleLine(line, lineNumber, diagnostics) {
  if (/^ {0,3}#{1,6}[^#\s]/.test(line)) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        line.indexOf("#") + 1,
        "warning",
        "heading-space",
        "标题标记后应添加空格",
      ),
    );
  }

  const htmlTag = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*|\/?)>/.exec(line);
  if (htmlTag) {
    diagnostics.push(
      createDiagnostic(
        lineNumber,
        htmlTag.index + 1,
        "warning",
        "raw-html-disabled",
        "当前编辑器未启用原始 HTML",
      ),
    );
  }
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

    const { content } = stripContainerPrefix(line);
    const inlineCodeMasked = maskInlineCode(content, lineNumber, diagnostics);

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
      const column = inlineCodeMasked.indexOf("$$") + 1;
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

    lintLinks(inlineCodeMasked, lineNumber, diagnostics);
    const mathMasked = maskInlineMath(
      inlineCodeMasked,
      lineNumber,
      diagnostics,
    );
    lintVisibleLine(mathMasked, lineNumber, diagnostics);
  });

  if (block) {
    diagnostics.push(
      createDiagnostic(
        block.line,
        block.column,
        "error",
        "unclosed-block-formula",
        "块级公式缺少闭合的 $$",
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
