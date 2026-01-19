import { ZMarkdownCell } from '@/types/notebook';
import { CellType } from '@jupyterlab/nbformat';
import MDEditor from '@uiw/react-md-editor';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { type InsertPosition } from '../CellAction';
import CellToolBar from '../CellToolBar';
import styles from './index.less';
import KatexCode from './katexCode';

type MarkdownCellProps = {
  cell: ZMarkdownCell;
  isEditing: boolean;
  onInsert?: (id: string, type: CellType, position: InsertPosition) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChange?: (id: string, value: string) => void;
  onClick?: (id?: string) => void;
};

function MarkdownCell({
  cell,
  isEditing,
  onInsert,
  onEdit,
  onClick,
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
            previewOptions={{
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeRaw, rehypeSanitize, rehypeKatex],
              components: {
                code: KatexCode,
              },
            }}
          ></MDEditor>
        </div>
      ) : (
        <div
          className={styles.cellContent}
          onClick={() => onClick?.(cell.id)}
          onDoubleClick={handleEdit}
        >
          <MDEditor.Markdown
            source={mdSource}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
            components={{
              code: KatexCode,
            }}
          ></MDEditor.Markdown>
        </div>
      )}
    </div>
  );
}

export default MarkdownCell;
