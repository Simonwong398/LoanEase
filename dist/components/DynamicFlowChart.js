"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_webview_1 = require("react-native-webview");
const theme_1 = require("../theme/theme");
const DynamicFlowChart = ({ nodes, edges, width = react_native_1.Dimensions.get('window').width - 32, height = 400, onNodeClick, }) => {
    const webViewRef = (0, react_1.useRef)(null);
    const generateMermaidCode = () => {
        const nodeDefinitions = nodes.map(node => {
            const shape = {
                start: '([Start])',
                end: '([End])',
                process: '[Process]',
                decision: '{Decision}',
            }[node.type];
            return `${node.id}${shape}${node.label}`;
        }).join('\n');
        const edgeDefinitions = edges.map(edge => `${edge.from} --> |${edge.label || ''}| ${edge.to}`).join('\n');
        return `
      graph TD
      ${nodeDefinitions}
      ${edgeDefinitions}
    `;
    };
    const generateHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body { margin: 0; }
          #flowchart { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="flowchart">
          <pre class="mermaid">
            ${generateMermaidCode()}
          </pre>
        </div>
        <script>
          mermaid.initialize({
            startOnLoad: true,
            theme: 'neutral',
            flowchart: {
              curve: 'basis',
              nodeSpacing: 50,
              rankSpacing: 50,
              padding: 15,
            },
          });

          document.addEventListener('click', (e) => {
            const node = e.target.closest('.node');
            if (node) {
              const nodeId = node.id;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'nodeClick',
                nodeId,
              }));
            }
          });
        </script>
      </body>
    </html>
  `;
    const handleMessage = (event) => {
        try {
            if (!event.nativeEvent.data) {
                throw new Error('Empty message data');
            }
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'nodeClick' && onNodeClick) {
                onNodeClick(message.nodeId);
            }
        }
        catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };
    return (<react_native_1.View style={[styles.container, { width, height }]}>
      <react_native_webview_1.WebView ref={webViewRef} source={{ html: generateHtml() }} style={styles.webview} scrollEnabled={false} onMessage={handleMessage} onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
        }}/>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, overflow: 'hidden' }, theme_1.theme.shadows.medium),
    webview: {
        backgroundColor: 'transparent',
    },
});
exports.default = DynamicFlowChart;
