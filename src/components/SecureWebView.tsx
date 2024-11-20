import React, { useRef } from 'react';
import { WebView, WebViewProps, WebViewMessageEvent, WebViewErrorEvent } from 'react-native-webview';
import { securityManager } from '../utils/securityManager';
import { auditManager } from '../utils/auditManager';

interface SecureWebViewProps extends Omit<WebViewProps, 'onError'> {
  onError?: (error: Error) => void;
}

const SecureWebView = React.forwardRef<WebView, SecureWebViewProps>(({
  source,
  onMessage,
  onError,
  ...props
}, ref) => {
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      // 验证和清理接收到的消息
      const sanitizedData = securityManager.sanitizeInput(event.nativeEvent.data || '');
      const data = JSON.parse(sanitizedData);
      
      // 记录审计日志
      auditManager.logEvent({
        type: 'webview',
        action: 'message_received',
        status: 'success',
        details: { messageType: data.type },
      });

      onMessage?.(event);
    } catch (error) {
      console.error('WebView message error:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      
      auditManager.logEvent({
        type: 'webview',
        action: 'message_received',
        status: 'failure',
        details: { error: String(error) },
      });
    }
  };

  const injectedJavaScript = `
    // 防止 XSS
    window.addEventListener('message', function(event) {
      if (event.origin !== window.location.origin) {
        console.error('Invalid message origin');
        return;
      }
    });

    // 禁用危险的 API
    delete window.alert;
    delete window.confirm;
    delete window.prompt;
    delete window.open;
    delete window.eval;

    // 添加 CSP
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: gap: https://ssl.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
    document.head.appendChild(meta);

    // 添加 XSS 防护
    const xssFilter = {
      sanitize: function(str) {
        return str.replace(/[&<>"']/g, function(match) {
          const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          };
          return escape[match];
        });
      }
    };

    // 重写 postMessage
    const originalPostMessage = window.postMessage;
    window.postMessage = function(message) {
      if (typeof message === 'string') {
        message = xssFilter.sanitize(message);
      }
      originalPostMessage.apply(window, arguments);
    };

    true;
  `;

  return (
    <WebView
      ref={ref}
      source={source}
      onMessage={handleMessage}
      onError={(event: WebViewErrorEvent) => {
        const error = new Error(event.nativeEvent.description || 'WebView error');
        onError?.(error);
      }}
      injectedJavaScript={injectedJavaScript}
      {...securityManager.getWebViewConfig()}
      {...props}
    />
  );
});

SecureWebView.displayName = 'SecureWebView';

export default SecureWebView; 