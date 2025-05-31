import { MessageRepository } from 'src/infra/repositories/message.repository';
import { Message } from 'src/domain/entities/message.entity';
import { MessageStatus } from 'src/shared/enum';

describe('MessageRepository (In-Memory)', () => {
  let repo: MessageRepository;
  const sampleMessage: Message = {
    id: '1',
    content: 'Test Content',
    status: MessageStatus.PENDING,
    retries: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repo = new MessageRepository();
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  describe('save', () => {
    it('should save a message and return it', async () => {
      const savedMessage = await repo.save({ ...sampleMessage });
      expect(savedMessage).toEqual(sampleMessage);
      const messages = await repo.findAll();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(sampleMessage);
    });
  });

  describe('findById', () => {
    it('should find a message by its ID', async () => {
      await repo.save({ ...sampleMessage });
      const foundMessage = await repo.findById(sampleMessage.id);
      expect(foundMessage).toEqual(sampleMessage);
    });

    it('should return undefined if message ID does not exist', async () => {
      const foundMessage = await repo.findById('non-existent-id');
      expect(foundMessage).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should find all messages', async () => {
      const message1 = { ...sampleMessage, id: '1' };
      const message2 = { ...sampleMessage, id: '2', status: MessageStatus.SUCCESS };
      await repo.save(message1);
      await repo.save(message2);
      const messages = await repo.findAll();
      expect(messages).toHaveLength(2);
      expect(messages).toContainEqual(message1);
      expect(messages).toContainEqual(message2);
    });

    it('should find all messages filtered by status', async () => {
      const message1 = { ...sampleMessage, id: '1', status: MessageStatus.PENDING };
      const message2 = { ...sampleMessage, id: '2', status: MessageStatus.SUCCESS };
      const message3 = { ...sampleMessage, id: '3', status: MessageStatus.PENDING };
      await repo.save(message1);
      await repo.save(message2);
      await repo.save(message3);
      const pendingMessages = await repo.findAll(MessageStatus.PENDING);
      expect(pendingMessages).toHaveLength(2);
      expect(pendingMessages).toContainEqual(message1);
      expect(pendingMessages).toContainEqual(message3);

      const successMessages = await repo.findAll(MessageStatus.SUCCESS);
      expect(successMessages).toHaveLength(1);
      expect(successMessages).toContainEqual(message2);
    });

    it('should return an empty array if no messages match status filter', async () => {
      await repo.save({ ...sampleMessage, status: MessageStatus.PENDING });
      const messages = await repo.findAll(MessageStatus.FAILED);
      expect(messages).toHaveLength(0);
    });

    it('should return an empty array if no messages exist at all', async () => {
        const messages = await repo.findAll();
        expect(messages).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update an existing message and return it', async () => {
      await repo.save({ ...sampleMessage });
      const updatedContent = 'Updated Content';
      const messageToUpdate = { ...sampleMessage, content: updatedContent, status: MessageStatus.PROCESSING };
      
      const updatedMessage = await repo.update(messageToUpdate);
      expect(updatedMessage.content).toBe(updatedContent);
      expect(updatedMessage.status).toBe(MessageStatus.PROCESSING);

      const foundMessage = await repo.findById(sampleMessage.id);
      expect(foundMessage.content).toBe(updatedContent);
      expect(foundMessage.status).toBe(MessageStatus.PROCESSING);
    });

    it('should return the original message if it does not exist (and not add it)', async () => {
      const nonExistentMessageToUpdate: Message = {
        id: 'non-existent-id',
        content: 'Content for non-existent',
        status: MessageStatus.PENDING,
        retries: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await repo.update(nonExistentMessageToUpdate);
      expect(result).toEqual(nonExistentMessageToUpdate);

      const messages = await repo.findAll();
      expect(messages).toHaveLength(0);

      const found = await repo.findById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });
}); 