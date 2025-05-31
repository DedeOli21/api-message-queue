import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageHistory } from 'src/domain/entities/messageHistory.entity';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export class MessageHistoryRepository implements IMessageHistoryRepository {
  constructor(
    @InjectRepository(MessageHistory)
    private readonly typeormRepository: Repository<MessageHistory>,
  ) {}

  async save(messageHistory: MessageHistory): Promise<MessageHistory> {
    return this.typeormRepository.save(messageHistory);
  }

  async findById(id: number): Promise<MessageHistory | undefined> {
    return this.typeormRepository.findOne({ where: { id } });
  }

  async findAll(status?: string): Promise<MessageHistory[]> {
    const query =
      this.typeormRepository.createQueryBuilder('messageHistory');

    if (status) {
      query.where('messageHistory.status = :status', { status });
    }

    return query.getMany();
  }
}
