import { Migration, QueryRunner } from 'typeorm'

export class AccessSelectPolicy1741977084833 extends Migration {
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
       DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."access";
    `)

        await queryRunner.query(`
        CREATE POLICY "Users can select records based on access" 
        ON "auth_layer"."access" 
        FOR SELECT TO authenticated 
        USING (
             (id IN ( SELECT auth_layer.get_access_permissions(auth.uid()) AS get_access_permissions))
        );
    `)
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.query(
            `DROP POLICY "Users can select records based on access" ON "auth_layer"."access";`,
        )
    }
}
