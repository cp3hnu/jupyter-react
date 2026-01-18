import { ICodeCell } from '@jupyterlab/nbformat';
import CellAction, { type CellActionProps } from '../CellAction';
import styles from './index.less';

export interface CellToolBarProps extends CellActionProps {
  execution_count?: ICodeCell['execution_count'];
}

function CellToolBar({ execution_count, type, ...rest }: CellToolBarProps) {
  return (
    <div className={styles.cellToolbar}>
      <span className={styles.cellType}>
        {type === 'code' ? 'Code ' : 'Markdown'}
        {execution_count ? `[${execution_count}]` : ''}
      </span>
      <CellAction type={type} {...rest} />
    </div>
  );
}

export default CellToolBar;
