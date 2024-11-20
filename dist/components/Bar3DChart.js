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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const SecureWebView_1 = __importDefault(require("./SecureWebView"));
const theme_1 = require("../theme/theme");
const Bar3DChart = ({ data, width = react_native_1.Dimensions.get('window').width - 32, height = 400, rotateSpeed = 0.5, onBarClick, }) => {
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

            // 创建柱状图
            const bars = new THREE.Group();
            ${data.map((item, i) => `
              const barGeometry${i} = new THREE.BoxGeometry(0.5, ${item.value}, 0.5);
              const barMaterial${i} = new THREE.MeshPhongMaterial({
                color: '${item.color || '#2196F3'}',
              });
              const bar${i} = new THREE.Mesh(barGeometry${i}, barMaterial${i});
              bar${i}.position.set(${i - data.length / 2}, ${item.value / 2}, 0);
              bar${i}.userData = {
                index: ${i},
                label: '${item.x}',
                value: ${item.value},
              };
              bars.add(bar${i});
            `).join('\n')}
            scene.add(bars);

            // 添加光源
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            camera.position.z = 10;
            camera.position.y = 5;
            camera.lookAt(0, 0, 0);

            // 添加交互
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            document.addEventListener('click', (event) => {
              mouse.x = (event.clientX / ${width}) * 2 - 1;
              mouse.y = -(event.clientY / ${height}) * 2 + 1;

              raycaster.setFromCamera(mouse, camera);
              const intersects = raycaster.intersectObjects(bars.children);

              if (intersects.length > 0) {
                const bar = intersects[0].object;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'barClick',
                  index: bar.userData.index,
                }));
              }
            });

            function animate() {
              requestAnimationFrame(animate);
              bars.rotation.y += ${rotateSpeed};
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
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'barClick' && onBarClick) {
                onBarClick(message.index);
            }
        }
        catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };
    return (<react_native_1.View style={[styles.container, { width, height }]}>
      <SecureWebView_1.default ref={webViewRef} source={{ html: generateThreeJsCode() }} style={styles.webview} scrollEnabled={false} onMessage={handleMessage} onError={(error) => {
            console.error('WebView error:', error);
        }}/>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, overflow: 'hidden' }, theme_1.theme.shadows.medium),
    webview: {
        backgroundColor: 'transparent',
    },
});
exports.default = Bar3DChart;
