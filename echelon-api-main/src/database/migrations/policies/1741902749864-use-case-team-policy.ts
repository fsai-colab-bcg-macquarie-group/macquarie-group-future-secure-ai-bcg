import { MigrationInterface, QueryRunner } from 'typeorm'

export class UseCaseTeamInsertPolicy1741902749864
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can insert records based on access" ON "auth_layer"."use_case_team";
        `)
        await queryRunner.query(`
            CREATE policy "Use Case Team can insert records based on access" 
            ON auth_layer.use_case_team
            FOR INSERT TO "authenticated" 
            WITH CHECK (
                auth_layer.authorize('team.create')
            );
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can update records based on access" ON "auth_layer"."use_case_team";
        `)

        await queryRunner.query(`
            CREATE policy "Use Case Team can update records based on access" 
            ON auth_layer.use_case_team
            FOR UPDATE TO "authenticated" 
            USING (
            auth_layer.authorize('team.create') or auth_layer.authorize('team.update')
            );
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can select records based on access" ON "auth_layer"."use_case_team";
        `)
        await queryRunner.query(`
            CREATE policy "Use Case Team can select records based on access" 
            ON auth_layer.use_case_team
            FOR SELECT TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."use_case_team" ENABLE ROW LEVEL SECURITY;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can select records based on access" ON "auth_layer"."use_case_team";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can insert records based on access" ON "auth_layer"."use_case_team";
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Use Case Team can update records based on access" ON "auth_layer"."use_case_team";
        `)
        await queryRunner.query(`
            ALTER TABLE auth_layer.use_case_team DISABLE ROW LEVEL SECURITY;
        `)
    }
}
