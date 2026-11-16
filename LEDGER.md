> 导出说明（2026-11-16）：这是历史台账的脱敏副本。当前安卓基线为 2026-10-26、com.xiaoqin.ipchain、1.0 / versionCode 2；前文旧包名和待办仅供追溯，构建请看 README.md。

# 展示版 App 台账（数字文化资产与 IP 行业资讯）

> 开工日期：2026-09-16
> 与 `_work_2026-09-15-android-app/`（带交易功能的 IPChain Exchange 壳）**完全独立**，两个 App 可同时安装。

## 〇、已定决策（2026-09-16，用户确认）

| 决策 | 结论 |
|---|---|
| 目的 | **为上架应用商店，必须彻底无金融属性**——钱包、代币、交易相关代码与文案一律不打进包 |
| 形态 | **独立极简前端 + 内容打包进 APK**（Vite + React + TS，不引入 wagmi/viem） |
| 身份 | 完全独立的新 App，**延用 IPChain 品牌**（占位包名 `art.ipchain.culture`，名称「IPChain 文化」） |
| 内容 | 行业资讯 + IP 项目图鉴 + 数字文化资产藏品 + 平台介绍 |
| 外链 | **不外链到主站或交易站点**；资讯按版权要求署名并回源 PANews（新闻源，非交易站） |
| 链上交互 | **App 内零链上调用**；项目数据是构建期导出的静态 JSON |
| 盲盒/藏品素材 | 暂用现有演出海报充当 |

## 一、合规边界（写死在代码注释里，改动前先读）

**禁止出现在包里**：金额、收益率、募集进度、份额价格、剩余份额、代币名称与价格、投资/募集/认购/兑换/交易等表述；钱包 SDK、链上读写、任何跳转到交易站点的链接。

**依据**（2026-09-16 查证）：
- Google Play 未取得博彩资质的应用，不得让用户付费获得随机区块链物品（loot box 明确禁止）→ 盲盒**只能做图鉴，不能有开箱与购买**。
- 仅做信息展示的应用，若内容关于加密投资平台，**仍可能被归类为金融服务**并要求牌照。
- Play Console 区块链内容**申报不实**（声明"无"但自动检测到加密功能）会直接拒审。
- ⚠ 以上不是法律意见；台账 `_work_2026-08-20-ios-app-readiness/` 记明上架合规由同事推进，三件事需其拍板：品牌与主站关联、盲盒展示尺度、Play Console 申报口径。

## 二、内容盘点（2026-09-16 实测，线上与本地素材完全一致）

| 内容 | 真实可用量 | 处理 |
|---|---|---|
| 行业资讯 | PANews RSS，中英双语，191KB/次，**返回 `access-control-allow-origin: *`** | **直连源站**，不经我们的服务器，App 不向 ipchain.art 发任何请求 |
| IP 项目 | 主网 7 个 | 排除 2 个名称含「产业基金」的、1 个 CANCELLED，**保留 4 个演唱会 IP** |
| 海报 | 5 张，原始 6644 KB（#3 单张 5.3MB / 4250×5667） | Pillow 压到 900px 宽、quality 82，**总计 812 KB** |
| 合作伙伴 | 仅 1 个，类别写着「产业基金」，banner/logo 均为空 | **本版不做**（素材空白且表述金融化） |
| 藏品 | 链上 `getProduct` 只有 name/price/stock/sold/metadataURI/active；`getSeries` 无图无描述 | 用 #3/#4/#5 三张海报做图鉴；**不用 #1/#2**（属「产业基金」项目） |

## 三、工程结构

```
_work_2026-09-16-showcase-app/
├── LEDGER.md          ← 本文件
└── web/               Vite + React + TS（无 wagmi/viem/钱包依赖）
    ├── src/App.tsx            四个页签：资讯 / 项目 / 藏品 / 关于
    ├── src/lib/news.ts        直连 PANews RSS + 版权边界（不取全文）
    ├── src/data/projects.json 构建期导出，已去除全部金融字段
    ├── src/data/collection.json
    └── public/posters/*.jpg   压缩后的海报
```

数据导出口径：由仓库根 `mainnet-projects-snapshot.csv` 转换，**保留** id/name/category/stage/createdAt/poster，**剔除** status/owner/proposer/totalShares/pricePerShare/soldShares/targetAmount/raisedAmount/expectedReturnRate/returnRatePercent/expectedReturnAmount/returnDeadline/approvedAt。项目状态改用中性措辞（ACTIVE→进行中，其余→筹备中）。

## 三点五、APK 核验（2026-09-16，debug 包）

产物：`apk/IPChain.apk`，4.58 MB（网页资源仅 557 KB，其余为 Capacitor/AndroidX 运行时）。

