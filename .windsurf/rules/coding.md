---
trigger: always_on
---

# 编码规范

- 我的项目编程语言是 Typescript
- 我的项目使用 React 框架
- 我的项目使用 UmiJS 框架
- 我的项目使用 Ant Design UI 组件库
- 我的项目使用 less 作为 CSS 预处理器
- less 使用 BEM 命名规范
- 我的项目使用 css-modules
- 创建公共方法、函数时，必须创建文档
- 创建 UI 页面时，要求模块化，拆分组件，每个组件单独放在一个文件夹中，包含 tsx 文件、less 文件，文件使用 `index` 命名，例如 `components/CellToolBar/index.tsx`、`components/CellToolBar/index.less`
- 自定义 Modal、Drawer 等弹出层时，必须创建单独的组件，例如 `components/CreateModal/index.tsx`
- 当需要安装依赖时，使用 pnpm 直接安装
