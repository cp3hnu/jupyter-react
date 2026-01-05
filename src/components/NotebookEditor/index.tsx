import React, { useState, useRef, useEffect } from 'react';
import { INotebookContent, ICell } from '@jupyterlab/nbformat';
import { Button, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { saveNotebook } from '@/utils/notebook';
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
  notebookPath = '/data/article.ipynb'
}) => {
  const [notebook, setNotebook] = useState<INotebookContent>(initialNotebook);
  const [editingCellIndex, setEditingCellIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [saving, setSaving] = useState(false);

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

  // 取消编辑
  const cancelEdit = () => {
    setEditingCellIndex(null);
    setEditingContent('');
  };

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
      message.error('保存失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        <div key={index} className={styles.cell} data-cell-type={cell.cell_type}>
          <div className={styles.cellToolbar}>
            <span className={styles.cellType}>{cell.cell_type === 'markdown' ? 'Markdown' : 'Code'}</span>
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
            <div className={styles.editHint}>
              按 Ctrl+Enter 保存，Esc 取消
            </div>
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
      const language = cell.metadata?.language 
        ? (typeof cell.metadata.language === 'string' ? cell.metadata.language : 'python')
        : 'python';

      return (
        <div key={index} className={styles.cell} data-cell-type="code">
          <div className={styles.cellToolbar}>
            <span className={styles.cellType}>Code</span>
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
          {outputs.length > 0 && (
            <div className={styles.codeOutput}>
              {outputs.map((output: any, outputIndex: number) => {
                if (output.output_type === 'stream') {
                  const text = Array.isArray(output.text) 
                    ? output.text.join('') 
                    : output.text || '';
                  return (
                    <pre key={outputIndex} className={styles.streamOutput}>
                      <code>{text}</code>
                    </pre>
                  );
                }
                if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
                  const data = output.data || {};
                  
                  if (data['image/png']) {
                    const imageData = data['image/png'];
                    const imageSrc = Array.isArray(imageData) 
                      ? imageData.join('') 
                      : imageData;
                    return (
                      <div key={outputIndex} className={styles.imageOutput}>
                        <img src={`data:image/png;base64,${imageSrc}`} alt="Output" />
                      </div>
                    );
                  }
                  
                  if (data['text/html']) {
                    const html = Array.isArray(data['text/html']) 
                      ? data['text/html'].join('') 
                      : data['text/html'];
                    return (
                      <div
                        key={outputIndex}
                        className={styles.htmlOutput}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  }
                  
                  if (data['text/plain']) {
                    const text = Array.isArray(data['text/plain']) 
                      ? data['text/plain'].join('') 
                      : data['text/plain'];
                    return (
                      <pre key={outputIndex} className={styles.textOutput}>
                        <code>{text}</code>
                      </pre>
                    );
                  }
                  
                  const dataKeys = Object.keys(data);
                  if (dataKeys.length > 0) {
                    const firstKey = dataKeys[0];
                    const content = Array.isArray(data[firstKey]) 
                      ? data[firstKey].join('') 
                      : data[firstKey];
                    return (
                      <pre key={outputIndex} className={styles.textOutput}>
                        <code>{content}</code>
                      </pre>
                    );
                  }
                }
                if (output.output_type === 'error') {
                  const traceback = output.traceback || [];
                  const errorText = traceback.join('\n');
                  return (
                    <pre key={outputIndex} className={styles.errorOutput}>
                      <code>{errorText}</code>
                    </pre>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.notebookContainer}>
      <div className={styles.toolbar}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          保存
        </Button>
        <div className={styles.toolbarActions}>
          <Button
            icon={<PlusOutlined />}
            onClick={() => insertCell(0, 'markdown')}
          >
            添加 Markdown
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => insertCell(0, 'code')}
          >
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
    </div>
  );
};

export default NotebookEditor;

