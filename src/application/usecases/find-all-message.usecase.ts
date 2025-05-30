import { Injectable } from '@nestjs/common';
import { Message } from 'src/domain/entities/message.entity';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';

@Injectable()
export class FindAllMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(status?: string): Promise<Message[]> {
    return this.messageRepository.findAll(status);
  }
}
