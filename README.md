# 墨刻 Markdown

一个专注写作体验的纯前端 Markdown 编辑器，支持实时预览、LaTeX 公式、
代码高亮、行号、自动保存以及响应式布局。

无需后端服务，构建后可以直接部署到 GitHub Pages 或任意静态网站托管平台。

- 在线体验：<https://harleyzhouzzz.github.io/mdonline/>
- 源码仓库：<https://github.com/HarleyZHOUzzz/mdonline>

## 功能特性

### Markdown 编辑与预览

- 编辑内容时实时渲染 Markdown
- 提供“仅编辑”“分栏”“仅预览”三种视图
- 分栏模式下可以拖动中间分隔条调整宽度
- 编辑器与预览区双向同步滚动，任意一侧都会按阅读进度带动另一侧
- 编辑器带行号和竖向分隔线，行号跟随内容滚动
- 编辑区与预览区到达滚动边界后立即停止，不产生回弹

### Markdown 工具栏

工具栏提供以下常用操作：

- 粗体、斜体
- 链接、行内代码
- 无序列表、有序列表
- 引用
- LaTeX 公式
- 图片
- 复制 Markdown
- 下载 `.md` 文件

选中文字后再次点击粗体或斜体按钮，可以移除对应的 Markdown 标记。

### LaTeX 公式

项目使用 KaTeX 渲染数学公式。

行内公式：

```markdown
质能方程是 $E = mc^2$。
```

块级公式：

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$
```

### 代码高亮

在围栏代码块后标注语言，即可启用语法高亮：

````markdown
```ts
interface Note {
  title: string;
  updatedAt: Date;
}
```
````

当前内置以下语言：

| 类型       | 支持的标识                                                           |
| ---------- | -------------------------------------------------------------------- |
| Shell      | `bash`、`sh`、`shell`、`zsh`                                         |
| C/C++      | `c`、`cpp`                                                           |
| C#         | `csharp`、`cs`                                                       |
| Web        | `html`、`xml`、`svg`、`css`                                          |
| JavaScript | `javascript`、`js`、`jsx`                                            |
| TypeScript | `typescript`、`ts`、`tsx`                                            |
| 数据格式   | `json`、`yaml`、`yml`                                                |
| 其他       | `go`、`java`、`markdown`、`md`、`php`、`python`、`py`、`rust`、`sql` |

未标注语言或语言不受支持时，代码仍会以普通代码块安全显示。

### 自动保存与统计

- 编辑内容会自动保存到浏览器的 `localStorage`
- 主题和视图模式同样会在本地保存
- 页面底部显示光标行列、字符统计和预计阅读时间
- 新建文稿前会检查当前内容，避免误清空

> 数据只保存在当前浏览器和当前站点域名下。清理浏览器网站数据、更换浏览器或更换部署域名后，原内容不会自动同步。

### 界面与交互

- 浅色和深色主题
- 桌面端、平板和移动端响应式布局
- 自定义品牌 Logo 与纸张纹理背景
- 无后端、无账号系统，打开页面即可使用
- 禁止直接渲染 Markdown 中的原始 HTML，降低脚本注入风险

## 键盘快捷键

macOS 使用 `Command`，Windows 和 Linux 使用 `Ctrl`。

| 操作         | macOS         | Windows/Linux |
| ------------ | ------------- | ------------- |
| 粗体         | `Command + B` | `Ctrl + B`    |
| 斜体         | `Command + I` | `Ctrl + I`    |
| 插入链接     | `Command + K` | `Ctrl + K`    |
| 插入两个空格 | `Tab`         | `Tab`         |

## 技术栈

| 技术                                                      | 用途                           |
| --------------------------------------------------------- | ------------------------------ |
| [Vite](https://vite.dev/)                                 | 本地开发与生产构建             |
| [markdown-it](https://github.com/markdown-it/markdown-it) | Markdown 解析与渲染            |
| [KaTeX](https://katex.org/)                               | LaTeX 数学公式渲染             |
| [highlight.js](https://highlightjs.org/)                  | 围栏代码块语法高亮             |
| [Lucide](https://lucide.dev/)                             | 界面图标                       |
| 原生 JavaScript/CSS                                       | 编辑交互、主题、布局和本地存储 |

## 环境要求

推荐使用与 GitHub Actions 一致的环境：

- Node.js 24
- pnpm 11.24.0
- 支持 ES Modules、CSS `color-mix()` 和现代 Web API 的浏览器

检查当前版本：

```bash
node --version
pnpm --version
```

如果没有安装 pnpm，可以使用 Corepack：

```bash
corepack enable
corepack prepare pnpm@11.24.0 --activate
```

## 本地运行

### 1. 克隆仓库

使用 SSH：

```bash
git clone git@github.com:HarleyZHOUzzz/mdonline.git
cd mdonline
```

也可以使用 HTTPS：

```bash
git clone https://github.com/HarleyZHOUzzz/mdonline.git
cd mdonline
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

