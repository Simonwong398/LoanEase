export class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export const ExportErrorCodes = {
  FILE_CREATION_FAILED: 'FILE_CREATION_FAILED',
  SHARE_FAILED: 'SHARE_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ExportErrorCode = typeof ExportErrorCodes[keyof typeof ExportErrorCodes]; 