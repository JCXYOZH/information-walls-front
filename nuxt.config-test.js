const env = require('./env')
const path = require('path')

module.exports = {
  // 设置为静态生成模式
  target: 'static',

  // 静态生成配置
  generate: {
    fallback: '404.html' // 启用 SPA 回退路由（用于动态路由）
  },

  // 多环境配置
  env: {
    NUXT_ENV: env[process.env.NODE_ENV]
  },

  // 全局页面头部配置
  head: {
    title: '校园信息墙',
    htmlAttrs: { lang: 'zh-CN' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // 全局 CSS
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/assets/style/wooui.css'
  ],

  // 插件配置
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/icons',
    '@/plugins/method',
    '@/plugins/global-variable',
    { src: '@/plugins/vue-cropper', ssr: false }
  ],

  components: true,

  // 构建配置
  build: {
    extend(config, ctx) {
      // SVG 雪碧图配置
      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [path.resolve(__dirname, 'assets/icons/svg')]
      config.module.rules.push({
        test: /\.svg$/,
        include: [path.resolve(__dirname, 'assets/icons/svg')],
        loader: 'svg-sprite-loader',
        options: { symbolId: 'icon-[name]' }
      })
    }
  },

  // 服务器配置（本地开发用）
  server: {
    port: 8888
  }
}
