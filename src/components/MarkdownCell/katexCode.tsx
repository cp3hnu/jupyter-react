import katex from 'katex';
import 'katex/dist/katex.css';
import React from 'react';
import { getCodeString } from 'rehype-rewrite';

const KatexCode: React.FC<any> = ({ children, className, ...props }) => {
  if (typeof children === 'string' && /^\$\$(.*)\$\$/.test(children)) {
    const html = katex.renderToString(children.replace(/^\$\$(.*)\$\$/, '$1'), {
      throwOnError: false,
    });
    return (
      <code
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ background: 'transparent' }}
      />
    );
  }
  const code =
    props.node && props.node.children
      ? getCodeString(props.node.children)
      : children;
  if (
    typeof code === 'string' &&
    typeof className === 'string' &&
    /^language-katex/.test(className.toLocaleLowerCase())
  ) {
    const html = katex.renderToString(code, {
      throwOnError: false,
    });
    return (
      <code
        style={{ fontSize: '150%' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <code className={String(className)}>{children}</code>;
};

export default KatexCode;
