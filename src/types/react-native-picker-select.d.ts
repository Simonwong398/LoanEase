declare module 'react-native-picker-select' {
  import { ReactNode } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';
  
  export interface Item {
    label: string;
    value: any;
    key?: string | number;
    color?: string;
    displayValue?: string;
  }

  export interface PickerSelectProps {
    onValueChange: (value: any, index: number) => void;
    items: Item[];
    value?: any;
    placeholder?: Item | {};
    disabled?: boolean;
    itemKey?: string | number;
    style?: {
      inputIOS?: StyleProp<TextStyle>;
      inputAndroid?: StyleProp<TextStyle>;
      inputIOSContainer?: StyleProp<ViewStyle>;
      inputAndroidContainer?: StyleProp<ViewStyle>;
      iconContainer?: StyleProp<ViewStyle>;
      placeholder?: StyleProp<TextStyle>;
      modalViewMiddle?: StyleProp<ViewStyle>;
      modalViewBottom?: StyleProp<ViewStyle>;
    };
    children?: ReactNode;
    useNativeAndroidPickerStyle?: boolean;
  }

  export default function RNPickerSelect(props: PickerSelectProps): JSX.Element;
} 