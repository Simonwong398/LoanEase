"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestureHandler = void 0;
const react_native_1 = require("react-native");
class GestureHandler {
    constructor(config) {
        this.config = config;
        this.lastTap = 0;
        this.DOUBLE_TAP_DELAY = 300;
        this.LONG_PRESS_DELAY = 500;
        this.longPressTimeout = null;
    }
    createPanResponder() {
        const swipeConfig = Object.assign({ minDistance: 50, maxDuration: 250, direction: 'both' }, this.config.swipeConfig);
        return react_native_1.PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                var _a, _b;
                const now = Date.now();
                if (now - this.lastTap < this.DOUBLE_TAP_DELAY) {
                    (_b = (_a = this.config).onDoubleTap) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                this.lastTap = now;
                if (this.config.onLongPress) {
                    this.longPressTimeout = setTimeout(this.config.onLongPress, this.LONG_PRESS_DELAY);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (this.longPressTimeout) {
                    clearTimeout(this.longPressTimeout);
                }
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
}
exports.GestureHandler = GestureHandler;
