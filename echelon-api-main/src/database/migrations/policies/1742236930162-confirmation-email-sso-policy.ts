import { Migration, QueryRunner } from 'typeorm'

export class ConfirmationEmailSsoPolicy1742236930162 extends Migration {
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
       DROP POLICY IF EXISTS "Allow authenticated users and service role to select from confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
    `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to select from confirmation_email_sso"
        ON auth_layer.confirmation_email_sso
        FOR SELECT
        TO authenticated, service_role
        USING (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to insert into confirmation_email_sso"
        ON auth_layer.confirmation_email_sso
        FOR INSERT
        TO authenticated, service_role
        WITH CHECK (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to update confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to update confirmation_email_sso"
        ON auth_layer.confirmation_email_sso
        FOR UPDATE
        TO authenticated, service_role
        USING (true)
        WITH CHECK (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to delete from confirmation_email_sso"
        ON auth_layer.confirmation_email_sso
        FOR DELETE
        TO authenticated, service_role
        USING (true);
    `)
        await queryRunner.query(`
        ALTER TABLE auth_layer.confirmation_email_sso ENABLE ROW LEVEL SECURITY;
    `)
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to update confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to select from confirmation_email_sso" ON "auth_layer"."confirmation_email_sso";
         `)
    }
}
