import { ApiProperty } from "@nestjs/swagger";
import { MessageStatus } from "src/shared/enum";

export class Message {
  @ApiProperty({
  description: 'Unique identifier for the message',
  example: '123e4567-e89b-12d3-a456-426614174000',
  type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, this is a test message.',
    type: String,
  })
  content: string;

  @ApiProperty({
    description: 'The status of the message',
    example: 'PENDING',
    enum: MessageStatus,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'Number of retries attempted for the message',
    example: 0,
    type: Number,
  })
  retries: number;

  @ApiProperty({
    description: 'The last error encountered while processing the message',
    example: 'Failed to connect to the service',
    type: String,
    required: false,
  })
  lastError?: string;

  @ApiProperty({
    description: 'Timestamp when the message was created',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the message was last updated',
    type: Date,
  })
  updatedAt: Date;
}