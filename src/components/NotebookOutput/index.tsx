import { IOutput } from '@jupyterlab/nbformat';
import { useEffect, useMemo } from 'react';
import LuminoWrapper from '../LuminoWrapper';
import { createOutputArea } from './createOutputArea';

interface NotebookOutputProps {
  outputs: IOutput[];
  executionCount?: number;
}

function NotebookOutput(props: NotebookOutputProps) {
  const { outputs } = props;

  // OutputArea 只创建一次
  const { model, outputArea } = useMemo(() => createOutputArea(), []);

  // outputs 变化时，同步给 OutputAreaModel
  useEffect(() => {
    model.clear();

    outputs.forEach((output) => {
      model.add(output);
    });
  }, [outputs, model]);

  return <LuminoWrapper widget={outputArea} />;
}

export default NotebookOutput;
