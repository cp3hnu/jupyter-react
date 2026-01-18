import { ZCodeCell } from '@/types/notebook';
import { CellType } from '@jupyterlab/nbformat';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useState } from 'react';
import { type InsertPosition } from '../CellAction';
import CellToolBar from '../CellToolBar';
import NotebookOutput from '../NotebookOutput';
import styles from './index.less';

export { type InsertPosition };

type CodeCellProps = {
  cell: ZCodeCell;
  isExecuting: boolean;
  onInsert?: (id: string, type: CellType, position: InsertPosition) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChange?: (id: string, value: string) => void;
  onExecute?: (id: string) => void;
};

function CodeCell({
  cell,
  isExecuting,
  onInsert,
  onEdit,
  onDelete,
  onChange,
  onExecute,
}: CodeCellProps) {
  const { source, execution_count, outputs: originOutputs, metadata } = cell;
  const code = Array.isArray(source) ? source.join('') : source || '';
  const [editorHeight, setEditorHeight] = useState(100); // 初始高度
  const outputs = (originOutputs || []) as any[];
  const language = metadata?.language
    ? typeof metadata.language === 'string'
      ? metadata.language
      : 'python'
    : 'python';

  const handleEditorMount: OnMount = (editor) => {
    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setEditorHeight(contentHeight);
      editor.layout(); // 触发重新布局
    };

    updateHeight(); // 初始化时调用

    editor.onDidContentSizeChange(() => {
      console.log('zzz');

      updateHeight();
    });
    editor.onDidFocusEditorText(() => {
      console.log('dddd');

      onEdit?.(cell.id);
    });
  };

  const handleValueChange = (value?: string) => {
    onChange?.(cell.id, value ?? '');
  };

  const handleInsert = (type: CellType, position: InsertPosition) => {
    onInsert?.(cell.id, type, position);
  };

  const handleDelete = () => {
    onDelete?.(cell.id);
  };

  const handleExecute = () => {
    onExecute?.(cell.id);
  };

  return (
    <div key={cell.id} className={styles.cell} data-cell-type="code">
      <CellToolBar
        type="code"
        execution_count={execution_count}
        isExecuting={isExecuting}
        onExecute={handleExecute}
        onInsert={handleInsert}
        onDelete={handleDelete}
      />

      <div className={styles.cellCode}>
        <Editor
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
              handleMouseWheel: false,
              vertical: 'hidden',
              horizontal: 'auto',
            },
            overviewRulerLanes: 0, // 关闭 overview ruler
            hideCursorInOverviewRuler: true, // 隐藏光标标记
            automaticLayout: true,
          }}
          height={editorHeight}
          defaultLanguage={language}
          value={code}
          onChange={handleValueChange}
        />
      </div>
      {outputs.length > 0 && <NotebookOutput outputs={outputs} />}
    </div>
  );
}

export default CodeCell;
