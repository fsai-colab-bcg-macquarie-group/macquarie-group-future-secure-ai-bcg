import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetUserIdByEmail1741144186840 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.get_user_id_by_email(email TEXT)
                RETURNS TABLE (id uuid)
                SECURITY definer
            AS $$
            BEGIN 
                RETURN QUERY SELECT 
                    au.id 
                    FROM auth.users au 
                    WHERE 
                        LOWER(au.email) = LOWER($1) 
                        AND au.is_sso_user = false; 
            END;
            $$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_user_id_by_email(text);`,
        )
    }
}
