# IPChain Android 展示版

本仓库保存 **2026-10-26 打包的 IPChain 1.0 展示版**对应源码：行业动态、IP 项目、藏品图鉴和关于页面，中英双语。页面随 APK 打包，通过 Capacitor 在本地 WebView 加载。

| 发布项 | 值 |
| --- | --- |
| 应用名称 | IPChain |
| applicationId / namespace | `com.xiaoqin.ipchain` |
| versionName / versionCode | `1.0` / `2` |
| 最低 / 目标 Android SDK | 24 / 36 |
| 前端 | Vite + React 18 + TypeScript |
| 原生壳 | Capacitor 8.5.2 |
| Android Gradle Plugin / Gradle | 8.13.0 / 8.14.3 |

## 源码对应关系

源码提取自原项目 `_work_2026-09-16-showcase-app/`，保持目录映射：

| 目录或文件 | 用途 |
| --- | --- |
| `web/src/App.tsx`、`web/src/styles.css` | 四个页签、双语文案、布局和样式 |
| `web/src/lib/news.ts` | PANews RSS 获取、摘要和来源链接处理 |
| `web/src/data/` | 项目和藏品的静态数据 |
| `web/public/posters/` | 包内海报 |
| `web/package*.json`、`web/vite.config.ts`、`web/tsconfig.json` | 前端依赖、锁文件和构建配置 |
| `android/app/src/main/` | Android 入口、Manifest、图标和启动图资源 |
| `android/*.gradle`、`android/app/*.gradle`、`android/gradle/` | SDK、版本、签名配置和 Gradle Wrapper |
| `capacitor.config.json`、根 `package*.json` | Capacitor 配置、命令和依赖 |
| `assets/` | 生成图标和启动图的源素材 |
| `store-assets/` | 应用商店图标及横幅 |
| `release/baseline.json` | 原 APK/AAB 大小、SHA-256、原始源码哈希和包内网页哈希 |

应用运行源码、Android 工程和图像素材保持原样。独立导出时移除了 2026-10-27 新增的 iOS 专用脚本及依赖，并将网页锁文件的项目版本元数据对齐为 `1.0.0`，没有升级依赖。后续 iOS 工程、主站 Next.js 工程、交易版 App、智能合约均不属于此次 Android 打包源码。

## 安装与网页预览

准备 Node.js 22+、npm、JDK 21，以及含 Android SDK Platform 36 的 Android SDK。Gradle 使用仓库自带 Wrapper。首次构建需要访问 npm、Google Maven、Maven Central 和 Gradle 下载服务。

在仓库根目录执行：

```powershell
npm ci
npm --prefix web ci
npm --prefix web run dev
```

两份 `package-lock.json` 都需保留。根目录安装 Capacitor 工具链，`web/` 单独安装网页依赖。

## Android 构建

在终端设置本机实际路径，不要沿用历史台账中的失效 D 盘路径：

```powershell
$env:JAVA_HOME = 'C:/path/to/jdk-21'
$env:ANDROID_HOME = 'C:/path/to/Android/Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USER_HOME = Join-Path $env:USERPROFILE '.gradle'
npm run sync
node scripts/verify-baseline.mjs
```

`npm run sync` 会构建网页并执行 `cap sync android`，生成被 Git 忽略的包内网页、Capacitor 配置和 Cordova 占位工程。不要用 `cap add android` 覆盖已有原生工程。图标和启动图已纳入源码；仅在修改源素材后运行 `npm run assets`。

开发测试包无需发布密钥：

```powershell
cd android
.\gradlew.bat assembleDebug --no-daemon
```

输出为 `android/app/build/outputs/apk/debug/app-debug.apk`。

正式签名需使用原应用的上传密钥。在本机把 `android/keystore.properties.example` 复制成 `android/keystore.properties`，填入密钥绝对路径、别名和密码；文件应使用无 BOM 编码，路径使用 `/`。密钥及实际凭据文件不在本仓库中。

```powershell
cd android
.\gradlew.bat bundleRelease assembleRelease --no-daemon
```

输出分别为：

- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

macOS/Linux 使用同样环境变量和 npm 命令，将 `gradlew.bat` 换成 `./gradlew`。工程保留了发布签名守卫：缺少 `keystore.properties` 时，Release 构建会明确失败。

## 发布基线与核验

2026-11-16 导出验证已通过：两级 `npm ci`、TypeScript/Vite 构建、Capacitor 同步和 Android `assembleDebug`（93 个任务，2 分 24 秒）。新生成测试 APK 的包名、版本、SDK 与记录一致，其 6 个网页资源也与原正式 APK 完全一致。本次未重新生成正式签名包，也未做设备上的交互测试。

历史产物为 `IPChain-1.0.apk`（4,739,718 字节）与 `IPChain-1.0.aab`（4,523,683 字节）。完整哈希见 [release/baseline.json](release/baseline.json)。本仓库提交源码和追溯信息；历史安装包不放入 Git 历史。

`node scripts/verify-baseline.mjs` 用于核验本次导出的基线：它检查包名、版本、WebView 配置，以及构建后的全部 6 个网页文件是否与原 APK 内资源逐字节一致。未来修改页面后，这项基线比对预期会失败；应在新版本发布时另建发布记录，保留旧基线。

包内资源一致不等于完整 APK/AAB 可逐字节复现；签名、工具链和压缩元数据会影响完整文件哈希。

[LEDGER.md](LEDGER.md) 和 [CHANGES-1.0.md](CHANGES-1.0.md) 保留历史过程，已去除台账中的签名口令。旧段落里的 `com.xiaoxin.ipchain` 已作废，以本 README 和 2026-10-26 记录为准。
