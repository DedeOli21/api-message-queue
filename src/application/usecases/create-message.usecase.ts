import { Injectable } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { CreateMessageDto } from 'src/presentation/controllers/dto/create-message.dto';
import { MessageStatus } from 'src/shared/enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateMessageUseCase {
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
    this._processMessage(message.id); // simula processamento assíncrono
    return message;
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
