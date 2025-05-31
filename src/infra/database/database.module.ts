import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageRepository } from '../repositories/message.repository';
import { Message, MessageHistory } from 'src/domain/entities';
import { IMessageHistoryRepository } from 'src/domain/interfaces/messageHistory.repository.interface';
import { MessageHistoryRepository } from '../repositories/messageHistory.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'message_history.sqlite',
      entities: [MessageHistory],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([MessageHistory])
  ],
  providers: [
    { provide: IMessageRepository, useClass: MessageRepository },
    { provide: IMessageHistoryRepository, useClass: MessageHistoryRepository },
  ],
  exports: [IMessageRepository, IMessageHistoryRepository],
})
export class DatabaseModule {}
