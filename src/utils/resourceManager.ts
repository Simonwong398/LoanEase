type CleanupFunction = () => void | Promise<void>;

class ResourceManager {
  private static instance: ResourceManager;
  private cleanupFunctions: Set<CleanupFunction> = new Set();
  private isShuttingDown = false;

  private constructor() {
    this.setupShutdownHandlers();
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  private setupShutdownHandlers(): void {
    // 处理进程退出
    process.on('beforeExit', this.cleanup);
    process.on('SIGINT', this.cleanup);
    process.on('SIGTERM', this.cleanup);
    
    // 处理未捕获的错误
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception:', error);
      await this.cleanup();
      process.exit(1);
    });
    
    process.on('unhandledRejection', async (error) => {
      console.error('Unhandled Rejection:', error);
      await this.cleanup();
      process.exit(1);
    });
  }

  registerCleanup(cleanup: CleanupFunction): () => void {
    this.cleanupFunctions.add(cleanup);
    return () => this.cleanupFunctions.delete(cleanup);
  }

  private cleanup = async (): Promise<void> => {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('Starting cleanup...');

    for (const cleanup of this.cleanupFunctions) {
      try {
        await Promise.resolve(cleanup());
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    this.cleanupFunctions.clear();
    console.log('Cleanup completed');
  }
}

export const resourceManager = ResourceManager.getInstance(); 