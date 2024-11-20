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
const Scatter3DChart = ({ data, width = react_native_1.Dimensions.get('window').width - 32, height = 400, rotateSpeed = 0.5, onPointClick, }) => {
    const webViewRef = (0, react_1.useRef)(null);
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
    const handleMessage = (event) => {
        try {
            if (!event.nativeEvent.data) {
                throw new Error('Empty message data');
            }
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'pointClick' && onPointClick) {
                onPointClick(data[message.index]);
            }
        }
        catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };
    return (<react_native_1.View style={[styles.container, { width, height }]}>
      <react_native_webview_1.WebView ref={webViewRef} source={{ html: generateThreeJsCode() }} style={styles.webview} scrollEnabled={false} onMessage={handleMessage}/>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, overflow: 'hidden' }, theme_1.theme.shadows.medium),
    webview: {
        backgroundColor: 'transparent',
    },
});
exports.default = Scatter3DChart;
