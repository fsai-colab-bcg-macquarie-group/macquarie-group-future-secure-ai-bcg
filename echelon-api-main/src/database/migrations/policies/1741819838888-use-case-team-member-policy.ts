import { MigrationInterface, QueryRunner } from 'typeorm'

export class UseCaseTeamMemberInsertPolicy1741819838888
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP POLICY IF EXISTS "Use Case Team Member can insert records based on access" ON "auth_layer"."use_case_team_member";
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can update records based on access" ON "auth_layer"."use_case_team_member";
            `)
        await queryRunner.query(`
                DROP POLICY IF EXISTS "Use Case Team Member can select records based on access" ON "auth_layer"."use_case_team_member";
                `)

        await queryRunner.query(`
            CREATE policy "Use Case Team Member can insert records based on access" 
            ON auth_layer.use_case_team_member
            FOR INSERT TO "authenticated" 
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
        `)

        await queryRunner.query(`
            CREATE policy "Use Case Team Member can update records based on access" 
            ON auth_layer.use_case_team_member
            FOR UPDATE TO "authenticated" 
            USING (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            )
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can delete records based on access" ON "auth_layer"."use_case_team_member";
            `)

        await queryRunner.query(`
            CREATE policy "Use Case Team Member can delete records based on access" 
            ON auth_layer.use_case_team_member
            FOR DELETE TO "authenticated" 
            USING (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
        `)

        await queryRunner.query(`
            CREATE policy "Use Case Team Member can select records based on access" 
            ON auth_layer.use_case_team_member
            FOR SELECT TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."use_case_team_member" ENABLE ROW LEVEL SECURITY;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can insert records based on access" ON "auth_layer"."use_case_team_member";
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can select records based on access" ON "auth_layer"."use_case_team_member";
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can update records based on access" ON "auth_layer"."use_case_team_member";
        `)
        await queryRunner.query(`
            ALTER TABLE auth_layer.use_case_team_member DISABLE ROW LEVEL SECURITY;
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team Member can delete records based on access" ON "auth_layer"."use_case_team_member";
            `)
    }
}
