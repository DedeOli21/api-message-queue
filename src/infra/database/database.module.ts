import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IMessageRepository } from 'src/domain/interfaces/message.repository.interface';
import { MessageRepository } from '../repositories/message.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    { provide: IMessageRepository, useClass: MessageRepository },
  ],
  exports: [
    IMessageRepository
  ],
})
export class DatabaseModule {}