import { MigrationInterface, QueryRunner } from 'typeorm'

export class PermissionDescription1741152013600 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissionDescriptionCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.permission_description;
        `)

        if (
            parseInt(permissionDescriptionCount[0]?.count) !== 0 ||
            process.env.NODE_ENV === 'production'
        ) {
            return
        }

        await queryRunner.query(`
            INSERT INTO auth_layer.permission_description (permission, description, permission_group, created_at, updated_at)
            VALUES
                ('user.create', 'Can create user', 'User', NOW(), NOW()),
                ('user.delete', 'Can remove user', 'User', NOW(), NOW()),
                ('user.get', 'Can get user', 'User', NOW(), NOW()),
                ('user.update', 'Can edit user', 'User', NOW(), NOW()),
                ('user.log.get', 'Can view user logs', 'User', NOW(), NOW()),
                ('access.update', 'Can edit access', 'access', NOW(), NOW()),
                ('access.create', 'Can create access', 'access', NOW(), NOW()),
                ('access.delete', 'Can remove access', 'access', NOW(), NOW()),
                ('access.get', 'Can get access', 'access', NOW(), NOW()),
                ('access.permission.create', 'Can create access permission', 'access', NOW(), NOW()),
                ('access.permission.delete', 'Can remove access permission', 'access', NOW(), NOW()),
                ('access.permission.get', 'Can get access permission', 'access', NOW(), NOW()),
                ('access.permission.update', 'Can edit access permission', 'access', NOW(), NOW()),
                ('team.get', 'Can get team', 'team', NOW(), NOW()),
                ('team.create', 'Can create team', 'team', NOW(), NOW()),
                ('team.delete', 'Can remove team', 'team', NOW(), NOW()),
                ('team.update', 'Can edit team', 'team', NOW(), NOW()),
                ('flow.create', 'Can create flow', 'flow', NOW(), NOW()),
                ('flow.get', 'Can get flow', 'flow', NOW(), NOW()),
                ('flow.update', 'Can edit flow', 'flow', NOW(), NOW()),
                ('flow.delete', 'Can remove flow', 'flow', NOW(), NOW());`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM auth_layer.permission_description;`,
        )
    }
}
