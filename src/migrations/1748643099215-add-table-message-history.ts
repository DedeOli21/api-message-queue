import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddTableMessageHistory1748643099215 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'message_history',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: 'messageId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'error',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'retries',
                        type: 'int',
                        default: 0,
                    }
                ],
        }),
        true
        );

        await queryRunner.createIndex('message_history',
            new TableIndex({
                name: 'IDX_MESSAGE_HISTORY_MESSAGE_ID',
                columnNames: ['messageId'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('message_history', 'IDX_MESSAGE_HISTORY_MESSAGE_ID');
        await queryRunner.dropTable('message_history');
    }

}
