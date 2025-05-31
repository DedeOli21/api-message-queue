import { Injectable, Logger } from '@nestjs/common';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';
import { Message } from 'src/domain/entities/message.entity';
import { MessageHistory } from 'src/domain/entities/messageHistory.entity';
import { MessageStatus } from 'src/shared/enum';
import {
  messageProcessedCounter,
  messageRetryCounter,
  messageProcessingDuration,
} from 'src/metrics/message.metrics';

const MAX_RETRIES = 3;
const PROCESSING_TIMEOUT_MS = 1500;

@Injectable()
export class MessageProcessorService {
  private readonly logger = new Logger(MessageProcessorService.name);

  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
  ) {}

  public async process(messageId: string, initialAttempt = 1): Promise<void> {
    let attempt = initialAttempt;
    const msg = await this.messageRepository.findById(messageId);

    if (!msg) {
      this.logger.warn(
        `Message with id ${messageId} not found on attempt ${attempt}`,
      );
      await this.saveHistory(messageId, MessageStatus.FAILED, attempt -1, 'Message not found');
      return;
    }

    // Update status to PROCESSING before starting
    msg.status = MessageStatus.PROCESSING;
    msg.updatedAt = new Date();
    await this.messageRepository.update(msg);
    await this.saveHistory(msg.id, msg.status, msg.retries);

    this.logger.log(
      `Processing message: ${msg.id}, attempt: ${attempt}, current retries: ${msg.retries}`,
    );

    const endTimer = messageProcessingDuration.startTimer({ id: msg.id });

    // Simulating processing with setTimeout
    setTimeout(async () => {
      const succeed = Math.random() > 0.5; // Simulate success or failure

      if (succeed) {
        msg.status = MessageStatus.SUCCESS;
        msg.lastError = undefined;
        messageProcessedCounter.inc({ status: 'SUCCESS' });
        this.logger.log(
          `Message processed with SUCCESS: ${msg.id} after ${attempt} attempt(s) (total retries: ${msg.retries})`,
        );
        endTimer({ status: 'SUCCESS', id: msg.id });
        await this.saveHistory(msg.id, msg.status, msg.retries);
      } else {
        msg.status = MessageStatus.FAILED;
        msg.lastError = 'Simulated error during processing';
        // msg.retries was already incremented by the use case that called this, or should be handled carefully if this service manages retries count internally
        messageProcessedCounter.inc({ status: 'FAILED' });
        
        this.logger.warn(
          `Message processing FAILED: ${msg.id}, attempt: ${attempt}, retries: ${msg.retries}, error: ${msg.lastError}`,
        );
        endTimer({ status: 'FAILED', id: msg.id });
        await this.saveHistory(msg.id, msg.status, msg.retries, msg.lastError);

        // Logic for retrying is now outside this specific processing step
        // The caller (use case) will decide if a retry is needed and call this.process again.
      }
      msg.updatedAt = new Date();
      await this.messageRepository.update(msg); // Final update of message status
    }, PROCESSING_TIMEOUT_MS);
  }

  private async saveHistory(
    messageId: string,
    status: MessageStatus,
    retries: number,
    error?: string,
  ): Promise<void> {
    const historyEntry: Partial<MessageHistory> = {
      messageId,
      status,
      retries,
      error: error || undefined,
    };
    await this.messageHistoryRepository.save(historyEntry as MessageHistory);
  }

  public async retryFailedMessage(messageId: string): Promise<Message> {
    const msg = await this.messageRepository.findById(messageId);
    if (!msg) {
      this.logger.warn(`Retry failed: Message not found [id=${messageId}]`);
      throw new Error('Message not found for retry'); // Or specific NotFoundException
    }

    if (msg.status !== MessageStatus.FAILED) {
      this.logger.warn(
        `Retry failed: Message ${messageId} is not FAILED (current status: ${msg.status})`,
      );
      throw new Error('Only FAILED messages can be retried.');
    }
    
    if (msg.retries >= MAX_RETRIES) {
        this.logger.error(
            `Message ${msg.id} has reached max retries (${msg.retries}). No more attempts.`
        );
        throw new Error('Max retries reached for message.');
    }

    this.logger.log(`Attempting to retry message [id=${messageId}], current retries: ${msg.retries}`);
    
    msg.retries += 1; // Increment retry count before processing
    msg.lastError = undefined; // Clear last error before retry
    await this.messageRepository.update(msg); // Save incremented retry count

    messageRetryCounter.inc({ id: msg.id });
    this.process(messageId, msg.retries); // msg.retries is now the current attempt number for this processing cycle

    return msg; // Return the message as it was at the point of initiating retry
  }
} 