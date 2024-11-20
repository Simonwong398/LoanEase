declare module 'electron' {
  import { EventEmitter } from 'events';

  export class App extends EventEmitter {
    whenReady(): Promise<void>;
    on(event: string, listener: Function): this;
    quit(): void;
  }

  export class BrowserWindow {
    constructor(options: {
      width: number;
      height: number;
      webPreferences?: {
        nodeIntegration?: boolean;
        contextIsolation?: boolean;
      };
    });
    loadURL(url: string): Promise<void>;
    loadFile(path: string): Promise<void>;
    static getAllWindows(): BrowserWindow[];
  }

  export const app: App;
} 