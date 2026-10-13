# Coffee Day

**今天，少喝一点也很好。**

一个帮助你慢慢减少咖啡的记录网页。按日期记录，回顾变化，再为自己设定一个小目标。

[查看源码](src/App.tsx) · [查看提交记录](https://github.com/summerYYang0622/coffee-day/commits/main/) · [开发过程与实际命令](docs/DEVELOPMENT.md)

## 可以做什么

| 页面 | 功能 |
| --- | --- |
| 今日 | 记录“没喝”或“喝了”，填写咖啡种类、杯数与备注 |
| 记录与趋势 | 按日期补记、修改，查看近四周杯数，翻页查看历史 |
| 减量计划 | 设置每周目标、少喝的原因和计划不喝的日子 |

- 中文 / English 一键切换。
- 奶油白与咖啡棕配色，使用 shadcn/ui 组件和 Lucide 图标。
- 首页咖啡图片分组进退，中央文字与按钮固定，支持暂停。
- 常见桌面窗口下三个页面一屏显示；手机首页也适配窗口高度。

## 在这台 Mac 上打开网页

打开“终端”，按顺序执行下面三步。

### 1. 进入项目目录

```bash
cd "/Users/clh/Documents/ChatGPT/coffee_day"
```

### 2. 安装依赖并生成网页

```bash
pnpm install
pnpm build
```

依赖可以理解为项目需要的工具；构建会把代码整理成浏览器可以运行的网页。

### 3. 启动预览

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

然后打开 **[http://127.0.0.1:4173/](http://127.0.0.1:4173/)**。

**浏览期间保持终端运行。** 按 `Ctrl+C` 或关闭终端后，预览服务会停止。

> 下次打开：进入项目目录后执行第 3 步即可。修改代码后，需要重新执行 `pnpm build`。

## 常见问题

**提示“127.0.0.1 拒绝连接”？**  
说明本地服务没有运行。回到终端，执行上面的启动预览命令。

**GitHub 上在哪里看代码？**  
打开 [coffee-day 的 main 分支](https://github.com/summerYYang0622/coffee-day/tree/main)，进入 `src` 文件夹。仓库是私有的，请登录 `summerYYang0622`。点击页面上方的 **Commits** 可以查看每次提交，也可以直接打开 [提交记录](https://github.com/summerYYang0622/coffee-day/commits/main/)。

**记录保存在哪里？**  
保存在当前浏览器中，刷新后仍在。不同浏览器、设备或网址之间不会自动同步。页脚的“导出记录”可以下载 JSON 备份；目前没有导入界面。

**这是一个已经上线的网站吗？**  
目前源码已提交 GitHub，网页在本机运行。`127.0.0.1` 只指向你自己的电脑，不能作为公开访问地址分享。

## 想改代码，从哪里开始

| 想修改的内容 | 对应文件 |
| --- | --- |
| 页面文字、按钮行为、中英文 | [src/App.tsx](src/App.tsx) |
| 颜色、布局、图片动画 | [src/App.css](src/App.css) |
| 日期计算、记录读取、每周统计 | [src/lib/data.ts](src/lib/data.ts) |
| shadcn/ui 基础组件 | [src/components/ui](src/components/ui) |
| 图片素材 | [public/images](public/images) |

修改时可以执行 `pnpm dev`，打开终端显示的网址；保存代码后页面会自动更新。

## 开发与检查

项目使用 React、TypeScript、Vite、shadcn/ui 和 Lucide。建议使用 **Node.js 24 与 pnpm 11**，与本项目的自动检查环境一致。

```bash
pnpm test    # 检查日期和统计逻辑
pnpm build   # 检查代码并构建网页
```

更多内容：[开发过程与实际命令](docs/DEVELOPMENT.md) · [图片来源与生成提示词](ASSETS.md)
