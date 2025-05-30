import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessageUseCase } from 'src/application/usecases/create-message.usecase';
import { FindByIdMessageUseCase } from 'src/application/usecases/find-by-id-message.usecase';
import { RetryMessageUseCase } from 'src/application/usecases/retry-message.usecase';
import { FindAllMessageUseCase } from 'src/application/usecases/find-all-message.usecase';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Message } from 'src/domain/entities/message.entity';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly createMessageUsecase: CreateMessageUseCase,
    private readonly findByIdMessageUsecase: FindByIdMessageUseCase,
    private readonly retryMessageUseCase: RetryMessageUseCase,
    private readonly findAllMessageUseCase: FindAllMessageUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The message has been successfully created.',
    type: Message,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(@Body() body: CreateMessageDto) {
    return this.createMessageUsecase.execute(body.content);
  }

  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The message has been successfully retrieved.',
    type: Message,
  })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.findByIdMessageUsecase.execute(id);
  }

  @ApiOperation({ summary: 'Retry processing a message' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The message has been successfully retried.',
    type: Message,
  })
  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    try {
      return await this.retryMessageUseCase.execute(id);
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  @ApiOperation({ summary: 'List all messages' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of messages retrieved successfully.',
    type: [Message],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter messages by status (e.g., "pending", "processed")',
  })
  @Get()
  async list(@Query('status') status?: string) {
    return this.findAllMessageUseCase.execute(status);
  }
}
