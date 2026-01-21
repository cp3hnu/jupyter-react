import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';
import { marked } from 'marked';

let rendermime: RenderMimeRegistry | null = null;

export function getRendermime() {
  if (!rendermime) {
    // 创建 Markdown 解析器对象
    const markdownParser: IRenderMime.IMarkdownParser = {
      render: async (text: string): Promise<string> => {
        return marked.parse(text) as string;
      },
    };

    const latexTypesetter: IRenderMime.ILatexTypesetter = {
      typeset: async (element: HTMLElement) => {
        renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
          strict: false,
        });
      },
    };

    rendermime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
      markdownParser: markdownParser,
      latexTypesetter,
    });
  }
  return rendermime;
}
