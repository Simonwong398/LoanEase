declare module 'react-native-keychain' {
  interface Credentials {
    username: string;
    password: string;
    service?: string;
  }

  export function setGenericPassword(
    username: string,
    password: string,
    options?: { 
      accessControl?: string;
      accessible?: string;
      accessGroup?: string;
      service?: string;
    }
  ): Promise<boolean>;

  export function getGenericPassword(
    options?: { 
      service?: string;
      accessControl?: string;
    }
  ): Promise<Credentials | false>;

  export function resetGenericPassword(
    options?: { 
      service?: string;
    }
  ): Promise<boolean>;

  export function getAllGenericPasswordServices(): Promise<string[]>;

  export const ACCESSIBLE: {
    WHEN_UNLOCKED: string;
    AFTER_FIRST_UNLOCK: string;
    ALWAYS: string;
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
    ALWAYS_THIS_DEVICE_ONLY: string;
  };

  export const ACCESS_CONTROL: {
    USER_PRESENCE: string;
    BIOMETRY_ANY: string;
    BIOMETRY_CURRENT_SET: string;
    DEVICE_PASSCODE: string;
    APPLICATION_PASSWORD: string;
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: string;
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: string;
  };
} 