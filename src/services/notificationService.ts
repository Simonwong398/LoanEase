import { NotificationType } from '../models/notification';

export class NotificationService {
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      // 实现通知发送逻辑
    } catch (error) {
      throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 