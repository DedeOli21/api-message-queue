import { MessageStatus } from 'src/shared/enum';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('message_history')
export class MessageHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  messageId: string;

  @Column()
  status: MessageStatus;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'int', default: 0 })
  retries: number;
}
