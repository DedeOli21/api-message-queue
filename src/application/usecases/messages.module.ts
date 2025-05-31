import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from './create-message.usecase';
import { FindByIdMessageUseCase } from './find-by-id-message.usecase';
import { RetryMessageUseCase } from './retry-message.usecase';
import { FindAllMessageUseCase } from './find-all-message.usecase';
import { DatabaseModule } from 'src/infra/database/database.module';
import { MessageProcessorService } from '../services/message-processor.service';

const usecases = [
  CreateMessageUseCase,
  FindByIdMessageUseCase,
  RetryMessageUseCase,
  FindAllMessageUseCase,
];

@Module({
  imports: [DatabaseModule],
  providers: [
    ...usecases,
    MessageProcessorService,
  ],
  exports: [
    ...usecases,
    MessageProcessorService,
  ],
})
export class MessagesModule {}
