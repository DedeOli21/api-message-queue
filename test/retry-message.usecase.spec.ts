import { RetryMessageUseCase } from 'src/application/usecases/retry-message.usecase';
import { Message } from 'src/domain/entities/message.entity';
import { MessageRepository } from 'src/infra/repositories/message.repository';
import { MessageStatus } from 'src/shared/enum';

describe('RetryMessageUseCase', () => {
  let useCase: RetryMessageUseCase;
  let repo: MessageRepository;

  beforeEach(() => {
    repo = new MessageRepository();
    useCase = new RetryMessageUseCase(repo);
  });

  it('should throw if message does not exist', async () => {
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Message not found',
    );
  });

  it('should throw if status is not FAILED', async () => {
    const msg: Message = {
      id: '1',
      content: 'Test',
      status: MessageStatus.SUCCESS,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(msg);

    await expect(useCase.execute('1')).rejects.toThrow(
      'Only failed messages can be retried',
    );
  });

  it('should process FAILED message and set status to SUCCESS', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // Force SUCCESS path
    const msg: Message = {
      id: '2',
      content: 'Test success',
      status: MessageStatus.FAILED,
      retries: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(msg);

    await useCase.execute('2');
    await new Promise((res) => setTimeout(res, 1600));
    const updated = await repo.findById('2');
    expect(updated.status).toBe(MessageStatus.SUCCESS);
    expect(updated.lastError).toBeUndefined();

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should process FAILED message and set status to FAILED (retry)', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // Force FAILED path
    const msg: Message = {
      id: '3',
      content: 'Test failed again',
      status: MessageStatus.FAILED,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(msg);

    await useCase.execute('3');
    await new Promise((res) => setTimeout(res, 1600));
    const updated = await repo.findById('3');
    expect(updated.status).toBe(MessageStatus.FAILED);
    expect(updated.lastError).toBe('Simulated error');
    expect(updated.retries).toBe(1);

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should return early if message does not exist in _processMessage', async () => {
    await (useCase as any)._processMessage('non-existent-id');
  });
});
