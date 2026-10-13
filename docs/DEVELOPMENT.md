# Coffee Day：开发过程与命令

[返回项目首页](../README.md)

## 先理解这几个工具

| 工具 | 在这个项目里做什么 |
| --- | --- |
| React | 把页面、按钮和记录状态组合起来 |
| TypeScript | 帮助发现代码中的类型错误 |
| Vite | 启动开发预览、生成正式网页 |
| pnpm | 安装依赖、运行项目命令 |
| shadcn/ui | 提供可以直接修改的按钮、弹窗和输入框 |
| Lucide | 提供统一的线性图标 |
| Git / GitHub | 保存代码版本和远端提交记录 |

## 开发顺序

1. **确认设计。** 根据参考视频和确认后的设计稿，确定配色、三个页面以及图片进退方式。
2. **创建项目。** 使用 React + TypeScript 模板，接入 shadcn/ui 和 Lucide。
3. **完成页面。** 今日、记录与趋势、减量计划分别对应 `#today`、`#journal`、`#plan`。
4. **实现动画。** 三组咖啡图片约每 6 秒切换，一轮 18 秒；组内图片错开 90 毫秒。文字和按钮不参与移动。
5. **保存记录。** 用本地日期作为记录的标识，通过 `localStorage` 保存在浏览器里。未记录与没喝分开统计。
6. **检查功能。** 验证日期、统计、打卡、补记、语言切换、导出、刷新保存，以及桌面和手机布局。
7. **提交 GitHub。** 使用已授权的 GitHub 连接器上传源码，创建提交并更新 `main` 分支。

## 实际执行过的主要命令

下面是开发时的命令记录，**不是日常启动步骤**。日常使用请看 [README](../README.md)。

### 创建模板

```bash
pnpm create vite@latest /tmp/coffee-day-starter --template react-ts
```

当时生成器把模板放到了项目内的临时子目录，随后将模板文件移入项目根目录。

### 安装依赖与界面组件

```bash
pnpm install
pnpm add @tailwindcss/vite tailwindcss lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-slot @radix-ui/react-dialog
pnpm add -D @types/node
pnpm dlx shadcn@latest add button dialog input textarea --yes
```

shadcn CLI 还添加了自身需要的 `radix-ui` 和 `cn`。完整版本记录见 `pnpm-lock.yaml`。

### 整理代码、检查和预览

```bash
pnpm dlx prettier --write src vite.config.ts tests components.json index.html package.json
pnpm test
pnpm build
pnpm preview --host 127.0.0.1 --port 4173
```

| 命令 | 作用 |
| --- | --- |
| `prettier --write` | 整理缩进与代码格式 |
| `pnpm test` | 运行日期和统计测试 |
| `pnpm build` | 检查 TypeScript，生成 `dist/` 网页文件 |
| `pnpm preview` | 在本机查看构建后的网页 |

### 手机触屏检查

实际运行时复用了本机已有的 Playwright：

```bash
PLAYWRIGHT_MODULE=/Users/clh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node tests/browser-webkit.mjs
```

这个绝对路径只适用于开发时的机器。脚本位于 [tests/browser-webkit.mjs](../tests/browser-webkit.mjs)，使用 WebKit 模拟 iPhone 触屏操作。测试在独立浏览器环境内运行，不使用你的日常记录。

## GitHub 提交是怎样完成的

项目保存在 [summerYYang0622/coffee-day](https://github.com/summerYYang0622/coffee-day) 的 `main` 分支。

本机尚未配置 GitHub 命令行登录，因此远端提交使用已授权的 GitHub 连接器完成：上传文件 → 组织文件树 → 创建提交 → 更新分支。这里没有执行命令行 `git push`。

可以在 [提交记录](https://github.com/summerYYang0622/coffee-day/commits/main/) 中查看完整历史。

## 数据规则

- 每天一条记录，包含一种咖啡、杯数和备注；再次保存同一天会更新它。
- 可以恢复成“未记录”，不能记录未来日期。
- 统计区分杯数和天数；当前周会注明尚未结束。
- 计划日不会发送通知，目标是自己设定的个人偏好。
- 记录没有云端同步；清除网站数据可能丢失记录，请按需导出备份。

## 参考资料

- [shadcn/ui 的 Vite 安装文档](https://ui.shadcn.com/docs/installation/vite)
- [本项目的图片来源与生成提示词](../ASSETS.md)
