import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetAccessPermissionsUpdate1741813550766
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create or replace function auth_layer.get_access_permissions(
                requested_user_id uuid
            )
            returns TABLE (access_id UUID) as $$
                SELECT id as access_id from auth_layer.get_access_hierarchy((
                    SELECT up.access_id 
                    FROM auth_layer.user_profile up 
                    WHERE up.user_id = requested_user_id LIMIT 1));
            $$ language sql stable security definer set search_path = '';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DROP FUNCTION IF EXISTS auth_layer.get_access_permissions(uuid);
            `,
        )
    }
}
