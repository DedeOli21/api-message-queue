import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';

@Injectable()
export class FindByIdMessageUseCase {
  private readonly logger = new Logger(FindByIdMessageUseCase.name);
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<Message> {
    this.logger.log(`Finding message by ID: ${id}`);
    const msg = await this.messageRepository.findById(id);

    this.logger.debug(`Message found: ${msg ? msg.id : 'not found'}`);

    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }
}
