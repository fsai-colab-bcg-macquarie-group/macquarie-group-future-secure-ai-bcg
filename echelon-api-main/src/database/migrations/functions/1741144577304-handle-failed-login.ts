import { MigrationInterface, QueryRunner } from 'typeorm'

export class HandleFailedLogin1741144577304 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.handle_failed_login(userId UUID, maxAttempts INT, lockDuration INTERVAL)
            RETURNS INTEGER AS $$
            DECLARE
                returned_failed_attempts INTEGER;
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM auth_layer.failed_verification_attempts WHERE user_id = userId) THEN
                    INSERT INTO auth_layer.failed_verification_attempts (user_id, failed_attempts, last_attempt, lock_until)
                    VALUES (userId, 1, NOW(), NULL)
                    RETURNING failed_attempts INTO returned_failed_attempts;
                ELSE
                    UPDATE auth_layer.failed_verification_attempts
                    SET 
                        failed_attempts = failed_attempts + 1,
                        last_attempt = NOW()
                    WHERE user_id = userId
                    RETURNING failed_attempts INTO returned_failed_attempts;
                END IF;
                
                -- Checks if the failed attempts exceeded the configured limit
                IF (SELECT failed_attempts FROM auth_layer.failed_verification_attempts WHERE user_id = userId) > maxAttempts THEN
                    UPDATE auth_layer.failed_verification_attempts
                    SET 
                        lock_until = NOW() + lockDuration
                    WHERE user_id = userId;

                    UPDATE auth.users
                    SET
                        banned_until = NOW() + lockDuration
                    WHERE id = userId;
                END IF;

                RETURN returned_failed_attempts;
            END;
            $$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.handle_failed_login(uuid, int, interval);`,
        )
    }
}
