import { MessageHistory } from 'src/domain/entities/messageHistory.entity';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';
import { Repository } from 'typeorm';

export class MessageHistoryRepository implements IMessageHistoryRepository {
  constructor(
    private readonly messageHistoryRepository: Repository<MessageHistory>,
  ) {}

  async save(messageHistory: MessageHistory): Promise<MessageHistory> {
    return this.messageHistoryRepository.save(messageHistory);
  }

  async findById(id: number): Promise<MessageHistory | undefined> {
    return this.messageHistoryRepository.findOne({ where: { id } });
  }

  async findAll(status?: string): Promise<MessageHistory[]> {
    const query =
      this.messageHistoryRepository.createQueryBuilder('messageHistory');

    if (status) {
      query.where('messageHistory.status = :status', { status });
    }

    return query.getMany();
  }
}
