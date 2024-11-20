declare module 'react-native-fs' {
  export interface StatResult {
    size: number;
    isFile: () => boolean;
    isDirectory: () => boolean;
    mtime: string;
    ctime: string;
  }

  export interface ReadDirItem {
    name: string;
    path: string;
    size: number;
    isFile: () => boolean;
    isDirectory: () => boolean;
    mtime: string;
    ctime: string;
  }

  export const DocumentDirectoryPath: string;
  export const ExternalDirectoryPath: string;

  export function writeFile(
    filepath: string,
    contents: string,
    encoding?: string
  ): Promise<void>;

  export function readFile(
    filepath: string,
    encoding?: string
  ): Promise<string>;

  export function exists(filepath: string): Promise<boolean>;

  export function unlink(filepath: string): Promise<void>;

  export function readDir(dirpath: string): Promise<ReadDirItem[]>;

  export function stat(filepath: string): Promise<StatResult>;
} 