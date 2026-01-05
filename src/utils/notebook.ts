import { INotebookContent } from '@jupyterlab/nbformat';

/**
 * 读取 notebook 文件
 */
export async function loadNotebook(path: string): Promise<INotebookContent> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load notebook: ${response.statusText}`);
  }
  const data = await response.json();
  return data as INotebookContent;
}

/**
 * 保存 notebook 文件
 */
export async function saveNotebook(path: string, notebook: INotebookContent): Promise<void> {
  // 注意：在浏览器环境中，无法直接保存文件到服务器
  // 这里只是将数据转换为 JSON 字符串，实际保存需要通过 API 调用
  const json = JSON.stringify(notebook, null, 2);
  
  // 可以下载文件
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = path.split('/').pop() || 'notebook.ipynb';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

