import { Platform, ViewStyle, DimensionValue } from 'react-native';

interface CustomProcess extends NodeJS.Process {
  type?: string;
}

declare global {
  interface Window {
    process?: CustomProcess;
  }
}

export const isElectron = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    window.process &&
    (window.process as CustomProcess).type
  );
};

interface PlatformStyles {
  container: {
    maxWidth?: number;
    margin?: DimensionValue;
    paddingTop?: number;
  };
}

export const getPlatformSpecificStyles = (): PlatformStyles => {
  if (isElectron()) {
    return {
      container: {
        maxWidth: 1200,
        margin: 'auto' as DimensionValue,
      }
    };
  }
  
  return Platform.select({
    ios: {
      container: {
        paddingTop: 20,
      }
    },
    android: {
      container: {
        paddingTop: 0,
      }
    },
    default: {
      container: {
        paddingTop: 0,
      }
    }
  });
}; 