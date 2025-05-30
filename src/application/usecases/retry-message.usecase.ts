import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageStatus } from 'src/shared/enum';

@Injectable()
export class RetryMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<Message> {
    const msg = await this.messageRepository.findById(id);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.status !== MessageStatus.FAILED) throw new Error('Only failed messages can be retried');
    this._processMessage(id);
    return msg;
  }

  private async _processMessage(id: string) {
    const msg = await this.messageRepository.findById(id);
    if (!msg) return;
    msg.status = MessageStatus.PROCESSING;
    msg.updatedAt = new Date();
    await this.messageRepository.update(msg);

    setTimeout(async () => {
      const succeed = Math.random() > 0.5;
      if (succeed) {
        msg.status = MessageStatus.SUCCESS;
        msg.lastError = undefined;
      } else {
        msg.status = MessageStatus.FAILED;
        msg.lastError = 'Simulated error';
        msg.retries += 1;
      }
      msg.updatedAt = new Date();
      await this.messageRepository.update(msg);
    }, 1500);
  }
}
