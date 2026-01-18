import NotebookEditor from '@/components/NotebookEditor';
import { loadNotebook, saveNotebook } from '@/utils/notebook';
import { INotebookContent } from '@jupyterlab/nbformat';
import { UUID } from '@lumino/coreutils';
import { useSearchParams } from '@umijs/max';
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';

const HomePage: React.FC = () => {
  const [notebook, setNotebook] = useState<INotebookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const file = searchParams.get('file') || 'article.ipynb';
  const notebookPath = `/data/${file}`;

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        setLoading(true);
        // UmiJS 中，public 目录下的文件可以直接通过 / 路径访问
        const data = await loadNotebook(notebookPath);
        data.cells.forEach((cell) => {
          if (!cell.id) {
            cell.id = UUID.uuid4();
          }
        });
        setNotebook(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load notebook',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [notebookPath]);

  const handleSave = async (notebookToSave: INotebookContent) => {
    // 更新本地状态
    setNotebook(notebookToSave);
    // 保存到文件
    await saveNotebook(notebookPath, notebookToSave);
  };

  return (
    <div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          Error: {error}
        </div>
      )}
      {notebook && (
        <NotebookEditor
          notebook={notebook}
          onSave={handleSave}
          notebookPath={notebookPath}
        />
      )}
    </div>
  );
};

export default HomePage;
