import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateDefaultUsers1741186909150 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const userCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth.users;
        `)

        const seedPassword = process.env.SEED_USER_PASSWORD
        if (
            parseInt(userCount[0]?.count) !== 0 ||
            process.env.NODE_ENV === 'production' ||
            !seedPassword
        ) {
            return
        }

        await queryRunner.query(`
            SELECT auth_layer.create_user_no_sso(
                'AI Worker', 
                'Designer', 
                'fsai.developer@futuresecure.ai', 
                (SELECT id FROM auth_layer.access WHERE name = 'AI Worker Designer'), 
                '${seedPassword}');`)

        await queryRunner.query(`
            SELECT auth_layer.create_user_no_sso(
                'Platform', 
                'Administrator', 
                'admin@futuresecure.ai', 
                (SELECT id FROM auth_layer.access WHERE name = 'Platform Administrator'), 
                '${seedPassword}');`)

        await queryRunner.query(`
            SELECT auth_layer.create_user_no_sso(
                'AI Worker', 
                'Manager', 
                'worker.manager@futuresecure.ai', 
                (SELECT id FROM auth_layer.access WHERE name = 'AI Worker Manager'), 
                '${seedPassword}');`)

        await queryRunner.query(`
            SELECT auth_layer.create_user_no_sso(
                'Commercial', 
                'Administrator', 
                'commercial.administrator@futuresecure.ai', 
                (SELECT id FROM auth_layer.access WHERE name = 'Commercial Administrator'), 
                '${seedPassword}');`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth_layer.users;
        `)
    }
}
