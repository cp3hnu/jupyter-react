import { ICodeCell, IMarkdownCell } from '@jupyterlab/nbformat';

// 新类型：id 为必填
export interface ZCodeCell extends ICodeCell {
  id: string;
}

// 新类型：id 为必填
export interface ZMarkdownCell extends IMarkdownCell {
  id: string;
}
