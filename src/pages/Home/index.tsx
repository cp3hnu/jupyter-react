import NotebookEditor from '@/components/NotebookEditor';
import { loadNotebook, saveNotebook } from '@/utils/notebook';
import { PageContainer } from '@ant-design/pro-components';
import { INotebookContent } from '@jupyterlab/nbformat';
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const HomePage: React.FC = () => {
  const [notebook, setNotebook] = useState<INotebookContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        setLoading(true);
        // UmiJS 中，public 目录下的文件可以直接通过 / 路径访问
        const data = await loadNotebook('/data/article.ipynb');
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
  }, []);

  const handleSave = async (notebookToSave: INotebookContent) => {
    // 更新本地状态
    setNotebook(notebookToSave);
    // 保存到文件
    await saveNotebook('/data/article.ipynb', notebookToSave);
  };

  return (
    <PageContainer ghost>
      <div className={styles.container}>
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
            notebookPath="/data/article.ipynb"
          />
        )}
      </div>
    </PageContainer>
  );
};

export default HomePage;