| 核验项 | 结果 |
|---|---|
| 包名 / 桌面显示名 | `art.ipchain.culture` / **IPChain**——与交易版 `art.ipchain.trade`（显示名 IPChain Exchange）不冲突，可同机并存 |
| 版本 | `versionName 0.1.0`（2026-09-16 由模板默认 1.0 改定）/ `versionCode 1`；与 `web/package.json`、壳 `package.json`、关于页显示的版本已全线一致 |
| 最低/目标 SDK | 24 / 36 |
| **是否远程加载** | ❌ 内嵌配置**无 `server` 段**，页面从 `assets/public/` 本地加载 |
| 申请权限 | 仅 `INTERNET`（+ Capacitor 标准的 `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`）。无定位、无存储、无相机 |
| 打包资源 | `index.html` + 1 个 JS + 1 个 CSS + **3 张海报**（3/4/5），无多余文件 |
| 钱包/链上字符串 | 解包扫描 `wagmi / walletconnect / ethereum / web3 / metamask` **全部 0 次** |

## 三点六、正式签名与 Release 产物（2026-09-16）

**签名方案**：用户自行用 keytool 生成上传密钥，密码不经对话传递（最终因 PowerShell 写文件失败，凭据文件由 Claude 用用户给出的内容创建）。

| 项 | 值 |
|---|---|
> **2026-09-21 包名变更（两次）**：
> 1. 先按"公司名应为 XIAOXIN"改为 `com.xiaoxin.ipchain` 并重新生成 keystore —— **此版已作废**。
> 2. 用户随后确认：Play 控制台锁定的软件包名称是 **`com.xiaoqin.ipchain`**，且要求沿用最初的 XIAOQIN 密钥。
>    Play 只校验证书的**公钥指纹**，不校验证书里的组织名文本，因此证书写 XIAOQIN 不影响上架。
>
> **现行值如下。**

| 项 | 值 |
|---|---|
| **包名（applicationId）** | **`com.xiaoxin.ipchain`**（2026-09-21 最终确认）。历史作废包名：`art.ipchain.culture`、`com.xiaoqin.ipchain`。⚠ 该值曾在 xiaoqin/xiaoxin 间反复三次，**上传 Play 前务必到控制台复制粘贴核对**——上传后永久锁定 |
| 包名与证书的关系 | **无关**。证书主体写 `O=XIAOQIN…` 而包名是 `com.xiaoxin…`，不影响上架：Play 只校验证书**公钥指纹**，不读证书里的组织名文本 |
| keystore | `C:\Users\ZhangXi\keys\ipchain-release.jks`（**仓库外**，2666 字节，最初 09-16 生成的那把） |
| 凭据文件 | `android/keystore.properties`（已被 `.gitignore` 挡住，**绝不可提交**） |
| 证书主体 | `CN=IPChain, O=XIAOQIN INNOVATIONS PTE. LTD., C=SG` |
| 算法 / 有效期 | 2048 位 RSA，SHA384withRSA，2026-09-16 至 2054-02-01 |
| SHA-256 指纹 | `5fc425b76b37b65421624f1497c55ca934f9ef8ead8b62c89a40a0ee9875324b` |
| 别名 | `ipchain` |
| 签名密码 | 已从导出记录移除；仅在本机管理。 |
| 未使用的密钥 | `C:\Users\ZhangXi\keys\ipchain-release-xiaoxin-未使用.jks`（XIAOXIN 主体，09-21 生成后未采用，可删） |

**产物**（`apk/`，2026-09-21 重建）：

| 文件 | 大小 | 用途 |
|---|---|---|
| `IPChain-0.1.0.aab` | 3,472,699 B | **上传 Google Play**（Play 只接受 AAB，传 APK 会直接报上传错误） |
| `IPChain-0.1.0.apk` | 3,619,442 B | 正式签名包，模拟器截图/装机测试用（AAB 无法安装到设备） |

**核验结果**（2026-09-21 最终版）：包名 `com.xiaoxin.ipchain`；`versionName 0.1.0` / versionCode 1；显示名 IPChain；**debuggable 标志数 0**；APK 与 AAB 证书 SHA-256 **完全一致**（`5fc425b7…`，与 09-16 首次构建同一把密钥）；签名方案 v2 通过（v1/v3 为 false —— minSdk 24 下 v1 非必需，Play 接受 v2+）。

⚠ **旧包已装过的设备必须先卸载**：包名与签名均已变更，直接覆盖安装会失败。

