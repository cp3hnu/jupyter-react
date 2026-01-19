import CreateNotebookModal from '@/components/CreateNotebookModal';
import { DeleteOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Flex, List, message, Popconfirm, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

type Manifest = string[];

async function deleteNotebook(file: string): Promise<void> {
  const res = await fetch(`/local-api/notebooks/${encodeURIComponent(file)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to delete notebook');
  }
}

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
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

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

  const handleDelete = async (file: string) => {
    try {
      setDeletingFile(file);
      await deleteNotebook(file);
      message.success('删除成功');
      await reload();
    } catch (e) {
      message.error(e instanceof Error ? e.message : '删除失败');
    } finally {
      setDeletingFile(null);
    }
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

      <Flex
        justify="flex-end"
        align="center"
        gap={16}
        style={{ marginBottom: 20 }}
      >
        <Button type="primary" onClick={() => setCreateOpen(true)}>
          新增
        </Button>
        <Button onClick={reload} loading={loading}>
          刷新
        </Button>
      </Flex>

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
              style={{ cursor: 'pointer', height: 60 }}
              onMouseEnter={() => setHoveredFile(item)}
              onMouseLeave={() =>
                setHoveredFile((prev) => (prev === item ? null : prev))
              }
              actions={
                hoveredFile === item
                  ? [
                      <Popconfirm
                        key="delete"
                        title="确认删除该文件？"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          return handleDelete(item);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          loading={deletingFile === item}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>,
                    ]
                  : []
              }
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
