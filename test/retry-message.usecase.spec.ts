import { RetryMessageUseCase } from 'src/application/usecases/retry-message.usecase';
import { Message } from 'src/domain/entities/message.entity';
import { MessageStatus } from 'src/shared/enum';
import { MessageProcessorService } from 'src/application/services/message-processor.service';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('RetryMessageUseCase', () => {
  let useCase: RetryMessageUseCase;
  let mockMessageProcessorService: jest.Mocked<MessageProcessorService>;

  beforeEach(() => {
    mockMessageProcessorService = {
      process: jest.fn(),
      retryFailedMessage: jest.fn(),
    } as any;
    useCase = new RetryMessageUseCase(mockMessageProcessorService);
    jest.spyOn(useCase['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(useCase['logger'], 'error').mockImplementation(() => {});
  });

  it('should call messageProcessorService.retryFailedMessage and return its result on success', async () => {
    const mockMessage: Message = {
      id: '1',
      content: 'Test',
      status: MessageStatus.SUCCESS,
      retries: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockMessageProcessorService.retryFailedMessage.mockResolvedValue(mockMessage);

    const result = await useCase.execute('1');

    expect(mockMessageProcessorService.retryFailedMessage).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockMessage);
  });

  it('should throw NotFoundException if service throws "Message not found for retry"', async () => {
    mockMessageProcessorService.retryFailedMessage.mockRejectedValue(new Error('Message not found for retry'));

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      new NotFoundException('Message not found for retry'),
    );
    expect(mockMessageProcessorService.retryFailedMessage).toHaveBeenCalledWith('non-existent-id');
  });

  it('should throw HttpException with BAD_REQUEST if service throws other errors', async () => {
    mockMessageProcessorService.retryFailedMessage.mockRejectedValue(new Error('Only FAILED messages can be retried.'));

    await expect(useCase.execute('1')).rejects.toThrow(
      new HttpException('Only FAILED messages can be retried.', HttpStatus.BAD_REQUEST),
    );
    expect(mockMessageProcessorService.retryFailedMessage).toHaveBeenCalledWith('1');

    mockMessageProcessorService.retryFailedMessage.mockRejectedValue(new Error('Max retries reached for message.'));
    await expect(useCase.execute('2')).rejects.toThrow(
      new HttpException('Max retries reached for message.', HttpStatus.BAD_REQUEST),
    );
    expect(mockMessageProcessorService.retryFailedMessage).toHaveBeenCalledWith('2');
  });

});
