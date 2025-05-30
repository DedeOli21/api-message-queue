import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from './create-message.usecase';
import { FindByIdMessageUseCase } from './find-by-id-message.usecase';
import { RetryMessageUseCase } from './retry-message.usecase';
import { FindAllMessageUseCase } from './find-all-message.usecase';
import { MessageController } from 'src/presentation/controllers/message.controller';
import { DatabaseModule } from 'src/infra/database/database.module';

const usecases = [
    CreateMessageUseCase,
    FindByIdMessageUseCase,
    RetryMessageUseCase,
    FindAllMessageUseCase
];

@Module({
  imports: [DatabaseModule],
  providers: usecases,
  exports: usecases,
  controllers: [MessageController],
})
export class MessagesModule {}