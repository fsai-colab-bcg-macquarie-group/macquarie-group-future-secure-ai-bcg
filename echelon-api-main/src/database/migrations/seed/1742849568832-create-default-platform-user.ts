import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultPlatformUser1742849568832
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const userCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth.users;
        `)

        if (
            parseInt(userCount[0]?.count) === 0 &&
            process.env.NODE_ENV === 'production'
        ) {
            await queryRunner.query(`
                SELECT auth_layer.create_user_no_sso(
                    'Platform', 
                    'Administrator', 
                    '${process.env.PLATFORM_ADMIN_EMAIL}', 
                    (SELECT id FROM auth_layer.access WHERE name = 'Platform Administrator'), 
                    '${process.env.PLATFORM_ADMIN_PASSWORD}');`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth_layer.users;
        `)
    }
}
