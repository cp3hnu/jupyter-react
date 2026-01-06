import { OutputArea, OutputAreaModel } from '@jupyterlab/outputarea';
import { getRendermime } from './ createRendermime';

export function createOutputArea() {
  const model = new OutputAreaModel();
  const outputArea = new OutputArea({
    model,
    rendermime: getRendermime(),
  });

  return { model, outputArea };
}
