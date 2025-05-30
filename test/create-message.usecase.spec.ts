import { CreateMessageUseCase } from 'src/application/usecases/create-message.usecase';
import { MessageRepository } from 'src/infra/repositories/message.repository';
import { MessageStatus } from 'src/shared/enum';

describe('CreateMessageUseCase', () => {
  let useCase: CreateMessageUseCase;
  let repo: MessageRepository;

  beforeEach(() => {
    repo = new MessageRepository();
    useCase = new CreateMessageUseCase(repo);
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

    // Aguarda timers e microtasks
    await jest.runAllTicks();
    await jest.runAllTimersAsync();
    await Promise.resolve();

    const updated = await repo.findById(message.id);
    expect(['SUCCESS', 'FAILED']).toContain(updated.status);

    jest.useRealTimers();
  });

  it('should process message and update status to FAILED', async () => {
    // Força o Math.random() para cair no else
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const payload = 'Test error flow';
    const message = await useCase.execute(payload);

    await new Promise((res) => setTimeout(res, 1600));
    const updated = await repo.findById(message.id);

    expect(updated.status).toBe('FAILED');
    expect(updated.lastError).toBe('Simulated error');
    expect(updated.retries).toBe(1);

    jest.spyOn(Math, 'random').mockRestore();
  });

  it('should process message and update status to SUCCESS', async () => {
    // Força o Math.random() para cair no if (succeed)
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
    // Garante que o ID passado não existe no repositório
    // Chama _processMessage diretamente
    await (useCase as any)._processMessage('id-inexistente');
    // Não deve lançar, apenas retorna (linha 29 coberta!)
  });
});
