import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageStatus } from 'src/shared/enum';

@Injectable()
export class RetryMessageUseCase {
  private readonly logger = new Logger(RetryMessageUseCase.name);

  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<Message> {
    const msg = await this.messageRepository.findById(id);
    if (!msg) {
      this.logger.warn(`Retry failed: Message not found [id=${id}]`);
      throw new NotFoundException('Message not found');
    }
    if (msg.status !== MessageStatus.FAILED) {
      this.logger.warn(
        `Retry failed: Message ${id} is not FAILED (current status: ${msg.status})`,
      );
      throw new Error('Only failed messages can be retried');
    }
    this.logger.log(`Retrying message [id=${id}]...`);
    this._processMessage(id);
    return msg;
  }

  private async _processMessage(id: string, attempt = 1) {
    const msg = await this.messageRepository.findById(id);
    if (!msg) {
      this.logger.warn(
        `Message not found on retry attempt ${attempt} [id=${id}]`,
      );
      return;
    }

    msg.status = MessageStatus.PROCESSING;
    msg.updatedAt = new Date();
    await this.messageRepository.update(msg);

    this.logger.log(
      `Processing retry for message [id=${msg.id}], attempt: ${attempt}`,
    );

    setTimeout(async () => {
      const succeed = Math.random() > 0.5;
      if (succeed) {
        msg.status = MessageStatus.SUCCESS;
        msg.lastError = undefined;
        this.logger.log(
          `Message retried successfully [id=${msg.id}] after ${attempt} attempt(s)`,
        );
      } else {
        msg.status = MessageStatus.FAILED;
        msg.lastError = 'Simulated error';
        msg.retries += 1;
        this.logger.warn(
          `Retry attempt FAILED for message [id=${msg.id}], attempt: ${attempt}, retries: ${msg.retries}`,
        );

        if (msg.retries < 3) {
          await this.messageRepository.update(msg);
          this.logger.log(
            `Retrying message again [id=${msg.id}], next attempt: ${attempt + 1}`,
          );
          this._processMessage(id, attempt + 1);
          return;
        } else {
          this.logger.error(
            `Message [id=${msg.id}] failed after ${msg.retries} retries. No more attempts.`,
          );
        }
      }
      msg.updatedAt = new Date();
      await this.messageRepository.update(msg);
    }, 1500);
  }
}
