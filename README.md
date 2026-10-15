# 墨刻 Markdown

一个支持实时预览、LaTeX 公式和本地自动保存的纯前端 Markdown 编辑器。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

构建产物位于 `dist/`，可以部署到任意静态站点服务。

## GitHub Pages

仓库已包含 GitHub Actions 工作流。推送到 `main` 后，在仓库的
**Settings → Pages → Build and deployment** 中将 Source 设为
**GitHub Actions**，之后每次推送都会自动构建并部署。

## 功能

- Markdown 实时渲染与语法高亮
- KaTeX 行内公式与块级公式
- 编辑、分栏、预览三种视图
- 可拖动分栏和同步滚动
- 自动保存、字数与阅读时间统计
- Markdown 复制与下载
- 浅色/深色主题与移动端适配
