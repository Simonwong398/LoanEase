import { StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { MobileAdapter } from './mobileAdapter';

export class StylePresets {
  private adapter: MobileAdapter;

  constructor(adapter: MobileAdapter) {
    this.adapter = adapter;
  }

  // 卡片预设
  card(options?: {
    padding?: number;
    margin?: number;
    elevation?: number;
  }) {
    return this.adapter.createStyles({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: this.adapter.scaleSpacing(options?.padding ?? 16),
        margin: this.adapter.scaleSpacing(options?.margin ?? 8),
        ...theme.shadows[options?.elevation ? 'medium' : 'small'],
      },
    });
  }

  // 列表项预设
  listItem(options?: {
    height?: number;
    borderBottom?: boolean;
  }) {
    return this.adapter.createStyles({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: this.adapter.scaleSize(options?.height ?? 56),
        paddingHorizontal: this.adapter.scaleSpacing(16),
        backgroundColor: theme.colors.surface,
        borderBottomWidth: options?.borderBottom ? 1 : 0,
        borderBottomColor: theme.colors.border,
      },
      title: {
        flex: 1,
        fontSize: this.adapter.scaleFontSize(16),
        color: theme.colors.text.primary,
      },
      subtitle: {
        fontSize: this.adapter.scaleFontSize(14),
        color: theme.colors.text.secondary,
      },
    });
  }

  // 表单预设
  form(options?: {
    spacing?: number;
    labelPosition?: 'top' | 'left';
  }) {
    const spacing = options?.spacing ?? 16;
    return this.adapter.createStyles({
      container: {
        padding: this.adapter.scaleSpacing(spacing),
      },
      field: {
        marginBottom: this.adapter.scaleSpacing(spacing),
      },
      label: {
        fontSize: this.adapter.scaleFontSize(14),
        color: theme.colors.text.secondary,
        marginBottom: options?.labelPosition === 'top' ? 
          this.adapter.scaleSpacing(4) : 0,
      },
      input: {
        height: this.adapter.scaleSize(44),
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: this.adapter.scaleSpacing(12),
        fontSize: this.adapter.scaleFontSize(16),
        color: theme.colors.text.primary,
      },
    });
  }

  // 按钮预设
  button(variant: 'primary' | 'secondary' | 'outline' = 'primary') {
    return this.adapter.createStyles({
      container: {
        height: this.adapter.scaleSize(44),
        paddingHorizontal: this.adapter.scaleSpacing(16),
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 
          variant === 'primary' ? theme.colors.primary :
          variant === 'secondary' ? theme.colors.secondary :
          'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      },
      text: {
        fontSize: this.adapter.scaleFontSize(16),
        fontWeight: '600',
        color: variant === 'outline' ? 
          theme.colors.primary : 
          theme.colors.surface,
      },
    });
  }

  // 标题预设
  heading(level: 1 | 2 | 3 | 4 = 1) {
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
        color: theme.colors.text.primary,
        marginBottom: this.adapter.scaleSpacing(level === 1 ? 16 : 12),
      },
    });
  }

  // 图表容器预设
  chart(options?: {
    aspectRatio?: number;
    padding?: number;
  }) {
    return this.adapter.createStyles({
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: this.adapter.scaleSpacing(options?.padding ?? 16),
        aspectRatio: options?.aspectRatio ?? 16/9,
        ...theme.shadows.small,
      },
      title: {
        fontSize: this.adapter.scaleFontSize(16),
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: this.adapter.scaleSpacing(12),
      },
    });
  }

  // 网格布局预设
  grid(columns: number = 2, spacing: number = 8) {
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
  divider(options?: {
    margin?: number;
    color?: string;
  }) {
    return this.adapter.createStyles({
      line: {
        height: 1,
        backgroundColor: options?.color ?? theme.colors.border,
        marginVertical: this.adapter.scaleSpacing(options?.margin ?? 8),
      },
    });
  }

  // 标签预设
  tag(variant: 'default' | 'success' | 'warning' | 'error' = 'default') {
    const getColor = () => {
      switch (variant) {
        case 'success': return theme.colors.success;
        case 'warning': return theme.colors.warning;
        case 'error': return theme.colors.error;
        default: return theme.colors.primary;
      }
    };

    return this.adapter.createStyles({
      container: {
        backgroundColor: `${getColor()}20`,
        paddingHorizontal: this.adapter.scaleSpacing(8),
        paddingVertical: this.adapter.scaleSpacing(4),
        borderRadius: theme.borderRadius.sm,
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

// 创建一个默认实例
export const stylePresets = new StylePresets(new MobileAdapter()); 