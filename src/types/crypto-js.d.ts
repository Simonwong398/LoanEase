declare module 'crypto-js' {
  interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: Encoder): string;
    concat(wordArray: WordArray): WordArray;
    clamp(): void;
    clone(): WordArray;
  }

  interface Encoder {
    parse(str: string): WordArray;
    stringify(wordArray: WordArray): string;
  }

  interface CipherParams {
    ciphertext: WordArray;
    key: WordArray;
    iv: WordArray;
    salt: WordArray;
    algorithm: any;
    mode: any;
    padding: any;
    blockSize: number;
    formatter: any;
    toString(formatter?: any): string;
  }

  interface Hasher {
    reset(): Hasher;
    update(messageUpdate: WordArray | string): Hasher;
    finalize(messageUpdate?: WordArray | string): WordArray;
  }

  const lib: {
    WordArray: {
      random(nBytes: number): WordArray;
      create(words?: number[], sigBytes?: number): WordArray;
    };
    Cipher: any;
    CipherParams: any;
    Hasher: any;
  };

  const enc: {
    Hex: Encoder;
    Latin1: Encoder;
    Utf8: Encoder;
    Utf16: Encoder;
    Utf16BE: Encoder;
    Utf16LE: Encoder;
    Base64: Encoder;
  };

  const mode: {
    CBC: any;
    CFB: any;
    CTR: any;
    OFB: any;
    ECB: any;
  };

  const pad: {
    Pkcs7: any;
    AnsiX923: any;
    Iso10126: any;
    Iso97971: any;
    ZeroPadding: any;
    NoPadding: any;
  };

  function AES(config?: any): any;
  namespace AES {
    function encrypt(message: string | WordArray, key: string | WordArray, cfg?: any): CipherParams;
    function decrypt(ciphertext: string | CipherParams, key: string | WordArray, cfg?: any): WordArray;
  }

  function SHA256(message: string | WordArray): WordArray;
  function SHA512(message: string | WordArray): WordArray;
  function MD5(message: string | WordArray): WordArray;

  function PBKDF2(
    password: string | WordArray,
    salt: string | WordArray,
    cfg?: {
      keySize?: number;
      iterations?: number;
      hasher?: typeof SHA256 | typeof SHA512 | typeof MD5;
    }
  ): WordArray;
} 