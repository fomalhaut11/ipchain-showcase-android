import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 展示版 App 的前端构建配置
 *
 * - `base: './'`：产物用相对路径引用资源。Capacitor 把 dist 打进 APK 后页面从
 *   本地文件加载，绝对路径会 404。
 * - 不引入 wagmi / viem / 任何钱包或链上依赖：这是上架合规的硬要求，
 *   相关代码不能出现在包里（见 _work_2026-09-16-showcase-app/LEDGER.md）。
 * - 唯一的运行时网络请求是直连 PANews RSS（该源返回 access-control-allow-origin: *，
 *   无需我们自己的服务器代理，也就不暴露与主站域名的关联）。
 */
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
