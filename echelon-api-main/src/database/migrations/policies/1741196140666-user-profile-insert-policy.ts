import { MigrationInterface, QueryRunner } from 'typeorm'

export class UserProfileInsertPolicy1741196140666
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                DROP POLICY IF EXISTS "Users can insert records based on access" ON "auth_layer"."user_profile";
            `)

        await queryRunner.query(`
            CREATE POLICY "Users can insert records based on access" 
            ON "auth_layer"."user_profile" 
            FOR INSERT TO "authenticated" 
            WITH CHECK (("access_id" IN ( 
                SELECT "auth_layer"."get_access_permissions"("auth"."uid"()) AS "get_access_permissions"
            )));
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."user_profile" ENABLE ROW LEVEL SECURITY;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can insert records based on access" ON "auth_layer"."user_profile";
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."user_profile" DISABLE ROW LEVEL SECURITY;
        `)
    }
}
