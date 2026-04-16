import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBookingsTable1768924800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'roomId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'guestFirstName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'guestLastName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'guestEmail',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'checkInDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'checkOutDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'nights',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: `'EUR'`,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'specialRequests',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedTableName: 'rooms',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_ROOM_ID',
        columnNames: ['roomId'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_STAY_DATES',
        columnNames: ['checkInDate', 'checkOutDate'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bookings');
    const roomForeignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('roomId'),
    );

    if (roomForeignKey) {
      await queryRunner.dropForeignKey('bookings', roomForeignKey);
    }

    await queryRunner.dropIndex('bookings', 'IDX_BOOKINGS_STAY_DATES');
    await queryRunner.dropIndex('bookings', 'IDX_BOOKINGS_ROOM_ID');
    await queryRunner.dropTable('bookings');
  }
}
