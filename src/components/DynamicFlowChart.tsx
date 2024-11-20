import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, NativeSyntheticEvent } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { theme } from '../theme/theme';

interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'end' | 'process' | 'decision';
  position?: { x: number; y: number };
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface DynamicFlowChartProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
}

const DynamicFlowChart: React.FC<DynamicFlowChartProps> = ({
  nodes,
  edges,
  width = Dimensions.get('window').width - 32,
  height = 400,
  onNodeClick,
}) => {
  const webViewRef = useRef<WebView>(null);

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

    const edgeDefinitions = edges.map(edge => 
      `${edge.from} --> |${edge.label || ''}| ${edge.to}`
    ).join('\n');

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

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      if (!event.nativeEvent.data) {
        throw new Error('Empty message data');
      }
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'nodeClick' && onNodeClick) {
        onNodeClick(message.nodeId);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateHtml() }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

export default DynamicFlowChart; 