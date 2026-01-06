import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api/': {
      target: 'http://localhost:8889/',
      changeOrigin: true,
      ws: true, // 关键:启用 WebSocket 代理
    },
  },
});
