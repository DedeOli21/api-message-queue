import { Injectable } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';

@Injectable()
export class MessageRepository implements IMessageRepository {
  private messages: Message[] = [];

  async save(message: Message): Promise<Message> {
    this.messages.push(message);
    return message;
  }

  async update(message: Message): Promise<Message> {
    const idx = this.messages.findIndex((m) => m.id === message.id);
    if (idx !== -1) this.messages[idx] = message;
    return message;
  }

  async findById(id: string): Promise<Message | undefined> {
    return this.messages.find((m) => m.id === id);
  }

  async findAll(status?: string): Promise<Message[]> {
    return status
      ? this.messages.filter((m) => m.status === status)
      : this.messages;
  }
}
