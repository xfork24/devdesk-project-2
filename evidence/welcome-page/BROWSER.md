# 浏览器独立验证

此材料由本轮独立验证代理产生，只记录原生浏览器执行，不是平台 tests.run 回执或 Human 决定。页面与 tests/ 均只读；未执行 Git。

## 冻结对象

候选输入版本 `d458803d9372062eafd58245c773efd2cdaa8e95`，入口 `file:///work/index.html`，SHA256 `b0b2c0c4b1a8e791699c1a8b8084c2f62e57dcc0290722e54cfac194c319039a`。测试输入版本 `e7509c985a7437cba36c023f82e44721197bbca1`，独立测试 SHA256 `4424f91b1c220d4a0ffd70d2cf454f28ac21157718fe468699643e54de6443bf`。复验脚本启动前核对两项摘要，结束后复核页面摘要；版本身份来自冻结输入，未自行用 Git 认证。

当前返工来源：`execution-input:a69bde8c-7822-d300-d126-f1e55e3967c7:workspace`；上轮正式拒绝报告 `bb2f7264-9cdb-6d15-8375-9539f658cf9e`。外层环境绑定镜像 `sha256:cfdd13360965d846cf746bf829782d65247e5cb8e986c71271124f908e09673d`、session `274a2fcb-08e5-e5a8-d24f-39eab78db179` 仅证明外层选择；实际下载的浏览器、系统库和字体另行列出。

## 方法和证据

`browser-check.cjs` 使用真实 headless Chromium 执行 file:// 打开、刷新、关闭标签页后重开、新离线上下文打开、改窄屏、离线刷新重开、恢复桌面尺寸。离线由 Playwright context.offline 控制，同时记录 navigator.onLine。每阶段保存完整截图、标题、正文、内外盒尺寸、文字范围、五点顶层命中、computed style、document/body 横向尺寸和资源项。请求日志覆盖所有阶段。关闭重开以标签页为单位，另建离线上下文不共享前一上下文登录或缓存。

原始结果见 `browser-observations.json`；系统包身份和摘要见 `browser-dependencies.json`；截图按01至08阶段命名。成功结果及此前环境/探测失败分别保留。

## 准备与复验

本次在 `/work/.browser-validation` 临时安装 Playwright，下载 Chromium，将 Debian bookworm 的共享库和字体包以 download-only 方式下载、解包至 sysroot，通过 LD_LIBRARY_PATH、FONTCONFIG_FILE 使用。`browser-dependencies.json` 记录实际52个包的版本和SHA；未将它们添加为欢迎页运行依赖。字体匹配实际输出为 DejaVu Sans 及 WenQuanYi Zen Hei（中文）。初次安装触及只读 /tmp，随后显式设 TMPDIR 至临时目录；首次 apt 索引同样因 /tmp 失败，指定 TMPDIR 后索引成功并使用签名检查，未放宽签名要求。

在具备 Playwright 和 Chromium 系统依赖、中文字体的环境，可用 `PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright BROWSER_EXECUTABLE=/absolute/path/to/chrome node evidence/welcome-page/browser-check.cjs` 复验。受限环境还需设置可写 TMPDIR；采用临时解包依赖时按原始结果中的 environment/fontConfig 配置。该命令会覆盖本目录原始JSON和截图，应先保留旧证据。脚本不启动服务，不读取登录凭据。

## 结果与限制

实际完成时间：2026-11-19 02:59:43.645–02:59:45.151 UTC。Debian GNU/Linux 12、Linux aarch64，Node v24.13.0；Playwright 1.65.1，Chromium 159.0.8154.6，headless 模式。浏览器可执行文件 SHA256 `3818624ec1ee6760b7b0bf852d9b8ca5e70e089e55feb4c74f7591aadb1a05db`；正文三字均由 WenQuanYi Zen Hei 渲染。

| 验收 | 实际结果 |
| --- | --- |
| AC-01 | 初次打开及各阶段标题均为“欢迎”，main/h1可见正文为“欢迎！”；文字框在视口及标题框内，五点命中标题；截图可读。 |
| AC-02 | 桌面刷新、关闭标签页重开，以及离线窄屏刷新、重开均显示相同内容；无凭据或历史准备，离线上下文重新创建。 |
| AC-03 | 离线打开、窄屏和恢复桌面均通过。1280×800时document/body的scrollWidth与clientWidth均1280；320×640时均320。离线阶段navigator.onLine均false。只观测到6次file://主文档请求，无外部资源请求或页面错误。 |

8阶段全部通过，实际innerWidth/innerHeight分别为1280×800和320×640。代理通过 view_image 查看04-offline-desktop.png和05-offline-narrow.png：中文清晰居中、卡片完整，无裁切或遮挡。这是代理视觉观察，另有JSON中的几何及顶层命中测量；不是Human验收。候选页面执行前后SHA相同。

实际命令：`TMPDIR=/work/.browser-validation/tmp PLAYWRIGHT_MODULE=/work/.browser-validation/node_modules/playwright BROWSER_EXECUTABLE=/work/.browser-validation/browsers/chromium-1255/chrome-linux-arm64/chrome LD_LIBRARY_PATH=/work/.browser-validation/sysroot/usr/lib/aarch64-linux-gnu:/work/.browser-validation/sysroot/lib/aarch64-linux-gnu FONTCONFIG_FILE=/work/.browser-validation/fonts.conf node /work/evidence/welcome-page/browser-check.cjs`，cwd=/work。启动chunk `38e891`、完成chunk `23d3be`，exit_code=0，正常终止、未超时未取消。stdout为JSON摘要：status=passed，browserVersion=159.0.8154.6，candidateSha256为上述冻结页面SHA，8个phase均passed；无stderr输出。完整测量原件见browser-observations.json。底层原生commandExecution由平台留存，chunk身份不是tests.run操作编号。

此前失败均保留：首次启动缺sysroot/lib中的dbus库（chunk `fa833d` exit=1，browser-launch-failure.json）；补库路径后字体探测未启用CSS agent（`6fc26f`→`e8058d` exit=1，browser-probe-failure.json）；启用agent后前4阶段通过，调整视口使online恢复true（`832ef7`→`47630b` exit=1，browser-offline-setup-failure.json）；同值重设offline无效（`fdc370`→`1a8d55` exit=1，browser-offline-reapply-failure.json）。最终脚本在改视口后显式切换离线并断言实际状态，通过完整流程。这些是验证环境/探测设置问题，未修改页面或独立测试。

Chromium完整版与ffmpeg下载成功；安装器随后额外下载headless shell，被主动取消（chunk `71d888` exit=130），此取消不影响已下载的完整版Chromium与实际检查，不报告整条安装命令通过。临时依赖目录已清理（chunk `9d90df` exit=0），未新增页面运行依赖。

headless Chromium 的 DOM/布局与截图检查不能代表所有浏览器、操作系统和真实物理断网；浏览器离线模式和请求日志是本次断网检查的边界。截图由代理视觉审查不等同于 Human 验收。
