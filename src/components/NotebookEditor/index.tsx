import ServerConnectionDialog from '@/components/ServerConnectionDialog';
import {
  closeSession,
  createKernelSession,
  createServerSettings,
  executeCode,
} from '@/services/jupyter';
import { saveNotebook } from '@/utils/notebook';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  EditOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ICell, INotebookContent } from '@jupyterlab/nbformat';
import { Session } from '@jupyterlab/services';
import { Button, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import NotebookOutput from '../NotebookOutput';
import styles from './index.less';

const { TextArea } = Input;

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
  const [editingCellIndex, setEditingCellIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session.ISessionConnection | null>(
    null,
  );
  const [serverUrl, setServerUrl] = useState<string>('');
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [executingCellIndex, setExecutingCellIndex] = useState<number | null>(
    null,
  );

  // 创建新的 cell
  const createNewCell = (cellType: 'markdown' | 'code'): ICell => {
    return {
      cell_type: cellType,
      source: '',
      metadata: {},
      outputs: cellType === 'code' ? [] : undefined,
      execution_count: cellType === 'code' ? null : undefined,
    } as ICell;
  };

  // 插入 cell
  const insertCell = (index: number, cellType: 'markdown' | 'code') => {
    const newCell = createNewCell(cellType);
    const newCells = [...(notebook.cells || [])];
    newCells.splice(index, 0, newCell);
    setNotebook({ ...notebook, cells: newCells });
    setEditingCellIndex(index);
    setEditingContent('');
  };

  // 删除 cell
  const deleteCell = (index: number) => {
    const newCells = [...(notebook.cells || [])];
    newCells.splice(index, 1);
    setNotebook({ ...notebook, cells: newCells });
    if (editingCellIndex === index) {
      setEditingCellIndex(null);
    } else if (editingCellIndex !== null && editingCellIndex > index) {
      setEditingCellIndex(editingCellIndex - 1);
    }
  };

  // 开始编辑 cell
  const startEdit = (index: number) => {
    const cell = notebook.cells?.[index];
    if (cell) {
      const source = Array.isArray(cell.source)
        ? cell.source.join('')
        : cell.source || '';
      setEditingCellIndex(index);
      setEditingContent(source);
    }
  };

  // 保存编辑
  const saveEdit = (index: number) => {
    const newCells = [...(notebook.cells || [])];
    const cell = { ...newCells[index] };
    cell.source = editingContent;
    newCells[index] = cell;
    setNotebook({ ...notebook, cells: newCells });
    setEditingCellIndex(null);
    setEditingContent('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingCellIndex(null);
    setEditingContent('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveEdit(index);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
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
  const executeCell = async (index: number) => {
    if (!session) {
      message.warning('请先连接 Jupyter Server');
      setShowServerDialog(true);
      return;
    }

    const cell = notebook.cells?.[index];
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
      setExecutingCellIndex(index);
      const { outputs, execution_count } = await executeCode(session, source);

      // 更新 cell 的输出和执行计数
      const newCells = [...(notebook.cells || [])];
      const updatedCell = { ...newCells[index] };
      updatedCell.outputs = outputs;
      updatedCell.execution_count = execution_count;
      newCells[index] = updatedCell;
      setNotebook({ ...notebook, cells: newCells });

      message.success('执行成功');
    } catch (error) {
      message.error(
        '执行失败: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setExecutingCellIndex(null);
    }
  };

  // 清理：组件卸载时关闭会话
  useEffect(() => {
    return () => {
      if (session) {
        closeSession(session).catch(console.error);
      }
    };
  }, [session]);

  // 保存 notebook
  const handleSave = async () => {
    try {
      setSaving(true);
      if (onSave) {
        await onSave(notebook);
      } else {
        await saveNotebook(notebookPath, notebook);
      }
      message.success('保存成功');
    } catch (error) {
      message.error(
        '保存失败: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setSaving(false);
    }
  };

  // 渲染 cell
  const renderCell = (cell: ICell, index: number) => {
    const isEditing = editingCellIndex === index;
    const source = Array.isArray(cell.source)
      ? cell.source.join('')
      : cell.source || '';

    if (isEditing) {
      return (
        <div
          key={index}
          className={styles.cell}
          data-cell-type={cell.cell_type}
        >
          <div className={styles.cellToolbar}>
            <span className={styles.cellType}>
              {cell.cell_type === 'markdown' ? 'Markdown' : 'Code'}
            </span>
            <div className={styles.cellActions}>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => saveEdit(index)}
              >
                保存
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={cancelEdit}
              >
                取消
              </Button>
            </div>
          </div>
          <div className={styles.cellEditor}>
            <TextArea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              autoSize={{ minRows: 3 }}
              className={styles.textArea}
              autoFocus
            />
            <div className={styles.editHint}>按 Ctrl+Enter 保存，Esc 取消</div>
          </div>
        </div>
      );
    }

    if (cell.cell_type === 'markdown') {
      return (
        <div key={index} className={styles.cell} data-cell-type="markdown">
          <div className={styles.cellToolbar}>
            <span className={styles.cellType}>Markdown</span>
            <div className={styles.cellActions}>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index, 'markdown')}
                title="在上方插入 Markdown"
              >
                +M
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index, 'code')}
                title="在上方插入 Code"
              >
                +C
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index + 1, 'markdown')}
                title="在下方插入 Markdown"
              >
                M+
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index + 1, 'code')}
                title="在下方插入 Code"
              >
                C+
              </Button>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => startEdit(index)}
                title="编辑（或双击单元格）"
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteCell(index)}
                title="删除"
              />
            </div>
          </div>
          <div
            className={styles.cellContent}
            onDoubleClick={() => startEdit(index)}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {source || '*空单元格*'}
            </ReactMarkdown>
          </div>
        </div>
      );
    }

    if (cell.cell_type === 'code') {
      const outputs = (cell.outputs || []) as any[];
      // console.log('outputs', outputs);

      const language = cell.metadata?.language
        ? typeof cell.metadata.language === 'string'
          ? cell.metadata.language
          : 'python'
        : 'python';
      const isExecuting = executingCellIndex === index;

      return (
        <div key={index} className={styles.cell} data-cell-type="code">
          <div className={styles.cellToolbar}>
            <span className={styles.cellType}>
              Code{' '}
              {cell.execution_count !== null &&
              cell.execution_count !== undefined
                ? `[${cell.execution_count}]`
                : ''}
            </span>
            <div className={styles.cellActions}>
              <Button
                type="text"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => executeCell(index)}
                loading={isExecuting}
                disabled={isExecuting}
                title="执行代码"
              >
                执行
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index, 'markdown')}
                title="在上方插入 Markdown"
              >
                +M
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index, 'code')}
                title="在上方插入 Code"
              >
                +C
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index + 1, 'markdown')}
                title="在下方插入 Markdown"
              >
                M+
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => insertCell(index + 1, 'code')}
                title="在下方插入 Code"
              >
                C+
              </Button>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => startEdit(index)}
                title="编辑（或双击单元格）"
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteCell(index)}
                title="删除"
              />
            </div>
          </div>
          <div
            className={styles.codeInput}
            onDoubleClick={() => startEdit(index)}
          >
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {source || '# 空代码单元格'}
            </SyntaxHighlighter>
          </div>
          {outputs.length > 0 && <NotebookOutput outputs={outputs} />}
        </div>
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
            onClick={handleSave}
            loading={saving}
          >
            保存
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
            onClick={() => insertCell(0, 'markdown')}
          >
            添加 Markdown
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => insertCell(0, 'code')}>
            添加 Code
          </Button>
        </div>
      </div>
      <div className={styles.cellsContainer}>
        {notebook.cells?.map((cell, index) => renderCell(cell, index))}
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
