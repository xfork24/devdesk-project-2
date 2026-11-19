# 欢迎页实现及返工范围

Task `9cbb65e8-2b6c-a760-387c-1a71da43cd86`，Feature `9b8f1073-9cf9-273f-53f3-cef0389876d5`。本轮仅补实际浏览器观察，保留 `index.html` 和只读 `tests/`；不执行 Git、不代签 Human。浏览器观察由独立验证子代理执行，属于原生命令观察，不是平台测试回执。

## 冻结输入

本轮来源前缀 `execution-input:a69bde8c-7822-d300-d126-f1e55e3967c7:`，下表 key 连接该前缀即 evidence_source_ref；摘要均为平台提供的 value_digest。

| key | value_digest | 使用范围 |
| --- | --- | --- |
| task | fd8a48c32651fe57dac751fdbafd0caace78eaa2196e9874cd06304d62133f3b | /id、/feature_id、/scope、/acceptance |
| design | 708ce2e141724ae98bb50a460dfb285ed27086e3afd310089a062ea62cf84956 | 接口与数据、状态与不变量、验证与演进 |
| recipe | 576e37f625d59c777f862aeb2a2a97d4294ed54fab722c6a3690cd171c77610f | /cases、/recipe |
| red | ef389ad6e6879309aeb71391164d3c41f7b864b0c6fa2a44cc6c91624f4034e6 | /operation_id、/candidate、/execution、/counts |
| test_configuration | 5117df93fa2e5758f8e83e2960d90701c37d9ef4dce4798e48e8b582732b3aa8 | /independent_runner、/regression |
| workspace | f03618af3186987cfd74d9f93f2f2a0e995c8424a00c594233b8e10a2ab878e5 | /revision、/workspace_id、/owner_id、/changes |

当前 Task 工作区 workspace_id、owner_id 均为 Task ID；上游设计中的 Feature 工作区标识不替换本次冻结输入。平台提供候选版本 `d458803d9372062eafd58245c773efd2cdaa8e95`，来源产物 `345655d2-f91c-c9e5-7e5b-7c4941c4df31`。源基线 `f1eaa0d11add3772c9c31ba25beb2a98b1677a12`；独立测试快照 `e7509c985a7437cba36c023f82e44721197bbca1`。

本轮核读 `index.html` 与输入候选正文一致，SHA256 `b0b2c0c4b1a8e791699c1a8b8084c2f62e57dcc0290722e54cfac194c319039a`；测试文件 SHA256 `4424f91b1c220d4a0ffd70d2cf454f28ac21157718fe468699643e54de6443bf` 与 Red 快照一致。新增证据的最终仓库版本由平台固定，以上不是自行认证的 Git 状态。

## 实现及静态验证

候选已交付 HTML5、zh-CN、UTF-8、viewport、标题“欢迎”及 `main > h1` 的“欢迎！”。内嵌 CSS 和系统字体提供居中卡片及适应窗口的布局，无脚本、登录、存储、外部资源或构建依赖。本轮无业务代码改动。

输入 Red 为真实平台 `tests.run` 回执，产物 `eb729130-e74e-37dd-15f5-c6aabd633231`，operation `fc5806ce-0505-b83a-fdf8-b0d45cf89af0`，candidate 为独立测试快照：4 项均因根目录入口缺失触发业务断言，exit=1、expected_failure=true；status=succeeded 表示期望 Red 阶段完成，不是测试通过。

本轮在 `/work` 用 Node v24.13.0 原生执行 `node --test tests/welcome-page-9cbb65e8/welcome.test.mjs`，观察 chunk `91b9bf`：exit=0，4 tests、4 pass、0 fail、0 cancelled/skipped/todo，duration_ms=46.147667。测试范围依次为 WP-01 元数据、WP-02 标题正文、WP-03 无交互状态依赖、WP-04 内嵌资源。完整 commandExecution 由平台保存于本轮原生命令观察；本结果不是候选平台 Green 或项目回归回执。

环境绑定：runtime session `274a2fcb-08e5-e5a8-d24f-39eab78db179`，镜像 `sha256:cfdd13360965d846cf746bf829782d65247e5cb8e986c71271124f908e09673d`。原生环境观察 chunk `6a1c08`：Debian 12、Linux aarch64。镜像身份为冻结绑定，不由 Node 版本推断。

独立验证者实际使用 headless Chromium `159.0.8154.6` / Playwright `1.65.1`，于 `2026-11-19T02:59:43.645Z` 至 `02:59:45.151Z` 执行八阶段复验，exit=0，全部通过。1280×800 与 320×640 的实际视口内均显示标题“欢迎”、正文“欢迎！”，document/body 的 scrollWidth 均等于 clientWidth（分别1280、320），文字范围在视口和标题盒内、五点顶层命中均通过。离线阶段 navigator.onLine=false，无外部资源请求、无页面错误。主代理另以 view_image 核看 `04-offline-desktop.png` 和 `05-offline-narrow.png`，确认中文清晰、卡片完整、无遮挡。本次覆盖 AC-01 至 AC-03 的浏览器复验，边界是 Chromium headless 与浏览器离线模式，不代表全部浏览器或物理断网。

浏览器原始数据、截图、实际命令和复验方式见本目录 `BROWSER.md`、`browser-observations.json`、`browser-check.cjs`；环境与探测失败的观察单独保留，不能计为页面业务失败或最终通过。浏览器验证与静态测试分别报告；`regression=null`，未配置原因、最终候选 Green 和合并回归由平台后续记录。本说明遵循 `simplified-spec-implementation:1`、`simplified-skill-implementation:1`；不产生额外评审或 Human 决定。
