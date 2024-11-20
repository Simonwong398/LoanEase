"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_webview_1 = require("react-native-webview");
const securityManager_1 = require("../utils/securityManager");
const auditManager_1 = require("../utils/auditManager");
const SecureWebView = react_1.default.forwardRef((_a, ref) => {
    var { source, onMessage, onError } = _a, props = __rest(_a, ["source", "onMessage", "onError"]);
    const handleMessage = (event) => {
        try {
            // 验证和清理接收到的消息
            const sanitizedData = securityManager_1.securityManager.sanitizeInput(event.nativeEvent.data || '');
            const data = JSON.parse(sanitizedData);
            // 记录审计日志
            auditManager_1.auditManager.logEvent({
                type: 'webview',
                action: 'message_received',
                status: 'success',
                details: { messageType: data.type },
            });
            onMessage === null || onMessage === void 0 ? void 0 : onMessage(event);
        }
        catch (error) {
            console.error('WebView message error:', error);
            onError === null || onError === void 0 ? void 0 : onError(error instanceof Error ? error : new Error(String(error)));
            auditManager_1.auditManager.logEvent({
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
    return (<react_native_webview_1.WebView ref={ref} source={source} onMessage={handleMessage} onError={(event) => {
            const error = new Error(event.nativeEvent.description || 'WebView error');
            onError === null || onError === void 0 ? void 0 : onError(error);
        }} injectedJavaScript={injectedJavaScript} {...securityManager_1.securityManager.getWebViewConfig()} {...props}/>);
});
SecureWebView.displayName = 'SecureWebView';
exports.default = SecureWebView;
