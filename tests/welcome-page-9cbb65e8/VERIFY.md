# 欢迎页独立验证

## 冻结范围与来源

本步骤为 Task `9cbb65e8-2b6c-a760-387c-1a71da43cd86` / `welcome-page` 准备独立测试；Feature `9b8f1073-9cf9-273f-53f3-cef0389876d5`。仅写本目录，不实现页面，不执行 Git。

本轮冻结输入前缀为 `execution-input:7a3b4170-bfb5-b99f-27be-7cefb7d3cca5:`：

| 输入 | value_digest | 使用位置 |
| --- | --- | --- |
| task | fd8a48c32651fe57dac751fdbafd0caace78eaa2196e9874cd06304d62133f3b | /acceptance、/instructions、/scope |
| design | 708ce2e141724ae98bb50a460dfb285ed27086e3afd310089a062ea62cf84956 | 接口与数据、状态与不变量、验证与演进 |
| test_configuration | 5117df93fa2e5758f8e83e2960d90701c37d9ef4dce4798e48e8b582732b3aa8 | /independent_runner=node_test、/regression=null |
| workspace | efd50bdb8433b1130fc32994f2d60eeb4724e3f7347e91f1972b5398ee105d07 | /revision、/workspace_id、/owner_id |

实际 Task 工作区 workspace_id 与 owner_id 均为 Task ID；设计中的 Feature 工作区标识属于上游上下文，不替换当前冻结 workspace。workspace 来源产物 `00057f2c-5d80-36e5-4140-a262c7dd00fe`，代码源版本 `f1eaa0d11add3772c9c31ba25beb2a98b1677a12`。遵循 `simplified-spec-tests:1` 与 `simplified-skill-test-design:1`。

运行环境冻结镜像 `sha256:cfdd13360965d846cf746bf829782d65247e5cb8e986c71271124f908e09673d`，session `9106503a-b475-b2a3-5b0f-bc2a0638faef`；镜像绑定本身不是执行证据。

## 静态测试与失败分类

执行：`node --test tests/welcome-page-9cbb65e8/welcome.test.mjs`，无需安装依赖，超时 30 秒。WP-01/02 映射 AC-01；WP-03 映射 AC-02；WP-04 映射 AC-03。根目录 index.html 缺失是明确的交付入口断言失败；Node 不可用、测试语法或依赖加载错误、文件权限错误均属于环境或加载错误，不算有效 Red。正文、元数据、禁止的脚本或外部资源等断言失败属于业务失败。已通过的用例必须按实际结果报告，不制造 Red。

检查静态 HTML 约定及常见资源声明，不是完整 HTML/CSS 解释器，不能证明布局或隐藏规则下的可见性；编码错误不作为有效行为 Red。无可调用业务模块，interfaces 为空。源 Red 与候选 Green 必须由平台以同一测试版本和冻结配方运行，分别绑定确切代码版本；本文件不代表平台回执。regression=null，未配置原因由平台记录。

## 浏览器复验清单（待候选交付后执行）

为每次复验记录候选代码版本、测试版本、浏览器名称/版本、系统、实际视口尺寸、时间、逐项结果和截图/观察引用；失败、未执行、未知分别标记，不将静态 Green 代作视觉通过。

1. AC-01：现代浏览器以 file:// 直接打开该版本 index.html，记录实际路径；标签页显示“欢迎”，正文立即清晰显示“欢迎！”，无须安装或服务器。
2. AC-02：刷新一次，然后关闭标签页并从文件重新打开；每次记录欢迎内容是否正常展示、是否无需登录或访问历史。可用新的浏览器会话复验。
3. AC-03：启用浏览器离线模式，保持 file:// 可访问并重新打开页面；记录正文、样式是否完整，开发者工具是否出现外部资源请求。
4. AC-03：在离线状态分别设桌面视口 1280×800 与窄屏视口 320×640（CSS 像素），记录实际 innerWidth/innerHeight；检查文字可读、无裁切或遮挡。确认 document.documentElement.scrollWidth <= document.documentElement.clientWidth，body 同样无横向溢出，并保留截图；调整窗口时再检查一次。

初始观察：根目录没有 index.html；Node v24.13.0；PATH 未找到 chromium、chromium-browser、google-chrome、firefox。浏览器复验未执行；不能据此声明整个环境绝无浏览器，候选显示效果仍未知。

## 本次原生命令观察

在 /work 执行上述 node --test 命令，原生返回 chunk_id `e19065`：exit_code=1，tests=4、pass=0、fail=4、cancelled=0、skipped=0、todo=0，报告 duration_ms=40.761875。四项均以 AssertionError / ERR_ASSERTION 失败，消息为 `AC-01: root index.html must be delivered`，属于交付入口缺失断言；测试模块加载成功。元数据、正文、状态和资源的后续断言尚未到达，不能推断这些行为分别存在缺陷。

该观察发生于冻结源工作区及本次新增测试文件上，测试版本待平台封存；未自行读取 Git 来另行认证版本。原生 commandExecution 由平台保存，本记录只引用其返回身份与实际结果，不是 tests.run 回执。源/候选平台回执、候选 Green 与浏览器结果均尚未产生。
