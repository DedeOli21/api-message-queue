import { MessageHistory } from '../entities/messageHistory.entity';

export abstract class IMessageHistoryRepository {
  save: (payload: any) => Promise<MessageHistory>;
  findById: (id: string) => Promise<MessageHistory | undefined>;
  findAll: () => Promise<MessageHistory[]>;
}
