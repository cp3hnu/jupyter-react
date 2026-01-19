import ServerConnectionDialog from '@/components/ServerConnectionDialog';
import {
  closeSession,
  createKernelSession,
  createServerSettings,
  executeCode,
} from '@/services/jupyter';
import { ZCodeCell, ZMarkdownCell } from '@/types/notebook';
import { saveNotebook } from '@/utils/notebook';
import {
  DisconnectOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { CellType, ICell, INotebookContent } from '@jupyterlab/nbformat';
import { Session } from '@jupyterlab/services';
import { UUID } from '@lumino/coreutils';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import CodeCell, { type InsertPosition } from '../CodeCell';
import MarkdownCell from '../MarkdownCell';
import styles from './index.less';

interface NotebookEditorProps {
  notebook: INotebookContent;
  onSave?: (notebook: INotebookContent) => Promise<void>;
  notebookPath?: string;
}

const NotebookEditor: React.FC<NotebookEditorProps> = ({
  notebook: initialNotebook,
  onSave,
  notebookPath = '/data/article.ipynb',
}) => {
  const [notebook, setNotebook] = useState<INotebookContent>(initialNotebook);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [session, setSession] = useState<Session.ISessionConnection | null>(
    null,
  );
  const [serverUrl, setServerUrl] = useState<string>('');
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [executingCellId, setExecutingCellId] = useState<string | null>(null);

  // 清理：组件卸载时关闭会话
  useEffect(() => {
    return () => {
      if (session) {
        closeSession(session).catch(console.error);
      }
    };
  }, [session]);

  // 开始编辑 cell
  const startEdit = (id: string) => {
    setEditingCellId(id);
  };

  // 结束编辑
  const clickCell = () => {
    setEditingCellId(null);
  };

  // 创建新的 cell
  const createNewCell = (cellType: CellType): ICell => {
    return {
      id: UUID.uuid4(),
      cell_type: cellType,
      source: '',
      metadata: {},
      outputs: cellType === 'code' ? [] : undefined,
      execution_count: cellType === 'code' ? null : undefined,
    } as ICell;
  };

  // 插入 cell
  const insertCell = (
    id: string | null,
    cellType: CellType,
    position: InsertPosition,
  ) => {
    const newCell = createNewCell(cellType);
    setEditingCellId(newCell.id as string);
    if (id) {
      const index = notebook.cells?.findIndex((cell) => cell.id === id);
      if (index !== -1) {
        const insertIndex = position === 'before' ? index : index + 1;
        setNotebook((prev) => {
          return {
            ...prev,
            cells: [
              ...prev.cells?.slice(0, insertIndex),
              newCell,
              ...prev.cells?.slice(insertIndex),
            ],
          };
        });

        return;
      }
    }

    setNotebook((prev) => ({
      ...prev,
      cells: [newCell, ...(prev.cells || [])],
    }));
  };

  // 删除 cell
  const deleteCell = (id: string) => {
    if (editingCellId === id) {
      setEditingCellId(null);
    }

    setNotebook((prev) => ({
      ...prev,
      cells: prev.cells?.filter((cell) => cell.id !== id),
    }));
  };

  // 处理 cell 内容改变
  const handleCellSourceChange = (id: string, value: string) => {
    setNotebook((prev) => {
      const newCells = notebook.cells?.map((cell) => {
        if (cell.id === id) {
          return {
            ...cell,
            source: value,
          };
        }
        return cell;
      });
      return {
        ...prev,
        cells: newCells,
      };
    });
  };

  // 连接 Jupyter Server
  const handleConnectServer = async (baseUrl: string, token: string) => {
    try {
      console.log('Connecting to server:', { baseUrl, token });
      const settings = createServerSettings(baseUrl, token);
      console.log('Server settings created:', settings);
      const newSession = await createKernelSession(settings);
      console.log('Session created:', newSession);
      setSession(newSession);
      setServerUrl(`${baseUrl}?token=${token}`);
      setShowServerDialog(false);
      message.success('连接成功');
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      message.error('连接失败: ' + errorMessage);
      // 显示更详细的错误信息
      if (error instanceof Error && error.stack) {
        console.error('Error stack:', error.stack);
      }
    }
  };

  // 断开连接
  const handleDisconnectServer = async () => {
    if (session) {
      try {
        await closeSession(session);
        setSession(null);
        setServerUrl('');
        message.success('已断开连接');
      } catch (error) {
        message.error(
          '断开连接失败: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        );
      }
    }
  };

  // 执行 code cell
  const executeCell = async (id: string) => {
    if (!session) {
      message.warning('请先连接 Jupyter Server');
      setShowServerDialog(true);
      return;
    }

    const cell = notebook.cells?.find((cell) => cell.id === id);
    if (!cell || cell.cell_type !== 'code') {
      return;
    }

    const source = Array.isArray(cell.source)
      ? cell.source.join('')
      : cell.source || '';

    if (!source.trim()) {
      message.warning('代码为空');
      return;
    }

    try {
      setExecutingCellId(id);
      const { outputs, execution_count } = await executeCode(session, source);

      // 更新 cell 的输出和执行计数
      setNotebook((prev) => {
        const newCells = notebook.cells?.map((cell) => {
          if (cell.id === id) {
            return {
              ...cell,
              outputs,
              execution_count,
            };
          }
          return cell;
        });
        return {
          ...prev,
          cells: newCells,
        };
      });

      message.success('执行成功');
    } catch (error) {
      message.error(
        '执行失败: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setExecutingCellId(null);
    }
  };

  // 导出 notebook
  const handleSave = async () => {
    try {
      setSaving(true);
      if (onSave) {
        await onSave(notebook);
      } else {
        await saveNotebook(notebookPath, notebook);
      }
      message.success('导出成功');
    } catch (error) {
      message.error(
        '导出失败: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePersist = async () => {
    try {
      const file = notebookPath.split('/').pop() || '';
      if (!file.endsWith('.ipynb')) {
        message.error('无效的文件名');
        return;
      }

      setPersisting(true);
      const res = await fetch(
        `/local-api/notebooks/${encodeURIComponent(file)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notebook),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save');
      }

      message.success('保存成功');
    } catch (error) {
      message.error(
        '保存失败: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setPersisting(false);
    }
  };

  // 渲染 cell
  const renderCell = (cell: ICell) => {
    const isEditing = editingCellId === cell.id;

    if (cell.cell_type === 'markdown') {
      return (
        <MarkdownCell
          key={cell.id as string}
          cell={cell as ZMarkdownCell}
          isEditing={isEditing}
          onInsert={insertCell}
          onEdit={startEdit}
          onClick={clickCell}
          onDelete={deleteCell}
          onChange={handleCellSourceChange}
        />
      );
    }

    if (cell.cell_type === 'code') {
      const isExecuting = executingCellId === cell.id;
      return (
        <CodeCell
          key={cell.id as string}
          cell={cell as ZCodeCell}
          isExecuting={isExecuting}
          onEdit={startEdit}
          onInsert={insertCell}
          onDelete={deleteCell}
          onChange={handleCellSourceChange}
          onExecute={executeCell}
        />
      );
    }

    return null;
  };

  return (
    <div className={styles.notebookContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handlePersist}
            loading={persisting}
          >
            保存
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            导出
          </Button>
          {session ? (
            <Button
              icon={<DisconnectOutlined />}
              onClick={handleDisconnectServer}
              danger
            >
              断开连接
            </Button>
          ) : (
            <Button
              icon={<LinkOutlined />}
              onClick={() => setShowServerDialog(true)}
            >
              连接 Server
            </Button>
          )}
          {session && (
            <span className={styles.serverStatus}>
              已连接: {serverUrl.split('?')[0]}
            </span>
          )}
        </div>
        <div className={styles.toolbarActions}>
          <Button
            icon={<PlusOutlined />}
            onClick={() => insertCell(null, 'markdown', 'after')}
          >
            添加 Markdown
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => insertCell(null, 'code', 'after')}
          >
            添加 Code
          </Button>
        </div>
      </div>
      <div className={styles.cellsContainer}>
        {notebook.cells?.map((cell) => renderCell(cell))}
        {(!notebook.cells || notebook.cells.length === 0) && (
          <div className={styles.emptyState}>
            <p>Notebook 为空，点击上方按钮添加 cell</p>
          </div>
        )}
      </div>
      <ServerConnectionDialog
        visible={showServerDialog}
        onOk={handleConnectServer}
        onCancel={() => setShowServerDialog(false)}
        defaultUrl="http://localhost:8000/?token=49c283a172476075d8786d62192b08b8047ead54eaf61496"
      />
    </div>
  );
};

export default NotebookEditor;
