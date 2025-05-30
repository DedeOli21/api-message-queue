import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';

@Injectable()
export class FindAllMessageUseCase {
  private readonly logger = new Logger(FindAllMessageUseCase.name);
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(status?: string): Promise<Message[]> {
    this.logger.log(`Finding all messages with status: ${status || 'all'}`);
    return this.messageRepository.findAll(status);
  }
}
