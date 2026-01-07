import { RenderedMarkdown } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

class CustomMarkdownRenderer extends RenderedMarkdown {
  render(model: IRenderMime.IMimeModel): Promise<void> {
    // 配置 marked 允许 HTML
    // const options = {
    //   ...this.options,
    //   sanitizer: (html: string) => html, // 不清理 HTML
    // };
    return super.render(model);
  }
}

// 注册自定义渲染器
const customRendererFactory = {
  safe: false, // 允许不安全的内容
  mimeTypes: ['text/markdown'],
  createRenderer: (options) => new CustomMarkdownRenderer(options),
};

export default customRendererFactory;
