import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetAccessHierarchy1741143922329 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.get_access_hierarchy(accessId UUID)
                RETURNS TABLE (
                    access_name TEXT,
                    access_id UUID
                ) AS $$
                SELECT 
                    children_access.name AS access_name, 
                    children_access.id AS access_id 
                    FROM auth_layer.access_hierarchy ah
                    INNER JOIN auth_layer.access children_access ON children_access.id = ah.children_access_id
                    WHERE ah.access_id = accessId;
            $$ language sql stable security definer set search_path = '';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_access_hierarchy(uuid);`,
        )
    }
}
