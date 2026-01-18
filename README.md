# jupyter-react

这是一个基于 **UmiJS（@umijs/max）+ React** 的前端 Notebook 系统 Demo，用于在浏览器中加载、渲染与编辑 `.ipynb` 文件，并提供简单的 Notebook 文件管理能力。

## 目标

在前端项目中实现类似 Jupyter Notebook 的阅读/编辑体验：

- **文件列表**：扫描 `public/data` 目录，展示所有 Notebook 文件。
- **打开 Notebook**：点击列表条目跳转到 Notebook 页面，并通过 URL 参数加载对应文件。
- **新建 Notebook**：通过弹框创建新的 `.ipynb` 文件并自动刷新列表。

## 路由

- `/home`
  - Notebook 文件列表页
- `/home/notebook?file=xxx.ipynb`
  - Notebook 编辑页，读取 `file` 参数并从 `/data/${file}` 加载

## 本地数据机制（public/data 扫描）

浏览器环境无法直接读取目录，因此项目采用以下方式生成文件清单：

- 启动/构建前执行脚本 `scripts/generate-data-manifest.mjs`
- 扫描 `public/data` 目录并生成 `public/data/manifest.json`
- 列表页通过 `fetch('/data/manifest.json')` 获取文件列表

相关脚本已挂到：

- `pnpm dev` 前的 `predev`
- `pnpm build` 前的 `prebuild`

## 新建 Notebook（本地 mock）

新建功能使用 Umi 的 `mock` 能力实现本地写文件（开发环境使用）：

- `POST /local-api/notebooks`：在 `public/data` 下创建新 `.ipynb` 文件，并更新 `manifest.json`

创建成功后：

- 自动刷新文件列表
- 自动跳转到新建 Notebook 页面

## 开发启动

```bash
pnpm dev
```

## 说明

- Notebook 的“保存”目前是浏览器侧下载文件（前端无法直接写入服务器文件系统）。
- 若需要在生产环境实现真正的保存/新建/重命名/删除，请接入后端 API 或对接 Jupyter Server。
