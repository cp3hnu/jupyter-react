import { Widget } from '@lumino/widgets';

function createNode(): HTMLElement {
  const root = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = '标题';

  const p = document.createElement('p');
  p.textContent = '这是段落';

  const span = document.createElement('span');
  span.textContent = '这是正文';

  const img = document.createElement('img');
  img.style.display = 'block';
  img.src =
    'https://img0.baidu.com/it/u=3165460051,2199693685&fm=253&fmt=auto&app=120&f=JPEG?w=667&h=500';

  root.append(h1, p, span, img);
  return root;
}

class ArticleWidget extends Widget {
  constructor() {
    super({ node: createNode() });
  }
}

export default ArticleWidget;
