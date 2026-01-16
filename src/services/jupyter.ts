import {
  KernelManager,
  ServerConnection,
  Session,
  SessionManager,
} from '@jupyterlab/services';

/**
 * 解析 Jupyter Server URL
 */
export function parseServerUrl(url: string): {
  baseUrl: string;
  token: string;
} {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token') || '';
    const baseUrl =
      `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(/\/$/, '');
    return { baseUrl, token };
  } catch (error) {
    throw new Error('Invalid server URL format');
  }
}

/**
 * 创建 ServerConnection 设置
 */
export function createServerSettings(
  baseUrl: string,
  token: string,
): ServerConnection.ISettings {
  // 确保 baseUrl 以 / 结尾（Jupyter Server 要求）
  const finalBaseUrl = !baseUrl.endsWith('/') ? baseUrl + '/' : baseUrl;

  const wsBase = finalBaseUrl.replace(/^http/, 'ws').replace(/^https/, 'wss');

  const settings = ServerConnection.makeSettings({
    baseUrl: finalBaseUrl,
    token: token || '',
    wsUrl: wsBase,
    appendToken: true,
  });

  return settings;
}

/**
 * 创建 Kernel 会话
 */
export async function createKernelSession(
  settings: ServerConnection.ISettings,
  kernelName: string = 'python3',
): Promise<Session.ISessionConnection> {
  // 创建 KernelManager
  const kernelManager = new KernelManager({ serverSettings: settings });

  // 创建 SessionManager
  const sessionManager = new SessionManager({
    serverSettings: settings,
    kernelManager,
  });

  // 创建新会话
  const session = await sessionManager.startNew({
    path: `notebook-${Date.now()}.ipynb`,
    type: 'notebook',
    name: '',
    kernel: {
      name: kernelName,
    },
  });

  return session;
}

/**
 * 执行代码并返回结果
 */
export async function executeCode(
  session: Session.ISessionConnection,
  code: string,
): Promise<{ outputs: any[]; execution_count: number | null }> {
  const kernel = session.kernel;
  if (!kernel) {
    throw new Error('Kernel not available');
  }

  return new Promise((resolve, reject) => {
    const outputs: any[] = [];
    let executionCount: number | null = null;

    const future = kernel.requestExecute({ code });

    future.onIOPub = (msg) => {
      const msgType = msg.header.msg_type;
      const content = msg.content as any;

      if (msgType === 'execute_result' || msgType === 'display_data') {
        outputs.push({
          output_type: msgType,
          data: content.data,
          metadata: content.metadata || {},
        });
      } else if (msgType === 'stream') {
        outputs.push({
          output_type: 'stream',
          name: content.name || 'stdout',
          text: content.text || '',
        });
      } else if (msgType === 'error') {
        outputs.push({
          output_type: 'error',
          ename: content.ename,
          evalue: content.evalue,
          traceback: content.traceback || [],
        });
      } else if (msgType === 'execute_input') {
        executionCount = content.execution_count;
      }
    };

    future.onReply = (msg) => {
      const content = msg.content as any;
      if (content.status === 'ok') {
        executionCount = content.execution_count;
      } else if (content.status === 'error') {
        reject(new Error(content.ename || 'Execution failed'));
      }
    };

    future.done
      .then(() => {
        resolve({ outputs, execution_count: executionCount });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 关闭会话
 */
export async function closeSession(
  session: Session.ISessionConnection,
): Promise<void> {
  await session.shutdown();
  session.dispose();
}
