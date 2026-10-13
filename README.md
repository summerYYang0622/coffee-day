# Coffee Day · 今天，少喝一点也很好

一个帮助自己慢慢减少咖啡的中英文网页。采用第三版设计：奶油白、咖啡棕、留白和照片卡片。没有预填的虚假记录，也没有连续打卡惩罚。

## 三个页面

- **今日**：一键记下今天没喝，或填写咖啡种类、杯数和备注。
- **记录与趋势**：点击日期补记或修改，查看近四周的杯数；没喝、喝了、未记录是三种不同状态。
- **减量计划**：设置每周杯数目标、想少喝的原因、计划不喝的星期。

右上角切换中文/English。手机使用单列，大屏使用并排布局，最大内容宽度为 1760px。图标来自 Lucide，不使用 emoji。

## 初学者：怎么运行

需要 Node.js 22.12+（实际开发使用 24.19.0）和 pnpm。pnpm 是安装依赖、执行项目命令的工具，作用类似 npm。

在本项目目录运行：

```bash
pnpm install
pnpm dev
```

打开终端显示的本地网址。修改 `src/App.tsx` 后，开发预览会自动刷新。

正式构建与本地验收：

```bash
pnpm test
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
```

`build` 先让 TypeScript 检查代码，再把网页整理到 `dist/`。`preview` 用于查看这份正式构建产物。不要直接双击 `index.html`。

## 我是怎样一步步做的

1. 从你的视频提取关键帧，确认动效是**中央内容固定，四周图片分组移动和淡入淡出**，而不是普通图片横向滚动或整体旋转。
2. 使用 Vite 的 React + TypeScript 模板搭骨架，把三个页面做成 `#today`、`#journal`、`#plan`。这种地址在静态托管上刷新也容易正常工作。
3. 按 shadcn/ui 的官方方式安装 Button、Dialog、Input、Textarea，保留组件源代码，便于以后修改。导航和记录弹窗都能用键盘操作。
4. 用内置 ImageGen 生成统一风格的六种咖啡照片和计划页静物图。照片网格通过 CSS 背景位置显示不同咖啡，减少重复请求；JPG 是 PNG 原图的压缩传输版本。
5. 用 CSS 关键帧排列三组图片。每组约 6 秒，一个循环 18 秒；组内每张图片错开 90 毫秒，进场、停留、退场。中央标题和按钮不参与动画。暂停控制通过浏览器 Animation API 停住动画，系统开启“减少动态效果”时显示静态照片。
6. 按本地日历日期保存记录，避免把 UTC 日期误当成用户今天。`localStorage` 是浏览器给当前网站的小型本地储物柜；刷新后记录仍在。
7. 做日期逻辑单元测试，再用真实 Chromium 浏览器和 WebKit iPhone 触屏环境操作网页，验证记录、修改、刷新、语言、计划和导出。
8. 创建 GitHub 私有仓库，通过已授权的 GitHub 连接器上传文件并创建提交。没有把用户的浏览器记录、凭证或设计草稿传到仓库。

## 实际执行过的主要命令

初始化在临时子目录进行，然后将模板文件移入本项目；以下保留实际初始化命令，日常使用不需要再次执行。

```bash
pnpm create vite@latest /tmp/coffee-day-starter --template react-ts
pnpm install
pnpm add @tailwindcss/vite tailwindcss lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-dialog
pnpm add -D @types/node
pnpm dlx shadcn@latest add button dialog input textarea --yes
pnpm dlx prettier --write src vite.config.ts tests components.json index.html package.json
pnpm test
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
```

shadcn CLI 也添加了它需要的 `radix-ui` 和 `cn`。安装后的准确版本保存在 `pnpm-lock.yaml`；请把这个文件和代码一起保留。

触屏检查脚本是 `tests/browser-webkit.mjs`，实际运行时通过 `PLAYWRIGHT_MODULE` 指向机器已有的 Playwright。其他机器可安装 `playwright` 和 WebKit 后使用 `node tests/browser-webkit.mjs`。`APP_URL` 可以覆盖默认测试网址。

上传使用 GitHub 连接器的 `create_blob → create_tree → create_commit → update_ref`，不是假装执行成功的 `git push`。本机没有预先配置 GitHub 命令行凭证，因此使用已经授权的连接器完成同样的文件和版本提交。

## 文件地图

| 文件 | 初学者可以怎样理解 |
| --- | --- |
| `src/App.tsx` | 页面内容、按钮行为、语言和弹窗 |
| `src/App.css` | 颜色、排版、手机布局和动画 |
| `src/lib/data.ts` | 日期计算、每周统计和读取记录 |
| `src/components/ui/` | shadcn/ui 的可修改组件 |
| `public/images/` | 网站自己的本地图片 |
| `tests/data.test.ts` | 日期与统计的自动检查 |
| `tests/browser-webkit.mjs` | 手机触屏验收脚本 |
| `vite.config.ts` | 开发和构建配置 |

## 数据与当前范围

- 没有账号系统；记录只属于当前浏览器和当前网址，不自动跨设备同步。
- 更换域名/端口、浏览器，或清除网站数据，都会影响能看到的记录。页脚的“导出记录”可下载 JSON 备份；当前没有导入界面。
- 每个日期保存一条记录（一个咖啡种类、杯数、备注）。再次保存同一天会更新这条记录。可以恢复为“未记录”。
- 不允许未来日期；未记录的日子不会被统计为没喝。当前周会显示尚未结束，避免和完整周误比较。
- 目标是个人偏好，不是健康建议。计划日是记录在网页里的安排，没有通知推送。
- GitHub 仓库是代码保存处，不等于已经公开上线。`dist/` 可以部署到支持静态网页的托管平台。

## 图片来源与提示词

两张素材使用内置 ImageGen 生成，没有抓取第三方咖啡店图片。提示词保存在 `ASSETS.md`。

技术参考：[shadcn/ui Vite 安装](https://ui.shadcn.com/docs/installation/vite)。
