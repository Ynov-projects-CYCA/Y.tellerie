import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailAndResetTokensToUsers1769074200000
  implements MigrationInterface
{
  name = 'AddEmailAndResetTokensToUsers1769074200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "verify_email_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_password_token" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_password_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "verify_email_token"`,
    );
  }
}
