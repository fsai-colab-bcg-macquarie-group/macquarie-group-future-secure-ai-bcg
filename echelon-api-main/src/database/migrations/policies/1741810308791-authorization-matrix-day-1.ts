import { MigrationInterface, QueryRunner } from 'typeorm'

export class AuthorizationMatrixDayOne1741810308791
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."user_profile";
            `)

        await queryRunner.query(`
                DROP POLICY IF EXISTS "Users can select records based on access" ON "auth"."users";
            `)

        await queryRunner.query(`
            CREATE policy "Users can select records based on access" 
            ON auth_layer.user_profile
            FOR select TO "authenticated" 
            USING (
            auth_layer.authorize('user.get')
            );
            `)

        await queryRunner.query(`
            CREATE policy "Users can select records based on access" 
            ON auth.users
            FOR SELECT TO "authenticated" 
            USING (
            auth_layer.authorize('user.get')
            );
        `)

        await queryRunner.query(`
            CREATE POLICY "Users can update records based on access" 
            ON "auth_layer"."user_profile" 
            FOR UPDATE TO "authenticated" 
            USING (("access_id" IN ( 
                SELECT "auth_layer"."get_access_permissions"("auth"."uid"()) AS "get_access_permissions"
            )))
            WITH CHECK (("access_id" IN ( 
                SELECT "auth_layer"."get_access_permissions"("auth"."uid"()) AS "get_access_permissions"
            )));
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."user_profile";
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."user_profile" DISABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            ALTER TABLE "auth"."users" DISABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth"."users";
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can update records based on access" ON "auth_layer"."user_profile";
        `)
    }
}
