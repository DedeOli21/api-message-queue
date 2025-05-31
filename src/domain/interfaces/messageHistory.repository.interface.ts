import { MessageHistory } from '../entities/messageHistory.entity';

export abstract class IMessageHistoryRepository {
  save: (payload: MessageHistory) => Promise<MessageHistory>;
  findById: (id: number) => Promise<MessageHistory | undefined>;
  findAll: (status?: string) => Promise<MessageHistory[]>;
}
