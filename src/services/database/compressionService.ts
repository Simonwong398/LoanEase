import { createGzip, createGunzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  duration: number;
}

export class CompressionService {
  // 压缩数据
  async compress(data: Buffer): Promise<{ compressed: Buffer; stats: CompressionStats }> {
    const startTime = Date.now();
    const originalSize = data.length;

    try {
      const compressed = await this.gzipCompress(data);
      const duration = Date.now() - startTime;

      const stats: CompressionStats = {
        originalSize,
        compressedSize: compressed.length,
        compressionRatio: compressed.length / originalSize,
        duration
      };

      return { compressed, stats };
    } catch (error) {
      throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 解压数据
  async decompress(compressed: Buffer): Promise<Buffer> {
    try {
      return await this.gzipDecompress(compressed);
    } catch (error) {
      throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async gzipCompress(data: Buffer): Promise<Buffer> {
    const chunks: Buffer[] = [];
    await pipelineAsync(
      Buffer.from(data),
      createGzip(),
      async function* (source) {
        for await (const chunk of source) {
          chunks.push(Buffer.from(chunk));
        }
      }
    );
    return Buffer.concat(chunks);
  }

  private async gzipDecompress(compressed: Buffer): Promise<Buffer> {
    const chunks: Buffer[] = [];
    await pipelineAsync(
      Buffer.from(compressed),
      createGunzip(),
      async function* (source) {
        for await (const chunk of source) {
          chunks.push(Buffer.from(chunk));
        }
      }
    );
    return Buffer.concat(chunks);
  }
} 