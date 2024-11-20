import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, NativeSyntheticEvent } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { theme } from '../theme/theme';

interface DataPoint {
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
  label?: string;
}

interface Scatter3DChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  rotateSpeed?: number;
  onPointClick?: (point: DataPoint) => void;
}

const Scatter3DChart: React.FC<Scatter3DChartProps> = ({
  data,
  width = Dimensions.get('window').width - 32,
  height = 400,
  rotateSpeed = 0.5,
  onPointClick,
}) => {
  const webViewRef = useRef<WebView>(null);

  const generateThreeJsCode = () => {
    return `
      <html>
        <head>
          <style>
            body { margin: 0; }
            canvas { width: 100%; height: 100%; }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        </head>
        <body>
          <script>
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, ${width}/${height}, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(${width}, ${height});
            document.body.appendChild(renderer.domElement);

            // 添加坐标轴
            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);

            // 创建数据点
            const points = new THREE.Group();
            ${data.map((point, i) => `
              const geometry${i} = new THREE.SphereGeometry(${point.size || 0.1}, 32, 32);
              const material${i} = new THREE.MeshBasicMaterial({
                color: '${point.color || '#2196F3'}',
              });
              const sphere${i} = new THREE.Mesh(geometry${i}, material${i});
              sphere${i}.position.set(${point.x}, ${point.y}, ${point.z});
              sphere${i}.userData = {
                index: ${i},
                label: '${point.label || ''}',
              };
              points.add(sphere${i});
            `).join('\n')}
            scene.add(points);

            camera.position.z = 5;

            // 添加交互
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            document.addEventListener('click', (event) => {
              mouse.x = (event.clientX / ${width}) * 2 - 1;
              mouse.y = -(event.clientY / ${height}) * 2 + 1;

              raycaster.setFromCamera(mouse, camera);
              const intersects = raycaster.intersectObjects(points.children);

              if (intersects.length > 0) {
                const point = intersects[0].object;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pointClick',
                  index: point.userData.index,
                }));
              }
            });

            function animate() {
              requestAnimationFrame(animate);
              points.rotation.y += ${rotateSpeed};
              renderer.render(scene, camera);
            }

            animate();
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      if (!event.nativeEvent.data) {
        throw new Error('Empty message data');
      }
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'pointClick' && onPointClick) {
        onPointClick(data[message.index]);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateThreeJsCode() }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
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

export default Scatter3DChart; 