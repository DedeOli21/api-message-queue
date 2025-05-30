import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageStatus } from 'src/shared/enum';
import { v4 as uuidv4 } from 'uuid';
import {
  messageProcessedCounter,
  messageRetryCounter,
  messageProcessingDuration,
} from 'src/metrics/message.metrics';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';

@Injectable()
export class CreateMessageUseCase {
  private readonly logger = new Logger(CreateMessageUseCase.name);

  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
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

    await this.messageHistoryRepository.save({
      messageId: message.id,
      status: message.status,
      error: null,
      retries: message.retries,
    });

    this._processMessage(message.id);
    return message;
  }

  private async _processMessage(id: string, attempt = 1) {
    const msg = await this.messageRepository.findById(id);
    if (!msg) {
      this.logger.warn(`Message with id ${id} not found on attempt ${attempt}`);
      await this.messageHistoryRepository.save({
        messageId: id,
        status: 'NOT_FOUND',
        error: 'Message not found',
        retries: attempt - 1,
      });
      return;
    }

    msg.status = MessageStatus.PROCESSING;
    msg.updatedAt = new Date();
    await this.messageRepository.update(msg);

    await this.messageHistoryRepository.save({
      messageId: msg.id,
      status: msg.status,
      error: null,
      retries: msg.retries,
    });

    this.logger.log(`Processing message: ${msg.id}, attempt: ${attempt}`);

    const endTimer = messageProcessingDuration.startTimer({ id: msg.id });

    setTimeout(async () => {
      const succeed = Math.random() > 0.5;
      if (succeed) {
        msg.status = MessageStatus.SUCCESS;
        msg.lastError = undefined;
        messageProcessedCounter.inc({ status: 'SUCCESS' });
        this.logger.log(
          `Message processed with SUCCESS: ${msg.id} after ${attempt} attempt(s)`,
        );
        endTimer({ status: 'SUCCESS', id: msg.id });

        await this.messageHistoryRepository.save({
          messageId: msg.id,
          status: msg.status,
          error: null,
          retries: msg.retries,
        });

      } else {
        msg.status = MessageStatus.FAILED;
        msg.lastError = 'Simulated error';
        msg.retries += 1;
        messageProcessedCounter.inc({ status: 'FAILED' });
        messageRetryCounter.inc({ id: msg.id });
        this.logger.warn(
          `Message processing FAILED: ${msg.id}, attempt: ${attempt}, retries: ${msg.retries}`,
        );
        endTimer({ status: 'FAILED', id: msg.id });

        await this.messageHistoryRepository.save({
          messageId: msg.id,
          status: msg.status,
          error: msg.lastError,
          retries: msg.retries,
        });

        if (msg.retries < 3) {
          await this.messageRepository.update(msg);
          this.logger.log(
            `Retrying message: ${msg.id}, next attempt: ${attempt + 1}`,
          );
          this._processMessage(id, attempt + 1);
          return;
        } else {
          this.logger.error(
            `Message ${msg.id} failed after ${msg.retries} retries. No more attempts.`,
          );
        }
      }
      msg.updatedAt = new Date();
      await this.messageRepository.update(msg);
    }, 1500);
  }
}
