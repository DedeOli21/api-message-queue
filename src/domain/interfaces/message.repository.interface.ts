import { Message } from '../entities/message.entity';

export abstract class IMessageRepository {
  save: (message: Message) => Promise<Message>;
  update: (message: Message) => Promise<Message>;
  findById: (id: string) => Promise<Message | undefined>;
  findAll: (status?: string) => Promise<Message[]>;
}
