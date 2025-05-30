import { FindAllMessageUseCase } from 'src/application/usecases/find-all-message.usecase';
import { Message } from 'src/domain/entities/message.entity';
import { MessageRepository } from 'src/infra/repositories/message.repository';
import { MessageStatus } from 'src/shared/enum';

describe('FindAllMessageUseCase', () => {
  let useCase: FindAllMessageUseCase;
  let repo: MessageRepository;

  beforeEach(() => {
    repo = new MessageRepository();
    useCase = new FindAllMessageUseCase(repo);
  });

  it('deve retornar todas as mensagens', async () => {
    const msg1: Message = {
      id: '1',
      content: 'Msg 1',
      status: MessageStatus.SUCCESS,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const msg2: Message = {
      id: '2',
      content: 'Msg 2',
      status: MessageStatus.FAILED,
      retries: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(msg1);
    await repo.save(msg2);

    const result = await useCase.execute();
    expect(result.length).toBe(2);
  });

  it('deve filtrar por status', async () => {
    const msg1: Message = {
      id: '1',
      content: 'Msg 1',
      status: MessageStatus.SUCCESS,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const msg2: Message = {
      id: '2',
      content: 'Msg 2',
      status: MessageStatus.FAILED,
      retries: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(msg1);
    await repo.save(msg2);

    const result = await useCase.execute(MessageStatus.FAILED);
    expect(result.length).toBe(1);
    expect(result[0].status).toBe(MessageStatus.FAILED);
  });
});