**两个踩过的坑**：
1. `Set-Content -Encoding utf8` 在 Windows PowerShell 5.1 下写 **带 BOM** 的 UTF-8，Java `Properties.load()` 按 ISO-8859-1 读字节会让 BOM 黏在第一个 key 上，导致 `storeFile` 读不出来。凭据文件必须**无 BOM**。
2. `signingConfigs` 里若用 `if (f.exists())` 保护而无守卫，缺凭据时 release 构建会**静默产出未签名包**。已加 `RELEASE_SIGNING_GUARD`（`app/build.gradle` 末尾）：release 任务缺 `keystore.properties` 直接 `GradleException` 失败，已实测验证。

## 三点七、App 图标与启动图（2026-09-21）

**来源**：仓库根 `POPCOIN-彩色版.pdf` 第 3 页的 IPChain logo（粉紫青渐变 iP 币形符号）。该 PDF 内**无嵌入位图，logo 是矢量绘制**，故用 PyMuPDF 以 12 倍分辨率渲染后裁切，符号提取尺寸 1983×1983。

**素材**（`assets/`，由 `npm run assets` 消费）：

| 文件 | 规格 | 说明 |
|---|---|---|
| `icon.png` | 1024²，符号占 78% | 常规图标 |
| `icon-foreground.png` | 1024²，符号占 60%，**底色铺满整张画布** | 自适应图标前景。系统裁掉边缘约 25%，缩到 60% 保证任何遮罩下圆环完整 |
| `icon-background.png` | 1024²，纯色 `#050510` | 背景层 |
| `splash.png` / `splash-dark.png` | 2732²，符号占 28% | 启动图 |

**生成**：`@capacitor/assets` 3.0.5，一次产出 136 个文件（含深色模式）。已固化进 `package.json`：
- `npm run assets` —— 重新生成全套图标
- `npm run rebuild` —— 构建前端 + 同步 + 生成图标

⚠ **必须固化的原因**：`capacitor-assets` 写入 `android/`，而每次改包名都要 `rm -rf android` 重建（已重建五次），手动放的图标每次都会被删光。

**踩过的坑（修了三次才对）**：圆形遮罩下图标出现可见的方形接缝。
1. 先归因为符号自带纯黑 `#000000` 与背景 `#050510` 的 5 色阶差 → 统一近黑像素 → **无效**
2. 扫描像素诊断：边缘已是 `(5,5,16)`、灰色描边仅占 0.2% → **推翻色差假设**
3. 真因：前景层是 613×613 方块放在 1024 透明画布上，**方块边缘抗锯齿在合成时产生接缝** → 前景层底色铺满整张画布 → 解决

教训：看到视觉问题先扫描像素定位，不要凭观感直接归因。

## 三点八、资讯板块改为快照模式（2026-09-21）

用户决定**去掉回源外链**，新闻卡片不可点击，仅展示缩略图 + 标题 + PANews 署名 + 相对时间。文案改为"资讯摘要来自 PANews，版权归原作者所有。本应用仅作信息展示，不提供跳转。"

⚠ **两点必须记录的风险**：
1. **版权**：`lib/news.ts` 既定边界是"只展示标题摘要缩略图，**必须署名来源并外链回源站**"。去外链后仅保留署名，版权上弱于可回源。
2. **这并未解决核心问题**：实测当前 RSS 100 条中 **69% 含加密/金融关键词**，首屏显示的是「BTC 突破 83000 美元」「币安现已将 bStocks 杠杆抵押品资格扩展至所有用户」「Abraxas Capital 永续合约仓位浮亏超 1 亿美元」。审核员看的是 **App 内的内容**，不是链接能否点击。**根本解法是更换为文娱/演出行业资讯源**，待用户决定。

## 三点九、1.0 版（versionCode 2）：定位改为「展示应用」（2026-10-12）

依据仓库根 `entertainment-client-changes.md`。**本节取代上文关于版本号、「资讯」命名和三点八「去掉回源外链」的描述。**

| 改动 | 结果 |
|---|---|
| 版本 | `versionName 1.0` / `versionCode 2`；`package.json` 两处为 `1.0.0`；关于页显示 `Version 1.0` |
| 顶栏名 / 网页标题 | 「IPChain 文化」→ **IPChain**（桌面名 `app_name` 本来就是 IPChain，未动） |
| 第 1 个 Tab / 页标题 | 资讯 → **动态**（News → Updates）；行业资讯 → **行业动态**（Industry Updates） |
| 关于页 | 中英文全部换成修改单文案；新增独立的「联系我们」区块（邮箱 `mailto:`、官网可点击）+ 隐私政策链接 |
| **动态卡片恢复回源链接** | 关于页文案写明「标明来源、提供原文链接」，与三点八的快照模式矛盾，用户 2026-10-12 决定恢复：卡片为 `<a href>`，由 Capacitor 交系统浏览器打开；链接仍经 `lib/news.ts` 的 PANews 域名校验 |
| 包名 | **仍为 `com.xiaoxin.ipchain`**。修改单写的是 `art.ipchain.culture`（已作废的旧包名），用户 2026-10-12 确认沿用现值 |

