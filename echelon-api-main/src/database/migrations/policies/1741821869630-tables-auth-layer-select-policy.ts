import { MigrationInterface, QueryRunner } from 'typeorm'

export class TablesAuthLayerSelectPolicy1741821869630
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                 DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."access";
           `)

        await queryRunner.query(`
            CREATE POLICY "Users can select records based on access" 
            ON auth_layer.access 
            FOR SELECT 
            TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access_hierarchy" ON "auth_layer"."access_hierarchy";
      `)

        await queryRunner.query(`
            CREATE POLICY "Users can select records based on access_hierarchy" 
            ON auth_layer.access_hierarchy 
            FOR SELECT 
            TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access_hierarchy" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access_permissions" ON "auth_layer"."access_permissions";
      `)

        await queryRunner.query(`
            CREATE POLICY "Users can select records based on access_permissions" 
            ON auth_layer.access_permissions 
            FOR SELECT 
            TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access_permissions" ENABLE ROW LEVEL SECURITY;
        `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on permission_description" ON "auth_layer"."permission_description";
      `)

        await queryRunner.query(`
            CREATE POLICY "Users can select records based on permission_description" 
            ON auth_layer.permission_description 
            FOR SELECT 
            TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."permission_description" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on world_states_cities" ON "auth_layer"."world_states_cities";
      `)

        await queryRunner.query(`
            CREATE POLICY "Users can select records based on world_states_cities" 
            ON auth_layer.world_states_cities 
            FOR SELECT 
            TO "authenticated" 
            USING (
                true
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."world_states_cities" ENABLE ROW LEVEL SECURITY;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."access";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."access_hierarchy";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."access_permissions";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."confirmation_email_sso";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."failed_verification_attempts";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."permission_description";
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth_layer"."world_states_cities";
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access" DISABLE ROW LEVEL SECURITY;
        `)
    }
}
