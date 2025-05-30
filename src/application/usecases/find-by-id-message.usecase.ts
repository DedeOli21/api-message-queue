import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';

@Injectable()
export class FindByIdMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<Message> {
    const msg = await this.messageRepository.findById(id);
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }
}