终端会显示本地地址，通常为：

```text
http://localhost:5173/
```

在浏览器中打开该地址即可使用。修改源码后，Vite 会自动刷新页面。

## 可用命令

| 命令                | 说明                         |
| ------------------- | ---------------------------- |
| `pnpm dev`          | 启动本地开发服务器           |
| `pnpm build`        | 构建生产版本到 `dist/`       |
| `pnpm preview`      | 在本地预览生产构建结果       |
| `pnpm format`       | 使用 Prettier 格式化项目文件 |
| `pnpm format:check` | 检查项目文件格式，不修改文件 |

## 生产构建

执行：

```bash
pnpm build
```

构建产物位于 `dist/`：

```text
dist/
├── assets/
├── index.html
└── ...
```

本地检查构建结果：

```bash
pnpm preview
```

`vite.config.js` 使用相对基础路径 `./`，因此项目可以部署在 GitHub Pages 的仓库子路径下。

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`。每次向 `main` 分支推送后，
GitHub Actions 会自动安装依赖、构建项目并发布 `dist/`。

### 首次部署

1. 在 GitHub 打开当前仓库。
2. 进入 **Settings → Pages**。
3. 在 **Build and deployment** 中将 **Source** 设置为 **GitHub Actions**。
4. 回到 **Actions** 页面，等待 `Deploy to GitHub Pages` 工作流完成。
5. 打开 GitHub Pages 提供的站点地址。

当前仓库的默认地址为：

```text
https://harleyzhouzzz.github.io/mdonline/
```

后续更新只需推送到 `main`：

```bash
git add .
git commit -m "feat: update markdown editor"
git push origin main
```

部署状态可以在以下页面查看：

```text
https://github.com/HarleyZHOUzzz/mdonline/actions
```

## SSH 推送说明

如果已经向 GitHub 添加 SSH 密钥，但推送时仍要求输入 GitHub 用户名和密码，通常是因为远程仓库仍使用 HTTPS 地址。

查看当前地址：

```bash
git remote -v
```

SSH 地址应该类似：

```text
git@github.com:HarleyZHOUzzz/mdonline.git
```

如果显示的是 `https://github.com/...`，切换为 SSH：

```bash
git remote set-url origin git@github.com:HarleyZHOUzzz/mdonline.git
```

测试 SSH 连接：

```bash
ssh -T git@github.com
```

首次连接时可能会询问是否信任 GitHub 主机，输入 `yes`。SSH 私钥设置了密码时，系统要求输入的是密钥密码，不是 GitHub 账号密码。

## 项目结构

```text
markdownonline/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages 自动部署
├── public/
│   └── assets/
│       ├── harley-logo.png  # 页面 Logo
│       └── paper-texture.jpg
├── index.html               # 页面结构
├── index.js                 # Markdown 渲染与编辑交互
├── style.css                # 主题、布局和响应式样式
├── package.json             # 依赖与项目命令
├── pnpm-lock.yaml           # pnpm 锁定文件
├── vite.config.js           # Vite 配置
└── README.md
```

## 工作原理

```text
用户输入 Markdown
        │
        ├── 保存到 localStorage
        ├── 更新行号、光标位置和字数
        └── markdown-it 解析
                │
                ├── markdown-it-katex 渲染公式
                ├── markdown-it-task-lists 渲染任务列表
                └── highlight.js 高亮代码块
                        │
                        └── 更新右侧实时预览
```

整个流程都在浏览器内完成，不会把 Markdown 文稿上传到服务器。

## 常见问题

### 修改代码后网页没有更新

先确认本地构建正常：

```bash
pnpm build
```

然后打开 GitHub 仓库的 **Actions** 页面，确认最新部署任务已成功完成。部署成功后可以强制刷新浏览器缓存。

### 刷新页面后内容还在吗

会。内容保存在当前浏览器的 `localStorage` 中。无痕模式、清理网站数据或更换浏览器可能导致内容丢失，重要文稿建议及时下载 `.md` 文件。

### 为什么代码块没有高亮

需要在三个反引号后写明语言：

````markdown
```python
print("Hello, Markdown!")
```
````

### GitHub Pages 页面空白或资源加载失败

确认以下事项：

- Pages 的 Source 已设置为 **GitHub Actions**
- `Deploy to GitHub Pages` 工作流执行成功
- `vite.config.js` 中的 `base` 保持为 `./`
- 访问地址包含仓库名 `/mdonline/`

## 隐私说明

- 文稿默认只保存在浏览器本地
- 项目没有账号、数据库和后端接口
- 外部图片会由浏览器直接请求对应图片服务器
- 复制功能只在用户点击后访问系统剪贴板

在公开或共享电脑上使用后，请根据需要下载文稿并清理站点数据。
