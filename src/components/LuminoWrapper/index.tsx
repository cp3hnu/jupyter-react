import { Widget } from '@lumino/widgets';
import { useEffect, useRef } from 'react';

function LuminoWrapper({ widget }: { widget: Widget }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    try {
      Widget.attach(widget, ref.current);
    } catch (e) {
      console.warn('Exception while attaching Lumino widget.', e);
    }

    return () => {
      try {
        if (widget.isAttached || widget.node.isConnected) {
          widget.dispose();
          Widget.detach(widget);
        }
      } catch (e) {
        console.debug('Exception while detaching Lumino widget.', e);
      }
    };
  }, [widget]);

  return <div ref={ref} />;
}

export default LuminoWrapper;
