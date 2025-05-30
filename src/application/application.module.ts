import { Module } from '@nestjs/common';
import { MessagesModule } from './usecases/messages.module';

const modules = [MessagesModule];

@Module({
  imports: modules,
  exports: modules,
})
export class ApplicationModule {}
