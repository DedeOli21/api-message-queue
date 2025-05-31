import { MessageHistoryRepository } from 'src/infra/repositories/messageHistory.repository';
import { MessageHistory } from 'src/domain/entities/messageHistory.entity';
import { Repository } from 'typeorm';
import { MessageStatus } from 'src/shared/enum';

describe('MessageHistoryRepository', () => {
  let repo: MessageHistoryRepository;
  let mockTypeormRepo: jest.Mocked<Repository<MessageHistory>>;

  beforeEach(() => {
    mockTypeormRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    repo = new MessageHistoryRepository(mockTypeormRepo);
  });

  it('should save a message history', async () => {
    const historyToSave: Partial<MessageHistory> = {
      messageId: 'msg-1',
      status: MessageStatus.SUCCESS,
      error: undefined,
      timestamp: new Date(),
      retries: 0,
    };
    const savedHistory: MessageHistory = {
      id: 1,
      messageId: 'msg-1',
      status: MessageStatus.SUCCESS,
      error: undefined,
      timestamp: historyToSave.timestamp,
      retries: 0,
    };

    mockTypeormRepo.save.mockResolvedValue(savedHistory);

    const result = await repo.save(historyToSave as MessageHistory);
    expect(result).toEqual(savedHistory);
    expect(mockTypeormRepo.save).toHaveBeenCalledWith(historyToSave);
  });

  it('should find a message history by id', async () => {
    const historyId = 2;
    const expectedHistory: MessageHistory = {
      id: historyId,
      messageId: 'msg-2',
      status: MessageStatus.FAILED,
      error: 'err',
      timestamp: new Date(),
      retries: 1,
    };

    mockTypeormRepo.findOne.mockResolvedValue(expectedHistory);

    const found = await repo.findById(historyId);
    expect(found).toEqual(expectedHistory);
    expect(mockTypeormRepo.findOne).toHaveBeenCalledWith({ where: { id: historyId } });
  });

  it('should find all message histories (without filter)', async () => {
    const histories: MessageHistory[] = [
      {
        id: 3,
        messageId: 'msg-3',
        status: MessageStatus.SUCCESS,
        error: undefined,
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
    expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    expect(mockQueryBuilder.getMany).toHaveBeenCalled();
  });

  it('should find all message histories (with status filter)', async () => {
    const filterStatus = MessageStatus.FAILED;
    const histories: MessageHistory[] = [
      {
        id: 4,
        messageId: 'msg-4',
        status: filterStatus,
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

    const result = await repo.findAll(filterStatus);
    expect(result).toEqual(histories);
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('messageHistory.status = :status', { status: filterStatus });
    expect(mockQueryBuilder.getMany).toHaveBeenCalled();
  });
});
