import React from 'react';
import { INotebookContent, ICell } from '@jupyterlab/nbformat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './index.less';

interface NotebookRendererProps {
  notebook: INotebookContent;
}

const NotebookRenderer: React.FC<NotebookRendererProps> = ({ notebook }) => {
  const renderCell = (cell: ICell, index: number) => {
    if (cell.cell_type === 'markdown') {
      const source = Array.isArray(cell.source) 
        ? cell.source.join('') 
        : cell.source || '';
      
      return (
        <div key={index} className={styles.cell} data-cell-type="markdown">
          <div className={styles.cellContent}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {source}
            </ReactMarkdown>
          </div>
        </div>
      );
    }

    if (cell.cell_type === 'code') {
      const source = Array.isArray(cell.source) 
        ? cell.source.join('') 
        : cell.source || '';
      
      const outputs = (cell.outputs || []) as any[];

      const language = cell.metadata?.language 
        ? (typeof cell.metadata.language === 'string' ? cell.metadata.language : 'python')
        : 'python';

      return (
        <div key={index} className={styles.cell} data-cell-type="code">
          <div className={styles.codeInput}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              {source}
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
                  
                  // 优先显示图片
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
                  
                  // 然后显示 HTML
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
                  
                  // 最后显示纯文本
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
                  
                  // 如果没有匹配的数据类型，尝试显示其他格式
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
      {notebook.cells?.map((cell, index) => renderCell(cell, index))}
    </div>
  );
};

export default NotebookRenderer;

