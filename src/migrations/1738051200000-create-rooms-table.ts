import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRoomsTable1738051200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'roomNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'capacity',
            type: 'int',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'EUR'",
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_TYPE',
        columnNames: ['type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('rooms', 'IDX_ROOMS_TYPE');
    await queryRunner.dropIndex('rooms', 'IDX_ROOMS_STATUS');
    await queryRunner.dropTable('rooms');
  }
}
