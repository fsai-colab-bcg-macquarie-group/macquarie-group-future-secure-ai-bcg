import { MigrationInterface } from 'typeorm'

import { QueryRunner } from 'typeorm'

export class SeedAccessPermissionsUpdatedayOne1741899733632
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth_layer.access_permissions 
            WHERE permission = 'team.create' AND access_id IN (
            SELECT id from auth_layer.access WHERE name = 'Platform Administrator'
            );`)

        await queryRunner.query(`
               WITH commercial_admin_access AS (
            SELECT id 
            FROM auth_layer.access
            WHERE name = 'Commercial Administrator'
            LIMIT 1
        )
        INSERT INTO auth_layer.access_permissions (access_id, permission, created_at, updated_at)
        SELECT 
            (SELECT id FROM commercial_admin_access) AS access_id,
            permission::auth_layer.permission,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM (
            VALUES
               ('team.create'),
                ('team.update')
        ) AS perms(permission);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM auth_layer.access_permissions;`)
    }
}
