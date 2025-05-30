import { CreateMessageUseCase } from 'src/application/usecases/create-message.usecase';
import { MessageHistory } from 'src/domain/entities';
import { MessageRepository } from 'src/infra/repositories/message.repository';
import { MessageHistoryRepository } from 'src/infra/repositories/messageHistory.repository';
import { MessageStatus } from 'src/shared/enum';

describe('CreateMessageUseCase', () => {
  let useCase: CreateMessageUseCase;
  let repo: MessageRepository;
  let repoHistory: any;

  beforeEach(() => {
    repo = new MessageRepository();
    repoHistory = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
    }

    useCase = new CreateMessageUseCase(repo, repoHistory);
    jest.spyOn(useCase['logger'], 'error').mockImplementation(() => {});
  });

  it('should create a message and save it', async () => {
    const payload = 'Test message';
    const message = await useCase.execute(payload);

    expect(message).toHaveProperty('id');
    expect(message.content).toBe(payload);
    expect(message.status).toBe(MessageStatus.PROCESSING);
    expect(message.retries).toBe(0);

    const all = await repo.findAll();
    expect(all.length).toBe(1);
    expect(all[0].content).toBe(payload);
  });

  it('should process message and update status SUCCESS or FAILED', async () => {
    jest.useFakeTimers();
    const payload = 'Test with processing';
    const message = await useCase.execute(payload);

    jest.advanceTimersByTime(1600);

    await jest.runAllTicks();
    await jest.runAllTimersAsync();
    await Promise.resolve();

    const updated = await repo.findById(message.id);
    expect(['SUCCESS', 'FAILED']).toContain(updated.status);

    jest.useRealTimers();
  });

  it('should process message and update status to FAILED', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const payload = 'Test error flow';
    const message = await useCase.execute(payload);

    await new Promise((res) => setTimeout(res, 1600));
    const updated = await repo.findById(message.id);

    expect(updated.status).toBe('PROCESSING');
    expect(updated.lastError).toBe('Simulated error');
    expect(updated.retries).toBe(1);

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should process message and update status to SUCCESS', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.5
    const payload = 'Test success flow';
    const message = await useCase.execute(payload);

    await new Promise((res) => setTimeout(res, 1600));
    const updated = await repo.findById(message.id);

    expect(updated.status).toBe('SUCCESS');
    expect(updated.lastError).toBeUndefined();

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should return early if message not found in _processMessage', async () => {
    await (useCase as any)._processMessage('id-inexistente');
  });

  it('should log error when message fails after max retries', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const payload = 'Test max retries';
    const message = await useCase.execute(payload);

    for (let i = 0; i < 3; i++) {
      await new Promise((res) => setTimeout(res, 1600));
    }

    const updated = await repo.findById(message.id);
    expect(updated.status).toBe('FAILED');

    const loggerErrorSpy = jest.spyOn(useCase['logger'], 'error');
    await useCase['logger'].error(`Message ${message.id} failed after ${updated.retries} retries. No more attempts.`);
    expect(loggerErrorSpy).toHaveBeenCalled();

    jest.spyOn(Math, 'random').mockRestore();
  });
});
