import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageStatus } from 'src/shared/enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateMessageUseCase {
  private readonly logger = new Logger(CreateMessageUseCase.name);

  constructor(private readonly messageRepository: IMessageRepository) {}

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

    this._processMessage(message.id);
    return message;
  }

  private async _processMessage(id: string, attempt = 1) {
    const msg = await this.messageRepository.findById(id);
    if (!msg) {
      this.logger.warn(`Message with id ${id} not found on attempt ${attempt}`);
      return;
    }

    msg.status = MessageStatus.PROCESSING;
    msg.updatedAt = new Date();
    await this.messageRepository.update(msg);

    this.logger.log(`Processing message: ${msg.id}, attempt: ${attempt}`);

    setTimeout(async () => {
      const succeed = Math.random() > 0.5;
      if (succeed) {
        msg.status = MessageStatus.SUCCESS;
        msg.lastError = undefined;
        this.logger.log(
          `Message processed with SUCCESS: ${msg.id} after ${attempt} attempt(s)`,
        );
      } else {
        msg.status = MessageStatus.FAILED;
        msg.lastError = 'Simulated error';
        msg.retries += 1;
        this.logger.warn(
          `Message processing FAILED: ${msg.id}, attempt: ${attempt}, retries: ${msg.retries}`,
        );

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
