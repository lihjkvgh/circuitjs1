# CircuitJS1 Windows 维修实验环境

本机已编译上游 `pfalstad/circuitjs1@5a707168778216bb6ed01bfdd62e8bbf7ae0a032`。
官方源码保留在 `official-baseline` 分支；Windows 增量修改在 `feature/windows-repair-lab`，仿真核心没有修改。

## 使用

1. 双击 `Start.cmd`，打开 http://127.0.0.1:8088 。保留启动窗口，Ctrl+C 停止。8080 已被其他程序使用，因此使用 8088；可用环境变量 `CIRCUITJS_PORT` 调整。
2. 首页分别进入官方原版、自定义工作区和维修案例。首次部署后 `.deployment/official` 保留原始编译资源，后续启动仅刷新 custom；Git 分支也保留官方源码。
3. 自定义工作区添加 UTF-8/手机 viewport，去除上游绝对 manifest 和 service worker 注册；仍使用完全相同的 GWT 仿真代码。无 CDN、插件或外部服务依赖。
4. 元件双击编辑，右键添加元件/查看示波器，文件菜单导入/导出 XML 电路。修改源码后先运行 `Build.cmd` 再刷新浏览器。
5. 本服务只监听 127.0.0.1，手机通过知识库的登录入口和同源 iframe 使用仿真，沿用原有局域网访问控制。未修改防火墙或路由器。

## 构建

已安装便携 Eclipse Temurin JDK **17.0.20.1+1**，位于 `%LOCALAPPDATA%\CircuitJS-Tools`，不更改系统 JAVA_HOME。`scripts/setup-tools.ps1` 检查固定 ZIP 的 SHA-256 后安装；启动/构建进程内设置 JAVA_HOME。

```powershell
.\Build.cmd          # 初次需要网络；官方 compileGwt makeSite
.\Build.cmd -Offline # 缓存齐全后的离线构建
.\Start.cmd
```

Gradle Wrapper **8.7**，GWT **2.8.2**，插件 **1.1.19**，源码级别 Java 8，均保持上游版本。Wrapper 添加官方发行包 SHA-256；不升级到 Gradle 9（构建已有废弃 API 提示）。

官方构建实际尝试后：GWT 五种 permutation 编译成功；makeSite 最后的 Linux `ls` 在 Windows 失败。仅将这一目录检查换为 Gradle/Java 文件存在性检查后构建成功。没有为了构建升级 GWT 或修改元件模型。

Windows 系统代理不会自动被 Java 使用。构建脚本只在需要联网时读取系统已配置代理，并临时传递给 Java；不存凭据，不修改全局代理。离线模式不需要代理。首次构建/重新下载依赖需要网络；本地网页和已缓存构建可离线使用。无需 Docker、WSL2 或 Eclipse。

## 与知识库连接

知识库独立分支 `feature/circuitjs-repair-lab`。其 `simulation/runtime.zip` 是本项目真实编译产物，具有逐文件 SHA-256 清单；`runtime-source.zip` 分发相应源码和许可证。重新编译后，在知识库目录执行：

```powershell
node scripts/package-circuitjs.mjs "D:\self system\circuitjs1"
node scripts/build.mjs
node --test tests/*.test.mjs
```

本地案例目录读取相邻知识库的 `simulation/cases.json`，只读取可提交案例，不访问 `data/`、`.local/` 或 `backups/`。知识库不在相邻目录时仍可运行独立仿真器；案例学习界面由知识库维护。

## 适用范围和验证

真实 GWT 引擎验证及九个维修案例/故障比较见知识库 `docs/circuitjs-validation.md`。已测试 Windows Edge、手机尺寸和实际局域网 IP；未声称完成物理手机、真实板卡或所有器件模型验收。

后续核心研究独立提交：目前原生 MOSFET 支持阈值、β、部分电容参数；光耦已经支持 CTR Scale；TL431 已有内置子电路。首版无需修改核心。高频栅电荷/米勒平台、雪崩、温漂、光耦带宽以及反馈稳定性须另设器件模型和参考数据验证。
