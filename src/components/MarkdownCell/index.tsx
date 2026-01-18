import { ZMarkdownCell } from '@/types/notebook';
import { CellType } from '@jupyterlab/nbformat';
import MDEditor from '@uiw/react-md-editor';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { type InsertPosition } from '../CellAction';
import CellToolBar from '../CellToolBar';
import styles from './index.less';

type MarkdownCellProps = {
  cell: ZMarkdownCell;
  isEditing: boolean;
  onInsert?: (id: string, type: CellType, position: InsertPosition) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChange?: (id: string, value: string) => void;
  onEditEnd?: (id?: string) => void;
};

function MarkdownCell({
  cell,
  isEditing,
  onInsert,
  onEdit,
  onEditEnd,
  onDelete,
  onChange,
}: MarkdownCellProps) {
  const { source } = cell;
  const mdSource = Array.isArray(source) ? source.join('') : source || '';

  const handleEdit = () => {
    onEdit?.(cell.id);
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

  return (
    <div key={cell.id} className={styles.cell} data-cell-type="markdown">
      <CellToolBar
        type="markdown"
        onInsert={handleInsert}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isEditing ? (
        <div className={styles.cellContent}>
          <MDEditor
            value={mdSource}
            preview="edit"
            onChange={handleValueChange}
            height={'fit-content'}
            style={{ maxHeight: '500px' }}
            textareaProps={{
              onBlur: () => onEditEnd?.(cell.id),
            }}
          ></MDEditor>
        </div>
      ) : (
        <div
          className={styles.cellContent}
          onClick={() => onEditEnd?.()}
          onDoubleClick={handleEdit}
        >
          <MDEditor.Markdown
            source={mdSource}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          ></MDEditor.Markdown>
        </div>
      )}
    </div>
  );
}

export default MarkdownCell;
