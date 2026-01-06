import {
  RenderMimeRegistry,
  standardRendererFactories,
} from '@jupyterlab/rendermime';

let rendermime: RenderMimeRegistry | null = null;

export function getRendermime() {
  if (!rendermime) {
    rendermime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
    });
  }
  return rendermime;
}
