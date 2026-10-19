# Windows 构建与仿真验收 · 2026-10-19

- 环境：Windows 11 x64，Node 24.19.0，便携 Temurin 17.0.20.1+1，Gradle Wrapper 8.7，GWT 2.8.2，gwt-gradle-plugin 1.1.19。
- 官方源码基线：`5a707168778216bb6ed01bfdd62e8bbf7ae0a032`；先尝试未修改构建。五种 permutation 全部编译成功（106.986 秒）；makeSite 的最终 `ls` 在 Windows 报进程启动失败。
- 仅替换这处输出目录检查后，`gradlew compileGwt makeSite --offline --console plain --no-daemon` 成功（24 秒，复用已编译产物）。实际运行 `Build.cmd -Offline` 也成功（33 秒），官方资源与自定义工作区均生成。
- JDK 下载校验通过；Wrapper 增加 Gradle 官方 SHA-256。没有更改 GWT、Java 源码级别、插件或核心元件。
- 默认 8088 本机服务已启动；8080 已有服务未被终止。`Start.cmd -NoBrowser` 能识别已有本项目服务；桌面快捷方式已建立。
- Windows Edge 155.0.4283.62 真实浏览器验证：官方原版加载、ctz 自定义案例加载、时间推进、画布绘制新增电阻、原生编辑窗口将电阻改为 2.2 kΩ、原生另存为 XML 下载并重新导入，均通过。
- 可复现：服务运行时设置 `PLAYWRIGHT_MODULE` 为已有 Playwright 模块，运行 `node scripts/browser-smoke.mjs`。结果、截图及实际导出电路在忽略的 `.qa/`。
- 知识库九个案例共 25 个正常/故障状态的原生时步采样已通过；详细数值、安全与数据保护验收见相邻知识库的 `docs/circuitjs-validation.md`。
- 范围：Windows Edge、手机尺寸和实际局域网 IP；未实际操作物理手机，未进行硬件对照或完整 SMPS 稳定性验证。不把通用仿真当作指定设备维修测量标准。
- 第四阶段研究：已检查 MOS 模型、光耦 CTR Scale 和内置 ~TL431 子电路，目前无需改求解器/核心模型。高频/温度/雪崩/反馈稳定性另立验证目标。
