import { IOutput } from '@jupyterlab/nbformat';
import { OutputArea, OutputAreaModel } from '@jupyterlab/outputarea';
import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';
import { Widget } from '@lumino/widgets';
import React, { useEffect, useRef } from 'react';
import styles from './index.less';

interface OutputRendererProps {
  outputs: IOutput[];
}

/**
 * 降级渲染函数
 * 当JupyterLab组件无法处理时，使用简单的HTML渲染
 */
// function renderFallback(container: HTMLElement, output: IOutput) {
//   container.innerHTML = '';

//   if (output.output_type === 'stream') {
//     const text = Array.isArray(output.text)
//       ? output.text.join('')
//       : (output.text as string) || '';
//     const pre = document.createElement('pre');
//     pre.className = 'streamOutput';
//     const code = document.createElement('code');
//     code.textContent = text;
//     pre.appendChild(code);
//     container.appendChild(pre);
//   } else if (
//     output.output_type === 'display_data' ||
//     output.output_type === 'execute_result'
//   ) {
//     const data = (output as any).data || {};

//     if (data['text/html']) {
//       const html = Array.isArray(data['text/html'])
//         ? data['text/html'].join('')
//         : (data['text/html'] as string);
//       const div = document.createElement('div');
//       div.className = 'htmlOutput';
//       div.innerHTML = html;
//       container.appendChild(div);
//     } else if (data['image/png']) {
//       const imageData = data['image/png'];
//       const imageSrc = Array.isArray(imageData)
//         ? imageData.join('')
//         : imageData;
//       const img = document.createElement('img');
//       img.src = `data:image/png;base64,${imageSrc}`;
//       img.alt = 'Output';
//       container.appendChild(img);
//     } else if (data['text/plain']) {
//       const text = Array.isArray(data['text/plain'])
//         ? data['text/plain'].join('')
//         : (data['text/plain'] as string);
//       const pre = document.createElement('pre');
//       pre.className = 'textOutput';
//       const code = document.createElement('code');
//       code.textContent = text;
//       pre.appendChild(code);
//       container.appendChild(pre);
//     } else {
//       // 尝试渲染第一个可用的MIME类型
//       const dataKeys = Object.keys(data);
//       if (dataKeys.length > 0) {
//         const firstKey = dataKeys[0];
//         const content = Array.isArray(data[firstKey])
//           ? data[firstKey].join('')
//           : (data[firstKey] as string);
//         const pre = document.createElement('pre');
//         pre.className = 'textOutput';
//         const code = document.createElement('code');
//         code.textContent = content;
//         pre.appendChild(code);
//         container.appendChild(pre);
//       }
//     }
//   } else if (output.output_type === 'error') {
//     const traceback = (output as any).traceback || [];
//     const errorText = traceback.join('\n');
//     const pre = document.createElement('pre');
//     pre.className = 'errorOutput';
//     const code = document.createElement('code');
//     code.textContent = errorText;
//     pre.appendChild(code);
//     container.appendChild(pre);
//   }
// }

/**
 * 创建RenderMimeRegistry实例
 * 这是一个全局的注册表，用于处理各种MIME类型的输出
 */
const createRenderMimeRegistry = () => {
  return new RenderMimeRegistry({
    initialFactories: standardRendererFactories,
  });
};

// 全局RenderMimeRegistry实例
let mimeRegistry: RenderMimeRegistry | null = null;

const getRenderMimeRegistry = () => {
  if (!mimeRegistry) {
    mimeRegistry = createRenderMimeRegistry();
  }
  return mimeRegistry;
};

/**
 * 输出渲染组件
 * 使用JupyterLab的OutputArea和RenderMime来渲染各种输出类型
 */
const OutputRenderer: React.FC<OutputRendererProps> = ({ outputs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const outputAreaRef = useRef<OutputArea | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // 清空容器
      containerRef.current.innerHTML = '';

      const registry = getRenderMimeRegistry();

      // 创建OutputArea实例
      const outputArea = new OutputArea({
        model: new OutputAreaModel({ values: outputs }),
        rendermime: registry,
      });

      outputAreaRef.current = outputArea;

      // 将OutputArea添加到DOM
      Widget.attach(outputArea, containerRef.current);

      return () => {
        // 清理：卸载时销毁OutputArea
        outputArea.dispose();
      };
    } catch (error) {
      console.error('Error rendering output:', error);
      // 如果使用JupyterLab组件出错，降级到简单渲染
      if (containerRef.current) {
        //renderFallback(containerRef.current, output);
      }
    }
  }, [outputs]);

  return <div ref={containerRef} className={styles.outputRenderer} />;
};

export default OutputRenderer;
