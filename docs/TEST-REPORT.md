# Coffee Day 测试报告

本次执行的逻辑测试、构建、桌面浏览器与手机模拟检查均通过。结果仅覆盖下列明确列出的场景。

## 测试版本与环境

| 项目 | 本次环境 |
| --- | --- |
| 测试日期 | 2026-10-13，Asia/Shanghai；Chromium 完成于 12:54 |
| 被测代码 | [7a9204c](https://github.com/summerYYang0622/coffee-day/commit/7a9204c16c60ffa67a72722755a18dafaaafb2ca)，本次仅新增测试文档与日志 |
| 运行系统 | macOS |
| Node.js / pnpm | 24.19.0 / 11.25.0 |
| 页面来源 | 本地生产构建，http://127.0.0.1:4173/ |
| 桌面环境 | Playwright，Chromium 155.0.8059.40 |
| 手机环境 | Playwright，WebKit + iPhone 13 设备模拟（非真机） |
| 测试数据 | 独立浏览器上下文中的临时记录，未修改日常浏览器记录 |

## 1. 逻辑测试与构建

| 测试 | 预期 | 实际结果 |
| --- | --- | --- |
| 日期逻辑 | 本地日期解析、闰日、非法日期及跨年周一计算正确 | 通过 |
| 记录与统计逻辑 | 缺少记录不等于没有喝；杯数与天数分别统计 | 通过 |
| TypeScript + Vite | 类型检查通过，生成 dist 产物 | 通过 |

逻辑测试共 **2 项，2 项通过、0 项失败、0 项跳过**。[测试源码](../tests/data.test.ts) · [原始日志](test-results/unit.txt) · [构建日志](test-results/build.txt)

## 2. Chromium 桌面浏览器

| 编号 | 操作与断言 | 结果 |
| --- | --- | --- |
| C01 | 等待自动轮换，检查第一、第二组图片在对应时刻可见 | 通过，两次 opacity 均为 1 |
| C02 | 对比轮换前后中心文案的位置与尺寸 | 通过，边界框一致 |
| C03 | 点击暂停，检查图片区域的所有动画状态 | 通过，均为 paused |
| C04 | 点击第三个场景，检查第三组图片出现 | 通过 |
| C05 | 点击“今天没喝”，刷新页面 | 通过，仍可修改今日记录 |
| C06 | 将记录修改为喝了 2 杯 | 通过，状态显示“今天已记录：2 杯美式” |
| C07 | 切换 EN | 通过，页面 lang 为 en |
| C08 | 将计划目标设为 3 杯，保存并刷新 | 通过，输入框仍为 3 |
| C09 | 检查下表中全部桌面尺寸与页面 | 通过，12 种组合无溢出 |
| C10 | 模拟系统减少动态效果偏好 | 通过，图片区域没有运行的动画 |
| C11 | 收集本次操作中的 JavaScript pageerror | 通过，0 条 |
| C12 | 收集本次操作中的 HTTP 400 及以上响应 | 通过，0 条 |

共 **12 组检查通过**。C09 包含下列 12 种布局组合，不额外累计为 12 组功能测试。

| 视口（像素） | 今日 | 记录与趋势 | 减量计划 |
| --- | --- | --- | --- |
| 1280 × 650 | 无溢出 | 无溢出 | 无溢出 |
| 1366 × 768 | 无溢出 | 无溢出 | 无溢出 |
| 1440 × 900 | 无溢出 | 无溢出 | 无溢出 |
| 1920 × 1080 | 无溢出 | 无溢出 | 无溢出 |

“无溢出”的判断是页面 scrollHeight 不大于视口高度、scrollWidth 不大于视口宽度。本轮布局检查使用切换后的英文界面与少量测试记录，不表示任意数据量下均已验证。

[逐项结果与观测值](test-results/chromium.json)。这些检查由 Playwright 工具在真实 Chromium 引擎中执行；并非 pnpm test 的一部分。

## 3. WebKit 手机模拟

[现有测试脚本](../tests/browser-webkit.mjs) 本次执行通过，覆盖以下 10 类检查：

| 检查 | 实际验证范围 | 结果 |
| --- | --- | --- |
| 触屏打卡 | tap 点击“今天没喝” | 通过 |
| 修改杯数 | 修改为 2 杯，页面状态包含 2 | 通过 |
| 刷新保存 | 刷新后可继续编辑今日记录 | 通过 |
| 记录页 | 可进入记录页，无横向溢出 | 通过 |
| 计划保存 | 目标 3 杯、选择周二，刷新后仍保留 | 通过 |
| 语言切换 | 切换英文，页面 lang 为 en | 通过 |
| 导出 | 触发下载，文件名符合 coffee-day-*.json | 通过 |
| 非法输入 | 输入 0 杯，保存后对话框仍在，未按正常保存关闭 | 通过 |
| 三页布局 | 首页、记录页、计划页可访问；记录与计划页断言无横向溢出，并保存三页截图 | 通过 |
| 运行异常 | 整个流程无 pageerror | 通过 |

脚本输出的 10 个标签是检查类别，不代表 10 个独立测试文件。导出检查验证了下载事件与文件名，**未逐字段核对 JSON 内容**。手机记录与计划页允许纵向滚动。

[WebKit 原始结果](test-results/webkit.txt)

## 4. 页面截图

以下为 README 制作时保存的页面截图，使用演示数据，帮助对照界面；本轮通过与否以测试日志及断言为依据。

![今日页面](images/screen-today.jpg)

| 记录与趋势 | 减量计划 |
| --- | --- |
| ![记录页面](images/screen-journal.jpg) | ![计划页面](images/screen-plan.jpg) |

[查看手机截图](images/screen-mobile.jpg) · [查看确认的 UI 原型](images/prototype-v3.jpg)

## 5. 本次实际执行的命令

在项目目录执行以下命令，分别保存逻辑测试和构建输出：

```bash
cd "/Users/clh/Documents/ChatGPT/coffee_day"
mkdir -p docs/test-results
pnpm test > docs/test-results/unit.txt 2>&1
pnpm build > docs/test-results/build.txt 2>&1
```

浏览器测试前需要运行预览服务。本次使用已经运行的 4173 服务；如果服务未启动，在另一个终端执行：

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

本机使用已有 Playwright 运行环境执行手机检查，实际命令为：

```bash
PLAYWRIGHT_MODULE=/Users/clh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node tests/browser-webkit.mjs > docs/test-results/webkit.txt 2>&1
```

该路径属于这台电脑，其他电脑不能直接照抄。脚本需要可用的 Playwright 包与 WebKit 浏览器；仓库的常规 pnpm install 并未安装它们。Chromium 检查通过 Playwright 工具执行，没有对应的已执行 shell 命令。

对初学者来说：pnpm test 检查日期和统计计算；pnpm build 检查代码能否生成网页；浏览器检查会实际点击按钮、刷新页面和调整窗口。三者检查的内容不同。

## 6. 未覆盖的范围

- 未进行真机 iPhone、Android 或 Firefox 检查，也没有完整无障碍审计、性能压测或安全审计。
- 未逐项穷举所有日历操作、长文本、大量历史记录及损坏的浏览器存储数据。
- 本轮只验证本地预览；没有线上部署验收，也没有跨设备同步测试（项目本身使用本地存储）。
- 动画验证了轮换、暂停、手动切换和减少动态效果，未做与参考视频逐帧一致性比较。
- GitHub Actions 配置执行逻辑测试和构建，不包含以上浏览器验收。本报告不把本地结果等同于某次 CI 运行结果。

[返回 README](../README.md)
