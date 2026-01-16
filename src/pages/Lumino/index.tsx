import LuminoWrapper from '@/components/LuminoWrapper';
import { useMemo } from 'react';
import ArticleWidget from './article';

function LuminoExample() {
  const article = useMemo(() => new ArticleWidget(), []);
  return <LuminoWrapper widget={article} />;
}

export default LuminoExample;
