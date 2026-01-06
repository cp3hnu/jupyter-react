import { parseServerUrl } from '@/utils/jupyter';
import { Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';

interface ServerConnectionDialogProps {
  visible: boolean;
  onOk: (baseUrl: string, token: string) => void;
  onCancel: () => void;
  defaultUrl?: string;
}

const ServerConnectionDialog: React.FC<ServerConnectionDialogProps> = ({
  visible,
  onOk,
  onCancel,
  defaultUrl = '',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const url = values.url.trim();

      if (!url) {
        message.error('请输入服务器地址');
        return;
      }

      setLoading(true);
      const { baseUrl, token } = parseServerUrl(url);
      onOk(baseUrl, token);
      form.resetFields();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== 'Invalid server URL format'
      ) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="连接 Jupyter Server"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="连接"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={{ url: defaultUrl }}>
        <Form.Item
          name="url"
          label="服务器地址"
          rules={[
            { required: true, message: '请输入服务器地址' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                try {
                  parseServerUrl(value);
                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error('无效的服务器地址格式'));
                }
              },
            },
          ]}
          help="例如: http://localhost:8889/?token=your_token"
        >
          <Input
            placeholder="http://localhost:8889/?token=your_token"
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServerConnectionDialog;
