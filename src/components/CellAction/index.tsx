import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { CellType } from '@jupyterlab/nbformat';
import { Button } from 'antd';
import styles from './index.less';

export type InsertPosition = 'before' | 'after';

export interface CellActionProps {
  type: CellType;
  isEditing?: boolean;
  isExecuting?: boolean;
  onExecute?: () => void;
  onInsert?: (type: CellType, position: InsertPosition) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CellAction({
  type,
  isEditing,
  isExecuting,
  onExecute,
  onInsert,
  onEdit,
  onDelete,
}: CellActionProps) {
  return (
    <div className={styles.cellActions}>
      {type === 'code' ? (
        <Button
          type="text"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={onExecute}
          loading={isExecuting}
          disabled={isExecuting}
          title="执行代码"
        >
          执行
        </Button>
      ) : !isEditing ? (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={onEdit}
          title="编辑（或双击单元格）"
        ></Button>
      ) : (
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={onEdit}
          title="结束编辑"
        ></Button>
      )}

      <Button
        type="text"
        size="small"
        onClick={() => onInsert?.('markdown', 'before')}
        title="在上方插入 Markdown"
      >
        +M
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => onInsert?.('code', 'before')}
        title="在上方插入 Code"
      >
        +C
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => onInsert?.('markdown', 'after')}
        title="在下方插入 Markdown"
      >
        M+
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => onInsert?.('code', 'after')}
        title="在下方插入 Code"
      >
        C+
      </Button>

      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={onDelete}
        title="删除"
      ></Button>
    </div>
  );
}

export default CellAction;
