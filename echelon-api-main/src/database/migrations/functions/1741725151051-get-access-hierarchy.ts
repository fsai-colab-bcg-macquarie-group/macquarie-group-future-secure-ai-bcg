import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetAccessHierarchy1741725151051 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_access_hierarchy(UUID);`,
        )

        await queryRunner.query(`CREATE OR REPLACE FUNCTION auth_layer.get_access_hierarchy(accessId UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE, 
    updated_at TIMESTAMP WITH TIME ZONE  
) AS $$
  SELECT 
    children_access.id AS id,
    children_access.name AS name, 
    children_access.description AS description,
    children_access.created_at AS created_at,
    children_access.updated_at AS updated_at  
  FROM auth_layer.access_hierarchy ah
  INNER JOIN auth_layer.access children_access ON children_access.id = ah.children_access_id
  WHERE ah.access_id = accessId;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_access_hierarchy(UUID);`,
        )
    }
}
