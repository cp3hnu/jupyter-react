import { Form, Input, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';

async function createNotebook(title: string): Promise<{ file: string } | null> {
  const res = await fetch('/local-api/notebooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create notebook');
  }

  const data = await res.json();
  const file = data?.data?.file;
  return typeof file === 'string' ? { file } : null;
}

export interface CreateNotebookModalProps {
  open: boolean;
  onCancel: () => void;
  onCreated?: (file: string) => void | Promise<void>;
}

const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  open,
  onCancel,
  onCreated,
}) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setConfirmLoading(false);
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const created = await createNotebook((values?.title || '').toString());
      if (!created) {
        message.error('Failed to create notebook');
        return;
      }

      message.success('Notebook created');
      onCancel();
      await onCreated?.(created.file);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title="新建 Notebook"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="创建"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="文件名">
          <Input placeholder="例如：MyNotebook（将自动保存为 .ipynb）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNotebookModal;
