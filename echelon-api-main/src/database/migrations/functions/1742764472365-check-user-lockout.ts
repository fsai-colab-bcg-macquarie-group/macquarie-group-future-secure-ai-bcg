import { MigrationInterface, QueryRunner } from 'typeorm'

export class CheckUserLockout1742764472365 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.check_user_lockout(UUID);`,
        )
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.check_user_lockout(userId UUID)
                RETURNS INTEGER AS $$
                DECLARE
                    remainingTime INTEGER;
                BEGIN
                    SELECT EXTRACT(EPOCH FROM (lock_until - NOW()))
                    INTO remainingTime
                    FROM auth_layer.failed_verification_attempts
                    WHERE user_id = userId AND lock_until > NOW();

                    RETURN remainingTime;
            END;
            $$ LANGUAGE plpgsql;`)

        await queryRunner.query(`
                ALTER TABLE auth_layer.failed_verification_attempts
                DROP CONSTRAINT failed_verification_attempts_user_id_fkey, 
                ADD CONSTRAINT failed_verification_attempts_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
                `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.check_user_lockout(UUID);`,
        )
    }
}
