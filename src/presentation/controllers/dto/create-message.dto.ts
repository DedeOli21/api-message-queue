import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, this is a test message.',
    type: String,
    required: true,
  })
  content: string;
}
