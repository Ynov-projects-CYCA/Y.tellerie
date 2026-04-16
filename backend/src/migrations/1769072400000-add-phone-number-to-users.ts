import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToUsers1769072400000 implements MigrationInterface {
  name = 'AddPhoneNumberToUsers1769072400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone_number" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
  }
}
