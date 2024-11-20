declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export interface WorkSheet {
    [key: string]: any;
  }

  export interface Utils {
    book_new(): WorkBook;
    aoa_to_sheet(data: any[][]): WorkSheet;
    book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name: string): void;
  }

  export const utils: Utils;
  export function writeFile(workbook: WorkBook, filename: string): void;
} 