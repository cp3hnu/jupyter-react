import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { EditorContext } from '@uiw/react-md-editor';
import { useContext } from 'react';

const PreviewButton = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const click = () => {
    dispatch?.({
      preview: preview === 'edit' ? 'live' : 'edit',
    });
  };
  if (preview === 'edit') {
    return <EyeOutlined onClick={click} style={{ marginRight: 8 }} />;
  }
  return <EyeInvisibleOutlined onClick={click} style={{ marginRight: 8 }} />;
};

export const codePreview = {
  name: 'preview',
  keyCommand: 'preview',
  value: 'edit',
  icon: <PreviewButton />,
};
