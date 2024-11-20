declare module 'jspdf' {
  export interface TextOptionsLight {
    align?: 'left' | 'center' | 'right' | 'justify';
    baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging';
    angle?: number;
    rotationDirection?: 0 | 1;
    charSpace?: number;
    lineHeightFactor?: number;
    flags?: {
      noBOM: boolean;
      autoencode: boolean;
    };
    maxWidth?: number;
    renderingMode?: string;
  }

  export class jsPDF {
    constructor(options?: { orientation?: string; unit?: string; format?: string });
    text(text: string, x: number, y: number, options?: TextOptionsLight): jsPDF;
    setTextColor(r: number, g?: number, b?: number): jsPDF;
    setFontSize(size: number): jsPDF;
    addPage(): jsPDF;
    setEncryption(userPassword: string): jsPDF;
    save(filename: string): void;
  }
}

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    startY: number;
    head: string[][];
    body: string[][];
  }
  
  interface jsPDF {
    autoTable(options: AutoTableOptions): this;
    lastAutoTable: { finalY: number };
  }
} 