import { MessageHistoryRepository } from 'src/infra/repositories/messageHistory.repository';
import { MessageHistory } from 'src/domain/entities/messageHistory.entity';
import { Repository } from 'typeorm';
import { MessageStatus } from 'src/shared/enum';

describe('MessageHistoryRepository', () => {
  let repo: MessageHistoryRepository;
  let mockTypeormRepo: jest.Mocked<Repository<MessageHistory>>;

  beforeEach(() => {
    // Mock do TypeORM Repository
    mockTypeormRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    repo = new MessageHistoryRepository(mockTypeormRepo);
  });

  it('should save a message history', async () => {
    const history: MessageHistory = {
      id: '1',
      messageId: 'msg-1',
      status: MessageStatus.SUCCESS,
      error: null,
      timestamp: new Date(),
      retries: 0,
    };

    mockTypeormRepo.save.mockResolvedValue(history);

    const saved = await repo.save(history);
    expect(saved).toEqual(history);
    expect(mockTypeormRepo.save).toHaveBeenCalledWith(history);
  });

  it('should find a message history by id', async () => {
    const history: MessageHistory = {
      id: '2',
      messageId: 'msg-2',
      status: MessageStatus.FAILED,
      error: 'err',
      timestamp: new Date(),
      retries: 1,
    };

    mockTypeormRepo.findOne.mockResolvedValue(history);

    const found = await repo.findById('2');
    expect(found).toEqual(history);
    expect(mockTypeormRepo.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
  });

  it('should find all message histories (without filter)', async () => {
    const histories: MessageHistory[] = [
      {
        id: '3',
        messageId: 'msg-3',
        status: MessageStatus.SUCCESS,
        error: null,
        timestamp: new Date(),
        retries: 0,
      },
    ];

    const mockQueryBuilder = {
      getMany: jest.fn().mockResolvedValue(histories),
      where: jest.fn().mockReturnThis(),
    };
    mockTypeormRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    const all = await repo.findAll();
    expect(all).toEqual(histories);
    expect(mockTypeormRepo.createQueryBuilder).toHaveBeenCalledWith('messageHistory');
    expect(mockQueryBuilder.getMany).toHaveBeenCalled();
  });

  it('should find all message histories (with status filter)', async () => {
    const histories: MessageHistory[] = [
      {
        id: '4',
        messageId: 'msg-4',
        status: MessageStatus.FAILED,
        error: 'err',
        timestamp: new Date(),
        retries: 1,
      },
    ];

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(histories),
    };
    mockTypeormRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

    const result = await repo.findAll('FAILED');
    expect(result).toEqual(histories);
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('messageHistory.status = :status', { status: 'FAILED' });
    expect(mockQueryBuilder.getMany).toHaveBeenCalled();
  });
});
