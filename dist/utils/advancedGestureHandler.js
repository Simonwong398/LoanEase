"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedGestureHandler = void 0;
const react_native_1 = require("react-native");
class AdvancedGestureHandler {
    constructor(config) {
        this.config = config;
        this.lastTap = 0;
        this.initialRotation = 0;
        this.initialScale = 1;
        this.DOUBLE_TAP_DELAY = 300;
        this.LONG_PRESS_DELAY = 500;
        this.longPressTimeout = null;
    }
    createPanResponder() {
        const swipeConfig = Object.assign({ minDistance: 50, maxDuration: 250, direction: 'both' }, this.config.swipeConfig);
        let initialTouches = [];
        let lastRotation = 0;
        let lastScale = 1;
        return react_native_1.PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                var _a, _b;
                initialTouches = e.nativeEvent.touches;
                const now = Date.now();
                // 处理双击
                if (now - this.lastTap < this.DOUBLE_TAP_DELAY) {
                    (_b = (_a = this.config).onDoubleTap) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                this.lastTap = now;
                // 处理长按
                if (this.config.onLongPress) {
                    this.longPressTimeout = setTimeout(this.config.onLongPress, this.LONG_PRESS_DELAY);
                }
            },
            onPanResponderMove: (e, gestureState) => {
                const touches = e.nativeEvent.touches;
                // 处理拖动
                if (this.config.onPan) {
                    this.config.onPan(gestureState.dx, gestureState.dy);
                }
                // 处理双指手势
                if (touches.length === 2 && initialTouches.length === 2) {
                    // 计算缩放
                    const currentDistance = this.getDistance(touches);
                    const initialDistance = this.getDistance(initialTouches);
                    const scale = currentDistance / initialDistance;
                    if (this.config.onPinch && Math.abs(scale - lastScale) > 0.05) {
                        this.config.onPinch(scale);
                        lastScale = scale;
                    }
                    // 计算旋转
                    const currentRotation = this.getRotation(touches);
                    const initialRotation = this.getRotation(initialTouches);
                    const rotation = currentRotation - initialRotation;
                    if (this.config.onRotate && Math.abs(rotation - lastRotation) > 5) {
                        this.config.onRotate(rotation);
                        lastRotation = rotation;
                    }
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (this.longPressTimeout) {
                    clearTimeout(this.longPressTimeout);
                }
                // 处理滑动
                if (this.config.onSwipe) {
                    const { dx, dy, vx, vy } = gestureState;
                    const duration = gestureState.moveX ? Math.abs(dx / vx) : 0;
                    if (duration <= swipeConfig.maxDuration) {
                        if (swipeConfig.direction !== 'vertical' &&
                            Math.abs(dx) >= swipeConfig.minDistance) {
                            this.config.onSwipe(dx > 0 ? 'right' : 'left');
                        }
                        else if (swipeConfig.direction !== 'horizontal' &&
                            Math.abs(dy) >= swipeConfig.minDistance) {
                            this.config.onSwipe(dy > 0 ? 'down' : 'up');
                        }
                    }
                }
            },
            onPanResponderTerminate: () => {
                if (this.longPressTimeout) {
                    clearTimeout(this.longPressTimeout);
                }
            },
        });
    }
    getDistance(touches) {
        if (touches.length < 2)
            return 0;
        const dx = touches[1].pageX - touches[0].pageX;
        const dy = touches[1].pageY - touches[0].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    getRotation(touches) {
        if (touches.length < 2)
            return 0;
        const dx = touches[1].pageX - touches[0].pageX;
        const dy = touches[1].pageY - touches[0].pageY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
}
exports.AdvancedGestureHandler = AdvancedGestureHandler;
