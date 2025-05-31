import { CreateMessageUseCase } from 'src/application/usecases/create-message.usecase';
import { MessageHistory } from 'src/domain/entities';
import { MessageRepository } from 'src/infra/repositories/message.repository';
import { MessageHistoryRepository } from 'src/infra/repositories/messageHistory.repository';
import { MessageStatus } from 'src/shared/enum';
import { MessageProcessorService } from 'src/application/services/message-processor.service';

describe('CreateMessageUseCase', () => {
  let useCase: CreateMessageUseCase;
  let repo: MessageRepository;
  let repoHistory: any;
  let mockMessageProcessorService: jest.Mocked<MessageProcessorService>;

  beforeEach(() => {
    repo = new MessageRepository();
    repoHistory = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
    }

    mockMessageProcessorService = {
      process: jest.fn(),
      retryFailedMessage: jest.fn(),
    } as any;

    useCase = new CreateMessageUseCase(repo, repoHistory, mockMessageProcessorService);
    jest.spyOn(useCase['logger'], 'error').mockImplementation(() => {});
    jest.spyOn(useCase['logger'], 'log').mockImplementation(() => {});
  });

  it('should create a message, save history, and call processor service', async () => {
    const payload = 'Test message';
    const message = await useCase.execute(payload);

    expect(message).toHaveProperty('id');
    expect(message.content).toBe(payload);
    expect(message.status).toBe(MessageStatus.PENDING);
    expect(message.retries).toBe(0);

    const allMessagesInRepo = await repo.findAll();
    expect(allMessagesInRepo.length).toBe(1);
    expect(allMessagesInRepo[0].content).toBe(payload);

    expect(repoHistory.save).toHaveBeenCalledWith(expect.objectContaining({
      messageId: message.id,
      status: MessageStatus.PENDING,
      retries: 0,
    }));

    expect(mockMessageProcessorService.process).toHaveBeenCalledWith(message.id, 1);
  });
});
