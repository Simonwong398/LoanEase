import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../theme/theme';
import { PaymentMethod } from '../types/loan';

interface Loan3DChartProps {
  loan: PaymentMethod;
  width?: number;
  height?: number;
  rotateSpeed?: number;
}

const Loan3DChart: React.FC<Loan3DChartProps> = ({
  loan,
  width = Dimensions.get('window').width - 32,
  height = 300,
  rotateSpeed = 0.5,
}) => {
  const webViewRef = useRef<WebView>(null);

  // 生成Three.js代码
  const generateThreeJsCode = () => {
    const data = loan.schedule.map((item, index) => ({
      x: index,
      y: item.payment,
      z: item.remainingBalance / 1000, // 缩放到合适大小
    }));

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

            // 创建坐标轴
            const axesHelper = new THREE.AxesHelper(5);
            scene.add(axesHelper);

            // 创建数据点
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const color = new THREE.Color();

            ${data.map((point, i) => `
              vertices.push(${point.x / 10}, ${point.y / 1000}, ${point.z});
              color.setHSL(${i / data.length}, 1.0, 0.5);
              colors.push(color.r, color.g, color.b);
            `).join('\n')}

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
              size: 0.1,
              vertexColors: true,
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // 添加连线
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff });
            const lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute('position', geometry.attributes.position);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);

            camera.position.z = 5;

            function animate() {
              requestAnimationFrame(animate);
              points.rotation.y += ${rotateSpeed};
              line.rotation.y += ${rotateSpeed};
              renderer.render(scene, camera);
            }

            animate();

            // 添加交互
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };

            document.addEventListener('mousedown', (e) => {
              isDragging = true;
              previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            document.addEventListener('mousemove', (e) => {
              if (!isDragging) return;

              const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y,
              };

              points.rotation.y += deltaMove.x * 0.01;
              points.rotation.x += deltaMove.y * 0.01;
              line.rotation.y = points.rotation.y;
              line.rotation.x = points.rotation.x;

              previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            document.addEventListener('mouseup', () => {
              isDragging = false;
            });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateThreeJsCode() }}
        style={styles.webview}
        scrollEnabled={false}
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

export default Loan3DChart; 