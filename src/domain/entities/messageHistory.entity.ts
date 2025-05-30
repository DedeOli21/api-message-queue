import { MessageStatus } from 'src/shared/enum';

export class MessageHistory {
  id: string;
  messageId: string;
  status: MessageStatus;
  error?: string;
  timestamp: Date;
  retries: number;
}
