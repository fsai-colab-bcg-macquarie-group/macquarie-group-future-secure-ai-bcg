import { MigrationInterface, QueryRunner } from 'typeorm'

export class Permissions1741061244918 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const countPermissionTypeExists = await queryRunner.query(`
            SELECT count(*)
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'auth_layer'
            AND t.typname = 'permission';
        `)

        if (parseInt(countPermissionTypeExists[0]?.count) !== 0) {
            return
        }

        await queryRunner.query(`
            CREATE TYPE auth_layer.permission AS ENUM (
                'user.create',
                'user.delete',
                'user.get',
                'user.update',
                'user.log.get', 
                'access.update',
                'access.create',
                'access.delete',
                'access.get',
                'access.permission.create',
                'access.permission.delete',
                'access.permission.get',
                'access.permission.update',
                'team.get',
                'team.create',
                'team.delete',
                'team.update',
                'flow.create',
                'flow.get',
                'flow.update',
                'flow.delete'
            );`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE IF EXISTS auth_layer.permission;`)
    }
}
