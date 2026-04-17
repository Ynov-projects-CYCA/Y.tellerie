import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToUsers1769077800000 implements MigrationInterface {
  name = 'AddIsActiveToUsers1769077800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
  }
}
