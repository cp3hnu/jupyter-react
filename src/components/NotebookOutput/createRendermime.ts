import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
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

    rendermime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
      markdownParser: markdownParser,
    });
  }
  return rendermime;
}
