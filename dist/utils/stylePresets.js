"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylePresets = exports.StylePresets = void 0;
const theme_1 = require("../theme/theme");
const mobileAdapter_1 = require("./mobileAdapter");
class StylePresets {
    constructor(adapter) {
        this.adapter = adapter;
    }
    // 卡片预设
    card(options) {
        var _a, _b;
        return this.adapter.createStyles({
            container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: this.adapter.scaleSpacing((_a = options === null || options === void 0 ? void 0 : options.padding) !== null && _a !== void 0 ? _a : 16), margin: this.adapter.scaleSpacing((_b = options === null || options === void 0 ? void 0 : options.margin) !== null && _b !== void 0 ? _b : 8) }, theme_1.theme.shadows[(options === null || options === void 0 ? void 0 : options.elevation) ? 'medium' : 'small']),
        });
    }
    // 列表项预设
    listItem(options) {
        var _a;
        return this.adapter.createStyles({
            container: {
                flexDirection: 'row',
                alignItems: 'center',
                height: this.adapter.scaleSize((_a = options === null || options === void 0 ? void 0 : options.height) !== null && _a !== void 0 ? _a : 56),
                paddingHorizontal: this.adapter.scaleSpacing(16),
                backgroundColor: theme_1.theme.colors.surface,
                borderBottomWidth: (options === null || options === void 0 ? void 0 : options.borderBottom) ? 1 : 0,
                borderBottomColor: theme_1.theme.colors.border,
            },
            title: {
                flex: 1,
                fontSize: this.adapter.scaleFontSize(16),
                color: theme_1.theme.colors.text.primary,
            },
            subtitle: {
                fontSize: this.adapter.scaleFontSize(14),
                color: theme_1.theme.colors.text.secondary,
            },
        });
    }
    // 表单预设
    form(options) {
        var _a;
        const spacing = (_a = options === null || options === void 0 ? void 0 : options.spacing) !== null && _a !== void 0 ? _a : 16;
        return this.adapter.createStyles({
            container: {
                padding: this.adapter.scaleSpacing(spacing),
            },
            field: {
                marginBottom: this.adapter.scaleSpacing(spacing),
            },
            label: {
                fontSize: this.adapter.scaleFontSize(14),
                color: theme_1.theme.colors.text.secondary,
                marginBottom: (options === null || options === void 0 ? void 0 : options.labelPosition) === 'top' ?
                    this.adapter.scaleSpacing(4) : 0,
            },
            input: {
                height: this.adapter.scaleSize(44),
                borderWidth: 1,
                borderColor: theme_1.theme.colors.border,
                borderRadius: theme_1.theme.borderRadius.sm,
                paddingHorizontal: this.adapter.scaleSpacing(12),
                fontSize: this.adapter.scaleFontSize(16),
                color: theme_1.theme.colors.text.primary,
            },
        });
    }
    // 按钮预设
    button(variant = 'primary') {
        return this.adapter.createStyles({
            container: {
                height: this.adapter.scaleSize(44),
                paddingHorizontal: this.adapter.scaleSpacing(16),
                borderRadius: theme_1.theme.borderRadius.sm,
                backgroundColor: variant === 'primary' ? theme_1.theme.colors.primary :
                    variant === 'secondary' ? theme_1.theme.colors.secondary :
                        'transparent',
                borderWidth: variant === 'outline' ? 1 : 0,
                borderColor: theme_1.theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
            },
            text: {
                fontSize: this.adapter.scaleFontSize(16),
                fontWeight: '600',
                color: variant === 'outline' ?
                    theme_1.theme.colors.primary :
                    theme_1.theme.colors.surface,
            },
        });
    }
    // 标题预设
    heading(level = 1) {
        const sizes = {
            1: 24,
            2: 20,
            3: 18,
            4: 16,
        };
        return this.adapter.createStyles({
            text: {
                fontSize: this.adapter.scaleFontSize(sizes[level]),
                fontWeight: level === 1 ? '700' : '600',
                color: theme_1.theme.colors.text.primary,
                marginBottom: this.adapter.scaleSpacing(level === 1 ? 16 : 12),
            },
        });
    }
    // 图表容器预设
    chart(options) {
        var _a, _b;
        return this.adapter.createStyles({
            container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: this.adapter.scaleSpacing((_a = options === null || options === void 0 ? void 0 : options.padding) !== null && _a !== void 0 ? _a : 16), aspectRatio: (_b = options === null || options === void 0 ? void 0 : options.aspectRatio) !== null && _b !== void 0 ? _b : 16 / 9 }, theme_1.theme.shadows.small),
            title: {
                fontSize: this.adapter.scaleFontSize(16),
                fontWeight: '600',
                color: theme_1.theme.colors.text.primary,
                marginBottom: this.adapter.scaleSpacing(12),
            },
        });
    }
    // 网格布局预设
    grid(columns = 2, spacing = 8) {
        return this.adapter.createStyles({
            container: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                margin: -this.adapter.scaleSpacing(spacing / 2),
            },
            item: {
                width: `${100 / columns}%`,
                padding: this.adapter.scaleSpacing(spacing / 2),
            },
        });
    }
    // 分割线预设
    divider(options) {
        var _a, _b;
        return this.adapter.createStyles({
            line: {
                height: 1,
                backgroundColor: (_a = options === null || options === void 0 ? void 0 : options.color) !== null && _a !== void 0 ? _a : theme_1.theme.colors.border,
                marginVertical: this.adapter.scaleSpacing((_b = options === null || options === void 0 ? void 0 : options.margin) !== null && _b !== void 0 ? _b : 8),
            },
        });
    }
    // 标签预设
    tag(variant = 'default') {
        const getColor = () => {
            switch (variant) {
                case 'success': return theme_1.theme.colors.success;
                case 'warning': return theme_1.theme.colors.warning;
                case 'error': return theme_1.theme.colors.error;
                default: return theme_1.theme.colors.primary;
            }
        };
        return this.adapter.createStyles({
            container: {
                backgroundColor: `${getColor()}20`,
                paddingHorizontal: this.adapter.scaleSpacing(8),
                paddingVertical: this.adapter.scaleSpacing(4),
                borderRadius: theme_1.theme.borderRadius.sm,
                alignSelf: 'flex-start',
            },
            text: {
                fontSize: this.adapter.scaleFontSize(12),
                color: getColor(),
                fontWeight: '500',
            },
        });
    }
}
exports.StylePresets = StylePresets;
// 创建一个默认实例
exports.stylePresets = new StylePresets(new mobileAdapter_1.MobileAdapter());
