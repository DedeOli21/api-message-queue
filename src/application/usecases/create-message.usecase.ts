import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageStatus } from 'src/shared/enum';
import { v4 as uuidv4 } from 'uuid';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';
import { MessageProcessorService } from '../services/message-processor.service';
import { MessageHistory } from 'src/domain/entities/messageHistory.entity';

@Injectable()
export class CreateMessageUseCase {
  private readonly logger = new Logger(CreateMessageUseCase.name);

  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
    private readonly messageProcessorService: MessageProcessorService,
  ) {}

  async execute(payload: string): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      content: payload,
      status: MessageStatus.PENDING,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.messageRepository.save(message);
    this.logger.log(`Message created: ${message.id} - "${message.content}"`);

    const initialHistory: Partial<MessageHistory> = {
      messageId: message.id,
      status: message.status,
      retries: message.retries,
    };
    await this.messageHistoryRepository.save(initialHistory as MessageHistory);

    this.messageProcessorService.process(message.id, 1);

    return message;
  }
}
