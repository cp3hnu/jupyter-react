import { ZMarkdownCell } from '@/types/notebook';
import { CellType } from '@jupyterlab/nbformat';
import MDEditor from '@uiw/react-md-editor';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
// import rehypeSanitize from 'rehype-sanitize';
import { fullscreen, getCommands } from '@uiw/react-md-editor/commands-cn';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import CellAction, { type InsertPosition } from '../CellAction';
import styles from '../CodeCell/index.less';
import { codePreview } from './config';
import KatexCode from './katexCode';

type MarkdownCellProps = {
  cell: ZMarkdownCell;
  isEditing: boolean;
  onInsert?: (id: string, type: CellType, position: InsertPosition) => void;
  onEdit?: (id: string) => void;
  OnEditEnd?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChange?: (id: string, value: string) => void;
  onClick?: (id?: string) => void;
};

function MarkdownCell({
  cell,
  isEditing,
  onInsert,
  onEdit,
  OnEditEnd,
  onClick,
  onDelete,
  onChange,
}: MarkdownCellProps) {
  const { source } = cell;
  const mdSource = Array.isArray(source) ? source.join('') : source || '';

  const handleEdit = () => {
    if (isEditing) {
      OnEditEnd?.(cell.id);
    } else {
      onEdit?.(cell.id);
    }
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
      <CellAction
        type="markdown"
        isEditing={isEditing}
        onInsert={handleInsert}
        onEdit={handleEdit}
        onDelete={handleDelete}
        className={styles['cell__header']}
      />

      {isEditing ? (
        <div className={styles['cell__editor']}>
          <MDEditor
            value={mdSource}
            preview="edit"
            onChange={handleValueChange}
            height={'fit-content'}
            style={{ maxHeight: '500px' }}
            visibleDragbar={false}
            previewOptions={{
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [rehypeRaw, rehypeKatex],
              components: {
                code: KatexCode,
              },
            }}
            textareaProps={{
              placeholder: '请输入',
            }}
            commands={[...getCommands()]} // 基础命令
            extraCommands={[codePreview, fullscreen]} // 扩展命令
          ></MDEditor>
        </div>
      ) : (
        <div
          className={styles['cell__content']}
          onClick={() => onClick?.(cell.id)}
          onDoubleClick={handleEdit}
        >
          <MDEditor.Markdown
            source={mdSource}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
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
