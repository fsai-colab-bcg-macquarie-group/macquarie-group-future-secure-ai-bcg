import { MigrationInterface } from 'typeorm'

import { QueryRunner } from 'typeorm'

export class SeedAccessPermissions1741151864778 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const accessPermissionCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.access_permissions;
        `)

        if (
            parseInt(accessPermissionCount[0]?.count) !== 0 ||
            process.env.NODE_ENV === 'production'
        ) {
            return
        }

        await queryRunner.query(`
            WITH platform_admin_access AS (
                SELECT id
            FROM auth_layer.access
            WHERE name = 'Platform Administrator'
            LIMIT 1
        )
        INSERT INTO auth_layer.access_permissions (access_id, permission, created_at, updated_at)
        SELECT 
            (SELECT id FROM platform_admin_access) AS access_id,
            permission::auth_layer.permission,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM (
            VALUES
                ('user.create'),
                ('user.get'),
                ('user.update'),
                ('user.log.get'),
                ('access.create'),
                ('access.get'),
                ('access.update'),
                ('access.permission.get'),
                ('access.permission.update'),
                ('team.create'),
                ('team.get'),
                ('team.update')
        ) AS perms(permission);

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
                ('user.create'),
                ('user.get'),
                ('user.update'),
                ('access.get'),
                ('access.permission.get'),
                ('team.get')
        ) AS perms(permission);

        WITH ai_use_case_designer_access AS (
            SELECT id 
            FROM auth_layer.access
            WHERE name = 'AI Worker Designer'
            LIMIT 1
        )
        INSERT INTO auth_layer.access_permissions (access_id, permission, created_at, updated_at)
        SELECT 
            (SELECT id FROM ai_use_case_designer_access) AS access_id,
            permission::auth_layer.permission,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM (
            VALUES
                ('flow.create'),
                ('flow.get'),
                ('flow.update'),
                ('flow.delete')
        ) AS perms(permission);

        WITH ai_use_case_manager_access AS (
            SELECT id 
            FROM auth_layer.access
            WHERE name = 'AI Worker Manager'
            LIMIT 1
        )
        INSERT INTO auth_layer.access_permissions (access_id, permission, created_at, updated_at)
        SELECT 
            (SELECT id FROM ai_use_case_manager_access) AS access_id,
            permission::auth_layer.permission,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM (
            VALUES
                ('flow.get'),
                ('flow.update')
        ) AS perms(permission);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM auth_layer.access_permissions;`)
    }
}
