import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class AddPaymentIntentIdToPayments1771340000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "payments",
            new TableColumn({
                name: "paymentIntentId",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.createIndex(
            "payments",
            new TableIndex({
                name: "IDX_PAYMENTS_PAYMENT_INTENT_ID",
                columnNames: ["paymentIntentId"],
                isUnique: true,
                where: '"paymentIntentId" IS NOT NULL',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("payments", "IDX_PAYMENTS_PAYMENT_INTENT_ID");
        await queryRunner.dropColumn("payments", "paymentIntentId");
    }
}
