import { MigrationInterface, QueryRunner } from 'typeorm'

export class AccessPermissionView1741144752476 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const countViewExists = await queryRunner.query(`
            SELECT count(*) 
            FROM information_schema.views 
            WHERE table_schema = 'auth_layer' 
            AND table_name = 'access_permission_view';
            `)

        if (parseInt(countViewExists[0].count) !== 0) {
            return
        }

        await queryRunner.query(`
                CREATE VIEW auth_layer.access_permission_view AS
                SELECT 
                a.id as access_id,
                a.name as access_name,
                    ap.permission AS access_permission_name,
                    pd.description AS permission_description_name
                FROM 
                    auth_layer.access AS a
                JOIN 
                    auth_layer.access_permissions AS ap ON ap.access_id = a.id
                JOIN 
                    auth_layer.permission_description AS pd ON pd.permission = ap.permission;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP VIEW IF EXISTS auth_layer.access_permission_view;`,
        )
    }
}
