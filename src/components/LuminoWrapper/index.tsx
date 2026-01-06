import { Widget } from '@lumino/widgets';
import { useEffect, useRef } from 'react';

function LuminoWrapper({ widget }: { widget: Widget }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    Widget.attach(widget, ref.current);

    return () => {
      widget.dispose();
    };
  }, [widget]);

  return <div ref={ref} />;
}

export default LuminoWrapper;
