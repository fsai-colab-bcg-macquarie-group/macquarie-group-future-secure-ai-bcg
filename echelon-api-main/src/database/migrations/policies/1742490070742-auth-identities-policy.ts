import { Migration, QueryRunner } from 'typeorm'

export class AuthIdentitiesPolicy1742490070742 extends Migration {
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
       DROP POLICY IF EXISTS "Allow authenticated users to select from identities" ON "auth"."identities";
    `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users to select from identities"
        ON auth.identities
        FOR SELECT TO "authenticated" 
            USING (
            auth_layer.authorize('user.get')
            );
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users to insert into identities" ON "auth"."identities";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users to insert into identities"
        ON auth.identities
        FOR INSERT TO "authenticated" 
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users to update identities" ON "auth"."identities";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users to update identities"
        ON auth.identities
        FOR UPDATE TO "authenticated" 
            USING (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            )
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users to delete from identities" ON "auth"."identities";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users to delete from identities"
        ON auth.identities
        FOR DELETE
        TO authenticated, service_role
        USING (true);
    `)

        await queryRunner.query(`
        ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "service_role can update records" ON "auth"."users";
     `)

        await queryRunner.query(`
         CREATE POLICY "service_role can update records" 
        ON "auth"."users" 
        FOR UPDATE TO "service_role"
        USING(TRUE)
        WITH CHECK(TRUE) 
        `)
    }

    async down(queryRunner: QueryRunner) {
        // sso_providers
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users to delete from identities" ON "auth"."identities";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users to update identities" ON "auth"."identities";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users to insert into identities" ON "auth"."identities";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users to select from identities" ON "auth"."identities";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "service_role can update records" ON "auth"."users";
         `)
    }
}
