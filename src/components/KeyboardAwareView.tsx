import React, { useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  Platform,
  StyleSheet,
  ViewStyle,
  EmitterSubscription,
} from 'react-native';

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /**
   * 键盘弹出时是否自动调整布局
   * @default true
   */
  enabled?: boolean;
  /**
   * 额外的偏移量
   * @default 0
   */
  extraOffset?: number;
}

/**
 * 键盘感知视图组件
 * 自动处理键盘弹出/收起时的布局调整
 */
const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  style,
  enabled = true,
  extraOffset = 0,
}) => {
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [keyboardShow, setKeyboardShow] = useState(false);

  useEffect(() => {
    let keyboardWillShowSub: EmitterSubscription;
    let keyboardWillHideSub: EmitterSubscription;
    let keyboardDidShowSub: EmitterSubscription;
    let keyboardDidHideSub: EmitterSubscription;

    if (enabled) {
      if (Platform.OS === 'ios') {
        keyboardWillShowSub = Keyboard.addListener(
          'keyboardWillShow',
          onKeyboardShow
        );
        keyboardWillHideSub = Keyboard.addListener(
          'keyboardWillHide',
          onKeyboardHide
        );
      } else {
        keyboardDidShowSub = Keyboard.addListener(
          'keyboardDidShow',
          onKeyboardShow
        );
        keyboardDidHideSub = Keyboard.addListener(
          'keyboardDidHide',
          onKeyboardHide
        );
      }
    }

    return () => {
      if (enabled) {
        if (Platform.OS === 'ios') {
          keyboardWillShowSub?.remove();
          keyboardWillHideSub?.remove();
        } else {
          keyboardDidShowSub?.remove();
          keyboardDidHideSub?.remove();
        }
      }
    };
  }, [enabled]);

  const onKeyboardShow = (event: KeyboardEvent) => {
    if (!enabled) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setKeyboardSpace(event.endCoordinates.height + extraOffset);
    setKeyboardShow(true);
  };

  const onKeyboardHide = () => {
    if (!enabled) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setKeyboardSpace(0);
    setKeyboardShow(false);
  };

  return (
    <View style={[styles.container, style]}>
      {children}
      {keyboardShow && <View style={{ height: keyboardSpace }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default KeyboardAwareView; 