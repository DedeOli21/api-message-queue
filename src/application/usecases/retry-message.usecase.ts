import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { MessageProcessorService } from '../services/message-processor.service';

const MAX_RETRIES = 3;
const PROCESSING_TIMEOUT_MS = 1500;

@Injectable()
export class RetryMessageUseCase {
  private readonly logger = new Logger(RetryMessageUseCase.name);

  constructor(
    private readonly messageProcessorService: MessageProcessorService,
  ) {}

  async execute(id: string): Promise<Message> {
    this.logger.log(`Attempting to retry message via use case [id=${id}]...`);
    try {
      return await this.messageProcessorService.retryFailedMessage(id);
    } catch (error) {
      this.logger.error(`Error during retry for message ${id}: ${error.message}`);
      if (error.message === 'Message not found for retry') {
        throw new NotFoundException(error.message);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST); 
    }
  }
}
