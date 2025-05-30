import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmptyObject()
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, this is a test message.',
    type: String,
    required: true,
  })
  content: string;
}
