import { MigrationInterface, QueryRunner } from 'typeorm'

export class UnbanUserSso1741144854570 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.unban_user_sso(user_id uuid)
            RETURNS void AS $$
            BEGIN
                UPDATE auth.users
                SET banned_until = NULL, deleted_at = NULL
                WHERE id = user_id;
            END;
            $$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.unban_user_sso(uuid);`,
        )
    }
}
