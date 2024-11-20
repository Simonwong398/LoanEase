export interface NotificationService {
  sendNotification(userId: string, type: string, data: Record<string, unknown>): Promise<void>;
}

export class DefaultNotificationService implements NotificationService {
  async sendNotification(
    userId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    // 实现通知发送逻辑
  }
} 