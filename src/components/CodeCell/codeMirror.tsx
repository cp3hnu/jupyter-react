import { ZCodeCell } from '@/types/notebook';
import { python } from '@codemirror/lang-python';
import { CellType } from '@jupyterlab/nbformat';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { useMemo } from 'react';
import CellAction, { type InsertPosition } from '../CellAction';
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
  const { source, outputs: originOutputs } = cell;
  const code = Array.isArray(source) ? source.join('') : source || '';
  const MAX_EDITOR_HEIGHT = 500;
  const outputs = (originOutputs || []) as any[];

  const extensions = useMemo(() => {
    return [python(), EditorView.lineWrapping];
  }, []);

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
      <CellAction
        type="code"
        isExecuting={isExecuting}
        onExecute={handleExecute}
        onInsert={handleInsert}
        onDelete={handleDelete}
        className={styles['cell__header']}
      />
      <div className={styles['cell__content']}>
        <div>
          <CodeMirror
            value={code}
            height={'auto'}
            maxHeight={`${MAX_EDITOR_HEIGHT}px`}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
              autocompletion: true,
            }}
            theme="light"
            extensions={extensions}
            onChange={handleValueChange}
            onFocus={() => onEdit?.(cell.id)}
          />
        </div>
        {outputs.length > 0 && <NotebookOutput outputs={outputs} />}
      </div>
    </div>
  );
}

export default CodeCell;
