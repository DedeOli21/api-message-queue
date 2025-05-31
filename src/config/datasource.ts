import { DataSource } from 'typeorm';
import { MessageHistory } from '../domain/entities/messageHistory.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'message_history.sqlite',
  entities: [MessageHistory],
  synchronize: true,
});
