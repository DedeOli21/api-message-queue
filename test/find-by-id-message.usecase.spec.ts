import { FindByIdMessageUseCase } from "src/application/usecases/find-by-id-message.usecase";
import { Message } from "src/domain/entities/message.entity";
import { MessageRepository } from "src/infra/repositories/message.repository";
import { MessageStatus } from "src/shared/enum";

describe('FindByIdMessageUseCase', () => {
  let useCase: FindByIdMessageUseCase;
  let repo: MessageRepository;

  beforeEach(() => {
    repo = new MessageRepository();
    useCase = new FindByIdMessageUseCase(repo);
  });

  it('should find a message by id', async () => {
    const message: Message = {
      id: '123',
      content: 'abc',
      status: MessageStatus.SUCCESS,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repo.save(message);

    const result = await useCase.execute('123');
    expect(result).toEqual(message);
  });

  it('should throw if message not found', async () => {
    await expect(useCase.execute('not-exist')).rejects.toThrow('Message not found');
  });
});
