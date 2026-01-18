import CreateNotebookModal from '@/components/CreateNotebookModal';
import { history } from '@umijs/max';
import { Button, List, message, Space, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

type Manifest = string[];

async function fetchManifest(): Promise<Manifest> {
  const res = await fetch('/data/manifest.json', { cache: 'no-store' });
  if (res.ok) {
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  }

  const fallback = await fetch('/local-api/notebooks', { cache: 'no-store' });
  if (!fallback.ok) {
    return [];
  }
  const data = await fallback.json();
  const files = data?.data?.files;
  return Array.isArray(files) ? files : [];
}

const HomePage: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const emptyDisplay = useMemo(() => JSON.stringify([], null, 2), []);

  const reload = async () => {
    setLoading(true);
    try {
      const list = await fetchManifest();
      setFiles(list);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Failed to load list');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleOpen = (file: string) => {
    history.push(`/home/notebook?file=${encodeURIComponent(file)}`);
  };

  const handleCreated = async (file: string) => {
    await reload();
    history.push(`/home/notebook?file=${encodeURIComponent(file)}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Notebooks
      </Typography.Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => setCreateOpen(true)}>
          新增
        </Button>
        <Button onClick={reload} loading={loading}>
          刷新
        </Button>
      </Space>

      <CreateNotebookModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {files.length === 0 ? (
        <pre style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
          {emptyDisplay}
        </pre>
      ) : (
        <List
          bordered
          loading={loading}
          dataSource={files}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleOpen(item)}
              style={{ cursor: 'pointer' }}
            >
              {item}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default HomePage;

/*
 * @Author: cp3hnu cp3hnu@gmail.com
 * @Date: 2026-01-18 16:30:31
 * @LastEditors: cp3hnu cp3hnu@gmail.com
 * @LastEditTime: 2026-01-18 16:46:59
 * @FilePath: /jupyter-react/src/pages/Home/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
