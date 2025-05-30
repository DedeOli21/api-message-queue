import { MessageStatus } from 'src/shared/enum';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MessageHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column()
  status: MessageStatus;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'int', default: 0 })
  retries: number;
}
