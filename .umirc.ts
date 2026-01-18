import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Notebook',
  },

  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      routes: [
        {
          path: '',
          component: './Home',
        },
        {
          name: 'Notebook',
          path: 'notebook',
          component: './Notebook',
          hideInMenu: true, // 关键：隐藏侧边栏菜单项
        },
      ],
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