**产物**（`apk/`）：`IPChain-1.0.aab` 4,523,675 B（上传 Play）、`IPChain-1.0.apk` 4,739,718 B（装机测试）。0.1.0 两个文件保留未动。

**核验**：包名 `com.xiaoxin.ipchain`、versionCode 2、versionName 1.0、显示名 IPChain；权限仅 `INTERNET`；debuggable 0；APK 与 AAB 证书 SHA-256 均为 `5fc425b7…`（与 0.1.0 同一把密钥）；包内网页资源中「资讯 / 新闻 / IPChain 文化 / 0.1.0 / 不提供跳转」均 0 次，钱包类字符串 0 次。

**未验证**：① 未装机，卡片回源、邮箱、官网、隐私政策四类链接的点击行为没有在真机/模拟器上点过；② `https://www.ipchain.art/privacy/` 从本机访问 TLS 握手失败（本机访问该域名本就不稳定），页面是否存在未确认。

**构建环境坑**：本机环境变量 `GRADLE_USER_HOME=D:\gradle-cache`、`JAVA_HOME=D:\Java\jdk-17\` 指向不存在的 D 盘，构建时必须覆盖为 `GRADLE_USER_HOME=C:/Users/ZhangXi/.gradle`、`JAVA_HOME=/c/Users/ZhangXi/.jdks/jdk-21.0.12.1+1`、`ANDROID_HOME=C:/Users/ZhangXi/AppData/Local/Android/Sdk`。

## 三点十、包名更正为 com.xiaoqin.ipchain（2026-10-26）

中介反馈 1.0 包因包名不符无法上架。查 09-21 会话记录：中介原话要求 applicationId 改为 **`com.xiaoqin.ipchain`**（Play 控制台锁定值），之后用户一句「确定是 com.xiaoxin.ipchain」应为笔误，此后各版都打成了 xiaoxin。用户 2026-10-26 确认以 **`com.xiaoqin.ipchain`** 为准。**本节取代上文所有关于包名的描述。**

- 就地改 6 处：`capacitor.config.json` appId、`build.gradle` namespace + applicationId、`strings.xml` package_name + custom_url_scheme、`MainActivity.java` 包声明与目录（`java/com/xiaoqin/ipchain/`）。未重建 `android/`，签名/守卫/图标/版本保留。
- 产物：`apk/IPChain-1.0.aab` 4,523,683 B、`apk/IPChain-1.0.apk` 4,739,718 B。旧 xiaoxin 版改名为 `apk/作废-xiaoxin-IPChain-1.0.*`，**不要上传**。
- 核验：包名 `com.xiaoqin.ipchain`（APK 与 AAB 清单均是）、versionCode 2 / versionName 1.0、显示名 IPChain、权限仅 INTERNET、无 debuggable；APK 与 AAB 证书 SHA-256 均为 `5fc425b7…`；APK 内 `xiaoxin` 出现 0 次。

## 三点十一、后续 iOS 工程

该节属于 2026-10-27 的独立 iOS 工作，未纳入本 Android 源码仓库。

## 四、待办

| # | 事项 | 状态 |
|---|---|---|
| A1 | 前端骨架 + 四个页签 | 🟢 已完成 | `npm run build` 通过，34 模块，JS 151 KB（gzip 50 KB），**dist 共 557 KB** |
| A2 | Capacitor 壳（新包名、图标、启动图） | 🟡 APK 已出，图标未做 | 见下方「APK 核验」；图标与启动图仍是 Capacitor 默认 |
| A8 | 发布前必做：关闭 WebView 调试 | 🔴 未做 | `capacitor.config.json` 里 `webContentsDebuggingEnabled` 现为 `true`，**release 包必须改 false 重打** |
| A3 | 构建产物全文扫描，确认无钱包/金融字符串 | 🟢 已通过 | `wagmi / walletconnect / viem / ethereum / web3 / metamask / privateKey` **全部 0 次**；金融中文词仅 2 处且均在免责声明内（"不提供任何投资建议"、"不提供任何购买、兑换或转让功能"） |
| A7 | 移除 #1/#2 海报 | 🟢 已完成 | 这两张属名称含「产业基金」的项目，曾被误打进包（占 422 KB），已删除并重新构建 |
| A4 | 藏品正式素材（图 + 名称 + 文化向描述） | 🔴 待用户提供 |
| A5 | App 图标与名称最终确认 | 🔴 占位中 |
| A6 | 合规同事确认三项（品牌关联 / 盲盒尺度 / Play Console 申报） | 🔴 待办 |
