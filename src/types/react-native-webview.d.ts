declare module 'react-native-webview' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp, NativeSyntheticEvent } from 'react-native';

  export interface WebViewNativeEvent {
    url: string;
    title: string;
    loading: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
    description?: string;
    data?: string;
  }

  export type WebViewMessageEvent = NativeSyntheticEvent<WebViewNativeEvent>;

  export interface WebViewErrorEvent extends NativeSyntheticEvent<WebViewNativeEvent> {
    nativeEvent: WebViewNativeEvent & {
      code: number;
      description: string;
    };
  }

  export interface WebViewProgressEvent {
    nativeEvent: {
      progress: number;
    };
  }

  export interface WebViewProps {
    source?: {
      uri?: string;
      html?: string;
      headers?: { [key: string]: string };
    };
    style?: StyleProp<ViewStyle>;
    scrollEnabled?: boolean;
    onError?: (event: WebViewErrorEvent) => void;
    onLoad?: () => void;
    onLoadEnd?: () => void;
    onLoadStart?: () => void;
    onLoadProgress?: (event: WebViewMessageEvent) => void;
    onMessage?: (event: WebViewMessageEvent) => void;
    injectedJavaScript?: string;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    allowsInlineMediaPlayback?: boolean;
    bounces?: boolean;
  }

  export class WebView extends Component<WebViewProps> {
    reload(): void;
    stopLoading(): void;
    goBack(): void;
    goForward(): void;
    injectJavaScript(script: string): void;
  }
} 