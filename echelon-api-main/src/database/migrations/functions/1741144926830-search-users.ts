import { MigrationInterface, QueryRunner } from 'typeorm'

export class SearchUsers1741144926830 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.search_users(search_term text)
            RETURNS TABLE(user_id uuid, email text, first_name text, last_name text) AS $$
            BEGIN
                RETURN QUERY
                SELECT u.id, u.email::text, up.first_name::text, up.last_name::text
                FROM auth.users u
                JOIN auth_layer.user_profile up ON u.id = up.user_id
                WHERE 
                    u.email ILIKE '%' || search_term || '%' OR
                    up.first_name ILIKE '%' || search_term || '%' OR
                    up.last_name ILIKE '%' || search_term || '%';
            END;
            $$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.search_users(text);`,
        )
    }
}
