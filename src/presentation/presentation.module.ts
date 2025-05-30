import { Module } from '@nestjs/common';
import { ApplicationModule } from 'src/application/application.module';
import { MessageController } from './controllers/message.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    MessageController
  ],
})
export class PresentationModule {}