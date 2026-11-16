> 历史记录：当前包名和产物信息以 README.md 与 release/baseline.json 为准。

# IPChain 客户端 1.0 改动说明

> **2026-10-26 更正**：包名已改为 **`com.xiaoqin.ipchain`** 并重新打包（同一密钥、版本仍为 1.0 / versionCode 2）。下文中的 `com.xiaoxin.ipchain` 均已作废；旧包已改名为 `apk/作废-xiaoxin-IPChain-1.0.*`。

日期：2026-10-12　依据：仓库根 `entertainment-client-changes.md`

## 版本

| 项 | 旧 | 新 |
|---|---|---|
| versionName | 0.1.0 | **1.0** |
| versionCode | 1 | **2** |
| 包名 | `com.xiaoxin.ipchain` | 不变 |
| 签名密钥 | SHA-256 `5fc425b7…` | 不变 |

> 修改单写的包名是 `art.ipchain.culture`，那是已作废的旧包名；本版按确认沿用 `com.xiaoxin.ipchain`。

## 界面改动

| 位置 | 旧 | 新 |
|---|---|---|
| 顶栏名 / 网页标题 | IPChain 文化 | IPChain |
| 底部第 1 个 Tab | 资讯 / News | 动态 / Updates |
| 该页大标题 | 行业资讯 / Industry News | 行业动态 / Industry Updates |
| 关于页正文 | 资讯类应用的介绍 | 修改单给定的展示应用文案（中英文） |
| 关于页「联系我们」 | 无 | 新增独立区块：邮箱 `support@ipchain.art`、官网 `https://www.ipchain.art`，均可点击 |
| 关于页隐私政策 | 无 | 新增链接 `https://www.ipchain.art/privacy/` |
| 关于页版本 | 版本 0.1.0 | Version 1.0 |
| 动态卡片 | 不可点击 | **可点击，在系统浏览器打开 PANews 原文** |
| 动态列表底部提示 | 「…不提供跳转」 | 「…点击条目可查看原文」 |

桌面名原本就是 IPChain，未改。项目页、藏品页及其免责声明未改。动态仍来自 PANews，每条仍显示来源。

恢复卡片原文链接的原因：新的关于页文案写明「标明来源、提供原文链接」，与此前「不提供跳转」矛盾，按确认恢复。

## 改动文件

- `web/src/App.tsx`：Tab 名、标题、顶栏名、关于页、卡片链接
- `web/src/styles.css`：卡片链接样式、联系区块样式
- `web/index.html`：标题
- `android/app/build.gradle`：versionCode、versionName
- `package.json`、`web/package.json`：版本号与描述
- `LEDGER.md`：新增「三点九」记录

## 产物

`apk/` 目录：

| 文件 | 大小 | 用途 |
|---|---|---|
| `IPChain-1.0.aab` | 4,523,675 B | 上传 Google Play |
| `IPChain-1.0.apk` | 4,739,718 B | 装机测试（先卸载旧版） |

## 已核验

- 包名、versionCode 2、versionName 1.0、显示名 IPChain
- AAB 与 APK 证书一致，与 0.1.0 同一把密钥
- 权限仅 `INTERNET`，不可调试
- 包内文本「资讯 / 新闻 / IPChain 文化 / 0.1.0」均 0 处

## 未核验（上传前请确认）

1. 未装机：卡片跳原文、邮箱、官网、隐私政策四类链接没有实际点过。
2. `https://www.ipchain.art/privacy/` 从打包机访问失败，页面是否存在未确认。
3. Play 控制台锁定的包名需为 `com.xiaoxin.ipchain`，否则 AAB 会被拒收。

## 重新打包

本机环境变量指向不存在的 D 盘，需先覆盖：

```bash
export JAVA_HOME="/c/Users/ZhangXi/.jdks/jdk-21.0.12.1+1"
export ANDROID_HOME="C:/Users/ZhangXi/AppData/Local/Android/Sdk"
export GRADLE_USER_HOME="C:/Users/ZhangXi/.gradle"
npm run sync
cd android && ./gradlew bundleRelease assembleRelease --no-daemon
```
